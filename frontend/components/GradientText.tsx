import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  from?: string;
  to?: string;
}

export default function GradientText({ 
  children, 
  className,
  from = 'from-indigo-500',
  to = 'to-sky-400' 
}: GradientTextProps) {
  return (
    <span className={cn(
      'bg-clip-text text-transparent bg-gradient-to-r',
      from,
      to,
      className
    )}>
      {children}
    </span>
  );
}
