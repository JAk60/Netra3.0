'use server'

import { revalidatePath } from 'next/cache';

/* ================= TYPES ================= */

export interface Sensor {
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

export interface FailureModeUI {
  id: string;
  name: string;
  severity: string;
}

export interface SensorsResponse {
  sensors: Sensor[];
  failureModes: FailureModeUI[];
}

/* ================= FETCH ================= */

export async function getFailureModesAnalysis(componentId: string): Promise<SensorsResponse> {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

  const [sensorsResponse, failureModesResponse] = await Promise.all([
    fetch(`${BACKEND_URL}/sensors/component/${componentId}`, { cache: 'no-store' }),
    fetch(`${BACKEND_URL}/sensors/failuremodes/component/${componentId}`, { cache: 'no-store' }),
  ]);

  if (!sensorsResponse.ok) throw new Error('Failed to fetch sensors');

  const rawSensors = await sensorsResponse.json();
  const rawFailureModes = failureModesResponse.ok ? await failureModesResponse.json() : [];

  const sensors: Sensor[] = rawSensors.map((sensor: any) => ({
    id: sensor.sensor_id,
    name: sensor.sensor_name,
    unit: sensor.unit,
    min_value: sensor.min_value,
    max_value: sensor.max_value,
    frequency: sensor.frequency ?? null,
    failureMode: sensor.failure_mode?.name ?? null,
    status: (sensor.P > 0 || sensor.F > 0) ? 'alert' : 'normal',
    P: sensor.P ?? null,
    F: sensor.F ?? null,
  }));

  // Now uses ALL failure modes for the component, not just ones already linked to sensors
  const failureModes: FailureModeUI[] = rawFailureModes.map((fm: any) => ({
    id: fm.failure_mode_id,
    name: fm.name,
    severity: fm.severity,
  }));

  return { sensors, failureModes };
}

/* ================= CREATE ================= */

interface CreateSensorData {
  sensor_name: string;
  unit?: string;
  min_value: number;
  max_value: number;
  frequency?: number | null;
  P?: number | null;
  F?: number | null;
  component_id: string;
  failure_mode_id?: string | null;
}

export async function createSensor(data: CreateSensorData) {

  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

  const response = await fetch(
    `${BACKEND_URL}/sensors/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.detail };
  }

  revalidatePath('/');

  return { success: true };
}


export async function getFailureModesByComponent(componentId: string): Promise<FailureModeUI[]> {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
  
  const response = await fetch(
    `${BACKEND_URL}/sensors/failuremodes/component/${componentId}`,  // adjust URL to match your backend route
    { cache: 'no-store' }
  );

  if (!response.ok) return [];

  const data = await response.json();
  return data.map((fm: any) => ({
    id: fm.failure_mode_id,
    name: fm.name,
    severity: fm.severity,
  }));
}

export interface SensorStats {
  component_id: string;
  total_sensors: number;
  total_sensors_with_failure_mode: number;
  total_sensors_without_failure_mode: number;
  failure_modes: any[];
  sensors_with_failure_mode: any[];
  sensors_without_failure_mode: any[];
}

export async function getSensorStatsByComponent(componentId: string): Promise<SensorStats | null> {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

  const response = await fetch(
    `${BACKEND_URL}/sensors/component/${componentId}/stats`,
    { cache: 'no-store' }
  );

  if (!response.ok) return null;
  return await response.json();
}