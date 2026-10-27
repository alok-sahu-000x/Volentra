import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

function CountUp({ end, duration = 2000, suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                let start = 0;
                const step = end / (duration / 16);
                const timer = setInterval(() => {
                    start += step;
                    if (start >= end) { setCount(end); clearInterval(timer); }
                    else setCount(Math.floor(start));
                }, 16);
                observer.disconnect();
            }
        });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Landing() {
    const navigate = useNavigate();
    const features = [
        { icon: 'fa-rocket', title: 'Smart Prioritization', desc: 'AI-powered scoring ranks urgent needs instantly using urgency, population, and time factors.', color: '#4f46e5' },
        { icon: 'fa-users-cog', title: 'Intelligent Matching', desc: 'Match the right volunteers based on skills, proximity, availability, and experience.', color: '#059669' },
        { icon: 'fa-chart-line', title: 'Real-time Analytics', desc: 'Interactive dashboards with heatmaps, trend charts, and operational insights.', color: '#ea580c' },
        { icon: 'fa-map-marked-alt', title: 'Geo-Location Tracking', desc: 'Haversine-formula proximity matching and interactive community need mapping.', color: '#7c3aed' },
        { icon: 'fa-tasks', title: 'Kanban Task Board', desc: 'Visual drag-and-drop task management from assignment through completion.', color: '#0891b2' },
        { icon: 'fa-bell', title: 'Live Notifications', desc: 'Instant alerts for new reports, assignments, and task completions.', color: '#dc2626' },
    ];
    const steps = [
        { num: '01', title: 'Report', desc: 'Field workers submit community incident reports with location, urgency, and details.' },
        { num: '02', title: 'Prioritize', desc: 'Our scoring engine calculates priority using urgency, affected population, and time pending.' },
        { num: '03', title: 'Match', desc: 'The platform recommends optimal volunteers based on skills, distance, and availability.' },
        { num: '04', title: 'Resolve', desc: 'Volunteers accept tasks, complete assignments, and impact metrics are tracked in real-time.' },
    ];
    const testimonials = [
        { name: 'Aditya Chen', role: 'Director, HopeAid Foundation', text: 'Volentra reduced our volunteer deployment time by 60%. The priority scoring is a game-changer for our disaster response.', avatar: 'SC' },
        { name: 'Marcus Rivera', role: 'Program Manager, CityReach', text: 'The analytics dashboard gives us insights we never had before. We can now predict community needs before they become crises.', avatar: 'MR' },
        { name: 'Dr. Aisha Patel', role: 'CEO, GlobalVolunteer Network', text: 'The matching engine consistently assigns the best-fit volunteers. Our task completion rate improved from 72% to 94%.', avatar: 'AP' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', overflow: 'hidden' }}>
            {/* Nav */}
            <nav style={{ padding: '1rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '12px', padding: '0.5rem', color: 'white' }}><i className="fas fa-hands-helping"></i></div>
                    <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Volentra</span>
                </div>
                <div className="flex gap-4 items-center">
                    <a href="#features" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Features</a>
                    <a href="#how" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>How It Works</a>
                    <button className="btn btn-outline" onClick={() => navigate('/login')}>Log In</button>
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: '6rem 4rem 4rem', textAlign: 'center', background: 'linear-gradient(180deg, var(--color-primary-50) 0%, var(--color-bg) 100%)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(5,150,105,0.1) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite 1s' }}></div>
                <div className="fade-in-up" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <span className="badge badge-primary" style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>🚀 Data-Driven Volunteer Coordination</span>
                    <h1 style={{ fontSize: '3.75rem', marginBottom: '1.5rem', lineHeight: 1.1, fontWeight: 800 }}>
                        Transform Community Data Into <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Actionable Volunteer Deployment</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Collect issue reports, prioritize urgent needs, match volunteers intelligently, and track social impact — all in one platform.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button className="btn btn-primary btn-lg" style={{ animation: 'pulse-glow 2s infinite' }} onClick={() => navigate('/register')}>
                            Get Started Free <i className="fas fa-arrow-right"></i>
                        </button>
                        <button className="btn btn-outline btn-lg" style={{ background: 'white' }} onClick={() => window.open('https://youtu.be/TRakgNzc9pA', '_blank')}>
                            <i className="fas fa-play-circle"></i> Watch Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section style={{ padding: '3rem 4rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', maxWidth: '1000px', margin: '-2rem auto 0' }}>
                {[{ n: 12000, s: '+', l: 'Volunteers' }, { n: 850, s: '+', l: 'NGOs' }, { n: 45000, s: '+', l: 'Tasks Completed' }, { n: 98, s: '%', l: 'Satisfaction' }].map((s, i) => (
                    <div key={i} className="card text-center interactive" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}><CountUp end={s.n} suffix={s.s} /></div>
                        <div style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>{s.l}</div>
                    </div>
                ))}
            </section>

            {/* Features */}
            <section id="features" style={{ padding: '5rem 4rem' }}>
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Features</span>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Everything You Need for Impact</h2>
                    <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>Powerful tools designed specifically for NGO operations and volunteer coordination.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
                    {features.map((f, i) => (
                        <div key={i} className="card interactive" style={{ padding: '2rem', animationDelay: `${i * 0.1}s` }}>
                            <div style={{ width: '50px', height: '50px', background: `${f.color}15`, color: f.color, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '1rem' }}>
                                <i className={`fas ${f.icon}`}></i>
                            </div>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id="how" style={{ padding: '5rem 4rem', background: 'var(--color-surface)' }}>
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <span className="badge badge-success" style={{ marginBottom: '1rem' }}>Process</span>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>How It Works</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                    {steps.map((s, i) => (
                        <div key={i} className="text-center fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, margin: '0 auto 1rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>{s.num}</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{s.title}</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '5rem 4rem' }}>
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <span className="badge badge-warning" style={{ marginBottom: '1rem' }}>Testimonials</span>
                    <h2 style={{ fontSize: '2.5rem' }}>Trusted by Impact Leaders</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
                    {testimonials.map((t, i) => (
                        <div key={i} className="card hover-lift" style={{ padding: '2rem' }}>
                            <div style={{ color: 'var(--color-warning)', marginBottom: '1rem' }}>{'★'.repeat(5)}</div>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="avatar" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>{t.avatar}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '3rem 4rem', textAlign: 'center', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="flex items-center justify-center gap-2" style={{ marginBottom: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '8px', padding: '0.35rem', color: 'white', fontSize: '0.8rem' }}><i className="fas fa-hands-helping"></i></div>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Volentra</span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>© 2026 Smart Resource Allocation. Built for social impact.</p>
            </footer>
        </div>
    );
}
