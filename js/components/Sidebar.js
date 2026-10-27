import { store } from '../store/store.js';

export default function Sidebar() {
    const user = store.getState().user;
    const role = user ? user.role : '';
    const path = window.location.hash.replace('#', '') || '/';

    const getLink = (href, icon, label) => {
        const isActive = path === href ? 'active' : '';
        return `
            <a href="#${href}" class="sidebar-link ${isActive}">
                <i class="fas fa-${icon}"></i>
                <span>${label}</span>
            </a>
        `;
    };

    let links = '';
    if (role === 'admin') {
        links = `
            ${getLink('/admin', 'chart-pie', 'Dashboard')}
            ${getLink('/admin/volunteers', 'users', 'Volunteers')}
            ${getLink('/admin/reports', 'file-alt', 'Reports (Demo)')}
            ${getLink('/admin/settings', 'cog', 'Settings')}
        `;
    } else if (role === 'volunteer') {
        links = `
            ${getLink('/volunteer', 'home', 'My Dashboard')}
        `;
    } else if (role === 'field_worker') {
        links = `
            ${getLink('/fieldworker', 'plus-circle', 'Submit Report')}
        `;
    }

    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <i class="fas fa-hands-helping" style="color:var(--color-primary); font-size:1.5rem;"></i>
                <h2>Volentra</h2>
            </div>
            <nav class="sidebar-nav">
                ${links}
            </nav>
        </aside>
    `;
}
