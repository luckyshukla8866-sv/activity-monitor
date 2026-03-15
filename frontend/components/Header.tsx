'use client';

import { useState, useEffect } from 'react';
import { Download, User } from 'lucide-react';
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
        <header className="h-14 flex items-center justify-between px-6 bg-white/[0.02] border-b border-white/5 backdrop-blur-3xl shrink-0 z-10">
            <div>
                <h2 className="text-[17px] font-medium text-white/90 tracking-tight">Overview</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Live Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <LiveDot />
                    <span className="text-xs font-medium text-white/70 uppercase tracking-widest">Tracking Live</span>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-white/90 text-sm font-medium"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                </button>

                {/* User Avatar Placeholder */}
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-300" />
                </div>
            </div>
        </header>
    );
}
