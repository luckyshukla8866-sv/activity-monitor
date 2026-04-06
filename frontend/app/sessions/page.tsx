'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionsAPI, analyticsAPI } from '@/lib/api';
import FilterChipBar from '@/components/FilterChipBar';
import SessionsTable from '@/components/SessionsTable';
import AnimatedEmptyState from '@/components/AnimatedEmptyState';

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
    const [knownApps, setKnownApps] = useState<string[]>([]);

    useEffect(() => {
        loadSessions();
    }, [page, filter]);

    const loadSessions = async () => {
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
            
            // Extract unique apps for the filter chip bar (ideally from a separate API, but this works for now)
            if (page === 1 && !filter.appName) {
                const apps = Array.from(new Set(result.items.map((s: any) => s.app_name))) as string[];
                setKnownApps(apps.slice(0, 10)); // Just the top few for quick filters
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

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

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this session and its screenshots?')) return;
        try {
            await sessionsAPI.delete(id);
            loadSessions();
        } catch {
            alert('Failed to delete session');
        }
    };

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

    const handleToggleExpand = (id: number) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const handleAppFilter = (appName: string) => {
        setFilter({ ...filter, appName });
        setPage(1);
    };

    const allSelected = sessions.length > 0 && selectedIds.size === sessions.length;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-24 font-sans max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 font-manrope">Activity Sessions</h1>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2 font-inter">
                        Detailed log of all tracked application usage
                        {selectionMode && selectedIds.size > 0 && (
                            <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full text-xs font-mono font-medium border border-indigo-200">
                                {selectedIds.size} selected
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectionMode ? (
                        <>
                            <button
                                onClick={allSelected ? deselectAll : selectAll}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl text-sm transition-colors text-slate-700"
                            >
                                <span className="material-symbols-outlined text-[18px]">done_all</span>
                                <span className="hidden sm:inline">{allSelected ? 'Deselect All' : 'Select All'}</span>
                            </button>
                            <button
                                onClick={exitSelectionMode}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl text-sm transition-colors text-slate-500 hover:text-slate-800"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleExportCSV}
                                disabled={exporting}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 rounded-xl text-sm transition-colors font-medium text-white shadow-md shadow-indigo-600/20 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export CSV'}</span>
                            </button>
                            <button
                                onClick={() => setSelectionMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl text-sm transition-colors text-slate-700 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">touch_app</span>
                                <span className="hidden sm:inline">Select Rows</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters Area */}
            <motion.div variants={containerVariants}>
                <div className="extrusion p-4 flex flex-col sm:flex-row items-center gap-4 rounded-[2rem]">
                    <div className="relative w-full sm:w-64 shrink-0">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-[18px] text-slate-400">tune</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Filter by app name..."
                            value={filter.appName}
                            onChange={(e) => handleAppFilter(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 recessed bg-[#f5f7f9] border-none rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-sans placeholder:text-slate-400 font-medium"
                        />
                    </div>
                    {knownApps.length > 0 && (
                        <div className="w-full sm:w-auto flex-1 border-l border-slate-200 pl-0 sm:pl-4 overflow-hidden">
                            <FilterChipBar apps={knownApps} activeApp={filter.appName} onSelectApp={handleAppFilter} />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Sessions Table Area */}
            <motion.div variants={containerVariants}>
                <div className="relative">
                    {loading ? (
                        <div className="w-full h-[500px] border border-slate-100 bg-[#f5f7f9] rounded-[2rem] animate-pulse" />
                    ) : sessions.length === 0 ? (
                        <AnimatedEmptyState />
                    ) : (
                        <SessionsTable 
                            sessions={sessions} 
                            selectedIds={selectedIds} 
                            selectionMode={selectionMode} 
                            expandedId={expandedId} 
                            onToggleSelect={toggleSelect} 
                            onToggleExpand={handleToggleExpand} 
                            onDelete={handleDelete} 
                        />
                    )}
                    
                    {/* Refreshing overlay */}
                    {refreshing && !loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-[2rem]">
                            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <motion.div variants={containerVariants} className="flex flex-col items-center gap-2 mt-8">
                     <div className="flex items-center justify-center gap-2 p-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-6 py-2 bg-transparent hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-full transition-colors text-sm font-medium text-slate-600"
                        >
                            Previous
                        </button>
                        <div className="px-5 py-2 text-sm text-slate-500 font-mono flex items-center gap-2 bg-slate-50 rounded-full border border-slate-100">
                           <span className="text-slate-700 font-bold">Page {page}</span>
                           <span className="text-slate-300">/</span>
                           <span>{totalPages}</span>
                        </div>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:bg-slate-200 rounded-full transition-colors text-sm font-medium text-white shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Bulk Action Toolbar Overlay */}
            <AnimatePresence>
                {selectionMode && selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 80, opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
                    >
                        <div className="flex items-center gap-4 px-6 py-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-2xl ring-1 ring-black/5">
                            <span className="text-sm text-slate-500 flex flex-col items-center justify-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                                <span className="font-bold text-slate-800 text-lg tracking-tight leading-none">{selectedIds.size}</span>
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] mt-1 text-slate-400">Selected</span>
                            </span>
                            
                            <div className="w-px h-10 bg-slate-200 mx-2" />
                            
                            <button
                                onClick={exitSelectionMode}
                                className="px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors text-slate-500 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all text-white shadow-md shadow-rose-500/30"
                            >
                                {bulkDeleting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                )}
                                Delete Sessions
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
