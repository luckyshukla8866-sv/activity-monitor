'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, Brain, Activity, Code, Download } from 'lucide-react';
import { uploadAPI } from '@/lib/api';
import GradientText from '@/components/GradientText';
import Pill from '@/components/Pill';
import BackgroundSystem from '@/components/BackgroundSystem';

function FloatingStat({ val, label, top, left, bottom, right, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, transition: { delay, duration: 0.8 } }}
            className={`absolute ${top ? `top-[${top}]` : ''} ${left ? `left-[${left}]` : ''} ${bottom ? `bottom-[${bottom}]` : ''} ${right ? `right-[${right}]` : ''} hidden lg:flex items-center gap-3 glass-card px-4 py-3 border border-white/10`}
            style={{ 
                top: top, left: left, bottom: bottom, right: right,
                animation: `floatBob 6s ease-in-out infinite alternate ${delay}s`
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99,102,241,0.15)' }}
        >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div>
                <div className="font-mono text-lg font-medium tracking-tight text-white/90">{val}</div>
                <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
            </div>
        </motion.div>
    );
}

export default function LandingUploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploadState, setUploadState] = useState<'IDLE' | 'DRAGGING' | 'PARSING' | 'DONE'>('IDLE');
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.name.endsWith('.csv')) {
            await processFile(droppedFile);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            await processFile(selected);
        }
    };

    const processFile = async (selectedFile: File) => {
        setFile(selectedFile);
        setUploadState('PARSING');
        
        // Simulating parsing progress steps
        for(let i=0; i<=100; i+=20) {
            setProgress(i);
            await new Promise(r => setTimeout(r, 200));
        }

        try {
            await uploadAPI.uploadCSV(selectedFile);
            setUploadState('DONE');
            setTimeout(() => {
                router.push('/dashboard');
            }, 600);
        } catch (err: any) {
            console.error(err);
            setUploadState('IDLE');
            setFile(null);
            setProgress(0);
            alert('Upload failed: ' + (err?.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-10 overflow-hidden font-sans">
            <BackgroundSystem />
            
            {/* Top Bar Logo */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <GradientText className="text-xl font-bold tracking-tight">Activity Monitor</GradientText>
                </div>
                <Pill color="emerald" className="hidden sm:flex self-start mt-1 gap-2 border-emerald-500/20 bg-emerald-500/10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold tracking-wider">LIVE DATA STREAM</span>
                </Pill>
            </div>

            {/* Floating Stats - Decoration */}
            <FloatingStat top="20%" left="10%" val="2,401" label="HOURS TRACKED" delay={0} />
            <FloatingStat top="15%" right="12%" val="98.2%" label="ML ACCURACY" delay={0.5} />
            <FloatingStat bottom="25%" left="8%" val="Top 5%" label="DEEP WORK" delay={1} />
            <FloatingStat bottom="30%" right="10%" val="No Risk" label="BURNOUT CHANCE" delay={1.5} />

            {/* Hero Section */}
            <motion.div
                variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.08 } }
                }}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[640px] flex flex-col items-center text-center z-10"
            >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <Pill color="indigo" className="mb-6 flex items-center gap-2 pr-4 bg-indigo-500/10 border-indigo-500/20">
                        <Brain className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-indigo-300">Powered by Local Next.js Models</span>
                    </Pill>
                </motion.div>

                <motion.h1 
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-[clamp(40px,7vw,72px)] font-bold leading-[1.1] tracking-[-0.03em] text-white/95 mb-4 font-['Outfit']"
                >
                    Understand your <br className="hidden sm:block" />
                    <span className="bg-clip-text text-transparent bg-[linear-gradient(200deg,#fff,#6366f1,#38bdf8)] animate-[shimmer_4s_ease_infinite] bg-[length:200%_auto]">
                        productivity patterns
                    </span>
                </motion.h1>

                <motion.p 
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-[16px] text-white/50 max-w-[480px] mb-12 leading-relaxed font-light"
                >
                    Drop your activity logs. Our local machine learning models map your focus hours, categorize apps, and predict burnout risk.
                </motion.p>

                {/* Upload Card */}
                <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0,0.55,0.45,1] } } }}
                    className="w-full"
                >
                    <div className="glass-card-elevated relative bg-white/[0.04] p-[2px] rounded-[32px] group">
                        {/* Gradient Wrapper border */}
                        <div className={`absolute inset-0 rounded-[32px] -z-10 bg-gradient-to-br from-indigo-500 via-sky-400 to-violet-500 transition-opacity duration-500 
                            ${dragOver || uploadState === 'PARSING' ? 'opacity-100' : 'opacity-[0.15] group-hover:opacity-30'}`} 
                        />
                        
                        <div className="bg-[#0a0a16]/90 backdrop-blur-[60px] rounded-[30px] p-6 pb-5 border border-white/5">
                            
                            {/* Drop Zone */}
                            <motion.div 
                                className={`relative h-[200px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden
                                    ${dragOver ? 'border-transparent bg-indigo-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                onClick={() => uploadState === 'IDLE' && fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); if(uploadState === 'IDLE') setUploadState('DRAGGING'); }}
                                onDragLeave={() => { setDragOver(false); if(uploadState === 'DRAGGING') setUploadState('IDLE'); }}
                                onDrop={handleDrop}
                                whileHover={uploadState === 'IDLE' ? { scale: 1.01 } : {}}
                            >
                                {dragOver && (
                                    <div className="absolute inset-[-4px] rounded-2xl border-2 border-transparent bg-[conic-gradient(from_0deg,#6366f1,#38bdf8,#a855f7,#6366f1)] [-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] mask-composite-exclude p-[2px] animate-[spinBorder_3s_linear_infinite]" />
                                )}

                                <AnimatePresence mode="wait">
                                    {uploadState === 'IDLE' && !dragOver && (
                                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center pointer-events-none">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40 shadow-xl">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-white/90 font-medium mb-1">Drop your CSV here</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-mono text-white/30 px-2 py-0.5 rounded border border-white/10 bg-white/5">app_name</span>
                                                <span className="text-[10px] font-mono text-white/30 px-2 py-0.5 rounded border border-white/10 bg-white/5">start_time</span>
                                                <span className="text-[10px] font-mono text-white/30 px-2 py-0.5 rounded border border-white/10 bg-white/5">duration</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {(dragOver || uploadState === 'DRAGGING') && (
                                        <motion.div key="dragging" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center pointer-events-none">
                                            <Upload className="w-12 h-12 text-indigo-400 mb-3 animate-bounce" />
                                            <h3 className="text-indigo-300 font-medium tracking-wide">Release to upload</h3>
                                        </motion.div>
                                    )}

                                    {uploadState === 'PARSING' && (
                                        <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full px-8 pointer-events-none">
                                            <div className="flex justify-between items-end mb-3">
                                                <span className="text-sm font-medium text-white/70">Analyzing dataset...</span>
                                                <span className="font-mono text-indigo-400 text-sm">{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                                                <motion.div 
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-400"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ ease: "linear", duration: 0.2 }}
                                                />
                                            </div>
                                            <div className="flex justify-between px-1">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= progress/20 ? 'w-4 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'w-1.5 bg-white/10'}`} />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {uploadState === 'DONE' && (
                                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-emerald-400 pointer-events-none">
                                            <CheckCircle className="w-12 h-12 mb-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                            <h3 className="font-medium tracking-wide">Done! Redirecting...</h3>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                            </motion.div>

                            <div className="mt-5 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Smart Detection Active</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>

                            <div className="flex justify-center flex-wrap gap-2 mt-5">
                                <span className="text-[11px] px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 flex items-center gap-1.5">
                                    <Brain className="w-3 h-3 text-violet-400" /> Pattern Recognition
                                </span>
                                <span className="text-[11px] px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 flex items-center gap-1.5">
                                    <Activity className="w-3 h-3 text-emerald-400" /> Peak Hours
                                </span>
                                <span className="text-[11px] px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 flex items-center gap-1.5">
                                    <Code className="w-3 h-3 text-sky-400" /> App Context
                                </span>
                            </div>

                            <div className="flex justify-center mt-6">
                                <a 
                                    href="/sample-dataset.csv" 
                                    download 
                                    className="text-xs px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 hover:text-indigo-200 flex items-center gap-2 transition-all"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download sample dataset
                                </a>
                            </div>

                        </div>
                    </div>
                </motion.div>

                <motion.p 
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.9 } } }}
                    className="mt-8 text-xs text-white/30 flex items-center gap-2 group cursor-default"
                >
                    <span className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">🔒</span>
                    All data is processed strictly locally. It never leaves your machine.
                </motion.p>
            </motion.div>
        </div>
    );
}
