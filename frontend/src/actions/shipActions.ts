// app/actions/shipActions.ts
'use server';

import { revalidatePath } from 'next/cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type Ship = {
  ship_id: string;
  ship_name: string;
  ship_category?: string;
  ship_class?: string;
  command?: string;
  created_date: string;
  modified_date: string;
};

export type ShipFormData = {
  ship_name: string;
  ship_category?: string;
  ship_class?: string;
  command?: string;
};

export async function getShips() {
  try {
    const response = await fetch(`${API_BASE_URL}/ships`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ships');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching ships:', error);
    return { success: false, error: 'Failed to fetch ships' };
  }
}

export async function createShip(formData: ShipFormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/ships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      // Try to parse JSON error, fallback to text
      const contentType = response.headers.get('content-type');
      let errorMessage = `Failed to create ship (${response.status})`;
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const errorText = await response.text();
        console.error('API returned non-JSON response:', errorText.substring(0, 200));
        errorMessage = `API error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    revalidatePath('/ships');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating ship:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create ship' 
    };
  }
}

export async function updateShip(shipId: string, formData: ShipFormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/ships/${shipId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Failed to update ship (${response.status})`;
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const errorText = await response.text();
        console.error('API returned non-JSON response:', errorText.substring(0, 200));
        errorMessage = `API error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    revalidatePath('/ships');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating ship:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update ship' 
    };
  }
}

export async function deleteShip(shipId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/ships/${shipId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Failed to delete ship (${response.status})`;
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const errorText = await response.text();
        console.error('API returned non-JSON response:', errorText.substring(0, 200));
        errorMessage = `API error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    revalidatePath('/ships');
    return { success: true };
  } catch (error) {
    console.error('Error deleting ship:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete ship' 
    };
  }
}