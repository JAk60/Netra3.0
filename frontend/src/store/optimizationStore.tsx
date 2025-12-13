import { create } from 'zustand';
import { OptimizationResult } from '@/actions/optimize';

interface OptimizationStore {
  results: OptimizationResult | null;
  isOptimizing: boolean;
  error: string | null;
  
  setResults: (results: OptimizationResult | null) => void;
  setOptimizing: (isOptimizing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useOptimizationStore = create<OptimizationStore>((set) => ({
  results: null,
  isOptimizing: false,
  error: null,
  
  setResults: (results) => set({ results, error: null }),
  setOptimizing: (isOptimizing) => set({ isOptimizing }),
  setError: (error) => set({ error, isOptimizing: false }),
  reset: () => set({ results: null, isOptimizing: false, error: null }),
}));