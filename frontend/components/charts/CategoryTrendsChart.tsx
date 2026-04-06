'use client';

import { motion } from 'framer-motion';

interface CategoryEntry {
    category: string;
    label: string;
    percentage: number;
    hours: number;
    top_apps: { name: string; hours: number }[];
}

interface CategoryTrendsChartProps {
    categories: CategoryEntry[];
    totalHours: number;
}

const CATEGORY_STYLES: Record<string, {
    bar: string;
    bg: string;
    text: string;
    icon: string;
}> = {
    deep_work: {
        bar: 'bg-primary shadow-[0_0_8px_rgba(0,88,188,0.3)]',
        bg: 'bg-primary/10 border-primary/20',
        text: 'text-primary',
        icon: 'psychology',
    },
    communication: {
        bar: 'bg-tertiary shadow-[0_0_8px_rgba(136,60,147,0.3)]',
        bg: 'bg-tertiary/10 border-tertiary/20',
        text: 'text-tertiary',
        icon: 'forum',
    },
    distraction: {
        bar: 'bg-error shadow-[0_0_8px_rgba(179,27,37,0.3)]',
        bg: 'bg-error/10 border-error/20',
        text: 'text-error',
        icon: 'sports_esports',
    },
    neutral: {
        bar: 'bg-on-surface-variant shadow-[0_0_8px_rgba(86,92,98,0.2)]',
        bg: 'bg-surface-variant/40 border-outline/20',
        text: 'text-on-surface-variant',
        icon: 'remove',
    },
};

export default function CategoryTrendsChart({ categories, totalHours }: CategoryTrendsChartProps) {
    return (
        <div className="space-y-6">
            {categories.map((cat, idx) => {
                const style = CATEGORY_STYLES[cat.category] || CATEGORY_STYLES.neutral;

                return (
                    <motion.div
                        key={cat.category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        className="group"
                    >
                        {/* Category header row */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`material-symbols-outlined text-[16px] ${style.text}`} style={{fontVariationSettings: "'FILL' 1"}}>{style.icon}</span>
                                <span className={`text-sm font-bold ${style.text}`}>
                                    {cat.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-on-surface-variant tabular-nums">
                                    {cat.hours}h
                                </span>
                                <span className={`text-sm font-black tabular-nums ${style.text}`}>
                                    {cat.percentage}%
                                </span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-4 bg-surface-container-high rounded-full overflow-hidden recessed">
                            <motion.div
                                className={`h-full rounded-full ${style.bar}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(cat.percentage, 1)}%` }}
                                transition={{ duration: 1.2, delay: idx * 0.15, ease: 'easeOut' }}
                            />
                        </div>

                        {/* Top apps sub-row */}
                        {cat.top_apps.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 pl-6">
                                {cat.top_apps.map(app => (
                                    <span
                                        key={app.name}
                                        className={`
                                            text-[10px] px-2.5 py-1 rounded-md border
                                            ${style.text} ${style.bg}
                                            font-bold uppercase tracking-wider
                                        `}
                                    >
                                        {app.name}
                                        <span className="opacity-60 ml-1.5">{app.hours}h</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                );
            })}

            {/* Total hours summary */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-surface-variant/30">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Total tracked this period
                </span>
                <span className="text-sm font-black text-on-surface">
                    {totalHours} <span className="text-xs font-bold text-on-surface-variant ml-1">hrs</span>
                </span>
            </div>
        </div>
    );
}
