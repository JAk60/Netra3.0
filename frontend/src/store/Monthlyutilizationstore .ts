import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
    UtilizationRecord,
    getUtilizationRecords,
    getCurrentAge,
    createUtilizationRecord,
    updateUtilizationRecord,
    deleteUtilizationRecord,
    bulkInsertUtilization,
} from "@/actions/Monthlyutilization ";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoadState = "idle" | "loading" | "error";

interface UtilizationState {
    // Data
    records: UtilizationRecord[];
    currentAge: number | null;
    activeComponentId: string | null;

    // Loading flags
    recordsState: LoadState;
    ageState: LoadState;
    inserting: boolean;
    updatingId: string | null;
    deletingId: string | null;

    // Error messages
    recordsError: string | null;
    mutationError: string | null;

    // Actions
    loadRecords: (componentId: string) => Promise<void>;
    loadCurrentAge: (componentId: string) => Promise<void>;
    loadAll: (componentId: string) => Promise<void>;

    createRecord: (payload: {
        component_id: string;
        operation_date: string;
        utlization: string;
    }) => Promise<boolean>;

    bulkInsert: (
        records: Array<{
            component_id: string;
            operation_date: string;
            utlization: string;
        }>
    ) => Promise<{ inserted: number } | null>;

    updateRecord: (
        recordId: string,
        payload: { operation_date?: string; utlization?: string }
    ) => Promise<boolean>;

    deleteRecord: (recordId: string) => Promise<boolean>;

    clearErrors: () => void;
    reset: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMonthlyUtilizationStore = create<UtilizationState>()(
    immer((set, get) => ({
        // ── Initial state ───────────────────────────────────────────────────
        records: [],
        currentAge: null,
        activeComponentId: null,

        recordsState: "idle",
        ageState: "idle",
        inserting: false,
        updatingId: null,
        deletingId: null,

        recordsError: null,
        mutationError: null,

        // ── Load records ────────────────────────────────────────────────────
        loadRecords: async (componentId) => {
            set((s) => {
                s.recordsState = "loading";
                s.recordsError = null;
                s.activeComponentId = componentId;
            });

            const result = await getUtilizationRecords(componentId);

            set((s) => {
                if (result.success && result.data) {
                    s.records = result.data;
                    s.recordsState = "idle";
                } else {
                    s.recordsState = "error";
                    s.recordsError = result.error ?? "Failed to load records";
                }
            });
        },

        // ── Load current age ────────────────────────────────────────────────
        loadCurrentAge: async (componentId) => {
            set((s) => {
                s.ageState = "loading";
            });

            const result = await getCurrentAge(componentId);

            set((s) => {
                if (result.success && result.data) {
                    s.currentAge = result.data.age;
                    s.ageState = "idle";
                } else {
                    s.ageState = "error";
                }
            });
        },

        // ── Load both ───────────────────────────────────────────────────────
        loadAll: async (componentId) => {
            await Promise.all([
                get().loadRecords(componentId),
                get().loadCurrentAge(componentId),
            ]);
        },

        // ── Create single ───────────────────────────────────────────────────
        createRecord: async (payload) => {
            set((s) => {
                s.inserting = true;
                s.mutationError = null;
            });

            const result = await createUtilizationRecord(payload);

            set((s) => {
                s.inserting = false;
                if (result.success && result.data) {
                    // Optimistic prepend (newest first)
                    s.records.unshift(result.data);
                } else {
                    s.mutationError = result.error ?? "Failed to create record";
                }
            });

            // Refresh age after mutation
            if (result.success) {
                await get().loadCurrentAge(payload.component_id);
            }

            return result.success;
        },

        // ── Bulk insert ─────────────────────────────────────────────────────
        bulkInsert: async (records) => {
            set((s) => {
                s.inserting = true;
                s.mutationError = null;
            });

            const result = await bulkInsertUtilization(records);

            set((s) => {
                s.inserting = false;
                if (!result.success) {
                    s.mutationError = result.error ?? "Bulk insert failed";
                }
            });

            if (result.success && records[0]?.component_id) {
                // Reload full list so order is correct
                await get().loadAll(records[0].component_id);
            }

            return result.success && result.data ? result.data : null;
        },

        // ── Update ──────────────────────────────────────────────────────────
        updateRecord: async (recordId, payload) => {
            set((s) => {
                s.updatingId = recordId;
                s.mutationError = null;
            });

            const result = await updateUtilizationRecord(recordId, payload);

            set((s) => {
                s.updatingId = null;
                if (result.success && result.data) {
                    const idx = s.records.findIndex((r) => r.id === recordId);
                    if (idx !== -1) s.records[idx] = result.data;
                } else {
                    s.mutationError = result.error ?? "Failed to update record";
                }
            });

            if (result.success) {
                const componentId = get().activeComponentId;
                if (componentId) await get().loadCurrentAge(componentId);
            }

            return result.success;
        },

        // ── Delete ──────────────────────────────────────────────────────────
        deleteRecord: async (recordId) => {
            set((s) => {
                s.deletingId = recordId;
                s.mutationError = null;
            });

            const result = await deleteUtilizationRecord(recordId);

            set((s) => {
                s.deletingId = null;
                if (result.success) {
                    s.records = s.records.filter((r) => r.id !== recordId);
                } else {
                    s.mutationError = result.error ?? "Failed to delete record";
                }
            });

            if (result.success) {
                const componentId = get().activeComponentId;
                if (componentId) await get().loadCurrentAge(componentId);
            }

            return result.success;
        },

        // ── Utilities ───────────────────────────────────────────────────────
        clearErrors: () =>
            set((s) => {
                s.recordsError = null;
                s.mutationError = null;
            }),

        reset: () =>
            set((s) => {
                s.records = [];
                s.currentAge = null;
                s.activeComponentId = null;
                s.recordsState = "idle";
                s.ageState = "idle";
                s.inserting = false;
                s.updatingId = null;
                s.deletingId = null;
                s.recordsError = null;
                s.mutationError = null;
            }),
    }))
);