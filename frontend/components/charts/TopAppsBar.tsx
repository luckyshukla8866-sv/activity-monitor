'use client';

import { motion } from 'framer-motion';

interface Props {
    data: any[] | null;
}

export default function TopAppsBar({ data }: Props) {
    if (data === null) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 w-full bg-white/[0.02] rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="h-[200px] flex items-center justify-center text-white/40">No data available</div>;
    }

    const maxDuration = Math.max(...data.map(d => d.total_duration));

    return (
        <div className="space-y-4">
            {data.slice(0, 5).map((item, index) => {
                const hours = (item.total_duration / 3600).toFixed(1);
                const percent = Math.max(5, (item.total_duration / maxDuration) * 100);
                
                return (
                    <motion.div 
                        key={item.app_name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.04 }}
                        className="group relative"
                    >
                        <div className="flex justify-between items-end mb-1 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/70 overflow-hidden shrink-0">
                                    {item.app_name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-white/80 font-medium truncate max-w-[150px]">{item.app_name}</span>
                            </div>
                            <span className="font-mono text-white/50 text-xs shrink-0">{hours}h</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 1, delay: 0.2 + index * 0.04, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
