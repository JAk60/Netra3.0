// store/shipSystemHierarchyStore.ts

import { getShipSystemHierarchy, TransformedHierarchyData, Stats, SystemUI, ComponentUI } from '@/actions/system/get-ship-system-hierarchy';
import { he } from 'date-fns/locale';
import { create } from 'zustand';

interface ShipSystemHierarchyStore {
  data: TransformedHierarchyData | null;
  loading: boolean;
  error: string | null;
  currentShipId: string | null;
  
  // Computed getters
  stats: Stats | null;
  systems: SystemUI[];
  components: ComponentUI[];
  
  // Actions
  fetchHierarchy: (shipId: string) => Promise<void>;
  clear: () => void;
  
  // Utility methods
  getSystemById: (systemId: string) => SystemUI | undefined;
  getComponentById: (componentId: string) => ComponentUI | undefined;
  getComponentsBySystem: (systemType: string) => ComponentUI[];
  getComponentsByDepartment: (departmentId: string) => ComponentUI[];
}

export const useShipSystemHierarchyStore = create<ShipSystemHierarchyStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  currentShipId: null,
  
  // Computed getters
  get stats() {
    return get().data?.stats || null;
  },
  
  get systems() {
    return get().data?.systems || [];
  },
  
  get components() {
    return get().data?.components || [];
  },

  fetchHierarchy: async (shipId: string) => {
    // Avoid refetching if same ship
    if (get().currentShipId === shipId && get().data) {
      console.log('✅ Using cached hierarchy data for ship:', shipId);
      return;
    }

    set({ loading: true, error: null, currentShipId: shipId });
    
    try {
      console.log('🔄 Fetching hierarchy for ship:', shipId);
      const hierarchyData = await getShipSystemHierarchy(shipId);
      
      console.log('✅ Successfully loaded hierarchy:', {
        departments: hierarchyData.stats.totalDepartments,
        systems: hierarchyData.stats.totalSystems,
        equipment: hierarchyData.stats.totalEquipment,
        rawData: hierarchyData._data,
      });
      
      set({ 
        data: hierarchyData, 
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Error fetching hierarchy:', error);
      
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch hierarchy',
        loading: false,
        data: null
      });
    }
  },

  clear: () => {
    console.log('🧹 Clearing hierarchy store');
    set({ 
      data: null, 
      error: null, 
      currentShipId: null,
      loading: false
    });
  },
  
  // Utility method to get system by ID
  getSystemById: (systemId: string) => {
    return get().systems.find(system => system.id === systemId);
  },
  
  // Utility method to get component by ID
  getComponentById: (componentId: string) => {
    return get().components.find(component => component.id === componentId);
  },
  
  // Utility method to get components by system type
  getComponentsBySystem: (systemType: string) => {
    return get().components.filter(component => component.systemType === systemType);
  },
  
  // Utility method to get components by department
  getComponentsByDepartment: (departmentId: string) => {
    return get().components.filter(component => component.departmentId === departmentId);
  },
}));