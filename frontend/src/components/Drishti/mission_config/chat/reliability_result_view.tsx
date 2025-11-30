// frontend/src/components/Drishti/mission_config/chat/reliability_result_view.tsx

import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Checkbox } from "@/registry/new-york-v4/ui/checkbox"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Shield,
  Shuffle,
  TrendingUp,
  Save,
  Calculator,
  Trash2,
  AlertCircle
} from "lucide-react"
import { useEffect, useState } from 'react'
import { getShipSystemHierarchy } from "@/actions/system/get-ship-system-hierarchy"
import {
  saveComparisonConfig,
  getSavedComparisonConfigs,
  deleteComparisonConfig,
  submitBatchComparison,
  saveOriginalResult,
  addAlternativeResults,
  type ComparisonConfig,
  type PhaseEquipment,
  type EquipmentSelection,
  type ComparisonResult
} from "@/actions/mission_config/batch_comparison"
import { toast } from 'sonner'
import ComparisonResultsTable from './comparison_results_table'

// ============================================================================
// TYPES
// ============================================================================

interface ReliabilityResultsViewProps {
  reliabilityData: any
  onBack: () => void
  selectedConfig: any
  comparisonId: string
  onNavigateToTable: () => void
}

interface SystemEquipment {
  component_id: string
  name: string
  nomenclature: string
  system_type: string
}

