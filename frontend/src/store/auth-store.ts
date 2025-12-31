// frontend/src/store/auth-store.ts
import { create } from 'zustand'
import { User } from '@/types/auth'
import { logoutAction } from '@/actions/auth/auth'

interface AuthState {
  user: User | null
  hasInitialized: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  setInitialized: (initialized: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => Promise<void>
  reset: () => void
}

interface AuthComputedGetters {
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperuser: boolean
  isRegularUser: boolean
}

type AuthStore = AuthState & AuthActions & AuthComputedGetters

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  hasInitialized: false,
  isLoading: false,
  error: null,

  // Computed getters (stable references)
  get isAuthenticated() {
    return get().user !== null
  },
  
  get isAdmin() {
    const role = get().user?.role
    return role === 'admin' || role === 'superuser'
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
    set({ isLoading: true })
    
    try {
      await logoutAction()
    } catch (error: any) {
      // NEXT_REDIRECT is expected, not an error
      if (!error?.message?.includes('NEXT_REDIRECT')) {
        console.error('Logout error:', error)
      }
    } finally {
      // Always clear state
      set({ 
        user: null, 
        error: null,
        isLoading: false,
      })
    }
  },

  reset: () => set({ 
    user: null, 
    hasInitialized: false, 
    isLoading: false, 
    error: null 
  }),
}))