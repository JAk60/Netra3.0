import { create } from 'zustand';

// Types for each form data
export interface InputParamsEntry {
  assemblyId: string;
  assemblyName: string;
  shipId: string;
  equipmentId: string;
  scaleParameter: number;
  shapeParameter: number;
  timestamp: string;
}

export interface ActualDataPointEntry {
  id: string;
  assemblyId: string;
  assemblyName: string;
  shipId: string;
  equipmentId: string;
  installationDate: string;
  removalDate: string;
  status: 'Failure' | 'Suspension';
  timestamp: string;
}

export interface IntervalDataPointEntry {
  id: string;
  assemblyId: string;
  assemblyName: string;
  shipId: string;
  equipmentId: string;
  installationStartDate: string;
  installationEndDate: string;
  removalStartDate: string;
  removalEndDate: string;
  status: 'Failure' | 'Suspension';
  timestamp: string;
}

export interface OEMEntry {
  id: string;
  assemblyId: string;
  assemblyName: string;
  shipId: string;
  equipmentId: string;
  L10: number;
  L90: number;
  timestamp: string;
}

export interface OEMExpertEntry {
  id: string;
  assemblyId: string;
  assemblyName: string;
  shipId: string;
  equipmentId: string;
  mostLikely: number;
  maxLife: number;
  minLife: number;
  componentFailure: number;
  timeWoFailure: number;
  timestamp: string;
}

export interface ExpertJudgementEntry {
  id: string;
  assemblyId: string;
  assemblyName: string;
  shipId: string;
  equipmentId: string;
  mostLikely: number;
  maxLife: number;
  minLife: number;
  componentFailure: number;
  timeWoFailure: number;
  timestamp: string;
}

export interface ProbabilityFailureEntry {
  id: string;
  assemblyId: string;
  assemblyName: string;
  shipId: string;
  equipmentId: string;
  time: number;
  failureProbability: number;
  timestamp: string;
}

export interface NPRDEntry {
  id: string;
  assemblyId: string;
  assemblyName: string;
  shipId: string;
  equipmentId: string;
  failureRate: number;
  beta: number;
  timestamp: string;
}

interface EtaBetaStore {
  // Single entry per assembly (Input Parameters only)
  inputParams: Record<string, InputParamsEntry>;
  
  // Multiple entries per assembly (all other forms)
  actualDataPoints: Record<string, ActualDataPointEntry[]>;
  intervalDataPoints: Record<string, IntervalDataPointEntry[]>;
  oemData: Record<string, OEMEntry[]>;
  oemExpertData: Record<string, OEMExpertEntry[]>;
  expertJudgement: Record<string, ExpertJudgementEntry[]>;
  probabilityFailure: Record<string, ProbabilityFailureEntry[]>;
  nprdData: Record<string, NPRDEntry[]>;

  // Actions for Input Parameters (single entry)
  setInputParams: (assemblyId: string, data: InputParamsEntry) => void;
  getInputParams: (assemblyId: string) => InputParamsEntry | null;
  deleteInputParams: (assemblyId: string) => void;

  // Actions for Actual Data Points (multiple entries)
  addActualDataPoint: (assemblyId: string, data: ActualDataPointEntry) => void;
  getActualDataPoints: (assemblyId: string) => ActualDataPointEntry[];
  updateActualDataPoint: (assemblyId: string, id: string, data: ActualDataPointEntry) => void;
  deleteActualDataPoint: (assemblyId: string, id: string) => void;

  // Actions for Interval Data Points
  addIntervalDataPoint: (assemblyId: string, data: IntervalDataPointEntry) => void;
  getIntervalDataPoints: (assemblyId: string) => IntervalDataPointEntry[];
  updateIntervalDataPoint: (assemblyId: string, id: string, data: IntervalDataPointEntry) => void;
  deleteIntervalDataPoint: (assemblyId: string, id: string) => void;

  // Actions for OEM Data
  addOEMData: (assemblyId: string, data: OEMEntry) => void;
  getOEMData: (assemblyId: string) => OEMEntry[];
  updateOEMData: (assemblyId: string, id: string, data: OEMEntry) => void;
  deleteOEMData: (assemblyId: string, id: string) => void;

  // Actions for OEM Expert Data
  addOEMExpertData: (assemblyId: string, data: OEMExpertEntry) => void;
  getOEMExpertData: (assemblyId: string) => OEMExpertEntry[];
  updateOEMExpertData: (assemblyId: string, id: string, data: OEMExpertEntry) => void;
  deleteOEMExpertData: (assemblyId: string, id: string) => void;

