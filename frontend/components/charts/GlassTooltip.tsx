'use client';

export default function GlassTooltip({ active, payload, label, formatter, labelFormatter }: any) {
    if (active && payload && payload.length) {
        const displayLabel = labelFormatter ? labelFormatter(label) : label;
        return (
            <div className="bg-surface/95 backdrop-blur-[20px] px-4 py-3 border border-surface-variant shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-xl extrusion relative z-50">
                {displayLabel && <p className="text-on-surface-variant text-xs mb-2 font-bold tracking-wider uppercase">{displayLabel}</p>}
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-2 h-2 rounded-full shadow-sm" 
                                style={{ backgroundColor: entry.color || entry.payload.fill || '#0058bc' }} 
                            />
                            {entry.name && <span className="text-on-surface text-sm whitespace-nowrap font-medium">{entry.name}</span>}
                        </div>
                        <span className="text-on-surface font-black text-sm ml-auto tabular-nums">
                            {formatter ? formatter(entry.value, entry.name, entry, index, payload) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}
