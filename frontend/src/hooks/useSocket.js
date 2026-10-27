/**
 * useSocket — singleton Socket.io hook (gracefully degrades).
 * Uses window.io loaded from CDN. If the backend doesn't have socket.io
 * running, this silently does nothing — no console spam, no errors.
 */
import { useEffect, useCallback, useRef } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let _socket = null;
let _attempted = false;
let _failed = false;

function getSocket() {
    const io = window.io;
    // If no CDN loaded or we already know it failed, skip silently
    if (!io || _failed) return null;

    if (!_socket && !_attempted) {
        _attempted = true;
        try {
            _socket = io(BACKEND_URL, {
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 2,   // Only try twice, then stop
                reconnectionDelay: 3000,
                timeout: 5000,
            });

            // If connection fails, mark as failed so we stop retrying
            _socket.on('connect_error', () => {
                _failed = true;
                try { _socket.disconnect(); } catch {}
                _socket = null;
            });
        } catch {
            _failed = true;
            _socket = null;
        }
    }
    return _socket;
}

export function useSocket() {
    const on = useCallback((event, handler) => {
        const socket = getSocket();
        if (!socket) return () => {};
        socket.on(event, handler);
        return () => socket.off(event, handler);
    }, []);

    const emit = useCallback((event, data) => {
        const socket = getSocket();
        if (socket) socket.emit(event, data);
    }, []);

    return { on, emit };
}
