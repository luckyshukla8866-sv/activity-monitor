'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { insightsAPI } from '@/lib/api';
import ArcGauge from '@/components/charts/ArcGauge';
import CategoryBadge from '@/components/CategoryBadge';

const CATEGORY_COLORS: Record<string, string> = {
    deep_work: '#0058bc',      // primary
    communication: '#883c93',  // tertiary
    distraction: '#b31b25',    // error
    neutral: '#989da4',        // inverse-on-surface
};

const CATEGORY_ICONS: Record<string, string> = {
    deep_work: 'bolt',
    communication: 'forum',
    distraction: 'sports_esports',
    neutral: 'remove',
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
            <div className="space-y-6 max-w-[1440px] mx-auto px-4 md:px-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-on-surface">ML Insights</h1>
                    <p className="text-lg text-on-surface-variant mt-1">AI-powered productivity analysis</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-surface recessed p-6 h-48 animate-pulse rounded-[2rem]" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.total_sessions === 0) {
        return (
            <div className="space-y-6 max-w-[1440px] mx-auto px-4 md:px-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-on-surface">ML Insights</h1>
                    <p className="text-lg text-on-surface-variant mt-1">AI-powered productivity analysis</p>
                </div>
                <div className="bg-surface extrusion p-12 text-center flex flex-col items-center justify-center min-h-[400px] rounded-[3rem]">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-surface recessed flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-[3rem] text-primary/40">psychology</span>
                    </div>
                    <h2 className="text-xl font-bold text-on-surface mb-2">No Data Available</h2>
                    <p className="text-on-surface-variant max-w-sm">Upload activity data from the Upload page to let our local ML models analyze your productivity patterns.</p>
                </div>
            </div>
        );
    }
    
    const gaugeValue = data.productivity_score || 0;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pb-12 space-y-12 max-w-[1440px] mx-auto px-4 md:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-on-surface soft-text">ML Insights</h1>
                    <p className="text-lg text-on-surface-variant mt-2 font-medium">AI-powered productivity analysis</p>
                </div>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="bg-surface extrusion border-0 text-on-surface font-bold rounded-xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none shadow-sm"
                    style={{ WebkitAppearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23565c62%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '.65rem auto', paddingRight: '2.5rem' }}
                >
                    <option value={3}>Last 3 Days</option>
                    <option value={7}>Last 7 Days</option>
                    <option value={14}>Last 14 Days</option>
                    <option value={30}>Last 30 Days</option>
                </select>
            </div>

            {/* Top Half: Big Score */}
            <motion.div variants={containerVariants}>
                <div className="bg-surface extrusion p-10 flex flex-col items-center justify-center relative overflow-hidden group rounded-[3rem] interactive-card">
                    <p className="text-on-surface-variant uppercase tracking-widest text-xs font-bold mb-8">Overall Productivity</p>
                    <ArcGauge value={gaugeValue} size={320} strokeWidth={24} />
                    <p className="text-on-surface-variant font-medium text-sm mt-8">
                        Analyzed {data.total_sessions} sessions across {data.total_hours} hours.
                    </p>
                </div>
            </motion.div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {data.category_breakdown?.map((cat: any, i: number) => {
                    const iconName = CATEGORY_ICONS[cat.category] || 'remove';
                    const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.neutral;
                    return (
                        <motion.div key={cat.category} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } } }}>
                            <div className="bg-surface extrusion p-8 rounded-[2rem] relative overflow-hidden group interactive-card min-h-[220px] flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-[1rem] bg-surface recessed" style={{ color: color }}>
                                            <span className="material-symbols-outlined text-[1.2rem]" style={{fontVariationSettings: "'FILL' 1"}}>{iconName}</span>
                                        </div>
                                        <span className="text-sm text-on-surface font-bold">{cat.label}</span>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <span className="text-4xl font-black text-on-surface tracking-tight">{cat.hours}</span>
                                    <span className="text-on-surface-variant ml-1 font-bold">h</span>
                                </div>

                                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mt-auto">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}80` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.percentage}%` }}
                                        transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                                    />
                                </div>
                                <p className="text-[10px] text-on-surface-variant mt-3 font-bold tracking-widest uppercase text-right">{cat.percentage}% of total</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* App Scores Table */}
            <motion.div variants={containerVariants}>
                <div className="bg-surface extrusion p-8 rounded-[2rem] overflow-hidden interactive-card">
                    <h2 className="text-xl font-bold tracking-tight text-on-surface mb-8 soft-text">App Productivity Scores</h2>
                    <div className="overflow-x-auto hide-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-surface-container">
                                    <th className="pb-4 px-4 text-on-surface-variant text-xs font-bold uppercase tracking-widest">Application</th>
                                    <th className="pb-4 px-4 text-on-surface-variant text-xs font-bold uppercase tracking-widest">Category</th>
                                    <th className="pb-4 px-4 text-on-surface-variant text-xs font-bold uppercase tracking-widest">Time Spent</th>
                                    <th className="pb-4 px-4 text-on-surface-variant text-xs font-bold uppercase tracking-widest text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container text-sm">
                                {data.app_scores?.map((app: any, i: number) => (
                                    <motion.tr 
                                        key={app.app_name}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 + (i * 0.05) }}
                                        className="hover:bg-surface-container-low transition-colors group"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-4">
                                                 <div className="w-10 h-10 rounded-xl bg-surface recessed flex items-center justify-center text-primary text-xs font-bold transition-all">
                                                    {app.app_name.substring(0,2).toUpperCase()}
                                                 </div>
                                                 <span className="font-bold text-on-surface">{app.app_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <CategoryBadge category={app.category} />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <span className="text-on-surface text-base">{app.hours}</span>
                                                <span className="text-on-surface-variant text-sm">h</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span 
                                                className="font-black text-lg py-1 px-3 bg-surface recessed rounded-full shadow-inner inline-block"
                                                style={{ 
                                                    color: app.score >= 75 ? '#10b981' : app.score >= 50 ? '#f59e0b' : '#b31b25'
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
                </div>
            </motion.div>
        </motion.div>
    );
}
