'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { insightsAPI } from '@/lib/api';
import BurnoutThermometer from '@/components/BurnoutThermometer';
import AlertBanner from '@/components/AlertBanner';
import WeeklyHeatmap from '@/components/charts/WeeklyHeatmap';
import FocusForecastChart from '@/components/charts/FocusForecastChart';
import CategoryTrendsChart from '@/components/charts/CategoryTrendsChart';

function getHourIcon(hour: number) {
    if (hour >= 6 && hour < 12) return 'routine';
    if (hour >= 12 && hour < 18) return 'light_mode';
    return 'dark_mode';
}

function getScoreBarColor(score: number) {
    if (score >= 80) return 'bg-primary shadow-[0_0_8px_rgba(0,88,188,0.4)]';
    if (score >= 60) return 'bg-tertiary shadow-[0_0_8px_rgba(136,60,147,0.4)]';
    if (score >= 30) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]';
    if (score > 0) return 'bg-error shadow-[0_0_8px_rgba(179,27,37,0.4)]';
    return 'bg-surface-container border-transparent';
}

export default function ForecastPage() {
    const [forecast, setForecast] = useState<any>(null);
    const [burnout, setBurnout] = useState<any>(null);
    const [heatmapData, setHeatmapData] = useState<any>(null);
    const [focusForecast, setFocusForecast] = useState<any>(null);
    const [categoryTrends, setCategoryTrends] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const errs: Record<string, string> = {};
        try {
            const [f, b, hm, ff, ct] = await Promise.allSettled([
                insightsAPI.getForecast(30),
                insightsAPI.getBurnout(),
                insightsAPI.getWeeklyHeatmap(4),
                insightsAPI.getFocusForecast(),
                insightsAPI.getCategoryTrends(30),
            ]);

            if (f.status === 'fulfilled') setForecast(f.value);
            else { console.error('Forecast API failed:', f.reason); errs.forecast = String(f.reason); }

            if (b.status === 'fulfilled') setBurnout(b.value);
            else { console.error('Burnout API failed:', b.reason); errs.burnout = String(b.reason); }

            if (hm.status === 'fulfilled') { setHeatmapData(hm.value); console.log('Heatmap data:', hm.value); }
            else { console.error('Heatmap API failed:', hm.reason); errs.heatmap = String(hm.reason); }

            if (ff.status === 'fulfilled') { setFocusForecast(ff.value); console.log('Focus forecast data:', ff.value); }
            else { console.error('Focus forecast API failed:', ff.reason); errs.focusForecast = String(ff.reason); }

            if (ct.status === 'fulfilled') { setCategoryTrends(ct.value); console.log('Category trends data:', ct.value); }
            else { console.error('Category trends API failed:', ct.reason); errs.categoryTrends = String(ct.reason); }
        } catch (err) {
            console.error('Failed to load forecast:', err);
        } finally {
            setErrors(errs);
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
                    <h1 className="text-3xl font-black tracking-tight text-on-surface">Forecast & Burnout</h1>
                    <p className="text-lg text-on-surface-variant mt-1">Predict your peak hours and monitor work health</p>
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-surface recessed p-8 animate-pulse rounded-[2rem] h-32" />
                ))}
            </div>
        );
    }

    const risk = burnout?.risk_level || 'UNKNOWN';

    // Determine if data is actually available
    const hasHeatmapData = heatmapData?.grid?.length > 0;
    const hasFocusForecastData = focusForecast?.forecast?.length > 0;
    const hasCategoryTrendsData = categoryTrends?.categories?.length > 0;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-12 max-w-[1440px] mx-auto px-4 md:px-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-on-surface soft-text">Forecast & Burnout</h1>
                <p className="text-lg text-on-surface-variant mt-2 font-medium">Predict your peak hours and monitor work health</p>
            </div>

            {/* Top Row: Peak Hours + Burnout Risk */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Peak Hours Card */}
                <motion.div variants={containerVariants}>
                    <div className="bg-surface extrusion p-10 h-full rounded-[2rem] interactive-card relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-xl bg-primary-container/20 border border-primary/10 text-primary shadow-sm">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>trending_up</span>
                            </div>
                            <h2 className="text-xl font-bold text-on-surface soft-text">Predicted Peak Hours</h2>
                        </div>
                        {forecast?.peak_hours?.length > 0 ? (
                            <div className="space-y-5">
                                {forecast.peak_hours.map((h: any, i: number) => {
                                    const iconName = getHourIcon(h.hour);
                                    return (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-surface recessed rounded-2xl hover:bg-surface-container transition-colors">
                                            <div className="p-2 rounded-lg bg-surface text-primary">
                                                <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>{iconName}</span>
                                            </div>
                                            <span className="font-bold text-on-surface text-sm w-16">{h.label}</span>
                                            <div className="flex-1 h-3 bg-surface-container-high rounded-full mx-2 overflow-hidden shadow-inner">
                                                <motion.div
                                                    className="h-full bg-primary shadow-[0_0_8px_rgba(0,88,188,0.4)] rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${h.score}%` }}
                                                    transition={{ duration: 1, delay: i * 0.2 }}
                                                />
                                            </div>
                                            <span className="text-primary font-black tabular-nums text-sm w-10 text-right">{h.score}%</span>
                                        </div>
                                    );
                                })}
                                <p className="text-sm text-on-surface-variant mt-6 px-2 italic font-medium leading-relaxed">"{forecast.insight}"</p>
                            </div>
                        ) : (
                            <p className="text-on-surface-variant font-bold text-center py-10 text-sm">Not enough data to predict peak hours.</p>
                        )}
                    </div>
                </motion.div>

                {/* Burnout Thermometer Card */}
                <motion.div variants={containerVariants}>
                    <div className="bg-surface extrusion p-10 h-full flex flex-col justify-between group overflow-hidden relative rounded-[2rem] interactive-card">
                         <div className="absolute inset-0 bg-gradient-to-br from-error-container/5 to-transparent pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-error-container/10 border border-error/10 text-error shadow-sm">
                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                                </div>
                                <h2 className="text-xl font-bold text-on-surface soft-text">Burnout Risk</h2>
                            </div>
                            
                            <div className="text-5xl font-black tracking-tight text-on-surface mb-4 pl-2 soft-text uppercase">
                                {risk}
                            </div>
                            <p className="text-on-surface-variant font-medium text-sm mb-10 pl-2 max-w-sm">{burnout?.message || 'Monitoring active work hours for burnout signs.'}</p>
                        </div>
                        
                        <div className="relative z-10 pb-4">
                            <BurnoutThermometer score={burnout?.risk_score || 0} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                Weekly Activity Heatmap — ALWAYS SHOWN
               ══════════════════════════════════════════════════════════ */}
            <motion.div variants={containerVariants}>
                <div className="bg-surface extrusion p-10 rounded-[2rem] interactive-card">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-xl bg-primary-container/20 border border-primary/10 text-primary shadow-sm">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>grid_view</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-on-surface soft-text">Weekly Activity Heatmap</h2>
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1.5">
                                {hasHeatmapData ? `Last ${heatmapData.weeks} weeks of daily activity intensity` : 'Colored grid of activity intensity over time'}
                            </p>
                        </div>
                    </div>
                    {hasHeatmapData ? (
                        <WeeklyHeatmap
                            grid={heatmapData.grid}
                            weeks={heatmapData.weeks}
                            maxMinutes={heatmapData.max_minutes}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4" style={{fontVariationSettings: "'FILL' 1"}}>grid_view</span>
                            <p className="text-sm font-bold text-on-surface-variant mb-1">No heatmap data yet</p>
                            <p className="text-xs text-on-surface-variant/70 max-w-sm">
                                {errors.heatmap
                                    ? 'Could not load heatmap data. Make sure the backend is running.'
                                    : 'Upload your activity data to see your weekly activity heatmap. The heatmap shows activity intensity as a GitHub-contribution-style grid.'}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ══════════════════════════════════════════════════════════
                7-Day Focus Forecast & App Category Trends — ALWAYS SHOWN
               ══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* 7-Day Focus Forecast */}
                <motion.div variants={containerVariants}>
                    <div className="bg-surface extrusion p-8 h-full rounded-[2rem] interactive-card flex flex-col">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-[1rem] bg-surface recessed text-primary">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>show_chart</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-on-surface soft-text">7-Day Focus Forecast</h2>
                                <p className="text-xs font-bold text-on-surface-variant mt-1.5 uppercase tracking-widest">Predicted focus score with confidence interval</p>
                            </div>
                        </div>
                        {hasFocusForecastData ? (
                            <>
                                <div className="flex-1 min-h-[280px]">
                                    <FocusForecastChart data={focusForecast.forecast} />
                                </div>
                                <div className="flex items-center justify-center gap-6 mt-6 text-[10px] tracking-widest text-on-surface-variant uppercase font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-1 bg-gradient-to-r from-primary to-tertiary rounded" />
                                        Predicted Score
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-3 bg-tertiary/20 border border-tertiary/30 rounded-sm" />
                                        Confidence Band
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4" style={{fontVariationSettings: "'FILL' 1"}}>show_chart</span>
                                <p className="text-sm font-bold text-on-surface-variant mb-1">No forecast data yet</p>
                                <p className="text-xs text-on-surface-variant/70 max-w-xs">
                                    {errors.focusForecast
                                        ? 'Could not load focus forecast. Make sure the backend is running.'
                                        : 'Upload activity data to see your 7-day focus forecast with confidence bands based on day-of-week patterns.'}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* App Category Trends */}
                <motion.div variants={containerVariants}>
                    <div className="bg-surface extrusion p-8 h-full rounded-[2rem] interactive-card">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-[1rem] bg-surface recessed text-tertiary">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>insert_chart</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-on-surface soft-text">App Category Trends</h2>
                                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1.5">
                                    {hasCategoryTrendsData ? `Time distribution across ${categoryTrends.period_days} days` : 'Horizontal bar chart of category percentages'}
                                </p>
                            </div>
                        </div>
                        {hasCategoryTrendsData ? (
                            <CategoryTrendsChart
                                categories={categoryTrends.categories}
                                totalHours={categoryTrends.total_hours}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4" style={{fontVariationSettings: "'FILL' 1"}}>insert_chart</span>
                                <p className="text-sm font-bold text-on-surface-variant mb-1">No category data yet</p>
                                <p className="text-xs text-on-surface-variant/70 max-w-xs">
                                    {errors.categoryTrends
                                        ? 'Could not load category trends. Make sure the backend is running.'
                                        : 'Upload activity data to see your app usage broken down by Deep Work, Communication, Distraction, and Neutral categories.'}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Warnings AlertBanner */}
            {burnout?.warnings?.length > 0 && (
                <motion.div variants={containerVariants} className="space-y-4">
                    <h2 className="text-sm font-bold text-on-surface mb-2 px-2 uppercase tracking-widest">Active Alerts</h2>
                    {burnout.warnings.map((w: any, i: number) => (
                        <AlertBanner key={i} severity={w.severity} message={w.message} />
                    ))}
                </motion.div>
            )}

            {/* Recommendations */}
            {burnout?.recommendations?.length > 0 && (
                <motion.div variants={containerVariants} className="mt-8">
                    <div className="bg-surface extrusion p-8 rounded-[2rem] interactive-card">
                        <h2 className="text-xl font-bold text-on-surface mb-6 soft-text">AI Recommendations</h2>
                        <div className="space-y-4">
                            {burnout.recommendations.map((rec: string, i: number) => (
                                <div key={i} className="flex items-start gap-4 p-5 bg-surface recessed rounded-2xl hover:bg-surface-container transition-colors">
                                    <span className="material-symbols-outlined text-primary shrink-0 mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                    <p className="text-sm text-on-surface leading-relaxed font-medium">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Hourly Productivity Heatmap & Daily Trend */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                <motion.div variants={containerVariants}>
                    <div className="bg-surface extrusion p-8 h-full rounded-[2rem] interactive-card">
                        <h2 className="text-xl font-bold text-on-surface mb-8 soft-text">Hourly Productivity Pattern</h2>
                        <div className="grid grid-cols-12 gap-1.5 md:gap-2">
                            {forecast?.hourly_data?.filter((h: any) => h.hour >= 6 && h.hour <= 23).map((h: any) => (
                                <div key={h.hour} className="flex flex-col items-center group/heat">
                                    <div
                                        className={`w-full h-16 md:h-24 rounded-[0.5rem] border border-surface transition-all duration-300 ${getScoreBarColor(h.avg_score)}`}
                                        style={{ opacity: h.avg_score > 0 ? 0.3 + (h.avg_score / 100) * 0.7 : 0.05 }}
                                        title={`${h.hour_label}: Score ${h.avg_score}, ${h.avg_minutes} min avg`}
                                    />
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mt-3 opacity-50 group-hover/heat:opacity-100 transition-opacity">
                                        {h.hour_label.replace(':00', '')}
                                    </p>
                                </div>
                            ))}
                        </div>
                         <div className="flex items-center gap-6 mt-8 text-[10px] tracking-widest text-on-surface-variant uppercase font-bold justify-center">
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-primary shadow-sm" /> Peak</div>
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-tertiary" /> Active</div>
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Mixed</div>
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-error" /> Low</div>
                        </div>
                    </div>
                </motion.div>

                {/* Daily Hours Trend */}
                {burnout?.daily_data?.length > 0 && (
                    <motion.div variants={containerVariants}>
                        <div className="bg-surface extrusion p-8 h-full flex flex-col rounded-[2rem] interactive-card">
                            <h2 className="text-xl font-bold text-on-surface mb-8 soft-text">Daily Hours Trend (14 Days)</h2>
                            <div className="flex-1 flex items-end gap-2 min-h-[140px] pt-10">
                                {burnout.daily_data.map((d: any, i: number) => {
                                    const maxH = Math.max(...burnout.daily_data.map((x: any) => x.hours), 1);
                                    let height = (d.hours / maxH) * 100;
                                    // Ensure visual min height
                                    if (height > 0 && height < 5) height = 5;
                                    
                                    const color = d.hours > 10 ? 'bg-error shadow-[0_0_8px_rgba(179,27,37,0.4)]' :
                                                 d.hours > 8 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'bg-primary shadow-[0_0_8px_rgba(0,88,188,0.4)]';
                                    
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group/chart relative">
                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-12 scale-0 group-hover/chart:scale-100 transition-transform bg-surface extrusion border border-surface-variant rounded-lg px-2.5 py-1.5 text-xs font-bold text-on-surface whitespace-nowrap z-10 shadow-xl">
                                                {d.hours}h
                                            </div>
                                            <div
                                                className={`w-full rounded-full ${color} transition-all duration-500 ease-out`}
                                                style={{ height: `${height}%`, minHeight: d.hours > 0 ? '8px' : '4px', opacity: d.hours > 0 ? 1 : 0.1 }}
                                            />
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase mt-3 opacity-50 group-hover/chart:opacity-100 transition-opacity">
                                                {d.date.slice(8)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-6 mt-8 text-[10px] tracking-widest text-on-surface-variant uppercase font-bold justify-center">
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-primary" /> Normal</div>
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Over</div>
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-error" /> Critical</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

