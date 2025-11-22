'use server'

export interface ComponentHierarchy {
  component_id: string
  component_name: string
  nomenclature: string
  children: ComponentHierarchy[]
}

interface HierarchyResponse {
  success: boolean
  data?: ComponentHierarchy
  error?: string
}

export async function getComponentHierarchy(
  componentId: string
): Promise<HierarchyResponse> {
  try {
    // Validate component ID
    if (!componentId || typeof componentId !== 'string') {
      return {
        success: false,
        error: 'Invalid component ID provided'
      }
    }

    // Make API request to FastAPI endpoint
    const response = await fetch(
      `http://localhost:8000/components/${componentId}/hierarchy`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure fresh data
      }
    )

    if (!response.ok) {
      // Handle different error statuses
      if (response.status === 404) {
        return {
          success: false,
          error: 'Component not found'
        }
      }
      if (response.status === 403) {
        return {
          success: false,
          error: 'Access denied'
        }
      }
      
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || 'Failed to fetch component hierarchy'
      }
    }

    const data: ComponentHierarchy = await response.json()

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error fetching component hierarchy:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}


    