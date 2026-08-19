import { Badge } from '@/components/ui/Badge';
import { Shield } from 'lucide-react';
import type { Rarity } from '@/types';

interface RarityBadgeProps {
  rarity: Rarity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const rarityLabels: Record<Rarity, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
  mythic: 'Mítico',
};

export function RarityBadge({ rarity, size = 'md', showIcon = true }: RarityBadgeProps) {
  return (
    <Badge rarity={rarity} variant="solid" size={size}>
      {showIcon && <Shield className="h-3 w-3" />}
      {rarityLabels[rarity]}
    </Badge>
  );
}
