import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, label, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-gray-300 font-display tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500',
              'transition-all duration-200',
              'focus:outline-none focus:border-neon-blue focus:shadow-neon-blue focus:bg-white/10',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.5)]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
