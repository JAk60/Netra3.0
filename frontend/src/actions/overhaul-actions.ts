'use server';

import { revalidatePath } from 'next/cache';

// Types matching your FastAPI models
export interface OverhaulMetadataInput {
  component_id: string;
  overhaul_frequency_hours: number;
  total_overhaul_events?: number;
  last_overhaul_date?: string;
}

export interface OverhaulReadingInput {
  component_id: string;
  maintenance_type: string;
  defect_date: string;
  cmms_running_age: number;
  running_age: number;
}

export interface OverhaulMetadataResponse {
  id: string;
  component_id: string;
  overhaul_frequency_hours: number;
  total_overhaul_events?: number;
  last_overhaul_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OverhaulReadingResponse {
  id: string;
  component_id: string;
  maintenance_type: string;
  defect_date: string;
  cmms_running_age: number;
  running_age: number;
  created_at: string;
  updated_at: string;
}

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create overhaul metadata record
 */
export async function createOverhaulMetadata(
  input: OverhaulMetadataInput
): Promise<ActionResponse<OverhaulMetadataResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/overhaul/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to create overhaul metadata: ${response.statusText}`
      );
    }

    const data: OverhaulMetadataResponse = await response.json();

    // Revalidate the overhaul page to show updated data
    revalidatePath('/overhaul');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating overhaul metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Create overhaul reading record
 */
export async function createOverhaulReading(
  input: OverhaulReadingInput
): Promise<ActionResponse<OverhaulReadingResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/overhaul/readings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to create overhaul reading: ${response.statusText}`
      );
    }

    const data: OverhaulReadingResponse = await response.json();

    // Revalidate the overhaul page to show updated data
    revalidatePath('/overhaul');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating overhaul reading:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get all overhaul metadata records, optionally filtered by ship
 */
export async function getOverhaulMetadata(
  shipId?: string
): Promise<ActionResponse<OverhaulMetadataResponse[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/overhaul/`);
    if (shipId) {
      url.searchParams.append('ship_id', shipId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to fetch overhaul metadata: ${response.statusText}`
      );
    }

    const data: OverhaulMetadataResponse[] = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching overhaul metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete overhaul metadata record (you'll need to add this endpoint to your FastAPI)
 */
export async function deleteOverhaulMetadata(
  id: string
): Promise<ActionResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/overhaul/metadata/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to delete overhaul metadata: ${response.statusText}`
      );
    }

    // Revalidate the overhaul page to show updated data
    revalidatePath('/overhaul');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting overhaul metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete overhaul reading record (you'll need to add this endpoint to your FastAPI)
 */
export async function deleteOverhaulReading(
  id: string
): Promise<ActionResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/overhaul/readings/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to delete overhaul reading: ${response.statusText}`
      );
    }

    // Revalidate the overhaul page to show updated data
    revalidatePath('/overhaul');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting overhaul reading:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}