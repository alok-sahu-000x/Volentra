export default {
    async render() {
        return `
            <div style="min-height: 100vh; display: flex; flex-direction: column;">
                <nav style="padding: 1.5rem 4rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); background: var(--color-surface);">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary); display:flex; align-items:center; gap: 0.5rem;">
                        <i class="fas fa-hands-helping"></i> Volentra
                    </div>
                    <button class="btn btn-primary" onclick="window.navigate('/login')">Log In</button>
                </nav>
                <main style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 4rem; text-align: center; background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-primary-light) 100%);">
                    <div style="max-width: 800px;">
                        <h1 style="font-size: 3.5rem; margin-bottom: 1.5rem; color: var(--color-text);">Data-Driven Coordination</h1>
                        <p style="font-size: 1.25rem; color: var(--color-text-muted); margin-bottom: 2.5rem;">Connect field workers with ready volunteers instantly.</p>
                        <button class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.125rem;" onclick="window.navigate('/login')">Go to Dashboard <i class="fas fa-arrow-right"></i></button>
                    </div>
                </main>
            </div>
        `;
    }
};
