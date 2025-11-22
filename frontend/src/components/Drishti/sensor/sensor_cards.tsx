import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { AlertCircle, CheckCircle, Settings, Activity } from 'lucide-react';

interface Stats {
  totalFailureModes: number;
  totalSensors: number;
  alertedSensors: number;
  sensorsWithoutFailureModes: number;
}

interface SensorCardsProps {
  stats?: Stats;
  loading?: boolean;
}

export default function Sensor_cards({ stats, loading = false }: SensorCardsProps) {
  // Show loading state or placeholder values
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
              <div className="w-4 h-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Default values when no stats available
  const displayStats = stats || {
    totalFailureModes: 0,
    totalSensors: 0,
    alertedSensors: 0,
    sensorsWithoutFailureModes: 0,
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Failure Modes
          </CardTitle>
          <AlertCircle className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.totalFailureModes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total identified modes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Sensors
          </CardTitle>
          <Settings className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.totalSensors}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Monitoring equipment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Alerts
          </CardTitle>
          <AlertCircle className="w-4 h-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${displayStats.alertedSensors > 0 ? 'text-red-600' : ''}`}>
            {displayStats.alertedSensors}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sensors with alerts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unassigned Sensors
          </CardTitle>
          <Activity className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.sensorsWithoutFailureModes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Without failure modes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}