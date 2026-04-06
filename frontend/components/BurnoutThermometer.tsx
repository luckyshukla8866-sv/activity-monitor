'use client';

import { motion } from 'framer-motion';

export default function BurnoutThermometer({ score }: { score: number }) {
    let colorClass = 'from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
    if (score > 30) colorClass = 'from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
    if (score > 70) colorClass = 'from-rose-500 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.3)]';

    return (
        <div className="w-full relative py-6">
            <div className="h-4 w-full bg-surface-container-high rounded-full relative overflow-hidden recessed">
                <motion.div
                    className={`h-full absolute left-0 top-0 rounded-full bg-gradient-to-r ${colorClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </div>
            {/* Needle indicator */}
            <motion.div
                className="absolute top-4 w-3 h-8 bg-surface rounded-full shadow-md border-[2px] border-on-surface -ml-[6px] z-10"
                initial={{ left: '0%' }}
                animate={{ left: `${score}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <div className="flex justify-between mt-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                <span>Safe</span>
                <span>Warning</span>
                <span>Critical</span>
            </div>
        </div>
    );
}
