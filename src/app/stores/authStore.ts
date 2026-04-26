import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ADMIN_ACCOUNT, AMBASSADORS, DEMO_AMBASSADOR_ACCOUNT } from '../data/mockData';

export type UserRole = 'organization' | 'ambassador';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: any) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, password: string) => {
        if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
          set({
            user: {
              id: ADMIN_ACCOUNT.id,
              email: ADMIN_ACCOUNT.email,
              role: ADMIN_ACCOUNT.role,
              organizationId: ADMIN_ACCOUNT.organizationId,
            },
            isAuthenticated: true,
          });
          return true;
        }

        if (email === DEMO_AMBASSADOR_ACCOUNT.email && password === DEMO_AMBASSADOR_ACCOUNT.password) {
          set({
            user: {
              id: DEMO_AMBASSADOR_ACCOUNT.id,
              email: DEMO_AMBASSADOR_ACCOUNT.email,
              role: DEMO_AMBASSADOR_ACCOUNT.role,
            },
            isAuthenticated: true,
          });
          return true;
        }

        const ambassador = AMBASSADORS.find((amb) => amb.email === email);
        if (ambassador) {
          set({
            user: {
              id: ambassador.id,
              email: ambassador.email,
              role: 'ambassador',
            },
            isAuthenticated: true,
          });
          return true;
        }

        return false;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      register: (data: any) => {
        const newUser: User = {
          id: data.id || `usr_${Date.now()}`,
          email: data.email,
          role: data.role,
          organizationId: data.role === 'organization' ? `org_${Date.now()}` : undefined,
        };

        set({
          user: newUser,
          isAuthenticated: true,
        });

        return true;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
