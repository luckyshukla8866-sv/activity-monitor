'use client';

import { motion } from 'framer-motion';

interface HeatmapCell {
    date: string;
    day_name: string;
    week_index: number;
    day_index: number;
    intensity: number;
    minutes: number;
    sessions: number;
}

interface WeeklyHeatmapProps {
    grid: HeatmapCell[];
    weeks: number;
    maxMinutes: number;
}

const INTENSITY_COLORS = [
    'bg-surface-container border-surface-variant/40',                             // 0 — no activity
    'bg-primary/20 border-primary/30',                                            // 1 — light
    'bg-primary/40 border-primary/50',                                            // 2 — moderate
    'bg-primary/70 border-primary/60 shadow-[0_0_6px_rgba(0,88,188,0.2)]',        // 3 — high
    'bg-primary border-primary shadow-[0_0_10px_rgba(0,88,188,0.4)]',             // 4 — peak
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyHeatmap({ grid, weeks, maxMinutes }: WeeklyHeatmapProps) {
    const matrix: (HeatmapCell | null)[][] = Array.from({ length: 7 }, () =>
        Array.from({ length: weeks }, () => null)
    );

    for (const cell of grid) {
        if (cell.day_index >= 0 && cell.day_index < 7 && cell.week_index >= 0 && cell.week_index < weeks) {
            matrix[cell.day_index][cell.week_index] = cell;
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                {/* Day labels column */}
                <div className="flex flex-col gap-2 pt-0 mr-1">
                    {DAY_LABELS.map((label, i) => (
                        <div key={label} className="h-[28px] md:h-[34px] flex items-center">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest w-7 text-right">
                                {i % 2 === 0 ? label : ''}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex-1 flex gap-2">
                    {Array.from({ length: weeks }).map((_, weekIdx) => (
                        <div key={weekIdx} className="flex-1 flex flex-col gap-2">
                            {Array.from({ length: 7 }).map((_, dayIdx) => {
                                const cell = matrix[dayIdx]?.[weekIdx];
                                const intensity = cell?.intensity ?? 0;

                                return (
                                    <motion.div
                                        key={`${weekIdx}-${dayIdx}`}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: (weekIdx * 7 + dayIdx) * 0.008,
                                            duration: 0.3,
                                        }}
                                        className="relative group/cell"
                                    >
                                        <div
                                            className={`
                                                h-[28px] md:h-[34px] w-full rounded-md border
                                                transition-all duration-200
                                                group-hover/cell:scale-110 group-hover/cell:z-10
                                                ${INTENSITY_COLORS[intensity]}
                                            `}
                                        />
                                        {/* Tooltip */}
                                        {cell && (
                                            <div className="
                                                absolute -top-14 left-1/2 -translate-x-1/2 z-50
                                                scale-0 group-hover/cell:scale-100
                                                transition-transform origin-bottom
                                                bg-surface extrusion border border-surface-variant
                                                rounded-lg px-3 py-2 whitespace-nowrap
                                                pointer-events-none shadow-xl
                                            ">
                                                <p className="text-xs text-on-surface font-bold">
                                                    {cell.day_name}, {cell.date.slice(5)}
                                                </p>
                                                <p className="text-[10px] text-on-surface-variant font-bold mt-1 uppercase tracking-widest">
                                                    {cell.minutes > 0
                                                        ? `${Math.round(cell.minutes)} min · ${cell.sessions} sessions`
                                                        : 'No activity'}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 pt-4">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mr-1">Less</span>
                {INTENSITY_COLORS.map((cls, i) => (
                    <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-sm border ${cls}`}
                    />
                ))}
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">More</span>
            </div>
        </div>
    );
}
