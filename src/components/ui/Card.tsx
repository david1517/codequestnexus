import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neon' | 'elevated';
  glow?: boolean;
  hoverable?: boolean;
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      glow = false,
      hoverable = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { y: -4, scale: 1.01 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'relative rounded-2xl overflow-hidden',
          variant === 'default' && 'bg-bg-card border border-white/5',
          variant === 'glass' && 'glass',
          variant === 'neon' &&
            'bg-bg-card border border-neon-blue/30 shadow-neon-blue',
          variant === 'elevated' &&
            'bg-bg-elevated border border-white/10 shadow-2xl',
          hoverable && 'cursor-pointer hover:border-neon-blue/50',
          glow && 'animate-pulse-glow',
          className
        )}
        {...(props as HTMLMotionProps<'div'>)}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';