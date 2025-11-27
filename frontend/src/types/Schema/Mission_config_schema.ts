import { z } from "zod"

// ==================== SHIP SELECTION SCHEMA ====================

export const shipSelectionSchema = z.object({
  ship_id: z.string().min(1, "Please select a ship"),
})

export type ShipSelectionFormValues = z.infer<typeof shipSelectionSchema>

// ==================== PHASE CONFIGURATION SCHEMA ====================

export const phaseSchema = z.object({
  phase_number: z.number().int().positive(),
  phase_name: z.string().min(1, "Phase name is required").max(50, "Phase name too long"),
})

export const phaseConfigSchema = z.object({
  phase_count: z.number().int().min(1, "At least 1 phase required").max(10, "Maximum 10 phases"),
  phases: z.array(phaseSchema).min(1).max(10),
})

export type PhaseConfigFormValues = z.infer<typeof phaseConfigSchema>

// ==================== K/N CONFIGURATION SCHEMA ====================

export const knConfigSchema = z.object({
  phase_number: z.number().int().positive(),
  k: z.number().int().min(0, "K must be >= 0"),
})

// Custom refinement for K/N validation (K <= N)
export const createKnConfigSchema = (maxN: number) =>
  knConfigSchema.refine(
    (data) => data.k <= maxN,
    (data) => ({
      message: `K must be <= ${maxN} (total equipment count)`,
      path: ["k"],
    })
  )

export type KNConfigFormValues = z.infer<typeof knConfigSchema>

// ==================== EQUIPMENT SELECTION SCHEMA ====================

export const equipmentSelectionSchema = z.object({
  propulsion: z.array(z.string()).min(0),
  power_generation: z.array(z.string()).min(0),
  support: z.array(z.string()).min(0),
  firing: z.array(z.string()).min(0),
})

// At least one system must have equipment selected
export const equipmentSelectionWithValidation = equipmentSelectionSchema.refine(
  (data) => {
    return (
      data.propulsion.length > 0 ||
      data.power_generation.length > 0 ||
      data.support.length > 0 ||
      data.firing.length > 0
    )
  },
  {
    message: "At least one equipment must be selected across all systems",
    path: ["propulsion"], // Show error on first field
  }
)

export type EquipmentSelectionFormValues = z.infer<typeof equipmentSelectionSchema>

// ==================== CONFIGURATION NAME SCHEMA ====================

export const configNameSchema = z.object({
  config_name: z
    .string()
    .min(3, "Configuration name must be at least 3 characters")
    .max(50, "Configuration name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Only alphanumeric characters, spaces, hyphens and underscores allowed"),
})

export type ConfigNameFormValues = z.infer<typeof configNameSchema>

// ==================== HELPER VALIDATION FUNCTIONS ====================

export function validateKNValue(k: number, n: number): boolean {
  return k >= 0 && k <= n && Number.isInteger(k) && Number.isInteger(n)
}

export function validatePhaseUniqueness(phases: { phase_number: number; phase_name: string }[]): boolean {
  const names = phases.map((p) => p.phase_name.toLowerCase().trim())
  return new Set(names).size === names.length
}