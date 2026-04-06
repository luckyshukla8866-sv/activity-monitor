'use client';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart,
} from 'recharts';

interface FocusForecastEntry {
    date: string;
    day_name: string;
    predicted_score: number;
    lower_bound: number;
    upper_bound: number;
}

interface FocusForecastChartProps {
    data: FocusForecastEntry[];
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;

    return (
        <div className="bg-surface/95 backdrop-blur-xl border border-surface-variant rounded-xl px-4 py-3 shadow-xl extrusion z-50">
            <p className="text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                {d.day_name}, {d.date.slice(5)}
            </p>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-xs text-on-surface-variant font-medium">Predicted:</span>
                    </div>
                    <span className="text-sm text-on-surface font-black tabular-nums">{d.predicted_score}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-tertiary/60" />
                        <span className="text-xs text-on-surface-variant font-medium">Range:</span>
                    </div>
                    <span className="text-xs text-on-surface font-bold tabular-nums">{d.lower_bound}% – {d.upper_bound}%</span>
                </div>
            </div>
        </div>
    );
}

export default function FocusForecastChart({ data }: FocusForecastChartProps) {
    const chartData = data.map(d => ({
        ...d,
        band: [d.lower_bound, d.upper_bound],
    }));

    return (
        <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                <defs>
                    <linearGradient id="focusBandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#883c93" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#883c93" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="focusLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0058bc" />
                        <stop offset="50%" stopColor="#3953b7" />
                        <stop offset="100%" stopColor="#883c93" />
                    </linearGradient>
                    <filter id="focusGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <CartesianGrid
                    strokeDasharray="3 6"
                    stroke="rgba(0,0,0,0.05)"
                    vertical={false}
                />

                <XAxis
                    dataKey="day_name"
                    tick={{ fill: '#565c62', fontSize: 11, fontFamily: 'Manrope', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                />

                <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#565c62', fontSize: 10, fontFamily: 'Manrope', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={5}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />

                {/* Confidence band */}
                <Area
                    type="monotone"
                    dataKey="band"
                    fill="url(#focusBandGrad)"
                    stroke="rgba(136, 60, 147, 0.2)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    isAnimationActive
                    animationDuration={1200}
                />

                {/* Main prediction line */}
                <Line
                    type="monotone"
                    dataKey="predicted_score"
                    stroke="url(#focusLineGrad)"
                    strokeWidth={3}
                    dot={{
                        r: 5,
                        fill: '#f2f7fe',
                        stroke: '#0058bc',
                        strokeWidth: 2,
                    }}
                    activeDot={{
                        r: 7,
                        fill: '#0058bc',
                        stroke: '#f2f7fe',
                        strokeWidth: 2,
                        filter: 'url(#focusGlow)',
                    }}
                    isAnimationActive
                    animationDuration={1500}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
