'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Trash2, ChevronDown, ChevronUp, MousePointer, CheckCheck, X, Download } from 'lucide-react';
import { sessionsAPI, analyticsAPI } from '@/lib/api';
import { formatDuration, formatDate } from '@/lib/utils';

export default function SessionsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [filter, setFilter] = useState({ appName: '' });

    // Bulk selection state
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadSessions();
    }, [page, filter]);

    const loadSessions = async () => {
        // First load: show skeletons. Subsequent: refresh silently in background
        if (sessions.length === 0) setLoading(true);
        else setRefreshing(true);
        try {
            const result = await sessionsAPI.list({
                page,
                page_size: 20,
                app_name: filter.appName || undefined,
            });
            setSessions(result.items);
            setTotalPages(result.total_pages);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ── CSV Export ─────────────────────────────────────────────────
    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const blob = await analyticsAPI.exportCSV();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity_export_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExporting(false);
        }
    };

    // ── Single delete ──────────────────────────────────────────────
    const handleDelete = async (id: number) => {
        if (!confirm('Delete this session and its screenshots?')) return;
        try {
            await sessionsAPI.delete(id);
            loadSessions();
        } catch {
            alert('Failed to delete session');
        }
    };

    // ── Selection helpers ──────────────────────────────────────────
    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => setSelectedIds(new Set(sessions.map((s) => s.id)));
    const deselectAll = () => setSelectedIds(new Set());

    const exitSelectionMode = () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    };

    // ── Bulk delete ────────────────────────────────────────────────
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} session${selectedIds.size > 1 ? 's' : ''} and all their screenshots? This cannot be undone.`)) return;

        setBulkDeleting(true);
        try {
            await sessionsAPI.bulkDelete(Array.from(selectedIds));
            exitSelectionMode();
            loadSessions();
        } catch {
            alert('Failed to delete selected sessions');
        } finally {
            setBulkDeleting(false);
        }
    };

    const allSelected = sessions.length > 0 && selectedIds.size === sessions.length;

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Activity Sessions</h1>
                    <p className="text-slate-400 mt-1">
                        View and manage your activity history
                        {selectionMode && selectedIds.size > 0 && (
                            <span className="ml-2 text-cyan-400">· {selectedIds.size} selected</span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectionMode ? (
                        <>
                            <button
                                onClick={allSelected ? deselectAll : selectAll}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                            >
                                <CheckCheck className="w-4 h-4" />
                                {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                            <button
                                onClick={exitSelectionMode}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleExportCSV}
                                disabled={exporting}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-sm transition-colors font-medium"
                            >
                                <Download className="w-4 h-4" />
                                {exporting ? 'Exporting…' : 'Export CSV'}
                            </button>
                            <button
                                onClick={() => setSelectionMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                            >
                                <MousePointer className="w-4 h-4" />
                                Select
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filter */}
            <div className="glass p-4">
                <input
                    type="text"
                    placeholder="Filter by app name..."
                    value={filter.appName}
                    onChange={(e) => {
                        setFilter({ ...filter, appName: e.target.value });
                        setPage(1);
                    }}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
                {loading ? (
                    // Skeleton rows — visible immediately, no blank screen
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass p-4 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-40 bg-slate-700 rounded" />
                                    <div className="h-3 w-64 bg-slate-700/60 rounded" />
                                    <div className="h-3 w-32 bg-slate-700/40 rounded" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 bg-slate-700 rounded-lg" />
                                    <div className="w-8 h-8 bg-slate-700 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : sessions.length === 0 ? (
                    <div className="glass p-8 text-center text-slate-400">No sessions found</div>
                ) : (
                    sessions.map((session) => {
                        const isSelected = selectedIds.has(session.id);
                        return (
                            <div
                                key={session.id}
                                className={`glass p-4 transition-all ${selectionMode && isSelected
                                    ? 'ring-2 ring-cyan-500 bg-cyan-500/5'
                                    : selectionMode
                                        ? 'hover:ring-2 hover:ring-slate-600'
                                        : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    {/* Checkbox (selection mode) */}
                                    {selectionMode && (
                                        <button
                                            onClick={() => toggleSelect(session.id)}
                                            className="mr-3 shrink-0"
                                        >
                                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected
                                                ? 'bg-cyan-500 border-cyan-500'
                                                : 'border-slate-500 hover:border-cyan-400'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    )}

                                    {/* Session info — clicking row toggles selection in selection mode */}
                                    <div
                                        className={`flex-1 ${selectionMode ? 'cursor-pointer' : ''}`}
                                        onClick={() => selectionMode && toggleSelect(session.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold">{session.app_name}</h3>
                                            <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded">
                                                {formatDuration(session.duration_seconds)}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm mt-1">{session.window_title}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(session.start_time)}
                                            </span>
                                            {session.screenshot_count > 0 && (
                                                <span>{session.screenshot_count} screenshots</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons (non-selection mode) */}
                                    {!selectionMode && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                {expandedId === session.id ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Details */}
                                {!selectionMode && expandedId === session.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-sm"
                                    >
                                        <div>
                                            <span className="text-slate-400">Process ID:</span>
                                            <span className="ml-2">{session.process_id || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">End Time:</span>
                                            <span className="ml-2">{session.end_time ? formatDate(session.end_time) : 'Ongoing'}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Bulk Action Toolbar */}
            <AnimatePresence>
                {selectionMode && selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-4 glass border border-slate-600 rounded-2xl shadow-2xl"
                    >
                        <span className="text-sm text-slate-300">
                            <span className="font-bold text-white">{selectedIds.size}</span> selected
                        </span>
                        <button
                            onClick={exitSelectionMode}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-colors"
                        >
                            {bulkDeleting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Delete {selectedIds.size} Session{selectedIds.size > 1 ? 's' : ''}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
