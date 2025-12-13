// store/shipSystemHierarchyStore.ts
import { fetchShipSystemsHierarchyWithMetadata, getComponentMetadata } from "@/actions/equipment_hierarchy";
import { 
  getShipSystemHierarchy,
  getComponentChildren,
  TransformedHierarchyData,
  Stats,
  SystemUI,
  ComponentUI,
} from "@/actions/system/get-ship-system-hierarchy";

import { create } from "zustand";

interface SystemMetadata {
  alpha: number | null;
  beta: number | null;
  eta: number | null;
  eta_beta: number | null;
  priority: number | null;
  current_age: number | null;
}

// Add interface for full ship data structure
interface FullShipData {
  ship_id: string;
  ship_name: string;
  ship_category: string;
  ship_class: string;
  systems: Array<{
    system_id: string;
    system_type: string;
    total_components: number;
    root_components_count: number;
    created_date: string;
    components: Array<{
      component_id: string;
      component_name: string;
      nomenclature: string;
      is_root_component: boolean;
      parent_name: string | null;
      child_count: number;
      metadata: SystemMetadata | null;
      children: any[];
    }>;
  }>;
}

interface ShipSystemHierarchyStore {
  // Hierarchy state (basic)
  data: TransformedHierarchyData | null;
  loading: boolean;
  error: string | null;
  currentShipId: string | null;

  // Metadata state (separate from basic hierarchy)
  metadataCache: Map<string, SystemMetadata>;
  metadataLoading: boolean;
  metadataError: string | null;
  metadataShipId: string | null;
  fullShipData: FullShipData | null; // ADD THIS

  // Derived getters (computed but NOT using get accessor)
  stats: () => Stats | null;
  systems: () => SystemUI[];
  components: () => ComponentUI[];

  // Actions
  fetchHierarchy: (shipId: string) => Promise<void>;
  clear: () => void;

  // Metadata actions
  fetchHierarchyWithMetadata: (shipId: string) => Promise<void>;
  fetchComponentMetadata: (shipId: string, componentId: string) => Promise<SystemMetadata | null>;
  getMetadataFromCache: (componentId: string) => SystemMetadata | null;
  clearMetadataCache: () => void;

  // Utilities
  getSystemById: (id: string) => SystemUI | undefined;
  getComponentById: (id: string) => ComponentUI | undefined;
  getComponentsBySystem: (systemType: string) => ComponentUI[];
  getComponentsByDepartment: (departmentId: string) => ComponentUI[];

  // Children fetcher
  fetchComponentChildren: (componentId: string, shipId: string) => Promise<any>;
}

