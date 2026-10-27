import { useState } from 'react';
import { useApp } from '../context.jsx';

export default function Settings() {
    const { user, showToast, darkMode, toggleTheme } = useApp();
    const [tab, setTab] = useState('profile');
    const [avail, setAvail] = useState('available');

    // ── Password strength (Fix 5) ─────────────────────────────────────────────
    const [newPass, setNewPass] = useState('');
    const [currentPassInput, setCurrentPassInput] = useState('');
    const getStrength = (p) => {
        if (!p) return { score: 0, label: '', color: '' };
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['', 'var(--color-danger)', 'var(--color-warning)', 'var(--color-info)', 'var(--color-secondary)'];
        return { score: s, label: labels[s], color: colors[s], pct: s * 25 };
    };
    const strength = getStrength(newPass);

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        if (!currentPassInput) { showToast('Please enter your current password', 'error'); return; }
        if (currentPassInput !== 'password') { showToast('Current password is incorrect', 'error'); return; }
        if (strength.score < 2) { showToast('New password is too weak', 'error'); return; }
        showToast('Password updated successfully! 🔒', 'success');
        setCurrentPassInput(''); setNewPass('');
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'fa-user' },
        { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
        { id: 'availability', label: 'Availability', icon: 'fa-clock' },
        { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
        { id: 'appearance', label: 'Appearance', icon: 'fa-palette' },
    ];

    return (
        <div>
            <h1 style={{fontSize: '1.75rem', marginBottom: '1.5rem'}}>Settings</h1>
            <div className="flex gap-6" style={{alignItems: 'flex-start'}}>
                <div className="card" style={{minWidth: '220px', padding: '0.5rem'}}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-3 w-full" style={{padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', background: tab === t.id ? 'var(--color-primary-light)' : 'transparent', color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: tab === t.id ? 600 : 500, fontSize: '0.875rem', textAlign: 'left', transition: 'all 0.15s'}}>
                            <i className={`fas ${t.icon}`} style={{width: '16px'}}></i> {t.label}
                        </button>
                    ))}
                </div>

                <div className="card fade-in" style={{flex: 1}} key={tab}>
                    {tab === 'profile' && (
                        <>  
                            <h2 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}}>Profile Management</h2>
                            <div className="flex items-center gap-4" style={{marginBottom: '2rem'}}>
                                <div className="avatar avatar-lg" style={{background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '1.25rem'}}>{user?.name?.split(' ').map(n=>n[0]).join('') || 'U'}</div>
                                <div>
                                    <div style={{fontWeight: 600}}>{user?.name || 'User'}</div>
                                    <div style={{color: 'var(--color-text-muted)', fontSize: '0.875rem'}}>{user?.email}</div>
                                    <span className="badge badge-primary" style={{marginTop: '0.25rem'}}>{user?.role}</span>
                                </div>
                                <button className="btn btn-outline btn-sm" style={{marginLeft: 'auto'}}>Change Photo</button>
                            </div>
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" defaultValue={user?.name} /></div>
                                <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue={user?.email} /></div>
                                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+1 (555) 000-0000" /></div>
                                <div className="form-group"><label className="form-label">Location</label><input className="form-input" placeholder="City, State" /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input" rows={3} placeholder="Tell us about yourself..."></textarea></div>
                            <button className="btn btn-primary" onClick={() => showToast('Profile saved!', 'success')}>Save Changes</button>
                        </>
                    )}

                    {tab === 'notifications' && (
                        <>
                            <h2 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}}>Notification Preferences</h2>
                            {[
                                {label: 'New task assignments', desc: 'Get notified when a new task is assigned to you', default: true},
                                {label: 'Task completion alerts', desc: 'Receive alerts when volunteers complete tasks', default: true},
                                {label: 'Urgent report submissions', desc: 'Instant notifications for high-priority reports', default: true},
                                {label: 'Weekly summary digest', desc: 'Receive a weekly email summary of operations', default: false},
                                {label: 'System announcements', desc: 'Platform updates and maintenance notices', default: false},
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center" style={{padding: '1rem 0', borderBottom: '1px solid var(--color-border-light)'}}>
                                    <div>
                                        <div style={{fontSize: '0.875rem', fontWeight: 500}}>{item.label}</div>
                                        <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>{item.desc}</div>
                                    </div>
                                    <div className={`toggle ${item.default ? 'active' : ''}`} onClick={(e) => e.currentTarget.classList.toggle('active')}></div>
                                </div>
                            ))}
                        </>
                    )}

                    {tab === 'availability' && (
                        <>
                            <h2 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}}>Availability Settings</h2>
                            <div className="form-group">
                                <label className="form-label">Current Status</label>
                                <div className="flex gap-2">
                                    {[{id: 'available', label: 'Available', icon: 'fa-circle', color: 'var(--color-secondary)'}, {id: 'busy', label: 'Busy', icon: 'fa-minus-circle', color: 'var(--color-warning)'}, {id: 'offline', label: 'Offline', icon: 'fa-times-circle', color: 'var(--color-text-muted)'}].map(s => (
                                        <button key={s.id} onClick={() => { setAvail(s.id); showToast(`Status set to ${s.label}`); }} className="flex items-center gap-2" style={{flex: 1, padding: '1rem', borderRadius: 'var(--radius-lg)', border: `2px solid ${avail === s.id ? s.color : 'var(--color-border)'}`, background: avail === s.id ? `${s.color}10` : 'transparent', transition: 'all 0.15s'}}>
                                            <i className={`fas ${s.icon}`} style={{color: s.color}}></i>
                                            <span style={{fontWeight: avail === s.id ? 600 : 400, fontSize: '0.875rem'}}>{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Working Hours</label>
                                <div className="grid-2">
                                    <div><label style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>Start Time</label><input type="time" className="form-input" defaultValue="09:00" /></div>
                                    <div><label style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>End Time</label><input type="time" className="form-input" defaultValue="17:00" /></div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Working Days</label>
                                <div className="flex gap-2">
                                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
                                        <button key={d} onClick={e => e.currentTarget.classList.toggle('btn-primary')} style={{flex: 1, background: i < 5 ? '' : 'var(--color-bg)', borderRadius: 'var(--radius-md)'}} className={`btn btn-sm ${i < 5 ? 'btn-primary' : 'btn-outline'}`}>{d}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Max Tasks Per Day</label>
                                <input type="number" className="form-input" defaultValue={5} min={1} max={20} style={{maxWidth: '120px'}} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Service Radius (km)</label>
                                <input type="range" min="1" max="50" defaultValue="15" style={{width: '100%'}} />
                                <div className="flex justify-between" style={{fontSize: '0.7rem', color: 'var(--color-text-muted)'}}><span>1 km</span><span>25 km</span><span>50 km</span></div>
                            </div>
                            <button className="btn btn-primary" onClick={() => showToast('Availability saved!', 'success')}>Save Availability</button>
                        </>
                    )}

                    {tab === 'security' && (
                        <>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Security Settings</h2>
                            <form onSubmit={handlePasswordUpdate}>
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input type="password" className="form-input" value={currentPassInput} onChange={e => setCurrentPassInput(e.target.value)} placeholder="Enter current password" />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input type="password" className="form-input" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Enter new password" />
                                        {/* Password strength indicator */}
                                        {newPass && (
                                            <div>
                                                <div className="pw-strength-bar">
                                                    <div className="pw-strength-fill" style={{ width: `${strength.pct}%`, background: strength.color }} />
                                                </div>
                                                <div style={{ fontSize: '0.72rem', marginTop: '0.25rem', color: strength.color, fontWeight: 600 }}>
                                                    {strength.label && <><i className={`fas fa-${strength.score >= 3 ? 'shield-alt' : 'exclamation-triangle'}`} style={{ marginRight: '0.25rem' }}></i>{strength.label}</> }
                                                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
                                                        {strength.score === 4 ? 'Strong password ✓' : 'Add uppercase, numbers & symbols'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm Password</label>
                                        <input type="password" className="form-input" placeholder="Re-enter new password" />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary">Update Password</button>
                            </form>
                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Two-Factor Authentication</h3>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p style={{ fontSize: '0.875rem' }}>Add an extra layer of security</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Currently disabled</p>
                                    </div>
                                    <button className="btn btn-outline btn-sm" onClick={() => showToast('2FA setup coming soon!', 'info')}>
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Active Sessions</h3>
                                <div style={{ fontSize: '0.85rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Current session</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Browser · localhost · Active now</div>
                                        </div>
                                        <span className="badge badge-success">Current</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {tab === 'appearance' && (
                        <>
                            <h2 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}}>Appearance</h2>
                            <div className="flex justify-between items-center" style={{padding: '1rem 0', borderBottom: '1px solid var(--color-border-light)'}}>
                                <div><div style={{fontWeight: 600, fontSize: '0.875rem'}}>Dark Mode</div><div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>Switch between light and dark theme</div></div>
                                <div className={`toggle ${darkMode ? 'active' : ''}`} onClick={toggleTheme}></div>
                            </div>
                            <div className="flex justify-between items-center" style={{padding: '1rem 0', borderBottom: '1px solid var(--color-border-light)'}}>
                                <div><div style={{fontWeight: 600, fontSize: '0.875rem'}}>Compact Mode</div><div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>Reduce spacing for denser layouts</div></div>
                                <div className="toggle" onClick={(e) => { e.currentTarget.classList.toggle('active'); showToast('Layout updated'); }}></div>
                            </div>
                            <div className="flex justify-between items-center" style={{padding: '1rem 0'}}>
                                <div><div style={{fontWeight: 600, fontSize: '0.875rem'}}>Animations</div><div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>Enable smooth transitions and effects</div></div>
                                <div className="toggle active" onClick={(e) => e.currentTarget.classList.toggle('active')}></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
