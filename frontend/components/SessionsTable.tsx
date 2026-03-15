import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, Trash2, Check } from 'lucide-react';
import { formatDuration, formatDate } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';

interface SessionsTableProps {
    sessions: any[];
    selectedIds: Set<number>;
    selectionMode: boolean;
    expandedId: number | null;
    onToggleSelect: (id: number) => void;
    onToggleExpand: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function SessionsTable({
    sessions,
    selectedIds,
    selectionMode,
    expandedId,
    onToggleSelect,
    onToggleExpand,
    onDelete,
}: SessionsTableProps) {
    if (sessions.length === 0) {
        return <div className="p-8 text-center text-white/40 font-mono text-sm">No sessions found for this filter</div>;
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5 backdrop-blur-md">
                            {selectionMode && <th className="py-4 px-4 w-12 text-center" />}
                            <th className="py-4 px-4 text-white/40 text-xs font-semibold uppercase tracking-wider font-sans">Application</th>
                            <th className="py-4 px-4 text-white/40 text-xs font-semibold uppercase tracking-wider font-sans">Time Spent</th>
                            <th className="py-4 px-4 text-white/40 text-xs font-semibold uppercase tracking-wider font-sans">Details</th>
                            {!selectionMode && <th className="py-4 px-4 text-right text-white/40 text-xs font-semibold uppercase tracking-wider font-sans">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <AnimatePresence>
                            {sessions.map((session, i) => {
                                const isSelected = selectedIds.has(session.id);
                                const isExpanded = expandedId === session.id;

                                return (
                                    <motion.tr
                                        key={session.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: i * 0.05 }}
                                        className={`group transition-colors ${
                                            isSelected ? 'bg-indigo-500/10' : 'hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        {selectionMode && (
                                            <td className="py-4 px-4 w-12 text-center align-top pt-5">
                                                <button onClick={() => onToggleSelect(session.id)} className="w-5 h-5 rounded border border-white/20 flex items-center justify-center transition-colors hover:border-indigo-400 group-hover:border-white/40">
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                                                </button>
                                            </td>
                                        )}
                                        <td className="py-4 px-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 font-mono text-sm shrink-0">
                                                    {session.app_name.substring(0,2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-white/90 font-sans tracking-wide">{session.app_name}</h3>
                                                    <p className="text-white/40 text-xs mt-1 max-w-[200px] truncate" title={session.window_title}>{session.window_title}</p>
                                                    
                                                    <AnimatePresence>
                                                        {isExpanded && !selectionMode && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-4 rounded-xl bg-black/20 border border-white/5 grid grid-cols-2 gap-4 text-xs">
                                                                    <div>
                                                                        <span className="text-white/30 block mb-1 uppercase tracking-widest font-mono text-[10px]">Process ID</span>
                                                                        <span className="font-mono text-white/70">{session.process_id || 'N/A'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-white/30 block mb-1 uppercase tracking-widest font-mono text-[10px]">End Time</span>
                                                                        <span className="text-white/70">{session.end_time ? formatDate(session.end_time) : 'Ongoing'}</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 align-top pt-5">
                                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                                                {formatDuration(session.duration_seconds)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 align-top pt-5">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1.5 text-white/50 text-xs">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(session.start_time)}
                                                </div>
                                                {session.screenshot_count > 0 && (
                                                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
                                                        {session.screenshot_count} screens
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {!selectionMode && (
                                            <td className="py-4 px-4 align-top pt-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onToggleExpand(session.id)}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/90 transition-colors border border-white/5 shadow-sm"
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(session.id)}
                                                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 border border-rose-500/20 shadow-sm transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
