'use server'

import { revalidatePath } from 'next/cache'

// Types
interface DecisionPath {
  [key: string]: any
}

interface RCMCreate {
  component_id: string
  decision_path: DecisionPath
  maintenance_policy: string
}

interface RCMResponse extends RCMCreate {
  id: string
  created_at: string
  updated_at: string
}

interface BulkCreateResult {
  success: boolean
  data?: RCMResponse[]
  error?: string
  failedRecords?: Array<{
    index: number
    error: string
  }>
}

// Server Action
export async function createRCMBulk(
  rcmData: RCMCreate[]
): Promise<BulkCreateResult> {
  try {
    // Validate input
    if (!Array.isArray(rcmData) || rcmData.length === 0) {
      return {
        success: false,
        error: 'Invalid input: expected non-empty array of RCM records'
      }
    }

    // Validate each record
    for (let i = 0; i < rcmData.length; i++) {
      const record = rcmData[i]
      if (!record.component_id || !record.maintenance_policy) {
        return {
          success: false,
          error: `Invalid record at index ${i}: component_id and maintenance_policy are required`
        }
      }
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${API_URL}/rcm/bulk_create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(rcmData),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.detail || `HTTP error! status: ${response.status}`
      }
    }

    const data: RCMResponse[] = await response.json()

    // Revalidate the RCM list page or any relevant paths
    revalidatePath('/rcm')
    revalidatePath('/dashboard')

    return {
      success: true,
      data
    }

  } catch (error) {
    console.error('Error in createRCMBulk:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}




// Server action to fetch RCM data
export async function getRcmData(shipId: string) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/rcm/?ship_id=${shipId}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
        // Optional: configure caching behavior
        cache: 'no-store', // or 'force-cache' depending on your needs
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching RCM data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Example usage in a component:
/*
import { getRcmData } from '@/actions/rcm-actions';

export default async function RcmPage() {
  const shipId = '33f13701-849f-4030-8d71-a0f65eac992e';
  const result = await getRcmData(shipId);

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div>
      <pre>{JSON.stringify(result.data, null, 2)}</pre>
    </div>
  );
}
*/
