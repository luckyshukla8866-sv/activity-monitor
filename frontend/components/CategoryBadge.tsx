import React from 'react';

const CATEGORY_COLORS: Record<string, string> = {
    deep_work: 'bg-primary-container/20 text-primary border-primary/20',
    communication: 'bg-tertiary-container/30 text-tertiary border-tertiary/20',
    distraction: 'bg-error-container/20 text-error border-error/20',
    neutral: 'bg-surface-variant/40 text-on-surface-variant border-outline-variant/30',
};

const CATEGORY_ICONS: Record<string, string> = {
    deep_work: 'bolt',
    communication: 'chat',
    distraction: 'sports_esports',
    neutral: 'remove',
};

interface Props {
    category: string;
    label?: string;
}

export default function CategoryBadge({ category, label }: Props) {
    const defaultColorKey = category.toLowerCase().replace(' ', '_');
    const colorClass = CATEGORY_COLORS[defaultColorKey] || CATEGORY_COLORS.neutral;
    const iconName = CATEGORY_ICONS[defaultColorKey] || CATEGORY_ICONS.neutral;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
            <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>{iconName}</span>
            {label || category}
        </span>
    );
}
