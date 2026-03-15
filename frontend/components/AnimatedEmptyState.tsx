import { motion } from 'framer-motion';
import { AreaChart, SearchX } from 'lucide-react';
import GlassCard from './GlassCard';
import Link from 'next/link';

export default function AnimatedEmptyState() {
    return (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
            <motion.div
                animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl relative z-10 backdrop-blur-md">
                    <AreaChart className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md">
                    <SearchX className="w-5 h-5 text-slate-400" />
                </div>
            </motion.div>
            
            <h3 className="text-xl font-medium text-white/90 mb-2">No Sessions Found</h3>
            <p className="text-white/40 text-sm max-w-sm mb-8 leading-relaxed">
                We couldn't find any tracked sessions matching your current filters. Try adjusting your search or tracking more activity.
            </p>
            
            <Link 
                href="/upload"
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-500/50 hover:scale-105 active:scale-95"
            >
                Upload Activity Data
            </Link>
        </GlassCard>
    );
}
