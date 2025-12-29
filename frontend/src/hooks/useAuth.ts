// lib/hooks/useAuth.ts
'use client';


import { getCurrentUser } from '@/actions/auth/auth';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

export function useAuth() {
  const { user, isLoading, setUser, setLoading, clearUser } = useAuthStore();

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const result = await getCurrentUser();
      
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        clearUser();
      }
    }

    loadUser();
  }, [setUser, setLoading, clearUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}