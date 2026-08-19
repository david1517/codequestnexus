import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export function Label({ children, className, required, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-gray-300 font-display tracking-wide mb-2',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-neon-pink ml-1">*</span>}
    </label>
  );
}
