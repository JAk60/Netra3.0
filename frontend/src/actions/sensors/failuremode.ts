'use server'

import { revalidatePath } from 'next/cache';

interface CreateFailureModeData {
    name: string;
    severity: string;
    component_id: string;
}

export async function createFailureMode(data: CreateFailureModeData) {
    try {
        const response = await fetch('http://localhost:8000/sensors/create_failure_mode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store'
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.detail || 'Failed to create failure mode'
            };
        }

        const failureMode = await response.json();
        
        // Revalidate the page to show new failure mode
        revalidatePath('/sensors');
        
        return {
            success: true,
            data: failureMode
        };
    } catch (error) {
        console.error('Error creating failure mode:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create failure mode'
        };
    }
}