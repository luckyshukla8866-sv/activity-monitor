'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mouse, Keyboard, Wifi, WifiOff, Monitor } from 'lucide-react';
import { useWebSocket, ActivityEvent } from '@/lib/websocket';

function formatTime(isoString: string): string {
    try {
        return new Date(isoString).toLocaleTimeString();
    } catch {
        return '';
    }
}

function getEventLabel(event: ActivityEvent): string {
    switch (event.type) {
        case 'session_start':
            return `▶ Session: ${event.app_name}`;
        case 'session_end':
            return `⏹ Ended: ${event.app_name} (${event.duration_seconds}s)`;
        case 'screenshot':
            return `📸 Screenshot captured`;
        case 'monitoring_started':
            return `🟢 Monitoring started`;
        case 'monitoring_stopped':
            return `🔴 Monitoring stopped`;
        default:
            return event.type;
    }
}

export default function LiveActivityPanel() {
    const { lastEvent, isConnected, connectionStatus, eventLog } = useWebSocket();

    // Live status derived from WebSocket events
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [currentApp, setCurrentApp] = useState<string | null>(null);
    const [totalSessions, setTotalSessions] = useState(0);
    const [totalScreenshots, setTotalScreenshots] = useState(0);

    // Activity pulse indicators
    const [mouseActive, setMouseActive] = useState(false);
    const [keyActive, setKeyActive] = useState(false);
    const mouseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const keyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Mouse activity bar — tracks recent moves as a count
    const [mouseCount, setMouseCount] = useState(0);
    const mouseCountRef = useRef(0);

    useEffect(() => {
        if (!lastEvent) return;

        switch (lastEvent.type) {
            case 'connected':
            case 'status':
                if (lastEvent.is_monitoring !== undefined) setIsMonitoring(lastEvent.is_monitoring);
                if (lastEvent.is_idle !== undefined) setIsIdle(lastEvent.is_idle);
                if (lastEvent.current_app !== undefined) setCurrentApp(lastEvent.current_app ?? null);
                if (lastEvent.total_sessions !== undefined) setTotalSessions(lastEvent.total_sessions);
                if (lastEvent.total_screenshots !== undefined) setTotalScreenshots(lastEvent.total_screenshots);
                break;

            case 'session_start':
                setCurrentApp(lastEvent.app_name ?? null);
                setTotalSessions((n) => n + 1);
                break;

            case 'session_end':
                break;

            case 'screenshot':
                setTotalScreenshots((n) => n + 1);
                break;

            case 'monitoring_started':
                setIsMonitoring(true);
                break;

            case 'monitoring_stopped':
                setIsMonitoring(false);
                setCurrentApp(null);
                break;

            case 'mouse_move':
                setMouseActive(true);
                mouseCountRef.current = Math.min(mouseCountRef.current + 1, 10);
                setMouseCount(mouseCountRef.current);
                if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
                mouseTimerRef.current = setTimeout(() => {
                    setMouseActive(false);
                    mouseCountRef.current = Math.max(mouseCountRef.current - 1, 0);
                    setMouseCount(mouseCountRef.current);
                }, 800);
                break;

            case 'key_press':
                setKeyActive(true);
                if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
                keyTimerRef.current = setTimeout(() => setKeyActive(false), 400);
                break;
        }
    }, [lastEvent]);

    const statusColor = !isConnected
        ? 'text-slate-400'
        : !isMonitoring
            ? 'text-yellow-400'
            : isIdle
                ? 'text-orange-400'
                : 'text-green-400';

    const statusLabel = !isConnected
        ? 'Disconnected'
        : !isMonitoring
            ? 'Monitoring Off'
            : isIdle
                ? 'Idle'
                : 'Active';

    const statusDot = !isConnected
        ? 'bg-slate-400'
        : !isMonitoring
            ? 'bg-yellow-400'
            : isIdle
                ? 'bg-orange-400'
                : 'bg-green-400';

    return (
        <div className="glass p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Live Activity</h2>
                        <p className="text-xs text-slate-400">Real-time monitoring feed</p>
                    </div>
                </div>

                {/* Connection badge */}
                <div className="flex items-center gap-2 text-sm">
                    {isConnected ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                        <WifiOff className="w-4 h-4 text-slate-400" />
                    )}
                    <span className={isConnected ? 'text-green-400' : 'text-slate-400'}>
                        {connectionStatus === 'connecting' ? 'Connecting…' : isConnected ? 'Live' : 'Reconnecting…'}
                    </span>
                </div>
            </div>

            {/* Status + Current App */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${statusDot} ${isMonitoring && !isIdle ? 'animate-pulse' : ''}`} />
                    <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <p className={`font-semibold ${statusColor}`}>{statusLabel}</p>
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs text-slate-400">Current App</p>
                        <p className="font-semibold text-white truncate text-sm">
                            {currentApp ?? '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Input Activity Indicators */}
            <div className="space-y-3">
                {/* Mouse activity bar */}
                <div className="flex items-center gap-3">
                    <Mouse className={`w-4 h-4 shrink-0 transition-colors ${mouseActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            animate={{ width: `${(mouseCount / 10) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">Mouse</span>
                </div>

                {/* Keyboard indicator */}
                <div className="flex items-center gap-3">
                    <Keyboard className={`w-4 h-4 shrink-0 transition-colors ${keyActive ? 'text-purple-400' : 'text-slate-500'}`} />
                    <div className="flex-1 flex gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 h-2 rounded-full"
                                animate={{
                                    backgroundColor: keyActive && i < 7
                                        ? `hsl(${270 + i * 5}, 70%, 60%)`
                                        : '#1e293b',
                                    scaleY: keyActive && i < 7 ? 1.5 : 1,
                                }}
                                transition={{ delay: i * 0.03, duration: 0.15 }}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">Keys</span>
                </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-cyan-400">{totalSessions}</p>
                    <p className="text-xs text-slate-400">Sessions</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-400">{totalScreenshots}</p>
                    <p className="text-xs text-slate-400">Screenshots</p>
                </div>
            </div>

            {/* Event log */}
            <div>
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Recent Events</p>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                        {eventLog.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">Waiting for events…</p>
                        ) : (
                            eventLog.slice(0, 10).map((event, i) => (
                                <motion.div
                                    key={`${event.type}-${event.timestamp}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-800/40"
                                >
                                    <span className="text-slate-300">{getEventLabel(event)}</span>
                                    <span className="text-slate-500 shrink-0 ml-2">
                                        {event.timestamp ? formatTime(event.timestamp) : ''}
                                    </span>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
