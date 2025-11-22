import React, { useState, useTransition } from 'react';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Checkbox } from '@/registry/new-york-v4/ui/checkbox';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { CheckCircle, AlertTriangle, Activity, Loader2 } from 'lucide-react';
import { addSensorReading } from '@/actions/sensors/addReading';
import { toast } from 'sonner';
import { Sensor } from '@/actions/sensors/metadata';




export default function AddSensorData({ sensors, componentId }: { sensors: Sensor[]; componentId: string | null }) {
  console.log('componentId', componentId)
  const [selectedSensorId, setSelectedSensorId] = useState('');
  const [value, setValue] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [isAlert, setIsAlert] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [readings, setReadings] = useState([
    { id: 1, timestamp: '10:30:15', value: 78.5, unit: '°C', hours: 1204, isAlert: false },
    { id: 2, timestamp: '10:30:16', value: 82.3, unit: '°C', hours: 1205, isAlert: true },
    { id: 3, timestamp: '10:30:17', value: 75.8, unit: '°C', hours: 1206, isAlert: false },
  ]);

  const selectedSensor = sensors.find(s => s.id === selectedSensorId);

  const handleAddReading = async () => {
    if (!selectedSensorId || !value || !operatingHours) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!componentId) {
      toast.error("Component ID is required");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addSensorReading(selectedSensorId, {
          value: parseFloat(value),
          operating_hours: parseInt(operatingHours),
          alert: isAlert,
          component_id: componentId,
          sensor_id: selectedSensorId,
        });

        if (result.success) {
          // Add to local state for immediate UI update
          const newReading = {
            id: readings.length + 1,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            value: parseFloat(value),
            unit: selectedSensor?.unit || '',
            hours: parseInt(operatingHours),
            isAlert: isAlert
          };

          setReadings([newReading, ...readings]);
          
          // Reset form
          setValue('');
          setOperatingHours('');
          setIsAlert(false);

          toast.success("Sensor reading added successfully");
        } else {
          toast.error(result.error || "Failed to add sensor reading");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const getSeverityColor = (status) => {
    return status === 'alert' ? 'text-amber-500' : 'text-green-500';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card className='flex flex-row gap-4 bg-muted/30 p-4'>
        <Card className='flex-1'>
          <CardHeader>
            <CardTitle>Add Sensor Reading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Sensor</Label>
              <Select value={selectedSensorId} onValueChange={setSelectedSensorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sensor" />
                </SelectTrigger>
                <SelectContent>
                  {sensors.map((sensor) => (
                    <SelectItem key={sensor.id} value={sensor.id}>
                      {sensor.name} ({sensor.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Value {selectedSensor && `(${selectedSensor.unit})`}</Label>
                <Input 
                  type="number" 
                  placeholder="78.5" 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Operating Hours</Label>
                <Input 
                  type="number" 
                  placeholder="1204"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="alert" 
                checked={isAlert}
                onCheckedChange={(checked) => setIsAlert(checked)}
              />
              <Label htmlFor="alert">Mark as alert</Label>
            </div>
            
            <Button className="w-full" onClick={handleAddReading} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Reading'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className='flex-1'>
          <CardHeader>
            <CardTitle>Sensor Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSensor ? (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Sensor Name</span>
                    <span className="font-semibold">{selectedSensor.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Unit</span>
                    <span className="font-semibold">{selectedSensor.unit}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Range</span>
                    <span className="font-semibold">{selectedSensor.range}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Failure Mode</span>
                    <span className="font-semibold">{selectedSensor.failureMode}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Status</span>
                    <span className={`font-semibold flex items-center gap-2 ${getSeverityColor(selectedSensor.status)}`}>
                      {selectedSensor.status === 'alert' ? (
                        <><AlertTriangle className="w-4 h-4" /> Alert</>
                      ) : (
                        <><Activity className="w-4 h-4" /> Normal</>
                      )}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">P Value</div>
                      <div className="text-2xl font-bold">{selectedSensor.P}</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">F Value</div>
                      <div className="text-2xl font-bold">{selectedSensor.F}</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a sensor to view metadata
              </div>
            )}
          </CardContent>
        </Card>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Recent Readings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {readings.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No readings yet. Add your first reading above.
            </div>
          ) : (
            readings.map((reading) => (
              <div key={reading.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm text-muted-foreground font-mono">{reading.timestamp}</span>
                <span className="font-semibold">{reading.value}{reading.unit}</span>
                <span className="text-sm text-muted-foreground">{reading.hours}h</span>
                {reading.isAlert ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}