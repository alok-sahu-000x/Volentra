import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useApp } from './context.jsx';
import { Navbar, Sidebar } from './components/Components.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import VolunteerManagement from './pages/VolunteerManagement.jsx';
import VolunteerDashboard from './pages/VolunteerDashboard.jsx';
import FieldWorkerPortal from './pages/FieldWorkerPortal.jsx';
import TaskManagement from './pages/TaskManagement.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';

// Full-screen loading spinner while validating saved session
function AppLoader() {
    return (
        <div style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '1rem',
            background: 'var(--color-bg)', zIndex: 9999,
        }}>
            <div style={{
                width: '48px', height: '48px',
                border: '4px solid var(--color-border)',
                borderTop: '4px solid var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
                Verifying session…
            </p>
        </div>
    );
}

const ProtectedRoute = () => {
    const { user, authLoading } = useApp();
    if (authLoading) return <AppLoader />;
    if (!user) return <Navigate to="/login" replace />;
    return <AppShell />;
};

function AppShell() {
    const { sidebarToggled, closeMobileSidebar } = useApp();
    return (
        <div className={`app-container ${sidebarToggled ? 'sidebar-toggled' : ''}`}>
            <Sidebar />
            {/* Mobile backdrop overlay - closes sidebar when tapped */}
            <div className="sidebar-overlay" onClick={closeMobileSidebar} />
            <div className="main-content">
                <Navbar />
                <div className="page-container"><Outlet /></div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/volunteers" element={<VolunteerManagement />} />
                <Route path="/admin/tasks" element={<TaskManagement />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/volunteer" element={<VolunteerDashboard />} />
                <Route path="/fieldworker" element={<FieldWorkerPortal />} />
            </Route>
        </Routes>
    );
}
