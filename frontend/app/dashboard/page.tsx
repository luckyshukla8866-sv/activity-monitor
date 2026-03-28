'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Trophy, BrainCircuit, ArrowUpRight, ArrowDownRight, Layers, Monitor, Globe, Chrome } from 'lucide-react';
import { analyticsAPI, insightsAPI } from '@/lib/api';
import dynamic from 'next/dynamic';
import GlassCard from '@/components/GlassCard';
import Pill from '@/components/Pill';
import { useCountUp } from '@/hooks/useCountUp';

// Lazy-load charts
const AppDistributionChart = dynamic(() => import('@/components/charts/AppDistributionChart'), {
    loading: () => <ChartSkeleton />,
    ssr: false,
});
const TopAppsBar = dynamic(() => import('@/components/charts/TopAppsBar'), {
    loading: () => <ChartSkeleton />,
    ssr: false,
});
const ActivityTimelineChart = dynamic(() => import('@/components/charts/ActivityTimelineChart'), {
    loading: () => <ChartSkeleton />,
    ssr: false,
});

function ChartSkeleton() {
    return (
        <div className="h-[280px] flex items-center justify-center">
            <div className="w-full h-full bg-white/[0.02] rounded-2xl animate-pulse" />
        </div>
    );
}

function AnimatedStatCard({ title, value, unit, icon: Icon, trend, delay, isSmall = false }: any) {
    const isNumber = typeof value === 'number';
    const displayValue = useCountUp(isNumber ? value : 0, 1500);
    const finalVal = isNumber ? displayValue.toFixed(0) : value;

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } } }}
        >
            <GlassCard className="p-5 h-full relative group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                        <Icon className="w-5 h-5" />
                    </div>
                    {trend !== undefined && (
                        <Pill color={trend >= 0 ? "emerald" : "red"} className="text-[10px] px-2 py-0.5">
                            {trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {Math.abs(trend)}%
                        </Pill>
                    )}
                </div>
                <div>
                    <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
                    <div className="flex items-baseline gap-1.5">
                        <span className={`font-mono font-medium tracking-tight text-white/90 ${isSmall ? 'text-2xl' : 'text-4xl'}`}>
                            {finalVal}
                        </span>
                        {unit && <span className="text-white/40 font-mono text-sm">{unit}</span>}
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

// Source filter type
type SourceFilter = 'all' | 'desktop' | 'browser';

const SOURCE_BUTTONS: { key: SourceFilter; label: string; icon: any }[] = [
    { key: 'all', label: 'All', icon: Globe },
    { key: 'desktop', label: 'Desktop', icon: Monitor },
    { key: 'browser', label: 'Browser', icon: Chrome },
];

export default function DashboardPage() {
    const [overview, setOverview] = useState<any>(null);
    const [mlData, setMlData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<{
        distribution: any[] | null;
        topApps: any[] | null;
        timeline: any[] | null;
    }>({ distribution: null, topApps: null, timeline: null });
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

    const loadAll = useCallback(async () => {
        const src = sourceFilter === 'all' ? undefined : sourceFilter;

        try {
            const [overviewRes, distRes, topRes, timelineRes, productivityRes, burnoutRes] =
                await Promise.allSettled([
                    analyticsAPI.getOverview(30, src),
                    analyticsAPI.getAppDistribution(30, src),
                    analyticsAPI.getTopApps(5, 30, src),
                    analyticsAPI.getTimeline(undefined, src),
                    insightsAPI.getProductivity(30),
                    insightsAPI.getBurnout(),
                ]);

            if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
            setChartData({
                distribution: distRes.status === 'fulfilled' ? distRes.value : [],
                topApps: topRes.status === 'fulfilled' ? topRes.value : [],
                timeline: timelineRes.status === 'fulfilled' ? timelineRes.value : [],
            });

            const ml: any = {};
            if (productivityRes.status === 'fulfilled') ml.productivity = productivityRes.value;
            if (burnoutRes.status === 'fulfilled') ml.burnout = burnoutRes.value;
            setMlData(ml);
        } catch {
            // Silently handle — Promise.allSettled shouldn't throw, but just in case
        } finally {
            setLoading(false);
        }
    }, [sourceFilter]);

    useEffect(() => {
        setLoading(true);
        loadAll();
        const interval = setInterval(loadAll, 60000);
        return () => clearInterval(interval);
    }, [loadAll]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const prodScore = mlData?.productivity?.productivity_score ?? null;
    let totalMinutes = 0;
    if (chartData.timeline) {
        chartData.timeline.forEach((t: any) => totalMinutes += (t.active_minutes || 0));
    }
    const totalHours = totalMinutes > 0 ? (totalMinutes / 60) : 0;
    const topApp = chartData.topApps && chartData.topApps.length > 0 ? chartData.topApps[0].app_name : '—';
    const totalSessions = overview?.total_sessions_today ?? 0;
    const avgSession = totalSessions > 0 && totalMinutes > 0 ? (totalMinutes / totalSessions) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-white/40">Loading dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pb-10 font-sans">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white/90">Dashboard Overview</h1>
                    <p className="text-sm text-white/40 mt-1">Your local productivity metrics</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Source filter buttons */}
                    <div className="flex items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-1 gap-0.5">
                        {SOURCE_BUTTONS.map(({ key, label, icon: BtnIcon }) => (
                            <button
                                key={key}
                                onClick={() => setSourceFilter(key)}
                                className={`
                                    flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide
                                    transition-all duration-200 cursor-pointer
                                    ${sourceFilter === key
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                                        : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04] border border-transparent'
                                    }
                                `}
                            >
                                <BtnIcon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                    {/* Date range pill */}
                    <div className="hidden md:flex glass-card px-4 py-2 border-white/5 text-sm text-white/60 cursor-pointer hover:bg-white/5 transition-colors">
                        Last 30 Days
                    </div>
                </div>
            </div>

            {/* Row 1: Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <AnimatedStatCard 
                    title="Active Time Today" 
                    value={totalHours} 
                    unit="hrs" 
                    icon={Clock} 
                    trend={12} 
                    delay={0.1} 
                />
                <AnimatedStatCard 
                    title="Top Application" 
                    value={topApp} 
                    unit="" 
                    icon={Trophy} 
                    delay={0.2} 
                />
                <AnimatedStatCard 
                    title="Productivity Score" 
                    value={prodScore !== null ? prodScore : 0} 
                    unit="/100" 
                    icon={BrainCircuit} 
                    trend={5} 
                    delay={0.3} 
                />
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.4 } } }} className="lg:col-span-2 relative">
                    <GlassCard className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-white/80 font-medium font-sans">Activity Timeline</h2>
                            <span className="text-xs text-white/30 uppercase tracking-widest font-mono">Today</span>
                        </div>
                        <div className="flex-1 min-h-[280px]">
                            <ActivityTimelineChart data={chartData.timeline} />
                        </div>
                    </GlassCard>
                </motion.div>
                
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.5 } } }} className="relative">
                    <GlassCard className="p-6 h-full flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-white/80 font-medium font-sans">Time Distribution</h2>
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-h-[280px]">
                            <AppDistributionChart data={chartData.distribution} />
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Row 3: Smaller Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.6 } } }} className="lg:col-span-1">
                    <GlassCard className="p-6 h-full">
                        <div className="mb-6">
                            <h2 className="text-white/80 font-medium font-sans">Top Applications</h2>
                        </div>
                        <TopAppsBar data={chartData.topApps} />
                    </GlassCard>
                </motion.div>

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <AnimatedStatCard 
                        title="Sessions Logged" 
                        value={totalSessions} 
                        unit="today" 
                        icon={Layers} 
                        isSmall 
                        delay={0.7} 
                    />
                    <AnimatedStatCard 
                        title="Avg Session Length" 
                        value={avgSession} 
                        unit="min" 
                        icon={Activity} 
                        isSmall 
                        delay={0.8} 
                    />
                </div>
            </div>
        </motion.div>
    );
}