  // Actions for Expert Judgement
  addExpertJudgement: (assemblyId: string, data: ExpertJudgementEntry) => void;
  getExpertJudgement: (assemblyId: string) => ExpertJudgementEntry[];
  updateExpertJudgement: (assemblyId: string, id: string, data: ExpertJudgementEntry) => void;
  deleteExpertJudgement: (assemblyId: string, id: string) => void;

  // Actions for Probability Failure
  addProbabilityFailure: (assemblyId: string, data: ProbabilityFailureEntry) => void;
  getProbabilityFailure: (assemblyId: string) => ProbabilityFailureEntry[];
  updateProbabilityFailure: (assemblyId: string, id: string, data: ProbabilityFailureEntry) => void;
  deleteProbabilityFailure: (assemblyId: string, id: string) => void;

  // Actions for NPRD
  addNPRDData: (assemblyId: string, data: NPRDEntry) => void;
  getNPRDData: (assemblyId: string) => NPRDEntry[];
  updateNPRDData: (assemblyId: string, id: string, data: NPRDEntry) => void;
  deleteNPRDData: (assemblyId: string, id: string) => void;

  // Utility
  clearAllData: () => void;
}

export const useEtaBetaStore = create<EtaBetaStore>((set, get) => ({
  inputParams: {},
  actualDataPoints: {},
  intervalDataPoints: {},
  oemData: {},
  oemExpertData: {},
  expertJudgement: {},
  probabilityFailure: {},
  nprdData: {},

  // Input Parameters (single entry per assembly)
  setInputParams: (assemblyId, data) =>
    set((state) => ({
      inputParams: { ...state.inputParams, [assemblyId]: data },
    })),

  getInputParams: (assemblyId) => get().inputParams[assemblyId] || null,

  deleteInputParams: (assemblyId) =>
    set((state) => {
      const { [assemblyId]: _, ...rest } = state.inputParams;
      return { inputParams: rest };
    }),

  // Actual Data Points (multiple entries per assembly)
  addActualDataPoint: (assemblyId, data) =>
    set((state) => ({
      actualDataPoints: {
        ...state.actualDataPoints,
        [assemblyId]: [...(state.actualDataPoints[assemblyId] || []), data],
      },
    })),

  getActualDataPoints: (assemblyId) => get().actualDataPoints[assemblyId] || [],

  updateActualDataPoint: (assemblyId, id, data) =>
    set((state) => ({
      actualDataPoints: {
        ...state.actualDataPoints,
        [assemblyId]: (state.actualDataPoints[assemblyId] || []).map((item) =>
          item.id === id ? data : item
        ),
      },
    })),

  deleteActualDataPoint: (assemblyId, id) =>
    set((state) => ({
      actualDataPoints: {
        ...state.actualDataPoints,
        [assemblyId]: (state.actualDataPoints[assemblyId] || []).filter(
          (item) => item.id !== id
        ),
      },
    })),

  // Interval Data Points
  addIntervalDataPoint: (assemblyId, data) =>
    set((state) => ({
      intervalDataPoints: {
        ...state.intervalDataPoints,
        [assemblyId]: [...(state.intervalDataPoints[assemblyId] || []), data],
      },
    })),

  getIntervalDataPoints: (assemblyId) => get().intervalDataPoints[assemblyId] || [],

  updateIntervalDataPoint: (assemblyId, id, data) =>
    set((state) => ({
      intervalDataPoints: {
        ...state.intervalDataPoints,
        [assemblyId]: (state.intervalDataPoints[assemblyId] || []).map((item) =>
          item.id === id ? data : item
        ),
      },
    })),

  deleteIntervalDataPoint: (assemblyId, id) =>
    set((state) => ({
      intervalDataPoints: {
        ...state.intervalDataPoints,
        [assemblyId]: (state.intervalDataPoints[assemblyId] || []).filter(
          (item) => item.id !== id
        ),
      },
    })),

  // OEM Data
  addOEMData: (assemblyId, data) =>
    set((state) => ({
      oemData: {
        ...state.oemData,
        [assemblyId]: [...(state.oemData[assemblyId] || []), data],
      },
    })),

  getOEMData: (assemblyId) => get().oemData[assemblyId] || [],

  updateOEMData: (assemblyId, id, data) =>
    set((state) => ({
      oemData: {
        ...state.oemData,
        [assemblyId]: (state.oemData[assemblyId] || []).map((item) =>
          item.id === id ? data : item
        ),
      },
    })),

  deleteOEMData: (assemblyId, id) =>
    set((state) => ({
      oemData: {
        ...state.oemData,
        [assemblyId]: (state.oemData[assemblyId] || []).filter((item) => item.id !== id),
      },
    })),

  // OEM Expert Data
  addOEMExpertData: (assemblyId, data) =>
    set((state) => ({
      oemExpertData: {
        ...state.oemExpertData,
        [assemblyId]: [...(state.oemExpertData[assemblyId] || []), data],
      },
    })),

  getOEMExpertData: (assemblyId) => get().oemExpertData[assemblyId] || [],

  updateOEMExpertData: (assemblyId, id, data) =>
    set((state) => ({
      oemExpertData: {
        ...state.oemExpertData,
        [assemblyId]: (state.oemExpertData[assemblyId] || []).map((item) =>
          item.id === id ? data : item
        ),
      },
    })),

  deleteOEMExpertData: (assemblyId, id) =>
    set((state) => ({
      oemExpertData: {
        ...state.oemExpertData,
        [assemblyId]: (state.oemExpertData[assemblyId] || []).filter(
          (item) => item.id !== id
        ),
      },
    })),

  // Expert Judgement
  addExpertJudgement: (assemblyId, data) =>
    set((state) => ({
      expertJudgement: {
        ...state.expertJudgement,
        [assemblyId]: [...(state.expertJudgement[assemblyId] || []), data],
      },
    })),

  getExpertJudgement: (assemblyId) => get().expertJudgement[assemblyId] || [],

  updateExpertJudgement: (assemblyId, id, data) =>
    set((state) => ({
      expertJudgement: {
        ...state.expertJudgement,
        [assemblyId]: (state.expertJudgement[assemblyId] || []).map((item) =>
          item.id === id ? data : item
        ),
      },
    })),

  deleteExpertJudgement: (assemblyId, id) =>
    set((state) => ({
      expertJudgement: {
        ...state.expertJudgement,
        [assemblyId]: (state.expertJudgement[assemblyId] || []).filter(
          (item) => item.id !== id
        ),
      },
    })),

  // Probability Failure
  addProbabilityFailure: (assemblyId, data) =>
    set((state) => ({
      probabilityFailure: {
        ...state.probabilityFailure,
        [assemblyId]: [...(state.probabilityFailure[assemblyId] || []), data],
      },
    })),

  getProbabilityFailure: (assemblyId) => get().probabilityFailure[assemblyId] || [],

  updateProbabilityFailure: (assemblyId, id, data) =>
    set((state) => ({
      probabilityFailure: {
        ...state.probabilityFailure,
        [assemblyId]: (state.probabilityFailure[assemblyId] || []).map((item) =>
          item.id === id ? data : item
        ),
      },
    })),

  deleteProbabilityFailure: (assemblyId, id) =>
    set((state) => ({
      probabilityFailure: {
        ...state.probabilityFailure,
        [assemblyId]: (state.probabilityFailure[assemblyId] || []).filter(
          (item) => item.id !== id
        ),
      },
    })),

  // NPRD Data
  addNPRDData: (assemblyId, data) =>
    set((state) => ({
      nprdData: {
        ...state.nprdData,
        [assemblyId]: [...(state.nprdData[assemblyId] || []), data],
      },
    })),

  getNPRDData: (assemblyId) => get().nprdData[assemblyId] || [],

  updateNPRDData: (assemblyId, id, data) =>
    set((state) => ({
      nprdData: {
        ...state.nprdData,
        [assemblyId]: (state.nprdData[assemblyId] || []).map((item) =>
          item.id === id ? data : item
        ),
      },
    })),

  deleteNPRDData: (assemblyId, id) =>
    set((state) => ({
      nprdData: {
        ...state.nprdData,
        [assemblyId]: (state.nprdData[assemblyId] || []).filter((item) => item.id !== id),
      },
    })),

  // Utility
  clearAllData: () =>
    set({
      inputParams: {},
      actualDataPoints: {},
      intervalDataPoints: {},
      oemData: {},
      oemExpertData: {},
      expertJudgement: {},
      probabilityFailure: {},
      nprdData: {},
    }),
}));