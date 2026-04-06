'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAPI } from '@/lib/api';
import { isDemoUser } from '@/lib/auth-utils';
import OnboardingChatWidget from '@/components/OnboardingChatWidget';

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => { setIsDemo(isDemoUser()); }, []);

    useEffect(() => {
        if (redirectCountdown === null) return;
        if (redirectCountdown <= 0) { router.push('/dashboard'); return; }
        const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [redirectCountdown, router]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.name.endsWith('.csv')) { setFile(droppedFile); setResult(null); setError(null); }
        else { setError('Please drop a .csv file'); }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) { setFile(selected); setResult(null); setError(null); }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true); setError(null); setResult(null);
        try {
            const res = await uploadAPI.uploadCSV(file);
            setResult(res); setFile(null); setRedirectCountdown(5);
        } catch (err: any) {
            console.error('Upload error:', err);
            const detail = err?.response?.data?.detail;
            if (err?.code === 'ECONNABORTED') setError('Upload timed out. The server may be waking up. Please wait 30 seconds and try again.');
            else if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) setError('Cannot connect to server. The server may be starting up — please wait 30 seconds and try again.');
            else if (detail) setError(detail);
            else setError('Upload failed. The server may be starting up — please wait 30 seconds and try again.');
        } finally { setUploading(false); }
    };

    const downloadSample30Day = () => {
        const a = document.createElement('a');
        a.href = '/sample-30day-dataset.csv'; a.download = 'sample_30day_activity_data.csv'; a.click();
    };

    return (
        <div className="space-y-8">
            {/* Demo user restriction banner */}
            {isDemo && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
                    <div className="relative overflow-hidden rounded-[2rem] extrusion p-8 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />
                        <div className="relative z-10 space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-[1.5rem] recessed flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-500 text-3xl">lock</span>
                            </div>
                            <h2 className="text-xl font-bold text-[#2c2f31]" style={{fontFamily: 'Manrope, sans-serif'}}>Demo Account — Upload Restricted</h2>
                            <p className="text-sm text-[#595c5e] max-w-md mx-auto leading-relaxed">
                                Demo accounts can explore the Dashboard, ML Insights, Forecast, Sessions, and AI Coach
                                with pre-loaded sample data — but cannot upload new data.
                            </p>
                            <p className="text-sm text-[#747779]">
                                To upload and analyze your own activity data, create a free account:
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/login')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl cta-gradient text-white font-semibold text-sm cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                                Create Free Account
                            </motion.button>
                            <div className="flex justify-center gap-6 pt-2">
                                <button onClick={() => router.push('/dashboard')} className="text-xs text-[#2444eb] hover:text-[#0934e0] transition-colors cursor-pointer font-bold">
                                    ← Go to Dashboard
                                </button>
                                <button onClick={() => router.push('/insights')} className="text-xs text-[#2444eb] hover:text-[#0934e0] transition-colors cursor-pointer font-bold">
                                    View ML Insights →
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Regular upload UI — hidden for demo users */}
            {!isDemo && (<>
            <div>
                <h1 className="text-3xl font-bold text-[#2c2f31]" style={{fontFamily: 'Manrope, sans-serif'}}>Upload Data</h1>
                <p className="text-[#595c5e] mt-1">Import your activity data for ML analysis — any CSV format accepted</p>
            </div>

            {/* Smart Detection Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 px-5 py-4 rounded-[1.5rem] recessed"
            >
                <span className="material-symbols-outlined text-[#2444eb] mt-0.5">auto_awesome</span>
                <p className="text-sm text-[#595c5e]">
                    <span className="text-[#2444eb] font-bold">Smart Column Detection</span> — Upload CSV files in any format. The system automatically detects and maps your columns. Just make sure your file contains application name, start time, and either a duration or end time.
                </p>
            </motion.div>

            {/* ── Download 30-Day Sample Dataset Card ─────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="extrusion rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-56 h-56 bg-[#2444eb]/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#4647d3]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl recessed">
                                    <span className="material-symbols-outlined text-[#2444eb]">database</span>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#2444eb]">Quick Start</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-[#2c2f31]" style={{fontFamily: 'Manrope, sans-serif'}}>
                                Download 30-Day Sample Dataset
                            </h3>
                            <p className="text-sm text-[#595c5e] leading-relaxed max-w-lg">
                                No data yet? Download a realistic 30-day activity dataset and upload it to explore 
                                the full Dashboard, ML Insights, Forecast, and AI Coach features instantly.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full recessed text-[#595c5e] font-medium">
                                    <span className="material-symbols-outlined text-amber-500 text-[14px]">bolt</span> 401 sessions
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full recessed text-[#595c5e] font-medium">
                                    <span className="material-symbols-outlined text-[#2444eb] text-[14px]">database</span> 8 apps
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full recessed text-[#595c5e] font-medium">
                                    <span className="material-symbols-outlined text-[#4647d3] text-[14px]">calendar_month</span> 30 days
                                </span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={downloadSample30Day}
                            id="download-30day-sample"
                            className="shrink-0 cursor-pointer cta-gradient flex items-center gap-3 px-7 py-4 rounded-[1.5rem] text-white font-bold text-base"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            <div className="text-left">
                                <div className="text-sm font-bold">Download CSV</div>
                                <div className="text-[11px] font-normal text-white/70">~35 KB • Ready to upload</div>
                            </div>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Upload Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className={`p-8 border-2 border-dashed transition-all cursor-pointer rounded-[2rem] ${
                    dragOver ? 'border-[#2444eb] bg-[#2444eb]/5 extrusion' : 'border-[#abadaf] hover:border-[#2444eb]/50 recessed'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <div className="text-center">
                    <span className={`material-symbols-outlined text-5xl mb-4 block ${dragOver ? 'text-[#2444eb]' : 'text-[#747779]'}`}>cloud_upload</span>
                    <h3 className="text-lg font-bold text-[#2c2f31] mb-2" style={{fontFamily: 'Manrope, sans-serif'}}>
                        {file ? file.name : 'Drop your CSV file here'}
                    </h3>
                    <p className="text-[#595c5e] text-sm">
                        {file
                            ? `${(file.size / 1024).toFixed(1)} KB — Click "Upload" to import`
                            : 'or click to browse files • Any CSV format accepted'}
                    </p>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            </motion.div>

            {/* Upload Button */}
            <AnimatePresence>
                {file && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-4">
                        <button
                            onClick={handleUpload} disabled={uploading}
                            className="px-6 py-3 cta-gradient rounded-xl text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {uploading ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                                    Upload & Analyze
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => { setFile(null); setError(null); }}
                            className="px-6 py-3 extrusion rounded-xl font-bold text-[#595c5e] hover:text-[#2c2f31] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence>
                {result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="extrusion p-6 rounded-[2rem] space-y-4 border-l-4 border-emerald-500"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-500 text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                            <div className="flex-1">
                                <h3 className="font-bold text-emerald-600">{result.message}</h3>
                                <p className="text-sm text-[#595c5e] mt-1">
                                    Redirecting to Dashboard in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-4 py-2 cta-gradient rounded-xl text-sm font-bold text-white transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
                            >
                                Go Now
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>

                        {result.column_mapping && Object.keys(result.column_mapping).length > 0 && (
                            <div className="pt-3 border-t border-[#e5e9eb]">
                                <p className="text-xs text-[#747779] uppercase tracking-wider mb-2 font-bold">Column Mapping</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(result.column_mapping).map(([field, csvCol]: [string, any]) => (
                                        <span key={field} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full recessed">
                                            <span className="text-[#595c5e]">{csvCol}</span>
                                            <span className="material-symbols-outlined text-emerald-500 text-[12px]">arrow_forward</span>
                                            <span className="text-emerald-600 font-bold">{field}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result.rows_skipped > 0 && (
                            <div className="pt-3 border-t border-amber-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-amber-500 text-[18px]">info</span>
                                    <p className="text-sm text-amber-600 font-bold">
                                        {result.rows_skipped} row{result.rows_skipped !== 1 ? 's' : ''} skipped
                                    </p>
                                </div>
                                {result.skip_reasons && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {Object.entries(result.skip_reasons).map(([reason, count]: [string, any]) => (
                                            <span key={reason} className="text-xs px-2 py-0.5 rounded-full recessed text-amber-600 font-medium">
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="extrusion p-6 rounded-[2rem] border-l-4 border-red-500"
                    >
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500 text-2xl mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>error</span>
                            <div>
                                <h3 className="font-bold text-red-600">Upload Failed</h3>
                                <p className="text-sm text-[#595c5e] mt-1">{error}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSV Format Guide */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="extrusion p-6 rounded-[2rem] space-y-5"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#747779]">description</span>
                        <h2 className="text-lg font-bold text-[#2c2f31]" style={{fontFamily: 'Manrope, sans-serif'}}>CSV Format Guide</h2>
                    </div>
                    <button onClick={downloadSample30Day}
                        className="flex items-center gap-2 px-4 py-2 recessed text-[#2444eb] rounded-xl text-sm hover:bg-[#e5e9eb] transition-all font-bold cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Download 30-Day Sample
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-[1.5rem] border-l-4 border-emerald-500 recessed">
                        <h3 className="text-sm font-bold text-emerald-600 mb-3 uppercase tracking-wider">Required Fields</h3>
                        <div className="space-y-2.5">
                            <div>
                                <span className="font-mono text-[#2444eb] text-sm font-bold">app_name</span>
                                <p className="text-xs text-[#595c5e] mt-0.5">Application or program name</p>
                                <p className="text-xs text-[#747779] mt-0.5">Also accepts: Application, Program, Software, App Name…</p>
                            </div>
                            <div>
                                <span className="font-mono text-[#2444eb] text-sm font-bold">start_time</span>
                                <p className="text-xs text-[#595c5e] mt-0.5">When the activity started</p>
                                <p className="text-xs text-[#747779] mt-0.5">Also accepts: Start Date, Started At, Begin, Timestamp…</p>
                            </div>
                            <div>
                                <span className="font-mono text-[#2444eb] text-sm font-bold">duration</span>
                                <span className="text-xs text-[#747779] ml-1">or</span>
                                <span className="font-mono text-[#2444eb] text-sm font-bold ml-1">end_time</span>
                                <p className="text-xs text-[#595c5e] mt-0.5">Session length (seconds, minutes, or hours) or end time</p>
                                <p className="text-xs text-[#747779] mt-0.5">Also accepts: Duration Seconds, Minutes, Hours, End Date, Elapsed…</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-[1.5rem] recessed">
                        <h3 className="text-sm font-bold text-[#747779] mb-3 uppercase tracking-wider">Optional Fields</h3>
                        <div className="space-y-2.5">
                            <div>
                                <span className="font-mono text-[#4647d3] text-sm font-bold">window_title</span>
                                <p className="text-xs text-[#747779] mt-0.5">Window or tab title</p>
                            </div>
                            <div>
                                <span className="font-mono text-[#4647d3] text-sm font-bold">end_time</span>
                                <p className="text-xs text-[#747779] mt-0.5">When the activity ended</p>
                            </div>
                            <div>
                                <span className="font-mono text-[#4647d3] text-sm font-bold">mouse_clicks</span>
                                <p className="text-xs text-[#747779] mt-0.5">Total mouse clicks in session</p>
                            </div>
                            <div>
                                <span className="font-mono text-[#4647d3] text-sm font-bold">key_presses</span>
                                <p className="text-xs text-[#747779] mt-0.5">Total key presses in session</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-[1.5rem] recessed">
                    <h3 className="text-sm font-bold text-[#747779] mb-3 uppercase tracking-wider">Accepted Date/Time Formats</h3>
                    <div className="flex flex-wrap gap-2">
                        {['2026-03-10T09:00:00', '2026-03-10 09:00:00', '03/10/2026 09:00 AM', '10/03/2026 09:00', 'Mar 10, 2026', 'Unix timestamps'].map((fmt) => (
                            <span key={fmt} className="text-xs px-2.5 py-1 rounded-full extrusion text-[#595c5e] font-mono font-medium">
                                {fmt}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-[#747779] mt-2">
                        Delimiter auto-detection: comma, semicolon, tab, and pipe-separated files are all supported.
                    </p>
                </div>

                {/* Sample Data Preview */}
                <div className="pt-4 border-t border-[#e5e9eb]">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#2444eb]">auto_awesome</span>
                        <h3 className="text-sm font-bold text-[#2c2f31]" style={{fontFamily: 'Manrope, sans-serif'}}>Example Data Structure</h3>
                    </div>
                    <div className="overflow-hidden rounded-[1.5rem] border border-[#e5e9eb] extrusion">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-[#eef1f3] text-[#595c5e] font-mono">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-[#e5e9eb]">app_name</th>
                                        <th className="px-4 py-3 border-b border-[#e5e9eb]">window_title</th>
                                        <th className="px-4 py-3 border-b border-[#e5e9eb]">start_time</th>
                                        <th className="px-4 py-3 border-b border-[#e5e9eb]">duration_seconds</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[#595c5e] font-mono">
                                    <tr className="hover:bg-[#2444eb]/5 transition-colors">
                                        <td className="px-4 py-3 border-b border-[#eef1f3] text-[#2444eb] font-bold">Visual Studio Code</td>
                                        <td className="px-4 py-3 border-b border-[#eef1f3]">frontend/app/page.tsx</td>
                                        <td className="px-4 py-3 border-b border-[#eef1f3] text-[#747779]">2026-03-10 09:00</td>
                                        <td className="px-4 py-3 border-b border-[#eef1f3] text-[#4647d3] font-bold">2700</td>
                                    </tr>
                                    <tr className="hover:bg-[#2444eb]/5 transition-colors">
                                        <td className="px-4 py-3 border-b border-[#eef1f3] text-[#2444eb] font-bold">Google Chrome</td>
                                        <td className="px-4 py-3 border-b border-[#eef1f3]">React Documentation</td>
                                        <td className="px-4 py-3 border-b border-[#eef1f3] text-[#747779]">2026-03-10 09:45</td>
                                        <td className="px-4 py-3 border-b border-[#eef1f3] text-[#4647d3] font-bold">1800</td>
                                    </tr>
                                    <tr className="hover:bg-[#2444eb]/5 transition-colors">
                                        <td className="px-4 py-3 text-[#2444eb] font-bold">Terminal</td>
                                        <td className="px-4 py-3">npm run dev</td>
                                        <td className="px-4 py-3 text-[#747779]">2026-03-10 10:15</td>
                                        <td className="px-4 py-3 text-[#4647d3] font-bold">600</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Floating AI Chat Widget */}
            <OnboardingChatWidget />
            </>)}
        </div>
    );
}
