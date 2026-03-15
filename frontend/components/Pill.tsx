import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type PillColor = 'indigo' | 'sky' | 'violet' | 'emerald' | 'amber' | 'red';

interface PillProps {
  children: ReactNode;
  color?: PillColor;
  className?: string;
}

const colorMaps: Record<PillColor, string> = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
  sky: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  red: 'bg-red-500/10 border-red-500/20 text-red-300',
};

export default function Pill({ children, color = 'indigo', className }: PillProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium tracking-wide',
      colorMaps[color],
      className
    )}>
      {children}
    </span>
  );
}
