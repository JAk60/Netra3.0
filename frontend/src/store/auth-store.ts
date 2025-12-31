// frontend/src/store/auth-store.ts
import { create } from 'zustand'
import { User } from '@/types/auth'
import { logoutAction } from '@/actions/auth/auth'

interface AuthStore {
  user: User | null
  hasInitialized: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setInitialized: (initialized: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => Promise<void>
  reset: () => void
}

// Computed getters
interface AuthComputedState {
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperuser: boolean
  isRegularUser: boolean
}

export const useAuthStore = create<AuthStore & AuthComputedState>((set, get) => ({
  // State
  user: null,
  hasInitialized: false,
  isLoading: false,
  error: null,

  // Computed properties
  get isAuthenticated() {
    return get().user !== null
  },
  
  get isAdmin() {
    const user = get().user
    return user?.role === 'admin' || user?.role === 'superuser'
  },
  
  get isSuperuser() {
    return get().user?.role === 'superuser'
  },
  
  get isRegularUser() {
    return get().user?.role === 'user'
  },

  // Actions
  setUser: (user) => set({ user, error: null }),
  
  setInitialized: (initialized) => set({ hasInitialized: initialized }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),

  logout: async () => {
    try {
      await logoutAction()
      set({ user: null, error: null })
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if API call fails
      set({ user: null, error: null })
    }
  },

  reset: () => set({ 
    user: null, 
    hasInitialized: false, 
    isLoading: false, 
    error: null 
  }),
}))