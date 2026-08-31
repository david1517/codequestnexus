import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedGradientProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
}

export function AnimatedGradient({
  children,
  className,
  colors = ['#00D4FF', '#8B5CF6', '#FF0080'],
}: AnimatedGradientProps) {
  return (
    <div
      className={cn('relative animate-gradient', className)}
      style={{
        backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
        backgroundSize: '200% 200%',
      }}
    >
      {children}
    </div>
  );
}
