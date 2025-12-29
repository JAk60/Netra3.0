// lib/store/auth-store.ts
'use client';

import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean; // ✅ Added this
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false, // ✅ Added this

  setUser: (user) => set({ 
    user, 
    isLoading: false,
    isAuthenticated: !!user // ✅ Set to true if user exists
  }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearUser: () => set({ 
    user: null, 
    isLoading: false,
    isAuthenticated: false // ✅ Clear authentication
  }),

  logout: () =>
    set({
      user: null,
      isLoading: false,
      isAuthenticated: false, // ✅ Clear on logout
    }),
}));