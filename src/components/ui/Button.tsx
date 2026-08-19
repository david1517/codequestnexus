import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'>> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-neon-blue hover:shadow-neon-purple',
  secondary:
    'bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:border-neon-blue/50',
  ghost: 'text-white hover:bg-white/5',
  danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]',
  gold: 'bg-gradient-to-r from-neon-gold to-yellow-500 text-black shadow-neon-gold',
  outline: 'border-2 border-neon-blue text-neon-blue hover:bg-neon-blue/10 hover:shadow-neon-blue',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
  xl: 'h-16 px-10 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      glow = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-lg font-display font-semibold tracking-wide',
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-blue/50',
          'disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          glow && 'animate-pulse-glow',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className="relative z-10">{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
        {!disabled && !isLoading && variant === 'primary' && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
