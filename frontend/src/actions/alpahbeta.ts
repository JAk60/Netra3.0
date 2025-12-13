'use server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface AlphaBetaData {
  id: string;
  alpha: number;
  beta: number;
  component_id: string;
}

interface AlphaBetaInput {
  alpha: number;
  beta: number;
  component_id: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get alpha and beta parameters by component ID
 * GET /alpha-beta/{component_id}
 */
export async function getAlphaBetaByComponent(
  componentId: string
): Promise<ApiResponse<AlphaBetaData[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/alpha-beta/${componentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching alpha-beta parameters:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Create alpha and beta parameters
 * POST /alpha-beta
 */
export async function createAlphaBeta(
  input: AlphaBetaInput
): Promise<ApiResponse<AlphaBetaData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/alpha-beta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating alpha-beta parameters:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}