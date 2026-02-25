'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { AlertCircle, Settings, Activity } from 'lucide-react';

interface SensorUI {
  id: string;
  name: string;
  unit: string;
  min_value: number;
  max_value: number;
  frequency: number | null;
  failureMode: string | null;
  status: 'alert' | 'normal';
  P: number | null;
  F: number | null;
}

interface SensorCardsProps {
  sensors?: SensorUI[];
  loading?: boolean;
}

export default function Sensor_cards({
  sensors = [],
  loading = false
}: SensorCardsProps) {

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Loading...
              </CardTitle>
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

  // 🔥 Compute stats dynamically
  const totalSensors = sensors.length;

  const totalFailureModes = new Set(
    sensors
      .filter(s => s.failureMode)
      .map(s => s.failureMode)
  ).size;

  const alertedSensors = sensors.filter(
    s => s.status === 'alert'
  ).length;

  const sensorsWithoutFailureModes = sensors.filter(
    s => !s.failureMode
  ).length;

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
          <div className="text-2xl font-bold">{totalFailureModes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Unique assigned modes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Sensors
          </CardTitle>
          <Settings className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSensors}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Monitoring equipment
          </p>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Alerts
          </CardTitle>
          <AlertCircle className="w-4 h-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${alertedSensors > 0 ? 'text-red-600' : ''}`}>
            {alertedSensors}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sensors in alert state
          </p>
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unassigned Sensors
          </CardTitle>
          <Activity className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sensorsWithoutFailureModes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Without failure modes
          </p>
        </CardContent>
      </Card>

    </div>
  );
}