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

export async function getFailureModesAnalysis(
  componentId: string
): Promise<SensorsResponse> {

  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

  const response = await fetch(
    `${BACKEND_URL}/sensors/component/${componentId}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch sensors');
  }

  const rawSensors = await response.json();

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

  const failureModeMap = new Map<string, FailureModeUI>();

  rawSensors.forEach((sensor: any) => {
    if (sensor.failure_mode) {
      failureModeMap.set(sensor.failure_mode.failure_mode_id, {
        id: sensor.failure_mode.failure_mode_id,
        name: sensor.failure_mode.name,
        severity: sensor.failure_mode.severity,
      });
    }
  });

  return {
    sensors,
    failureModes: Array.from(failureModeMap.values()),
  };
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