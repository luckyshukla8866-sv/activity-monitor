'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

interface Props {
    data: any[] | null;
}

export default function AppDistributionChart({ data }: Props) {
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
        value: item.total_duration / 3600,
        percentage: item.percentage,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage?.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number) => `${value.toFixed(2)} hours`}
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        borderRadius: '0.5rem',
                    }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
