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
  TrendingUp
} from "lucide-react"
import { useEffect, useState } from 'react'
import { getShipSystemHierarchy } from "@/actions/system/get-ship-system-hierarchy"
import { 
  submitBatchComparison, 
  updateComparisonWithAlternative, 
  type PhaseEquipment, 
  type EquipmentSelection 
} from "@/actions/mission_config/batch_comparison"
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

interface ReliabilityResultsViewProps {
  reliabilityData: any
  onBack: () => void
  selectedConfig: any
  comparisonId: string
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
  comparisonId
}: ReliabilityResultsViewProps) {
  
  // ========== STATE ==========
  const [showComparison, setShowComparison] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment>({})
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({})
  const [comparing, setComparing] = useState(false)
  const [allShipEquipment, setAllShipEquipment] = useState<SystemEquipment[]>([])
  const [loadingEquipment, setLoadingEquipment] = useState(false)

  const data = reliabilityData?.data || reliabilityData

  // ========== EFFECTS ==========
  
  useEffect(() => {
    console.log('🔍 Component mounted with:', {
      hasSelectedConfig: !!selectedConfig,
      shipId: selectedConfig?.ship_id,
      showComparison,
      equipmentCount: allShipEquipment.length,
      comparisonId
    })
  }, [selectedConfig, showComparison, allShipEquipment.length, comparisonId])

  useEffect(() => {
    if (showComparison && selectedConfig?.ship_id && allShipEquipment.length === 0) {
      console.log('📡 Triggering equipment fetch...')
      fetchAllShipEquipment()
    }
  }, [showComparison, selectedConfig?.ship_id])

  // ========== FETCH EQUIPMENT ==========
  
  const fetchAllShipEquipment = async () => {
    if (!selectedConfig?.ship_id) {
      console.error('❌ No ship_id available:', selectedConfig)
      return
    }
    
    setLoadingEquipment(true)
    console.log('🚀 Fetching equipment for ship:', selectedConfig.ship_id)
    
    try {
      const result = await getShipSystemHierarchy(selectedConfig.ship_id)
      console.log('📦 Raw result from API:', result)
      
      const equipment: SystemEquipment[] = result.components.map(comp => ({
        component_id: comp.id,
        name: comp.name,
        nomenclature: comp.nomenclature,
        system_type: comp.systemType.toLowerCase()
      }))
      
      console.log('✅ Processed equipment:', {
        total: equipment.length,
        bySystem: {
          propulsion: equipment.filter(e => e.system_type === 'propulsion').length,
          power_generation: equipment.filter(e => e.system_type === 'power_generation').length,
          support: equipment.filter(e => e.system_type === 'support').length,
          firing: equipment.filter(e => e.system_type === 'firing').length,
        }
      })
      
      setAllShipEquipment(equipment)
      initializeSelectedEquipmentWithData(equipment)
      
    } catch (error) {
      console.error('💥 Error fetching ship equipment:', error)
      toast.error(`Failed to load ship equipment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingEquipment(false)
    }
  }

  // ========== INITIALIZE SELECTIONS ==========
  
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
    console.log('✅ Initialized selected equipment:', initial)
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

  // ========== BUILD ALTERNATIVE PAYLOAD ==========
  
  const buildAlternativePhases = (): PhaseEquipment[] => {
    return data.phases.map((phase: any, index: number) => {
      const phaseKey = `phase_${index}`
      const phaseEquipment: PhaseEquipment = {
        phase_name: phase.phase_name,
        duration_hours: phase.duration_hours,
        sequence_order: index
      }
      
      // Add equipment for each system
      const systemKeys = ['propulsion', 'power_generation', 'support', 'firing'] as const
      systemKeys.forEach(systemKey => {
        const componentIds = selectedEquipment[phaseKey]?.[systemKey] || []
        if (componentIds.length > 0) {
          phaseEquipment[systemKey] = componentIds.map(id => {
            const equipment = allShipEquipment.find(eq => eq.component_id === id)!
            return {
              component_id: equipment.component_id,
              name: equipment.name,
              nomenclature: equipment.nomenclature
            }
          })
        }
      })
      
      return phaseEquipment
    })
  }

  // ========== COMPARE HANDLER ==========
  
  const handleCompare = async () => {
    setComparing(true)
    console.log('🔄 Comparing with selected equipment:', selectedEquipment)
    
    try {
      const alternativePhases = buildAlternativePhases()
      
      const comparisonRequest = {
        comparisons: [{
          id: comparisonId,
          config_id: selectedConfig.id,
          config_name: selectedConfig.config_name,
          ship_id: selectedConfig.ship_id,
          ship_name: selectedConfig.ship_name,
          total_duration: data.total_duration,
          phases: alternativePhases
        }]
      }
      
      console.log('📤 Submitting comparison request:', comparisonRequest)
      
      const result = await submitBatchComparison(comparisonRequest)
      
      if (result.success && result.data?.results && result.data.results.length > 0) {
        const alternativeResult = result.data.results[0]
        
        console.log('✅ Alternative calculation result:', alternativeResult)
        
        // UPDATE COMPARISON WITH ALTERNATIVE RESULT
        const updated = await updateComparisonWithAlternative(comparisonId, {
          mission_reliability: alternativeResult.mission_reliability,
          phases: alternativeResult.phases,
          equipment_final_ages: alternativeResult.equipment_final_ages
        })
        
        if (updated) {
          toast.success('Alternative calculation saved!')
          toast.info(`Alternative Reliability: ${(alternativeResult.mission_reliability * 100).toFixed(2)}%`)
        } else {
          toast.error('Failed to save alternative result')
        }
      } else {
        toast.error('Comparison calculation failed')
      }
      
    } catch (error) {
      console.error('Error comparing configurations:', error)
      toast.error(`Comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setComparing(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full space-y-6">
      
      {/* ========== HEADER ========== */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Configurations
        </Button>
      </div>

      {/* ========== TITLE SECTION ========== */}
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

      {/* ========== MISSION RELIABILITY CARD ========== */}
      <UICard className="border-2 border-primary shadow-lg bg-gray-900">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Shield className="w-6 h-6 text-primary" />
              Original Mission Reliability
            </CardTitle>
            <Badge 
              className={`text-lg px-4 py-2 ${
                data.mission_reliability >= 0.95 ? 'bg-green-500' :
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

      {/* ========== PHASE ANALYSIS TABLE ========== */}
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Critical Equipment</th>
                </tr>
              </thead>
              <tbody>
                {(data.phases || []).map((phase: any, index: number) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-800 hover:bg-gray-900 transition-colors"
                  >
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
                          <Badge 
                            key={eqIndex} 
                            variant="secondary" 
                            className="bg-gray-800 text-gray-300"
                          >
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

      {/* ========== TOGGLE ALTERNATIVE BUTTON ========== */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => setShowComparison(!showComparison)}
          className="gap-2"
        >
          <Shuffle className="w-5 h-5" />
          {showComparison ? 'Hide Alternative Equipment' : 'Add Alternative Equipment'}
        </Button>
      </div>

      {/* ========== ALTERNATIVE EQUIPMENT SECTION ========== */}
      {showComparison && (
        <UICard className="border-2 border-dashed border-primary bg-black">
          <CardHeader>
            <CardTitle className="text-white">Select Alternative Equipment</CardTitle>
            <p className="text-sm text-gray-500">
              Choose different equipment for each phase to create a comparison configuration
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* ===== LOADING STATE ===== */}
            {loadingEquipment ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-white">Loading ship equipment...</span>
                <span className="text-sm text-gray-500">Ship ID: {selectedConfig?.ship_id}</span>
              </div>
            ) 
            
            
            : allShipEquipment.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-gray-500">No equipment found</p>
                <Button onClick={fetchAllShipEquipment} variant="outline" className="mt-4">
                  Retry Loading Equipment
                </Button>
              </div>
            ) 
            
            : (
              <>
                {(data.phases || []).map((phase: any, phaseIndex: number) => (
                  <div 
                    key={phaseIndex} 
                    className="border border-gray-800 rounded-lg overflow-hidden"
                  >
                    
                    {/* Phase Header */}
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

                    {/* Phase Content */}
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
                                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                        isSelected
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
                                        <div className="font-medium text-sm text-white">
                                          {equipment.nomenclature}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {equipment.name}
                                        </div>
                                        {isCurrent && (
                                          <Badge 
                                            variant="outline" 
                                            className="mt-1 text-xs border-gray-700 text-gray-400"
                                          >
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

                {/* Calculate Alternative Button */}
                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <Button
                    size="lg"
                    onClick={handleCompare}
                    disabled={comparing || Object.keys(selectedEquipment).length === 0}
                    className="gap-2"
                  >
                    {comparing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Calculate Alternative
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </UICard>
      )}
    </div>
  )
}