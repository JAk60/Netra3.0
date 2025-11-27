// ==================== CORE ENTITIES ====================

export interface Phase {
  phase_number: number
  phase_name: string
}

export interface PhaseWithKN extends Phase {
  k: number
  n: number
}

export interface Component {
  id:string
  name: string
  component_id: string
  component_name: string
  nomenclature: string
}

export interface System {
  system_id: string
  system_name: string
  components: Component[]
}

export interface Ship {
  ship_id: string
  ship_name: string
  systems: {
    propulsion: System
    power_generation: System
    support: System
    firing: System
  }
}

// ==================== CONFIGURATION ====================

export interface SystemConfiguration {
  system_id: string
  selected_equipment: Component[]
  phases: PhaseWithKN[]
}

export interface Config {
  id: string
  config_name: string
  ship_id: string
  ship_name: string
  created_date: string
  modified_date: string
  configuration: {
    propulsion: SystemConfiguration
    power_generation: SystemConfiguration
    support: SystemConfiguration
    firing: SystemConfiguration
  }
}

// ==================== UI STATE ====================

export type Mode = 'view' | 'create' | 'edit'

export type SystemType = 'propulsion' | 'power_generation' | 'support' | 'firing'

export interface KNConfig {
  phase_number: number
  k: number
}

// ==================== STORE STATE ====================

export interface NavalConfigState {
  // View state
  configs: Config[]
  selectedConfigId: string | null
  mode: Mode
  searchTerm: string

  // Wizard state
  currentStep: number
  selectedShipId: string
  phases: Phase[]
  selectedEquipment: Record<SystemType, Component[]>
  knConfigs: Record<SystemType, KNConfig[]>
  workingConfig: Config | null

  // Actions - View
  setConfigs: (configs: Config[]) => void
  addConfig: (config: Config) => void
  updateConfig: (config: Config) => void
  deleteConfig: (id: string) => void
  setSelectedConfigId: (id: string | null) => void
  setMode: (mode: Mode) => void
  setSearchTerm: (term: string) => void

  // Actions - Wizard
  setCurrentStep: (step: number) => void
  setSelectedShipId: (id: string) => void
  setPhases: (phases: Phase[]) => void
  setSelectedEquipment: (equipment: Record<SystemType, Component[]>) => void
  updateSystemEquipment: (system: SystemType, equipment: Component[]) => void
  setKnConfigs: (configs: Record<SystemType, KNConfig[]>) => void
  updateSystemKnConfigs: (system: SystemType, configs: KNConfig[]) => void
  setWorkingConfig: (config: Config | null) => void

  // Actions - Reset
  resetWizard: () => void
  startCreate: () => void
  startEdit: (config: Config) => void
}

// ==================== REACT FLOW NODES ====================

export interface ShipNodeData {
  label: string
}

export interface SystemNodeData {
  label: string
  count: number
  systemKey: SystemType
}

export interface ComponentNodeData {
  nomenclature: string
  type: string
  selected: boolean
  kn: { k: number; n: number } | null
}

// ==================== FORM DATA ====================

export interface ShipSelectionFormData {
  ship_id: string
}

export interface PhaseConfigFormData {
  phase_count: number
  phases: Phase[]
}

export interface EquipmentSelectionData {
  system: SystemType
  selected_components: string[] // component_ids
  kn_configs: KNConfig[]
}

// ==================== UTILITY TYPES ====================

export interface SystemLabel {
  label: string
  icon: any // Lucide icon component
}

export interface NodesAndEdges {
  nodes: any[] // ReactFlow Node type
  edges: any[] // ReactFlow Edge type
}