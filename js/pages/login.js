import { api } from '../services/api.js';

export default {
    async render() {
        return `
            <div class="h-full w-full flex items-center justify-center bg-gray-50 bg-login-pattern" style="background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-surface) 100%);">
                <div class="card" style="width: 100%; max-width: 400px; padding: 2.5rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg);">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="background: var(--color-primary); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 1rem auto; box-shadow: var(--shadow-glow);">
                            <i class="fas fa-hands-helping"></i>
                        </div>
                        <h1 style="font-size: 1.75rem; color: var(--color-text); margin-bottom: 0.5rem;">Volentra</h1>
                    </div>

                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" id="email" class="form-input" value="admin@ngo.org" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label class="form-label">Password</label>
                            <input type="password" id="password" class="form-input" value="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-full" id="login-btn" style="padding: 0.75rem; font-size: 1rem;">
                            Sign In
                        </button>
                    </form>
                    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); text-align: center; font-size: 0.875rem; color: var(--color-text-muted);">
                        Demo Accounts:<br>
                        Admin: admin@ngo.org<br>
                        Volunteer: john@vol.org<br>
                        Worker: mike@field.org
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            btn.disabled = true;

            try {
                const email = document.getElementById('email').value;
                const pass = document.getElementById('password').value;
                const user = await api.login(email, pass);
                window.showToast(`Welcome back, ${user.name}!`, 'success');
                if (user.role === 'admin') window.navigate('/admin');
                else if (user.role === 'volunteer') window.navigate('/volunteer');
                else if (user.role === 'field_worker') window.navigate('/fieldworker');
            } catch (err) {
                window.showToast("Invalid credentials", 'error');
                btn.innerHTML = 'Sign In';
                btn.disabled = false;
            }
        });
    }
}
