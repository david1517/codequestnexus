import { create } from 'zustand';
import type { Mission, Achievement, LeaderboardEntry } from '@/types';
import { mockApi } from '@/lib/mockApi';

interface GameState {
  missions: Mission[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  fetchMissions: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  missions: [],
  achievements: [],
  leaderboard: [],

  fetchMissions: async () => {
    const missions = await mockApi.getMissions();
    set({ missions });
  },

  fetchAchievements: async () => {
    const achievements = await mockApi.getAchievements();
    set({ achievements });
  },

  fetchLeaderboard: async () => {
    const leaderboard = await mockApi.getLeaderboard();
    set({ leaderboard });
  },
}));
