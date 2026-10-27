import { useState, useEffect } from 'react';
import { api } from '../api';
import { useApp } from '../context.jsx';

export default function TaskManagement() {
    const { showToast } = useApp();
    const [tasks, setTasks] = useState([]);
    const [reports, setReports] = useState([]);
    const [vols, setVols] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [draggedTask, setDraggedTask] = useState(null);
    const [matchedVols, setMatchedVols] = useState([]);

    const fetchData = async () => {
        const [t, r, v] = await Promise.all([api.getTasks(), api.getReports(), api.getVolunteers()]);
        setTasks(t); setReports(r); setVols(v);
    };
    useEffect(() => { fetchData(); }, []);

    const columns = [
        { id: 'Unassigned', label: 'Unassigned', color: '#64748b', icon: 'fa-inbox' },
        { id: 'Assigned', label: 'Assigned', color: '#f59e0b', icon: 'fa-user-check' },
        { id: 'In Progress', label: 'In Progress', color: '#4f46e5', icon: 'fa-spinner' },
        { id: 'Completed', label: 'Completed', color: '#059669', icon: 'fa-check-circle' },
    ];

    const getTasksForCol = (colId) => {
        if (colId === 'Unassigned') {
            return reports.filter(r => r.status === 'Pending').map(r => ({
                id: `r-${r.id}`, reportId: r.id, title: r.issueType, status: 'Unassigned',
                priority: r.priorityScore, desc: r.description,
                tags: [r.issueType], deadline: null, aiAnalysis: r.aiAnalysis
            }));
        }
        if (colId === 'Assigned') {
            return tasks.filter(t => t.status === 'In Progress' && !t.completedAt).slice(0, Math.ceil(tasks.filter(t => t.status === 'In Progress').length / 2)).map(t => {
                const r = reports.find(rep => rep.id === t.reportId) || {};
                return { id: `t-${t.id}`, taskId: t.id, reportId: t.reportId, title: r.issueType || 'Task', status: 'Assigned', priority: r.priorityScore || 50, desc: r.description || '', volunteer: vols.find(v => v.id === t.assignedVolunteerId)?.name || 'Unknown', tags: [r.issueType || 'General'], deadline: new Date(new Date(t.assignedAt).getTime() + 172800000).toLocaleDateString(), aiAnalysis: r.aiAnalysis };
            });
        }
        const statusMap = { 'In Progress': 'In Progress', 'Completed': 'Completed' };
        const filtered = colId === 'In Progress'
            ? tasks.filter(t => t.status === 'In Progress' && !t.completedAt).slice(Math.ceil(tasks.filter(t => t.status === 'In Progress').length / 2))
            : tasks.filter(t => t.status === statusMap[colId]);
        return filtered.map(t => {
            const r = reports.find(rep => rep.id === t.reportId) || {};
            return { id: `t-${t.id}`, taskId: t.id, reportId: t.reportId, title: r.issueType || 'Task', status: colId, priority: r.priorityScore || 50, desc: r.description || '', volunteer: vols.find(v => v.id === t.assignedVolunteerId)?.name || 'Unknown', tags: [r.issueType || 'General'], deadline: t.completedAt ? new Date(t.completedAt).toLocaleDateString() : null, aiAnalysis: r.aiAnalysis };
        });
    };

    const handleDragStart = (task) => setDraggedTask(task);
    const handleDrop = async (colId) => {
        if (!draggedTask || draggedTask.status === colId) { setDraggedTask(null); return; }
        if (draggedTask.taskId) {
            const newStatus = colId === 'Assigned' ? 'In Progress' : colId;
            await api.updateTaskStatus(draggedTask.taskId, newStatus);
            showToast(`Task moved to ${colId}`, 'success');
            await fetchData();
        }
        setDraggedTask(null);
    };

    const openDetail = async (task) => {
        setSelectedTask(task);
        if (task.reportId) {
            try { const m = await api.getSuggestedVolunteers(task.reportId); setMatchedVols(m); }
            catch { setMatchedVols([]); }
        }
    };

    const getPriorityColor = (p) => p >= 80 ? 'var(--color-danger)' : p >= 60 ? 'var(--color-warning)' : p >= 40 ? 'var(--color-info)' : 'var(--color-secondary)';

    return (
        <div>
            <div className="flex justify-between items-center" style={{marginBottom: '1.5rem'}}>
                <div>
                    <h1 style={{fontSize: '1.75rem', marginBottom: '0.25rem'}}>Task Management</h1>
                    <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem'}}>Drag and drop to manage task workflow</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm"><i className="fas fa-filter"></i> Filter</button>
                    <button className="btn btn-primary btn-sm"><i className="fas fa-plus"></i> New Task</button>
                </div>
            </div>

            <div className="kanban-board">
                {columns.map(col => {
                    const colTasks = getTasksForCol(col.id);
                    return (
                        <div key={col.id} className="kanban-column" onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }} onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')} onDrop={(e) => { e.currentTarget.classList.remove('drag-over'); handleDrop(col.id); }}>
                            <div className="kanban-column-header">
                                <span><i className={`fas ${col.icon}`} style={{color: col.color, marginRight: '0.5rem'}}></i>{col.label}</span>
                                <span className="badge badge-primary" style={{fontSize: '0.6rem'}}>{colTasks.length}</span>
                            </div>
                            {colTasks.map(task => (
                                <div key={task.id} className="kanban-card" draggable onDragStart={() => handleDragStart(task)} onClick={() => openDetail(task)}>
                                    <div className="flex justify-between items-center" style={{marginBottom: '0.375rem'}}>
                                        <span style={{fontWeight: 600, fontSize: '0.8rem'}}>{task.title}</span>
                                        <span style={{width: '8px', height: '8px', borderRadius: '50%', background: getPriorityColor(task.priority), flexShrink: 0}}></span>
                                    </div>
                                    <p style={{fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{task.desc}</p>
                                    <div className="flex justify-between items-center" style={{marginBottom: '0.375rem'}}>
                                        <span className="badge" style={{background: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority), fontSize: '0.6rem'}}>{task.priority} pts</span>
                                        {task.volunteer && <div className="avatar avatar-sm" style={{background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '0.5rem'}}>{task.volunteer.split(' ').map(n=>n[0]).join('')}</div>}
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        {task.tags?.map((tag, i) => <span key={i} style={{fontSize: '0.55rem', background: 'var(--color-bg)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)', color: 'var(--color-text-muted)'}}>{tag}</span>)}
                                        {task.deadline && <span style={{fontSize: '0.55rem', color: 'var(--color-text-muted)'}}><i className="fas fa-clock"></i> {task.deadline}</span>}
                                    </div>
                                </div>
                            ))}
                            {colTasks.length === 0 && <div style={{textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)'}}>Drop tasks here</div>}
                        </div>
                    );
                })}
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="modal-overlay" onClick={() => { setSelectedTask(null); setMatchedVols([]); }}>
                    <div className="modal-content" style={{maxWidth: '650px'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{marginBottom: '0.25rem'}}>{selectedTask.title}</h3>
                                <span style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>Report #{selectedTask.reportId}</span>
                            </div>
                            <button className="btn btn-icon btn-outline" onClick={() => { setSelectedTask(null); setMatchedVols([]); }}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="modal-body">
                            <div className="flex gap-2" style={{marginBottom: '1.25rem'}}>
                                <span className="badge" style={{background: `${getPriorityColor(selectedTask.priority)}20`, color: getPriorityColor(selectedTask.priority)}}>Priority: {selectedTask.priority}</span>
                                <span className="badge badge-info">{selectedTask.status}</span>
                                {selectedTask.tags?.map((t,i) => <span key={i} className="badge badge-primary">{t}</span>)}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Full Description</label>
                                <p style={{fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6}}>{selectedTask.desc}</p>
                            </div>

                            {selectedTask.aiAnalysis && !selectedTask.aiAnalysis.error && (
                                <div style={{background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(124, 58, 237, 0.05))', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.25rem'}}>
                                    <div className="flex items-center gap-2" style={{marginBottom: '0.5rem'}}>
                                        <i className="fas fa-sparkles" style={{color: 'var(--color-primary)'}}></i>
                                        <span style={{fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)'}}>Google Gemini Triage Analysis</span>
                                    </div>
                                    <p style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}><strong>Recommended Action:</strong> {selectedTask.aiAnalysis.recommendedAction}</p>
                                    <div className="flex flex-wrap gap-1">
                                        <span style={{fontSize: '0.75rem', fontWeight: 600}}>Required Supplies: </span>
                                        {selectedTask.aiAnalysis.requiredSupplies.map((sup, i) => (
                                            <span key={i} style={{fontSize: '0.7rem', background: 'var(--color-surface)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)'}}>{sup}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedTask.volunteer && (
                                <div className="form-group">
                                    <label className="form-label">Assigned Volunteer</label>
                                    <div className="flex items-center gap-2">
                                        <div className="avatar avatar-sm" style={{background: 'var(--color-secondary-light)', color: 'var(--color-secondary)'}}>{selectedTask.volunteer.split(' ').map(n=>n[0]).join('')}</div>
                                        <span style={{fontWeight: 600, fontSize: '0.875rem'}}>{selectedTask.volunteer}</span>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Internal Notes</label>
                                <textarea className="form-input" rows={2} placeholder="Add notes for the team..." style={{fontSize: '0.85rem'}}></textarea>
                            </div>

                            {matchedVols.length > 0 && (
                                <div className="form-group">
                                    <label className="form-label">Recommended Volunteers</label>
                                    <div className="flex-col gap-2">
                                        {matchedVols.slice(0, 3).map(v => (
                                            <div key={v.id} className="flex justify-between items-center" style={{padding: '0.5rem 0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)'}}>
                                                <div className="flex items-center gap-2">
                                                    <div className="avatar avatar-sm" style={{background: 'var(--color-primary-light)', color: 'var(--color-primary)'}}>{v.name.split(' ').map(n=>n[0]).join('')}</div>
                                                    <div>
                                                        <div style={{fontSize: '0.8rem', fontWeight: 600}}>{v.name}</div>
                                                        <div style={{fontSize: '0.65rem', color: 'var(--color-text-muted)'}}>{v.distanceKm} km · {v.skills.join(', ')}</div>
                                                    </div>
                                                </div>
                                                <span className="badge badge-success">{v.matchScore}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => { setSelectedTask(null); setMatchedVols([]); }}>Close</button>
                            <button className="btn btn-primary" onClick={() => { showToast('Changes saved'); setSelectedTask(null); setMatchedVols([]); }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
