import { z } from 'zod';

export const inputParamsSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  scaleParameter: z.coerce.number().min(0, 'Scale parameter must be positive'),
  shapeParameter: z.coerce.number().min(0, 'Shape parameter must be positive'),
});

export const actualDataPointSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  installationDate: z.string().min(1, 'Installation date is required'),
  removalDate: z.string().min(1, 'Removal date is required'),
  status: z.enum(['Failure', 'Suspension']),
});

export const intervalDataPointSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  installationStartDate: z.string().min(1, 'Installation start date is required'),
  installationEndDate: z.string().min(1, 'Installation end date is required'),
  removalStartDate: z.string().min(1, 'Removal start date is required'),
  removalEndDate: z.string().min(1, 'Removal end date is required'),
  status: z.enum(['Failure', 'Suspension']),
});

export const oemSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  L10: z.coerce.number().min(0, 'L10 must be positive'),
  L90: z.coerce.number().min(0, 'L90 must be positive'),
});

export const oemExpertSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  mostLikely: z.coerce.number().min(0, 'Most likely life must be positive'),
  maxLife: z.coerce.number().min(0, 'Maximum life must be positive'),
  minLife: z.coerce.number().min(0, 'Minimum life must be positive'),
  componentFailure: z.coerce.number().min(0, 'Number of components must be positive'),
  timeWoFailure: z.coerce.number().min(0, 'Time without failure must be positive'),
});

export const expertJudgementSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  mostLikely: z.coerce.number().min(0, 'Most likely life must be positive'),
  maxLife: z.coerce.number().min(0, 'Maximum life must be positive'),
  minLife: z.coerce.number().min(0, 'Minimum life must be positive'),
  componentFailure: z.coerce.number().min(0, 'Number of components must be positive'),
  timeWoFailure: z.coerce.number().min(0, 'Time without failure must be positive'),
});

export const probabilityFailureSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  time: z.coerce.number().min(0, 'Time must be positive'),
  failureProbability: z.coerce.number().min(0).max(100, 'Probability must be between 0-100'),
});

export const nprdSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  failureRate: z.coerce.number().min(0, 'Failure rate must be positive'),
  beta: z.coerce.number().min(0, 'Beta must be positive'),
});

export type InputParamsData = z.infer<typeof inputParamsSchema>;
export type ActualDataPointData = z.infer<typeof actualDataPointSchema>;
export type IntervalDataPointData = z.infer<typeof intervalDataPointSchema>;
export type OEMData = z.infer<typeof oemSchema>;
export type OEMExpertData = z.infer<typeof oemExpertSchema>;
export type ExpertJudgementData = z.infer<typeof expertJudgementSchema>;
export type ProbabilityFailureData = z.infer<typeof probabilityFailureSchema>;
export type NPRDData = z.infer<typeof nprdSchema>;