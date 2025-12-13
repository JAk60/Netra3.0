'use server';

import { z } from 'zod';

// Define the schema for validation
const componentSchema = z.object({
  componentName: z.string().min(1, 'Component name is required').min(3, 'Component name must be at least 3 characters'),
  nomenclature: z.string().min(1, 'Nomenclature is required'),
  systemType: z.string().min(1, 'System is required'),
  departmentId: z.string().uuid('Invalid department ID'),
  parentId: z.string().optional(),
  cmmsCode: z.string().optional(),
  repairType: z.enum(['repairable', 'replaceable'], {
    required_error: 'Repair type is required',
  }),
});

type ComponentFormData = z.infer<typeof componentSchema>;

interface CreateComponentResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function createComponent(
  formData: ComponentFormData,
  shipId: string,
  systemId: string
): Promise<CreateComponentResponse> {
  try {
    // Validate the input
    const validatedData = componentSchema.parse(formData);

    // Prepare the payload for the API
    const payload = {
      component_name: validatedData.componentName,
      system_id: systemId,
      ship_id: shipId,
      department_id: validatedData.departmentId,
      parent_id: validatedData.parentId && validatedData.parentId !== 'none' 
        ? validatedData.parentId 
        : null,
      CMMS_EquipmentCode: validatedData.cmmsCode || null,
      is_lmu: 1, // Always set to 1 as per requirements
      nomenclature: validatedData.nomenclature,
      RepairType: validatedData.repairType,
      etl: true,
    };

    // Make the API call to your backend
    const response = await fetch(`http://localhost:8000/components`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create component');
    }

    const data = await response.json();

    return {
      success: true,
      message: 'Component created successfully!',
      data,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create component',
    };
  }
}