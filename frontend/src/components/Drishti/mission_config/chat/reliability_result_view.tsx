import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
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
import { useState } from 'react'
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

export default function ReliabilityResultsView({ reliabilityData, onBack, selectedConfig }: ReliabilityResultsViewProps) {
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
