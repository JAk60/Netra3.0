import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Equipment {
  nomenclature: string
  system: string
  reliability: number
  alpha: number
  beta: number
  age_before: number
  age_after: number
  duration: number
  is_reused: boolean
}

interface Phase {
  phase_name: string
  sequence: number
  duration_hours: number
  phase_reliability: number
  equipment?: Equipment[]
  systems?: any
}

interface ComparisonResult {
  comparison_id: string
  config_name: string
  ship_name: string
  mission_reliability: number
  total_duration: number
  phases: Phase[]
  equipment_final_ages: Record<string, number>
}

interface OriginalConfig {
  config_id: string
  config_name: string
  ship_name: string
  total_duration: number
  mission_reliability: number
  phases: Phase[]
  equipment_final_ages: Record<string, number>
}

interface ComparisonResultsTableProps {
  originalConfig: OriginalConfig
  results: ComparisonResult[]
}

export default function ComparisonResultsTable({
  originalConfig,
  results
}: ComparisonResultsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  // Extract equipment from original config
  const getOriginalEquipment = () => {
    const equipment: Array<{ nomenclature: string; reliability: number | null; system: string }> = []
    
    if (!originalConfig || !originalConfig.phases) {
      return equipment
    }
    
    originalConfig.phases.forEach(phase => {
      const systems = phase.systems || {}
      
      Object.entries(systems).forEach(([systemKey, systemData]: [string, any]) => {
        const criticalEquipment = systemData?.critical_equipment || []
        const systemReliability = systemData?.reliability
        
        criticalEquipment.forEach((nomenclature: string) => {
          equipment.push({
            nomenclature,
            reliability: systemReliability,
            system: systemKey
          })
        })
      })
    })
    
    return equipment
  }

  // Extract equipment from comparison result
  const getAlternateEquipment = (result: ComparisonResult) => {
    const equipment: Array<{ nomenclature: string; reliability: number }> = []
    
    result.phases?.forEach(phase => {
      if (phase.equipment && Array.isArray(phase.equipment)) {
        phase.equipment.forEach((eq: Equipment) => {
          equipment.push({
            nomenclature: eq.nomenclature,
            reliability: eq.reliability
          })
        })
      }
    })
    
    return equipment
  }

  const getReliabilityDelta = (original: number, alternative: number) => {
    if (!original) {
      return {
        delta: 'N/A',
        isPositive: false,
        isNegative: false,
        color: 'text-gray-400'
      }
    }
    
    const delta = alternative - original
    const deltaPercent = (delta * 100).toFixed(2)
    const isPositive = delta > 0
    const isNegative = delta < 0
    
    return {
      delta: deltaPercent,
      isPositive,
      isNegative,
      color: isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400'
    }
  }

  const originalEquipment = getOriginalEquipment()
  
  // Debug logging
  console.log('originalConfig:', originalConfig)
  console.log('originalEquipment:', originalEquipment)

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Comparison Results</h2>
          <p className="text-gray-500 text-sm mt-1">Click on any row to view equipment comparison</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 w-12"></th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Configuration Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Original Reliability</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Alternative Reliability</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Change</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Equipment Count</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => {
                const alternateEquipment = getAlternateEquipment(result)
                const delta = getReliabilityDelta(originalConfig?.mission_reliability, result.mission_reliability)
                const isExpanded = expandedRows.has(result.comparison_id)
                
                return (
                  <>
                    <tr
                      key={result.comparison_id}
                      onClick={() => toggleRow(result.comparison_id)}
                      className="border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="py-4 px-6 text-white font-medium">{result.config_name}</td>
                      <td className="py-4 px-6">
                        <span className="text-white font-semibold">{originalConfig ? formatPercent(originalConfig.mission_reliability) : 'N/A'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white font-semibold">{formatPercent(result.mission_reliability)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-medium ${delta.color}`}>
                          {delta.isPositive && '+'}{delta.delta}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {alternateEquipment.length} items
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="bg-black p-0">
                          <div className="p-6">
                            <h4 className="text-sm font-semibold text-gray-400 mb-4">
                              Equipment Comparison
                            </h4>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Original Equipment Table */}
                              <div>
                                <h5 className="text-white font-medium mb-3">Original Configuration</h5>
                                <div className="text-xs text-gray-500 mb-2">
                                  Note: Reliability shown is the system-level value (combined equipment)
                                </div>
                                <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-gray-800 border-b border-gray-700">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Nomenclature</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">System Reliability</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {originalEquipment.length > 0 ? (
                                        originalEquipment.map((eq, idx) => (
                                          <tr key={idx} className="border-b border-gray-800 last:border-0">
                                            <td className="py-3 px-4 text-white text-sm">{eq.nomenclature}</td>
                                            <td className="py-3 px-4 text-gray-300 text-sm font-mono">
                                              {eq.reliability !== null ? formatPercent(eq.reliability) : 'N/A'}
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={2} className="py-6 text-center text-gray-500 text-sm">
                                            No equipment configured
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Alternate Equipment Table */}
                              <div>
                                <h5 className="text-white font-medium mb-3">Alternate Configuration</h5>
                                <div className="text-xs text-gray-500 mb-2">
                                  Reliability shown is the individual equipment value
                                </div>
                                <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-gray-800 border-b border-gray-700">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Nomenclature</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Equipment Reliability</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {alternateEquipment.length > 0 ? (
                                        alternateEquipment.map((eq, idx) => (
                                          <tr key={idx} className="border-b border-gray-800 last:border-0">
                                            <td className="py-3 px-4 text-white text-sm">{eq.nomenclature}</td>
                                            <td className="py-3 px-4 text-gray-300 text-sm font-mono">
                                              {formatPercent(eq.reliability)}
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={2} className="py-6 text-center text-gray-500 text-sm">
                                            No equipment configured
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No comparison results available</p>
          </div>
        )}
      </div>
    </div>
  )
}