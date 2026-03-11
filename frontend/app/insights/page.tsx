'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Zap, MessageSquare, Gamepad2, Minus } from 'lucide-react';
import { insightsAPI } from '@/lib/api';

const CATEGORY_COLORS: Record<string, string> = {
    deep_work: '#22d3ee',      // cyan
    communication: '#a78bfa',  // purple
    distraction: '#f87171',    // red
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
    const [days, setDays] = useState(7);

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

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-emerald-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 75) return 'from-emerald-500 to-cyan-500';
        if (score >= 50) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div><h1 className="text-3xl font-bold gradient-text">ML Insights</h1></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass p-6 h-48 animate-pulse">
                            <div className="h-4 w-24 bg-slate-700 rounded mb-4" />
                            <div className="h-16 w-16 bg-slate-700 rounded-full mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.total_sessions === 0) {
        return (
            <div className="space-y-6">
                <div><h1 className="text-3xl font-bold gradient-text">ML Insights</h1></div>
                <div className="glass p-12 text-center">
                    <BrainCircuit className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
                    <p className="text-slate-400">Upload activity data from the Upload page to see ML insights.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">ML Insights</h1>
                    <p className="text-slate-400 mt-1">AI-powered productivity analysis</p>
                </div>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm"
                >
                    <option value={3}>Last 3 Days</option>
                    <option value={7}>Last 7 Days</option>
                    <option value={14}>Last 14 Days</option>
                </select>
            </div>

            {/* Productivity Score */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 text-center"
            >
                <p className="text-slate-400 text-sm mb-2">Overall Productivity Score</p>
                <div className={`text-7xl font-bold ${getScoreColor(data.productivity_score)}`}>
                    {data.productivity_score}
                </div>
                <div className="w-full max-w-md mx-auto mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.productivity_score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(data.productivity_score)}`}
                    />
                </div>
                <p className="text-slate-500 text-sm mt-2">
                    Based on {data.total_sessions} sessions over {data.total_hours} hours
                </p>
            </motion.div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.category_breakdown?.map((cat: any, i: number) => {
                    const Icon = CATEGORY_ICONS[cat.category] || Minus;
                    return (
                        <motion.div
                            key={cat.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-5"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: `${CATEGORY_COLORS[cat.category]}20` }}
                                >
                                    <Icon
                                        className="w-5 h-5"
                                        style={{ color: CATEGORY_COLORS[cat.category] }}
                                    />
                                </div>
                                <span className="text-sm text-slate-300">{cat.label}</span>
                            </div>
                            <div className="text-2xl font-bold">{cat.hours}h</div>
                            <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${cat.percentage}%`,
                                        backgroundColor: CATEGORY_COLORS[cat.category],
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{cat.percentage}% of total</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* App Scores Table */}
            <div className="glass p-6">
                <h2 className="text-xl font-semibold mb-4">App Productivity Scores</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="pb-3 text-slate-400 text-sm font-medium">Application</th>
                                <th className="pb-3 text-slate-400 text-sm font-medium">Category</th>
                                <th className="pb-3 text-slate-400 text-sm font-medium">Hours</th>
                                <th className="pb-3 text-slate-400 text-sm font-medium">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.app_scores?.map((app: any, i: number) => (
                                <tr key={i} className="border-b border-slate-800">
                                    <td className="py-3 font-medium">{app.app_name}</td>
                                    <td className="py-3">
                                        <span
                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: `${CATEGORY_COLORS[app.category.toLowerCase().replace(' ', '_')] || '#94a3b8'}20`,
                                                color: CATEGORY_COLORS[app.category.toLowerCase().replace(' ', '_')] || '#94a3b8',
                                            }}
                                        >
                                            {app.category}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-300">{app.hours}h</td>
                                    <td className="py-3">
                                        <span className={`font-semibold ${getScoreColor(app.score)}`}>
                                            {app.score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
