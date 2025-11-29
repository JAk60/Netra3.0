// store/Mission_config_store.ts - Improved with better restoration
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
  knConfigs: Record<string, KNConfig[]>
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

  setConfigs: (configs) => {
    console.log("setConfigs called with", configs.length, "configs")
    set({ configs })
  },
  
  setSelectedConfigId: (id) => {
    console.log("setSelectedConfigId:", id)
    set({ selectedConfigId: id })
  },
  
  setMode: (mode) => {
    console.log("setMode:", mode)
    set({ mode })
  },
  
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setSelectedShipId: (id) => {
    console.log("setSelectedShipId:", id)
    set({ selectedShipId: id })
  },
  
  setPhases: (phases) => {
    console.log("setPhases:", phases.length, "phases")
    set({ phases })
  },
  
  updateSystemEquipment: (systemType, equipment) => {
    console.log(`updateSystemEquipment for ${systemType}:`, equipment.length, "items")
    console.log("Equipment items:", equipment.map(e => e.nomenclature))
    
    set((state) => {
      const newEquipment = {
        ...state.selectedEquipment,
        [systemType]: equipment,
      }
      console.log("New selectedEquipment state:", 
        Object.keys(newEquipment).map(k => `${k}: ${newEquipment[k].length}`)
      )
      return { selectedEquipment: newEquipment }
    })
  },
  
  updateSystemKnConfigs: (systemType, configs) => {
    console.log(`updateSystemKnConfigs for ${systemType}:`, configs)
    
    set((state) => ({
      knConfigs: {
        ...state.knConfigs,
        [systemType]: configs,
      },
    }))
  },
  
  addConfig: (config) => {
    console.log("addConfig:", config.config_name)
    set((state) => ({
      configs: [...state.configs, config],
      selectedConfigId: config.id,
      mode: "view",
    }))
  },
  
  updateConfig: (config) => {
    console.log("updateConfig:", config.config_name)
    set((state) => ({
      configs: state.configs.map((c) => (c.id === config.id ? config : c)),
      selectedConfigId: config.id,
      mode: "view",
    }))
  },
  
  deleteConfig: (id) => {
    console.log("deleteConfig:", id)
    set((state) => ({
      configs: state.configs.filter((c) => c.id !== id),
      selectedConfigId: state.selectedConfigId === id ? null : state.selectedConfigId,
    }))
  },
  
  startCreate: () => {
    console.log("startCreate - resetting wizard state")
    set({
      mode: "create",
      selectedConfigId: null,
      currentStep: 0,
      selectedShipId: "",
      phases: [],
      selectedEquipment: {},
      knConfigs: {},
      workingConfig: null,
    })
  },
  
  startEdit: (config) => {
    console.log("startEdit:", config.config_name)
    
    // Unwrap nested configuration
    let actualConfig = config.configuration
    while (actualConfig && actualConfig.configuration && typeof actualConfig.configuration === 'object') {
      actualConfig = actualConfig.configuration
    }

    // Extract restoration data
    const restoration = extractConfigurationState(actualConfig)

    console.log("startEdit restoration:", restoration)

    set({
      mode: "edit",
      selectedConfigId: config.id,
      workingConfig: config,
      selectedShipId: config.ship_id,
      currentStep: 0,
      ...restoration,
    })
  },
  
  resetWizard: () => {
    console.log("resetWizard - clearing all wizard state")
    set({
      mode: "view",
      selectedConfigId: null,
      currentStep: 0,
      selectedShipId: "",
      phases: [],
      selectedEquipment: {},
      knConfigs: {},
      workingConfig: null,
    })
  },
}))

// Helper function to extract configuration state from saved config
function extractConfigurationState(actualConfig: Record<string, any>) {
  const updates: any = {}

  console.log("extractConfigurationState input:", Object.keys(actualConfig || {}))

  // Restore phases
  let globalPhases: Phase[] = []
  const systemTypes = ['propulsion', 'power_generation', 'support', 'firing']
  
  for (const systemType of systemTypes) {
    const system = actualConfig?.[systemType]
    if (system?.phases && Array.isArray(system.phases) && system.phases.length > 0) {
      globalPhases = system.phases.map((p: any) => ({
        phase_number: p.phase_number,
        phase_name: p.phase_name
      }))
      break
    }
  }

  if (globalPhases.length > 0) {
    updates.phases = globalPhases
    console.log("Extracted phases:", globalPhases)
  }

  // Restore equipment and KN configs
  const restoredEquipment: Record<string, Component[]> = {}
  const restoredKnConfigs: Record<string, KNConfig[]> = {}

  systemTypes.forEach((systemType) => {
    const system = actualConfig?.[systemType]
    
    if (system?.selected_equipment && Array.isArray(system.selected_equipment)) {
      restoredEquipment[systemType] = system.selected_equipment.map((eq: any) => ({
        id: eq.id || eq.component_id,
        component_id: eq.id || eq.component_id,
        name: eq.name || eq.component_name,
        component_name: eq.name || eq.component_name,
        nomenclature: eq.nomenclature
      }))
      
      console.log(`Extracted ${systemType} equipment:`, restoredEquipment[systemType].length, "items")
    }
    
    if (system?.phases && Array.isArray(system.phases)) {
      restoredKnConfigs[systemType] = system.phases.map((phase: any) => ({
        phase_number: phase.phase_number,
        k: phase.k
      }))
    }
  })

  updates.selectedEquipment = restoredEquipment
  updates.knConfigs = restoredKnConfigs

  console.log("extractConfigurationState output:", {
    phases: updates.phases?.length || 0,
    equipment: Object.keys(restoredEquipment).map(k => `${k}: ${restoredEquipment[k].length}`),
    knConfigs: Object.keys(restoredKnConfigs).length
  })

  return updates
}