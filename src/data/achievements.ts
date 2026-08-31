export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  criteria: {
    type: 'lessons_completed' | 'xp_earned' | 'courses_completed' | 'streak' | 'level' | 'downloads';
    target: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    name: 'First Steps',
    description: 'Complete sua primeira licao',
    icon: '🌟',
    rarity: 'common',
    xpReward: 50,
    unlocked: false,
    criteria: { type: 'lessons_completed', target: 1 },
  },
  {
    id: 'a2',
    name: 'On Fire',
    description: 'Mantenha um streak de 7 dias',
    icon: '🔥',
    rarity: 'rare',
    xpReward: 150,
    unlocked: false,
    criteria: { type: 'streak', target: 7 },
  },
  {
    id: 'a3',
    name: 'Big Brain',
    description: 'Acerte 10 exercicios seguidos',
    icon: '🧠',
    rarity: 'epic',
    xpReward: 300,
    unlocked: false,
    criteria: { type: 'lessons_completed', target: 10 },
  },
  {
    id: 'a4',
    name: 'Planet Hopper',
    description: 'Complete 3 planetas',
    icon: '🚀',
    rarity: 'rare',
    xpReward: 200,
    unlocked: false,
    criteria: { type: 'courses_completed', target: 3 },
  },
  {
    id: 'a5',
    name: 'Code Master',
    description: 'Alcanse o nivel 50',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 1000,
    unlocked: false,
    criteria: { type: 'level', target: 50 },
  },
  {
    id: 'a6',
    name: 'Mythic Coder',
    description: 'Abra 1 loot box mitica',
    icon: '💎',
    rarity: 'mythic',
    xpReward: 2500,
    unlocked: false,
    criteria: { type: 'xp_earned', target: 100000 },
  },
  {
    id: 'a7',
    name: 'Scholar',
    description: 'Baixe 10 licoes para offline',
    icon: '📚',
    rarity: 'rare',
    xpReward: 200,
    unlocked: false,
    criteria: { type: 'downloads', target: 10 },
  },
  {
    id: 'a8',
    name: 'XP Hunter',
    description: 'Acumule 5000 XP',
    icon: '⚡',
    rarity: 'epic',
    xpReward: 500,
    unlocked: false,
    criteria: { type: 'xp_earned', target: 5000 },
  },
  {
    id: 'a9',
    name: 'Lenda',
    description: 'Complete todos os planetas',
    icon: '🌌',
    rarity: 'legendary',
    xpReward: 5000,
    unlocked: false,
    criteria: { type: 'courses_completed', target: 10 },
  },
  {
    id: 'a10',
    name: 'Iniciante',
    description: 'Crie sua conta',
    icon: '👋',
    rarity: 'common',
    xpReward: 20,
    unlocked: false,
    criteria: { type: 'lessons_completed', target: 0 },
  },
];
