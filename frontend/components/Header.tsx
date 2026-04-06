'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI } from '@/lib/api';
import { downloadBlob } from '@/lib/utils';
import LiveDot from './LiveDot';

export default function Header() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleExportCSV = async () => {
        try {
            const blob = await analyticsAPI.exportCSV();
            const filename = `activity_export_${new Date().toISOString().split('T')[0]}.csv`;
            downloadBlob(blob, filename);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export data');
        }
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 z-10 w-full shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight font-manrope">Overview</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Live Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                    <LiveDot />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Tracking Live</span>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 rounded-xl transition-all text-indigo-700 text-sm font-bold shadow-sm active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span className="hidden sm:inline">Export</span>
                </button>

                {/* User Avatar Placeholder */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600">person</span>
                </div>
            </div>
        </header>
    );
}
