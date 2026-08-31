import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HologramFrameProps {
  children: ReactNode;
  className?: string;
}

export function HologramFrame({ children, className }: HologramFrameProps) {
  return (
    <div className={cn('relative rounded-2xl overflow-hidden', className)}>
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            'conic-gradient(from 0deg, #00D4FF, #8B5CF6, #FF0080, #00FF88, #00D4FF)',
          padding: '1.5px',
          animation: 'spin 8s linear infinite',
        }}
      >
        <div className="h-full w-full rounded-2xl bg-bg-card" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Scanlines */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl">
        <div
          className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-neon-blue/10 to-transparent"
          style={{ animation: 'scanline 4s linear infinite' }}
        />
      </div>

      {/* Corner accents */}
      <div className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-neon-blue" />
      <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-neon-blue" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-neon-blue" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-neon-blue" />
    </div>
  );
}
