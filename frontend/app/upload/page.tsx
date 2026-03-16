'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Download, ArrowRight, Sparkles, Info } from 'lucide-react';
import { uploadAPI } from '@/lib/api';

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-redirect to dashboard after successful upload
    useEffect(() => {
        if (redirectCountdown === null) return;
        if (redirectCountdown <= 0) {
            router.push('/dashboard');
            return;
        }
        const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [redirectCountdown, router]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.name.endsWith('.csv')) {
            setFile(droppedFile);
            setResult(null);
            setError(null);
        } else {
            setError('Please drop a .csv file');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const res = await uploadAPI.uploadCSV(file);
            setResult(res);
            setFile(null);
            setRedirectCountdown(5);
        } catch (err: any) {
            console.error('Upload error:', err);
            const detail = err?.response?.data?.detail;
            if (err?.code === 'ECONNABORTED') {
                setError('Upload timed out. The server may be waking up (free tier). Please wait 30 seconds and try again.');
            } else if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
                setError('Cannot connect to server. The server may be starting up — please wait 30 seconds and try again.');
            } else if (detail) {
                setError(detail);
            } else {
                setError('Upload failed. The server may be starting up — please wait 30 seconds and try again.');
            }
        } finally {
            setUploading(false);
        }
    };

    const sampleCSV = `app_name,window_title,start_time,end_time,duration_seconds,mouse_clicks,key_presses
Visual Studio Code,main.py - project,2026-03-10T09:00:00,2026-03-10T09:45:00,2700,150,800
Google Chrome,GitHub - Pull Request,2026-03-10T09:45:00,2026-03-10T10:15:00,1800,200,300
Microsoft Teams,Sprint Meeting,2026-03-10T10:15:00,2026-03-10T11:00:00,2700,50,100
Google Chrome,YouTube - Music,2026-03-10T11:00:00,2026-03-10T11:15:00,900,30,10
Visual Studio Code,api.ts - frontend,2026-03-10T11:15:00,2026-03-10T12:30:00,4500,250,1500`;

    const downloadSample = () => {
        const blob = new Blob([sampleCSV], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_activity_data.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold gradient-text">Upload Data</h1>
                <p className="text-slate-400 mt-1">Import your activity data for ML analysis — any CSV format accepted</p>
            </div>

            {/* Smart Detection Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 px-4 py-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20"
            >
                <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300">
                    <span className="text-cyan-400 font-medium">Smart Column Detection</span> — Upload CSV files in any format. The system automatically detects and maps your columns to the required fields. Just make sure your file contains application name, start time, and either a duration or end time.
                </p>
            </motion.div>

            {/* Upload Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass p-8 border-2 border-dashed transition-colors cursor-pointer ${
                    dragOver ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <div className="text-center">
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <h3 className="text-lg font-semibold mb-2">
                        {file ? file.name : 'Drop your CSV file here'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        {file
                            ? `${(file.size / 1024).toFixed(1)} KB — Click "Upload" to import`
                            : 'or click to browse files • Any CSV format accepted'}
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </motion.div>

            {/* Upload Button */}
            <AnimatePresence>
                {file && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4"
                    >
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload & Analyze
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => { setFile(null); setError(null); }}
                            className="px-6 py-3 bg-slate-700 rounded-lg font-medium hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass p-6 border border-emerald-500/30 bg-emerald-500/5 space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-emerald-400">{result.message}</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Redirecting to Dashboard in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
                            >
                                Go Now
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Column Mapping Report */}
                        {result.column_mapping && Object.keys(result.column_mapping).length > 0 && (
                            <div className="pt-3 border-t border-emerald-500/20">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">Column Mapping</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(result.column_mapping).map(([field, csvCol]: [string, any]) => (
                                        <span key={field} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
                                            <span className="text-slate-400">{csvCol}</span>
                                            <ArrowRight className="w-3 h-3 text-emerald-500" />
                                            <span className="text-emerald-400 font-medium">{field}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skipped Rows Info */}
                        {result.rows_skipped > 0 && (
                            <div className="pt-3 border-t border-yellow-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <Info className="w-4 h-4 text-yellow-400" />
                                    <p className="text-sm text-yellow-400">
                                        {result.rows_skipped} row{result.rows_skipped !== 1 ? 's' : ''} skipped
                                    </p>
                                </div>
                                {result.skip_reasons && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {Object.entries(result.skip_reasons).map(([reason, count]: [string, any]) => (
                                            <span key={reason} className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                                                {reason}: {count}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass p-6 border border-red-500/30 bg-red-500/5"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-400">Upload Failed</h3>
                                <p className="text-sm text-slate-400 mt-1">{error}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSV Format Guide — Redesigned */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6 space-y-5"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-semibold">CSV Format Guide</h2>
                    </div>
                    <button
                        onClick={downloadSample}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/20 transition-all font-medium shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]"
                    >
                        <Download className="w-4 h-4" />
                        Download Sample
                    </button>
                </div>

                {/* Required vs Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <h3 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Required Fields</h3>
                        <div className="space-y-2.5">
                            <div>
                                <span className="font-mono text-cyan-400 text-sm">app_name</span>
                                <p className="text-xs text-slate-400 mt-0.5">Application or program name</p>
                                <p className="text-xs text-slate-600 mt-0.5">Also accepts: Application, Program, Software, App Name…</p>
                            </div>
                            <div>
                                <span className="font-mono text-cyan-400 text-sm">start_time</span>
                                <p className="text-xs text-slate-400 mt-0.5">When the activity started</p>
                                <p className="text-xs text-slate-600 mt-0.5">Also accepts: Start Date, Started At, Begin, Timestamp…</p>
                            </div>
                            <div>
                                <span className="font-mono text-cyan-400 text-sm">duration</span>
                                <span className="text-xs text-slate-500 ml-1">or</span>
                                <span className="font-mono text-cyan-400 text-sm ml-1">end_time</span>
                                <p className="text-xs text-slate-400 mt-0.5">Session length (seconds, minutes, or hours) or end time</p>
                                <p className="text-xs text-slate-600 mt-0.5">Also accepts: Duration Seconds, Minutes, Hours, End Date, Elapsed…</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Optional Fields</h3>
                        <div className="space-y-2.5">
                            <div>
                                <span className="font-mono text-cyan-400 text-sm">window_title</span>
                                <p className="text-xs text-slate-500 mt-0.5">Window or tab title</p>
                            </div>
                            <div>
                                <span className="font-mono text-cyan-400 text-sm">end_time</span>
                                <p className="text-xs text-slate-500 mt-0.5">When the activity ended</p>
                            </div>
                            <div>
                                <span className="font-mono text-cyan-400 text-sm">mouse_clicks</span>
                                <p className="text-xs text-slate-500 mt-0.5">Total mouse clicks in session</p>
                            </div>
                            <div>
                                <span className="font-mono text-cyan-400 text-sm">key_presses</span>
                                <p className="text-xs text-slate-500 mt-0.5">Total key presses in session</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accepted Formats */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Accepted Date/Time Formats</h3>
                    <div className="flex flex-wrap gap-2">
                        {[
                            '2026-03-10T09:00:00',
                            '2026-03-10 09:00:00',
                            '03/10/2026 09:00 AM',
                            '10/03/2026 09:00',
                            'Mar 10, 2026',
                            'Unix timestamps',
                        ].map((fmt) => (
                            <span key={fmt} className="text-xs px-2.5 py-1 rounded bg-slate-700/50 border border-slate-600/50 text-slate-300 font-mono">
                                {fmt}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                        Delimiter auto-detection: comma, semicolon, tab, and pipe-separated files are all supported.
                    </p>
                </div>

                {/* Sample Data Preview - Premium Highlight */}
                <div className="pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-semibold text-slate-200">Example Data Structure</h3>
                    </div>
                    <div className="overflow-hidden rounded-xl bg-slate-900/50 border border-slate-800 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-800/80 text-slate-300 font-mono">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-slate-700">app_name</th>
                                        <th className="px-4 py-3 border-b border-slate-700">window_title</th>
                                        <th className="px-4 py-3 border-b border-slate-700">start_time</th>
                                        <th className="px-4 py-3 border-b border-slate-700">duration_seconds</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-400 font-mono">
                                    <tr className="hover:bg-cyan-500/5 transition-colors group">
                                        <td className="px-4 py-3 border-b border-slate-800/50 text-cyan-400 font-medium">Visual Studio Code</td>
                                        <td className="px-4 py-3 border-b border-slate-800/50 group-hover:text-slate-300">frontend/app/page.tsx</td>
                                        <td className="px-4 py-3 border-b border-slate-800/50 text-slate-500">2026-03-10 09:00</td>
                                        <td className="px-4 py-3 border-b border-slate-800/50 text-blue-400">2700</td>
                                    </tr>
                                    <tr className="hover:bg-cyan-500/5 transition-colors group">
                                        <td className="px-4 py-3 border-b border-slate-800/50 text-cyan-400 font-medium">Google Chrome</td>
                                        <td className="px-4 py-3 border-b border-slate-800/50 group-hover:text-slate-300">React Documentation</td>
                                        <td className="px-4 py-3 border-b border-slate-800/50 text-slate-500">2026-03-10 09:45</td>
                                        <td className="px-4 py-3 border-b border-slate-800/50 text-blue-400">1800</td>
                                    </tr>
                                    <tr className="hover:bg-cyan-500/5 transition-colors group">
                                        <td className="px-4 py-3 text-cyan-400 font-medium">Terminal</td>
                                        <td className="px-4 py-3 group-hover:text-slate-300">npm run dev</td>
                                        <td className="px-4 py-3 text-slate-500">2026-03-10 10:15</td>
                                        <td className="px-4 py-3 text-blue-400">600</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
