import { motion } from 'framer-motion';
import { getProgressToNextLevel } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Zap } from 'lucide-react';

interface XPBarProps {
  xp: number;
  showDetails?: boolean;
}

export function XPBar({ xp, showDetails = true }: XPBarProps) {
  const { currentLevel, currentLevelXP, nextLevelXP, progressPercent } =
    getProgressToNextLevel(xp);

  return (
    <div className="w-full">
      {showDetails && (
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="h-4 w-4 fill-neon-gold text-neon-gold" />
            </motion.div>
            <span className="text-xs font-display font-semibold text-gray-300">
              NÍVEL {currentLevel}
            </span>
          </div>
          <span className="font-mono text-xs text-neon-blue">
            {currentLevelXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </span>
        </div>
      )}
      <ProgressBar
        value={progressPercent}
        color="blue"
        size="md"
        glow
      />
    </div>
  );
}
