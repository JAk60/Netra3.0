import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { useState } from 'react'
import ConfigSelectionView from "../mission_config/chat/config_selection_view"
import ReliabilityResultsView from "../mission_config/chat/reliability_result_view"
import ConfigBuilderView from "../mission_config/chat/config_builder_view"


// ===================== TYPES =====================

// Mission phase type
export interface MissionPhase {
  id: string
  phase_name: string
  duration_hours: number
  sequence_order: number
}

// Ship Configuration type
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