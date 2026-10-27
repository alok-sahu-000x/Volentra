import { store } from '../store/store.js';

export default {
    async render() {
        const state = store.getState();
        const vols = state.volunteers;

        const tableRows = vols.map(v => {
            return `
                <tr class="hover-bg-light">
                    <td><strong>${v.name}</strong><br><span style="font-size:0.75rem; color:var(--color-text-muted);">ID: #${v.id}</span></td>
                    <td>${v.skills.join(', ')}</td>
                    <td><span class="badge ${v.availabilityStatus === 'available' ? 'badge-success' : 'badge-warning'}">${v.availabilityStatus}</span></td>
                    <td>${v.rating} <i class="fas fa-star" style="color:var(--color-warning); font-size:0.8rem;"></i></td>
                    <td>${v.totalHoursServed} hrs</td>
                    <td>
                        <button class="btn btn-primary btn-sm" style="padding:0.25rem 0.5rem;" onclick="window.showToast('Edit simulated')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-outline btn-sm delete-vol" data-id="${v.id}" style="padding:0.25rem 0.5rem; color:var(--color-danger); border-color:var(--color-danger);"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 2rem; margin-bottom: 0.25rem;">Volunteer Management</h1>
                    <p style="color: var(--color-text-muted);">Manage, edit, and track registered volunteers.</p>
                </div>
                <button class="btn btn-primary" onclick="window.showToast('Add mock simulated')"><i class="fas fa-plus"></i> Add Volunteer</button>
            </div>

            <div class="card fade-in">
                <div style="display:flex; gap:1rem; margin-bottom:1.5rem;">
                    <input type="text" id="vol-search" placeholder="Search by name or skill..." class="form-input" style="max-width:300px;">
                    <select class="form-input" style="max-width:150px;">
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                    </select>
                </div>
                
                <div class="table-container" style="overflow-x: auto;">
                    <table class="data-table" id="vol-table">
                        <thead>
                            <tr>
                                <th>Volunteer</th>
                                <th>Skills</th>
                                <th>Status</th>
                                <th>Rating</th>
                                <th>Hours</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            </div>
        `;
    },

    afterRender() {
        document.getElementById('vol-search').addEventListener('keyup', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#vol-table tbody tr');
            rows.forEach(r => {
                if(r.innerText.toLowerCase().includes(query)) r.style.display = '';
                else r.style.display = 'none';
            });
        });

        document.querySelectorAll('.delete-vol').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if(confirm(`Are you sure you want to remove Volunteer #${id}?`)) {
                    e.currentTarget.closest('tr').remove();
                    window.showToast('Volunteer removed successfully.', 'success');
                }
            });
        });
    }
};
