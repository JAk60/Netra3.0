import { create } from 'zustand';

interface EtaBetaStore {
  formData: {
    inputParams: any;
    actualDataPoint: any;
    intervalDataPoint: any;
    oem: any;
    oemExpert: any;
    expertJudgement: any;
    probabilityFailure: any;
    nprd: any;
  };
  updateFormData: (formType: string, data: any) => void;
  resetFormData: (formType: string) => void;
}

export const useEtaBetaStore = create<EtaBetaStore>((set) => ({
  formData: {
    inputParams: null,
    actualDataPoint: null,
    intervalDataPoint: null,
    oem: null,
    oemExpert: null,
    expertJudgement: null,
    probabilityFailure: null,
    nprd: null,
  },
  updateFormData: (formType, data) =>
    set((state) => ({
      formData: { ...state.formData, [formType]: data },
    })),
  resetFormData: (formType) =>
    set((state) => ({
      formData: { ...state.formData, [formType]: null },
    })),
}));

interface NPRDStore {
  nprdData: any;
  updateNPRDData: (data: any) => void;
  resetNPRDData: () => void;
}

export const useNPRDStore = create<NPRDStore>((set) => ({
  nprdData: null,
  updateNPRDData: (data) => set({ nprdData: data }),
  resetNPRDData: () => set({ nprdData: null }),
}));