'use server';

import { revalidatePath } from 'next/cache';

import type {
    DashboardStats,
    ETLSchedule,
    ExecutionStatus,
    JobTriggerRequest,
    JobTriggerResponse,
    WatchmanAuditLog,
    WatchmanStatus
} from '@/types/etl';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WATCHMAN ACTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAllWatchmanStatus(): Promise<WatchmanStatus[]> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/watchman/status`, {
            cache: 'no-store',
            next: { tags: ['watchman-status'] }
        });

        if (!res.ok) throw new Error('Failed to fetch watchman status');

        return res.json();
    } catch (error) {
        console.error('Error fetching watchman status:', error);

        return [];
    }
}

export async function getComponentWatchmanStatus(componentId: string): Promise<WatchmanStatus | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/watchman/${componentId}`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch component watchman status');

        return res.json();
    } catch (error) {
        console.error('Error fetching component watchman status:', error);

        return null;
    }
}

export async function forceWatchmanCheck(componentId: string) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/watchman/${componentId}/force-check`, {
            method: 'POST'
        });

        if (!res.ok) throw new Error('Force check failed');

        revalidatePath('/etl');

        return { success: true, data: await res.json() };
    } catch (error) {
        console.error('Error forcing watchman check:', error);

        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function getWatchmanAuditHistory(): Promise<WatchmanAuditLog[]> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/watchman/audit/history`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch audit history');

        return res.json();
    } catch (error) {
        console.error('Error fetching audit history:', error);

        return [];
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JOB EXECUTION ACTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function triggerMonthlyUtilization(request: JobTriggerRequest): Promise<JobTriggerResponse | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/jobs/monthly-utilization/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });

        if (!res.ok) throw new Error('Failed to trigger monthly utilization');

        revalidatePath('/etl');

        return res.json();

    } catch (error) {
        console.error('Error triggering monthly utilization:', error);

        return null;
    }
}

export async function triggerOverhaulReadings(request: JobTriggerRequest): Promise<JobTriggerResponse | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/jobs/overhaul-readings/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });

        if (!res.ok) throw new Error('Failed to trigger overhaul readings');

        revalidatePath('/etl');

        return res.json();
    } catch (error) {
        console.error('Error triggering overhaul readings:', error);

        return null;
    }
}

export async function getJobStatus(executionId: string): Promise<ExecutionStatus | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/jobs/${executionId}/status`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch job status');

        return res.json();
    } catch (error) {
        console.error('Error fetching job status:', error);

        return null;
    }
}

export async function getActiveJobs(): Promise<ExecutionStatus[]> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/jobs/active`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch active jobs');

        // ⚡ FIXED: Backend now returns direct array
        return res.json();
    } catch (error) {
        console.error('Error fetching active jobs:', error);

        return [];
    }
}

export async function getJobHistory(): Promise<ExecutionStatus[]> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/jobs/history`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch job history');

        // ⚡ FIXED: Backend now returns direct array
        return res.json();
    } catch (error) {
        console.error('Error fetching job history:', error);

        return [];
    }
}

export async function cancelJob(executionId: string) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/jobs/${executionId}/cancel`, {
            method: 'POST'
        });

        if (!res.ok) throw new Error('Failed to cancel job');

        revalidatePath('/etl');
        
        return { success: true, data: await res.json() };

    } catch (error) {
        console.error('Error cancelling job:', error);

        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHEDULE ACTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAllSchedules(): Promise<ETLSchedule[]> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/schedule`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch schedules');

        return res.json();
    } catch (error) {
        console.error('Error fetching schedules:', error);

        return [];
    }
}

export async function getComponentSchedule(componentId: string): Promise<ETLSchedule | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/schedule/${componentId}`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch component schedule');

        return res.json();
    } catch (error) {
        console.error('Error fetching component schedule:', error);

        return null;
    }
}

export async function pauseSchedule(componentId: string) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/schedule/${componentId}/pause`, {
            method: 'POST'
        });

        if (!res.ok) throw new Error('Failed to pause schedule');

      
        revalidatePath('/etl');

        return { success: true, data: await res.json() };

    } catch (error) {
        console.error('Error pausing schedule:', error);

        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function resumeSchedule(componentId: string) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/schedule/${componentId}/resume`, {
            method: 'POST'
        });

        if (!res.ok) throw new Error('Failed to resume schedule');

        revalidatePath('/etl');

        return { success: true, data: await res.json() };

    } catch (error) {
        console.error('Error resuming schedule:', error);

        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function updateSchedule(componentId: string, data: Partial<ETLSchedule>) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/schedule/${componentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Failed to update schedule');

        revalidatePath('/etl');

        return { success: true, data: await res.json() };
    } catch (error) {
        console.error('Error updating schedule:', error);

        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD STATS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getDashboardStats(): Promise<DashboardStats | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/dashboard/stats`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch dashboard stats');

        return res.json();
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);

        return null;
    }
}

export async function getWatchmanDashboardStats() {
    try {
        const res = await fetch(`${API_BASE}/api/v1/watchman/statistics/dashboard`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch watchman dashboard stats');

        return res.json();
    } catch (error) {
        console.error('Error fetching watchman dashboard stats:', error);

        return null;
    }
}

export async function getWatchmanStatistics(days: number = 7) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/watchman/statistics/daily?days=${days}`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch watchman statistics');

        return res.json();
    } catch (error) {
        console.error('Error fetching watchman statistics:', error);

        return [];
    }
}



export async function getAllShips() {
    try {
        const res = await fetch(`${API_BASE}/ships`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch ships');

        return res.json();
    } catch (error) {
        console.error('Error fetching ships:', error);

        return [];
    }
}

export async function getDepartmentsByShip(shipId: number) {
    try {
        const res = await fetch(`${API_BASE}/ships/${shipId}/departments`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to fetch departments');

        return res.json();
    } catch (error) {
        console.error('Error fetching departments:', error);

        return [];
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT ETL MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getComponentsByFilters(shipId: number, departmentId: number) {
    try {
        const res = await fetch(
            `${API_BASE}/api/v1/etl/components?ship_id=${shipId}&department_id=${departmentId}`,
            {
                cache: 'no-store'
            }
        );

        if (!res.ok) throw new Error('Failed to fetch components');

        return res.json();
    } catch (error) {
        console.error('Error fetching components:', error);

        return [];
    }
}

export async function toggleETL(componentId: string, enable: boolean) {
    try {
        const res = await fetch(
            `${API_BASE}/api/v1/etl/components/${componentId}/toggle?enable=${enable}`,
            {
                method: 'POST'
            }
        );

        if (!res.ok) throw new Error('Failed to toggle ETL');

        revalidatePath('/etl');

        return { success: true, data: await res.json() };
    } catch (error) {
        console.error('Error toggling ETL:', error);

        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}