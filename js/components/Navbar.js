import { store } from '../store/store.js';

export default function Navbar() {
    const user = store.getState().user;
    const userName = user ? user.name : 'Guest';
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

    return `
        <header class="navbar flex items-center justify-between">
            <div class="navbar-left">
                <button class="menu-toggle btn btn-outline" onclick="document.body.classList.toggle('sidebar-collapsed')">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="search-bar hidden md-flex">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search everywhere..." class="form-input" style="border:none; box-shadow:none; background:transparent;">
                </div>
            </div>
            <div class="navbar-right flex items-center gap-4">
                
                <div style="position:relative;">
                    <button class="btn btn-outline" style="border-radius: 50%; padding: 0.5rem 0.6rem;" onclick="document.getElementById('notif-dropdown').classList.toggle('hidden')">
                        <i class="fas fa-bell"></i>
                        <span style="position:absolute; top:-2px; right:-2px; background:var(--color-accent); color:white; border-radius:50%; width:18px; height:18px; font-size:10px; display:flex; align-items:center; justify-content:center;">3</span>
                    </button>
                    <!-- Dropdown Content -->
                    <div id="notif-dropdown" class="hidden fade-in" style="position:absolute; top:120%; right:0; background:white; width:280px; box-shadow:var(--shadow-lg); border-radius:var(--radius-md); border:1px solid var(--color-border); z-index:100;">
                        <div style="padding:1rem; border-bottom:1px solid var(--color-border); font-weight:600;">Notifications</div>
                        <div style="padding:1rem; font-size:0.875rem; border-bottom:1px solid var(--color-border); background:var(--color-info-light);">
                            <strong>New Urgent Report</strong><br>
                            <span style="color:var(--color-text-muted);">Report #522 has been submitted.<br>2 mins ago</span>
                        </div>
                        <div style="padding:1rem; font-size:0.875rem; border-bottom:1px solid var(--color-border);">
                            <strong>Task Completed</strong><br>
                            <span style="color:var(--color-text-muted);">Task #1003 finished by John.<br>1 hour ago</span>
                        </div>
                        <button class="w-full text-center hover-bg-light" style="padding:0.75rem; font-size:0.875rem; color:var(--color-primary); font-weight:500;" onclick="this.parentElement.classList.add('hidden'); window.showToast('All marked as read')">Mark all as read</button>
                    </div>
                </div>

                <div class="user-profile flex items-center gap-2">
                    <div class="avatar" style="width:36px; height:36px; border-radius:50%; background:var(--color-primary-light); color:var(--color-primary); display:flex; align-items:center; justify-content:center; font-weight:bold;">
                        ${initials}
                    </div>
                    <div class="user-info hidden sm-block text-sm">
                        <div style="font-weight:600;">${userName}</div>
                        <div style="font-size:0.75rem; color:var(--color-text-muted);">${user ? user.role : ''}</div>
                    </div>
                </div>
                <button class="btn btn-outline text-danger" onclick="import('./services/api.js').then(m => m.api.logout())" title="Logout">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </header>
    `;
}
