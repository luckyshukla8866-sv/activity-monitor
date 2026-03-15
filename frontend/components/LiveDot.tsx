'use client';
import { cn } from '@/lib/utils';

export default function LiveDot({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex h-3 w-3 items-center justify-center", className)}>
      <span className="animate-[dotPulse_2s_ease_infinite] absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </div>
  );
}
