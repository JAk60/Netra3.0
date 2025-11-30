import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { useState } from 'react'
import ConfigBuilderView from "../mission_config/chat/config_builder_view"
import ConfigSelectionView from "../mission_config/chat/config_selection_view"
import ReliabilityResultsView from "../mission_config/chat/reliability_result_view"

// frontend/src/components/Drishti/mission_config/chat/mission-config-dashboard.tsx
import { saveComparison, StoredComparison } from '@/actions/mission_config/batch_comparison'
import { Button } from "@/registry/new-york-v4/ui/button"
import { Table } from "lucide-react"
import { toast } from 'sonner'
import ComparisonTableView from "../mission_config/chat/comparison_table_view"

// ===================== TYPES =====================

export interface MissionPhase {
  id: string
  phase_name: string
  duration_hours: number
  sequence_order: number
}

export interface ShipConfiguration {
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

// ===================== MAIN DASHBOARD =====================
export default function IntegratedMissionConfigDashboard() {
  const [view, setView] = useState<'selection' | 'builder' | 'results' | 'table'>('selection')
  const [selectedConfig, setSelectedConfig] = useState<ShipConfiguration | null>(null)
  const [reliabilityData, setReliabilityData] = useState<any>(null)
  const [currentComparisonId, setCurrentComparisonId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfigSelect = (config: ShipConfiguration) => {
    setSelectedConfig(config)
    setView('builder')
  }

  const handleBack = () => {
    if (view === 'results') {
      setView('selection')
      setReliabilityData(null)
      setCurrentComparisonId(null)
    } else if (view === 'table') {
      setView('selection')
    } else {
      setView('selection')
      setSelectedConfig(null)
    }
  }

  const handleSubmit = async (payload: any, comparisonId: string) => {
    setIsSubmitting(true)
    
    try {
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
      
      // CREATE STORED COMPARISON WITH ORIGINAL RESULT
      const newComparison: StoredComparison = {
        id: comparisonId,
        config_id: payload.config_id,
        config_name: payload.config_name,
        ship_id: payload.ship_id,
        ship_name: payload.ship_name,
        total_duration: payload.total_duration,
        original: {
          mission_reliability: result.data.mission_reliability,
          phases: result.data.phases,
          equipment_final_ages: result.data.equipment_final_ages,
          calculated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
      
      // SAVE TO LOCALSTORAGE
      const saved = await saveComparison(newComparison)
      
      if (saved) {
        toast.success('Original calculation saved!')
        setReliabilityData(result)
        setCurrentComparisonId(comparisonId)
        setView('results')
      } else {
        toast.error('Failed to save comparison')
      }
      
    } catch (error) {
      console.error('Error submitting mission:', error)
      toast.error(`Failed to calculate mission reliability: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mission Configuration</CardTitle>
          {view === 'selection' && (
            <Button
              variant="outline"
              onClick={() => setView('table')}
              className="gap-2"
            >
              <Table className="w-4 h-4" />
              View Comparisons
            </Button>
          )}
        </div>
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
        
        {view === 'results' && reliabilityData && selectedConfig && currentComparisonId && (
          <ReliabilityResultsView 
            reliabilityData={reliabilityData}
            onBack={handleBack}
            selectedConfig={selectedConfig}
            comparisonId={currentComparisonId}
          />
        )}
        
        {view === 'table' && (
          <ComparisonTableView onBack={handleBack} />
        )}
      </CardContent>
    </Card>
  )
}