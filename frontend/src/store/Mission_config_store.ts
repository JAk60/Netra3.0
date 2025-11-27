// store/Mission_config_store.ts
import { create } from 'zustand'

interface Phase {
  phase_number: number
  phase_name: string
}

interface KNConfig {
  phase_number: number
  k: number
}

interface Component {
  id: string
  component_id?: string
  name: string
  component_name?: string
  nomenclature: string
}

interface Configuration {
  id: string
  config_name: string
  ship_id: string
  ship_name: string
  configuration?: Record<string, any>
  created_date?: string
  modified_date?: string
  [key: string]: any
}

interface NavalConfigStore {
  configs: Configuration[]
  selectedConfigId: string | null
  mode: "view" | "create" | "edit"
  searchTerm: string
  currentStep: number
  selectedShipId: string
  phases: Phase[]
  selectedEquipment: Record<string, Component[]>
  knConfigs: Record<string, KNConfig[]> // FIXED: Array of KNConfigs per system
  workingConfig: Configuration | null

  // Actions
  setConfigs: (configs: Configuration[]) => void
  setSelectedConfigId: (id: string | null) => void
  setMode: (mode: "view" | "create" | "edit") => void
  setSearchTerm: (term: string) => void
  setCurrentStep: (step: number) => void
  setSelectedShipId: (id: string) => void
  setPhases: (phases: Phase[]) => void
  updateSystemEquipment: (systemType: string, equipment: Component[]) => void
  updateSystemKnConfigs: (systemType: string, configs: KNConfig[]) => void
  addConfig: (config: Configuration) => void
  updateConfig: (config: Configuration) => void
  deleteConfig: (id: string) => void
  startCreate: () => void
  startEdit: (config: Configuration) => void
  resetWizard: () => void
  restoreConfigurationState: (config: Configuration) => void
}

export const useNavalConfigStore = create<NavalConfigStore>((set, get) => ({
  configs: [],
  selectedConfigId: null,
  mode: "view",
  searchTerm: "",
  currentStep: 0,
  selectedShipId: "",
  phases: [],
  selectedEquipment: {},
  knConfigs: {},
  workingConfig: null,

  setConfigs: (configs) => set({ configs }),
  
  setSelectedConfigId: (id) => {
    set({ selectedConfigId: id })
  },
  
  setMode: (mode) => set({ mode }),
  
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setSelectedShipId: (id) => set({ selectedShipId: id }),
  
  setPhases: (phases) => {
    console.log("Setting phases:", phases)
    set({ phases })
  },
  
  // FIXED: Now accepts Component[] instead of string[]
  updateSystemEquipment: (systemType, equipment) => {
    console.log(`Updating equipment for ${systemType}:`, equipment)
    set((state) => ({
      selectedEquipment: {
        ...state.selectedEquipment,
        [systemType]: equipment,
      },
    }))
  },
  
  // FIXED: Now accepts KNConfig[] instead of nested object
  updateSystemKnConfigs: (systemType, configs) => {
    console.log(`Updating KN configs for ${systemType}:`, configs)
    set((state) => ({
      knConfigs: {
        ...state.knConfigs,
        [systemType]: configs,
      },
    }))
  },
  
  addConfig: (config) =>
    set((state) => ({
      configs: [...state.configs, config],
      selectedConfigId: config.id,
      mode: "view",
    })),
  
  updateConfig: (config) =>
    set((state) => ({
      configs: state.configs.map((c) => (c.id === config.id ? config : c)),
      selectedConfigId: config.id,
      mode: "view",
    })),
  
  deleteConfig: (id) =>
    set((state) => ({
      configs: state.configs.filter((c) => c.id !== id),
      selectedConfigId: state.selectedConfigId === id ? null : state.selectedConfigId,
    })),
  
  startCreate: () =>
    set({
      mode: "create",
      selectedConfigId: null,
      currentStep: 0,
      selectedShipId: "",
      phases: [],
      selectedEquipment: {},
      knConfigs: {},
      workingConfig: null,
    }),
  
  startEdit: (config) => {
    console.log("startEdit called with config:", config)
    
    // Base state update
    const newState: any = {
      mode: "edit",
      selectedConfigId: config.id,
      workingConfig: config,
      selectedShipId: config.ship_id,
      currentStep: 0,
    }

    // Restore configuration state if available
    if (config.configuration) {
      const restoration = extractConfigurationState(config.configuration)
      Object.assign(newState, restoration)

      console.log("Restored in startEdit:", restoration)
    }

    set(newState)
  },
  
  resetWizard: () =>
    set({
      mode: "view",
      selectedConfigId: null,
      currentStep: 0,
      selectedShipId: "",
      phases: [],
      selectedEquipment: {},
      knConfigs: {},
      workingConfig: null,
    }),

  restoreConfigurationState: (config) => {
    if (!config.configuration) {
      console.log("No configuration data to restore")
      return
    }

    const restoration = extractConfigurationState(config.configuration)
    
    console.log("Restoring configuration state:", {
      configName: config.config_name,
      ...restoration
    })

    set(restoration)
  },
}))

// Helper function to extract configuration state
function extractConfigurationState(savedConfig: Record<string, any>) {
  const updates: any = {}

  // Handle double-nested configuration (if config.configuration.configuration exists)
  const actualConfig = savedConfig.configuration || savedConfig

  // Restore phases (extract from first system that has them)
  let globalPhases: Phase[] = []
  
  const systemTypes = ['propulsion', 'power_generation', 'support', 'firing']
  
  systemTypes.forEach((systemType) => {
    const system = actualConfig[systemType]
    
    if (!globalPhases.length && system?.phases && Array.isArray(system.phases)) {
      globalPhases = system.phases.map((p: any) => ({
        phase_number: p.phase_number,
        phase_name: p.phase_name
      }))
    }
  })

  if (globalPhases.length > 0) {
    updates.phases = globalPhases
  }

  // Restore equipment and KN configs with CORRECT structure
  const restoredEquipment: Record<string, Component[]> = {}
  const restoredKnConfigs: Record<string, KNConfig[]> = {}

  systemTypes.forEach((systemType) => {
    const system = actualConfig[systemType]
    
    if (system && system.selected_equipment && Array.isArray(system.selected_equipment)) {
      // Restore equipment as Component objects
      restoredEquipment[systemType] = system.selected_equipment.map((eq: any) => ({
        id: eq.id || eq.component_id,
        component_id: eq.id || eq.component_id,
        name: eq.name || eq.component_name,
        component_name: eq.name || eq.component_name,
        nomenclature: eq.nomenclature
      }))
      
      // Restore KN configs as array per system (one per phase)
      if (system.phases && Array.isArray(system.phases)) {
        restoredKnConfigs[systemType] = system.phases.map((phase: any) => ({
          phase_number: phase.phase_number,
          k: phase.k
        }))
      }
    }
  })

  updates.selectedEquipment = restoredEquipment
  updates.knConfigs = restoredKnConfigs

  console.log("Extracted state:", updates)

  return updates
}