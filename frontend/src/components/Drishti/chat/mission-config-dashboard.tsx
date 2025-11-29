import { listShipConfigurations } from '@/actions/mission_config/m_config'
import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Checkbox } from "@/registry/new-york-v4/ui/checkbox"
import { Input } from "@/registry/new-york-v4/ui/input"
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Loader2,
  Plus,
  Shield,
  Ship,
  Shuffle,
  Trash2,
  TrendingUp
} from "lucide-react"
import React, { useEffect, useState } from 'react'

// Mission phase type
interface MissionPhase {
  id: string
  phase_name: string
  duration_hours: number
  sequence_order: number
}

// Ship Configuration type
interface ShipConfiguration {
  id: string
  config_name: string
  ship_id: string
  ship_name: string
  created_date: string
  configuration?: {
    configuration?: {
      [key: string]: {
        system_id: string
        selected_equipment: any[]
        phases: Array<{
          phase_number: number
          phase_name: string
          k: number
          n: number
        }>
      }
    }
  }
}

// ===================== CONFIG SELECTION VIEW =====================
interface ConfigSelectionViewProps {
  onConfigSelect: (config: ShipConfiguration) => void
}

function ConfigSelectionView({ onConfigSelect }: ConfigSelectionViewProps) {
  const [configs, setConfigs] = useState<ShipConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true)
      const result = await listShipConfigurations()
      if (result.success && result.data) {
        setConfigs(result.data)
      }
      setLoading(false)
    }
    fetchConfigs()
  }, [])

  const groupedConfigs = configs.reduce((acc, config) => {
    const shipName = config.ship_name
    if (!acc[shipName]) {
      acc[shipName] = []
    }
    acc[shipName].push(config)
    return acc
  }, {} as Record<string, ShipConfiguration[]>)

  const handleNext = () => {
    const config = configs.find(c => c.id === selectedConfig)
    if (config) {
      onConfigSelect(config)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Select Mission Configuration</h3>
        <Button 
          onClick={handleNext} 
          disabled={!selectedConfig}
          className="gap-2"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedConfigs).map(([shipName, shipConfigs]) => (
          <div key={shipName} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Ship className="w-4 h-4" />
              {shipName}
            </div>
            
            <div className="grid gap-3">
              {shipConfigs.map((config) => (
                <Card
                  key={config.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedConfig === config.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedConfig(config.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{config.config_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(config.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedConfig === config.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No mission configurations found
        </div>
      )}
    </div>
  )
}

// ===================== CONFIG BUILDER VIEW =====================
interface ConfigBuilderViewProps {
  config: ShipConfiguration
  onBack: () => void
  onSubmit: (payload: any) => void
  isSubmitting: boolean
}

function ConfigBuilderView({ config, onBack, onSubmit, isSubmitting }: ConfigBuilderViewProps) {
  const [selectedPhases, setSelectedPhases] = useState<MissionPhase[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const availablePhases = React.useMemo(() => {
    if (!config.configuration?.configuration) return []
    
    const uniquePhases = new Set<string>()
    const systems = config.configuration.configuration
    
    Object.values(systems).forEach((system: any) => {
      if (system.phases && Array.isArray(system.phases)) {
        system.phases.forEach((phase: any) => {
          if (phase.phase_name) {
            uniquePhases.add(phase.phase_name)
          }
        })
      }
    })
    
    return Array.from(uniquePhases).sort()
  }, [config.configuration])

  const addPhase = (phaseName: string) => {
    const newPhase: MissionPhase = {
      id: `${Date.now()}-${Math.random()}`,
      phase_name: phaseName,
      duration_hours: 0,
      sequence_order: selectedPhases.length
    }
    setSelectedPhases([...selectedPhases, newPhase])
  }

  const removePhase = (id: string) => {
    setSelectedPhases(selectedPhases.filter(p => p.id !== id))
    const newErrors = { ...errors }
    delete newErrors[id]
    setErrors(newErrors)
  }

  const updateDuration = (id: string, duration: string) => {
    const value = parseFloat(duration)
    setSelectedPhases(
      selectedPhases.map(p =>
        p.id === id ? { ...p, duration_hours: value || 0 } : p
      )
    )
    
    if (value > 0) {
      const newErrors = { ...errors }
      delete newErrors[id]
      setErrors(newErrors)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(selectedPhases)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      sequence_order: index
    }))

    setSelectedPhases(updatedItems)
  }

  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    selectedPhases.forEach(phase => {
      if (phase.duration_hours <= 0) {
        newErrors[phase.id] = 'Duration must be greater than 0'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (selectedPhases.length === 0) {
      alert('Please add at least one phase')
      return
    }

    const totalDuration = selectedPhases.reduce((sum, p) => sum + p.duration_hours, 0)

    // Build systems object
    const systems: any = {}
    let actualConfig = config.configuration?.configuration || {}
    
    Object.entries(actualConfig).forEach(([systemKey, system]) => {
      systems[systemKey] = {
        system_id: system.system_id,
        selected_equipment: system.selected_equipment.map((eq: any) => ({
          component_id: eq.id || eq.component_id,
          name: eq.name || eq.component_name,
          nomenclature: eq.nomenclature
        }))
      }
    })

    // Build phases with system configs
    const optimizedPhases = selectedPhases.map(({ id, ...phase }) => {
      const phaseWithSystemConfigs: any = { ...phase }
      
      Object.entries(actualConfig).forEach(([systemKey, system]) => {
        const systemPhase = system.phases.find((p: any) => p.phase_name === phase.phase_name)
        if (systemPhase) {
          phaseWithSystemConfigs[systemKey] = {
            k: systemPhase.k,
            n: systemPhase.n
          }
        }
      })
      
      return phaseWithSystemConfigs
    })

    const missionPayload = {
      config_id: config.id,
      config_name: config.config_name,
      ship_id: config.ship_id,
      ship_name: config.ship_name,
      total_duration: totalDuration,
      created_at: new Date().toISOString(),
      phases: optimizedPhases,
      systems: systems
    }

    console.log('📤 Submitting mission configuration:', missionPayload)
    onSubmit(missionPayload)
  }

  const totalDuration = selectedPhases.reduce((sum, p) => sum + p.duration_hours, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{config.config_name}</h3>
          <p className="text-sm text-muted-foreground">{config.ship_name}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Phases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availablePhases.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No phases available
              </div>
            ) : (
              availablePhases.map((phase) => (
                <Button
                  key={phase}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => addPhase(phase)}
                >
                  <Plus className="w-4 h-4" />
                  {phase}
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mission Sequence</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Total: {totalDuration}h
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedPhases.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No phases selected</p>
                <p className="text-sm mt-1">Click phases from the sidebar to add them</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="phases">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {selectedPhases.map((phase, index) => (
                        <Draggable key={phase.id} draggableId={phase.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center gap-4 p-4 border rounded-lg bg-card ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="text-sm font-medium text-muted-foreground w-8">
                                  #{index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{phase.phase_name}</p>
                                </div>
                                <div className="w-32">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    placeholder="Hours"
                                    value={phase.duration_hours || ''}
                                    onChange={(e) => updateDuration(phase.id, e.target.value)}
                                    className={errors[phase.id] ? 'border-red-500' : ''}
                                  />
                                  {errors[phase.id] && (
                                    <p className="text-xs text-red-500 mt-1">{errors[phase.id]}</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePhase(phase.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                onClick={validateAndSubmit}
                disabled={selectedPhases.length === 0 || isSubmitting}
                className="gap-2"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Submit Configuration
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ===================== RELIABILITY RESULTS VIEW =====================
interface ReliabilityResultsViewProps {
  reliabilityData: any
  onBack: () => void
}


interface ReliabilityResultsViewProps {
  reliabilityData: any
  onBack: () => void
  selectedConfig?: any
}

function ReliabilityResultsView({ reliabilityData, onBack, selectedConfig }: ReliabilityResultsViewProps) {
  const [showComparison, setShowComparison] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Record<string, string[]>>({})
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({})
  const [comparing, setComparing] = useState(false)

  const data = reliabilityData?.data || reliabilityData

  const availableEquipment = Object.keys(data.equipment_final_ages || {})

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

  const toggleEquipmentSelection = (phaseIndex: number, equipment: string) => {
    setSelectedEquipment(prev => {
      const phaseKey = `phase_${phaseIndex}`
      const current = prev[phaseKey] || []
      
      if (current.includes(equipment)) {
        return {
          ...prev,
          [phaseKey]: current.filter(eq => eq !== equipment)
        }
      } else {
        return {
          ...prev,
          [phaseKey]: [...current, equipment]
        }
      }
    })
  }

  const togglePhaseExpansion = (phaseIndex: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseIndex]: !prev[phaseIndex]
    }))
  }

  const handleCompare = async () => {
    setComparing(true)
    console.log('🔄 Comparing with selected equipment:', selectedEquipment)
    
    try {
      // Get the original payload that was submitted
      if (!selectedConfig) {
        throw new Error('No configuration selected')
      }

      // Build the original payload from the config
      const totalDuration = data.total_duration
      
      // We need to reconstruct the original payload
      // For now, we'll just log it and show a message
      // You can enhance this to actually call the comparison API
      
      const response = await fetch('http://localhost:8000/api/mission-reliability/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_config: {
            config_id: data.config_id,
            config_name: data.config_name,
            ship_id: selectedConfig.ship_id,
            ship_name: data.ship_name,
            total_duration: totalDuration,
            // Add other required fields from the original submission
          },
          alternative_equipment: selectedEquipment
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Comparison failed')
      }
      
      const result = await response.json()
      console.log('✅ Comparison result:', result)
      
      // TODO: Show comparison results in a new view or modal
      alert('Comparison feature is under development. Check console for results.')
      
    } catch (error) {
      console.error('Error comparing configurations:', error)
      alert(`Comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setComparing(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Configurations
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{data.config_name}</h1>
          <p className="text-gray-500 mt-1">{data.ship_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Duration</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {data.total_duration}h
            </div>
          </div>
        </div>
      </div>

      <Card className="border-2 border-primary shadow-lg bg-gray-900">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Shield className="w-6 h-6 text-primary" />
              Mission Reliability
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
      </Card>

      <Card className="bg-black border-gray-800">
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
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => setShowComparison(!showComparison)}
          className="gap-2"
        >
          <Shuffle className="w-5 h-5" />
          {showComparison ? 'Hide Comparison' : 'Choose to Differ'}
        </Button>
      </div>

      {showComparison && (
        <Card className="border-2 border-dashed border-primary bg-black">
          <CardHeader>
            <CardTitle className="text-white">Compare Different Equipment Configurations</CardTitle>
            <p className="text-sm text-gray-500">
              Select alternative equipment for each phase to compare reliability outcomes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <div className="p-4 bg-black">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableEquipment.map((equipment, eqIndex) => {
                        const isSelected = (selectedEquipment[`phase_${phaseIndex}`] || []).includes(equipment)
                        const isCritical = getPhaseCriticalEquipment(phase).includes(equipment)
                        
                        return (
                          <div
                            key={eqIndex}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-primary/10 border-primary'
                                : isCritical
                                ? 'bg-green-900/30 border-green-700'
                                : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <Checkbox
                              id={`${phaseIndex}-${equipment}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleEquipmentSelection(phaseIndex, equipment)}
                            />
                            <label
                              htmlFor={`${phaseIndex}-${equipment}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium text-sm text-white">{equipment}</div>
                              <div className="text-xs text-gray-500">
                                Age: {data.equipment_final_ages[equipment]}h
                              </div>
                              {isCritical && (
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
                )}
              </div>
            ))}

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
                    Compare Reliability
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


// ===================== MAIN DASHBOARD =====================
export default function IntegratedMissionConfigDashboard() {
  const [view, setView] = useState<'selection' | 'builder' | 'results'>('selection')
  const [selectedConfig, setSelectedConfig] = useState<ShipConfiguration | null>(null)
  const [reliabilityData, setReliabilityData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfigSelect = (config: ShipConfiguration) => {
    setSelectedConfig(config)
    setView('builder')
  }

  const handleBack = () => {
    if (view === 'results') {
      setView('selection')
      setReliabilityData(null)
    } else {
      setView('selection')
      setSelectedConfig(null)
    }
  }

  const handleSubmit = async (payload: any) => {
    setIsSubmitting(true)
    
    try {
      // Use the correct API endpoint
      const response = await fetch('http://localhost:8000/api/mission-reliability/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to calculate reliability')
      }
      
      const result = await response.json()
      console.log('✅ Mission reliability result:', result)
      setReliabilityData(result)
      setView('results')
    } catch (error) {
      console.error('Error submitting mission:', error)
      alert(`Failed to calculate mission reliability: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mission Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        {view === 'selection' && (
          <ConfigSelectionView onConfigSelect={handleConfigSelect} />
        )}
        
        {view === 'builder' && selectedConfig && (
          <ConfigBuilderView 
            config={selectedConfig} 
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        
        {view === 'results' && reliabilityData && (
          <ReliabilityResultsView 
            reliabilityData={reliabilityData}
            onBack={handleBack}
          />
        )}
      </CardContent>
    </Card>
  )
}