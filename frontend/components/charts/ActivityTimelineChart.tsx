'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    data: any[] | null;
}

export default function ActivityTimelineChart({ data }: Props) {
    if (data === null) {
        return <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full bg-slate-800/50 rounded-lg animate-pulse" />
        </div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis
                    dataKey="hour"
                    stroke="#94a3b8"
                    tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis stroke="#94a3b8" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)} min`}
                    labelFormatter={(hour) => `${hour}:00`}
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        borderRadius: '0.5rem',
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="active_minutes"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
