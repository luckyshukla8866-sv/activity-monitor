'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Zap, MessageSquare, Gamepad2, Minus } from 'lucide-react';
import { insightsAPI } from '@/lib/api';
import GlassCard from '@/components/GlassCard';
import ArcGauge from '@/components/charts/ArcGauge';
import CategoryBadge from '@/components/CategoryBadge';
import { useCountUp } from '@/hooks/useCountUp';

const CATEGORY_COLORS: Record<string, string> = {
    deep_work: '#22d3ee',      // cyan
    communication: '#6366f1',  // indigo
    distraction: '#f43f5e',    // rose
    neutral: '#94a3b8',        // slate
};

const CATEGORY_ICONS: Record<string, any> = {
    deep_work: Zap,
    communication: MessageSquare,
    distraction: Gamepad2,
    neutral: Minus,
};

export default function InsightsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        loadData();
    }, [days]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await insightsAPI.getProductivity(days);
            setData(result);
        } catch (err) {
            console.error('Failed to load insights:', err);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white/90">ML Insights</h1>
                    <p className="text-sm text-white/40 mt-1">AI-powered productivity analysis</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card p-6 h-48 animate-pulse bg-white/[0.02] rounded-2xl border-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.total_sessions === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white/90">ML Insights</h1>
                    <p className="text-sm text-white/40 mt-1">AI-powered productivity analysis</p>
                </div>
                <GlassCard className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                        <BrainCircuit className="w-10 h-10 text-white/40" />
                    </div>
                    <h2 className="text-xl font-medium text-white/80 mb-2 font-sans">No Data Available</h2>
                    <p className="text-white/40 max-w-sm">Upload activity data from the Upload page to let our local ML models analyze your productivity patterns.</p>
                </GlassCard>
            </div>
        );
    }
    
    const gaugeValue = data.productivity_score || 0;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pb-10 space-y-8 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white/90">ML Insights</h1>
                    <p className="text-sm text-white/40 mt-1">AI-powered productivity analysis</p>
                </div>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="bg-transparent border border-white/10 text-white/70 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 backdrop-blur-md hover:bg-white/5 transition-colors cursor-pointer appearance-none"
                    style={{ WebkitAppearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto', paddingRight: '2rem' }}
                >
                    <option value={3} className="bg-[#0a0a16]">Last 3 Days</option>
                    <option value={7} className="bg-[#0a0a16]">Last 7 Days</option>
                    <option value={14} className="bg-[#0a0a16]">Last 14 Days</option>
                    <option value={30} className="bg-[#0a0a16]">Last 30 Days</option>
                </select>
            </div>

            {/* Top Half: Big Score */}
            <motion.div variants={containerVariants}>
                <GlassCard className="p-10 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                    <p className="text-white/40 uppercase tracking-widest text-xs font-semibold mb-8">Overall Productivity</p>
                    <ArcGauge value={gaugeValue} size={320} strokeWidth={18} />
                    <p className="text-white/30 text-xs mt-8">
                        Analyzed {data.total_sessions} sessions across {data.total_hours} hours.
                    </p>
                </GlassCard>
            </motion.div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {data.category_breakdown?.map((cat: any, i: number) => {
                    const Icon = CATEGORY_ICONS[cat.category] || Minus;
                    const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.neutral;
                    return (
                        <motion.div key={cat.category} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } } }}>
                            <GlassCard className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                {/* Glow element behind the card context */}
                                <div 
                                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                                    style={{ backgroundColor: color }}
                                />
                                
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl border" style={{ backgroundColor: `${color}10`, borderColor: `${color}20`, color: color }}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm text-white/60 font-medium">{cat.label}</span>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <span className="text-3xl font-mono text-white/90 tracking-tight">{cat.hours}</span>
                                    <span className="text-white/40 ml-1 text-sm">hrs</span>
                                </div>

                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.percentage}%` }}
                                        transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                                    />
                                </div>
                                <p className="text-xs text-white/30 mt-3 font-mono tracking-widest uppercase text-right">{cat.percentage}% of total</p>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>

            {/* App Scores Table */}
            <motion.div variants={containerVariants}>
                <GlassCard className="p-6 overflow-hidden">
                    <h2 className="text-white/80 font-medium font-sans mb-6">App Productivity Scores</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="pb-4 px-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Application</th>
                                    <th className="pb-4 px-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Category</th>
                                    <th className="pb-4 px-4 text-white/40 text-xs font-semibold uppercase tracking-wider">Time Spent</th>
                                    <th className="pb-4 px-4 text-white/40 text-xs font-semibold uppercase tracking-wider text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.app_scores?.map((app: any, i: number) => (
                                    <motion.tr 
                                        key={app.app_name}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 + (i * 0.05) }}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="py-4 px-4 border-l-4 border-transparent group-hover:border-indigo-500 transition-colors">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 text-xs font-mono border border-white/10 group-hover:bg-white/10 transition-colors">
                                                    {app.app_name.substring(0,2).toUpperCase()}
                                                 </div>
                                                 <span className="font-medium text-white/80 text-sm">{app.app_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <CategoryBadge category={app.category} />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-white/70 font-mono text-sm">{app.hours}</span>
                                                <span className="text-white/30 text-xs">hrs</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span 
                                                className="font-mono text-base font-medium"
                                                style={{ 
                                                    color: app.score >= 75 ? '#34d399' : app.score >= 50 ? '#fbbf24' : '#f87171' // emerald-400, amber-400, red-400
                                                }}
                                            >
                                                {app.score}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}
