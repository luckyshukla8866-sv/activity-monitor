'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import GlassTooltip from './GlassTooltip';

const COLORS = ['#0058bc', '#883c93', '#3953b7', '#10b981', '#f59e0b'];

interface Props {
    data: any[] | null;
}

export default function AppDistributionChart({ data }: Props) {
    if (data === null) {
        return (
            <div className="h-[280px] flex items-center justify-center">
                <div className="w-full h-full bg-surface-container rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="h-[280px] flex items-center justify-center text-on-surface-variant font-medium">No data available</div>;
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
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationBegin={100}
                        animationEasing="ease-out"
                        cornerRadius={4}
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-sm" />
                        ))}
                    </Pie>
                    <Tooltip content={<GlassTooltip formatter={(val: number) => `${val.toFixed(2)} hrs`} />} />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '13px', color: '#565c62', fontWeight: 600, fontFamily: 'Manrope' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
