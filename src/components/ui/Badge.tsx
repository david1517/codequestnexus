import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getRarityColor } from '@/lib/utils';
import type { Rarity } from '@/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  rarity?: Rarity;
  variant?: 'solid' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  children,
  rarity = 'common',
  variant = 'outline',
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  const color = getRarityColor(rarity);

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const variantStyles = {
    solid: 'text-white',
    outline: 'bg-transparent',
    glass: 'backdrop-blur-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-display font-semibold tracking-wider uppercase',
        'transition-all duration-200',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      style={
        {
          color: variant === 'solid' ? '#fff' : color,
          borderColor: color,
          backgroundColor:
            variant === 'solid' ? color : variant === 'glass' ? `${color}20` : 'transparent',
          borderWidth: '1.5px',
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </span>
  );
}
