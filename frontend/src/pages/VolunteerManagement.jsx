import { useState, useEffect } from 'react';
import { api } from '../api';
import { useApp } from '../context.jsx';

export default function VolunteerManagement() {
    const { showToast } = useApp();
    const [vols, setVols] = useState([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [selectedVol, setSelectedVol] = useState(null);
    const [editModal, setEditModal] = useState(null);

    useEffect(() => { api.getVolunteers().then(setVols); }, []);

    const handleDelete = (id) => {
        if (window.confirm('Remove this volunteer?')) {
            setVols(vols.filter(v => v.id !== id));
            showToast('Volunteer removed', 'success');
        }
    };

    let filtered = vols.filter(v => {
        const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = !filterStatus || v.availabilityStatus === filterStatus;
        return matchSearch && matchStatus;
    });

    if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'hours') filtered.sort((a, b) => b.totalHoursServed - a.totalHoursServed);

    const getRadiusKm = () => (Math.random() * 20 + 5).toFixed(1);

    return (
        <div>
            <div className="flex justify-between items-center" style={{marginBottom: '1.5rem'}}>
                <div>
                    <h1 style={{fontSize: '1.75rem', marginBottom: '0.25rem'}}>Volunteer Management</h1>
                    <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem'}}>Manage, edit, and track {vols.length} registered volunteers</p>
                </div>
                <button className="btn btn-primary" onClick={() => showToast('Add Volunteer (simulated) ')}><i className="fas fa-plus"></i> Add Volunteer</button>
            </div>

            <div className="card fade-in">
                <div className="flex gap-3 items-center flex-wrap" style={{marginBottom: '1.25rem'}}>
                    <div style={{position: 'relative', flex: 1, maxWidth: '280px'}}>
                        <i className="fas fa-search" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.8rem'}}></i>
                        <input type="text" placeholder="Search name or skill..." className="form-input" style={{paddingLeft: '2rem'}} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-input" style={{maxWidth: '160px'}} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                    </select>
                    <select className="form-input" style={{maxWidth: '160px'}} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="name">Sort: Name</option>
                        <option value="rating">Sort: Rating</option>
                        <option value="hours">Sort: Hours</option>
                    </select>
                    <span style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto'}}>{filtered.length} results</span>
                </div>

                <div style={{overflowX: 'auto'}}>
                    <table className="data-table">
                        <thead>
                            <tr><th>Volunteer</th><th>Skills</th><th>Availability</th><th>Rating</th><th>Tasks</th><th>Radius</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(v => (
                                <tr key={v.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="avatar avatar-sm" style={{background: 'var(--color-primary-light)', color: 'var(--color-primary)'}}>{v.name.split(' ').map(n=>n[0]).join('')}</div>
                                            <div><div style={{fontWeight: 600, fontSize: '0.85rem'}}>{v.name}</div><div style={{fontSize: '0.7rem', color: 'var(--color-text-muted)'}}>ID #{v.id}</div></div>
                                        </div>
                                    </td>
                                    <td><div className="flex gap-1 flex-wrap">{v.skills.map((s,i) => <span key={i} className="badge badge-primary" style={{fontSize: '0.6rem'}}>{s}</span>)}</div></td>
                                    <td><span className={`badge ${v.availabilityStatus === 'available' ? 'badge-success' : 'badge-warning'}`}>{v.availabilityStatus}</span></td>
                                    <td><span style={{fontWeight: 700}}>{v.rating}</span> <i className="fas fa-star" style={{color: 'var(--color-warning)', fontSize: '0.7rem'}}></i></td>
                                    <td style={{fontWeight: 600}}>{v.totalHoursServed} hrs</td>
                                    <td>{getRadiusKm()} km</td>
                                    <td><span style={{width: '8px', height: '8px', borderRadius: '50%', background: v.availabilityStatus === 'available' ? 'var(--color-secondary)' : 'var(--color-warning)', display: 'inline-block'}}></span></td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button className="btn btn-outline btn-sm" title="View Profile" onClick={() => setSelectedVol(v)}><i className="fas fa-eye"></i></button>
                                            <button className="btn btn-outline btn-sm" title="Edit" onClick={() => setEditModal(v)}><i className="fas fa-edit"></i></button>
                                            <button className="btn btn-outline btn-sm" title="Reassign Tasks" onClick={() => showToast(`Reassigning tasks for ${v.name}...`)}><i className="fas fa-exchange-alt"></i></button>
                                            <button className="btn btn-sm" style={{color: 'var(--color-danger)'}} title="Delete" onClick={() => handleDelete(v.id)}><i className="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Profile Modal */}
            {selectedVol && (
                <div className="modal-overlay" onClick={() => setSelectedVol(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Volunteer Profile</h3>
                            <button className="btn btn-icon btn-outline" onClick={() => setSelectedVol(null)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="modal-body">
                            <div className="flex items-center gap-4" style={{marginBottom: '1.5rem'}}>
                                <div className="avatar avatar-lg" style={{background: 'var(--color-primary-light)', color: 'var(--color-primary)'}}>{selectedVol.name.split(' ').map(n=>n[0]).join('')}</div>
                                <div>
                                    <h3 style={{marginBottom: '0.25rem'}}>{selectedVol.name}</h3>
                                    <span className={`badge ${selectedVol.availabilityStatus === 'available' ? 'badge-success' : 'badge-warning'}`}>{selectedVol.availabilityStatus}</span>
                                </div>
                            </div>
                            <div className="grid-2" style={{marginBottom: '1rem'}}>
                                <div><label className="form-label">Rating</label><div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-warning)'}}>{selectedVol.rating} <i className="fas fa-star"></i></div></div>
                                <div><label className="form-label">Experience</label><div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)'}}>{selectedVol.totalHoursServed}h</div></div>
                            </div>
                            <div className="form-group"><label className="form-label">Skills</label><div className="flex gap-2 flex-wrap">{selectedVol.skills.map((s,i) => <span key={i} className="badge badge-primary">{s}</span>)}</div></div>
                            <div className="form-group"><label className="form-label">Level</label><span className="badge badge-info">{selectedVol.experienceLevel}</span></div>
                            <div className="form-group"><label className="form-label">Location</label><p style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Lat: {selectedVol.latitude.toFixed(4)}, Lng: {selectedVol.longitude.toFixed(4)}</p></div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-outline" onClick={() => setSelectedVol(null)}>Close</button></div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal && (
                <div className="modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Edit Volunteer</h3><button className="btn btn-icon btn-outline" onClick={() => setEditModal(null)}><i className="fas fa-times"></i></button></div>
                        <div className="modal-body">
                            <div className="form-group"><label className="form-label">Name</label><input className="form-input" defaultValue={editModal.name} /></div>
                            <div className="form-group"><label className="form-label">Skills (comma separated)</label><input className="form-input" defaultValue={editModal.skills.join(', ')} /></div>
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Status</label><select className="form-input" defaultValue={editModal.availabilityStatus}><option value="available">Available</option><option value="busy">Busy</option></select></div>
                                <div className="form-group"><label className="form-label">Experience Level</label><select className="form-input" defaultValue={editModal.experienceLevel}><option>Expert</option><option>Intermediate</option><option>Beginner</option></select></div>
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-outline" onClick={() => setEditModal(null)}>Cancel</button><button className="btn btn-primary" onClick={() => { showToast('Volunteer updated!', 'success'); setEditModal(null); }}>Save</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
