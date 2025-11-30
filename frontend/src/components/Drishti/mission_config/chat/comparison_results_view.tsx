// frontend/src/components/Drishti/mission_config/chat/comparison_table_view.tsx
import { Button } from "@/registry/new-york-v4/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Badge } from "@/registry/new-york-v4/ui/badge"
import {
  ArrowLeft,
  Trash2,
  Download,
  AlertCircle,
  TrendingDown,
  TrendingUp
} from "lucide-react"
import { useEffect, useState } from 'react'
import {
  getSavedComparisons,
  deleteComparison,
  exportComparisons,
  type StoredComparison
} from '@/actions/mission_config/batch_comparison'
import { toast } from 'sonner'

interface ComparisonTableViewProps {
  onBack: () => void
}

export default function ComparisonTableView({ onBack }: ComparisonTableViewProps) {
  const [comparisons, setComparisons] = useState<StoredComparison[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComparisons()
  }, [])

  const loadComparisons = () => {
    setLoading(true)
    try {
      const data = getSavedComparisons() // No await - synchronous now
      setComparisons(data)
    } catch (error) {
      console.error('Error loading comparisons:', error)
      toast.error('Failed to load comparisons')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this comparison?')) return
    
    const success = deleteComparison(id) // No await
    if (success) {
      toast.success('Comparison deleted')
      loadComparisons()
    } else {
      toast.error('Failed to delete comparison')
    }
  }

  const handleExport = () => {
    exportComparisons() // No await
    toast.success('Comparisons exported')
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const getDelta = (comp: StoredComparison) => {
    if (!comp.alternative) return null
    return (comp.alternative.mission_reliability - comp.original.mission_reliability) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading comparisons...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export All
        </Button>
      </div>

      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Mission Comparisons</CardTitle>
          <p className="text-sm text-gray-500">
            {comparisons.length} comparison{comparisons.length !== 1 ? 's' : ''} saved
          </p>
        </CardHeader>
        <CardContent>
          {comparisons.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-600" />
              <p className="text-gray-500">No comparisons yet</p>
              <p className="text-sm text-gray-600">
                Calculate a mission configuration to create your first comparison
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500">Configuration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500">Ship</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500">Original</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500">Alternative</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500">Delta</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comp) => {
                    const delta = getDelta(comp)
                    
                    return (
                      <tr key={comp.id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-medium text-white">{comp.config_name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-400">{comp.ship_name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-400">{comp.total_duration}h</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-900/30 text-green-400 border-green-700">
                            {formatPercent(comp.original.mission_reliability)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {comp.alternative ? (
                            <Badge className="bg-blue-900/30 text-blue-400 border-blue-700">
                              {formatPercent(comp.alternative.mission_reliability)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-600">Not calculated</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {delta !== null ? (
                            <div className="flex items-center gap-1">
                              {delta < 0 ? (
                                <>
                                  <TrendingDown className="w-4 h-4 text-red-400" />
                                  <span className="text-red-400">{delta.toFixed(2)}%</span>
                                </>
                              ) : delta > 0 ? (
                                <>
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400">+{delta.toFixed(2)}%</span>
                                </>
                              ) : (
                                <span className="text-gray-500">0.00%</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-500">
                            {new Date(comp.timestamp).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(comp.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}