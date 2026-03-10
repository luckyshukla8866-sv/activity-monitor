'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Square,
    Activity,
    Camera,
    Layers,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Wifi,
    WifiOff,
    Monitor,
    Info,
} from 'lucide-react';
import { monitoringAPI } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';

interface MonitoringStatus {
    is_monitoring: boolean;
    start_time: string | null;
    total_sessions: number;
    total_screenshots: number;
    is_idle: boolean;
    current_app: string | null;
    action_log: { time: string; action: string }[];
    can_monitor?: boolean;
}

function formatDateTime(isoString: string): string {
    try {
        return new Date(isoString).toLocaleString();
    } catch {
        return isoString;
    }
}

function formatTime(isoString: string): string {
    try {
        return new Date(isoString).toLocaleTimeString();
    } catch {
        return isoString;
    }
}

export default function MonitoringControlPage() {
    const [status, setStatus] = useState<MonitoringStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<'start' | 'stop' | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [actionLog, setActionLog] = useState<{ time: string; action: string }[]>([]);
    const [isCloud, setIsCloud] = useState(false);

    const { lastEvent, isConnected } = useWebSocket();

    // Load initial status
    const loadStatus = useCallback(async () => {
        try {
            const data = await monitoringAPI.getStatus();
            setStatus(data);
            if (data.can_monitor === false) setIsCloud(true);
            if (data.action_log) setActionLog(data.action_log.reverse());
        } catch (err) {
            console.error('Failed to load status:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    // Update status from WebSocket events
    useEffect(() => {
        if (!lastEvent) return;

        if (lastEvent.type === 'status' || lastEvent.type === 'connected') {
            setStatus((prev) => ({
                ...(prev ?? {
                    is_monitoring: false,
                    start_time: null,
                    total_sessions: 0,
                    total_screenshots: 0,
                    is_idle: false,
                    current_app: null,
                    action_log: [],
                }),
                is_monitoring: lastEvent.is_monitoring ?? prev?.is_monitoring ?? false,
                is_idle: lastEvent.is_idle ?? prev?.is_idle ?? false,
                total_sessions: lastEvent.total_sessions ?? prev?.total_sessions ?? 0,
                total_screenshots: lastEvent.total_screenshots ?? prev?.total_screenshots ?? 0,
                current_app: lastEvent.current_app ?? prev?.current_app ?? null,
            }));
        }

        if (lastEvent.type === 'monitoring_started') {
            setStatus((prev) => prev ? { ...prev, is_monitoring: true } : prev);
            setActionLog((prev) => [
                { time: lastEvent.timestamp ?? new Date().toISOString(), action: 'Monitoring started' },
                ...prev,
            ].slice(0, 20));
        }

        if (lastEvent.type === 'monitoring_stopped') {
            setStatus((prev) => prev ? { ...prev, is_monitoring: false, current_app: null } : prev);
            setActionLog((prev) => [
                { time: lastEvent.timestamp ?? new Date().toISOString(), action: 'Monitoring stopped' },
                ...prev,
            ].slice(0, 20));
        }

        if (lastEvent.type === 'session_start') {
            setStatus((prev) =>
                prev ? { ...prev, current_app: lastEvent.app_name ?? prev.current_app } : prev
            );
        }
    }, [lastEvent]);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleStart = async () => {
        setActionLoading('start');
        try {
            const result = await monitoringAPI.start();
            if (result.is_cloud || result.can_monitor === false) {
                setIsCloud(true);
                showToast(result.message, 'info');
            } else if (result.success) {
                showToast('Monitoring started successfully!', 'success');
                await loadStatus();
            } else {
                showToast(result.message, 'error');
            }
        } catch {
            showToast('Failed to start monitoring. The server may not support activity tracking.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleStop = async () => {
        setActionLoading('stop');
        try {
            const result = await monitoringAPI.stop();
            if (result.success) {
                showToast('Monitoring stopped successfully!', 'success');
                await loadStatus();
            } else {
                showToast(result.message, 'error');
            }
        } catch {
            showToast('Failed to stop monitoring', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
            </div>
        );
    }

    const isRunning = status?.is_monitoring ?? false;
    const canMonitor = status?.can_monitor !== false && !isCloud;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Toast notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-medium max-w-md ${toast.type === 'success'
                                ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                                : toast.type === 'info'
                                    ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                                    : 'bg-red-500/20 border border-red-500/40 text-red-300'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 shrink-0" />
                        ) : toast.type === 'info' ? (
                            <Info className="w-4 h-4 shrink-0" />
                        ) : (
                            <XCircle className="w-4 h-4 shrink-0" />
                        )}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Monitoring Control</h1>
                    <p className="text-slate-400 mt-1">Start, stop, and monitor tracking status</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    {isConnected ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                        <WifiOff className="w-4 h-4 text-slate-400" />
                    )}
                    <span className={isConnected ? 'text-green-400' : 'text-slate-400'}>
                        {isConnected ? 'Live' : 'Reconnecting…'}
                    </span>
                </div>
            </div>

            {/* Cloud Environment Banner */}
            {isCloud && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-5 border border-amber-500/30 bg-amber-500/5"
                >
                    <div className="flex gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shrink-0 h-fit">
                            <Monitor className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-amber-400 font-semibold text-base mb-1">
                                Cloud Server Detected
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                This backend is running on a cloud server, which doesn&apos;t have a physical
                                screen, keyboard, or mouse. Live activity monitoring is only available when
                                the backend runs on your local computer.
                            </p>
                            <div className="mt-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                                <p className="text-slate-400 text-xs font-medium mb-2">
                                    To start monitoring, run this on your PC:
                                </p>
                                <code className="text-cyan-400 text-xs font-mono">
                                    cd backend &amp;&amp; python main.py --mode headless
                                </code>
                            </div>
                            <p className="text-slate-500 text-xs mt-2">
                                The dashboard, sessions, analytics, and screenshots viewing all work normally from this cloud deployment.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Big Status Card */}
            <motion.div
                className={`glass p-8 text-center border-2 transition-colors duration-500 ${isRunning
                        ? 'border-green-500/30 bg-green-500/5'
                        : isCloud
                            ? 'border-amber-500/20 bg-amber-500/5'
                            : 'border-slate-700/50'
                    }`}
                animate={{ scale: [1, 1.002, 1] }}
                transition={{ repeat: isRunning ? Infinity : 0, duration: 3 }}
            >
                {/* Status indicator */}
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center ${isRunning
                                    ? 'bg-green-500/20 border-2 border-green-500'
                                    : isCloud
                                        ? 'bg-amber-500/10 border-2 border-amber-500/50'
                                        : 'bg-slate-700/50 border-2 border-slate-600'
                                }`}
                        >
                            {isCloud && !isRunning ? (
                                <Monitor className="w-10 h-10 text-amber-400/70" />
                            ) : (
                                <Activity
                                    className={`w-10 h-10 ${isRunning ? 'text-green-400' : 'text-slate-500'}`}
                                />
                            )}
                        </div>
                        {isRunning && (
                            <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-green-400 animate-ping" />
                        )}
                    </div>
                </div>

                <h2 className={`text-3xl font-bold mb-2 ${isRunning ? 'text-green-400' : isCloud ? 'text-amber-400/80' : 'text-slate-400'}`}>
                    {isRunning
                        ? 'MONITORING ACTIVE'
                        : isCloud
                            ? 'CLOUD MODE'
                            : 'MONITORING STOPPED'}
                </h2>

                {isCloud && !isRunning && (
                    <p className="text-slate-400 text-sm mb-1">
                        Monitoring unavailable on cloud servers
                    </p>
                )}

                {isRunning && status?.current_app && (
                    <p className="text-slate-300 text-sm mb-1">
                        Currently tracking: <span className="text-cyan-400 font-medium">{status.current_app}</span>
                    </p>
                )}

                {isRunning && status?.is_idle && (
                    <div className="flex items-center justify-center gap-2 text-orange-400 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>User is idle</span>
                    </div>
                )}

                {isRunning && status?.start_time && (
                    <p className="text-slate-500 text-xs mt-2">
                        Started: {formatDateTime(status.start_time)}
                    </p>
                )}

                {/* Control Buttons */}
                <div className="flex justify-center gap-4 mt-8">
                    <motion.button
                        whileHover={{ scale: (isRunning || isCloud) ? 1 : 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleStart}
                        disabled={isRunning || actionLoading !== null || (isCloud && !canMonitor)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${isRunning || actionLoading !== null || (isCloud && !canMonitor)
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                            }`}
                    >
                        {actionLoading === 'start' ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                        Start Monitoring
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: !isRunning ? 1 : 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleStop}
                        disabled={!isRunning || actionLoading !== null}
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${!isRunning || actionLoading !== null
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
                            }`}
                    >
                        {actionLoading === 'stop' ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                        Stop Monitoring
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        icon: Layers,
                        label: 'Sessions Today',
                        value: status?.total_sessions ?? 0,
                        color: 'from-cyan-500 to-blue-500',
                    },
                    {
                        icon: Camera,
                        label: 'Screenshots',
                        value: status?.total_screenshots ?? 0,
                        color: 'from-purple-500 to-pink-500',
                    },
                    {
                        icon: Clock,
                        label: 'Status',
                        value: isRunning
                            ? (status?.is_idle ? 'Idle' : 'Active')
                            : isCloud ? 'Cloud' : 'Stopped',
                        color: isRunning
                            ? status?.is_idle
                                ? 'from-orange-500 to-amber-500'
                                : 'from-green-500 to-emerald-500'
                            : isCloud
                                ? 'from-amber-500 to-orange-500'
                                : 'from-slate-600 to-slate-700',
                    },
                ].map((stat) => (
                    <div key={stat.label} className="glass p-5 flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Log */}
            <div className="glass p-6">
                <h3 className="text-lg font-semibold mb-4">Action Log</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    <AnimatePresence initial={false}>
                        {actionLog.length === 0 ? (
                            <p className="text-slate-500 text-sm italic">No actions recorded yet.</p>
                        ) : (
                            actionLog.map((entry, i) => (
                                <motion.div
                                    key={`${entry.time}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-slate-800/40"
                                >
                                    <div className="flex items-center gap-2">
                                        {entry.action.includes('started') ? (
                                            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                        ) : (
                                            <Square className="w-4 h-4 text-red-400 shrink-0" />
                                        )}
                                        <span className="text-slate-300">{entry.action}</span>
                                    </div>
                                    <span className="text-slate-500 text-xs">{formatTime(entry.time)}</span>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
