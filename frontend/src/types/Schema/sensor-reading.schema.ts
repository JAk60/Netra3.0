import { z } from 'zod';

// ==========================================
// SENSOR METADATA IMPORT SCHEMAS
// ==========================================

export const sensorMetadataCSVSchema = z.object({
  sensor_name: z.string().min(1, "Sensor name is required").max(255),
  unit: z.string().max(50).optional().nullable(),
  min_value: z.coerce.number().refine((val) => val !== undefined && val !== null, {
    message: "Min value is required",
  }),
  max_value: z.coerce.number().refine((val) => val !== undefined && val !== null, {
    message: "Max value is required",
  }),
  frequency: z.coerce.number().optional().nullable(),
  P: z.coerce.number().optional().nullable(),
  F: z.coerce.number().optional().nullable(),
  failure_mode_name: z.string().max(100).optional().nullable(),
});

export const bulkSensorMetadataSchema = z.array(sensorMetadataCSVSchema).min(1, {
  message: "At least one sensor is required",
});

// ==========================================
// SENSOR READING IMPORT SCHEMAS
// ==========================================

export const sensorReadingCSVSchema = z.object({
  sensor_name: z.string().min(1, "Sensor name is required").max(255),
  value: z.coerce.number().refine((val) => val !== undefined && val !== null, {
    message: "Value must be a number",
  }),
  operating_hours: z.coerce.number().optional().nullable(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export const bulkSensorReadingSchema = z.array(sensorReadingCSVSchema).min(1, {
  message: "At least one reading is required",
});

// ==========================================
// TYPES
// ==========================================

export type SensorMetadataCSV = z.infer<typeof sensorMetadataCSVSchema>;
export type SensorReadingCSV = z.infer<typeof sensorReadingCSVSchema>;

// ==========================================
// API REQUEST SCHEMAS (what we send to backend)
// ==========================================

export const sensorMetadataCreateSchema = z.object({
  sensor_name: z.string(),
  unit: z.string().optional().nullable(),
  min_value: z.number(),
  max_value: z.number(),
  frequency: z.number().optional().nullable(),
  P: z.number().optional().nullable(),
  F: z.number().optional().nullable(),
  failure_mode_name: z.string().optional().nullable(),
  component_id: z.string().uuid(), // Added by frontend
});

export const sensorReadingCreateSchema = z.object({
  sensor_name: z.string(),
  value: z.number(),
  operating_hours: z.number().optional().nullable(),
  date: z.string(),
  component_id: z.string().uuid(), // Added by frontend
});

export type SensorMetadataCreate = z.infer<typeof sensorMetadataCreateSchema>;
export type SensorReadingCreate = z.infer<typeof sensorReadingCreateSchema>;