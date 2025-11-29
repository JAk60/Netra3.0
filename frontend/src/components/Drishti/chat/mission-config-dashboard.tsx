'use client'

import { listShipConfigurations } from '@/actions/mission_config/m_config'
import { Button } from "@/registry/new-york-v4/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Input } from "@/registry/new-york-v4/ui/input"
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { ChevronRight, Clock, Plus, Ship, Trash2 } from "lucide-react"
import { useEffect, useState } from 'react'
import React from 'react'

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

interface ConfigSelectionViewProps {
  onConfigSelect: (config: ShipConfiguration) => void
}

// Config Selection View - Groups configs by ship
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

  // Group configs by ship_name
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                          <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
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

interface ConfigBuilderViewProps {
  config: ShipConfiguration
  onBack: () => void
}

// Config Builder View - Phase selection UI
function ConfigBuilderView({ config, onBack }: ConfigBuilderViewProps) {
  const [selectedPhases, setSelectedPhases] = useState<MissionPhase[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Extract unique phase names from the config
  const availablePhases = React.useMemo(() => {
    if (!config.configuration?.configuration) return []
    
    const uniquePhases = new Set<string>()
    const systems = config.configuration.configuration
    
    // Iterate through all systems (propulsion, power_generation, support, firing)
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

    // Build optimized systems object
    const systems: any = {}
    if (config.configuration?.configuration) {
      Object.entries(config.configuration.configuration).forEach(([systemKey, system]) => {
        systems[systemKey] = {
          system_id: system.system_id,
          selected_equipment: system.selected_equipment.map((eq: any) => ({
            component_id: eq.id,
            name: eq.name,
            nomenclature: eq.nomenclature
          }))
        }
      })
    }

    // Build optimized phases with system configs (k/n values)
    const optimizedPhases = selectedPhases.map(({ id, ...phase }) => {
      const phaseWithSystemConfigs: any = { ...phase }
      
      // Add k/n values for each system for this phase
      if (config.configuration?.configuration) {
        Object.entries(config.configuration.configuration).forEach(([systemKey, system]) => {
          const systemPhase = system.phases.find((p: any) => p.phase_name === phase.phase_name)
          if (systemPhase) {
            phaseWithSystemConfigs[systemKey] = {
              k: systemPhase.k,
              n: systemPhase.n
            }
          }
        })
      }
      
      return phaseWithSystemConfigs
    })

    const missionConfig = {
      config_id: config.id,
      config_name: config.config_name,
      ship_id: config.ship_id,
      ship_name: config.ship_name,
      total_duration: totalDuration,
      created_at: new Date().toISOString(),
      phases: optimizedPhases,
      systems: systems
    }

    console.log('Optimized Mission Configuration:', JSON.stringify(missionConfig, null, 2))
    alert('✅ Mission configuration logged to console!')
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
                No phases available in this configuration
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
                disabled={selectedPhases.length === 0}
                className="gap-2"
              >
                Submit Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface MissionConfigDashboardProps {
  onClose?: () => void
}

export default function MissionConfigDashboard({ onClose }: MissionConfigDashboardProps) {
  const [view, setView] = useState<'selection' | 'builder'>('selection')
  const [selectedConfig, setSelectedConfig] = useState<ShipConfiguration | null>(null)

  const handleConfigSelect = (config: ShipConfiguration) => {
    setSelectedConfig(config)
    setView('builder')
  }

  const handleBack = () => {
    setView('selection')
    setSelectedConfig(null)
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle>Mission Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        {view === 'selection' ? (
          <ConfigSelectionView onConfigSelect={handleConfigSelect} />
        ) : (
          selectedConfig && (
            <ConfigBuilderView config={selectedConfig} onBack={handleBack} />
          )
        )}
      </CardContent>
    </Card>
  )
}