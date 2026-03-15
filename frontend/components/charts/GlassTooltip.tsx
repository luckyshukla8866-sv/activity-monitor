'use client';

export default function GlassTooltip({ active, payload, label, formatter, labelFormatter }: any) {
    if (active && payload && payload.length) {
        const displayLabel = labelFormatter ? labelFormatter(label) : label;
        return (
            <div className="bg-[#0a0a16]/80 backdrop-blur-[20px] px-4 py-3 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-xl">
                {displayLabel && <p className="text-white/50 text-xs mb-2 font-medium tracking-wider uppercase">{displayLabel}</p>}
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: entry.color || entry.payload.fill || '#6366f1' }} 
                            />
                            {entry.name && <span className="text-white/70 text-sm whitespace-nowrap">{entry.name}</span>}
                        </div>
                        <span className="text-white font-medium font-mono text-sm ml-auto">
                            {formatter ? formatter(entry.value, entry.name, entry, index, payload) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}
