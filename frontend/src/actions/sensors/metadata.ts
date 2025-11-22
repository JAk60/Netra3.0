// actions/failure-modes-analysis.ts
'use server'

import { revalidatePath } from "next/cache";

export interface Sensor {
  sensor_name: string;
  unit: string;
  min_value: number;
  max_value: number;
  frequency: number;
  P: number;
  F: number;
  component_id: string;
  sensor_id: string;
  failure_mode_id: string;
}

export interface FailureMode {
  id: string;
  severity: string;
  sensor_count: number;
  sensors: Sensor[];
}

export interface FailureModesAnalysisData {
  Total_failure_modes_count: number;
  Total_sensors_count: number;
  alerted_sensors: number;
  sensors_without_failure_modes: number;
  data: Record<string, FailureMode>;
}

// Transformed types for UI
export interface Stats {
  totalFailureModes: number;
  totalSensors: number;
  alertedSensors: number;
  sensorsWithoutFailureModes: number;
}

export interface FailureModeUI {
  id: string;
  name: string;
  severity: string;
  sensors: number;
}

export interface SensorUI {
  id: string;
  name: string;
  unit: string;
  range: string;
  frequency: string;
  failureMode: string;
  status: 'alert' | 'normal';
  P: number;
  F: number;
}

export interface TransformedAnalysisData {
  stats: Stats;
  failureModes: FailureModeUI[];
  sensors: SensorUI[];
}

function transformAnalysisData(data: FailureModesAnalysisData): TransformedAnalysisData {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    console.error('❌ Invalid data structure:', data);
    throw new Error('Invalid response structure from backend');
  }

  if (!data.data || typeof data.data !== 'object') {
    console.error('❌ Missing or invalid data.data:', data);
    throw new Error('Backend response missing failure modes data');
  }

  // Extract stats
  const stats: Stats = {
    totalFailureModes: data.Total_failure_modes_count || 0,
    totalSensors: data.Total_sensors_count || 0,
    alertedSensors: data.alerted_sensors || 0,
    sensorsWithoutFailureModes: data.sensors_without_failure_modes || 0,
  };

  // Transform failure modes
  const failureModes: FailureModeUI[] = Object.entries(data.data).map(([name, mode]) => ({
    id: mode.id,
    name: name,
    severity: mode.severity,
    sensors: mode.sensor_count,
  }));

  // Transform sensors (flatten from all failure modes)
  const sensors: SensorUI[] = Object.entries(data.data).flatMap(([failureModeName, mode]) =>
    mode.sensors.map(sensor => ({
      id: sensor.sensor_id,
      name: sensor.sensor_name,
      unit: sensor.unit,
      range: `${sensor.min_value}-${sensor.max_value}`,
      frequency: `${sensor.frequency}s`,
      failureMode: failureModeName,
      status: (sensor.P > 0 || sensor.F > 0) ? 'alert' : 'normal',
      P: sensor.P,
      F: sensor.F,
    }))
  );

  return { stats, failureModes, sensors };
}

export async function getFailureModesAnalysis(
  componentId: string
): Promise<TransformedAnalysisData> {
  // Use environment variable with fallback
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
  
  try {
    const url = new URL(`${BACKEND_URL}/sensors/ans`);
    url.searchParams.append('component_id', componentId);

    console.log('🔍 Fetching from:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error response:', errorText);
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const analysisResponse = await response.json();
    console.log('📦 Raw API response:', JSON.stringify(analysisResponse, null, 2));
    
    // Check if response has the expected structure
    if (!analysisResponse || typeof analysisResponse !== 'object') {
      console.error('❌ Unexpected response structure:', analysisResponse);
      throw new Error('Backend returned unexpected response structure');
    }
    
    console.log('✅ Successfully fetched and parsed data');
    
    // The API returns the data directly, not wrapped in { data: ... }
    return transformAnalysisData(analysisResponse);
  } catch (error) {
    console.error('💥 Error in getFailureModesAnalysis:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      throw new Error('Cannot connect to backend API at port 8000. Is your backend server running?');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to fetch failure modes analysis');
  }
}


interface CreateSensorData {
    sensor_name: string;
    unit?: string;
    min_value: number;
    max_value: number;
    frequency?: number | null;
    P?: number | null;
    F?: number | null;
    component_id: string;
    failure_mode_id?: string;
}

export async function createSensor(data: CreateSensorData) {
    try {
        const response = await fetch('http://localhost:8000/sensors/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store'
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.detail || 'Failed to create sensor'
            };
        }

        const sensor = await response.json();
        
        // Revalidate the page to show new sensor
        revalidatePath('/sensors'); // Adjust path as needed
        
        return {
            success: true,
            data: sensor
        };
    } catch (error) {
        console.error('Error creating sensor:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create sensor'
        };
    }
}