export const useShipSystemHierarchyStore = create<ShipSystemHierarchyStore>((set, get) => ({
  // ---- HIERARCHY STATE ----
  data: null,
  loading: false,
  error: null,
  currentShipId: null,

  // ---- METADATA STATE (SEPARATE) ----
  metadataCache: new Map(),
  metadataLoading: false,
  metadataError: null,
  metadataShipId: null,
  fullShipData: null, // ADD THIS

  // ---- COMPUTED SELECTORS ----
  stats: () => get().data?.stats ?? null,
  systems: () => get().data?.systems ?? [],
  components: () => get().data?.components ?? [],

  // ---- BASIC HIERARCHY ACTION ----
  fetchHierarchy: async (shipId: string) => {
    if (get().currentShipId === shipId && get().data) {
      console.log("✔ Using cached hierarchy:", shipId);
      return;
    }

    set({ loading: true, error: null, currentShipId: shipId });

    try {
      console.log("🔄 Fetching hierarchy:", shipId);

      const hierarchyData = await getShipSystemHierarchy(shipId);

      set({
        data: hierarchyData,
        loading: false,
        error: null,
      });

      console.log("✔ Hierarchy loaded:", {
        departments: hierarchyData.stats.totalDepartments,
        systems: hierarchyData.stats.totalSystems,
        equipment: hierarchyData.stats.totalEquipment,
      });
    } catch (err: any) {
      console.error("❌ Failed to load hierarchy:", err);

      set({
        data: null,
        loading: false,
        error: err?.message ?? "Failed to fetch hierarchy",
      });
    }
  },

  clear: () => {
    console.log("🧹 Clearing hierarchy store");
    set({
      data: null,
      error: null,
      currentShipId: null,
      loading: false,
      metadataCache: new Map(),
      metadataError: null,
      metadataShipId: null,
      fullShipData: null, // ADD THIS
    });
  },

  // ---- METADATA ACTION (SEPARATE PURPOSE) ----
  fetchHierarchyWithMetadata: async (shipId: string) => {
    // Check if metadata already loaded for this ship
    if (get().metadataShipId === shipId && get().fullShipData) {
      console.log("✔ Using cached metadata for ship:", shipId);
      return;
    }

    set({ metadataLoading: true, metadataError: null, metadataShipId: shipId });

    try {
      console.log("🔄 Fetching hierarchy with metadata:", shipId);

      const { data, error } = await fetchShipSystemsHierarchyWithMetadata({ shipId });

      if (error || !data) {
        throw new Error(error || "Failed to fetch hierarchy with metadata");
      }

      console.log("📦 Received full ship data:", data);

      // Build metadata cache from response
      const newCache = new Map<string, SystemMetadata>();
      data.systems.forEach((system: { components: any[]; }) => {
        system.components.forEach(component => {
          if (component.metadata) {
            newCache.set(component.component_id, component.metadata);
          }
        });
      });

      set({
        metadataCache: newCache,
        fullShipData: data, // SAVE THE FULL DATA
        metadataLoading: false,
        metadataError: null,
      });

      console.log("✔ Metadata loaded for", newCache.size, "components");
      console.log("✔ Full ship data saved:", {
        ship: data.ship_name,
        systems: data.systems.length,
        totalComponents: data.systems.reduce((acc: number, sys: { components: string | any[]; }) => acc + sys.components.length, 0)
      });
    } catch (err: any) {
      console.error("❌ Failed to load metadata:", err);

      set({
        metadataLoading: false,
        metadataError: err?.message ?? "Failed to fetch metadata",
        metadataShipId: null,
        fullShipData: null,
      });
    }
  },

  fetchComponentMetadata: async (shipId: string, componentId: string) => {
    // Check cache first
    const cached = get().metadataCache.get(componentId);
    if (cached) {
      console.log("✔ Using cached metadata for:", componentId);
      return cached;
    }

    set({ metadataLoading: true, metadataError: null });

    try {
      console.log("🔄 Fetching metadata for component:", componentId);

      const { data, error } = await getComponentMetadata({ shipId, componentId });

      if (error || !data) {
        throw new Error(error || "Failed to fetch component metadata");
      }

      // Update cache
      const newCache = new Map(get().metadataCache);
      newCache.set(componentId, data);

      set({
        metadataCache: newCache,
        metadataLoading: false,
        metadataError: null,
      });

      console.log("✔ Metadata fetched for:", componentId);
      
      return data;
    } catch (err: any) {
      console.error("❌ Failed to load component metadata:", err);

      set({
        metadataLoading: false,
        metadataError: err?.message ?? "Failed to fetch component metadata",
      });

      return null;
    }
  },

  getMetadataFromCache: (componentId: string) => {
    return get().metadataCache.get(componentId) || null;
  },

  clearMetadataCache: () => {
    console.log("🧹 Clearing metadata cache");
    set({ 
      metadataCache: new Map(),
      metadataError: null,
      metadataShipId: null,
      fullShipData: null,
    });
  },

  // ---- UTILITIES ----
  getSystemById: (id: string) => {
    return get().systems().find(sys => sys.id === id);
  },

  getComponentById: (id: string) => {
    return get().components().find(c => c.id === id);
  },

  getComponentsBySystem: (systemType: string) => {
    return get().components().filter(c => c.systemType === systemType);
  },

  getComponentsByDepartment: (departmentId: string) => {
    return get().components().filter(c => c.departmentId === departmentId);
  },

  // ---- CHILD FETCHER ----
  fetchComponentChildren: async (componentId: string, shipId: string) => {
    try {
      console.log(`🔍 Fetching children for component: ${componentId}, ship: ${shipId}`);
      const hierarchy = await getComponentChildren(componentId, shipId);
      console.log(`✅ Children fetched successfully:`, hierarchy);
      return hierarchy;
    } catch (err) {
      console.error("❌ Error loading child components:", err);
      throw err;
    }
  },
}));