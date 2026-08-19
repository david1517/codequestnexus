import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  color?: 'blue' | 'purple' | 'green' | 'gold' | 'pink';
  className?: string;
}

const colorMap = {
  blue: { text: 'text-neon-blue', glow: 'shadow-neon-blue', bg: 'from-neon-blue/10' },
  purple: { text: 'text-neon-purple', glow: 'shadow-neon-purple', bg: 'from-neon-purple/10' },
  green: { text: 'text-neon-green', glow: 'shadow-neon-green', bg: 'from-neon-green/10' },
  gold: { text: 'text-neon-gold', glow: 'shadow-neon-gold', bg: 'from-neon-gold/10' },
  pink: { text: 'text-neon-pink', glow: 'shadow-neon-pink', bg: 'from-neon-pink/10' },
};

export function StatCard({ icon, label, value, trend, color = 'blue', className }: StatCardProps) {
  const c = colorMap[color];

  return (
    <Card className={cn('group p-5', className)} hoverable>
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br to-transparent opacity-0',
          'group-hover:opacity-100 transition-opacity duration-500',
          c.bg
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-display font-semibold uppercase tracking-widest text-gray-400">
            {label}
          </p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className={cn('mt-2 font-display text-3xl font-black', c.text)}
          >
            {value}
          </motion.p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-mono',
                trend.positive ? 'text-neon-green' : 'text-red-400'
              )}
            >
              {trend.positive ? '▲' : '▼'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            'bg-white/5 border border-white/10',
            c.text
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
