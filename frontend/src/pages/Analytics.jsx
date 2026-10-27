import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Tooltip } from '../components/Tooltip.jsx';
import MapView from '../components/MapView.jsx';
import Chart from 'chart.js/auto';

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [tasks, setTasks] = useState([]);
    const chartRefs = useRef({});

    useEffect(() => {
        Promise.all([api.getStats(), api.getReports(), api.getTasks()]).then(([s, r, t]) => {
            setStats(s); setReports(r); setTasks(t);
        });
    }, []);

    useEffect(() => {
        if (!stats) return;
        const destroy = (key) => { if (chartRefs.current[key]) chartRefs.current[key].destroy(); };

        const el1 = document.getElementById('responseChart');
        if (el1) {
            destroy('responseChart');
            chartRefs.current.responseChart = new Chart(el1, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                    datasets: [{
                        label: 'Avg Response (hrs)', data: [48, 36, 28, 22, 18, 14],
                        borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.1)',
                        fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#4f46e5',
                    }],
                },
                options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } } },
            });
        }

        const el2 = document.getElementById('categoryBar');
        if (el2) {
            destroy('categoryBar');
            chartRefs.current.categoryBar = new Chart(el2, {
                type: 'bar',
                data: {
                    labels: ['Medical', 'Food', 'Infrastructure', 'Water', 'Shelter', 'Logistics'],
                    datasets: [{
                        label: 'Reports', data: [35, 22, 18, 15, 12, 8],
                        backgroundColor: ['#dc2626', '#f59e0b', '#4f46e5', '#0891b2', '#7c3aed', '#059669'],
                        borderRadius: 6,
                    }],
                },
                options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } } },
            });
        }

        const el3 = document.getElementById('completionPie');
        if (el3) {
            destroy('completionPie');
            chartRefs.current.completionPie = new Chart(el3, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress', 'Pending'],
                    datasets: [{
                        data: [stats.completedTasks, tasks.filter(t => t.status === 'In Progress').length, stats.pendingReports],
                        backgroundColor: ['#059669', '#4f46e5', '#f59e0b'], borderWidth: 0,
                    }],
                },
                options: { maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } },
            });
        }

        const el4 = document.getElementById('monthlyImpact');
        if (el4) {
            destroy('monthlyImpact');
            chartRefs.current.monthlyImpact = new Chart(el4, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        { label: 'Tasks', data: [120, 150, 180, 220, 280, 310], backgroundColor: 'rgba(79,70,229,0.8)', borderRadius: 6 },
                        { label: 'Volunteers', data: [45, 52, 60, 72, 85, 95], backgroundColor: 'rgba(5,150,105,0.8)', borderRadius: 6 },
                    ],
                },
                options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
            });
        }

        return () => Object.values(chartRefs.current).forEach(c => c && c.destroy());
    }, [stats, tasks]);

    if (!stats) return (
        <div>
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-xl)' }} />)}
            </div>
            <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem' }} />
        </div>
    );

    const insights = [
        { icon: 'fa-brain', color: '#7c3aed', title: 'Predictive Need Forecast', desc: 'Medical emergencies expected to increase 15% next week based on seasonal data and historical trends.' },
        { icon: 'fa-exclamation-triangle', color: '#f59e0b', title: 'Bottleneck Detection', desc: 'Water Supply tasks have avg 36hr response time — 2.5x slower than Medical. Recruit 3 more water specialists.' },
        { icon: 'fa-lightbulb', color: '#059669', title: 'AI Recommendation', desc: 'Redistributing 3 idle volunteers from Sector 2 to Sector 7 could reduce pending queue by 40%.' },
    ];

    const categories = {};
    reports.forEach(r => { categories[r.issueType] = (categories[r.issueType] || 0) + 1; });
    const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    const catColors = { Medical: '#dc2626', 'Food Shortage': '#f59e0b', Infrastructure: '#4f46e5', 'Water Supply': '#0891b2', Shelter: '#7c3aed', Logistics: '#059669' };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Analytics Dashboard</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Operational intelligence and impact metrics</p>
                </div>
                <button className="btn btn-outline"><i className="fas fa-download"></i> Export PDF</button>
            </div>

            {/* AI Insight Cards */}
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                {insights.map((ins, i) => (
                    <div key={i} className="card fade-in hover-lift" style={{ animationDelay: `${i * 0.1}s`, borderLeft: `4px solid ${ins.color}` }}>
                        <div className="flex gap-3 items-start">
                            <Tooltip text={ins.desc} position="bottom" maxWidth="260px">
                                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: `${ins.color}15`, color: ins.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'help' }}>
                                    <i className={`fas ${ins.icon}`}></i>
                                </div>
                            </Tooltip>
                            <div>
                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{ins.title}</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{ins.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Leaflet Heatmap (replaces CSS heatmap) */}
            <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                        <i className="fas fa-fire" style={{ color: '#dc2626', marginRight: '0.5rem' }}></i>
                        Community Needs Heatmap — {reports.length} reports mapped
                    </h3>
                    <div className="flex gap-3" style={{ fontSize: '0.7rem' }}>
                        {[{ l: 'Critical', c: '#dc2626' }, { l: 'High', c: '#f59e0b' }, { l: 'Medium', c: '#3b82f6' }, { l: 'Low', c: '#059669' }].map(x => (
                            <Tooltip key={x.l} text={`Score: ${x.l === 'Critical' ? '≥80' : x.l === 'High' ? '60–79' : x.l === 'Medium' ? '40–59' : '<40'}`}>
                                <span className="flex items-center gap-1" style={{ cursor: 'help' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: x.c, display: 'inline-block' }}></span>
                                    {x.l}
                                </span>
                            </Tooltip>
                        ))}
                    </div>
                </div>
                <MapView reports={reports} height="280px" />
            </div>

            {/* Charts Grid */}
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                <div className="card fade-in">
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                        <i className="fas fa-chart-line" style={{ color: 'var(--color-primary)', marginRight: '0.5rem' }}></i>
                        Response Time Trends
                    </h3>
                    <div style={{ height: '250px' }}><canvas id="responseChart"></canvas></div>
                </div>
                <div className="card fade-in">
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                        <i className="fas fa-chart-bar" style={{ color: 'var(--color-accent)', marginRight: '0.5rem' }}></i>
                        Top Issue Categories
                    </h3>
                    <div style={{ height: '250px' }}><canvas id="categoryBar"></canvas></div>
                </div>
            </div>
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                <div className="card fade-in">
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                        <i className="fas fa-chart-pie" style={{ color: 'var(--color-secondary)', marginRight: '0.5rem' }}></i>
                        Task Completion Rates
                    </h3>
                    <div style={{ height: '250px' }}><canvas id="completionPie"></canvas></div>
                </div>
                <div className="card fade-in">
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                        <i className="fas fa-chart-area" style={{ color: 'var(--color-info)', marginRight: '0.5rem' }}></i>
                        Monthly Impact Metrics
                    </h3>
                    <div style={{ height: '250px' }}><canvas id="monthlyImpact"></canvas></div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="card fade-in">
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                    <i className="fas fa-list-ol" style={{ color: 'var(--color-primary)', marginRight: '0.5rem' }}></i>
                    Issue Category Breakdown
                </h3>
                <div className="flex-col gap-3">
                    {topCategories.map(([cat, count]) => {
                        const pct = Math.round((count / reports.length) * 100);
                        return (
                            <div key={cat}>
                                <div className="flex justify-between" style={{ marginBottom: '0.375rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cat}</span>
                                    <Tooltip text={`${count} reports out of ${reports.length} total (${pct}%)`} position="left">
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: catColors[cat] || 'var(--color-text-muted)', cursor: 'help' }}>
                                            {count} reports ({pct}%)
                                        </span>
                                    </Tooltip>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${pct}%`, background: catColors[cat] || 'var(--color-primary)' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
