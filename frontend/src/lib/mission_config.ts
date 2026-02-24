const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function listShipConfigurations() {
  const response = await fetch(
    `${API_BASE_URL}/Mission-configuration/get_all_mission_configs`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch ship configurations')
  }

 const result = await response.json()
return result.data ?? result

}
