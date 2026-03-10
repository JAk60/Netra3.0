import { getFailureModesAnalysis, getSensorStatsByComponent, type Sensor, type SensorStats } from '@/actions/sensors/metadata';
import { create } from 'zustand';

interface SensorsStore {
  sensors: Sensor[] | null;
  failureModes: any[] | null;
  stats: SensorStats | null;   // ← add this
  loading: boolean;
  error: string | null;
  currentEquipmentId: string | null;
  fetchSensors: (equipmentId: string) => Promise<void>;
  clear: () => void;
}

export const useSensorStore = create<SensorsStore>((set, get) => ({
  sensors: null,
  failureModes: null,
  stats: null,   // ← add this
  loading: false,
  error: null,
  currentEquipmentId: null,

  fetchSensors: async (equipmentId: string) => {
    if (get().currentEquipmentId === equipmentId && get().sensors) return;

    set({ loading: true, error: null, currentEquipmentId: equipmentId });

    try {
      const [{ sensors, failureModes }, stats] = await Promise.all([
        getFailureModesAnalysis(equipmentId),
        getSensorStatsByComponent(equipmentId),   // ← parallel fetch
      ]);

      set({ sensors, failureModes, stats, loading: false });

    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sensors',
        loading: false,
      });
    }
  },

  clear: () => set({ sensors: null, failureModes: null, stats: null, error: null, currentEquipmentId: null }),
}));