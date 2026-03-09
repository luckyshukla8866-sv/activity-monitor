/**
 * WebSocket hook for real-time activity updates.
 * Uses a module-level singleton connection shared across all components.
 * Auto-reconnects with exponential backoff.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export interface ActivityEvent {
    type:
    | 'connected'
    | 'status'
    | 'session_start'
    | 'session_end'
    | 'screenshot'
    | 'mouse_move'
    | 'mouse_click'
    | 'key_press'
    | 'monitoring_started'
    | 'monitoring_stopped'
    | 'pong';
    timestamp?: string;
    app_name?: string;
    window_title?: string;
    session_id?: number;
    duration_seconds?: number;
    is_monitoring?: boolean;
    is_idle?: boolean;
    total_sessions?: number;
    total_screenshots?: number;
    current_app?: string;
    message?: string;
}

// ── Module-level singleton so all components share ONE WebSocket ──────────────
type Listener = (event: ActivityEvent) => void;

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
let pingInterval: ReturnType<typeof setInterval> | null = null;
let isConnectedGlobal = false;
const listeners = new Set<Listener>();

// ── Persistent counters — survive page navigation because they live here, not in React state ──
let totalMouseGlobal = 0;
let totalKeysGlobal = 0;

/** Read the current persistent totals (used by the hook to initialise state). */
export function getInputTotals() {
    return { totalMouse: totalMouseGlobal, totalKeys: totalKeysGlobal };
}

/** Reset both counters (e.g. user clicks a Reset button). */
export function resetInputTotals() {
    totalMouseGlobal = 0;
    totalKeysGlobal = 0;
    // Notify all listeners so UI updates immediately
    listeners.forEach((fn) => fn({ type: 'status' } as ActivityEvent));
}

function notifyListeners(event: ActivityEvent) {
    // Increment persistent counters BEFORE notifying components
    if (event.type === 'mouse_click') totalMouseGlobal += 1;
    if (event.type === 'key_press') totalKeysGlobal += 1;
    listeners.forEach((fn) => fn(event));
}

function connectGlobal() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    console.log('[WS] Connecting to', WS_URL);
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('[WS] Connected ✓');
        isConnectedGlobal = true;
        reconnectDelay = 1000;
        // Keep-alive ping every 30s
        pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) ws.send('ping');
        }, 30000);
        notifyListeners({ type: 'connected' } as ActivityEvent);
    };

    ws.onmessage = (e) => {
        try {
            const data: ActivityEvent = JSON.parse(e.data);
            // Debug: log all non-pong events to browser console
            if (data.type !== 'pong') {
                console.log('[WS] ←', data.type, data);
            }
            notifyListeners(data);
        } catch {
            // ignore parse errors
        }
    };

    ws.onclose = () => {
        console.log('[WS] Disconnected, reconnecting in', reconnectDelay, 'ms');
        isConnectedGlobal = false;
        if (pingInterval) clearInterval(pingInterval);
        notifyListeners({ type: 'connected', is_monitoring: false } as ActivityEvent);
        reconnectTimeout = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, 30000);
            connectGlobal();
        }, reconnectDelay);
    };

    ws.onerror = (err) => {
        console.warn('[WS] Error', err);
        ws?.close();
    };
}

// Start the singleton connection immediately when this module loads
if (typeof window !== 'undefined') {
    connectGlobal();
}

// ── React hook ────────────────────────────────────────────────────────────────
interface UseWebSocketReturn {
    lastEvent: ActivityEvent | null;
    isConnected: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    eventLog: ActivityEvent[];
    totalMouse: number;
    totalKeys: number;
}

export function useWebSocket(): UseWebSocketReturn {
    const [lastEvent, setLastEvent] = useState<ActivityEvent | null>(null);
    const [isConnected, setIsConnected] = useState(isConnectedGlobal);
    const [connectionStatus, setConnectionStatus] = useState<
        'connecting' | 'connected' | 'disconnected' | 'error'
    >(isConnectedGlobal ? 'connected' : 'connecting');
    const [eventLog, setEventLog] = useState<ActivityEvent[]>([]);
    // Initialise from module-level globals so navigating back restores the counts
    const [totalMouse, setTotalMouse] = useState(totalMouseGlobal);
    const [totalKeys, setTotalKeys] = useState(totalKeysGlobal);

    useEffect(() => {
        // Make sure the singleton is running
        connectGlobal();

        const handler: Listener = (event) => {
            // Update connection state
            if (event.type === 'connected') {
                setIsConnected(true);
                setConnectionStatus('connected');
            }

            // Sync persistent counters into React state so the UI re-renders
            if (event.type === 'mouse_click') setTotalMouse(totalMouseGlobal);
            if (event.type === 'key_press') setTotalKeys(totalKeysGlobal);
            // Also sync on status events (e.g. after resetInputTotals())
            if (event.type === 'status') {
                setTotalMouse(totalMouseGlobal);
                setTotalKeys(totalKeysGlobal);
            }

            setLastEvent({ ...event }); // spread to force re-render on same type

            // Add meaningful events to the log (skip high-frequency mouse/key/status)
            if (
                event.type !== 'pong' &&
                event.type !== 'mouse_move' &&
                event.type !== 'key_press' &&
                event.type !== 'status'
            ) {
                setEventLog((prev) => [event, ...prev].slice(0, 50));
            }
        };

        // Handle disconnection state
        const disconnectHandler = () => {
            setIsConnected(false);
            setConnectionStatus('disconnected');
        };

        listeners.add(handler);

        // Sync current connection state
        setIsConnected(isConnectedGlobal);
        setConnectionStatus(isConnectedGlobal ? 'connected' : 'connecting');

        return () => {
            listeners.delete(handler);
        };
    }, []);

    return { lastEvent, isConnected, connectionStatus, eventLog, totalMouse, totalKeys };
}
