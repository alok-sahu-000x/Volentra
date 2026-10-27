import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useApp } from '../context.jsx';
import { StatWidget, PriorityBadge } from '../components/Components.jsx';
import { Tooltip } from '../components/Tooltip.jsx';
import MapView from '../components/MapView.jsx';
import { useSocket } from '../hooks/useSocket.js';
import Chart from 'chart.js/auto';

export default function AdminDashboard() {
    const { showToast } = useApp();
    const { on } = useSocket();
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [vols, setVols] = useState([]);
    const [assignModal, setAssignModal] = useState(null);
    const chartRefs = useRef({});

    const fetchData = async () => {
        const [s, r, t, v] = await Promise.all([api.getStats(), api.getReports(), api.getTasks(), api.getVolunteers()]);
        setStats(s); setReports(r); setTasks(t); setVols(v);
    };

    useEffect(() => { fetchData(); }, []);

    // ── Socket.io real-time listeners (Fix 6) ────────────────────────────────
    useEffect(() => {
        const offNewReport = on('report:new', (report) => {
            showToast(`🔴 New ${report.issueType} report! Priority: ${report.priorityScore}`, 'warning');
            fetchData(); // refresh all data
        });
        const offTaskAssigned = on('task:assigned', (task) => {
            showToast(`✅ Task assigned to ${task.volunteerName}`, 'success');
            fetchData();
        });
        const offTaskUpdated = on('task:updated', ({ status }) => {
            if (status === 'Completed') showToast('🏁 A task was marked as Completed!', 'success');
            fetchData();
        });
        return () => { offNewReport(); offTaskAssigned(); offTaskUpdated(); };
    }, [on]);

    // ── Charts ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!stats) return;
        const make = (id, config) => {
            if (chartRefs.current[id]) { chartRefs.current[id].destroy(); }
            const el = document.getElementById(id);
            if (el) chartRefs.current[id] = new Chart(el, config);
        };

        make('weeklyChart', {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Completed', data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.08)',
                    fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#4f46e5',
                }],
            },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } } },
        });

        make('needChart', {
            type: 'bar',
            data: {
                labels: ['Medical', 'Food', 'Infra', 'Water', 'Shelter'],
                datasets: [{
                    label: 'Reports', data: [35, 22, 18, 15, 12],
                    backgroundColor: ['#dc2626', '#f59e0b', '#4f46e5', '#0891b2', '#7c3aed'],
                    borderRadius: 8, barPercentage: 0.6,
                }],
            },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } } },
        });

        make('utilChart', {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Idle', 'Busy'],
                datasets: [{ data: [stats.activeVolunteers, 5, 3], backgroundColor: ['#059669', '#e2e8f0', '#f59e0b'], borderWidth: 0, hoverOffset: 6 }],
            },
            options: { maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } },
        });

        return () => Object.values(chartRefs.current).forEach(c => c?.destroy());
    }, [stats]);

    if (!stats) return (
        <div>
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '120px' }} />)}
            </div>
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '260px', borderRadius: 'var(--radius-xl)' }} />)}
            </div>
        </div>
    );

    const highPriority = reports.filter(r => r.priorityScore >= 70).length;
    const pendingReports = reports.filter(r => r.status === 'Pending').sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 8);
    const recentTasks = [...tasks].sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt)).slice(0, 6);

    const handleAssign = async (reportId) => {
        const topVols = await api.getSuggestedVolunteers(reportId);
        setAssignModal({ reportId, vols: topVols });
    };

    const confirmAssign = async (rid, vid) => {
        await api.assignTask(rid, vid);
        showToast('Task Assigned Successfully!', 'success');
        setAssignModal(null);
        fetchData();
    };

    const getVolName = (rid) => {
        const task = tasks.find(t => t.reportId === rid);
        if (!task) return '—';
        const v = vols.find(v => v.id === task.assignedVolunteerId);
        return v ? v.name : '—';
    };

    const activityItems = [
        { icon: 'fa-file-alt', color: 'var(--color-accent)', text: 'New urgent report submitted — Water Supply shortage in Sector 12', time: '2 mins ago' },
        { icon: 'fa-user-check', color: 'var(--color-secondary)', text: 'Volunteer John accepted Task #1003 (Medical Emergency)', time: '15 mins ago' },
        { icon: 'fa-check-circle', color: 'var(--color-primary)', text: 'Task #1001 completed by Volunteer 5 — Food Distribution', time: '1 hour ago' },
        ...recentTasks.slice(0, 3).map(t => ({
            icon: 'fa-tasks', color: 'var(--color-info)',
            text: `Task #${t.reportId} assigned to ${vols.find(v => v.id === t.assignedVolunteerId)?.name || 'Volunteer'}`,
            time: new Date(t.assignedAt).toLocaleTimeString(),
        })),
    ];

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>NGO Dashboard</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Real-time operations overview · Socket.io live updates active</p>
                </div>
                <div className="flex gap-2 items-center">
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-secondary)', animation: 'pulse 2s infinite', display: 'inline-block' }}></span>
                        Live
                    </span>
                    <button className="btn btn-outline">
                        <i className="fas fa-download"></i> Export
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                <StatWidget title="Active Volunteers" value={stats.activeVolunteers} icon="users" trend={12} color="primary" />
                <StatWidget title="Pending Reports" value={stats.pendingReports} icon="file-alt" trend={-5} color="warning" />
                <StatWidget title="High Priority" value={highPriority} icon="exclamation-triangle" trend={8} color="danger" />
                <StatWidget title="Completed Today" value={stats.completedTasks} icon="check-circle" trend={18} color="secondary" />
            </div>

            {/* Charts Row */}
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                <div className="card fade-in">
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Weekly Task Completion</h3>
                    <div style={{ height: '220px' }}><canvas id="weeklyChart"></canvas></div>
                </div>
                <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Need Distribution</h3>
                    <div style={{ height: '220px' }}><canvas id="needChart"></canvas></div>
                </div>
                <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Volunteer Utilization</h3>
                    <div style={{ height: '220px' }}><canvas id="utilChart"></canvas></div>
                </div>
            </div>

            {/* Leaflet Map (replaces CSS heatmap) */}
            <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        <i className="fas fa-map-marked-alt" style={{ color: 'var(--color-primary)', marginRight: '0.5rem' }}></i>
                        Community Needs Map
                    </h3>
                    <div className="flex gap-3" style={{ fontSize: '0.7rem' }}>
                        {[{ l: 'Critical (≥80)', c: '#dc2626' }, { l: 'High (≥60)', c: '#f59e0b' }, { l: 'Medium (≥40)', c: '#3b82f6' }, { l: 'Low', c: '#059669' }].map(x => (
                            <span key={x.l} className="flex items-center gap-1">
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: x.c, display: 'inline-block', flexShrink: 0 }}></span>
                                {x.l}
                            </span>
                        ))}
                    </div>
                </div>
                <MapView reports={reports} height="320px" />
            </div>

            {/* Priority Queue + Activity Feed */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
                {/* Priority Queue Table */}
                <div className="card fade-in">
                    <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Priority Queue</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{pendingReports.length} pending</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>ID</th><th>Issue Type</th><th>Location</th><th>Priority</th><th>Assigned</th><th>Status</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {pendingReports.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 600 }}>#{r.id}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <i className={`fas fa-${r.issueType === 'Medical' ? 'medkit' : r.issueType === 'Food Shortage' ? 'apple-alt' : r.issueType === 'Water Supply' ? 'tint' : 'building'}`} style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}></i>
                                                {r.issueType}
                                            </div>
                                        </td>
                                        <td>
                                            {/* Custom branded tooltip replacing native title="" */}
                                            <Tooltip
                                                text={`Lat: ${r.latitude.toFixed(5)}\nLng: ${r.longitude.toFixed(5)}`}
                                                position="top"
                                            >
                                                <span style={{ fontSize: '0.8rem', cursor: 'default', borderBottom: '1px dashed var(--color-border)' }}>
                                                    {r.latitude.toFixed(2)}, {r.longitude.toFixed(2)}
                                                </span>
                                            </Tooltip>
                                        </td>
                                        <td><PriorityBadge score={r.priorityScore} /></td>
                                        <td style={{ fontSize: '0.8rem' }}>{getVolName(r.id)}</td>
                                        <td>
                                            <span className={`badge badge-${r.status === 'Pending' ? 'warning' : r.status === 'Assigned' ? 'info' : 'success'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleAssign(r.id)}>
                                                <i className="fas fa-user-plus"></i> Assign
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="card fade-in">
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>
                        <i className="fas fa-stream" style={{ marginRight: '0.5rem', color: 'var(--color-primary)' }}></i>
                        Activity Feed
                        <span className="badge badge-success" style={{ marginLeft: '0.5rem', fontSize: '0.55rem' }}>Live</span>
                    </h3>
                    <div className="flex-col gap-3">
                        {activityItems.slice(0, 6).map((a, i) => (
                            <div key={i} className="flex gap-3 items-start hover-lift" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', cursor: 'default' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${a.color}15`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem' }}>
                                    <i className={`fas ${a.icon}`}></i>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.4 }}>{a.text}</div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{a.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Volunteer Assignment Modal */}
            {assignModal && (
                <div className="modal-overlay" onClick={() => setAssignModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Match Volunteers — Report #{assignModal.reportId}</h3>
                            <button className="btn btn-icon btn-outline" onClick={() => setAssignModal(null)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                Ranked by Skill Match · Distance · Availability · Experience
                            </p>
                            <div className="flex-col gap-3">
                                {assignModal.vols.map((v, i) => (
                                    <div key={v.id} className="flex justify-between items-center"
                                        style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: i === 0 ? 'var(--color-primary-50)' : 'transparent', transition: 'all 0.15s' }}>
                                        <div className="flex gap-3 items-center">
                                            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: i === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)', width: '24px' }}>#{i + 1}</div>
                                            <div className="avatar" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                                {v.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                    {v.name} {i === 0 && <span className="badge badge-primary" style={{ fontSize: '0.5rem', marginLeft: '0.25rem' }}>BEST MATCH</span>}
                                                </div>
                                                <Tooltip text={`Skills: ${v.skills.join(', ')}\nExp: ${v.experienceLevel}\nAvailability: ${v.availabilityStatus}`} position="bottom">
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', cursor: 'default' }}>
                                                        <i className="fas fa-map-marker-alt"></i> {v.distanceKm} km · {v.skills[0]} · {v.rating}★
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="badge badge-success">{v.matchScore}%</span>
                                            <button className="btn btn-primary btn-sm" onClick={() => confirmAssign(assignModal.reportId, v.id)}>Assign</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setAssignModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
