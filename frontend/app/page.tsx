'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Download,
    ArrowRight,
    Sparkles,
    Info,
    BarChart3,
    BrainCircuit,
    TrendingUp,
    Activity,
} from 'lucide-react';
import { uploadAPI } from '@/lib/api';

export default function LandingUploadPage() {
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
            // Start redirect countdown
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

    const features = [
        { icon: BarChart3, title: 'Dashboard Analytics', desc: 'Visualize your app usage with interactive charts' },
        { icon: BrainCircuit, title: 'ML Insights', desc: 'AI-powered productivity scoring and classification' },
        { icon: TrendingUp, title: 'Forecast & Burnout', desc: 'Predict peak hours and monitor work health' },
        { icon: Activity, title: 'Session History', desc: 'Browse, filter, and export your activity sessions' },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-3xl space-y-8">

                    {/* Logo & Title */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                            Activity Monitor
                        </h1>
                        <p className="text-slate-400 text-lg max-w-lg mx-auto">
                            Upload your activity data to get ML-powered productivity insights, forecasts, and analytics.
                        </p>
                    </motion.div>

                    {/* Smart Detection Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-start gap-3 px-4 py-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20"
                    >
                        <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-300">
                            <span className="text-cyan-400 font-medium">Smart Column Detection</span> — Upload CSV files in any format. The system automatically detects and maps your columns. Just include application name, start time, and either a duration or end time.
                        </p>
                    </motion.div>

                    {/* Upload Zone */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`glass p-10 border-2 border-dashed transition-colors cursor-pointer ${
                            dragOver ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-600 hover:border-slate-500'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <div className="text-center">
                            <Upload className={`w-14 h-14 mx-auto mb-4 ${dragOver ? 'text-cyan-400' : 'text-slate-500'}`} />
                            <h3 className="text-xl font-semibold mb-2">
                                {file ? file.name : 'Drop your CSV file here'}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                {file
                                    ? `${(file.size / 1024).toFixed(1)} KB — Click "Upload & Analyze" to import`
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

                    {/* Upload Button + Download Sample */}
                    <AnimatePresence>
                        {file && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex gap-4 justify-center"
                            >
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 text-lg"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
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

                    {!file && !result && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex justify-center gap-4"
                        >
                            <button
                                onClick={downloadSample}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download Sample CSV
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-sm hover:bg-slate-700 transition-colors text-slate-300"
                            >
                                Skip to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {/* Success → Redirect */}
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
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
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

                    {/* Feature Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="glass p-4 text-center group hover:border-cyan-500/30 transition-colors"
                            >
                                <f.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                                <p className="text-xs text-slate-500">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CSV Format: collapsible */}
                    <motion.details
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="glass overflow-hidden"
                    >
                        <summary className="p-5 cursor-pointer flex items-center gap-3 hover:bg-slate-800/30 transition-colors select-none">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <span className="font-semibold">CSV Format Guide</span>
                            <span className="text-xs text-slate-500 ml-auto">Click to expand</span>
                        </summary>
                        <div className="px-5 pb-5 space-y-4 border-t border-slate-700/50">
                            {/* Required vs Optional Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                    <h3 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Required Fields</h3>
                                    <div className="space-y-2.5">
                                        <div>
                                            <span className="font-mono text-cyan-400 text-sm">app_name</span>
                                            <p className="text-xs text-slate-400 mt-0.5">Also accepts: Application, Program, Software...</p>
                                        </div>
                                        <div>
                                            <span className="font-mono text-cyan-400 text-sm">start_time</span>
                                            <p className="text-xs text-slate-400 mt-0.5">Also accepts: Start Date, Started At, Timestamp...</p>
                                        </div>
                                        <div>
                                            <span className="font-mono text-cyan-400 text-sm">duration</span>
                                            <span className="text-xs text-slate-500 ml-1">or</span>
                                            <span className="font-mono text-cyan-400 text-sm ml-1">end_time</span>
                                            <p className="text-xs text-slate-400 mt-0.5">Seconds, minutes, or hours — or an end time column</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Optional Fields</h3>
                                    <div className="space-y-2.5 text-xs text-slate-500">
                                        <p><span className="font-mono text-cyan-400">window_title</span> — Window or tab title</p>
                                        <p><span className="font-mono text-cyan-400">end_time</span> — When activity ended</p>
                                        <p><span className="font-mono text-cyan-400">mouse_clicks</span> — Click count</p>
                                        <p><span className="font-mono text-cyan-400">key_presses</span> — Keystroke count</p>
                                    </div>
                                </div>
                            </div>

                            {/* Date Formats */}
                            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Accepted Date/Time Formats</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['2026-03-10T09:00:00', '2026-03-10 09:00:00', '03/10/2026 09:00 AM', '10/03/2026 09:00', 'Mar 10, 2026', 'Unix timestamps'].map((fmt) => (
                                        <span key={fmt} className="text-xs px-2.5 py-1 rounded bg-slate-700/50 border border-slate-600/50 text-slate-300 font-mono">{fmt}</span>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 mt-2">Also supports semicolon, tab, and pipe delimiters.</p>
                            </div>
                        </div>
                    </motion.details>
                </div>
            </div>
        </div>
    );
}
