import { SensorMetadataCSV, SensorReadingCSV } from '@/types/Schema/sensor-reading.schema';
import { create } from 'zustand';

export type ImportType = 'metadata' | 'readings';

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

interface BulkImportState {
  // Import type
  importType: ImportType;
  setImportType: (type: ImportType) => void;
  
  // Component ID (from parent)
  componentId: string | null;
  setComponentId: (id: string | null) => void;
  
  // UI flow state
  isImportStarted: boolean;
  setIsImportStarted: (started: boolean) => void;
  
  // File state
  file: File | null;
  setFile: (file: File | null) => void;
  
  // Parsed data
  metadataData: SensorMetadataCSV[];
  setMetadataData: (data: SensorMetadataCSV[]) => void;
  
  readingsData: SensorReadingCSV[];
  setReadingsData: (data: SensorReadingCSV[]) => void;
  
  // Validation
  validationErrors: ValidationError[];
  setValidationErrors: (errors: ValidationError[]) => void;
  
  // UI state
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  
  // Upload state
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  
  uploadSuccess: boolean;
  setUploadSuccess: (success: boolean) => void;
  
  uploadedCount: number;
  setUploadedCount: (count: number) => void;
  
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  
  // Reset
  reset: () => void;
  softReset: () => void; // Keep import type, component ID, and isImportStarted
}

export const useBulkImportStore = create<BulkImportState>((set) => ({
  // Initial state
  importType: 'metadata',
  componentId: null,
  isImportStarted: false,
  file: null,
  metadataData: [],
  readingsData: [],
  validationErrors: [],
  showPreview: false,
  showConfirmDialog: false,
  isUploading: false,
  uploadSuccess: false,
  uploadedCount: 0,
  errorMessage: null,
  
  // Actions
  setImportType: (type) => set({ importType: type }),
  setComponentId: (id) => set({ componentId: id }),
  setIsImportStarted: (started) => set({ isImportStarted: started }),
  setFile: (file) => set({ file }),
  setMetadataData: (data) => set({ metadataData: data }),
  setReadingsData: (data) => set({ readingsData: data }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  setShowPreview: (show) => set({ showPreview: show }),
  setShowConfirmDialog: (show) => set({ showConfirmDialog: show }),
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  setUploadSuccess: (success) => set({ uploadSuccess: success }),
  setUploadedCount: (count) => set({ uploadedCount: count }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  
  reset: () => set({
    importType: 'metadata',
    componentId: null,
    isImportStarted: false,
    file: null,
    metadataData: [],
    readingsData: [],
    validationErrors: [],
    showPreview: false,
    showConfirmDialog: false,
    isUploading: false,
    uploadSuccess: false,
    uploadedCount: 0,
    errorMessage: null,
  }),
  
  softReset: () => set({
    file: null,
    metadataData: [],
    readingsData: [],
    validationErrors: [],
    showPreview: false,
    showConfirmDialog: false,
    isUploading: false,
    uploadSuccess: false,
    uploadedCount: 0,
    errorMessage: null,
    // Keep: importType, componentId, isImportStarted
  }),
}));

export type { ValidationError };