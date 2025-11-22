// store/failureModesStore.ts
import { create } from 'zustand';
import { getFailureModesAnalysis, type TransformedAnalysisData } from '@/actions/sensors/metadata';

interface FailureModesStore {
  data: TransformedAnalysisData | null;
  loading: boolean;
  error: string | null;
  currentEquipmentId: string | null;
  fetchAnalysis: (equipmentId: string) => Promise<void>;
  clear: () => void;
}

export const useFailureModesStore = create<FailureModesStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  currentEquipmentId: null,

  fetchAnalysis: async (equipmentId: string) => {
    // Avoid refetching if same equipment
    if (get().currentEquipmentId === equipmentId && get().data) {
      return;
    }

    set({ loading: true, error: null, currentEquipmentId: equipmentId });
    try {
      const data = await getFailureModesAnalysis(equipmentId);
      set({ data, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch analysis',
        loading: false 
      });
    }
  },

  clear: () => set({ data: null, error: null, currentEquipmentId: null }),
}));