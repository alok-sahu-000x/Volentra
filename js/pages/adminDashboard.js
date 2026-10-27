// adminDashboard.js
import { store } from '../store/store.js';
import { api } from '../services/api.js';
import { StatWidget, Table, PriorityBadge } from '../components/Components.js';

export default {
    async render() {
        const state = store.getState();
        const stats = state.stats;
        
        // Sorting reports by priority
        const pendingReports = state.reports
            .filter(r => r.status === 'Pending')
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, 5);

        const recentTasks = state.tasks
            .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))
            .slice(0, 5);

        // Reports table data
        const headers = ['ID', 'Issue Type', 'Location (Lat/Lng)', 'Priority', 'Status', 'Action'];
        const rows = pendingReports.map(r => [
            `#${r.id}`,
            r.issueType,
            `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`,
            PriorityBadge(r.priorityScore),
            `<span class="badge badge-warning">${r.status}</span>`,
            `<button class="btn btn-primary btn-sm assign-btn" data-id="${r.id}" style="padding: 0.25rem 0.5rem; font-size:0.75rem;">Assign</button>`
        ]);

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 2rem; margin-bottom: 0.25rem;">NGO Dashboard</h1>
                    <p style="color: var(--color-text-muted);">Overview of platform operations</p>
                </div>
                <button class="btn btn-outline"><i class="fas fa-download"></i> Export Report</button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                ${StatWidget('Active Volunteers', stats.activeVolunteers, 'users', 12, 'primary')}
                ${StatWidget('Pending Reports', stats.pendingReports, 'file-alt', 5, 'accent')}
                ${StatWidget('Tasks Completed (Daily)', stats.completedTasks, 'check-circle', 18, 'secondary')}
                ${StatWidget('Total Incidents', stats.totalReports, 'exclamation-circle', null, 'warning')}
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <div class="card fade-in" style="animation-delay: 0.1s;">
                    <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem; display:flex; justify-content:space-between; align-items:center;">
                        High Priority Queue
                        <a href="#/admin/reports" style="font-size:0.875rem;">View All</a>
                    </h2>
                    ${Table(headers, rows)}
                </div>

                <div class="card fade-in" style="animation-delay: 0.2s;">
                    <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Recent Task Activity</h2>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${recentTasks.map(t => {
                            const vName = state.volunteers.find(v => v.id === t.assignedVolunteerId)?.name || 'Unknown';
                            return `
                                <div style="display: flex; align-items: start; gap: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; transition: background 0.2s ease; padding: 0.5rem; border-radius: var(--radius-sm);" class="hover-bg-light">
                                    <div style="background: var(--color-primary-light); color: var(--color-primary); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink:0;">
                                        <i class="fas fa-tasks"></i>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.875rem; font-weight: 500;">Task #${t.reportId} assigned to ${vName}</div>
                                        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${new Date(t.assignedAt).toLocaleString()} • <span class="badge badge-info" style="font-size:0.6rem;">${t.status}</span></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <div class="card fade-in" style="animation-delay: 0.3s;">
                    <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">Task Completion Trend</h2>
                    <div style="position: relative; height: 250px; width: 100%;">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>
                <div class="card fade-in" style="animation-delay: 0.4s;">
                    <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">Issue Categories Distribution</h2>
                    <div style="position: relative; height: 250px; width: 100%; display: flex; justify-content: center;">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        // Initialize Charts safely
        if(window.Chart) {
            const ctx1 = document.getElementById('trendChart');
            if(ctx1) {
                new window.Chart(ctx1, {
                    type: 'line',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Completed Tasks',
                            data: [12, 19, 15, 25, 22, 30, 28],
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } } }
                });
            }

            const ctx2 = document.getElementById('categoryChart');
            if(ctx2) {
                new window.Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: ['Medical', 'Food', 'Infrastructure', 'Water'],
                        datasets: [{
                            data: [35, 25, 20, 20],
                            backgroundColor: ['#dc2626', '#f59e0b', '#4f46e5', '#059669'],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: { maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } }
                });
            }
        }

        // Modal for assignment
        document.querySelectorAll('.assign-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const reportId = parseInt(e.target.dataset.id);
                try {
                    const topVols = await api.getSuggestedVolunteers(reportId);
                    
                    const modalHtml = `
                    <div id="assign-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; animation: fadeIn 0.2s ease-out;">
                        <div class="card" style="width: 100%; max-width: 500px; transform: scale(0.95); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
                            <h3 style="margin-bottom:1rem; font-size:1.25rem;">Match Volunteers for Report #${reportId}</h3>
                            <div style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem; padding-right:0.5rem;">
                                ${topVols.map(v => `
                                    <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; border:1px solid var(--color-border); border-radius:var(--radius-md); transition: border-color var(--transition-fast);">
                                        <div>
                                            <strong style="color:var(--color-text);">${v.name}</strong> <span class="badge badge-success" style="margin-left:0.5rem;">${v.matchScore}% Match</span><br>
                                            <span style="font-size:0.75rem; color:var(--color-text-muted);">${v.distanceKm} km away • ${v.skills.join(', ')}</span>
                                        </div>
                                        <button class="btn btn-primary btn-sm do-assign" data-rid="${reportId}" data-vid="${v.id}" style="padding: 0.25rem 0.75rem;">Assign</button>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="btn btn-outline w-full" style="padding: 0.75rem;" onclick="document.getElementById('assign-modal').remove()">Cancel</button>
                        </div>
                    </div>
                    `;
                    document.getElementById('modal-container').innerHTML = modalHtml;

                    document.querySelectorAll('.do-assign').forEach(b => {
                        b.addEventListener('click', async (ex) => {
                            const rid = parseInt(ex.target.dataset.rid);
                            const vid = parseInt(ex.target.dataset.vid);
                            await api.assignTask(rid, vid);
                            document.getElementById('assign-modal').remove();
                            window.showToast('Task Assigned Successfully!', 'success');
                            window.navigate('/dummy'); 
                            setTimeout(()=> window.navigate('/admin'), 10);
                        });
                    });

                } catch(err) {
                    console.error(err);
                }
            });
        });
    }
};
