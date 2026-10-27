// Components.js

export function Badge(label, type = 'primary') {
    return `<span class="badge badge-${type}">${label}</span>`;
}

export function PriorityBadge(score) {
    let type = 'info';
    let text = 'Low';
    if (score >= 80) { type = 'danger'; text = 'Critical'; }
    else if (score >= 60) { type = 'accent'; text = 'High'; } // wait, no badge-accent in css, I will use warning
    else if (score >= 50) { type = 'warning'; text = 'Medium'; }

    // Fallbacks
    if (type === 'accent') type = 'warning';

    return `<span class="badge badge-${type}">${score} - ${text}</span>`;
}

export function StatWidget(title, value, icon, trend, color) {
    return `
        <div class="card interactive">
            <div class="flex items-center justify-between">
                <div>
                    <h3 style="color:var(--color-text-muted); font-size:0.875rem; font-weight:500;">${title}</h3>
                    <div style="font-size:2rem; font-weight:700; color:var(--color-text); margin-top:0.25rem;">${value}</div>
                </div>
                <div style="background:var(--color-${color}-light); color:var(--color-${color}); padding:1rem; border-radius:var(--radius-full);">
                    <i class="fas fa-${icon}"></i>
                </div>
            </div>
            ${trend ? `<div style="margin-top:1rem; font-size:0.875rem; color: ${trend > 0 ? 'var(--color-secondary)' : 'var(--color-danger)'};"><i class="fas fa-arrow-${trend > 0 ? 'up' : 'down'}"></i> ${Math.abs(trend)}% from last week</div>` : ''}
        </div>
    `;
}

export function Table(headers, rows) {
    const headHtml = headers.map(h => `<th>${h}</th>`).join('');
    const bodyHtml = rows.map(r => `<tr>${r.map(d => `<td>${d}</td>`).join('')}</tr>`).join('');

    return `
        <div class="table-container" style="overflow-x: auto;">
            <table class="data-table">
                <thead><tr>${headHtml}</tr></thead>
                <tbody>${bodyHtml}</tbody>
            </table>
        </div>
    `;
}
