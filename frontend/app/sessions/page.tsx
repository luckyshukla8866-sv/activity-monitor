'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, X, Download, MousePointer, Trash2, SlidersHorizontal } from 'lucide-react';
import { sessionsAPI, analyticsAPI } from '@/lib/api';
import GlassCard from '@/components/GlassCard';
import FilterChipBar from '@/components/FilterChipBar';
import SessionsTable from '@/components/SessionsTable';
import AnimatedEmptyState from '@/components/AnimatedEmptyState';
import { formatDuration } from '@/lib/utils';

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
                    <h1 className="text-2xl font-semibold tracking-tight text-white/90">Activity Sessions</h1>
                    <p className="text-sm text-white/40 mt-1 flex items-center gap-2">
                        Detailed log of all tracked application usage
                        {selectionMode && selectedIds.size > 0 && (
                            <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full text-xs font-mono font-medium border border-indigo-500/20">
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
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors text-white/80"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">{allSelected ? 'Deselect All' : 'Select All'}</span>
                            </button>
                            <button
                                onClick={exitSelectionMode}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors text-white/60 hover:text-white/90"
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
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm transition-colors font-medium text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/50"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export CSV'}</span>
                            </button>
                            <button
                                onClick={() => setSelectionMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors text-white/80"
                            >
                                <MousePointer className="w-4 h-4" />
                                <span className="hidden sm:inline">Select Rows</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters Area */}
            <motion.div variants={containerVariants}>
                <GlassCard className="p-4 flex flex-col sm:flex-row items-center gap-4 border-white/5 rounded-2xl">
                    <div className="relative w-full sm:w-64 shrink-0">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <SlidersHorizontal className="h-4 w-4 text-white/30" />
                        </div>
                        <input
                            type="text"
                            placeholder="Filter by app name..."
                            value={filter.appName}
                            onChange={(e) => handleAppFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all font-sans placeholder:text-white/20"
                        />
                    </div>
                    {knownApps.length > 0 && (
                        <div className="w-full sm:w-auto flex-1 border-l border-white/10 pl-0 sm:pl-4 overflow-hidden mask-fade-edges">
                            <FilterChipBar apps={knownApps} activeApp={filter.appName} onSelectApp={handleAppFilter} />
                        </div>
                    )}
                </GlassCard>
            </motion.div>

            {/* Sessions Table Area */}
            <motion.div variants={containerVariants}>
                <div className="relative">
                    {loading ? (
                        <div className="w-full h-[500px] border border-white/5 bg-white/[0.02] rounded-2xl animate-pulse" />
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
                        <div className="absolute inset-0 bg-[#0a0a16]/40 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <motion.div variants={containerVariants} className="flex flex-col items-center gap-2 mt-8">
                     <div className="flex items-center justify-center gap-1.5 p-1 bg-white/5 rounded-full border border-white/10">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-6 py-2 bg-transparent hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-full transition-colors text-sm font-medium text-white/80"
                        >
                            Previous
                        </button>
                        <div className="px-4 py-2 text-sm text-white/40 font-mono flex items-center gap-2">
                           <span className="text-white">Page {page}</span>
                           <span className="text-white/20">/</span>
                           <span>{totalPages}</span>
                        </div>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 rounded-full transition-colors text-sm font-medium text-white border border-white/5 shadow-sm"
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
                        <div className="flex items-center gap-4 px-6 py-4 bg-[#0a0a16]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
                            <span className="text-sm text-white/50 flex flex-col">
                                <span className="font-semibold text-white text-lg tracking-tight leading-none">{selectedIds.size}</span>
                                <span className="text-[10px] uppercase tracking-widest mt-1">Selected</span>
                            </span>
                            
                            <div className="w-px h-8 bg-white/10 mx-2" />
                            
                            <button
                                onClick={exitSelectionMode}
                                className="px-4 py-2 hover:bg-white/5 rounded-xl text-sm transition-colors text-white/60 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="flex items-center gap-2 px-6 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-400"
                            >
                                {bulkDeleting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
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
