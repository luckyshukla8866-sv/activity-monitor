'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    data: any[] | null;
}

export default function TopAppsChart({ data }: Props) {
    if (data === null) {
        return <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full bg-slate-800/50 rounded-lg animate-pulse" />
        </div>;
    }

    if (data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>;
    }

    const chartData = data.map((item: any) => ({
        name: item.app_name,
        hours: item.total_duration / 3600,
        sessions: item.session_count,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                <Tooltip
                    formatter={(value: number) => `${value.toFixed(2)} hours`}
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        borderRadius: '0.5rem',
                    }}
                />
                <Bar dataKey="hours" fill="#06b6d4" radius={[0, 8, 8, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