interface SelectedEquipment {
  [phaseIndex: string]: {
    [systemKey: string]: string[]
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReliabilityResultsView({
  reliabilityData,
  onBack,
  selectedConfig,
  comparisonId,
  onNavigateToTable
}: ReliabilityResultsViewProps) {

  // ========== STATE ==========
  const [showComparison, setShowComparison] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment>({})
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({})
  const [allShipEquipment, setAllShipEquipment] = useState<SystemEquipment[]>([])
  const [loadingEquipment, setLoadingEquipment] = useState(false)
  const [savedComparisons, setSavedComparisons] = useState<ComparisonConfig[]>([])
  const [saving, setSaving] = useState(false)
  const [calculating, setCalculating] = useState(false)
  
  // Table view state
  const [showResultsTable, setShowResultsTable] = useState(false)
  const [calculatedResults, setCalculatedResults] = useState<ComparisonResult[]>([])

  const data = reliabilityData?.data || reliabilityData

  // ========== EFFECTS ==========

  useEffect(() => {
    // Save the original calculation on mount
    saveOriginalCalculation()
    loadSavedComparisons()
  }, [])

  useEffect(() => {
    if (showComparison && selectedConfig?.ship_id && allShipEquipment.length === 0) {
      fetchAllShipEquipment()
    }
  }, [showComparison, selectedConfig?.ship_id])

  // ========== SAVE ORIGINAL CALCULATION ==========

  const saveOriginalCalculation = () => {
    try {
      console.log('💾 Saving original calculation...')
      console.log('📊 Data available:', data)

      // Validate we have the necessary data
      if (!data || !data.mission_reliability || !data.phases || !data.equipment_final_ages) {
        console.error('❌ Missing required data for saving original calculation')
        console.error('  - data exists:', !!data)
        console.error('  - mission_reliability:', data?.mission_reliability)
        console.error('  - phases:', data?.phases?.length)
        console.error('  - equipment_final_ages:', data?.equipment_final_ages)
        return
      }

      const success = saveOriginalResult({
        config_id: selectedConfig.id,
        config_name: `${selectedConfig.config_name} - Original`,
        ship_id: selectedConfig.ship_id,
        ship_name: selectedConfig.ship_name,
        total_duration: data.total_duration,
        mission_reliability: data.mission_reliability,
        phases: data.phases,
        equipment_final_ages: data.equipment_final_ages
      })

      if (success) {
        console.log('✅ Original calculation saved')
        toast.success('Original calculation saved!')
      } else {
        console.error('❌ Failed to save original calculation')
      }

    } catch (error) {
      console.error('💥 Error saving original calculation:', error)
    }
  }

  // ========== LOAD SAVED COMPARISONS ==========

  const loadSavedComparisons = () => {
    const configs = getSavedComparisonConfigs(selectedConfig.id)
    console.log('📊 Loaded comparison configs:', configs)
    setSavedComparisons(configs)
  }

  // ========== FETCH EQUIPMENT ==========

  const fetchAllShipEquipment = async () => {
    if (!selectedConfig?.ship_id) {
      console.error('❌ No ship_id available')
      return
    }

    setLoadingEquipment(true)

    try {
      const result = await getShipSystemHierarchy(selectedConfig.ship_id)

      const equipment: SystemEquipment[] = result.components.map(comp => ({
        component_id: comp.id,
        name: comp.name,
        nomenclature: comp.nomenclature,
        system_type: comp.systemType.toLowerCase()
      }))

      console.log('✅ Loaded equipment:', equipment.length)
      setAllShipEquipment(equipment)
      initializeSelectedEquipmentWithData(equipment)

    } catch (error) {
      console.error('💥 Error fetching ship equipment:', error)
      toast.error(`Failed to load ship equipment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingEquipment(false)
    }
  }

  const initializeSelectedEquipmentWithData = (equipment: SystemEquipment[]) => {
    if (!data.phases || equipment.length === 0) return

    const initial: SelectedEquipment = {}

    data.phases.forEach((phase: any, index: number) => {
      const phaseKey = `phase_${index}`
      initial[phaseKey] = {}

      Object.entries(phase.systems || {}).forEach(([systemKey, systemData]: [string, any]) => {
        if (systemData.critical_equipment && systemData.critical_equipment.length > 0) {
          const componentIds = systemData.critical_equipment
            .map((nom: string) => {
              const found = equipment.find(eq => eq.nomenclature === nom)
              return found?.component_id
            })
            .filter(Boolean)

          if (componentIds.length > 0) {
            initial[phaseKey][systemKey] = componentIds
          }
        }
      })
    })

    setSelectedEquipment(initial)
    console.log('✅ Initialized selected equipment')
  }

  // ========== HELPER FUNCTIONS ==========

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${(value * 100).toFixed(2)}%`
  }

  const getReliabilityColor = (reliability: number | null) => {
    if (reliability === null) return 'bg-gray-100 text-gray-800'
    if (reliability >= 0.95) return 'bg-green-100 text-green-800'
    if (reliability >= 0.90) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getPhaseCriticalEquipment = (phase: any) => {
    const equipment = new Set<string>()
    Object.values(phase.systems || {}).forEach((system: any) => {
      if (system.critical_equipment && system.critical_equipment.length > 0) {
        system.critical_equipment.forEach((eq: string) => equipment.add(eq))
      }
    })
    return Array.from(equipment)
  }

  const getSystemLabel = (key: string): string => {
    const labels: Record<string, string> = {
      propulsion: 'Propulsion',
      power_generation: 'Power Generation',
      support: 'Support',
      firing: 'Firing'
    }
    return labels[key] || key
  }

  // ========== EQUIPMENT SELECTION HANDLERS ==========

  const toggleEquipmentSelection = (
    phaseIndex: number,
    systemKey: string,
    componentId: string
  ) => {
    setSelectedEquipment(prev => {
      const phaseKey = `phase_${phaseIndex}`
      const current = prev[phaseKey]?.[systemKey] || []

      const updated = current.includes(componentId)
        ? current.filter(id => id !== componentId)
        : [...current, componentId]

      return {
        ...prev,
        [phaseKey]: {
          ...prev[phaseKey],
          [systemKey]: updated
        }
      }
    })
  }

  const isEquipmentSelected = (
    phaseIndex: number,
    systemKey: string,
    componentId: string
  ): boolean => {
    const phaseKey = `phase_${phaseIndex}`
    return selectedEquipment[phaseKey]?.[systemKey]?.includes(componentId) || false
  }

  const isEquipmentCurrent = (phase: any, nomenclature: string): boolean => {
    const allCritical = Object.values(phase.systems || {}).flatMap(
      (system: any) => system.critical_equipment || []
    )
    return allCritical.includes(nomenclature)
  }

  const togglePhaseExpansion = (phaseIndex: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseIndex]: !prev[phaseIndex]
    }))
  }

  // ========== ADD TO COMPARISONS ==========

  const handleAddToComparisons = () => {
    if (savedComparisons.length >= 5) {
      toast.error('Maximum 5 comparisons allowed. Please delete some first.')
      return
    }

    setSaving(true)

    try {
      // Build the comparison config (equipment selections only)
      const phases: PhaseEquipment[] = data.phases.map((phase: any, phaseIndex: number) => {
        const phaseKey = `phase_${phaseIndex}`
        const phaseConfig: PhaseEquipment = {
          phase_name: phase.phase_name,
          duration_hours: phase.duration_hours,
          sequence_order: phase.sequence
        }

        // Add equipment selections for each system
        const systems = ['propulsion', 'power_generation', 'support', 'firing'] as const
        systems.forEach(systemKey => {
          const selectedIds = selectedEquipment[phaseKey]?.[systemKey] || []
          if (selectedIds.length > 0) {
            const equipmentSelections: EquipmentSelection[] = selectedIds
              .map(id => {
                const eq = allShipEquipment.find(e => e.component_id === id)
                return eq ? {
                  component_id: eq.component_id,
                  name: eq.name,
                  nomenclature: eq.nomenclature
                } : null
              })
              .filter(Boolean) as EquipmentSelection[]

            if (equipmentSelections.length > 0) {
              phaseConfig[systemKey] = equipmentSelections
            }
          }
        })

        return phaseConfig
      })

      const comparisonName = `${selectedConfig.config_name} - Alt ${savedComparisons.length + 1}`

      const config: ComparisonConfig = {
        id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        config_id: selectedConfig.id,
        config_name: comparisonName,
        ship_id: selectedConfig.ship_id,
        ship_name: selectedConfig.ship_name,
        total_duration: data.total_duration,
        phases,
        timestamp: new Date().toISOString()
      }

      const success = saveComparisonConfig(config)

      if (success) {
        loadSavedComparisons()
        toast.success(`✅ Saved as "${comparisonName}"`)
        setShowComparison(false)
      } else {
        toast.error('Failed to save comparison')
      }

    } catch (error) {
      console.error('Error saving comparison:', error)
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  // ========== DELETE COMPARISON ==========

  const handleDeleteComparison = (comparisonId: string) => {
    if (confirm('Delete this comparison?')) {
      const success = deleteComparisonConfig(comparisonId)
      if (success) {
        loadSavedComparisons()
        toast.success('Comparison deleted')
      } else {
        toast.error('Failed to delete')
      }
    }
  }

  // ========== CALCULATE ALL ==========

  const handleCalculateAll = async () => {
    if (savedComparisons.length === 0) {
      toast.error('No comparisons to calculate')
      return
    }

    setCalculating(true)

    try {
      console.log('🚀 Calculating all comparisons...')

      const result = await submitBatchComparison({
        comparisons: savedComparisons
      })

      if (result.success && result.data) {
        console.log('✅ Batch calculation completed:', result.data)
        
        // Save alternative results
        const success = addAlternativeResults(
          selectedConfig.id,
          result.data.results
        )
        
        if (success) {
          toast.success('All comparisons calculated and saved!')
          
          // Store results and show table
          setCalculatedResults(result.data.results)
          setShowResultsTable(true)
          
        } else {
          toast.warning('Calculations completed but failed to save results')
        }

      } else {
        throw new Error(result.error || 'Batch calculation failed')
      }

    } catch (error) {
      console.error('Error calculating batch:', error)
      toast.error(`Batch calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCalculating(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  // If showing results table, render the ComparisonResultsTable component
  if (showResultsTable) {
    console.log('data', data)
    console.log('data', data.mission_reliability)
    console.log('calculatedResults', calculatedResults)
    return (
      <div className="w-full space-y-6">
        <Button variant="outline" onClick={() => setShowResultsTable(false)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Button>

        <ComparisonResultsTable
          originalConfig={data}
          results={calculatedResults}
        />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Configurations
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{data.config_name}</h1>
          <p className="text-gray-500 mt-1">{data.ship_name}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Duration</div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {data.total_duration}h
          </div>
        </div>
      </div>

      {/* Mission Reliability Card */}
      <UICard className="border-2 border-primary shadow-lg bg-gray-900">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Shield className="w-6 h-6 text-primary" />
              Original Mission Reliability
            </CardTitle>
            <Badge
              className={`text-lg px-4 py-2 ${data.mission_reliability >= 0.95 ? 'bg-green-500' :
                  data.mission_reliability >= 0.90 ? 'bg-yellow-500' :
                    'bg-red-500'
                }`}
            >
              {formatPercent(data.mission_reliability)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Mission reliability calculated successfully</span>
          </div>
        </CardContent>
      </UICard>

      {/* Phase Analysis Table */}
      <UICard className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Phase Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Phase</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Reliability</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Preferred Equipment</th>
                </tr>
              </thead>
              <tbody>
                {(data.phases || []).map((phase: any, index: number) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono border-gray-700 text-gray-300">
                          #{phase.sequence + 1}
                        </Badge>
                        <span className="font-medium text-white">{phase.phase_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-400">{phase.duration_hours}h</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getReliabilityColor(phase.phase_reliability)}>
                        {formatPercent(phase.phase_reliability)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {getPhaseCriticalEquipment(phase).map((equipment, eqIndex) => (
                          <Badge key={eqIndex} variant="secondary" className="bg-gray-800 text-gray-300">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </UICard>

      {/* Saved Comparisons List */}
      {savedComparisons.length > 0 && (
        <UICard className="bg-black border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                Saved Comparisons ({savedComparisons.length}/5)
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(true)}
                className="gap-2"
                disabled={savedComparisons.length >= 5}
              >
                <Shuffle className="w-4 h-4" />
                Add More
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedComparisons.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{comp.config_name}</div>
                    <div className="text-xs text-gray-500">
                      {comp.phases?.length || 0} phases • {comp.total_duration || 0}h total
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComparison(comp.id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </UICard>
      )}

      {/* Alternative Equipment Selection */}
      {showComparison && (
        <UICard className="border-2 border-dashed border-primary bg-black">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Select Alternative Equipment</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Choose different equipment for each phase to create comparison configurations
                </p>
              </div>
              {savedComparisons.length >= 5 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Maximum reached (5/5)
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingEquipment ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-white">Loading ship equipment...</span>
              </div>
            ) : allShipEquipment.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No equipment found</p>
                <Button onClick={fetchAllShipEquipment} variant="outline">
                  Retry Loading Equipment
                </Button>
              </div>
            ) : (
              <>
                {/* Phase Equipment Selection */}
                {(data.phases || []).map((phase: any, phaseIndex: number) => (
                  <div key={phaseIndex} className="border border-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => togglePhaseExpansion(phaseIndex)}
                      className="w-full bg-gray-900 hover:bg-gray-800 transition-colors p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono border-gray-700 text-gray-300">
                          #{phase.sequence + 1}
                        </Badge>
                        <span className="font-semibold text-white">{phase.phase_name}</span>
                        <span className="text-sm text-gray-500">({phase.duration_hours}h)</span>
                      </div>
                      {expandedPhases[phaseIndex] ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {expandedPhases[phaseIndex] && (
                      <div className="p-4 bg-black space-y-6">
                        {['propulsion', 'power_generation', 'support', 'firing'].map(systemKey => {
                          const systemEquipment = allShipEquipment.filter(
                            eq => eq.system_type === systemKey
                          )

                          if (systemEquipment.length === 0) return null

                          return (
                            <div key={systemKey} className="space-y-2">
                              <h4 className="font-semibold text-sm text-white">
                                {getSystemLabel(systemKey)} ({systemEquipment.length} items)
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {systemEquipment.map(equipment => {
                                  const isSelected = isEquipmentSelected(
                                    phaseIndex,
                                    systemKey,
                                    equipment.component_id
                                  )
                                  const isCurrent = isEquipmentCurrent(phase, equipment.nomenclature)

                                  return (
                                    <div
                                      key={equipment.component_id}
                                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${isSelected
                                          ? 'bg-primary/10 border-primary'
                                          : isCurrent
                                            ? 'bg-green-900/30 border-green-700'
                                            : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                                        }`}
                                    >
                                      <Checkbox
                                        id={`${phaseIndex}-${systemKey}-${equipment.component_id}`}
                                        checked={isSelected}
                                        onCheckedChange={() =>
                                          toggleEquipmentSelection(phaseIndex, systemKey, equipment.component_id)
                                        }
                                      />
                                      <label
                                        htmlFor={`${phaseIndex}-${systemKey}-${equipment.component_id}`}
                                        className="flex-1 cursor-pointer"
                                      >
                                        <div className="font-medium text-sm text-white">{equipment.nomenclature}</div>
                                        <div className="text-xs text-gray-500">{equipment.name}</div>
                                        {isCurrent && (
                                          <Badge variant="outline" className="mt-1 text-xs border-gray-700 text-gray-400">
                                            Current
                                          </Badge>
                                        )}
                                      </label>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 border-t border-gray-800 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowComparison(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleAddToComparisons}
                    disabled={saving || savedComparisons.length >= 5}
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Add to Comparisons ({savedComparisons.length}/5)
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </UICard>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        {savedComparisons.length === 0 ? (
          <Button
            size="lg"
            onClick={() => setShowComparison(!showComparison)}
            className="gap-2"
            variant="outline"
          >
            <Shuffle className="w-5 h-5" />
            {showComparison ? 'Hide Alternative Equipment' : 'Add Alternative Equipment'}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleCalculateAll}
            disabled={calculating}
            className="gap-2"
          >
            {calculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                Calculate All ({savedComparisons.length}) Comparisons
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}