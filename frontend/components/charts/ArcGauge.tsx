'use client';

import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';

interface ArcGaugeProps {
    value: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
}

export default function ArcGauge({ value, size = 300, strokeWidth = 20 }: ArcGaugeProps) {
    const radius = (size - strokeWidth) / 2;
    const arcLength = Math.PI * radius;
    const strokeDasharray = `${arcLength} ${arcLength}`;
    const displayValue = useCountUp(value, 1500);
    
    // Gradient computation
    const offset = arcLength - (value / 100) * arcLength;

    return (
        <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size / 2 + strokeWidth }}>
            <svg 
                width={size} 
                height={size / 2 + strokeWidth} 
                viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
                className="overflow-visible"
            >
                <defs>
                    <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#b31b25" /> {/* error */}
                        <stop offset="50%" stopColor="#f59e0b" /> {/* amber */}
                        <stop offset="100%" stopColor="#0058bc" /> {/* primary */}
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                
                {/* Background Arc */}
                <path
                    d={`M ${strokeWidth / 2} ${size / 2 + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2 + strokeWidth / 2}`}
                    fill="none"
                    stroke="var(--surface-container-high, #dce3ec)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />

                {/* Foreground Animated Arc */}
                <motion.path
                    d={`M ${strokeWidth / 2} ${size / 2 + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2 + strokeWidth / 2}`}
                    fill="none"
                    stroke="url(#arcGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    initial={{ strokeDashoffset: arcLength }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            
            <div className="absolute bottom-4 flex flex-col items-center">
                <span className="text-6xl font-black tracking-tighter text-on-surface soft-text">
                    {displayValue.toFixed(0)}
                </span>
                <span className="text-on-surface-variant font-bold text-sm uppercase tracking-widest mt-1">Score</span>
            </div>
        </div>
    );
}
