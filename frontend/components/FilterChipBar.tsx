import { motion } from 'framer-motion';

interface FilterChipBarProps {
    apps: string[];
    activeApp: string;
    onSelectApp: (app: string) => void;
}

export default function FilterChipBar({ apps, activeApp, onSelectApp }: FilterChipBarProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide hide-scrollbar w-full">
            <button
                onClick={() => onSelectApp('')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeApp === ''
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80'
                }`}
            >
                All Apps
            </button>
            {apps.map((app) => (
                <button
                    key={app}
                    onClick={() => onSelectApp(app)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        activeApp === app
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                            : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80'
                    }`}
                >
                    {app}
                </button>
            ))}
        </div>
    );
}
