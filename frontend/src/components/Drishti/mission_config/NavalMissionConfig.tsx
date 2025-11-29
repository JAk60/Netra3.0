"use client"

import { useState, useEffect, useMemo, useTransition } from "react"
import { Input } from "@/registry/new-york-v4/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york-v4/ui/dialog"
import { useNavalConfigStore } from "@/store/Mission_config_store"
import { ConfigurationSidebar } from "./ConfigurationSidebar"
import { ConfigurationCanvas } from "./ConfigurationCanvas"
import { ConfigurationWizard } from "./ConfigurationWizard"
import { computeNodesAndEdges, generateConfigFromWizard, logConfigToConsole, filterConfigs } from "@/lib/mission_config_utils"
import { Button } from "@/registry/new-york-v4/ui/button"
import Header from "./Header"
import { useUserSelectionStore } from "@/store/UserSelectionStore"
import { useShipSystemHierarchyStore } from "@/store/shipSystemHierarchyStore"
import { 
  createShipConfiguration, 
  updateShipConfiguration,
  listShipConfigurations,
  deleteShipConfiguration
} from "@/actions/mission_config/m_config"
import { toast } from "sonner"

// Define proper types for your configuration
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

export default function NavalMissionConfig() {
  const {
    configs,
    selectedConfigId,
    mode,
    searchTerm,
    currentStep,
    selectedShipId,
    phases,
    selectedEquipment,
    knConfigs,
    workingConfig,
    setConfigs,
    setSelectedConfigId,
    setMode,
    setSearchTerm,
    setCurrentStep,
    setSelectedShipId,
    setPhases,
    updateSystemEquipment,
    updateSystemKnConfigs,
    addConfig,
    updateConfig,
    deleteConfig,
    startCreate,
    startEdit,
    resetWizard,
  } = useNavalConfigStore()

  const { ships } = useUserSelectionStore()
  const { data, loading, error, fetchHierarchy } = useShipSystemHierarchyStore()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [configName, setConfigName] = useState("")
  const [isPending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true)

  const shipData = useMemo(() => {
    if (!ships || ships.length === 0) return {}

    return ships.reduce((acc, shipGroup) => {
      if (shipGroup.items) {
        shipGroup.items.forEach((ship) => {
          acc[ship.value] = {
            ship_id: ship.value,
            ship_name: ship.label,
          }
        })
      }
      return acc
    }, {} as Record<string, any>)
  }, [ships])

  // Transform hierarchy data using the new _data.data structure
  const equipmentBySystem = useMemo(() => {
    if (!data?._data?.data) return {}

    const systemData = data._data.data
    const grouped: Record<string, any[]> = {}

    // Iterate through each system type in _data.data
    Object.keys(systemData).forEach((systemType) => {
      const system = systemData[systemType]
      if (system.components && Array.isArray(system.components)) {
        grouped[systemType] = system.components.map((component: any) => ({
          id: component.component_id,
          name: component.component_name,
          nomenclature: component.nomenclature,
          systemType: systemType,
          departmentId: component.department_id,
          isLmu: component.is_lmu === 1,
          cmmsCode: component.CMMS_EquipmentCode,
        }))
      }
    })

    return grouped
  }, [data?._data?.data])

  // Load all configurations on mount
  useEffect(() => {
    const loadConfigs = async () => {
      setIsLoadingConfigs(true)
      try {
        const result = await listShipConfigurations()
        if (result.success && result.data) {
          setConfigs(result.data)
          toast.success(`Loaded ${result.data.length} configurations`)
        } else {
          toast.error(result.error || "Failed to load configurations")
        }
      } catch (error) {
        console.error("Error loading configurations:", error)
        toast.error("Failed to load configurations")
      } finally {
        setIsLoadingConfigs(false)
      }
    }

    loadConfigs()
  }, [setConfigs])

  // Fetch ship hierarchy when a ship is selected in the wizard
  useEffect(() => {
    if (selectedShipId && (mode === "create" || mode === "edit")) {
      fetchHierarchy(selectedShipId)
    }
  }, [selectedShipId, mode, fetchHierarchy])

  // Fetch ship hierarchy when a config is selected in view mode
  useEffect(() => {
    if (mode === "view" && selectedConfigId) {
      const selectedConfig = configs.find((c: Configuration) => c.id === selectedConfigId)
      if (selectedConfig && selectedConfig.ship_id) {
        fetchHierarchy(selectedConfig.ship_id)
      }
    }
  }, [mode, selectedConfigId, configs, fetchHierarchy])

  // Compute nodes and edges for visualization
  const { nodes, edges } = computeNodesAndEdges({
    mode,
    selectedConfigId,
    configs,
    selectedShipId,
    selectedEquipment,
    knConfigs,
    shipData,
  })

  // Filter configs based on search
  const filteredConfigs = filterConfigs(configs, searchTerm)

  // Selected config for display
  const selectedConfig = selectedConfigId 
    ? configs.find((c: Configuration) => c.id === selectedConfigId) 
    : null

 // Replace the handleSelectConfig function in NavalMissionConfig.tsx with this:

const handleSelectConfig = (id: string) => {
  console.log("=== handleSelectConfig called ===")
  console.log("Config ID:", id)
  
  // Find the selected configuration
  const config = configs.find((c: Configuration) => c.id === id)
  
  if (!config) {
    console.log("Config not found")
    setSelectedConfigId(id)
    return
  }

  console.log("Config found:", config.config_name)
  console.log("Raw configuration:", config.configuration)

  // Set the selected config ID first - this triggers view mode
  setSelectedConfigId(id)

  // If configuration has saved state, restore it to the store
  // This is CRITICAL for the canvas to display the nodes
  if (config.configuration) {
    // Unwrap nested configuration (handle any level of nesting)
    let actualConfig = config.configuration
    
    while (actualConfig && actualConfig.configuration && typeof actualConfig.configuration === 'object') {
      console.log("Unwrapping nested configuration layer")
      actualConfig = actualConfig.configuration
    }

    console.log("Unwrapped configuration:", actualConfig)
    console.log("Configuration keys:", Object.keys(actualConfig || {}))

    // Extract global phases
    let globalPhases: any[] = []
    const systemTypes = ['propulsion', 'power_generation', 'support', 'firing']
    
    // Try to find phases from the first system that has them
    for (const systemType of systemTypes) {
      const system = actualConfig[systemType]
      if (system?.phases && Array.isArray(system.phases) && system.phases.length > 0) {
        globalPhases = system.phases.map((p: any) => ({
          phase_number: p.phase_number,
          phase_name: p.phase_name
        }))
        console.log(`Found phases from ${systemType}:`, globalPhases)
        break
      }
    }

    if (globalPhases.length > 0) {
      setPhases(globalPhases)
    }

    // Restore selected equipment and KN configs
    const restoredEquipment: Record<string, Component[]> = {}
    const restoredKnConfigs: Record<string, KNConfig[]> = {}

    systemTypes.forEach((systemType) => {
      const system = actualConfig[systemType]
      
      console.log(`Processing ${systemType}:`, {
        hasSystem: !!system,
        hasEquipment: !!(system?.selected_equipment),
        equipmentCount: system?.selected_equipment?.length || 0
      })
      
      if (system && system.selected_equipment && Array.isArray(system.selected_equipment)) {
        // Restore equipment as Component objects with proper structure
        restoredEquipment[systemType] = system.selected_equipment.map((eq: any) => {
          const component: Component = {
            id: eq.id || eq.component_id,
            component_id: eq.id || eq.component_id,
            name: eq.name || eq.component_name,
            component_name: eq.name || eq.component_name,
            nomenclature: eq.nomenclature
          }
          console.log(`Restored equipment:`, component.nomenclature)
          return component
        })
        
        // Restore KN configs
        if (system.phases && Array.isArray(system.phases)) {
          restoredKnConfigs[systemType] = system.phases.map((phase: any) => ({
            phase_number: phase.phase_number,
            k: phase.k
          }))
        }

        // CRITICAL: Update the store immediately
        console.log(`Updating store for ${systemType} with ${restoredEquipment[systemType].length} items`)
        updateSystemEquipment(systemType, restoredEquipment[systemType])
        
        if (restoredKnConfigs[systemType]) {
          updateSystemKnConfigs(systemType, restoredKnConfigs[systemType])
        }
      }
    })

    console.log("=== Restoration Summary ===")
    console.log("Phases:", globalPhases.length)
    console.log("Equipment by system:", Object.keys(restoredEquipment).map(k => `${k}: ${restoredEquipment[k].length}`))
    console.log("KN configs by system:", Object.keys(restoredKnConfigs).map(k => `${k}: ${restoredKnConfigs[k].length}`))
  } else {
    console.log("No configuration data to restore")
  }
}
  const handleCreateNew = () => {
    startCreate()
  }

  const handleEditConfig = (config: Configuration) => {
    startEdit(config)
  }

  const handleDeleteConfig = async (id: string) => {
    const config = configs.find((c: Configuration) => c.id === id)
    if (!config) return

    if (!confirm(`Delete configuration "${config.config_name}"?`)) return

    try {
      const result = await deleteShipConfiguration(id)
      if (result.success) {
        deleteConfig(id)
        logConfigToConsole(config, "deleted")
        toast.success("Configuration deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete configuration")
      }
    } catch (error) {
      console.error("Error deleting configuration:", error)
      toast.error("Failed to delete configuration")
    }
  }

  const handleCancel = () => {
    resetWizard()
  }

  const handleOpenSaveDialog = () => {
    console.log({ workingConfig });

    setConfigName(workingConfig?.config_name || "")
    setSaveDialogOpen(true)
    setSaveError(null)
  }

  const handleSaveConfig = async () => {
    if (!configName.trim()) {
      setSaveError("Configuration name is required")
      return
    }

    setSaveError(null)

    // Prepare complete ship data with systems
    const completeShipData = {
      ...shipData,
      [selectedShipId]: {
        ...shipData[selectedShipId],
        systems: data?._data?.data || {},
      }
    }

    // Generate the configuration object
    const config = generateConfigFromWizard(
      configName,
      selectedShipId,
      shipData[selectedShipId]?.ship_name || "",
      phases,
      selectedEquipment,
      knConfigs,
      completeShipData,
      workingConfig || undefined
    )

    // Log to console for debugging
    logConfigToConsole(config, mode === "edit" ? "updated" : "created")

    // Prepare data for API
    const apiData = {
      config_name: config.config_name,
      ship_id: config.ship_id || selectedShipId,
      ship_name: config.ship_name || shipData[selectedShipId]?.ship_name || "",
      configuration: config // Send the entire config object as JSON
    }

    startTransition(async () => {
      try {
        let result

        if (mode === "edit" && workingConfig?.id) {
          // Update existing configuration
          result = await updateShipConfiguration(workingConfig.id, apiData)
        } else {
          // Create new configuration
          result = await createShipConfiguration(apiData)
        }

        if (result.success && result.data) {
          // Update local store with the saved config including the server-generated ID
          const savedConfig = {
            ...config,
            id: result.data.id,
            created_date: result.data.created_date,
            modified_date: result.data.modified_date,
          }

          if (mode === "edit" && workingConfig) {
            updateConfig(savedConfig)
            toast.success("Configuration updated successfully")
          } else {
            addConfig(savedConfig)
            toast.success("Configuration created successfully")
          }

          setSaveDialogOpen(false)
          setConfigName("")
          resetWizard()
        } else {
          setSaveError(result.error || "Failed to save configuration")
          toast.error(result.error || "Failed to save configuration")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
        setSaveError(errorMessage)
        toast.error(errorMessage)
        console.error("Error saving configuration:", err)
      }
    })
  }

  return (
    <div className="flex w-full bg-muted/30 min-h-screen overflow-x-hidden">
      {/* LEFT SIDEBAR */}
      <ConfigurationSidebar
        configs={filteredConfigs}
        selectedConfigId={selectedConfigId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectConfig={handleSelectConfig}
        onCreateNew={handleCreateNew}
        onEditConfig={handleEditConfig}
        onDeleteConfig={handleDeleteConfig}
      />

      {/* MAIN CANVAS */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <Header
          selectedConfig={selectedConfig}
          mode={mode}
          onCancel={handleCancel}
          onExport={() => {
            if (selectedConfig) {
              logConfigToConsole(selectedConfig, "created")
            }
          }}
          onBulkImport={() => {
            alert("Bulk import functionality to be implemented.")
          }}
        />

        {/* Canvas */}
        <ConfigurationCanvas nodes={nodes} edges={edges} mode={mode} />

        {/* Bottom Info Bar */}
        <div className="h-10 bg-[#1e1e1e] border-t border-gray-800 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#2a2a2a] rounded-md text-xs text-gray-400">
            <span>
              {isLoadingConfigs 
                ? "Loading configurations..." 
                : loading 
                ? "Loading ship data..." 
                : selectedConfig 
                ? `Viewing: ${selectedConfig.config_name} - ${selectedConfig.ship_name}`
                : "Use the sidebar to create and manage configurations"}
            </span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-8 bg-[#252525] border-t border-gray-800 flex items-center justify-between px-4 text-[10px] text-gray-500">
          <div>
            {isLoadingConfigs 
              ? "Loading..." 
              : isPending 
              ? "Saving..." 
              : loading 
              ? "Loading ship data..." 
              : "Ready"}
          </div>
          <div className="flex items-center gap-4">
            <span>{configs.length} configurations</span>
            <span>{nodes.length} nodes</span>
            {data?.stats && <span>{data.stats.totalEquipment} equipment available</span>}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - WIZARD */}
      {(mode === "create" || mode === "edit") && (
        <div className="w-[220px] bg-[#252525] border-l border-gray-800 overflow-y-auto flex flex-col">
          <ConfigurationWizard
            currentStep={currentStep}
            shipGroups={ships}
            selectedShipId={selectedShipId}
            phases={phases}
            selectedEquipment={selectedEquipment}
            knConfigs={knConfigs}
            equipmentBySystem={equipmentBySystem}
            loading={loading}
            onStepChange={setCurrentStep}
            onShipSelect={setSelectedShipId}
            onPhasesChange={setPhases}
            onEquipmentChange={updateSystemEquipment}
            onKnConfigChange={updateSystemKnConfigs}
            onSave={handleOpenSaveDialog}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Save Configuration Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="bg-[#2a2a2a] border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {mode === "edit" ? "Update Configuration" : "Save Configuration"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a name for this configuration
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Configuration name"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="bg-[#3c3c3c] border-gray-700 text-white"
              autoFocus
              disabled={isPending}
            />
            {saveError && (
              <p className="mt-2 text-sm text-red-400">{saveError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSaveDialogOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={!configName.trim() || isPending}
              className="bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === "edit" ? "Updating..." : "Saving..."}
                </span>
              ) : (
                mode === "edit" ? "Update" : "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}