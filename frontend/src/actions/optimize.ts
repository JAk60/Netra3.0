"use server";

import { revalidatePath } from "next/cache";

// Types
export interface OptimizationResult {
  t?: number;
  objective_value?: number;
  t_values?: number[];
  p_values?: number[];
  components?: ComponentOptimizationResult[];
}

export interface ComponentOptimizationResult {
  component_id: string;
  component_name?: string;
  assembly_name?: string;
  eta?: number;  // ← Added
  beta?: number; // ← Added
  t_values?: number[];
  p_values?: number[];
  t?: number;
  objective_value?: number;
}

export interface OptimizationParams {
  rt: any;
  c: any;
  n: any;
  method: string;
  componentIds: string[];
  componentNames?: Record<string, string>;
  // Method-specific parameters
  cf?: number;
  cp?: number;
  df?: number;
  dp?: number;
  pmdt?: number;
  cpm?: number;
  p_values?: number[];
  optimizationType?: string; // From form, but not sent to backend
}

// Map frontend optimization types to backend methods
const methodMapping: Record<string, string> = {
  'risk-based': 'risk_target',
  'age-based-cost': 'age_based',
  'age-based-downtime': 'downtime_based',
  'calendar-group-cost': 'component_group',
  'calendar-group-downtime': 'downtime_component_group',
  'calendar-time-cost': 'calendar_time',
  'calendar-time-downtime': 'calender_downtime', // Note: backend has typo "calender"
};

export async function optimizePreventiveMaintenance(params: OptimizationParams) {
  try {
    // Map frontend method to backend method
    const backendMethod = methodMapping[params.method] || params.method;
    
    console.log('Frontend method:', params.method);
    console.log('Backend method:', backendMethod);
    console.log('Component IDs:', params.componentIds);
    console.log('Component Names Map:', params.componentNames);

    // Build components array with component_id (backend will look for this or asset_id)
    const components = params.componentIds.map(id => ({
      component_id: id
    }));

    // Build base request - always include components array
    const requestBody: any = {
      method: backendMethod,
      components: components
    };

    // Add method-specific parameters
    if (params.cf !== undefined) requestBody.cf = params.cf;
    if (params.cp !== undefined) requestBody.cp = params.cp;
    if (params.df !== undefined) requestBody.df = params.df;
    if (params.dp !== undefined) requestBody.dp = params.dp;
    if (params.pmdt !== undefined) requestBody.pmdt = params.pmdt;
    if (params.cpm !== undefined) requestBody.cpm = params.cpm;

    // Add p_values for risk_target method
    if (backendMethod === 'risk_target') {
      requestBody.p_values = params.p_values || [0.8, 0.85, 0.9, 0.95];
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Make API call
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/rcm/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('API Error:', errorData);
      throw new Error(errorData.detail || `HTTP ${response.status}: Optimization failed`);
    }

    const result: OptimizationResult = await response.json();
    console.log('API Response:', result);

    // Enrich result with component names
    const enrichedResult = enrichOptimizationResult(result, params.componentNames || {});

    revalidatePath('/rcm');
    
    return {
      success: true,
      data: enrichedResult,
    };
  } catch (error) {
    console.error('Optimization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

function enrichOptimizationResult(
  result: OptimizationResult,
  componentNames: Record<string, string>
): OptimizationResult {
  // For methods that return components array (risk_target with multiple components)
  if (result.components && Array.isArray(result.components)) {
    return {
      ...result,
      components: result.components.map(comp => ({
        ...comp,
        component_name: componentNames[comp.component_id] || comp.component_id || 'Unknown Component',
        assembly_name: componentNames[comp.component_id] || comp.component_id || 'Unknown Component', // Add this for UI compatibility
      })),
    };
  }

  // For single component results, keep as-is
  return result;
}

// Store types
export interface OptimizationStoreState {
  results: OptimizationResult | null;
  isOptimizing: boolean;
  error: string | null;
}