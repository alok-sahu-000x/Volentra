import { useState, useEffect } from 'react';
import { api } from '../api';
import { useApp } from '../context.jsx';

export default function VolunteerDashboard() {
    const { user, showToast } = useApp();
    const [vols, setVols] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [reports, setReports] = useState([]);
    const [availability, setAvailability] = useState('available');

    const fetchData = async () => {
        const [v, t, r] = await Promise.all([api.getVolunteers(), api.getTasks(), api.getReports()]);
        setVols(v); setTasks(t); setReports(r);
    };
    useEffect(() => { fetchData(); }, []);

    const profile = vols.find(v => v.userId === user.id);
    if (!profile) return (
        <div className="grid-4" style={{marginBottom: '1.5rem'}}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height: '120px', borderRadius: 'var(--radius-xl)'}}></div>)}</div>
    );

    const myTasks = tasks.filter(t => t.assignedVolunteerId === profile.id && t.status !== 'Completed');
    const completedTasks = tasks.filter(t => t.assignedVolunteerId === profile.id && t.status === 'Completed');
    const leaderboard = [...vols].sort((a, b) => b.totalHoursServed - a.totalHoursServed).slice(0, 5);
    const statusColors = { available: 'var(--color-secondary)', busy: 'var(--color-warning)', offline: 'var(--color-text-muted)' };

    // Nearby opportunities — tasks NOT assigned to us, from pending reports
    const nearbyOpportunities = reports.filter(r => r.status === 'Pending').sort((a,b) => {
        const distA = Math.sqrt(Math.pow(a.latitude - profile.latitude, 2) + Math.pow(a.longitude - profile.longitude, 2));
        const distB = Math.sqrt(Math.pow(b.latitude - profile.latitude, 2) + Math.pow(b.longitude - profile.longitude, 2));
        return distA - distB;
    }).slice(0, 4);

    const markComplete = async (tid) => {
        await api.updateTaskStatus(tid, 'Completed');
        showToast('Task completed! Great job. 🎉', 'success');
        fetchData();
    };
    const acceptTask = async (reportId) => {
        await api.assignTask(reportId, profile.id);
        showToast('Task accepted! Added to your queue.', 'success');
        fetchData();
    };

    const getDist = (lat, lng) => {
        const d = Math.sqrt(Math.pow(lat - profile.latitude, 2) + Math.pow(lng - profile.longitude, 2)) * 111;
        return d.toFixed(1);
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{marginBottom: '1.5rem'}}>
                <div>
                    <h1 style={{fontSize: '1.75rem', marginBottom: '0.25rem'}}>Welcome back, {user.name}!</h1>
                    <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem'}}>Here's your volunteer overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <span style={{fontSize: '0.8rem', fontWeight: 600}}>Status:</span>
                    <div className="flex gap-1">
                        {['available', 'busy', 'offline'].map(s => (
                            <button key={s} onClick={() => { setAvailability(s); showToast(`Status: ${s}`); }} className="btn btn-sm" style={{background: availability === s ? statusColors[s] : 'var(--color-bg)', color: availability === s ? 'white' : 'var(--color-text-muted)', textTransform: 'capitalize', borderRadius: 'var(--radius-full)'}}>{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{marginBottom: '1.5rem'}}>
                <div className="card interactive fade-in" style={{background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white'}}>
                    <h3 style={{fontWeight: 500, fontSize: '0.8rem', opacity: 0.85}}>Hours Served</h3>
                    <div style={{fontSize: '2.5rem', fontWeight: 800}}>{profile.totalHoursServed}</div>
                </div>
                <div className="card interactive fade-in" style={{animationDelay: '0.1s'}}>
                    <h3 style={{fontWeight: 500, fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>Nearby Opportunities</h3>
                    <div style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-info)'}}>{nearbyOpportunities.length}</div>
                </div>
                <div className="card interactive fade-in" style={{animationDelay: '0.2s'}}>
                    <h3 style={{fontWeight: 500, fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>Active Tasks</h3>
                    <div style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-secondary)'}}>{myTasks.length}</div>
                </div>
                <div className="card interactive fade-in" style={{animationDelay: '0.3s'}}>
                    <h3 style={{fontWeight: 500, fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>Rating</h3>
                    <div style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-warning)'}}>{profile.rating} <i className="fas fa-star" style={{fontSize: '1.25rem'}}></i></div>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'flex-start'}}>
                <div className="flex-col gap-6">
                    {/* Active Tasks */}
                    <div className="card fade-in">
                        <h2 style={{fontSize: '1.125rem', marginBottom: '1.25rem'}}><i className="fas fa-tasks" style={{marginRight: '0.5rem', color: 'var(--color-primary)'}}></i>My Active Tasks</h2>
                        {myTasks.length === 0 ? (
                            <div className="text-center" style={{padding: '3rem', color: 'var(--color-text-muted)'}}>
                                <i className="fas fa-check-circle" style={{fontSize: '3rem', marginBottom: '1rem', opacity: 0.3}}></i>
                                <p>No active tasks. Browse nearby opportunities below!</p>
                            </div>
                        ) : (
                            <div className="flex-col gap-3">
                                {myTasks.map(t => {
                                    const report = reports.find(r => r.id === t.reportId);
                                    return (
                                        <div key={t.id} style={{border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}} className="hover-lift">
                                            <div>
                                                <div className="flex items-center gap-2" style={{marginBottom: '0.25rem'}}>
                                                    <span style={{fontWeight: 700}}>{report?.issueType || 'Task'}</span>
                                                    <span className="badge badge-warning">{t.status}</span>
                                                </div>
                                                <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>
                                                    <i className="fas fa-map-marker-alt" style={{marginRight: '0.25rem'}}></i> {report ? getDist(report.latitude, report.longitude) : '?'} km away
                                                </div>
                                            </div>
                                            <button className="btn btn-success btn-sm" onClick={() => markComplete(t.id)}><i className="fas fa-check"></i> Complete</button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Nearby Opportunities */}
                    <div className="card fade-in" style={{animationDelay: '0.2s'}}>
                        <h2 style={{fontSize: '1.125rem', marginBottom: '1.25rem'}}><i className="fas fa-compass" style={{marginRight: '0.5rem', color: 'var(--color-info)'}}></i>Nearby Opportunities</h2>
                        <div className="flex-col gap-3">
                            {nearbyOpportunities.map(r => (
                                <div key={r.id} style={{border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem'}} className="hover-lift">
                                    <div className="flex justify-between items-start" style={{marginBottom: '0.5rem'}}>
                                        <div>
                                            <div className="flex items-center gap-2" style={{marginBottom: '0.25rem'}}>
                                                <span style={{fontWeight: 700}}>{r.issueType}</span>
                                                <span className={`badge badge-${r.priorityScore >= 70 ? 'danger' : r.priorityScore >= 50 ? 'warning' : 'info'}`}>{r.priorityScore >= 70 ? 'Urgent' : r.priorityScore >= 50 ? 'High' : 'Medium'}</span>
                                            </div>
                                            <p style={{fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>{r.description.slice(0, 80)}...</p>
                                            <div className="flex gap-3" style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>
                                                <span><i className="fas fa-map-marker-alt"></i> {getDist(r.latitude, r.longitude)} km</span>
                                                <span><i className="fas fa-users"></i> {r.peopleAffected} affected</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2" style={{marginTop: '0.75rem'}}>
                                        <button className="btn btn-primary btn-sm" onClick={() => acceptTask(r.id)}><i className="fas fa-check"></i> Accept</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => showToast('Task declined')}><i className="fas fa-times"></i> Decline</button>
                                    </div>
                                </div>
                            ))}
                            {nearbyOpportunities.length === 0 && <p style={{color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem'}}>No nearby opportunities right now. Check back later!</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex-col gap-4">
                    {/* Leaderboard */}
                    <div className="card fade-in" style={{animationDelay: '0.3s'}}>
                        <h3 style={{fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700}}>
                            <i className="fas fa-trophy" style={{color: 'var(--color-warning)', marginRight: '0.5rem'}}></i> Top Volunteers
                        </h3>
                        {leaderboard.map((v, i) => (
                            <div key={v.id} className="flex items-center gap-3" style={{padding: '0.625rem 0', borderBottom: i < leaderboard.length - 1 ? '1px solid var(--color-border-light)' : 'none'}}>
                                <span style={{fontWeight: 800, fontSize: '0.8rem', color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--color-text-muted)', width: '20px'}}>#{i+1}</span>
                                <div className="avatar avatar-sm" style={{background: i === 0 ? 'var(--color-warning-light)' : 'var(--color-primary-light)', color: i === 0 ? '#b45309' : 'var(--color-primary)'}}>{v.name.split(' ').map(n=>n[0]).join('')}</div>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: 600, fontSize: '0.8rem'}}>{v.name} {v.id === profile.id && <span style={{fontSize: '0.6rem', color: 'var(--color-primary)'}}>(You)</span>}</div>
                                    <div style={{fontSize: '0.7rem', color: 'var(--color-text-muted)'}}>{v.totalHoursServed} hrs</div>
                                </div>
                                <span style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-warning)'}}>{v.rating}★</span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar */}
                    <div className="card fade-in" style={{animationDelay: '0.4s'}}>
                        <h3 style={{fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700}}>
                            <i className="fas fa-calendar-alt" style={{color: 'var(--color-info)', marginRight: '0.5rem'}}></i> Upcoming Assignments
                        </h3>
                        {myTasks.length > 0 ? myTasks.slice(0, 3).map((t, i) => {
                            const rep = reports.find(r => r.id === t.reportId);
                            return (
                                <div key={i} className="flex items-center gap-3" style={{padding: '0.5rem 0', borderBottom: '1px solid var(--color-border-light)'}}>
                                    <div style={{width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700}}>
                                        <span style={{fontSize: '1rem'}}>{new Date(t.assignedAt).getDate()}</span>
                                        <span>{new Date(t.assignedAt).toLocaleString('default', {month: 'short'})}</span>
                                    </div>
                                    <div>
                                        <div style={{fontSize: '0.8rem', fontWeight: 600}}>{rep?.issueType || `Task #${t.reportId}`}</div>
                                        <div style={{fontSize: '0.7rem', color: 'var(--color-text-muted)'}}>{rep ? `${getDist(rep.latitude, rep.longitude)} km away` : 'In progress'}</div>
                                    </div>
                                </div>
                            );
                        }) : <p style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>No upcoming assignments</p>}
                    </div>

                    {/* Quick Stats */}
                    <div className="card fade-in" style={{animationDelay: '0.5s', background: 'linear-gradient(135deg, var(--color-secondary-light), var(--color-primary-light))'}}>
                        <h3 style={{fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 700}}>Impact Summary</h3>
                        <div style={{fontSize: '0.8rem'}}>
                            <div className="flex justify-between" style={{marginBottom: '0.5rem'}}><span>Tasks Completed</span><span style={{fontWeight: 700}}>{completedTasks.length}</span></div>
                            <div className="flex justify-between" style={{marginBottom: '0.5rem'}}><span>People Helped</span><span style={{fontWeight: 700}}>~{completedTasks.length * 25}</span></div>
                            <div className="flex justify-between"><span>Reliability Score</span><span style={{fontWeight: 700, color: 'var(--color-secondary)'}}>96%</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
