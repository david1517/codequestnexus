import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NeonGlowProps {
  children: ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'gold' | 'pink';
  intensity?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap = {
  blue: 'shadow-neon-blue',
  purple: 'shadow-neon-purple',
  green: 'shadow-neon-green',
  gold: 'shadow-neon-gold',
  pink: 'shadow-neon-pink',
};

const intensityMap = {
  sm: 'shadow-[0_0_10px_currentColor]',
  md: 'shadow-[0_0_20px_currentColor,0_0_40px_currentColor]',
  lg: 'shadow-[0_0_30px_currentColor,0_0_60px_currentColor,0_0_90px_currentColor]',
};

export function NeonGlow({
  children,
  color = 'blue',
  intensity = 'md',
  className,
}: NeonGlowProps) {
  return (
    <div
      className={cn(
        'transition-all duration-300',
        colorMap[color],
        intensityMap[intensity],
        className
      )}
      style={{ color: `var(--neon-${color})` }}
    >
      {children}
    </div>
  );
}
