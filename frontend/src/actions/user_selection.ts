// actions/user-selection.ts
'use server'

export interface Item {
  value: string;
  label: string;
}

export interface Group {
  groupName: string;
  items: Item[];
}

export interface UserSelectionData {
  ships: Group[];
  equipment: Record<string, Group[]>;
}

export interface UserSelectionResponse {
  data: UserSelectionData;
}

export async function getUserSelection(): Promise<UserSelectionResponse> {
  try {
    const response = await fetch('http://localhost:8000/user_selection', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store', // or 'force-cache' depending on your needs
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user selection: ${response.status} ${response.statusText}`);
    }

    const userSelection: UserSelectionResponse = await response.json();
    return userSelection;
  } catch (error) {
    console.error('Error fetching user selection:', error);
    throw new Error('Failed to fetch user selection');
  }
}