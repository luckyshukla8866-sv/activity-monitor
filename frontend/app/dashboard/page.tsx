'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI, insightsAPI } from '@/lib/api';
import dynamic from 'next/dynamic';
import { useCountUp } from '@/hooks/useCountUp';

// ... (rest of the file remains same, except lucide-react is removed and ChevronDown replaced)
// Let me write out the full file exactly to be safe.

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
            <div className="w-full h-full bg-surface-container rounded-2xl animate-pulse" />
        </div>
    );
}

function StatCard({ title, value, unit, icon, trend, highlightClass = 'text-primary bg-primary-container/20' }: any) {
    const isNumber = typeof value === 'number';
    const displayValue = useCountUp(isNumber ? value : 0, 1500);
    const finalVal = isNumber ? displayValue.toFixed(0) : value;

    return (
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[1.5rem] border border-white/50 flex flex-col justify-between h-48 hover-lift group">
            <div className="flex justify-between items-start">
                <span className={`material-symbols-outlined p-3 rounded-[1rem] ${highlightClass}`} style={{fontVariationSettings: "'FILL' 1"}}>
                    {icon}
                </span>
                {trend !== undefined && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'text-green-600 bg-green-100' : 'text-red-500 bg-red-100'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{title}</p>
                <h3 className="text-3xl font-black text-on-surface">
                    {finalVal}
                    {unit && <span className="text-lg text-on-surface-variant ml-1">{unit}</span>}
                </h3>
            </div>
        </div>
    );
}

type SourceFilter = 'all' | 'desktop' | 'browser';

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
            // Silently handle
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const prodScore = mlData?.productivity?.productivity_score ?? null;
    let totalMinutes = 0;
    if (chartData.timeline) {
        chartData.timeline.forEach((t: any) => totalMinutes += (t.active_minutes || 0));
    }
    const totalHours = totalMinutes > 0 ? (totalMinutes / 60) : 0;
    const topApp = chartData.topApps && chartData.topApps.length > 0 ? chartData.topApps[0].app_name : '—';
    const totalSessions = overview?.total_sessions_today ?? 0;
    const avgSession = totalSessions > 0 && totalMinutes > 0 ? (totalMinutes / totalSessions) : 0;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }} className="pb-12 max-w-[1440px] mx-auto px-2 md:px-8">
            <section className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">TRACKING LIVE</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-on-surface" style={{fontFamily: 'Manrope, sans-serif'}}>Dashboard Overview</h1>
                    <p className="text-on-surface-variant text-lg">Your local productivity metrics</p>
                </div>
                
                <div className="flex gap-4 p-2 bg-surface recessed rounded-full overflow-x-auto w-full md:w-auto hide-scrollbar">
                    <button 
                        onClick={() => setSourceFilter('all')}
                        className={`px-6 py-2 rounded-full text-sm font-bold min-w-max transition-all ${sourceFilter === 'all' ? 'bg-surface extrusion text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setSourceFilter('desktop')}
                        className={`px-6 py-2 rounded-full text-sm font-bold min-w-max transition-all ${sourceFilter === 'desktop' ? 'bg-surface extrusion text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                        Desktop
                    </button>
                    <button 
                        onClick={() => setSourceFilter('browser')}
                        className={`px-6 py-2 rounded-full text-sm font-bold min-w-max transition-all ${sourceFilter === 'browser' ? 'bg-surface extrusion text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                        Browser
                    </button>
                    <div className="w-[1px] h-6 bg-surface-variant my-auto shrink-0"></div>
                    <button className="px-6 py-2 text-on-surface-variant font-medium rounded-full text-sm flex items-center gap-2 min-w-max">
                        Last 30 Days
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>
                </div>
            </section>

            {/* Top Stats Bento Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <StatCard 
                    title="Active Time Today" 
                    value={totalHours} 
                    unit="h" 
                    icon="schedule" 
                    trend={12} 
                    highlightClass="text-primary bg-primary-container/20"
                />
                <StatCard 
                    title="Top Application" 
                    value={topApp} 
                    icon="terminal" 
                    highlightClass="text-tertiary bg-tertiary-container/30"
                />
                <StatCard 
                    title="Productivity Score" 
                    value={prodScore !== null ? prodScore : 0} 
                    unit="/100" 
                    icon="bolt" 
                    trend={5} 
                    highlightClass="text-primary bg-primary-container/20"
                />
                <StatCard 
                    title="Sessions Logged" 
                    value={totalSessions} 
                    icon="timer" 
                    highlightClass="text-on-surface-variant bg-surface-variant/40"
                />
            </section>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 shadow-lg shadow-black/[0.02] flex flex-col h-full group hover:shadow-xl transition-shadow duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold tracking-tight text-on-surface soft-text">Activity Timeline</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/40"></span>
                                <span className="text-xs font-medium text-on-surface-variant">Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ActivityTimelineChart data={chartData.timeline} />
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 shadow-lg shadow-black/[0.02] flex flex-col h-full group hover:shadow-xl transition-shadow duration-500">
                    <h3 className="text-xl font-bold tracking-tight text-on-surface mb-8 soft-text">Time Distribution</h3>
                    <div className="flex-1 w-full min-h-[300px] flex flex-col">
                        <AppDistributionChart data={chartData.distribution} />
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 shadow-lg shadow-black/[0.02] flex flex-col hover:shadow-xl transition-shadow duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold tracking-tight text-on-surface soft-text">Top Applications</h3>
                        <button className="text-primary font-bold text-sm tracking-wide">View All</button>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                       <TopAppsBar data={chartData.topApps} />
                    </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 shadow-lg shadow-black/[0.02] overflow-hidden relative group hover:shadow-xl transition-shadow duration-500">
                    <div className="relative z-10 h-full flex flex-col justify-center">
                        <h3 className="text-xl font-bold tracking-tight text-on-surface mb-2 soft-text">Focus Insight</h3>
                        <p className="text-on-surface-variant text-sm mb-8 max-w-[80%] leading-relaxed">
                            {mlData?.productivity?.focus_score && mlData.productivity.focus_score > 70 
                                ? "You've been experiencing excellent focus flow lately. Keep utilizing these focused blocks for maximum throughput."
                                : "You are 14% more productive before 11:00 AM. Consider scheduling complex coding tasks during this window."}
                        </p>
                        
                        <div className="bg-primary/5 border border-primary/10 p-5 rounded-[1rem] flex items-start gap-4 mb-8">
                            <span className="material-symbols-outlined text-primary bg-surface p-2 rounded-lg recessed" style={{fontVariationSettings: "'FILL' 1"}}>lightbulb</span>
                            <div>
                                <h4 className="text-sm font-bold text-primary mb-1">Deep Work Suggestion</h4>
                                <p className="text-xs text-on-surface-variant leading-relaxed">Block "No Meeting Wednesdays" to increase weekly output by an estimated 22%.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-on-surface">{Math.round(avgSession)} min</span>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Avg Session Length</span>
                                </div>
                            </div>
                            <button className="cta-gradient text-on-primary px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-transform">
                                Optimize Schedule
                            </button>
                        </div>
                    </div>
                    
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <span className="material-symbols-outlined text-[16rem] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
                    </div>
                </div>
            </div>
            
        </motion.div>
    );
}
