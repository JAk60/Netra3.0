// app/actions/sensors/addReading.ts
'use server'

import { revalidatePath } from 'next/cache'

export interface AddSensorReadingInput {
  value: number
  operating_hours: number
  alert: boolean
  component_id: string
  sensor_id: string
}

export interface AddSensorReadingResponse {
  success: boolean
  data?: any
  error?: string
}
export async function addSensorReading(
  sensorId: string,
  input: AddSensorReadingInput
): Promise<AddSensorReadingResponse> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // Ensure the sensor_id in the body matches the path parameter
    const payload = {
      ...input,
      sensor_id: sensorId  // Override with the path parameter
    }
    
    const response = await fetch(`${API_BASE_URL}/sensors/${sensorId}/readings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.detail || `Failed to add sensor reading: ${response.statusText}`,
      }
    }

    const data = await response.json()
    revalidatePath('/sensors')
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error adding sensor reading:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}