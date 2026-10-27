import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import { useApp } from '../context.jsx';
import MapView from '../components/MapView.jsx';

export default function FieldWorkerPortal() {
    const { showToast } = useApp();
    const fileInputRef = useRef(null);

    // Form state
    const [urgency, setUrgency] = useState(() => JSON.parse(localStorage.getItem('reportDraft') || '{}').urgency || 5);
    const [people, setPeople] = useState(() => JSON.parse(localStorage.getItem('reportDraft') || '{}').people || 10);
    const [selectedLocation, setSelectedLocation] = useState(null); // {lat, lng}
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(null); // holds submitted report
    const [draftSaved, setDraftSaved] = useState(false);

    // ── Auto-save draft every 2s ─────────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => {
            const form = document.getElementById('reportForm');
            if (!form) return;
            const draft = {
                issueType: form.issueType?.value || '',
                description: form.description?.value || '',
                urgency,
                people,
            };
            localStorage.setItem('reportDraft', JSON.stringify(draft));
            setDraftSaved(true);
            setTimeout(() => setDraftSaved(false), 1200);
        }, 2000);
        return () => clearInterval(timer);
    }, [urgency, people]);

    // ── Live priority score ──────────────────────────────────────────────────
    const priorityScore = Math.round(
        ((urgency / 10) * 100 * 0.5) +
        (Math.min((people / 1000) * 100, 100) * 0.3) +
        (20 * 0.2)
    );
    const getPriorityLabel = (s) => s >= 80 ? 'Critical' : s >= 60 ? 'High' : s >= 40 ? 'Medium' : 'Low';
    const getPriorityColor = (s) => s >= 80 ? 'var(--color-danger)' : s >= 60 ? 'var(--color-warning)' : s >= 40 ? 'var(--color-info)' : 'var(--color-secondary)';

    // ── Image handling ───────────────────────────────────────────────────────
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { showToast('Image must be under 10 MB', 'error'); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        showToast(`📎 Image attached: ${file.name}`, 'success');
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Map GPS picker ───────────────────────────────────────────────────────
    const handleLocationSelect = useCallback((latlng) => {
        setSelectedLocation({ lat: latlng.lat, lng: latlng.lng });
    }, []);

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('issueType', e.target.issueType.value);
        formData.append('description', e.target.description.value);
        formData.append('urgency', urgency);
        formData.append('peopleAffected', people);
        formData.append('latitude', selectedLocation?.lat ?? 34.0522);
        formData.append('longitude', selectedLocation?.lng ?? -118.2437);
        if (imageFile) formData.append('image', imageFile);

        try {
            const result = await api.submitReport(formData);
            localStorage.removeItem('reportDraft');
            setSubmitted(result);
            showToast('✅ Incident report submitted!', 'success');
        } catch {
            showToast('Failed to submit report. Check server connection.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── Success screen ───────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="card text-center fade-in" style={{ maxWidth: '460px', padding: '3rem' }}>
                    <div style={{ fontSize: '4.5rem', marginBottom: '1rem', animation: 'popIn 0.5s ease-out' }}>✅</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Report #{submitted.id} Submitted!</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        Our prioritization engine analyzed your report.
                    </p>
                    <div className="card" style={{ background: 'var(--color-bg)', marginBottom: '1.5rem', padding: '1rem' }}>
                        <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            <span>Priority Score</span>
                            <strong style={{ color: getPriorityColor(submitted.priorityScore) }}>
                                {submitted.priorityScore} — {getPriorityLabel(submitted.priorityScore)}
                            </strong>
                        </div>
                        <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            <span>Issue Type</span>
                            <strong>{submitted.issueType}</strong>
                        </div>
                        <div className="flex justify-between" style={{ fontSize: '0.8rem' }}>
                            <span>People Affected</span>
                            <strong>{submitted.peopleAffected}</strong>
                        </div>
                    </div>
                    {submitted.imageUrl && (
                        <img
                            src={`http://localhost:5000${submitted.imageUrl}`}
                            alt="Uploaded report"
                            style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: '1rem', maxHeight: '160px', objectFit: 'cover' }}
                        />
                    )}
                    <button className="btn btn-primary w-full" onClick={() => { setSubmitted(null); setImageFile(null); setImagePreview(null); setSelectedLocation(null); }}>
                        <i className="fas fa-plus"></i> Submit Another Report
                    </button>
                </div>
            </div>
        );
    }

    // ── Main Form ─────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Submit Incident Report</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Provide accurate details to ensure rapid response.</p>
                </div>
                {draftSaved && (
                    <span className="badge badge-success" style={{ animation: 'fadeIn 0.3s' }}>
                        <i className="fas fa-save" style={{ marginRight: '0.25rem' }}></i>Draft saved
                    </span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* ── Form ── */}
                <div className="card fade-in">
                    <form id="reportForm" onSubmit={handleSubmit}>
                        {/* Issue Type */}
                        <div className="form-group">
                            <label className="form-label">Issue Category</label>
                            <select name="issueType" className="form-input" required
                                defaultValue={JSON.parse(localStorage.getItem('reportDraft') || '{}').issueType || ''}>
                                <option value="">Select Category…</option>
                                <option value="Medical">Medical Emergency</option>
                                <option value="Food Shortage">Food Shortage</option>
                                <option value="Infrastructure">Infrastructure Damage</option>
                                <option value="Water Supply">Water Supply</option>
                                <option value="Shelter">Shelter</option>
                                <option value="Logistics">Logistics</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-input" rows="4"
                                placeholder="Detail the exact situation — number of people, what happened, resources needed…"
                                defaultValue={JSON.parse(localStorage.getItem('reportDraft') || '{}').description || ''}
                                required />
                        </div>

                        {/* Urgency Slider */}
                        <div className="form-group">
                            <label className="form-label">
                                Urgency Level: <span style={{ color: getPriorityColor(urgency * 10), fontWeight: 800 }}>{urgency}/10</span>
                            </label>
                            <input type="range" min="1" max="10" value={urgency} onChange={e => setUrgency(parseInt(e.target.value))} />
                            <div className="flex justify-between" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                <span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
                            </div>
                        </div>

                        {/* People Affected */}
                        <div className="form-group">
                            <label className="form-label">Estimated People Affected</label>
                            <input type="number" className="form-input" value={people}
                                onChange={e => setPeople(parseInt(e.target.value) || 0)} min="1" required />
                        </div>

                        {/* GPS Location Picker via Leaflet Map (Fix 2 + Phase 2) */}
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-map-pin" style={{ marginRight: '0.375rem', color: 'var(--color-primary)' }}></i>
                                GPS Location — <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--color-text-muted)' }}>
                                    click on map to pin location
                                </span>
                            </label>
                            <div className="map-picker">
                                <MapView
                                    mode="picker"
                                    height="260px"
                                    onLocationSelect={handleLocationSelect}
                                />
                            </div>
                            {selectedLocation ? (
                                <div className="flex items-center gap-2" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                                    <i className="fas fa-check-circle"></i>
                                    Location pinned: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                                </div>
                            ) : (
                                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    <i className="fas fa-info-circle" style={{ marginRight: '0.25rem' }}></i>
                                    No location selected — defaults to Los Angeles center
                                </p>
                            )}
                        </div>

                        {/* Image Upload (Fix 4) */}
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-camera" style={{ marginRight: '0.375rem', color: 'var(--color-primary)' }}></i>
                                Upload Photo <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--color-text-muted)' }}>(optional, max 10 MB)</span>
                            </label>

                            {imagePreview ? (
                                <div className="upload-preview" style={{ marginBottom: '0.5rem' }}>
                                    <img src={imagePreview} alt="Preview" />
                                    <button type="button" className="upload-preview-remove" onClick={removeImage} title="Remove image">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-zone">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleImageChange}
                                    />
                                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}></i>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                                        Click to upload or drag & drop
                                    </p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>JPG, PNG, GIF, WebP · Max 10 MB</p>
                                </label>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                            {loading
                                ? <><i className="fas fa-spinner fa-spin"></i> Submitting…</>
                                : <><i className="fas fa-paper-plane"></i> Submit Report</>}
                        </button>
                    </form>
                </div>

                {/* ── Live Priority Preview ── */}
                <div className="card fade-in" style={{ position: 'sticky', top: '90px' }}>
                    <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 700 }}>
                        <i className="fas fa-calculator" style={{ marginRight: '0.5rem', color: 'var(--color-primary)' }}></i>
                        Live Priority Preview
                    </h3>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '110px', height: '110px', borderRadius: '50%',
                            border: `5px solid ${getPriorityColor(priorityScore)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto', flexDirection: 'column',
                            boxShadow: `0 0 20px ${getPriorityColor(priorityScore)}30`,
                            transition: 'border-color 0.3s, box-shadow 0.3s',
                        }}>
                            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: getPriorityColor(priorityScore), transition: 'color 0.3s' }}>
                                {priorityScore}
                            </span>
                        </div>
                        <span className="badge" style={{ marginTop: '0.75rem', background: `${getPriorityColor(priorityScore)}20`, color: getPriorityColor(priorityScore) }}>
                            {getPriorityLabel(priorityScore)}
                        </span>
                    </div>

                    {/* Score breakdown */}
                    {[
                        { label: 'Urgency', weight: '50%', value: Math.round((urgency / 10) * 100 * 0.5), pct: (urgency / 10) * 100, color: 'var(--color-primary)' },
                        { label: 'Population', weight: '30%', value: Math.round(Math.min((people / 1000) * 100, 100) * 0.3), pct: Math.min((people / 1000) * 100, 100), color: 'var(--color-secondary)' },
                        { label: 'Time Factor', weight: '20%', value: 4, pct: 20, color: 'var(--color-warning)' },
                    ].map(row => (
                        <div key={row.label} style={{ marginBottom: '0.875rem' }}>
                            <div className="flex justify-between" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>{row.label} <span style={{ opacity: 0.6 }}>({row.weight})</span></span>
                                <span style={{ fontWeight: 700 }}>{row.value} pts</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${row.pct}%`, background: row.color }} />
                            </div>
                        </div>
                    ))}

                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                        <strong>Formula:</strong><br />
                        Score = (urgency×0.5) + (population×0.3) + (timePending×0.2)
                    </div>

                    {selectedLocation && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.72rem', color: 'var(--color-secondary)' }}>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '0.25rem' }}></i>
                            <strong>Location Pinned</strong><br />
                            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                        </div>
                    )}

                    {imageFile && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-info-light)', borderRadius: 'var(--radius-md)', fontSize: '0.72rem', color: 'var(--color-info)' }}>
                            <i className="fas fa-image" style={{ marginRight: '0.25rem' }}></i>
                            <strong>Photo attached</strong><br />
                            {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
