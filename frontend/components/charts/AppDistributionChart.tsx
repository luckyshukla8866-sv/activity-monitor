'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import GlassTooltip from './GlassTooltip';

const COLORS = ['#6366f1', '#38bdf8', '#a855f7', '#10b981', '#f59e0b'];

interface Props {
    data: any[] | null;
}

export default function AppDistributionChart({ data }: Props) {
    if (data === null) {
        return (
            <div className="h-[280px] flex items-center justify-center">
                <div className="w-full h-full bg-white/[0.02] rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="h-[280px] flex items-center justify-center text-white/40">No data available</div>;
    }

    const chartData = data.map((item: any) => ({
        name: item.app_name,
        value: item.total_duration / 3600,
        percentage: item.percentage,
    }));

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationBegin={100}
                        animationEasing="ease-out"
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<GlassTooltip formatter={(val: number) => `${val.toFixed(2)} hrs`} />} />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
