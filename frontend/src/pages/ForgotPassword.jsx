import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context.jsx';

export default function ForgotPassword() {
    const { showToast } = useApp();
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        showToast('Password reset link sent!', 'success');
    };

    return (
        <div className="flex items-center justify-center" style={{minHeight: '100vh', background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-bg) 100%)'}}>
            <div className="card fade-in" style={{width: '100%', maxWidth: '420px', padding: '2.5rem', borderRadius: 'var(--radius-2xl)'}}>
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <div style={{width: '56px', height: '56px', borderRadius: '16px', background: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem'}}><i className="fas fa-key"></i></div>
                    <h1 style={{fontSize: '1.5rem', marginBottom: '0.25rem'}}>Forgot Password?</h1>
                    <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem'}}>Enter your email and we'll send a reset link</p>
                </div>
                {!sent ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" className="form-input" placeholder="you@example.com" required />
                        </div>
                        <button type="submit" className="btn btn-primary w-full" style={{padding: '0.75rem'}}>Send Reset Link</button>
                    </form>
                ) : (
                    <div className="text-center" style={{padding: '1rem'}}>
                        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>✉️</div>
                        <p style={{fontWeight: 600, marginBottom: '0.5rem'}}>Check your email</p>
                        <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem'}}>We've sent a password reset link to your email address.</p>
                    </div>
                )}
                <div style={{marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem'}}>
                    <Link to="/login"><i className="fas fa-arrow-left"></i> Back to Login</Link>
                </div>
            </div>
        </div>
    );
}
