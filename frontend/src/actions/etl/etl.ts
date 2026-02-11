'use server';

import { revalidatePath } from 'next/cache';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHIP & DEPARTMENT ACTIONS (Used in ETL Monitoring)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAllShips() {
  try {
    const res = await fetch(`${API_BASE}/ships`, {
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Failed to fetch ships');

    return res.json();
  } catch (error) {
    console.error('Error fetching ships:', error);

    return [];
  }
}

export async function getDepartmentsByShip(shipId: string) {
  try {
    const res = await fetch(`${API_BASE}/ships/${shipId}/departments`, {
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Failed to fetch departments');

    return res.json();
  } catch (error) {
    console.error('Error fetching departments:', error);

    return [];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT ETL MANAGEMENT (Used in ETL Monitoring)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getComponentsByFilters(shipId: string, departmentId: string) {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/etl/components?ship_id=${shipId}&department_id=${departmentId}`,
      {
        cache: 'no-store'
      }
    );

    if (!res.ok) throw new Error('Failed to fetch components');

    return res.json();
  } catch (error) {
    console.error('Error fetching components:', error);
    
    return [];
  }
}

export async function toggleETL(componentId: string, enable: boolean) {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/etl/components/${componentId}/toggle?enable=${enable}`,
      {
        method: 'POST'
      }
    );

    if (!res.ok) throw new Error('Failed to toggle ETL');

    revalidatePath('/etl');

    return { success: true, data: await res.json() };
  } catch (error) {
    console.error('Error toggling ETL:', error);

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}