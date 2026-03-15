'use client';

import { motion } from 'framer-motion';

export default function BurnoutThermometer({ score }: { score: number }) {
    // Score is 0 to 100
    // Color mapping: 0-30 greenish, 31-70 yellowish, 71-100 reddish
    let colorClass = 'from-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    if (score > 30) colorClass = 'from-amber-400 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    if (score > 70) colorClass = 'from-rose-500 to-red-600 shadow-[0_0_15px_rgba(244,63,94,0.5)]';

    return (
        <div className="w-full relative py-6">
            <div className="h-4 w-full bg-white/5 rounded-full relative overflow-hidden">
                <motion.div
                    className={`h-full absolute left-0 top-0 rounded-full bg-gradient-to-r ${colorClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </div>
            {/* Needle indicator */}
            <motion.div
                className="absolute top-2 w-4 h-8 bg-white rounded-full shadow-lg border-2 border-[#0a0a16] -ml-2 z-10"
                initial={{ left: '0%' }}
                animate={{ left: `${score}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <div className="flex justify-between mt-4 text-xs font-mono text-white/40 uppercase tracking-widest">
                <span>Safe</span>
                <span>Warning</span>
                <span>Critical</span>
            </div>
        </div>
    );
}
