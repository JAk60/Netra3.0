// actions/ships.ts
'use server'

export interface Ship {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  status?: string;
  // Add other ship properties based on your ShipRead model
}

export interface GetShipsParams {
  skip?: number;
  limit?: number;
}

export async function getShips({ skip = 0, limit = 100 }: GetShipsParams = {}): Promise<Ship[]> {
  try {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`http://localhost:8000/ships?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store', // or 'force-cache' depending on your needs
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ships: ${response.status} ${response.statusText}`);
    }

    const ships: Ship[] = await response.json();
    return ships;
  } catch (error) {
    console.error('Error fetching ships:', error);
    throw new Error('Failed to fetch ships');
  }
}