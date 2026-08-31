import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'blue' | 'purple' | 'green' | 'gold' | 'pink';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const colorMap = {
  blue: { from: '#00D4FF', to: '#0EA5E9', glow: 'shadow-neon-blue' },
  purple: { from: '#8B5CF6', to: '#A78BFA', glow: 'shadow-neon-purple' },
  green: { from: '#00FF88', to: '#10B981', glow: 'shadow-neon-green' },
  gold: { from: '#FFD700', to: '#F59E0B', glow: 'shadow-neon-gold' },
  pink: { from: '#FF0080', to: '#EC4899', glow: 'shadow-neon-pink' },
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  className,
  color = 'blue',
  showLabel = false,
  size = 'md',
  glow = true,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = colorMap[color];

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs font-display text-gray-400">
          <span>{Math.round(value)}</span>
          <span>{max}</span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-white/5 border border-white/10',
          sizeMap[size]
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            glow && colors.glow
          )}
          style={{
            backgroundImage: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
          }}
        />
      </div>
    </div>
  );
}
