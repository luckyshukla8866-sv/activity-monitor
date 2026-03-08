'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Layers, TrendingUp } from 'lucide-react';
import { analyticsAPI } from '@/lib/api';
import dynamic from 'next/dynamic';
import LiveActivityPanel from '@/components/LiveActivityPanel';

// Lazy-load heavy chart components so they don't block initial render
const AppDistributionChart = dynamic(() => import('@/components/charts/AppDistributionChart'), {
    loading: () => <ChartSkeleton />,
    ssr: false,
});
const TopAppsChart = dynamic(() => import('@/components/charts/TopAppsChart'), {
    loading: () => <ChartSkeleton />,
    ssr: false,
});
const ActivityTimelineChart = dynamic(() => import('@/components/charts/ActivityTimelineChart'), {
    loading: () => <ChartSkeleton />,
    ssr: false,
});

function ChartSkeleton() {
    return (
        <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full bg-slate-800/50 rounded-lg animate-pulse" />
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="glass p-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-slate-700 rounded" />
                    <div className="h-8 w-16 bg-slate-700 rounded" />
                </div>
                <div className="w-12 h-12 bg-slate-700 rounded-lg" />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [overview, setOverview] = useState<any>(null);
    // Start with null — show skeletons immediately, fill in data when ready
    const [chartData, setChartData] = useState<{
        distribution: any[] | null;
        topApps: any[] | null;
        timeline: any[] | null;
    }>({ distribution: null, topApps: null, timeline: null });

    useEffect(() => {
        loadAll();
        const interval = setInterval(loadAll, 60000); // refresh every 60s (was 30s)
        return () => clearInterval(interval);
    }, []);

    const loadAll = async () => {
        // Fire all 4 requests in parallel — don't wait for one before starting the next
        const [overviewRes, distRes, topRes, timelineRes] = await Promise.allSettled([
            analyticsAPI.getOverview(),
            analyticsAPI.getAppDistribution(7),
            analyticsAPI.getTopApps(5, 7),
            analyticsAPI.getTimeline(),
        ]);

        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
        setChartData({
            distribution: distRes.status === 'fulfilled' ? distRes.value : [],
            topApps: topRes.status === 'fulfilled' ? topRes.value : [],
            timeline: timelineRes.status === 'fulfilled' ? timelineRes.value : [],
        });
    };

    const stats = [
        {
            title: 'Active Hours Today',
            value: overview?.total_active_hours_today?.toFixed(1) ?? '—',
            unit: 'hours',
            icon: Clock,
            color: 'from-cyan-500 to-blue-500',
        },
        {
            title: 'Sessions Today',
            value: overview?.total_sessions_today ?? '—',
            unit: 'sessions',
            icon: Activity,
            color: 'from-purple-500 to-pink-500',
        },
        {
            title: 'Apps Tracked',
            value: overview?.total_apps_tracked ?? '—',
            unit: 'apps',
            icon: Layers,
            color: 'from-green-500 to-emerald-500',
        },
        {
            title: 'Productivity',
            value: overview?.active_time_today
                ? Math.round((overview.active_time_today / (overview.active_time_today + (overview.idle_time_today || 0))) * 100)
                : '—',
            unit: '%',
            icon: TrendingUp,
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header — always visible immediately */}
            <div>
                <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                <p className="text-slate-400 mt-1">Track your activity and productivity</p>
            </div>

            {/* Stats Cards — show skeletons until data arrives */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overview === null
                    ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                    : stats.map((stat) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="glass p-6 hover:scale-105 transition-transform cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">{stat.title}</p>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-3xl font-bold">{stat.value}</span>
                                        <span className="text-slate-400 text-sm">{stat.unit}</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
            </div>

            {/* Charts Grid — lazy loaded, show skeletons until JS chunk arrives */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass p-6">
                    <h2 className="text-xl font-semibold mb-4">App Usage Distribution</h2>
                    <AppDistributionChart data={chartData.distribution} />
                </div>
                <div className="glass p-6">
                    <h2 className="text-xl font-semibold mb-4">Top 5 Applications</h2>
                    <TopAppsChart data={chartData.topApps} />
                </div>
            </div>

            <div className="glass p-6">
                <h2 className="text-xl font-semibold mb-4">Activity Timeline (Today)</h2>
                <ActivityTimelineChart data={chartData.timeline} />
            </div>

            {/* Live Activity Panel */}
            <LiveActivityPanel />
        </div>
    );
}
