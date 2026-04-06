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
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 shadow-sm'
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
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 shadow-sm'
                    }`}
                >
                    {app}
                </button>
            ))}
        </div>
    );
}
