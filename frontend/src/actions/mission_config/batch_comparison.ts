// frontend/src/actions/mission_config/batch_comparison.ts
'use server'

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

export interface ComparisonConfig {
  id: string
  config_id: string
  config_name: string
  ship_id: string
  ship_name: string
  total_duration: number
  phases: PhaseEquipment[]
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

// ============================================================================
// API ACTIONS
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
// LOCALSTORAGE UTILITIES
// ============================================================================

const STORAGE_KEY = 'mission_comparisons'
const MAX_COMPARISONS = 10

export interface StoredComparison extends ComparisonConfig {
  timestamp: string
  calculatedResults?: ComparisonResult | null
}

export interface ComparisonStorage {
  comparisons: StoredComparison[]
  version: string
}

/**
 * Get all saved comparisons from localStorage
 */
export async function getSavedComparisons(): Promise<StoredComparison[]> {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const data: ComparisonStorage = JSON.parse(stored)
    return data.comparisons || []
  } catch (error) {
    console.error('Error reading comparisons from localStorage:', error)
    return []
  }
}

/**
 * Save a new comparison to localStorage
 */
export async function saveComparison(comparison: Omit<StoredComparison, 'timestamp'>): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    const comparisons = await getSavedComparisons()
    
    // Check limit
    if (comparisons.length >= MAX_COMPARISONS) {
      throw new Error(`Maximum ${MAX_COMPARISONS} comparisons allowed. Please delete some first.`)
    }
    
    // Add timestamp
    const newComparison: StoredComparison = {
      ...comparison,
      timestamp: new Date().toISOString()
    }
    
    // Save
    const storage: ComparisonStorage = {
      comparisons: [...comparisons, newComparison],
      version: '1.0'
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    
    console.log('✅ Comparison saved to localStorage:', {
      id: newComparison.id,
      total: storage.comparisons.length
    })
    
    return true
  } catch (error) {
    console.error('Error saving comparison:', error)
    alert(error instanceof Error ? error.message : 'Failed to save comparison')
    return false
  }
}

/**
 * Update comparison with calculated results
 */
export async function updateComparisonResults(
  comparisonId: string,
  results: ComparisonResult
): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    const comparisons = await getSavedComparisons()
    
    const updatedComparisons = comparisons.map(comp =>
      comp.id === comparisonId
        ? { ...comp, calculatedResults: results }
        : comp
    )
    
    const storage: ComparisonStorage = {
      comparisons: updatedComparisons,
      version: '1.0'
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    
    console.log('✅ Comparison results updated:', comparisonId)
    
    return true
  } catch (error) {
    console.error('Error updating comparison results:', error)
    return false
  }
}

/**
 * Delete a comparison
 */
export async function deleteComparison(comparisonId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    const comparisons = await getSavedComparisons()
    
    const filtered = comparisons.filter(comp => comp.id !== comparisonId)
    
    const storage: ComparisonStorage = {
      comparisons: filtered,
      version: '1.0'
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    
    console.log('✅ Comparison deleted:', comparisonId)
    
    return true
  } catch (error) {
    console.error('Error deleting comparison:', error)
    return false
  }
}

/**
 * Clear all comparisons
 */
export async function clearAllComparisons(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('✅ All comparisons cleared')
    return true
  } catch (error) {
    console.error('Error clearing comparisons:', error)
    return false
  }
}

/**
 * Export comparisons as JSON
 * Must be async for Next.js Server Actions
 */
export async function exportComparisons(): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    const comparisons = getSavedComparisons()
    
    const dataStr = JSON.stringify(comparisons, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `mission_comparisons_${Date.now()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    
    console.log('✅ Comparisons exported')
  } catch (error) {
    console.error('Error exporting comparisons:', error)
    alert('Failed to export comparisons')
  }
}