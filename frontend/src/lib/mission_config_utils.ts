// mission_config_utils.ts - Updated spacing for component nodes

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
    if (!config) return { nodes: [], edges: [] }

    shipName = config.ship_name
    
    // FIX: Handle double-nested configuration
    const actualConfig = config.configuration?.configuration || config.configuration
    
    console.log("Computing nodes in VIEW mode")
    console.log("Config found:", config.config_name)
    console.log("Actual config data:", actualConfig)
    
    SYSTEMS.forEach((sys) => {
      const systemData = actualConfig?.[sys]
      equipmentData[sys] = systemData?.selected_equipment || []
      console.log(`${sys} equipment:`, equipmentData[sys])
    })
  } else if ((mode === "create" || mode === "edit") && selectedShipId) {
    shipName = shipData[selectedShipId]?.ship_name || ""
    equipmentData = selectedEquipment
  }

  if (!shipName) return { nodes: [], edges: [] }

  // Create ship node
  nodeList.push({
    id: "ship",
    type: "ship",
    position: { x: 100, y: 300 },
    data: { label: shipName },
  })

  // System positions
  const systemPositions = [
    { x: 350, y: 100 },
    { x: 350, y: 250 },
    { x: 350, y: 400 },
    { x: 350, y: 550 },
  ]

  // ADJUSTED: Increased spacing between component nodes
  const COMPONENT_VERTICAL_SPACING = 320 // Changed from 80 to 120

  // Create system nodes and component nodes
  SYSTEMS.forEach((sys, idx) => {
    const equipment = equipmentData[sys] || []

    // Skip systems with no equipment
    if (equipment.length === 0) {
      console.log(`Skipping ${sys} - no equipment`)
      return
    }

    // System node
    const systemNodeId = `sys-${sys}`
    nodeList.push({
      id: systemNodeId,
      type: "system",
      position: systemPositions[idx],
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

    console.log(`Created system node: ${systemNodeId} with ${equipment.length} equipment`)

    // Component nodes with adjusted spacing
    equipment.forEach((comp: Component, compIdx: number) => {
      const baseX = 600
      // ADJUSTED: Use new spacing constant
      const baseY = systemPositions[idx].y - ((equipment.length - 1) * COMPONENT_VERTICAL_SPACING) / 2
      const compY = baseY + compIdx * COMPONENT_VERTICAL_SPACING

      // FIX: Normalize the component ID - try multiple possible field names
      const componentId = comp.component_id || comp.id || `${sys}-comp-${compIdx}`
      
      console.log(`Processing component:`, {
        sys,
        compIdx,
        componentId,
        comp
      })

      // Get K/N data
      let knData = null
      if (mode === "view" && selectedConfigId) {
        const config = configs.find((c) => c.id === selectedConfigId)
        // FIX: Handle double-nested configuration
        const actualConfig = config?.configuration?.configuration || config?.configuration
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

      console.log(`Created edge: ${edgeId}`, {
        source: systemNodeId,
        target: componentId
      })
    })
  })

  console.log("=== FINAL OUTPUT ===")
  console.log("Total nodes:", nodeList.length)
  console.log("Total edges:", edgeList.length)
  console.log("Nodes:", nodeList.map(n => ({ id: n.id, type: n.type })))
  console.log("Edges:", edgeList.map(e => ({ id: e.id, source: e.source, target: e.target })))

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