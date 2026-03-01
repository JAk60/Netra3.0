"use server";

import { revalidatePath } from "next/cache";

const API_BASE = process.env.BACKEND_URL ?? "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UtilizationRecord {
    id: string;
    operation_date: string; // "2024-01-01T00:00:00"
    utlization: string;     // Decimal as string
    component_id: string;
}

export interface CurrentAgeResponse {
    component_id: string;
    age: number | null;
}

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T = void>(
    path: string,
    init?: RequestInit
): Promise<ActionResult<T>> {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...(init?.headers ?? {}),
            },
        });

        if (res.status === 204) return { success: true } as ActionResult<T>;

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
            return {
                success: false,
                error: body?.detail ?? `Request failed with status ${res.status}`,
            };
        }

        return { success: true, data: body as T };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Network error" };
    }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function getUtilizationRecords(
    componentId: string
): Promise<ActionResult<UtilizationRecord[]>> {
    return apiFetch<UtilizationRecord[]>(
        `/monthly-utilization?component_id=${componentId}`
    );
}

export async function getCurrentAge(
    componentId: string
): Promise<ActionResult<CurrentAgeResponse>> {
    return apiFetch<CurrentAgeResponse>(
        `/monthly-utilization/current-age?component_id=${componentId}`
    );
}

export async function getUtilizationRecord(
    recordId: string
): Promise<ActionResult<UtilizationRecord>> {
    return apiFetch<UtilizationRecord>(`/monthly-utilization/${recordId}`);
}

export async function createUtilizationRecord(payload: {
    component_id: string;
    operation_date: string;
    utlization: string;
}): Promise<ActionResult<UtilizationRecord>> {
    const result = await apiFetch<UtilizationRecord>("/monthly-utilization", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (result.success) revalidatePath("/");
    return result;
}

export async function updateUtilizationRecord(
    recordId: string,
    payload: { operation_date?: string; utlization?: string }
): Promise<ActionResult<UtilizationRecord>> {
    const result = await apiFetch<UtilizationRecord>(
        `/monthly-utilization/${recordId}`,
        { method: "PATCH", body: JSON.stringify(payload) }
    );
    if (result.success) revalidatePath("/");
    return result;
}

export async function deleteUtilizationRecord(
    recordId: string
): Promise<ActionResult<void>> {
    const result = await apiFetch<void>(`/monthly-utilization/${recordId}`, {
        method: "DELETE",
    });
    if (result.success) revalidatePath("/");
    return result;
}

export async function bulkInsertUtilization(
    records: Array<{
        component_id: string;
        operation_date: string;
        utlization: string;
    }>
): Promise<ActionResult<{ inserted: number; message: string }>> {
    const result = await apiFetch<{ inserted: number; message: string }>(
        "/monthly-utilization/bulk",
        { method: "POST", body: JSON.stringify({ records }) }
    );
    if (result.success) revalidatePath("/");
    return result;
}