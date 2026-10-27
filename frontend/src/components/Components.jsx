import { useApp } from '../context.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

// ─── Stat Widget ──────────────────────────────────────────────────────────────
export function StatWidget({ title, value, icon, trend, color }) {
    return (
        <div className="card interactive fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.25rem' }}>{value}</div>
                </div>
                <div style={{ background: `var(--color-${color}-light)`, color: `var(--color-${color})`, padding: '0.875rem', borderRadius: 'var(--radius-xl)', fontSize: '1.1rem' }}>
                    <i className={`fas fa-${icon}`}></i>
                </div>
            </div>
            {trend && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: trend > 0 ? 'var(--color-secondary)' : 'var(--color-danger)' }}>
                    <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'}`}></i> {Math.abs(trend)}% from last week
                </div>
            )}
        </div>
    );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
export function PriorityBadge({ score }) {
    let type = 'info', text = 'Low';
    if (score >= 80) { type = 'danger'; text = 'Critical'; }
    else if (score >= 60) { type = 'warning'; text = 'High'; }
    else if (score >= 40) { type = 'info'; text = 'Medium'; }
    return <span className={`badge badge-${type}`}>{score} · {text}</span>;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar() {
    const { user, closeMobileSidebar } = useApp();
    const loc = useLocation();
    const role = user?.role;
    const isActive = (p) => loc.pathname === p ? 'active' : '';

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-header">
                <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '10px', padding: '0.4rem', color: 'white', fontSize: '1rem', flexShrink: 0 }}>
                    <i className="fas fa-hands-helping"></i>
                </div>
                <h2>Volentra</h2>
            </div>

            {/* Nav Links */}
            <nav className="sidebar-nav" onClick={closeMobileSidebar}>
                {role === 'admin' && (<>
                    <div className="sidebar-section-title">Overview</div>
                    <a href="/admin" className={`sidebar-link ${isActive('/admin')}`}><i className="fas fa-chart-pie"></i><span>Dashboard</span></a>
                    <a href="/admin/analytics" className={`sidebar-link ${isActive('/admin/analytics')}`}><i className="fas fa-chart-bar"></i><span>Analytics</span></a>
                    <div className="sidebar-section-title">Management</div>
                    <a href="/admin/tasks" className={`sidebar-link ${isActive('/admin/tasks')}`}><i className="fas fa-columns"></i><span>Task Board</span></a>
                    <a href="/admin/volunteers" className={`sidebar-link ${isActive('/admin/volunteers')}`}><i className="fas fa-users"></i><span>Volunteers</span></a>
                    <div className="sidebar-section-title">System</div>
                    <a href="/admin/settings" className={`sidebar-link ${isActive('/admin/settings')}`}><i className="fas fa-cog"></i><span>Settings</span></a>
                </>)}
                {role === 'volunteer' && (<>
                    <div className="sidebar-section-title">Volunteer</div>
                    <a href="/volunteer" className={`sidebar-link ${isActive('/volunteer')}`}><i className="fas fa-home"></i><span>My Dashboard</span></a>
                    <a href="/admin/settings" className={`sidebar-link ${isActive('/admin/settings')}`}><i className="fas fa-cog"></i><span>Settings</span></a>
                </>)}
                {role === 'field_worker' && (<>
                    <div className="sidebar-section-title">Field Worker</div>
                    <a href="/fieldworker" className={`sidebar-link ${isActive('/fieldworker')}`}><i className="fas fa-plus-circle"></i><span>Submit Report</span></a>
                    <a href="/admin/settings" className={`sidebar-link ${isActive('/admin/settings')}`}><i className="fas fa-cog"></i><span>Settings</span></a>
                </>)}
            </nav>

            {/* Bottom user card */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-sm" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', flexShrink: 0 }}>
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
    const { user, logout, showToast, darkMode, toggleTheme, toggleSidebar } = useApp();
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'G';
    const navigate = useNavigate();

    const closeAll = () => { setNotifOpen(false); setProfileOpen(false); };

    return (
        <header className="navbar">
            <div className="navbar-left">
                {/* Hamburger — works for both desktop collapse and mobile drawer */}
                <button
                    id="sidebar-toggle-btn"
                    className="btn btn-icon btn-outline"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <i className="fas fa-bars"></i>
                </button>
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search volunteers, reports, tasks…" aria-label="Search" />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme toggle */}
                <button className="btn btn-icon btn-outline" onClick={toggleTheme} aria-label="Toggle theme">
                    <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
                </button>

                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button className="btn btn-icon btn-outline" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} aria-label="Notifications">
                        <i className="fas fa-bell"></i>
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--color-danger)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</span>
                    </button>
                    {notifOpen && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={closeAll} />
                            <div className="pop-in" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--color-surface)', width: '320px', boxShadow: 'var(--shadow-xl)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', zIndex: 100, overflow: 'hidden' }}>
                                <div style={{ padding: '1rem', fontWeight: 700, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Notifications</span>
                                    <span style={{ background: 'var(--color-danger)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>3 new</span>
                                </div>
                                {[
                                    { t: 'New Urgent Report', d: 'Report #522 submitted · 2m ago', c: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
                                    { t: 'Task Completed', d: 'Task #1003 finished by John · 1h ago', c: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
                                    { t: 'Volunteer Joined', d: 'Aditya accepted Task #512 · 3h ago', c: 'var(--color-info)', bg: 'var(--color-info-light)' },
                                ].map((n, i) => (
                                    <div key={i} className="flex gap-3 items-start" style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: n.bg, color: n.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>
                                            <i className="fas fa-bell"></i>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{n.t}</div>
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: '0.1rem' }}>{n.d}</div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full" style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}
                                    onClick={() => { closeAll(); showToast('All notifications marked as read', 'success'); }}>
                                    Mark all as read
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Profile dropdown */}
                <div style={{ position: 'relative' }}>
                    <button className="flex items-center gap-2" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>{initials}</div>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{user?.name?.split(' ')[0]}</span>
                        <i className="fas fa-chevron-down" style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}></i>
                    </button>
                    {profileOpen && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={closeAll} />
                            <div className="pop-in" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--color-surface)', width: '210px', boxShadow: 'var(--shadow-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', zIndex: 100, overflow: 'hidden' }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{user?.email}</div>
                                    <span className="badge badge-primary" style={{ marginTop: '0.375rem', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</span>
                                </div>
                                {[
                                    { label: 'Profile', icon: 'fa-user', href: '/admin/settings' },
                                    { label: 'Settings', icon: 'fa-cog', href: '/admin/settings' },
                                ].map(item => (
                                    <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', fontSize: '0.8rem', color: 'var(--color-text)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        onClick={closeAll}>
                                        <i className={`fas ${item.icon}`} style={{ width: '14px', color: 'var(--color-text-muted)' }}></i> {item.label}
                                    </a>
                                ))}
                                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <button onClick={() => { logout(); navigate('/login'); closeAll(); }}
                                        style={{ width: '100%', textAlign: 'left', padding: '0.625rem 1rem', fontSize: '0.8rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-sign-out-alt" style={{ width: '14px' }}></i> Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
