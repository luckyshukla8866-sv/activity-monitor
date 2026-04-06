import { motion, AnimatePresence } from 'framer-motion';
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
        return <div className="p-8 text-center text-slate-400 font-mono text-sm">No sessions found for this filter</div>;
    }

    return (
        <div className="extrusion rounded-[2rem] w-full overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200/60 bg-[#eef1f3]">
                            {selectionMode && <th className="py-5 px-5 w-12 text-center" />}
                            <th className="py-5 px-5 text-slate-500 text-xs font-bold uppercase tracking-[0.1em] font-sans">Application</th>
                            <th className="py-5 px-5 text-slate-500 text-xs font-bold uppercase tracking-[0.1em] font-sans">Time Spent</th>
                            <th className="py-5 px-5 text-slate-500 text-xs font-bold uppercase tracking-[0.1em] font-sans">Details</th>
                            {!selectionMode && <th className="py-5 px-5 text-right text-slate-500 text-xs font-bold uppercase tracking-[0.1em] font-sans">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
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
                                            isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        {selectionMode && (
                                            <td className="py-5 px-5 w-12 text-center align-top pt-6">
                                                <button onClick={() => onToggleSelect(session.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 hover:border-indigo-400'}`}>
                                                    {isSelected && <span className="material-symbols-outlined text-[16px] text-white">check</span>}
                                                </button>
                                            </td>
                                        )}
                                        <td className="py-5 px-5 align-top">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-mono text-base shrink-0 shadow-sm">
                                                    {session.app_name.substring(0,2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800 font-sans tracking-wide text-sm">{session.app_name}</h3>
                                                    <p className="text-slate-500 text-xs mt-1 max-w-[200px] truncate leading-relaxed" title={session.window_title}>{session.window_title}</p>
                                                    
                                                    <AnimatePresence>
                                                        {isExpanded && !selectionMode && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-4 rounded-xl recessed bg-[#f5f7f9] border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                                                                    <div>
                                                                        <span className="text-slate-400 block mb-1 uppercase tracking-widest font-mono text-[10px]">Process ID</span>
                                                                        <span className="font-mono text-slate-700 font-medium">{session.process_id || 'N/A'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-slate-400 block mb-1 uppercase tracking-widest font-mono text-[10px]">End Time</span>
                                                                        <span className="text-slate-700 font-medium">{session.end_time ? formatDate(session.end_time) : 'Ongoing'}</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-5 align-top pt-8">
                                            <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-teal-50 text-teal-700 border border-teal-200/60 shadow-sm">
                                                {formatDuration(session.duration_seconds)}
                                            </span>
                                        </td>
                                        <td className="py-5 px-5 align-top pt-7">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                    {formatDate(session.start_time)}
                                                </div>
                                                {session.screenshot_count > 0 && (
                                                    <div className="text-[10px] text-indigo-500/80 uppercase tracking-widest font-mono font-bold">
                                                        {session.screenshot_count} screens
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {!selectionMode && (
                                            <td className="py-5 px-5 align-top pt-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onToggleExpand(session.id)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-700 transition-colors border border-slate-200 shadow-sm"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(session.id)}
                                                        className="w-8 h-8 flex items-center justify-center bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 border border-rose-200 shadow-sm transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
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
