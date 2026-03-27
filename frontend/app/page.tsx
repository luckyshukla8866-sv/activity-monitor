'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Activity, Code, Sparkles, ArrowRight, Shield, BarChart3, Cpu } from 'lucide-react';
import GradientText from '@/components/GradientText';
import Pill from '@/components/Pill';

function FloatingStat({ val, label, top, left, bottom, right, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, transition: { delay, duration: 0.8 } }}
            className="absolute hidden lg:flex items-center gap-3 glass-card px-4 py-3 border border-white/10"
            style={{
                top, left, bottom, right,
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

export default function LandingPage() {
    const router = useRouter();

    // If already logged in, go straight to dashboard
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            router.replace('/dashboard');
        }
    }, [router]);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-10 overflow-hidden font-sans">
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
                        <span className="text-indigo-300">AI-Powered Productivity Analytics</span>
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
                    className="text-[16px] text-white/50 max-w-[480px] mb-10 leading-relaxed font-light"
                >
                    Upload your activity logs. Our machine learning models map your focus hours, categorize apps, and predict burnout risk — all with actionable AI coaching.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-[400px] mb-8"
                >
                    {/* Primary: Demo */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/login')}
                        className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-semibold text-[15px]
                                   bg-gradient-to-r from-indigo-500 to-violet-500
                                   hover:from-indigo-400 hover:to-violet-400
                                   text-white shadow-lg shadow-indigo-500/25
                                   flex items-center justify-center gap-2.5
                                   transition-all duration-200 cursor-pointer
                                   relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <Sparkles className="w-5 h-5" />
                        Try Demo Free
                        <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </motion.button>

                    {/* Secondary: Sign In */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/login')}
                        className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm
                                   bg-white/[0.06] border border-white/[0.08]
                                   text-white/70 hover:text-white/90 hover:bg-white/[0.10]
                                   flex items-center justify-center gap-2
                                   transition-all duration-200 cursor-pointer"
                    >
                        Sign In
                    </motion.button>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="flex justify-center flex-wrap gap-2.5 mb-10"
                >
                    <span className="text-[11px] px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3 text-violet-400" /> Smart Dashboard
                    </span>
                    <span className="text-[11px] px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-emerald-400" /> ML Insights
                    </span>
                    <span className="text-[11px] px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 flex items-center gap-1.5">
                        <Brain className="w-3 h-3 text-sky-400" /> AI Coach
                    </span>
                    <span className="text-[11px] px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 flex items-center gap-1.5">
                        <Code className="w-3 h-3 text-amber-400" /> Chrome Extension
                    </span>
                </motion.div>

                {/* Trust badge */}
                <motion.p
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.9 } } }}
                    className="text-xs text-white/25 flex items-center gap-2 group cursor-default"
                >
                    <Shield className="w-3.5 h-3.5 text-emerald-500/50" />
                    All data is processed locally. It never leaves your machine.
                </motion.p>
            </motion.div>
        </div>
    );
}
