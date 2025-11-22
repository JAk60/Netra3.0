// store/componentHierarchyStore.ts
import {ComponentHierarchy,  getComponentHierarchy } from '@/actions/equipment_hierarchy';
import { create } from 'zustand';


interface ComponentHierarchyStore {
  data: ComponentHierarchy | null;
  loading: boolean;
  error: string | null;
  currentComponentId: string | null;
  fetchHierarchy: (componentId: string) => Promise<void>;
  clear: () => void;
}

export const useComponentHierarchyStore = create<ComponentHierarchyStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  currentComponentId: null,

  fetchHierarchy: async (componentId: string) => {
    // Avoid refetching if same component
    if (get().currentComponentId === componentId && get().data) {
      return;
    }

    set({ loading: true, error: null, currentComponentId: componentId });
    try {
      const response = await getComponentHierarchy(componentId);
      
      if (!response.success) {
        set({ 
          error: response.error || 'Failed to fetch hierarchy',
          loading: false,
          data: null
        });
        return;
      }

      set({ data: response.data || null, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch hierarchy',
        loading: false,
        data: null
      });
    }
  },

  clear: () => set({ data: null, error: null, currentComponentId: null }),
}));