import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

export function AppProvider({ children }) {
    // ── Auth ────────────────────────────────────────────────────────────────
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // On mount: read saved user from localStorage and validate with server
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!storedUser || !token) { 
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setAuthLoading(false); 
            return; 
        }
        try {
            const u = JSON.parse(storedUser);
            // Ping server to verify session is still valid (with 3s timeout)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            fetch(`${API_URL}/auth/me`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                signal: controller.signal
            })
                .then(res => {
                    clearTimeout(timeoutId);
                    if (res.ok) {
                        setUser(u); // server confirmed — keep user logged in
                    } else if (res.status === 401 || res.status === 403) {
                        localStorage.removeItem('user'); // server rejected token
                        localStorage.removeItem('token');
                    } else {
                        setUser(u); // server error or offline — keep stored user optimistically
                    }
                })
                .catch(() => {
                    clearTimeout(timeoutId);
                    // Server unreachable — keep user optimistically in demo mode
                    setUser(u);
                })
                .finally(() => setAuthLoading(false));
        } catch {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setAuthLoading(false);
        }
    }, []);

    const register = async (name, email, password, role = 'volunteer') => {
        const cleanEmail = (email || '').toLowerCase().trim();
        const newUser = {
            id: Date.now(),
            name,
            email: cleanEmail,
            password,
            role,
        };

        // Attempt backend registration if reachable
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email: cleanEmail, password, role }),
                signal: controller.signal,
            }).catch(() => null);
            clearTimeout(timeoutId);

            if (res && res.ok) {
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('token', data.token || ('user-token-' + Date.now()));
                    return data.user;
                }
            }
        } catch { }

        // Local storage fallback for newly registered accounts
        const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const updatedUsers = [...storedUsers.filter(u => u.email !== cleanEmail), newUser];
        localStorage.setItem('registered_users', JSON.stringify(updatedUsers));

        const { password: _pw, ...safeUser } = newUser;
        const fakeToken = 'user-token-' + Date.now();
        setUser(safeUser);
        localStorage.setItem('user', JSON.stringify(safeUser));
        localStorage.setItem('token', fakeToken);
        return safeUser;
    };

    const login = async (email, pass) => {
        const cleanEmail = (email || '').toLowerCase().trim();
        const demoUsers = {
            'admin@ngo.org': { id: 1, name: 'Admin Aditya', email: 'admin@ngo.org', role: 'admin' },
            'john@vol.org': { id: 2, name: 'Volunteer John', email: 'john@vol.org', role: 'volunteer' },
            'mike@field.org': { id: 3, name: 'Field Worker Mike', email: 'mike@field.org', role: 'field_worker' },
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password: pass }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if (res.status === 401) {
                    throw new Error(errData.error || 'Invalid email or password');
                }
                throw new Error(errData.error || `Server error (${res.status})`);
            }
            
            const data = await res.json(); // { token, user }
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            return data.user;
        } catch (err) {
            clearTimeout(timeoutId);

            // Check demo accounts
            const demoUser = demoUsers[cleanEmail];
            if (demoUser && (pass === 'password' || !pass || err.name === 'AbortError' || err.name === 'TypeError' || err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed'))) {
                const fakeToken = 'demo-token-' + Date.now();
                setUser(demoUser);
                localStorage.setItem('user', JSON.stringify(demoUser));
                localStorage.setItem('token', fakeToken);
                return demoUser;
            }

            // Check custom registered users from localStorage
            const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
            const customUser = storedUsers.find(u => u.email.toLowerCase().trim() === cleanEmail);
            if (customUser && (customUser.password === pass || !pass || err.name === 'AbortError' || err.name === 'TypeError' || err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed'))) {
                const { password: _pw, ...safeUser } = customUser;
                const fakeToken = 'user-token-' + Date.now();
                setUser(safeUser);
                localStorage.setItem('user', JSON.stringify(safeUser));
                localStorage.setItem('token', fakeToken);
                return safeUser;
            }

            if (err.message === 'Invalid email or password') {
                throw err;
            }

            // Fallback for network unreachable error
            throw new Error("Network error: Cannot reach backend server. Please verify VITE_BACKEND_URL in Vercel settings or use a demo account.");
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }, []);

    // ── Theme ────────────────────────────────────────────────────────────────
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const toggleTheme = useCallback(() => setDarkMode(prev => !prev), []);

    // ── Sidebar ──────────────────────────────────────────────────────────────
    // sidebarToggled:
    //   • Desktop (>768px) → true = COLLAPSED (narrow icon-only sidebar)
    //   • Mobile  (≤768px) → true = OPEN      (full sidebar slides in from left)
    const [sidebarToggled, setSidebarToggled] = useState(false);
    const toggleSidebar = useCallback(() => setSidebarToggled(prev => !prev), []);
    const closeMobileSidebar = useCallback(() => setSidebarToggled(false), []);

    // ── Toasts ───────────────────────────────────────────────────────────────
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <AppContext.Provider value={{
            user, login, register, logout, authLoading,
            darkMode, toggleTheme,
            sidebarToggled, toggleSidebar, closeMobileSidebar,
            showToast,
        }}>
            {children}

            {/* Toast Notifications */}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type}`} onClick={() => dismissToast(t.id)}>
                        <i className={`fas fa-${t.type === 'success' ? 'check-circle' : t.type === 'error' ? 'exclamation-circle' : t.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}`}></i>
                        <span>{t.message}</span>
                        <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.75rem', color: 'inherit' }}>✕</button>
                    </div>
                ))}
            </div>
        </AppContext.Provider>
    );
}
