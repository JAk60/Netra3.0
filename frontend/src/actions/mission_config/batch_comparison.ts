// frontend/src/actions/mission_config/batch_comparison.ts
// FIXED VERSION - Separate storage for configs vs results

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ============================================================================
// TYPES
// ============================================================================

export interface EquipmentSelection {
  component_id: string
  name: string
  nomenclature: string
}

export interface PhaseEquipment {
  phase_name: string
  duration_hours: number
  sequence_order: number
  propulsion?: EquipmentSelection[]
  power_generation?: EquipmentSelection[]
  support?: EquipmentSelection[]
  firing?: EquipmentSelection[]
}

// This is for FUTURE calculations (equipment selections only)
export interface ComparisonConfig {
  id: string
  config_id: string
  config_name: string
  ship_id: string
  ship_name: string
  total_duration: number
  phases: PhaseEquipment[]
  timestamp: string
}

export interface BatchComparisonRequest {
  comparisons: ComparisonConfig[]
}

export interface EquipmentResult {
  nomenclature: string
  system: string
  reliability: number
  alpha: number
  beta: number
  age_before: number
  age_after: number
  duration: number
  is_reused: boolean
}

export interface PhaseResult {
  phase_name: string
  sequence: number
  duration_hours: number
  phase_reliability: number
  equipment: EquipmentResult[]
}

export interface ComparisonResult {
  comparison_id: string
  config_name: string
  ship_name: string
  mission_reliability: number
  total_duration: number
  phases: PhaseResult[]
  equipment_final_ages: Record<string, number>
}

export interface BatchComparisonResponse {
  success: boolean
  results: ComparisonResult[]
  error?: string
}

// This is for COMPLETED calculations (with results)
export interface StoredComparison {
  id: string
  config_id: string
  config_name: string
  ship_id: string
  ship_name: string
  total_duration: number
  
  original: {
    mission_reliability: number
    phases: PhaseResult[]
    equipment_final_ages: Record<string, number>
    calculated_at: string
  }
  
  alternatives?: Array<{
    comparison_id: string
    config_name: string
    mission_reliability: number
    phases: PhaseResult[]
    equipment_final_ages: Record<string, number>
    calculated_at: string
  }>
  
  timestamp: string
}

export interface ComparisonConfigStorage {
  configs: ComparisonConfig[]
  version: string
}

export interface ComparisonResultStorage {
  comparisons: StoredComparison[]
  version: string
}

// ============================================================================
// API ACTIONS (Server-side)
// ============================================================================

