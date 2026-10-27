import { api } from '../services/api.js';

export default {
    async render() {
        return `
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="margin-bottom: 2rem;">
                    <h1 style="font-size: 2rem; margin-bottom: 0.25rem;">Submit Incident Report</h1>
                    <p style="color: var(--color-text-muted);">Please provide accurate details to ensure rapid response.</p>
                </div>

                <div class="card" style="box-shadow: var(--shadow-lg);">
                    <form id="report-form">
                        <div class="form-group">
                            <label class="form-label">Issue Category</label>
                            <select id="issueType" class="form-input" required>
                                <option value="">Select Category...</option>
                                <option value="Medical">Medical Emergency</option>
                                <option value="Food Shortage">Food Shortage</option>
                                <option value="Infrastructure">Infrastructure Damage</option>
                                <option value="Water Supply">Water Supply</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea id="description" class="form-input" rows="4" placeholder="Detail the exact situation..." required></textarea>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom:1rem;">
                            <div class="form-group">
                                <label class="form-label">Urgency Level (1-10)</label>
                                <input type="number" id="urgency" min="1" max="10" value="5" class="form-input" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Estimated People Affected</label>
                                <input type="number" id="people" class="form-input" value="10" min="1" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Location (Lat/Lng)</label>
                            <div style="display:flex; gap:1rem;">
                                <input type="text" id="lat" value="34.0522" class="form-input">
                                <input type="text" id="lng" value="-118.2437" class="form-input">
                            </div>
                        </div>

                        <div style="margin-top: 2rem; display:flex; justify-content:flex-end; gap:1rem; border-top:1px solid var(--color-border); padding-top:1.5rem;">
                            <button type="submit" class="btn btn-primary" id="submitBtn">Submit Report <i class="fas fa-paper-plane"></i></button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    afterRender() {
        document.getElementById('report-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.disabled = true;

            const data = {
                issueType: document.getElementById('issueType').value,
                description: document.getElementById('description').value,
                urgency: parseInt(document.getElementById('urgency').value),
                peopleAffected: parseInt(document.getElementById('people').value),
                latitude: parseFloat(document.getElementById('lat').value),
                longitude: parseFloat(document.getElementById('lng').value)
            };

            try {
                await api.submitReport(data);
                window.showToast('Incident Report submitted. Prioritization engine analyzing.', 'success');
                btn.innerHTML = 'Submit Report <i class="fas fa-paper-plane"></i>';
                btn.disabled = false;
                document.getElementById('report-form').reset();
            } catch(e) {
                window.showToast('Failed to submit', 'error');
                btn.innerHTML = 'Submit Report <i class="fas fa-paper-plane"></i>';
                btn.disabled = false;
            }
        });
    }
};
