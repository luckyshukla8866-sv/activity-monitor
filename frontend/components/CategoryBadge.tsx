import { Minus, Zap, MessageSquare, Gamepad2 } from 'lucide-react';
import React from 'react';

const CATEGORY_COLORS: Record<string, string> = {
    deep_work: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]',
    communication: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]',
    distraction: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const CATEGORY_ICONS: Record<string, any> = {
    deep_work: Zap,
    communication: MessageSquare,
    distraction: Gamepad2,
    neutral: Minus,
};

interface Props {
    category: string;
    label?: string;
}

export default function CategoryBadge({ category, label }: Props) {
    const defaultColorKey = category.toLowerCase().replace(' ', '_');
    const colorClass = CATEGORY_COLORS[defaultColorKey] || CATEGORY_COLORS.neutral;
    const Icon = CATEGORY_ICONS[defaultColorKey] || CATEGORY_ICONS.neutral;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            <Icon className="w-3.5 h-3.5" />
            {label || category}
        </span>
    );
}
