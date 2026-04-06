import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AnimatedEmptyState() {
    return (
        <div className="extrusion rounded-[2rem] p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
            <motion.div
                animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150" />
                <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm relative z-10">
                    <span className="material-symbols-outlined text-[40px] text-indigo-500">monitoring</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm z-20">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">search_off</span>
                </div>
            </motion.div>
            
            <h3 className="text-xl font-medium text-slate-800 mb-2 font-manrope">No Sessions Found</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed font-inter">
                We couldn't find any tracked sessions matching your current filters. Try adjusting your search or tracking more activity.
            </p>
            
            <Link 
                href="/upload"
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 inline-block"
            >
                Upload Activity Data
            </Link>
        </div>
    );
}
