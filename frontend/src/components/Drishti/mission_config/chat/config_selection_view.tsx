import { listShipConfigurations } from "@/actions/mission_config/m_config"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Card, CardContent } from "@/registry/new-york-v4/ui/card"
import {
    CheckCircle2,
    ChevronRight,
    Loader2,
    Ship
} from "lucide-react"
import { useEffect, useState } from "react"
import { ShipConfiguration } from "../../chat/mission-config-dashboard"
// ===================== CONFIG SELECTION VIEW =====================
interface ConfigSelectionViewProps {
  onConfigSelect: (config: ShipConfiguration) => void
}

export default function ConfigSelectionView({ onConfigSelect }: ConfigSelectionViewProps) {
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