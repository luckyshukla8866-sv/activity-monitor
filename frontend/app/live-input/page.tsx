'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mouse, Keyboard, Wifi, WifiOff, Activity } from 'lucide-react';
import { useWebSocket, resetInputTotals } from '@/lib/websocket';

// ── Ripple effect on mouse activity ──────────────────────────────
function MouseRipple({ active }: { active: boolean }) {
    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            {/* Outer rings — animate when active */}
            {active && (
                <>
                    <motion.div
                        key={`ring1-${Date.now()}`}
                        className="absolute rounded-full border-2 border-cyan-400/60"
                        initial={{ width: 60, height: 60, opacity: 0.8 }}
                        animate={{ width: 140, height: 140, opacity: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                    <motion.div
                        key={`ring2-${Date.now()}`}
                        className="absolute rounded-full border-2 border-cyan-500/40"
                        initial={{ width: 60, height: 60, opacity: 0.6 }}
                        animate={{ width: 120, height: 120, opacity: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                    />
                </>
            )}
            {/* Center circle */}
            <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                animate={{
                    background: active
                        ? 'radial-gradient(circle, #06b6d4, #3b82f6)'
                        : 'radial-gradient(circle, #1e293b, #0f172a)',
                    boxShadow: active
                        ? '0 0 30px rgba(6,182,212,0.5)'
                        : '0 0 0px rgba(6,182,212,0)',
                }}
                transition={{ duration: 0.2 }}
            >
                <Mouse className={`w-7 h-7 transition-colors ${active ? 'text-white' : 'text-slate-500'}`} />
            </motion.div>
        </div>
    );
}

// ── Keyboard key flash animation ─────────────────────────────────
function KeyboardVisualizer({ active }: { active: boolean }) {
    // Simulate a mini keyboard layout (3 rows of keys)
    const rows = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0.8, 1, 1, 1, 1, 1, 1, 1, 1, 0.8],
        [1.5, 1, 1, 1, 1, 1, 1, 1, 1.5],
    ];

    return (
        <div className="space-y-1.5">
            {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1.5 justify-center">
                    {row.map((width, colIdx) => {
                        const delay = (rowIdx * 10 + colIdx) * 0.015;
                        const isLit = active && Math.random() > 0.3;
                        return (
                            <motion.div
                                key={colIdx}
                                className="h-8 rounded-md border border-slate-600"
                                style={{ width: `${width * 36}px` }}
                                animate={{
                                    backgroundColor: active
                                        ? `hsl(${270 + colIdx * 8}, 70%, ${40 + rowIdx * 8}%)`
                                        : '#1e293b',
                                    borderColor: active ? 'rgba(168,85,247,0.6)' : 'rgba(71,85,105,0.5)',
                                    boxShadow: active
                                        ? `0 0 8px hsl(${270 + colIdx * 8}, 70%, 50%)`
                                        : 'none',
                                    scaleY: active ? 1.1 : 1,
                                }}
                                transition={{ duration: 0.12, delay }}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

// ── Activity bar ─────────────────────────────────────────────────
function ActivityBar({ value, max, color }: { value: number; max: number; color: string }) {
    return (
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <motion.div
                className={`h-full rounded-full ${color}`}
                animate={{ width: `${(value / max) * 100}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function LiveInputPage() {
    const { lastEvent, isConnected, connectionStatus, totalMouse, totalKeys } = useWebSocket();

    const [isMonitoring, setIsMonitoring] = useState(false);
    const [mouseActive, setMouseActive] = useState(false);
    const [keyActive, setKeyActive] = useState(false);
    const [mouseCount, setMouseCount] = useState(0);   // 0-20 rolling activity bar
    const [keyCount, setKeyCount] = useState(0);       // 0-20 rolling activity bar
    const [recentEvents, setRecentEvents] = useState<{ type: string; time: string }[]>([]);

    const mouseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const keyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mouseCountRef = useRef(0);
    const keyCountRef = useRef(0);

    // Decay mouse bar every 1s
    useEffect(() => {
        const interval = setInterval(() => {
            if (mouseCountRef.current > 0) {
                mouseCountRef.current = Math.max(0, mouseCountRef.current - 1);
                setMouseCount(mouseCountRef.current);
            }
            if (keyCountRef.current > 0) {
                keyCountRef.current = Math.max(0, keyCountRef.current - 1);
                setKeyCount(keyCountRef.current);
            }
        }, 600);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!lastEvent) return;

        const now = new Date().toLocaleTimeString();

        switch (lastEvent.type) {
            case 'connected':
            case 'status':
                if (lastEvent.is_monitoring !== undefined) setIsMonitoring(lastEvent.is_monitoring);
                break;
            case 'monitoring_started':
                setIsMonitoring(true);
                break;
            case 'monitoring_stopped':
                setIsMonitoring(false);
                break;

            case 'mouse_click':
                setMouseActive(true);
                mouseCountRef.current = Math.min(mouseCountRef.current + 2, 20);
                setMouseCount(mouseCountRef.current);
                // totalMouse comes from the hook (module-level global) — no local increment needed
                if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
                mouseTimerRef.current = setTimeout(() => setMouseActive(false), 600);
                break;

            case 'key_press':
                setKeyActive(true);
                keyCountRef.current = Math.min(keyCountRef.current + 3, 20);
                setKeyCount(keyCountRef.current);
                // totalKeys comes from the hook (module-level global) — no local increment needed
                setRecentEvents((prev) => [{ type: 'key_press', time: now }, ...prev.slice(0, 19)]);
                if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
                keyTimerRef.current = setTimeout(() => setKeyActive(false), 350);
                break;
        }
    }, [lastEvent]);

    const statusLabel = !isConnected
        ? 'Disconnected'
        : !isMonitoring
            ? 'Monitoring Off'
            : 'Monitoring Active';

    const statusColor = !isConnected
        ? 'text-slate-400'
        : !isMonitoring
            ? 'text-yellow-400'
            : 'text-green-400';

    const statusDot = !isConnected
        ? 'bg-slate-400'
        : !isMonitoring
            ? 'bg-yellow-400 animate-pulse'
            : 'bg-green-400 animate-pulse';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Live Input Monitor</h1>
                    <p className="text-slate-400 mt-1">Real-time mouse & keyboard activity visualization</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Reset button */}
                    <button
                        onClick={resetInputTotals}
                        className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                        title="Reset session counters"
                    >
                        Reset Counters
                    </button>
                    <div className="flex items-center gap-3 glass px-4 py-2 rounded-xl">
                        {isConnected ? (
                            <Wifi className="w-4 h-4 text-green-400" />
                        ) : (
                            <WifiOff className="w-4 h-4 text-slate-400" />
                        )}
                        <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-slate-400'}`}>
                            {connectionStatus === 'connecting' ? 'Connecting…' : isConnected ? 'WebSocket Live' : 'Reconnecting…'}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                        <span className={`text-sm ${statusColor}`}>{statusLabel}</span>
                    </div>
                </div>
            </div>

            {/* Not connected warning */}
            {!isConnected && (
                <div className="glass border border-yellow-500/30 p-4 rounded-xl text-yellow-400 text-sm">
                    ⚠️ WebSocket not connected. Make sure the backend is running: <code className="bg-slate-800 px-2 py-0.5 rounded">python main.py --mode headless</code>
                </div>
            )}

            {!isMonitoring && isConnected && (
                <div className="glass border border-orange-500/30 p-4 rounded-xl text-orange-400 text-sm">
                    ⚠️ Monitoring is stopped. Go to <strong>Monitoring Control</strong> and click <strong>Start</strong> to see live input.
                </div>
            )}

            {/* Main indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Mouse Card */}
                <div className="glass p-8 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 self-start">
                        <div className={`p-2 rounded-lg transition-colors ${mouseActive ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
                            <Mouse className={`w-5 h-5 transition-colors ${mouseActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">Mouse Activity</h2>
                            <p className="text-xs text-slate-400">Click detection (no position stored)</p>
                        </div>
                        <AnimatePresence>
                            {mouseActive && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="ml-auto px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-full font-semibold"
                                >
                                    CLICKED
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Ripple visualizer */}
                    <MouseRipple active={mouseActive} />

                    {/* Activity bar */}
                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Activity Level</span>
                            <span>{Math.round((mouseCount / 20) * 100)}%</span>
                        </div>
                        <ActivityBar value={mouseCount} max={20} color="bg-gradient-to-r from-cyan-500 to-blue-500" />
                    </div>

                    {/* Counter */}
                    <div className="text-center">
                        <p className="text-4xl font-bold text-cyan-400">{totalMouse.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 mt-1">clicks this session</p>
                    </div>
                </div>

                {/* Keyboard Card */}
                <div className="glass p-8 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 self-start">
                        <div className={`p-2 rounded-lg transition-colors ${keyActive ? 'bg-purple-500/20' : 'bg-slate-800'}`}>
                            <Keyboard className={`w-5 h-5 transition-colors ${keyActive ? 'text-purple-400' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">Keyboard Activity</h2>
                            <p className="text-xs text-slate-400">Key press signals (no content stored)</p>
                        </div>
                        <AnimatePresence>
                            {keyActive && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="ml-auto px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full font-semibold"
                                >
                                    TYPING
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Keyboard visualizer */}
                    <div className="w-full">
                        <KeyboardVisualizer active={keyActive} />
                    </div>

                    {/* Activity bar */}
                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Activity Level</span>
                            <span>{Math.round((keyCount / 20) * 100)}%</span>
                        </div>
                        <ActivityBar value={keyCount} max={20} color="bg-gradient-to-r from-purple-500 to-pink-500" />
                    </div>

                    {/* Counter */}
                    <div className="text-center">
                        <p className="text-4xl font-bold text-purple-400">{totalKeys.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 mt-1">key presses this session</p>
                    </div>
                </div>
            </div>

            {/* Combined activity timeline */}
            <div className="glass p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <h2 className="font-semibold">Activity Timeline</h2>
                    <span className="text-xs text-slate-400 ml-auto">Last 20 key events</span>
                </div>

                <div className="flex gap-1 h-12 items-end">
                    {Array.from({ length: 40 }).map((_, i) => {
                        const isRecent = i >= 40 - recentEvents.length;
                        const eventIdx = recentEvents.length - (40 - i);
                        const event = isRecent && eventIdx >= 0 ? recentEvents[eventIdx] : null;
                        return (
                            <motion.div
                                key={i}
                                className="flex-1 rounded-sm"
                                animate={{
                                    height: event ? '100%' : '20%',
                                    backgroundColor: event
                                        ? event.type === 'key_press'
                                            ? '#a855f7'
                                            : '#06b6d4'
                                        : '#1e293b',
                                }}
                                transition={{ duration: 0.2 }}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Older</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Key press</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Mouse click</span>
                    </div>
                    <span>Now</span>
                </div>
            </div>
        </div>
    );
}
