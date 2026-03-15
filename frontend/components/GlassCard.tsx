import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export default function GlassCard({ children, className, elevated = false }: GlassCardProps) {
  return (
    <div className={cn(
      elevated ? 'glass-card-elevated' : 'glass-card',
      className
    )}>
      {children}
    </div>
  );
}
