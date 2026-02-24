'use server';

import { SensorMetadataCreate, SensorReadingCreate } from "@/types/Schema/sensor-reading.schema";



const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface BulkImportResponse {
  success: boolean;
  count?: number;
  message?: string;
  errors?: Array<{ row?: number; error: string; sensor_name?: string }>;
}

// ==========================================
// SENSOR METADATA BULK IMPORT
// ==========================================

export async function bulkCreateSensorMetadata(
  metadata: SensorMetadataCreate[]
): Promise<BulkImportResponse> {
  try {
    // Use the new bulk endpoint with name resolution
    const response = await fetch(
      `${API_BASE_URL}/sensors/bulk-create-by-name`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // Handle multi-status response (207)
    if (response.status === 207) {
      return {
        success: data.failed === 0,
        count: data.created,
        message: `Created ${data.created} sensor(s)${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
        errors: data.errors,
      };
    }

    return {
      success: true,
      count: Array.isArray(data) ? data.length : metadata.length,
      message: `Successfully imported ${Array.isArray(data) ? data.length : metadata.length} sensor(s)`,
    };
  } catch (error) {
    console.error('Bulk metadata import error:', error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// ==========================================
// SENSOR READINGS BULK IMPORT
// ==========================================

export async function bulkCreateSensorReadings(
  readings: SensorReadingCreate[],
  componentId: string  // Add componentId parameter
): Promise<BulkImportResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sensors/readings/bulk-by-name?component_id=${componentId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(readings),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // Handle multi-status response (207)
    if (response.status === 207) {
      return {
        success: data.failed === 0,
        count: data.created,
        message: `Created ${data.created} reading(s)${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
        errors: data.errors,
      };
    }

    return {
      success: true,
      count: Array.isArray(data) ? data.length : readings.length,
      message: `Successfully imported ${Array.isArray(data) ? data.length : readings.length} sensor reading(s)`,
    };
  } catch (error) {
    console.error('Bulk readings import error:', error);

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred during import',
    };
  }
}