'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassTooltip from './GlassTooltip';

interface Props {
    data: any[] | null;
}

export default function ActivityTimelineChart({ data }: Props) {
    if (data === null) {
        return (
            <div className="h-[280px] flex items-center justify-center">
                <div className="w-full h-full bg-surface-container rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="h-[280px] flex items-center justify-center text-on-surface-variant">No activity recorded today</div>;
    }

    return (
        <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0058bc" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#0058bc" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" vertical={false} />
                    <XAxis
                        dataKey="hour"
                        stroke="rgba(0,0,0,0.1)"
                        tick={{ fill: '#565c62', fontSize: 12, fontFamily: 'Manrope', fontWeight: 600 }}
                        tickFormatter={(hour) => `${hour}:00`}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis 
                        stroke="rgba(0,0,0,0.1)" 
                        tick={{ fill: '#565c62', fontSize: 12, fontFamily: 'Manrope', fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip 
                        content={<GlassTooltip formatter={(val: number) => `${val.toFixed(1)} min`} labelFormatter={(l: string) => `${l}:00 - ${Number(l)+1}:00`} />} 
                        cursor={{ stroke: 'rgba(0, 88, 188, 0.2)', strokeWidth: 2, strokeDasharray: '4 4' }} 
                    />
                    <Area
                        type="monotone"
                        dataKey="active_minutes"
                        stroke="#0058bc"
                        strokeWidth={4}
                        fill="url(#colorActive)"
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        activeDot={{ r: 6, fill: '#0058bc', stroke: '#f2f7fe', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
