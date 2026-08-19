import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function calculateLevelFromXP(xp: number): number {
  let level = 1;
  let totalXP = 0;
  while (totalXP + calculateXPForLevel(level) <= xp) {
    totalXP += calculateXPForLevel(level);
    level++;
  }
  return level;
}

export function getProgressToNextLevel(xp: number): {
  currentLevel: number;
  nextLevelXP: number;
  currentLevelXP: number;
  progressPercent: number;
} {
  const currentLevel = calculateLevelFromXP(xp);
  let totalXP = 0;
  for (let i = 1; i < currentLevel; i++) {
    totalXP += calculateXPForLevel(i);
  }
  const currentLevelXP = xp - totalXP;
  const nextLevelXP = calculateXPForLevel(currentLevel);
  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progressPercent: (currentLevelXP / nextLevelXP) * 100,
  };
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#FFD700',
    mythic: '#FF0080',
  };
  return colors[rarity] || colors.common;
}

export function getRarityGlow(rarity: string): string {
  const glows: Record<string, string> = {
    common: 'shadow-[0_0_10px_rgba(156,163,175,0.3)]',
    rare: 'shadow-neon-blue',
    epic: 'shadow-neon-purple',
    legendary: 'shadow-neon-gold',
    mythic: 'shadow-neon-pink',
  };
  return glows[rarity] || '';
}
