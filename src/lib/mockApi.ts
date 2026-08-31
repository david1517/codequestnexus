import type {
  User,
  Planet,
  Mission,
  Achievement,
  LeaderboardEntry,
} from '@/types';

const MOCK_USER: User = {
  id: 'demo-user-001',
  username: 'DemoCoder',
  email: 'demo@nexus.io',
  avatarUrl: '',
  role: 'student',
  level: 3,
  xp: 1250,
  currentStreak: 5,
  longestStreak: 12,
  className: 'Code Warrior',
  title: 'Guerreiro do Código',
  joinedAt: new Date().toISOString(),
};

const MOCK_PLANETS: Planet[] = [
  {
    id: 'javascript',
    slug: 'javascript',
    name: 'JavaScript',
    planetName: 'Planeta JavaScript',
    description:
      'Aprenda os fundamentos da linguagem JavaScript.',
    language: 'JavaScript',
    icon: '⚡',
    color: '#F7DF1E',
    progress: 35,
    totalLessons: 10,
    completedLessons: 3,
    requiredLevel: 1,
  },
  {
    id: 'typescript',
    slug: 'typescript',
    name: 'TypeScript',
    planetName: 'Planeta TypeScript',
    description:
      'Aprenda TypeScript e escreva código mais seguro.',
    language: 'TypeScript',
    icon: '🔷',
    color: '#3178C6',
    progress: 0,
    totalLessons: 10,
    completedLessons: 0,
    requiredLevel: 2,
  },
  {
    id: 'react',
    slug: 'react',
    name: 'React',
    planetName: 'Planeta React',
    description:
      'Aprenda a criar interfaces modernas com React.',
    language: 'React',
    icon: '⚛️',
    color: '#61DAFB',
    progress: 0,
    totalLessons: 10,
    completedLessons: 0,
    requiredLevel: 3,
  },
];

const MOCK_MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    title: 'Primeiro código',
    description: 'Complete sua primeira aula.',
    type: 'daily',
    xpReward: 100,
    progress: 0,
    target: 1,
    completed: false,
  },
  {
    id: 'mission-2',
    title: 'Explorador',
    description: 'Complete 3 aulas.',
    type: 'weekly',
    xpReward: 250,
    progress: 1,
    target: 3,
    completed: false,
  },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'achievement-1',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira aula.',
    icon: '🚀',
    rarity: 'common',
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'achievement-2',
    name: 'Guerreiro do Código',
    description: 'Alcance o nível 3.',
    icon: '⚔️',
    rarity: 'rare',
    xpReward: 250,
    unlocked: true,
    unlockedAt: new Date().toISOString(),
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      id: 'player-001',
      username: 'CodeMaster',
      avatarUrl: '',
      level: 12,
    },
    xp: 9850,
    streak: 32,
  },
  {
    rank: 2,
    user: {
      id: 'player-002',
      username: 'JavaScriptHero',
      avatarUrl: '',
      level: 10,
    },
    xp: 8240,
    streak: 21,
  },
  {
    rank: 3,
    user: {
      id: MOCK_USER.id,
      username: MOCK_USER.username,
      avatarUrl: MOCK_USER.avatarUrl,
      level: MOCK_USER.level,
    },
    xp: MOCK_USER.xp,
    streak: MOCK_USER.currentStreak,
  },
  {
    rank: 4,
    user: {
      id: 'player-004',
      username: 'ReactNinja',
      avatarUrl: '',
      level: 2,
    },
    xp: 950,
    streak: 4,
  },
];

export const mockApi = {
  getUser: async (): Promise<User> => {
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    return MOCK_USER;
  },

  getPlanets: async (): Promise<Planet[]> => {
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    return MOCK_PLANETS;
  },

  getMissions: async (): Promise<Mission[]> => {
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    return MOCK_MISSIONS;
  },

  getAchievements: async (): Promise<Achievement[]> => {
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    return MOCK_ACHIEVEMENTS;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    return MOCK_LEADERBOARD;
  },
};

export const getUser = mockApi.getUser;
export const getPlanets = mockApi.getPlanets;
export const getMissions = mockApi.getMissions;
export const getAchievements = mockApi.getAchievements;
export const getLeaderboard = mockApi.getLeaderboard;