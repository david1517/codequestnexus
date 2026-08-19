import type { User, Mission, Achievement, LeaderboardEntry } from '@/types';
import { PLANETS } from '@/constants/planets';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USER: User = {
  id: 'usr_001',
  username: 'CyberCoder',
  email: 'coder@nexus.io',
  avatarUrl: '',
  level: 12,
  xp: 4250,
  currentStreak: 14,
  longestStreak: 28,
  className: 'Code Warrior',
  title: 'Bug Hunter',
  joinedAt: '2026-01-15T10:00:00Z',
};

const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Maratona Diária',
    description: 'Complete 3 lições hoje',
    type: 'daily',
    xpReward: 50,
    progress: 2,
    target: 3,
    completed: false,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm2',
    title: 'Caçador de Bugs',
    description: 'Resolva 5 exercícios de código',
    type: 'daily',
    xpReward: 75,
    progress: 5,
    target: 5,
    completed: true,
  },
  {
    id: 'm3',
    title: 'Explorador Galáctico',
    description: 'Visite 2 planetas diferentes',
    type: 'daily',
    xpReward: 40,
    progress: 1,
    target: 2,
    completed: false,
  },
  {
    id: 'm4',
    title: 'Mestre da Semana',
    description: 'Acumule 1000 XP esta semana',
    type: 'weekly',
    xpReward: 200,
    progress: 650,
    target: 1000,
    completed: false,
  },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    name: 'First Steps',
    description: 'Complete sua primeira lição',
    icon: '🌟',
    rarity: 'common',
    xpReward: 50,
    unlocked: true,
    unlockedAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'a2',
    name: 'On Fire',
    description: 'Mantenha um streak de 7 dias',
    icon: '🔥',
    rarity: 'rare',
    xpReward: 150,
    unlocked: true,
    unlockedAt: '2026-01-22T20:00:00Z',
  },
  {
    id: 'a3',
    name: 'Big Brain',
    description: 'Acerte 10 exercícios seguidos',
    icon: '🧠',
    rarity: 'epic',
    xpReward: 300,
    unlocked: true,
  },
  {
    id: 'a4',
    name: 'Planet Hopper',
    description: 'Complete 3 planetas',
    icon: '🚀',
    rarity: 'rare',
    xpReward: 200,
    unlocked: false,
  },
  {
    id: 'a5',
    name: 'Code Master',
    description: 'Alcance o nível 50',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 1000,
    unlocked: false,
  },
  {
    id: 'a6',
    name: 'Mythic Coder',
    description: 'Abra 1 loot box mítica',
    icon: '💎',
    rarity: 'mythic',
    xpReward: 2500,
    unlocked: false,
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      id: 'u1',
      username: 'NeoAnderson',
      avatarUrl: '',
      level: 48,
    },
    xp: 125_430,
    streak: 124,
  },
  {
    rank: 2,
    user: {
      id: 'u2',
      username: 'ZeroCool',
      avatarUrl: '',
      level: 45,
    },
    xp: 112_200,
    streak: 89,
  },
  {
    rank: 3,
    user: {
      id: 'u3',
      username: 'GhostInShell',
      avatarUrl: '',
      level: 42,
    },
    xp: 98_750,
    streak: 67,
  },
  {
    rank: 4,
    user: {
      id: 'u4',
      username: 'CyberCoder',
      avatarUrl: '',
      level: 12,
    },
    xp: 4_250,
    streak: 14,
  },
  {
    rank: 5,
    user: {
      id: 'u5',
      username: 'TronLegacy',
      avatarUrl: '',
      level: 38,
    },
    xp: 82_100,
    streak: 45,
  },
];

export const mockApi = {
  async login(_email: string, _password: string): Promise<{ user: User; token: string }> {
    await delay(800);
    return { user: MOCK_USER, token: 'mock_jwt_token_xyz' };
  },

  async register(_data: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    await delay(800);
    return { user: MOCK_USER, token: 'mock_jwt_token_xyz' };
  },

  async loginWithGoogle(): Promise<{ user: User; token: string }> {
    await delay(800);
    return { user: MOCK_USER, token: 'mock_jwt_token_xyz' };
  },

  async getMe(): Promise<User> {
    await delay(300);
    return MOCK_USER;
  },

  async getPlanets() {
    await delay(300);
    return PLANETS;
  },

  async getMissions(): Promise<Mission[]> {
    await delay(300);
    return MOCK_MISSIONS;
  },

  async getAchievements(): Promise<Achievement[]> {
    await delay(300);
    return MOCK_ACHIEVEMENTS;
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay(300);
    return MOCK_LEADERBOARD;
  },
};
