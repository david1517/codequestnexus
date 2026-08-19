export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'epic';

export type ClassName =
  | 'Initiate'
  | 'Script Apprentice'
  | 'Code Warrior'
  | 'Algorithm Master'
  | 'Full Stack Legend'
  | 'Cyber Architect';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  className: ClassName;
  title: string;
  joinedAt: string;
}

export interface Planet {
  id: string;
  slug: string;
  name: string;
  planetName: string;
  description: string;
  language: string;
  icon: string;
  color: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  requiredLevel: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story';
  xpReward: number;
  progress: number;
  target: number;
  expiresAt?: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    level: number;
  };
  xp: number;
  streak: number;
}
