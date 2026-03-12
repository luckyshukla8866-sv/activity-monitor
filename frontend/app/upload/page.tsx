'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { uploadAPI } from '@/lib/api';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                <p className="text-slate-400 mt-1">Import your activity data for ML analysis</p>
            </div>

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
                            : 'or click to browse files'}
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
            {file && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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

            {/* Success */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 border border-emerald-500/30 bg-emerald-500/5"
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                        <div>
                            <h3 className="font-semibold text-emerald-400">{result.message}</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Visit the ML Insights page to see your analysis results.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Error */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 border border-red-500/30 bg-red-500/5"
                >
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                        <div>
                            <h3 className="font-semibold text-red-400">Upload Failed</h3>
                            <p className="text-sm text-slate-400 mt-1">{error}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* CSV Format Guide */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-semibold">CSV Format Guide</h2>
                    </div>
                    <button
                        onClick={downloadSample}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download Sample
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="pb-2 text-slate-400 font-medium">Column</th>
                                <th className="pb-2 text-slate-400 font-medium">Required</th>
                                <th className="pb-2 text-slate-400 font-medium">Example</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            <tr className="border-b border-slate-800">
                                <td className="py-2 font-mono text-cyan-400">app_name</td>
                                <td className="py-2"><span className="text-emerald-400">Yes</span></td>
                                <td className="py-2">Visual Studio Code</td>
                            </tr>
                            <tr className="border-b border-slate-800">
                                <td className="py-2 font-mono text-cyan-400">window_title</td>
                                <td className="py-2">No</td>
                                <td className="py-2">main.py - project</td>
                            </tr>
                            <tr className="border-b border-slate-800">
                                <td className="py-2 font-mono text-cyan-400">start_time</td>
                                <td className="py-2"><span className="text-emerald-400">Yes</span></td>
                                <td className="py-2">2026-03-10T09:00:00</td>
                            </tr>
                            <tr className="border-b border-slate-800">
                                <td className="py-2 font-mono text-cyan-400">end_time</td>
                                <td className="py-2">No</td>
                                <td className="py-2">2026-03-10T09:45:00</td>
                            </tr>
                            <tr className="border-b border-slate-800">
                                <td className="py-2 font-mono text-cyan-400">duration_seconds</td>
                                <td className="py-2"><span className="text-emerald-400">Yes</span></td>
                                <td className="py-2">2700</td>
                            </tr>
                            <tr className="border-b border-slate-800">
                                <td className="py-2 font-mono text-cyan-400">mouse_clicks</td>
                                <td className="py-2">No</td>
                                <td className="py-2">150</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-mono text-cyan-400">key_presses</td>
                                <td className="py-2">No</td>
                                <td className="py-2">800</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
