import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LevelDisplayProps {
  level: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'h-10 w-10 text-base',
  md: 'h-14 w-14 text-xl',
  lg: 'h-20 w-20 text-3xl',
  xl: 'h-28 w-28 text-4xl',
};

export function LevelDisplay({ level, size = 'md', className }: LevelDisplayProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 5 }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full',
        'bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink',
        'shadow-neon-blue font-display font-black text-white',
        sizeMap[size],
        className
      )}
    >
      <div className="absolute inset-0.5 rounded-full bg-bg-primary" />
      <div className="relative flex flex-col items-center justify-center">
        <span className="text-[0.5em] font-normal text-gray-400 leading-none">LVL</span>
        <span className="leading-none">{level}</span>
      </div>
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple opacity-50 blur-md -z-10" />
    </motion.div>
  );
}
