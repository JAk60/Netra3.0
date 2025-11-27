"use client"

import { Settings, X } from "lucide-react"
import { ShipSelectionStep } from "./wizard-steps/ShipSelectionStep"
import { PhaseConfigurationStep } from "./wizard-steps/PhaseConfigurationStep"
import { EquipmentConfigurationStep } from "./wizard-steps/EquipmentConfigurationStep"
import type { Phase, SystemType, Component, KNConfig } from "@/types/mission_config"

interface ConfigurationWizardProps {
  currentStep: number
  shipGroups: any[] // Ship groups from useUserSelectionStore
  selectedShipId: string
  phases: Phase[]
  selectedEquipment: Record<SystemType, Component[]>
  knConfigs: Record<SystemType, KNConfig[]>
  equipmentBySystem: Record<string, any[]>
  loading?: boolean
  onStepChange: (step: number) => void
  onShipSelect: (shipId: string) => void
  onPhasesChange: (phases: Phase[]) => void
  onEquipmentChange: (system: SystemType, equipment: Component[]) => void
  onKnConfigChange: (system: SystemType, configs: KNConfig[]) => void
  onSave: () => void
  onCancel: () => void
}

export function ConfigurationWizard({
  currentStep,
  shipGroups,
  selectedShipId,
  phases,
  selectedEquipment,
  knConfigs,
  equipmentBySystem,
  loading = false,
  onStepChange,
  onShipSelect,
  onPhasesChange,
  onEquipmentChange,
  onKnConfigChange,
  onSave,
  onCancel,
}: ConfigurationWizardProps) {
  const handleShipNext = (shipId: string) => {
    onShipSelect(shipId)
    onStepChange(1)
  }

  const handlePhasesNext = (newPhases: Phase[]) => {
    onPhasesChange(newPhases)
    
    // Initialize K/N configs for all systems when phases are set
    const initialKn: Record<SystemType, KNConfig[]> = {
      propulsion: newPhases.map((p) => ({ phase_number: p.phase_number, k: 0 })),
      power_generation: newPhases.map((p) => ({ phase_number: p.phase_number, k: 0 })),
      support: newPhases.map((p) => ({ phase_number: p.phase_number, k: 0 })),
      firing: newPhases.map((p) => ({ phase_number: p.phase_number, k: 0 })),
    }
    
    // Only initialize if knConfigs is empty
    const hasExistingKnConfigs = Object.values(knConfigs).some((arr) => arr.length > 0)
    if (!hasExistingKnConfigs) {
      Object.entries(initialKn).forEach(([system, configs]) => {
        onKnConfigChange(system as SystemType, configs)
      })
    }
    
    onStepChange(2)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-300">
            Step {currentStep + 1} of 3
          </span>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step Content */}
      <div className="p-3 flex-1 overflow-y-auto">
        {currentStep === 0 && (
          <ShipSelectionStep
            shipGroups={shipGroups}
            selectedShipId={selectedShipId}
            onNext={handleShipNext}
          />
        )}

        {currentStep === 1 && (
          <PhaseConfigurationStep
            phases={phases}
            onNext={handlePhasesNext}
            onBack={() => onStepChange(0)}
          />
        )}

        {currentStep === 2 && (
          <EquipmentConfigurationStep
            selectedShipId={selectedShipId}
            phases={phases}
            selectedEquipment={selectedEquipment}
            knConfigs={knConfigs}
            equipmentBySystem={equipmentBySystem}
            loading={loading}
            onEquipmentChange={onEquipmentChange}
            onKnConfigChange={onKnConfigChange}
            onSave={onSave}
            onBack={() => onStepChange(1)}
          />
        )}
      </div>
    </>
  )
}