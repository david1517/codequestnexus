import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakFlameProps {
  days: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export function StreakFlame({ days, size = 'md', className }: StreakFlameProps) {
  const isOnFire = days >= 7;
  const isBlazing = days >= 30;
  const isMythic = days >= 100;

  const color = isMythic
    ? 'text-neon-pink'
    : isBlazing
      ? 'text-neon-purple'
      : isOnFire
        ? 'text-neon-gold'
        : 'text-orange-500';

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <motion.div
        animate={
          isOnFire
            ? { scale: [1, 1.15, 1], rotate: [-3, 3, -3] }
            : { scale: 1 }
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className={cn('relative', color)}
      >
        <Flame
          className={cn(sizeMap[size], 'fill-current', isOnFire && 'drop-shadow-[0_0_8px_currentColor]')}
        />
        {isMythic && (
          <motion.div
            className="absolute inset-0 blur-md"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Flame className={cn(sizeMap[size], 'fill-neon-pink text-neon-pink')} />
          </motion.div>
        )}
      </motion.div>
      <span
        className={cn(
          'font-display font-bold tabular-nums',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-xl',
          color
        )}
      >
        {days}
      </span>
    </div>
  );
}
