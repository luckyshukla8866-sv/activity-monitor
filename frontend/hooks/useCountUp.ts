import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration: number = 1000): number {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!target) return;
        
        // Easing function: easeOutExpo
        const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

        const animate = () => {
            let start: number;
            const step = (timestamp: number) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const timeRatio = Math.min(progress / duration, 1);
                const val = target * easeOutExpo(timeRatio);
                
                setCount(val);

                if (timeRatio < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    setCount(target);
                }
            };
            window.requestAnimationFrame(step);
        };

        animate();
    }, [target, duration]);

    return count;
}
