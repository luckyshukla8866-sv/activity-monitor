'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    AlertTriangle,
    Clock,
    Sun,
    Moon,
    Sunrise,
    CheckCircle,
    XCircle,
    Info,
} from 'lucide-react';
import { insightsAPI } from '@/lib/api';

const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    LOW: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    MEDIUM: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    HIGH: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    UNKNOWN: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

const SEVERITY_ICONS: Record<string, any> = {
    high: XCircle,
    medium: AlertTriangle,
    low: Info,
};

function getHourIcon(hour: number) {
    if (hour >= 6 && hour < 12) return Sunrise;
    if (hour >= 12 && hour < 18) return Sun;
    return Moon;
}

function getScoreBarColor(score: number) {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-cyan-500';
    if (score >= 30) return 'bg-yellow-500';
    if (score > 0) return 'bg-red-500';
    return 'bg-slate-700';
}

export default function ForecastPage() {
    const [forecast, setForecast] = useState<any>(null);
    const [burnout, setBurnout] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [f, b] = await Promise.allSettled([
                insightsAPI.getForecast(7),
                insightsAPI.getBurnout(),
            ]);
            if (f.status === 'fulfilled') setForecast(f.value);
            if (b.status === 'fulfilled') setBurnout(b.value);
        } catch (err) {
            console.error('Failed to load forecast:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div><h1 className="text-3xl font-bold gradient-text">Forecast & Burnout</h1></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass p-8 animate-pulse">
                        <div className="h-4 w-32 bg-slate-700 rounded mb-4" />
                        <div className="h-20 bg-slate-700/50 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    const risk = burnout?.risk_level || 'UNKNOWN';
    const riskStyle = RISK_COLORS[risk] || RISK_COLORS.UNKNOWN;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold gradient-text">Forecast & Burnout</h1>
                <p className="text-slate-400 mt-1">Predict your peak hours and monitor work health</p>
            </div>

            {/* Top Row: Peak Hours + Burnout Risk */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Peak Hours Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h2 className="text-lg font-semibold">Predicted Peak Hours</h2>
                    </div>
                    {forecast?.peak_hours?.length > 0 ? (
                        <div className="space-y-3">
                            {forecast.peak_hours.map((h: any, i: number) => {
                                const Icon = getHourIcon(h.hour);
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                                        <Icon className="w-5 h-5 text-cyan-400" />
                                        <span className="font-mono font-medium">{h.label}</span>
                                        <div className="flex-1 h-2 bg-slate-700 rounded-full ml-2">
                                            <div
                                                className="h-full bg-cyan-500 rounded-full"
                                                style={{ width: `${h.score}%` }}
                                            />
                                        </div>
                                        <span className="text-cyan-400 font-semibold text-sm">{h.score}</span>
                                    </div>
                                );
                            })}
                            <p className="text-sm text-slate-400 mt-2">
                                {forecast.insight}
                            </p>
                        </div>
                    ) : (
                        <p className="text-slate-500">Not enough data to predict peak hours.</p>
                    )}
                </motion.div>

                {/* Burnout Risk Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`glass p-6 border ${riskStyle.border}`}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${riskStyle.bg}`}>
                            <AlertTriangle className={`w-5 h-5 ${riskStyle.text}`} />
                        </div>
                        <h2 className="text-lg font-semibold">Burnout Risk</h2>
                    </div>
                    <div className={`text-4xl font-bold ${riskStyle.text} mb-2`}>
                        {risk}
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{burnout?.message}</p>

                    {/* Risk Score Bar */}
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${burnout?.risk_score || 0}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full rounded-full ${
                                risk === 'HIGH' ? 'bg-red-500' :
                                risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-emerald-500'
                            }`}
                        />
                    </div>
                    <p className="text-xs text-slate-500">Risk Score: {burnout?.risk_score || 0}/100</p>
                </motion.div>
            </div>

            {/* Hourly Productivity Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6"
            >
                <h2 className="text-lg font-semibold mb-4">Hourly Productivity Pattern</h2>
                <div className="grid grid-cols-12 gap-1 md:gap-2">
                    {forecast?.hourly_data?.filter((h: any) => h.hour >= 6 && h.hour <= 23).map((h: any) => (
                        <div key={h.hour} className="text-center">
                            <div
                                className={`h-16 md:h-24 rounded-lg ${getScoreBarColor(h.avg_score)} transition-all`}
                                style={{
                                    opacity: h.avg_score > 0 ? 0.3 + (h.avg_score / 100) * 0.7 : 0.1,
                                }}
                                title={`${h.hour_label}: Score ${h.avg_score}, ${h.avg_minutes} min avg`}
                            />
                            <p className="text-xs text-slate-500 mt-1">{h.hour_label.replace(':00', '')}</p>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" /> High Focus</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-cyan-500 rounded" /> Moderate</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded" /> Mixed</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /> Low Focus</div>
                </div>
            </motion.div>

            {/* Warnings */}
            {burnout?.warnings?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass p-6"
                >
                    <h2 className="text-lg font-semibold mb-4">Warnings</h2>
                    <div className="space-y-3">
                        {burnout.warnings.map((w: any, i: number) => {
                            const Icon = SEVERITY_ICONS[w.severity] || Info;
                            const color = w.severity === 'high' ? 'text-red-400' :
                                         w.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400';
                            return (
                                <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                                    <Icon className={`w-5 h-5 mt-0.5 ${color} flex-shrink-0`} />
                                    <p className="text-sm text-slate-300">{w.message}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Recommendations */}
            {burnout?.recommendations?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass p-6"
                >
                    <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
                    <div className="space-y-2">
                        {burnout.recommendations.map((rec: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-300">{rec}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Daily Hours Trend */}
            {burnout?.daily_data?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass p-6"
                >
                    <h2 className="text-lg font-semibold mb-4">Daily Hours (14 Days)</h2>
                    <div className="flex items-end gap-1 h-32">
                        {burnout.daily_data.map((d: any, i: number) => {
                            const maxH = Math.max(...burnout.daily_data.map((x: any) => x.hours), 1);
                            const height = (d.hours / maxH) * 100;
                            const color = d.hours > 10 ? 'bg-red-500' :
                                         d.hours > 8 ? 'bg-yellow-500' : 'bg-cyan-500';
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <div
                                        className={`w-full rounded-t ${color} transition-all`}
                                        style={{ height: `${height}%`, minHeight: d.hours > 0 ? '4px' : '0' }}
                                        title={`${d.date}: ${d.hours}h`}
                                    />
                                    <p className="text-[10px] text-slate-600 mt-1 truncate w-full text-center">
                                        {d.date.slice(5)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-cyan-500 rounded" /> Normal (&le;8h)</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded" /> Long (8-10h)</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /> Overtime (&gt;10h)</div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
