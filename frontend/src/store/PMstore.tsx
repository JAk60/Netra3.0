// Zustand Store
import { create } from 'zustand';

interface Component {
  id: string;
  nomenclature: string;
  parentName: string;
}

interface PMStore {
  components: Component[];
  selectedComponent: Component | null;
  eta: number | null;
  beta: number | null;
  isLoading: boolean;
  setSelectedComponent: (component: Component | null) => void;
  setEtaBeta: (eta: number | null, beta: number | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const usePMStore = create((set) => ({
  components: [
    { id: '1', nomenclature: 'Pump Assembly A', parentName: 'System 1' },
    { id: '2', nomenclature: 'Valve Assembly B', parentName: 'System 1' },
    { id: '3', nomenclature: 'Motor Assembly C', parentName: 'System 2' },
    { id: '4', nomenclature: 'Bearing Assembly D', parentName: 'System 2' },
  ],
  selectedComponent: null,
  eta: null,
  beta: null,
  isLoading: false,
  setSelectedComponent: (component) => set({ selectedComponent: component }),
  setEtaBeta: (eta, beta) => set({ eta, beta }),
  setLoading: (isLoading) => set({ isLoading }),
}));