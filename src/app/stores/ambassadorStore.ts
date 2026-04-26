import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AMBASSADORS, BADGE_DEFINITIONS } from '../data/mockData';
import { calculateTier, updateStreak, getNewlyUnlockedBadges } from '../lib/gamification';

export interface Ambassador {
  id: string;
  name: string;
  email: string;
  college: string;
  year: number;
  points: number;
  streak: number;
  badgeCount: number;
  tasksCompleted: number;
  status: 'Active' | 'Inactive' | 'Flagged';
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  joinDate: string;
  lastActiveDate: string;
  badges: string[];
  referralCode: string;
  flagReason?: string;
}

export interface PointsHistory {
  id: string;
  ambassadorId: string;
  points: number;
  taskName: string;
  type: 'earned' | 'deducted' | 'bonus';
  date: string;
}

interface AmbassadorState {
  ambassadors: Ambassador[];
  pointsHistory: PointsHistory[];
  getAmbassadorById: (id: string) => Ambassador | undefined;
  updateAmbassador: (id: string, data: Partial<Ambassador>) => void;
  addPoints: (ambassadorId: string, points: number, taskName: string, type?: 'earned' | 'bonus') => string[];
  updateStreakForAmbassador: (ambassadorId: string) => void;
  flagAmbassador: (id: string, reason: string) => void;
  removeAmbassador: (id: string) => void;
  addAmbassador: (data: Partial<Ambassador> & Omit<Ambassador, 'id'>) => void;
}

export const useAmbassadorStore = create<AmbassadorState>()(
  persist(
    (set, get) => ({
      ambassadors: AMBASSADORS,
      pointsHistory: [],

      getAmbassadorById: (id: string) => {
        return get().ambassadors.find((amb) => amb.id === id);
      },

      updateAmbassador: (id: string, data: Partial<Ambassador>) => {
        set((state) => ({
          ambassadors: state.ambassadors.map((amb) =>
            amb.id === id ? { ...amb, ...data } : amb
          ),
        }));
      },

      addPoints: (ambassadorId: string, points: number, taskName: string, type: 'earned' | 'bonus' = 'earned') => {
        const state = get();
        const ambassador = state.getAmbassadorById(ambassadorId);
        if (!ambassador) return [];

        const newPoints = ambassador.points + points;
        const oldTier = ambassador.tier;
        const newTier = calculateTier(newPoints);

        const historyEntry: PointsHistory = {
          id: `hist_${Date.now()}_${ambassadorId}`,
          ambassadorId,
          points,
          taskName,
          type,
          date: new Date().toISOString(),
        };

        set((state) => ({
          pointsHistory: [...state.pointsHistory, historyEntry],
        }));

        state.updateAmbassador(ambassadorId, {
          points: newPoints,
          tier: newTier,
        });

        const updatedAmbassador = state.getAmbassadorById(ambassadorId);
        if (!updatedAmbassador) return [];

        const stats = {
          points: newPoints,
          tasksCompleted: updatedAmbassador.tasksCompleted,
          streak: updatedAmbassador.streak,
          referralTasksCompleted: 0,
          contentTasksCompleted: 0,
          eventTasksCompleted: 0,
          socialTasksCompleted: 0,
          earlySubmissions: 0,
          perfectWeeks: 0,
        };

        const newBadges = getNewlyUnlockedBadges(
          updatedAmbassador.badges,
          BADGE_DEFINITIONS,
          stats
        );

        if (newBadges.length > 0) {
          state.updateAmbassador(ambassadorId, {
            badges: [...updatedAmbassador.badges, ...newBadges],
            badgeCount: updatedAmbassador.badgeCount + newBadges.length,
          });
        }

        const effects: string[] = [];
        if (newBadges.length > 0) {
          effects.push(...newBadges.map((badge) => `badge:${badge}`));
        }
        if (oldTier !== newTier) {
          effects.push(`tier:${newTier}`);
        }

        return effects;
      },

      updateStreakForAmbassador: (ambassadorId: string) => {
        const state = get();
        const ambassador = state.getAmbassadorById(ambassadorId);
        if (!ambassador) return;

        const newStreak = updateStreak(
          ambassador.streak,
          ambassador.lastActiveDate,
          new Date()
        );

        state.updateAmbassador(ambassadorId, {
          streak: newStreak,
          lastActiveDate: new Date().toISOString(),
        });

        const updatedAmbassador = state.getAmbassadorById(ambassadorId);
        if (!updatedAmbassador) return;

        const stats = {
          points: updatedAmbassador.points,
          tasksCompleted: updatedAmbassador.tasksCompleted,
          streak: newStreak,
          referralTasksCompleted: 0,
          contentTasksCompleted: 0,
          eventTasksCompleted: 0,
          socialTasksCompleted: 0,
          earlySubmissions: 0,
          perfectWeeks: 0,
        };

        const newBadges = getNewlyUnlockedBadges(
          updatedAmbassador.badges,
          BADGE_DEFINITIONS,
          stats
        );

        if (newBadges.length > 0) {
          state.updateAmbassador(ambassadorId, {
            badges: [...updatedAmbassador.badges, ...newBadges],
            badgeCount: updatedAmbassador.badgeCount + newBadges.length,
          });
        }
      },

      flagAmbassador: (id: string, reason: string) => {
        set((state) => ({
          ambassadors: state.ambassadors.map((amb) =>
            amb.id === id ? { ...amb, status: 'Flagged' as const, flagReason: reason } : amb
          ),
        }));
      },

      removeAmbassador: (id: string) => {
        set((state) => ({
          ambassadors: state.ambassadors.filter((amb) => amb.id !== id),
        }));
      },

      addAmbassador: (data: Partial<Ambassador> & Omit<Ambassador, 'id'>) => {
        const newAmbassador: Ambassador = {
          ...data,
          id: data.id || `amb_${Date.now()}`,
        };
        set((state) => ({
          ambassadors: [...state.ambassadors, newAmbassador],
        }));
      },
    }),
    {
      name: 'ambassador-storage',
    }
  )
);
