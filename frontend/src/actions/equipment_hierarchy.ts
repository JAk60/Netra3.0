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



interface SystemMetadata {
  alpha: number | null
  beta: number | null
  eta: number | null
  eta_beta: number | null
  priority: number | null
  current_age: number | null
}

interface Component {
  component_id: string
  metadata: SystemMetadata
  [key: string]: any
}

interface System {
  system_id: string
  system_type: string
  created_date: string
  total_components: number
  root_components_count: number
  belongs_to_ship: string
  has_components: string[]
  system_type_shared_with_systems: string[]
  components: Component[]
}

interface ShipSystemsHierarchyResponse {
  ship_id: string
  ship_name: string
  ship_category: string
  ship_class: string
  total_systems: number
  has_systems: string[]
  systems: System[]
}

interface FetchShipSystemsHierarchyParams {
  shipId: string
  apiBaseUrl?: string
}

export async function fetchShipSystemsHierarchyWithMetadata({
  shipId,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
}: FetchShipSystemsHierarchyParams): Promise<{
  data: ShipSystemsHierarchyResponse | null
  error: string | null
}> {
  try {


    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }


    const response = await fetch(
      `${apiBaseUrl}/ships/${shipId}/systems-hierarchy-with-metadata`,
      {
        method: 'GET',
        headers,
        cache: 'no-store', // or 'force-cache' depending on your needs
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return {
          data: null,
          error: 'Ship not found',
        }
      }

      const errorData = await response.json().catch(() => null)
      return {
        data: null,
        error: errorData?.detail || `Failed to fetch ship systems hierarchy: ${response.statusText}`,
      }
    }

    const data: ShipSystemsHierarchyResponse = await response.json()

    return {
      data,
      error: null,
    }
  } catch (error) {
    console.error('Error fetching ship systems hierarchy with metadata:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

// Optional: Helper function to get just the metadata for a specific component
export async function getComponentMetadata({
  shipId,
  componentId,
  apiBaseUrl,
}: {
  shipId: string
  componentId: string
  apiBaseUrl?: string
}): Promise<{
  data: SystemMetadata | null
  error: string | null
}> {
  const result = await fetchShipSystemsHierarchyWithMetadata({ shipId, apiBaseUrl })

  if (result.error || !result.data) {
    return {
      data: null,
      error: result.error,
    }
  }

  // Find the component in the hierarchy
  for (const system of result.data.systems) {
    const component = system.components.find(
      (comp) => comp.component_id === componentId
    )
    if (component) {
      return {
        data: component.metadata,
        error: null,
      }
    }
  }

  return {
    data: null,
    error: 'Component not found',
  }
}