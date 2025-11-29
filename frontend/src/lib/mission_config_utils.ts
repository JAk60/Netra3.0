// mission_config_utils.ts - Fixed spacing and restoration

import { type Node, type Edge, ConnectionLineType, MarkerType } from "@xyflow/react"
import type { SystemType, Component, KNConfig, Config, SystemConfiguration, Mode } from "../types/mission_config"
import { Zap, Settings, Target } from "lucide-react"

// ==================== SYSTEM LABELS ====================

export const SYSTEMS: SystemType[] = ["propulsion", "power_generation", "support", "firing"]

export const SYSTEM_LABELS = {
  propulsion: { label: "Propulsion", icon: Zap },
  power_generation: { label: "Power", icon: Zap },
  support: { label: "Support", icon: Settings },
  firing: { label: "Firing", icon: Target },
}

// ==================== NODES & EDGES COMPUTATION ====================

interface ComputeNodesParams {
  mode: Mode
  selectedConfigId: string | null
  configs: Config[]
  selectedShipId: string
  selectedEquipment: Record<SystemType, Component[]>
  knConfigs: Record<SystemType, KNConfig[]>
  shipData: any
}

export function computeNodesAndEdges(params: ComputeNodesParams): { nodes: Node[]; edges: Edge[] } {
  const { mode, selectedConfigId, configs, selectedShipId, selectedEquipment, knConfigs, shipData } = params

  console.log("=== COMPUTE NODES START ===")
  console.log("Mode:", mode)
  console.log("Selected Config ID:", selectedConfigId)
  console.log("Selected Ship ID:", selectedShipId)

  const nodeList: Node[] = []
  const edgeList: Edge[] = []

  let shipName = ""
  let equipmentData: Record<SystemType, Component[]> = {
    propulsion: [],
    power_generation: [],
    support: [],
    firing: [],
  }

  // Determine ship name and equipment based on mode
  if (mode === "view" && selectedConfigId) {
    const config = configs.find((c) => c.id === selectedConfigId)
    if (!config) {
      console.log("Config not found for ID:", selectedConfigId)
      return { nodes: [], edges: [] }
    }

    shipName = config.ship_name
    
    // Handle nested configuration properly
    let actualConfig = config.configuration
    
    // Keep unwrapping until we reach the actual system data
    while (actualConfig && actualConfig.configuration && typeof actualConfig.configuration === 'object') {
      console.log("Unwrapping nested configuration")
      actualConfig = actualConfig.configuration
    }
    
    console.log("Final actualConfig structure:", Object.keys(actualConfig || {}))
    
    SYSTEMS.forEach((sys) => {
      const systemData = actualConfig?.[sys]
      if (systemData && systemData.selected_equipment) {
        equipmentData[sys] = systemData.selected_equipment
        console.log(`${sys} equipment (${systemData.selected_equipment.length} items):`, 
          systemData.selected_equipment.map((e: any) => e.nomenclature))
      } else {
        console.log(`${sys} has no equipment data`)
      }
    })
  } else if ((mode === "create" || mode === "edit") && selectedShipId) {
    shipName = shipData[selectedShipId]?.ship_name || ""
    equipmentData = selectedEquipment
    console.log("Using wizard equipment data:", Object.keys(selectedEquipment).map(k => `${k}: ${selectedEquipment[k as SystemType].length}`))
  }

  if (!shipName) {
    console.log("No ship name found, returning empty")
    return { nodes: [], edges: [] }
  }

  // Calculate total equipment across all systems
  const totalEquipment = SYSTEMS.reduce((sum, sys) => sum + (equipmentData[sys]?.length || 0), 0)
  console.log("Total equipment to display:", totalEquipment)

  if (totalEquipment === 0) {
    console.log("No equipment to display")
    return { nodes: [], edges: [] }
  }

  // DYNAMIC SPACING CALCULATION
  const systemsWithEquipment = SYSTEMS.filter(sys => (equipmentData[sys]?.length || 0) > 0)
  
  // Component vertical spacing: fixed 150px to prevent overlap
  const componentSpacing = 150
  
  // Calculate total canvas height needed
  const totalCanvasHeight = systemsWithEquipment.reduce((sum, sys) => {
    const equipmentCount = equipmentData[sys]?.length || 0
    return sum + (equipmentCount * componentSpacing) + 200
  }, 0)

  console.log("Spacing calculations:", {
    systemsWithEquipment: systemsWithEquipment.length,
    componentSpacing,
    totalCanvasHeight
  })

  // Position ship node in the vertical center of all content
  const shipY = Math.max(300, totalCanvasHeight / 2)
  
  // Create ship node
  nodeList.push({
    id: "ship",
    type: "ship",
    position: { x: 100, y: shipY },
    data: { label: shipName },
  })

  // Create system nodes and component nodes
  let systemIndex = 0
  let cumulativeY = 200 // Start position for first system
  
  SYSTEMS.forEach((sys) => {
    const equipment = equipmentData[sys] || []

    // Skip systems with no equipment
    if (equipment.length === 0) {
      console.log(`Skipping ${sys} - no equipment`)
      return
    }

    // Calculate system position - each system gets its own vertical section
    const systemEquipmentCount = equipment.length
    const systemHeight = systemEquipmentCount * componentSpacing
    
    // Position system in the middle of its vertical section
    const systemY = cumulativeY + (systemHeight / 2)
    
    console.log(`System ${sys} positioning:`, {
      index: systemIndex,
      equipmentCount: systemEquipmentCount,
      systemHeight,
      systemY,
      cumulativeY
    })

    // System node
    const systemNodeId = `sys-${sys}`
    nodeList.push({
      id: systemNodeId,
      type: "system",
      position: { x: 350, y: systemY },
      data: {
        label: SYSTEM_LABELS[sys].label,
        count: equipment.length,
        systemKey: sys,
      },
    })

    // Edge from ship to system
    edgeList.push({
      id: `edge-ship-to-${sys}`,
      source: "ship",
      target: systemNodeId,
      type: ConnectionLineType.Bezier,
      animated: false,
      style: { stroke: "#404040", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#404040" },
    })

    console.log(`Created system node: ${systemNodeId} with ${equipment.length} equipment at y=${systemY}`)

    // Component nodes - positioned relative to cumulativeY
    equipment.forEach((comp: Component, compIdx: number) => {
      const baseX = 650
      const compY = cumulativeY + (compIdx * componentSpacing) + 50 // 50px offset from top
      
      console.log(`  Component ${compIdx + 1}/${equipment.length}: ${comp.nomenclature} at y=${compY}`)

      // Normalize the component ID
      const componentId = comp.component_id || comp.id || `${sys}-comp-${compIdx}`

      // Get K/N data
      let knData = null
      if (mode === "view" && selectedConfigId) {
        const config = configs.find((c) => c.id === selectedConfigId)
        let actualConfig = config?.configuration
        
        // Unwrap nested configuration
        while (actualConfig && actualConfig.configuration && typeof actualConfig.configuration === 'object') {
          actualConfig = actualConfig.configuration
        }
        
        const phase = actualConfig?.[sys]?.phases?.[0]
        knData = phase ? { k: phase.k, n: phase.n } : null
      } else if (mode === "create" || mode === "edit") {
        const knList = knConfigs[sys] || []
        const firstPhaseKn = knList[0]
        knData = firstPhaseKn ? { k: firstPhaseKn.k, n: equipment.length } : null
      }

      // Component node
      nodeList.push({
        id: componentId,
        type: "component",
        position: { x: baseX, y: compY },
        data: {
          nomenclature: comp.nomenclature,
          type: comp.component_name || comp.name,
          selected: true,
          kn: knData,
        },
      })

      // Edge from system to component
      const edgeId = `edge-${systemNodeId}-to-${componentId}`
      edgeList.push({
        id: edgeId,
        source: systemNodeId,
        target: componentId,
        type: ConnectionLineType.Bezier,
        animated: false,
        style: { stroke: "#404040", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#404040" },
      })
    })
    
    // Move cumulative Y position for next system
    // Add system height + spacing buffer
    cumulativeY += systemHeight + 200
    systemIndex++
  })

  console.log("=== FINAL OUTPUT ===")
  console.log("Total nodes:", nodeList.length)
  console.log("Total edges:", edgeList.length)
  console.log("Nodes summary:", nodeList.map(n => ({ id: n.id, type: n.type, y: n.position.y })))

  return { nodes: nodeList, edges: edgeList }
}

// ==================== CONFIG GENERATION ====================

export function generateConfigFromWizard(
  configName: string,
  shipId: string,
  shipName: string,
  phases: { phase_number: number; phase_name: string }[],
  selectedEquipment: Record<SystemType, Component[]>,
  knConfigs: Record<SystemType, KNConfig[]>,
  shipData: any,
  existingConfig?: Config
): Config {
  const configuration: Record<SystemType, SystemConfiguration> = {} as any

  SYSTEMS.forEach((sys) => {
    const equipment = selectedEquipment[sys] || []
    const knList = knConfigs[sys] || []

    configuration[sys] = {
      system_id: shipData[shipId].systems[sys].system_id,
      selected_equipment: equipment,
      phases: phases.map((p) => {
        const kn = knList.find((k) => k.phase_number === p.phase_number)
        return {
          phase_number: p.phase_number,
          phase_name: p.phase_name,
          k: kn?.k || 0,
          n: equipment.length,
        }
      }),
    }
  })

  return {
    id: existingConfig?.id || Date.now().toString(),
    config_name: configName,
    ship_id: shipId,
    ship_name: shipName,
    created_date: existingConfig?.created_date || new Date().toISOString(),
    modified_date: new Date().toISOString(),
    configuration,
  }
}

// ==================== LOGGING ====================

export function logConfigToConsole(config: Config, action: "created" | "updated" | "deleted") {
  console.group(`🚢 Configuration ${action.toUpperCase()}: ${config.config_name}`)
  console.log("📋 Full Config Object:", config)
  console.log("🆔 Config ID:", config.id)
  console.log("⛴️  Ship:", config.ship_name)
  console.log("📅 Created:", new Date(config.created_date).toLocaleString())
  console.log("📅 Modified:", new Date(config.modified_date).toLocaleString())
  console.log("⚙️  Configuration JSON:", JSON.stringify(config.configuration, null, 2))
  console.groupEnd()
}

// ==================== SEARCH & FILTER ====================

export function filterConfigs(configs: Config[], searchTerm: string): Config[] {
  const term = searchTerm.toLowerCase().trim()
  if (!term) return configs

  return configs.filter(
    (c) => c.config_name.toLowerCase().includes(term) || c.ship_name.toLowerCase().includes(term)
  )
}