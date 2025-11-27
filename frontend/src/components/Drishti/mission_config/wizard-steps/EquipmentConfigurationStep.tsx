"use client"

import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Check, Save, Loader2, AlertCircle } from "lucide-react"
import type { SystemType, Component, Phase, KNConfig } from "@/types/mission_config"
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/mission_config_utils"

interface EquipmentConfigurationStepProps {
  selectedShipId: string
  phases: Phase[]
  selectedEquipment: Record<SystemType, Component[]>
  knConfigs: Record<SystemType, KNConfig[]>
  equipmentBySystem: Record<string, any[]>
  loading?: boolean
  onEquipmentChange: (system: SystemType, equipment: Component[]) => void
  onKnConfigChange: (system: SystemType, configs: KNConfig[]) => void
  onSave: () => void
  onBack: () => void
}

export function EquipmentConfigurationStep({
  selectedShipId,
  phases,
  selectedEquipment,
  knConfigs,
  equipmentBySystem,
  loading = false,
  onEquipmentChange,
  onKnConfigChange,
  onSave,
  onBack,
}: EquipmentConfigurationStepProps) {
  const hasAnyEquipment = Object.values(selectedEquipment).some((arr) => arr.length > 0)

  // Debug logging
  console.log("EquipmentConfigurationStep render:", {
    selectedShipId,
    equipmentBySystemKeys: Object.keys(equipmentBySystem),
    equipmentCounts: Object.entries(equipmentBySystem).reduce((acc, [key, val]) => {
      acc[key] = val?.length || 0
      return acc
    }, {} as Record<string, number>),
    selectedEquipmentCounts: Object.entries(selectedEquipment).reduce((acc, [key, val]) => {
      acc[key] = val?.length || 0
      return acc
    }, {} as Record<string, number>),
  })

  const toggleComponent = (system: SystemType, component: any) => {
    console.log("Toggling component:", { system, component })
    
    const current = selectedEquipment[system] || []
    
    // Check if already selected using multiple possible ID fields
    const componentId = component.id || component.component_id
    const isSelected = current.some((c) => 
      (c.id === componentId) || 
      (c.component_id === componentId) ||
      (c.id === component.id) ||
      (c.component_id === component.component_id)
    )

    if (isSelected) {
      // Remove component
      onEquipmentChange(
        system,
        current.filter((c) => 
          c.id !== componentId && 
          c.component_id !== componentId &&
          c.id !== component.id &&
          c.component_id !== component.component_id
        )
      )
    } else {
      // Add component - normalize the structure
      const transformedComponent: Component = {
        id: component.id || component.component_id,
        component_id: component.id || component.component_id, // Ensure both exist
        name: component.name || component.component_name,
        component_name: component.name || component.component_name, // Ensure both exist
        nomenclature: component.nomenclature,
      }
      
      console.log("Adding transformed component:", transformedComponent)
      onEquipmentChange(system, [...current, transformedComponent])
    }
  }

  const updateKnValue = (system: SystemType, phaseNumber: number, k: number) => {
    const current = Array.isArray(knConfigs[system]) ? knConfigs[system] : []
    const existing = current.find((kn) => kn.phase_number === phaseNumber)

    if (existing) {
      onKnConfigChange(
        system,
        current.map((kn) => (kn.phase_number === phaseNumber ? { ...kn, k } : kn))
      )
    } else {
      onKnConfigChange(system, [...current, { phase_number: phaseNumber, k }])
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <p className="text-xs text-gray-400">Loading equipment...</p>
      </div>
    )
  }

  if (!selectedShipId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2">
        <AlertCircle className="w-8 h-8 text-yellow-500" />
        <p className="text-xs text-gray-500">Please select a ship first</p>
      </div>
    )
  }

  // Check if equipment data is loaded
  const totalEquipment = Object.values(equipmentBySystem).reduce(
    (sum, arr) => sum + (arr?.length || 0), 
    0
  )

  if (totalEquipment === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3 text-center px-4">
        <AlertCircle className="w-8 h-8 text-yellow-500" />
        <div>
          <p className="text-xs text-gray-400 mb-1">No equipment data available</p>
          <p className="text-[10px] text-gray-500">
            Equipment is still loading or no equipment exists for this ship
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-[10px] text-gray-500 mb-2">
        Configure equipment and K/N values ({totalEquipment} items available)
      </div>

      {SYSTEMS.map((sys) => {
        const sysEquipment = equipmentBySystem[sys] || []
        const systemEquipment = selectedEquipment[sys] || []
        const systemKnConfigs = Array.isArray(knConfigs[sys]) ? knConfigs[sys] : []

        console.log(`Rendering system ${sys}:`, {
          available: sysEquipment.length,
          selected: systemEquipment.length,
          knConfigs: systemKnConfigs,
          knConfigsType: typeof knConfigs[sys],
        })

        return (
          <div key={sys} className="mb-4 pb-4 border-b border-gray-800 last:border-0">
            <div className="text-xs font-medium mb-2 text-gray-300 capitalize flex items-center gap-2">
              {SYSTEM_LABELS[sys].label}
              <span className="text-[10px] text-gray-500">
                ({systemEquipment.length} / {sysEquipment.length} selected)
              </span>
            </div>

            {/* Equipment Selection */}
            <div className="space-y-1 mb-3">
              {sysEquipment.length === 0 ? (
                <div className="p-3 text-center text-[10px] text-gray-500 bg-[#2a2a2a] rounded border border-gray-700">
                  No equipment available for this system
                </div>
              ) : (
                sysEquipment.map((comp: any) => {
                  // Normalize component ID for comparison
                  const componentId = comp.id || comp.component_id
                  const isSelected = systemEquipment.some((e) => 
                    (e.id === componentId) || 
                    (e.component_id === componentId) ||
                    (e.id === comp.id) ||
                    (e.component_id === comp.component_id)
                  )

                  return (
                    <button
                      key={componentId}
                      type="button"
                      onClick={() => toggleComponent(sys, comp)}
                      className={`w-full p-2 rounded border text-left text-xs transition-all ${
                        isSelected
                          ? "border-green-600 bg-green-900/20"
                          : "border-gray-700 bg-[#2a2a2a] hover:border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-200 font-medium truncate">
                            {comp.nomenclature}
                          </div>
                          <div className="text-gray-500 text-[10px] truncate">
                            {comp.name || comp.component_name}
                          </div>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-green-400 flex-shrink-0 ml-2" />}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* K/N Configuration */}
            {systemEquipment.length > 0 && phases.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-[10px] font-medium text-gray-400 mb-2">K/N Configuration</div>
                {phases.map((phase) => {
                  const kn = systemKnConfigs.find((k) => k.phase_number === phase.phase_number)
                  const totalN = systemEquipment.length

                  return (
                    <div key={phase.phase_number} className="flex items-center justify-between gap-2 mb-2">
                      <div className="text-[10px] text-gray-400 flex-1 truncate">{phase.phase_name}</div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={totalN}
                          value={kn?.k || 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            const clamped = Math.min(Math.max(0, value), totalN)
                            updateKnValue(sys, phase.phase_number, clamped)
                          }}
                          className="w-12 h-6 px-1 py-0.5 bg-[#3c3c3c] border-gray-700 text-gray-200 text-[10px] text-center focus:border-purple-500"
                        />
                        <span className="text-gray-600 text-[10px]">/</span>
                        <div className="w-12 h-6 px-1 py-0.5 bg-[#2a2a2a] rounded text-gray-400 text-[10px] text-center flex items-center justify-center border border-gray-700">
                          {totalN}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={!hasAnyEquipment}
          className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium"
        >
          <Save className="w-3 h-3" />
          Save
        </Button>
      </div>
    </div>
  )
}