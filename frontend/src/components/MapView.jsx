/**
 * MapView — Smart dual-mode map.
 *
 * Automatically detects if OpenStreetMap tile servers are reachable:
 *   ✅ Tiles load  → renders real interactive Leaflet map
 *   ❌ Tiles fail  → renders beautiful CSS-based heatmap (zero external deps)
 *
 * Both modes support 'view' (show pins) and 'picker' (click to select GPS).
 */
import { useEffect, useRef, useState, useCallback } from 'react';

const LA_CENTER = [34.0522, -118.2437];
const MAP_BOUNDS = { latMin: 33.75, latMax: 34.35, lngMin: -118.65, lngMax: -117.85 };

function getPinColor(score) {
    if (score >= 80) return '#dc2626';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#3b82f6';
    return '#059669';
}

function getPinRadius(score) {
    if (score >= 80) return 11;
    if (score >= 60) return 8;
    if (score >= 40) return 6;
    return 5;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CSS HEATMAP — works offline, no CDN, no tile server needed
// ═══════════════════════════════════════════════════════════════════════════════
function CSSHeatmap({ reports = [], mode = 'view', onLocationSelect, height = '320px' }) {
    const [hoveredPin, setHoveredPin] = useState(null);
    const [pickerPin, setPickerPin] = useState(null);
    const containerRef = useRef(null);

    const latToY = (lat) => ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * 100;
    const lngToX = (lng) => ((lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin)) * 100;

    const handleClick = useCallback((e) => {
        if (mode !== 'picker' || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width;
        const yPct = (e.clientY - rect.top) / rect.height;
        const lat = MAP_BOUNDS.latMax - yPct * (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);
        const lng = MAP_BOUNDS.lngMin + xPct * (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
        setPickerPin({ x: xPct * 100, y: yPct * 100 });
        if (onLocationSelect) onLocationSelect({ lat, lng });
    }, [mode, onLocationSelect]);

    // Simulated road network SVG for visual richness
    const roadPaths = [
        'M 5,50 Q 25,45 50,50 T 95,48',   // Main E-W road
        'M 50,5 Q 48,25 50,50 T 52,95',    // Main N-S road
        'M 10,20 Q 30,35 50,50 T 90,80',   // Diagonal
        'M 90,15 Q 70,30 50,50 T 15,85',   // Counter-diagonal
        'M 20,10 L 20,90',                  // Grid vertical
        'M 80,10 L 80,90',                  // Grid vertical
        'M 10,30 L 90,30',                  // Grid horizontal
        'M 10,70 L 90,70',                  // Grid horizontal
    ];

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            style={{
                height,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                cursor: mode === 'picker' ? 'crosshair' : 'default',
                background: 'linear-gradient(145deg, #e8edf5 0%, #dce4f0 25%, #d4e7d9 50%, #e5ede8 75%, #e8edf5 100%)',
            }}
        >
            {/* Road network overlay */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                {roadPaths.map((d, i) => (
                    <path key={i} d={d} fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth={i < 4 ? '0.6' : '0.3'} />
                ))}
                {/* Block outlines for urban feel */}
                {[15, 35, 55, 75].map(x => [15, 35, 55, 75].map(y => (
                    <rect key={`${x}-${y}`} x={x} y={y} width="14" height="14" rx="1"
                        fill="rgba(148,163,184,0.06)" stroke="rgba(148,163,184,0.12)" strokeWidth="0.3" />
                )))}
            </svg>

            {/* Sector labels */}
            {['NW Sector', 'North', 'NE Sector', 'West', 'Downtown', 'East', 'SW Sector', 'South', 'SE Sector'].map((label, i) => {
                const row = Math.floor(i / 3), col = i % 3;
                return (
                    <span key={label} style={{
                        position: 'absolute', top: `${12 + row * 36}%`, left: `${12 + col * 36}%`,
                        fontSize: '0.5rem', color: 'var(--color-text-muted)', opacity: 0.35,
                        fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        pointerEvents: 'none',
                    }}>{label}</span>
                );
            })}

            {/* Report pins */}
            {reports.map((r, i) => {
                if (!r.latitude || !r.longitude) return null;
                const x = lngToX(r.longitude);
                const y = latToY(r.latitude);
                if (x < -5 || x > 105 || y < -5 || y > 105) return null;
                const color = getPinColor(r.priorityScore || 0);
                const size = getPinRadius(r.priorityScore || 0) * 1.6;
                const isHovered = hoveredPin === i;

                return (
                    <div key={r.id ?? i}
                        onMouseEnter={() => setHoveredPin(i)}
                        onMouseLeave={() => setHoveredPin(null)}
                        style={{
                            position: 'absolute', left: `${x}%`, top: `${y}%`,
                            transform: `translate(-50%, -50%) scale(${isHovered ? 1.7 : 1})`,
                            width: `${size}px`, height: `${size}px`,
                            borderRadius: '50%', background: color,
                            border: '2px solid white',
                            boxShadow: `0 0 ${isHovered ? '18px' : r.priorityScore >= 80 ? '10px' : '5px'} ${color}${isHovered ? '' : '80'}`,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            zIndex: isHovered ? 30 : r.priorityScore >= 80 ? 10 : 5,
                        }}
                    >
                        {r.priorityScore >= 80 && (
                            <div style={{
                                position: 'absolute', inset: '-5px', borderRadius: '50%',
                                border: `2px solid ${color}`, animation: 'pulse 2s infinite', opacity: 0.4,
                            }} />
                        )}
                    </div>
                );
            })}

            {/* Picker pin */}
            {pickerPin && mode === 'picker' && (
                <div style={{
                    position: 'absolute', left: `${pickerPin.x}%`, top: `${pickerPin.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: '#4f46e5', border: '3px solid white',
                    boxShadow: '0 0 15px rgba(79,70,229,0.6)', zIndex: 40,
                }} />
            )}

            {/* Hover tooltip */}
            {hoveredPin !== null && reports[hoveredPin] && (() => {
                const r = reports[hoveredPin];
                const x = lngToX(r.longitude);
                const y = latToY(r.latitude);
                const color = getPinColor(r.priorityScore || 0);
                return (
                    <div style={{
                        position: 'absolute',
                        left: `${Math.min(Math.max(x, 12), 88)}%`,
                        top: `${y - 2}%`,
                        transform: 'translate(-50%, -100%)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.5rem 0.75rem',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 50, minWidth: '160px', pointerEvents: 'none',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                            {r.issueType}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                            Priority: <strong style={{ color }}>{r.priorityScore}</strong> · {r.status}
                        </div>
                        {r.peopleAffected && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                                👥 {r.peopleAffected} people affected
                            </div>
                        )}
                        <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', marginTop: '0.15rem', lineHeight: 1.3 }}>
                            {(r.description || '').slice(0, 70)}{(r.description || '').length > 70 ? '…' : ''}
                        </div>
                        {/* Arrow */}
                        <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid var(--color-surface)' }} />
                    </div>
                );
            })()}

            {/* Attribution */}
            <div style={{
                position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)',
                fontSize: '0.55rem', color: 'var(--color-text-muted)', opacity: 0.6,
                background: 'var(--color-surface)', padding: '0.1rem 0.5rem',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                whiteSpace: 'nowrap',
            }}>
                Los Angeles Metro Area · {reports.length} reports
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LEAFLET MAP — real interactive map (requires working tile server)
// ═══════════════════════════════════════════════════════════════════════════════
function LeafletMap({ reports = [], mode = 'view', onLocationSelect, height = '320px', center = LA_CENTER, zoom = 11 }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const pickerMarkerRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const L = window.L;
        if (!L || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, { center, zoom, scrollWheelZoom: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        requestAnimationFrame(() => setTimeout(() => { map.invalidateSize(); setReady(true); }, 300));

        const onResize = () => map.invalidateSize();
        window.addEventListener('resize', onResize);

        if (mode === 'picker') {
            map.getContainer().style.cursor = 'crosshair';
            map.on('click', (e) => {
                const L2 = window.L;
                if (pickerMarkerRef.current) pickerMarkerRef.current.setLatLng(e.latlng);
                else {
                    pickerMarkerRef.current = L2.circleMarker(e.latlng, {
                        color: '#4f46e5', weight: 3, fillColor: '#4f46e5', fillOpacity: 0.9, radius: 10,
                    }).addTo(map).bindPopup('📍 Selected Location').openPopup();
                }
                if (onLocationSelect) onLocationSelect(e.latlng);
            });
        }

        return () => {
            window.removeEventListener('resize', onResize);
            map.remove();
            mapRef.current = null;
            markersRef.current = [];
            pickerMarkerRef.current = null;
        };
    }, []); // eslint-disable-line

    useEffect(() => {
        const L = window.L, map = mapRef.current;
        if (!L || !map || mode !== 'view') return;
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        reports.forEach(r => {
            if (!r.latitude || !r.longitude) return;
            const color = getPinColor(r.priorityScore || 0);
            const m = L.circleMarker([r.latitude, r.longitude], {
                color: 'white', weight: 2, fillColor: color, fillOpacity: 0.9, radius: getPinRadius(r.priorityScore || 0),
            }).addTo(map).bindPopup(
                `<div style="min-width:160px;font-family:sans-serif;line-height:1.5">
                    <b>${r.issueType}</b><br/>
                    Priority: <b style="color:${color}">${r.priorityScore}</b> · ${r.status}<br/>
                    <small style="color:#64748b">${(r.description || '').slice(0, 80)}…</small>
                    ${r.peopleAffected ? `<br/><small>👥 ${r.peopleAffected} affected</small>` : ''}
                </div>`
            );
            markersRef.current.push(m);
        });
    }, [reports, mode, ready]);

    return (
        <div style={{ height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT — auto-detect tile server connectivity
// ═══════════════════════════════════════════════════════════════════════════════
// Module-level cache so we only test connectivity once per session
let _tileTestResult = null; // null = not tested, true = tiles work, false = tiles blocked

export default function MapView(props) {
    const [renderMode, setRenderMode] = useState(
        _tileTestResult === true ? 'leaflet' :
        _tileTestResult === false ? 'css' :
        'testing'
    );

    useEffect(() => {
        // If already determined, done
        if (_tileTestResult !== null) return;

        // No Leaflet JS → CSS fallback immediately
        if (!window.L) {
            _tileTestResult = false;
            setRenderMode('css');
            return;
        }

        // Try loading a single tile image to test connectivity
        const img = new Image();
        let settled = false;

        const settle = (canUseTiles) => {
            if (settled) return;
            settled = true;
            _tileTestResult = canUseTiles;
            setRenderMode(canUseTiles ? 'leaflet' : 'css');
        };

        img.onload = () => settle(true);
        img.onerror = () => settle(false);
        img.src = 'https://a.tile.openstreetmap.org/0/0/0.png';

        // Timeout: if tile hasn't loaded in 4 seconds, assume blocked
        const timer = setTimeout(() => settle(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    if (renderMode === 'testing') {
        return (
            <div style={{
                height: props.height || '320px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '0.5rem',
            }}>
                <div style={{
                    width: '32px', height: '32px',
                    border: '3px solid var(--color-border)',
                    borderTop: '3px solid var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Detecting map service…</span>
            </div>
        );
    }

    if (renderMode === 'leaflet') return <LeafletMap {...props} />;
    return <CSSHeatmap {...props} />;
}