export async function submitBatchComparison(
  request: BatchComparisonRequest
): Promise<{ success: boolean; data?: BatchComparisonResponse; error?: string }> {
  try {
    console.log('🚀 Submitting batch comparison:', {
      count: request.comparisons.length,
      configs: request.comparisons.map(c => c.config_name)
    })

    const response = await fetch(`${API_BASE_URL}/api/mission-reliability/compare-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      cache: 'no-store'
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ API Error:', error)
      throw new Error(error.detail || 'Failed to calculate batch comparison')
    }

    const result: BatchComparisonResponse = await response.json()
    
    console.log('✅ Batch comparison completed:', {
      success: result.success,
      resultsCount: result.results.length
    })
    
    return { success: true, data: result }
  } catch (error) {
    console.error('💥 Error submitting batch comparison:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================================
// LOCALSTORAGE UTILITIES - COMPARISON CONFIGS (Client-side only)
// ============================================================================

const CONFIGS_STORAGE_KEY = 'mission_comparison_configs'
const RESULTS_STORAGE_KEY = 'mission_comparison_results'
const MAX_CONFIGS = 5

/**
 * Get all saved comparison configs (equipment selections)
 */
export function getSavedComparisonConfigs(configId?: string): ComparisonConfig[] {
  if (typeof window === 'undefined') {
    console.log('⚠️ Not in browser environment')
    return []
  }
  
  try {
    const stored = localStorage.getItem(CONFIGS_STORAGE_KEY)
    
    if (!stored) {
      console.log('ℹ️ No stored configs found')
      return []
    }
    
    const data: ComparisonConfigStorage = JSON.parse(stored)
    
    if (!data || !Array.isArray(data.configs)) {
      console.error('❌ Invalid storage structure')
      return []
    }
    
    // Filter by config_id if provided
    const configs = configId 
      ? data.configs.filter(c => c.config_id === configId)
      : data.configs
    
    console.log(`✅ Loaded ${configs.length} comparison configs`)
    return configs
    
  } catch (error) {
    console.error('💥 Error reading configs:', error)
    return []
  }
}

/**
 * Save a new comparison config (equipment selections)
 */
export function saveComparisonConfig(config: ComparisonConfig): boolean {
  console.log('💾 Saving comparison config:', config.config_name)
  
  if (typeof window === 'undefined') {
    console.error('❌ Not in browser environment')
    return false
  }
  
  try {
    // Validate
    if (!config.id || !config.config_id) {
      throw new Error('Missing required fields')
    }
    
    // Get existing configs
    const configs = getSavedComparisonConfigs()
    
    // Check for this specific config_id
    const sameConfigCount = configs.filter(c => c.config_id === config.config_id).length
    
    if (sameConfigCount >= MAX_CONFIGS) {
      throw new Error(`Maximum ${MAX_CONFIGS} comparison configs allowed for this configuration`)
    }
    
    // Add timestamp if not present
    if (!config.timestamp) {
      config.timestamp = new Date().toISOString()
    }
    
    // Add new config
    configs.push(config)
    
    // Save
    const storage: ComparisonConfigStorage = {
      configs: configs,
      version: '1.0'
    }
    
    localStorage.setItem(CONFIGS_STORAGE_KEY, JSON.stringify(storage))
    
    console.log('✅ Config saved successfully')
    return true
    
  } catch (error) {
    console.error('💥 Error saving config:', error)
    alert(error instanceof Error ? error.message : 'Failed to save comparison config')
    return false
  }
}

/**
 * Delete a comparison config
 */
export function deleteComparisonConfig(configId: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const configs = getSavedComparisonConfigs()
    const filtered = configs.filter(c => c.id !== configId)
    
    const storage: ComparisonConfigStorage = {
      configs: filtered,
      version: '1.0'
    }
    
    localStorage.setItem(CONFIGS_STORAGE_KEY, JSON.stringify(storage))
    console.log('✅ Config deleted:', configId)
    return true
    
  } catch (error) {
    console.error('Error deleting config:', error)
    return false
  }
}

// ============================================================================
// LOCALSTORAGE UTILITIES - COMPARISON RESULTS (Client-side only)
// ============================================================================

/**
 * Save original calculation results
 */
export function saveOriginalResult(result: {
  config_id: string
  config_name: string
  ship_id: string
  ship_name: string
  total_duration: number
  mission_reliability: number
  phases: PhaseResult[]
  equipment_final_ages: Record<string, number>
}): boolean {
  console.log('💾 Saving original result:', result.config_name)
  
  if (typeof window === 'undefined') return false
  
  try {
    const stored = localStorage.getItem(RESULTS_STORAGE_KEY)
    let storage: ComparisonResultStorage = stored 
      ? JSON.parse(stored)
      : { comparisons: [], version: '1.0' }
    
    // Check if we already have results for this config
    const existingIndex = storage.comparisons.findIndex(
      c => c.config_id === result.config_id
    )
    
    const comparison: StoredComparison = {
      id: `result_${result.config_id}`,
      config_id: result.config_id,
      config_name: result.config_name,
      ship_id: result.ship_id,
      ship_name: result.ship_name,
      total_duration: result.total_duration,
      original: {
        mission_reliability: result.mission_reliability,
        phases: result.phases,
        equipment_final_ages: result.equipment_final_ages,
        calculated_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
    
    if (existingIndex >= 0) {
      // Update existing
      storage.comparisons[existingIndex] = comparison
    } else {
      // Add new
      storage.comparisons.push(comparison)
    }
    
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(storage))
    console.log('✅ Original result saved')
    return true
    
  } catch (error) {
    console.error('💥 Error saving original result:', error)
    return false
  }
}

/**
 * Add alternative results to existing comparison
 */
export function addAlternativeResults(
  configId: string,
  alternatives: ComparisonResult[]
): boolean {
  console.log('💾 Adding alternative results for:', configId)
  
  if (typeof window === 'undefined') return false
  
  try {
    const stored = localStorage.getItem(RESULTS_STORAGE_KEY)
    if (!stored) {
      console.error('❌ No results storage found')
      return false
    }
    
    const storage: ComparisonResultStorage = JSON.parse(stored)
    
    const comparison = storage.comparisons.find(c => c.config_id === configId)
    if (!comparison) {
      console.error('❌ Original result not found for:', configId)
      return false
    }
    
    // Add alternatives
    comparison.alternatives = alternatives.map(alt => ({
      comparison_id: alt.comparison_id,
      config_name: alt.config_name,
      mission_reliability: alt.mission_reliability,
      phases: alt.phases,
      equipment_final_ages: alt.equipment_final_ages,
      calculated_at: new Date().toISOString()
    }))
    
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(storage))
    console.log('✅ Alternative results added')
    return true
    
  } catch (error) {
    console.error('💥 Error adding alternatives:', error)
    return false
  }
}

/**
 * Get comparison results for a config
 */
export function getComparisonResults(configId: string): StoredComparison | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(RESULTS_STORAGE_KEY)
    if (!stored) return null
    
    const storage: ComparisonResultStorage = JSON.parse(stored)
    return storage.comparisons.find(c => c.config_id === configId) || null
    
  } catch (error) {
    console.error('Error getting results:', error)
    return null
  }
}

/**
 * Clear all comparison data
 */
export function clearAllComparisons(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.removeItem(CONFIGS_STORAGE_KEY)
    localStorage.removeItem(RESULTS_STORAGE_KEY)
    console.log('✅ All comparisons cleared')
    return true
  } catch (error) {
    console.error('Error clearing comparisons:', error)
    return false
  }
}

// LEGACY FUNCTIONS - Keep for backward compatibility
export function getSavedComparisons() {
  return getSavedComparisonConfigs()
}

export function saveComparison(comparison: any) {
  return saveComparisonConfig(comparison)
}

export function deleteComparison(id: string) {
  return deleteComparisonConfig(id)
}