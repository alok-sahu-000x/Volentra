import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context.jsx';

export default function Login() {
    const { login, showToast } = useApp();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('admin@ngo.org');
    const [password, setPassword] = useState('password');

    const executeLogin = async (loginEmail, loginPass) => {
        setLoading(true);
        try {
            const user = await login(loginEmail, loginPass);
            showToast(`Welcome back, ${user.name}!`, 'success');
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'volunteer') navigate('/volunteer');
            else if (user.role === 'field_worker') navigate('/fieldworker');
            else navigate('/admin');
        } catch (err) {
            showToast(err.message || "Login failed. Check backend server connection or use a demo account.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        executeLogin(email, password);
    };

    const handleQuickLogin = (demoEmail, roleName) => {
        setEmail(demoEmail);
        setPassword('password');
        showToast(`Signing in as Demo ${roleName}...`, 'info');
        executeLogin(demoEmail, 'password');
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '1rem', background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-bg) 50%, var(--color-secondary-light) 100%)' }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem', boxShadow: 'var(--shadow-glow)' }}>
                        <i className="fas fa-hands-helping"></i>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Sign in to your Volentra account</p>
                </div>

                {/* 1-Click Demo Logins */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', textAlign: 'center' }}>
                        ⚡ Instant Demo Access
                    </div>
                    <div className="flex gap-2 justify-center" style={{ flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)' }}
                            onClick={() => handleQuickLogin('admin@ngo.org', 'Admin')}
                            disabled={loading}
                        >
                            👑 Admin
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)' }}
                            onClick={() => handleQuickLogin('john@vol.org', 'Volunteer')}
                            disabled={loading}
                        >
                            🤝 Volunteer
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)' }}
                            onClick={() => handleQuickLogin('mike@field.org', 'Field Worker')}
                            disabled={loading}
                        >
                            🚜 Field Worker
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div className="flex justify-between items-center">
                            <label className="form-label">Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Forgot Password?</Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                        {loading ? <><i className="fas fa-spinner fa-spin"></i> Signing In...</> : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create Account</Link>
                </div>
            </div>
        </div>
    );
}
