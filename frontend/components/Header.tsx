'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Download } from 'lucide-react';
import { analyticsAPI } from '@/lib/api';
import { downloadBlob } from '@/lib/utils';

export default function Header() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

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
        <header className="glass border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Welcome back!</h2>
                    <p className="text-sm text-slate-400">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Export Button */}
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all"
                    >
                        <Download className="w-4 h-4" />
                        <span className="font-medium">Export CSV</span>
                    </button>

                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
