'use client';

import { motion } from 'framer-motion';

interface Props {
    data: any[] | null;
}

export default function TopAppsBar({ data }: Props) {
    if (data === null) {
        return (
            <div className="space-y-4 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 w-full bg-surface-container rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="h-[250px] flex items-center justify-center text-on-surface-variant font-bold">No data available</div>;
    }

    const maxDuration = Math.max(...data.map(d => d.total_duration));

    return (
        <div className="space-y-5 w-full flex flex-col justify-center h-full">
            {data.slice(0, 4).map((item, index) => {
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
                        <div className="flex justify-between items-end mb-2 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[0.8rem] bg-surface recessed flex items-center justify-center text-xs font-bold text-primary overflow-hidden shrink-0">
                                    {item.app_name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-on-surface font-bold truncate max-w-[150px]">{item.app_name}</span>
                            </div>
                            <span className="font-black text-on-surface-variant text-sm shrink-0">{hours}h</span>
                        </div>
                        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(0,88,188,0.4)]"
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
