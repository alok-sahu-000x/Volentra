import { store } from '../store/store.js';
import { api } from '../services/api.js';

export default {
    async render() {
        const state = store.getState();
        const user = state.user;
        const profile = state.volunteers.find(v => v.userId === user.id);
        
        if (!profile) return `<div>Error: Profile not found.</div>`;

        const myTasks = state.tasks.filter(t => t.assignedVolunteerId === profile.id && t.status !== 'Completed');
        const completedTasks = state.tasks.filter(t => t.assignedVolunteerId === profile.id && t.status === 'Completed');

        return `
            <div style="margin-bottom: 2rem;">
                <h1 style="font-size: 2rem; margin-bottom: 0.25rem;">Welcome back, ${user.name}!</h1>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="card interactive" style="background: var(--color-primary); color: white;">
                    <h3 style="font-weight: 500; font-size: 0.875rem; opacity: 0.9;">Total Hours Served</h3>
                    <div style="font-size: 2.5rem; font-weight: 700;">${profile.totalHoursServed}</div>
                </div>
                <div class="card interactive">
                    <h3 style="font-weight: 500; font-size: 0.875rem; color: var(--color-text-muted);">Tasks Completed</h3>
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--color-secondary);">${completedTasks.length}</div>
                </div>
                <div class="card interactive">
                    <h3 style="font-weight: 500; font-size: 0.875rem; color: var(--color-text-muted);">Current Rating</h3>
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--color-warning);">${profile.rating} <i class="fas fa-star" style="font-size: 1.5rem;"></i></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <div class="card">
                    <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">My Active Tasks</h2>
                    ${myTasks.length === 0 ? `
                        <div style="text-align:center; padding: 2rem; color: var(--color-text-muted);">
                            <p>You have no active tasks. Take a break!</p>
                        </div>
                    ` : `
                        <div style="display:flex; flex-direction:column; gap:1rem;">
                            ${myTasks.map(t => {
                                const report = state.reports.find(r => r.id === t.reportId);
                                return `
                                    <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1rem; display:flex; justify-content:space-between; align-items:center;">
                                        <div>
                                            <div style="font-weight: 600;">${report?.issueType || 'Task'} <span class="badge badge-warning">${t.status}</span></div>
                                            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-top:0.25rem;">
                                                <i class="fas fa-map-marker-alt"></i> Lat: ${report?.latitude.toFixed(3)}, Lng: ${report?.longitude.toFixed(3)}
                                            </div>
                                            <p style="font-size:0.875rem; margin-top:0.5rem; max-width:80%;">${report?.description}</p>
                                        </div>
                                        <div style="display:flex; flex-direction:column; gap:0.5rem;">
                                            <button class="btn btn-success btn-sm mark-complete-btn" data-tid="${t.id}">Mark Complete</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <div class="card">
                    <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Settings</h2>
                    <button class="btn btn-outline w-full toggle-status-btn">Toggle Availability</button>
                </div>
            </div>
        `;
    },

    afterRender() {
        document.querySelectorAll('.mark-complete-btn').forEach(b => {
            b.addEventListener('click', async (e) => {
                const tid = parseInt(e.target.dataset.tid);
                await api.updateTaskStatus(tid, 'Completed');
                window.showToast('Task marked as completed! Great job.', 'success');
                window.navigate('/dummy'); 
                setTimeout(()=> window.navigate('/volunteer'), 10);
            });
        });
    }
};
