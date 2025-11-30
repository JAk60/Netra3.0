import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react"
import React from "react"
import { useState } from 'react'

interface ComparisonResultsViewProps {
  batchResults: any
  originalReliability: number
  onBack: () => void
}

export default function ComparisonResultsView({
  batchResults,
  originalReliability,
  onBack
}: ComparisonResultsViewProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const toggleRow = (comparisonId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [comparisonId]: !prev[comparisonId]
    }))
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const calculateDelta = (original: number, alternative: number) => {
    const delta = ((alternative - original) * 100)
    return {
      value: delta,
      display: `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%`,
      isPositive: delta >= 0
    }
  }

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 0.95) return 'bg-green-100 text-green-800'
    if (reliability >= 0.90) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const results = batchResults?.results || []

  return (
    <div className="w-full space-y-6">
      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Configuration
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Comparison Results</h1>
          <p className="text-gray-500 mt-1">{results.length} configurations analyzed</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Original Reliability</div>
          <Badge className={getReliabilityColor(originalReliability)} style={{fontSize: '1.25rem', padding: '0.5rem 1rem'}}>
            {formatPercent(originalReliability)}
          </Badge>
        </div>
      </div>

      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5" />
            Configuration Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Configuration</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Original</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Alternative</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Delta</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Duration</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result: any) => {
                  const delta = calculateDelta(originalReliability, result.mission_reliability)
                  const isExpanded = expandedRows[result.comparison_id]

                  return (
                    <React.Fragment key={result.comparison_id}>
                      <tr className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{result.config_name}</div>
                          <div className="text-xs text-gray-500">{result.ship_name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getReliabilityColor(originalReliability)}>
                            {formatPercent(originalReliability)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getReliabilityColor(result.mission_reliability)}>
                            {formatPercent(result.mission_reliability)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center gap-1 font-semibold ${
                            delta.isPositive ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {delta.isPositive ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {delta.display}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-4 h-4" />
                            {result.total_duration}h
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(result.comparison_id)}
                            className="gap-2"
                          >
                            {isExpanded ? (
                              <>
                                Hide Details <ChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                View Details <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-gray-950 p-6">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white mb-4">Phase-by-Phase Analysis</h4>
                              
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-gray-800">
                                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-500">Phase</th>
                                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-500">Duration</th>
                                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-500">Reliability</th>
                                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-500">Equipment</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {result.phases.map((phase: any, idx: number) => (
                                      <tr key={idx} className="border-b border-gray-800">
                                        <td className="py-2 px-3">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono text-xs border-gray-700">
                                              #{phase.sequence + 1}
                                            </Badge>
                                            <span className="text-sm text-white">{phase.phase_name}</span>
                                          </div>
                                        </td>
                                        <td className="py-2 px-3 text-sm text-gray-400">
                                          {phase.duration_hours}h
                                        </td>
                                        <td className="py-2 px-3">
                                          <Badge className={getReliabilityColor(phase.phase_reliability)} style={{fontSize: '0.75rem'}}>
                                            {formatPercent(phase.phase_reliability)}
                                          </Badge>
                                        </td>
                                        <td className="py-2 px-3">
                                          <div className="flex flex-wrap gap-1">
                                            {phase.equipment.slice(0, 5).map((eq: any, eqIdx: number) => (
                                              <Badge 
                                                key={eqIdx} 
                                                variant="secondary" 
                                                className="text-xs bg-gray-800 text-gray-300"
                                              >
                                                {eq.nomenclature}
                                              </Badge>
                                            ))}
                                            {phase.equipment.length > 5 && (
                                              <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                                                +{phase.equipment.length - 5} more
                                              </Badge>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No comparison results available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}