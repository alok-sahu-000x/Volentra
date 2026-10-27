import { store } from './store/store.js';
import { api } from './services/api.js';

// Pages
import HomePage from './pages/landing.js';
import LoginPage from './pages/login.js';
import AdminDashboard from './pages/adminDashboard.js';
import VolunteerDashboard from './pages/volunteerDashboard.js';
import FieldWorkerPortal from './pages/fieldWorkerPortal.js';
import VolunteerManagement from './pages/volunteerManagement.js';

// Components
import Navbar from './components/Navbar.js';
import Sidebar from './components/Sidebar.js';

class Router {
    constructor() {
        this.routes = {
            '/': HomePage,
            '/login': LoginPage,
            '/admin': AdminDashboard,
            '/admin/volunteers': VolunteerManagement,
            '/volunteer': VolunteerDashboard,
            '/fieldworker': FieldWorkerPortal,
        };
        
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        window.navigate = this.navigate.bind(this);
    }

    navigate(path) {
        window.location.hash = path;
    }

    async handleRoute() {
        const path = window.location.hash.replace('#', '') || '/';
        const root = document.getElementById('root');
        
        const user = store.getState().user;
        const protectedRoutes = ['/admin', '/admin/volunteers', '/volunteer', '/fieldworker'];
        
        if (protectedRoutes.includes(path) && !user) {
            this.navigate('/login');
            return;
        }

        let content = '';
        
        if (protectedRoutes.includes(path)) {
            content = `
                <div class="app-container">
                    ${Sidebar()}
                    <div class="main-content">
                        ${Navbar()}
                        <div id="page-content" class="page-container">
                            <div class="animate-pulse">Loading...</div>
                        </div>
                    </div>
                </div>
            `;
            root.innerHTML = content;
            
            const Page = this.routes[path] || this.routes['/'];
            try {
                const pageContent = await Page.render();
                document.getElementById('page-content').innerHTML = pageContent;
                if (Page.afterRender) Page.afterRender();
            } catch (err) {
                console.error(err);
                document.getElementById('page-content').innerHTML = `
                    <div class="card"><h2 class="text-danger">Error rendering page</h2><p>${err.message}</p></div>
                `;
            }
        } else {
            const Page = this.routes[path] || this.routes['/'];
            try {
                root.innerHTML = await Page.render();
                if (Page.afterRender) Page.afterRender();
            } catch (err) {
                root.innerHTML = `<div>Error rendering page: ${err.message}</div>`;
            }
        }
    }
}

window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

async function initApp() {
    try {
        await api.initSeedData();
    } catch (e) {
        console.warn("API Init Failed", e);
    }
    
    const router = new Router();
    router.handleRoute(); // Trigger first render
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
