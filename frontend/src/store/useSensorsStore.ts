// store/failureModesStore.ts

import { create } from 'zustand';
import { getFailureModesAnalysis, type Sensor } from '@/actions/sensors/metadata';

interface SensorsStore {
  sensors: Sensor[] | null;
  failureModes: any[] | null; 
  loading: boolean;
  error: string | null;
  currentEquipmentId: string | null;
  fetchSensors: (equipmentId: string) => Promise<void>;
  clear: () => void;
}

export const useSensorStore = create<SensorsStore>((set, get) => ({

  sensors: null,
  failureModes: null,
  loading: false,
  error: null,
  currentEquipmentId: null,

  fetchSensors: async (equipmentId: string) => {

    // Avoid refetching same component
    if (get().currentEquipmentId === equipmentId && get().sensors) {
      return;
    }

    set({
      loading: true,
      error: null,
      currentEquipmentId: equipmentId
    });

    try {
      const { sensors, failureModes } = await getFailureModesAnalysis(equipmentId);

      set({
        sensors,
        failureModes,
        loading: false
      });

    } catch (error) {

      set({
        error: error instanceof Error
          ? error.message
          : 'Failed to fetch sensors',
        loading: false
      });

    }
  },

  clear: () => set({
    sensors: null,
    error: null,
    currentEquipmentId: null
  }),

}));