'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    AlertTriangle,
    Sun,
    Moon,
    Sunrise,
    CheckCircle,
    Info,
} from 'lucide-react';
import { insightsAPI } from '@/lib/api';
import GlassCard from '@/components/GlassCard';
import BurnoutThermometer from '@/components/BurnoutThermometer';
import AlertBanner from '@/components/AlertBanner';

function getHourIcon(hour: number) {
    if (hour >= 6 && hour < 12) return Sunrise;
    if (hour >= 12 && hour < 18) return Sun;
    return Moon;
}

function getScoreBarColor(score: number) {
    if (score >= 80) return 'bg-emerald-400 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]';
    if (score >= 60) return 'bg-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]';
    if (score >= 30) return 'bg-yellow-400 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
    if (score > 0) return 'bg-rose-400 border-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]';
    return 'bg-white/5 border-transparent';
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
                insightsAPI.getForecast(30),
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white/90">Forecast & Burnout</h1>
                    <p className="text-sm text-white/40 mt-1">Predict your peak hours and monitor work health</p>
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-8 animate-pulse bg-white/[0.02] rounded-2xl border-white/5 h-32" />
                ))}
            </div>
        );
    }

    const risk = burnout?.risk_level || 'UNKNOWN';

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-10 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white/90">Forecast & Burnout</h1>
                <p className="text-slate-400 mt-1">Predict your peak hours and monitor work health</p>
            </div>

            {/* Top Row: Peak Hours + Burnout Risk */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Peak Hours Card */}
                <motion.div variants={containerVariants}>
                    <GlassCard className="p-8 h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-medium text-white/80">Predicted Peak Hours</h2>
                        </div>
                        {forecast?.peak_hours?.length > 0 ? (
                            <div className="space-y-4">
                                {forecast.peak_hours.map((h: any, i: number) => {
                                    const Icon = getHourIcon(h.hour);
                                    return (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400/80">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-mono text-white/90 text-sm w-16">{h.label}</span>
                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full mx-2 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${h.score}%` }}
                                                    transition={{ duration: 1, delay: i * 0.2 }}
                                                />
                                            </div>
                                            <span className="text-cyan-400 font-mono text-xs w-8 text-right">{h.score}%</span>
                                        </div>
                                    );
                                })}
                                <p className="text-sm text-white/40 mt-4 px-2 italic">"{forecast.insight}"</p>
                            </div>
                        ) : (
                            <p className="text-white/30 text-center py-10 font-mono text-sm">Not enough data to predict peak hours.</p>
                        )}
                    </GlassCard>
                </motion.div>

                {/* Burnout Thermometer Card */}
                <motion.div variants={containerVariants}>
                    <GlassCard className="p-8 h-full flex flex-col justify-between group overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-medium text-white/80">Burnout Risk</h2>
                            </div>
                            
                            <div className="text-5xl font-mono tracking-tight text-white mb-2 pl-2">
                                {risk}
                            </div>
                            <p className="text-white/40 text-sm mb-10 pl-2 max-w-sm">{burnout?.message || 'Monitoring active work hours for burnout signs.'}</p>
                        </div>
                        
                        <div className="relative z-10 pb-4">
                            <BurnoutThermometer score={burnout?.risk_score || 0} />
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Warnings AlertBanner */}
            {burnout?.warnings?.length > 0 && (
                <motion.div variants={containerVariants} className="space-y-3">
                    <h2 className="text-sm font-medium text-white/80 mb-4 px-2 uppercase tracking-widest">Active Alerts</h2>
                    {burnout.warnings.map((w: any, i: number) => (
                        <AlertBanner key={i} severity={w.severity} message={w.message} />
                    ))}
                </motion.div>
            )}

            {/* Recommendations */}
            {burnout?.recommendations?.length > 0 && (
                <motion.div variants={containerVariants} className="mt-8">
                    <GlassCard className="p-6">
                        <h2 className="text-lg font-medium text-white/80 mb-4">AI Recommendations</h2>
                        <div className="space-y-3">
                            {burnout.recommendations.map((rec: string, i: number) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-colors">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-white/70 leading-relaxed font-sans">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Hourly Productivity Heatmap & Daily Trend */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                <motion.div variants={containerVariants}>
                    <GlassCard className="p-6 h-full">
                        <h2 className="text-base font-medium text-white/80 mb-6">Hourly Productivity Pattern</h2>
                        <div className="grid grid-cols-12 gap-1.5 md:gap-2">
                            {forecast?.hourly_data?.filter((h: any) => h.hour >= 6 && h.hour <= 23).map((h: any) => (
                                <div key={h.hour} className="flex flex-col items-center group/heat">
                                    <div
                                        className={`w-full h-16 md:h-24 rounded border transition-all duration-300 ${getScoreBarColor(h.avg_score)}`}
                                        style={{ opacity: h.avg_score > 0 ? 0.3 + (h.avg_score / 100) * 0.7 : 0.05 }}
                                        title={`${h.hour_label}: Score ${h.avg_score}, ${h.avg_minutes} min avg`}
                                    />
                                    <p className="text-[10px] font-mono text-white/30 mt-2 opacity-50 group-hover/heat:opacity-100 transition-opacity">
                                        {h.hour_label.replace(':00', '')}
                                    </p>
                                </div>
                            ))}
                        </div>
                         <div className="flex items-center gap-4 mt-6 text-[10px] tracking-wider text-white/40 uppercase font-mono justify-center">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Peak</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-cyan-400" /> Active</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-yellow-400" /> Mixed</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-rose-400" /> Low</div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Daily Hours Trend */}
                {burnout?.daily_data?.length > 0 && (
                    <motion.div variants={containerVariants}>
                        <GlassCard className="p-6 h-full flex flex-col">
                            <h2 className="text-base font-medium text-white/80 mb-6">Daily Hours Trend (14 Days)</h2>
                            <div className="flex-1 flex items-end gap-1.5 md:gap-2 min-h-[120px]">
                                {burnout.daily_data.map((d: any, i: number) => {
                                    const maxH = Math.max(...burnout.daily_data.map((x: any) => x.hours), 1);
                                    let height = (d.hours / maxH) * 100;
                                    // Ensure visual min height
                                    if (height > 0 && height < 5) height = 5;
                                    
                                    const color = d.hours > 10 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' :
                                                 d.hours > 8 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.4)]';
                                    
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group/chart relative">
                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-10 scale-0 group-hover/chart:scale-100 transition-transform bg-[#0a0a16]/90 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/80 whitespace-nowrap z-10 backdrop-blur-md">
                                                {d.hours}h
                                            </div>
                                            <div
                                                className={`w-full rounded-full ${color} transition-all duration-500 ease-out`}
                                                style={{ height: `${height}%`, minHeight: d.hours > 0 ? '8px' : '4px', opacity: d.hours > 0 ? 1 : 0.1 }}
                                            />
                                            <p className="text-[10px] font-mono text-white/30 mt-2 opacity-50 group-hover/chart:opacity-100 transition-opacity">
                                                {d.date.slice(8)} {/* Just show the day number if 2024-03-XX */}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-4 mt-6 text-[10px] tracking-wider text-white/40 uppercase font-mono justify-center">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-indigo-400" /> Normal</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-amber-400" /> Over</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-rose-500" /> Critical</div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
