import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner'; // or 'react-hot-toast' depending on your setup
import { FailureMode } from '../failure_mode_view';
import { createSensor } from '@/actions/sensors/metadata';


// ============= ZOD SCHEMA =============
const sensorSchema = z.object({
    sensor_name: z.string().min(1, 'Sensor name is required').max(255, 'Max 255 characters'),
    unit: z.string().max(50, 'Max 50 characters').optional(),
    min_value: z.coerce.number().min(0, 'Min value must be positive'),
    max_value: z.coerce.number().min(0, 'Max value must be positive'),
    frequency: z.coerce.number().optional().nullable(),
    P: z.coerce.number().optional().nullable(),
    F: z.coerce.number().optional().nullable(),
    component_id: z.string().uuid('Invalid component UUID'),
    failure_mode_id: z.string().optional()
}).refine(data => data.max_value > data.min_value, {
    message: 'Max value must be greater than min value',
    path: ['max_value']
});

type SensorFormData = z.infer<typeof sensorSchema>;

// ============= ADD SENSOR FORM COMPONENT =============
interface AddSensorFormProps {
    failureModes: FailureMode[];
    componentId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddSensorForm({failureModes, componentId, onClose, onSuccess }: AddSensorFormProps) {
    
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SensorFormData>({
        resolver: zodResolver(sensorSchema),
        defaultValues: {
            sensor_name: '',
            unit: '',
            min_value: undefined,
            max_value: undefined,
            frequency: undefined,
            P: undefined,
            F: undefined,
            component_id: componentId,
            failure_mode_id: '' // FIXED: Empty string as default for controlled component
        }
    });

    const onSubmitHandler = async (data: SensorFormData) => {
        console.log('>>>>>>data', data)
        try {
            // Use server action
            const result = await createSensor({
                sensor_name: data.sensor_name,
                unit: data.unit,
                min_value: data.min_value,
                max_value: data.max_value,
                frequency: data.frequency || null,
                P: data.P || null,
                F: data.F || null,
                component_id: data.component_id,
                failure_mode_id: data.failure_mode_id && data.failure_mode_id !== '' ? data.failure_mode_id : undefined
            });

            if (!result.success) {
                toast.error(result.error || 'Failed to create sensor. Please try again.');
                return;
            }

            toast.success('Sensor created successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error creating sensor:', error);
            toast.error('Failed to create sensor. Please try again.');
        }
    };

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Add New Sensor</h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                    </Button>
                </div>
                
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(onSubmitHandler)(e);
                }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sensor_name">Sensor Name *</Label>
                            <Input
                                id="sensor_name"
                                placeholder="e.g., Temperature Sensor 1"
                                {...register('sensor_name')}
                            />
                            {errors.sensor_name && (
                                <p className="text-sm text-destructive">{errors.sensor_name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                placeholder="e.g., °C, PSI, RPM"
                                {...register('unit')}
                            />
                            {errors.unit && (
                                <p className="text-sm text-destructive">{errors.unit.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="min_value">Min Value *</Label>
                            <Input
                                id="min_value"
                                type="number"
                                step="any"
                                placeholder="e.g., 0"
                                {...register('min_value')}
                            />
                            {errors.min_value && (
                                <p className="text-sm text-destructive">{errors.min_value.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_value">Max Value *</Label>
                            <Input
                                id="max_value"
                                type="number"
                                step="any"
                                placeholder="e.g., 100"
                                {...register('max_value')}
                            />
                            {errors.max_value && (
                                <p className="text-sm text-destructive">{errors.max_value.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency (Hz)</Label>
                            <Input
                                id="frequency"
                                type="number"
                                placeholder="e.g., 60"
                                {...register('frequency')}
                            />
                            {errors.frequency && (
                                <p className="text-sm text-destructive">{errors.frequency.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="P">P Value</Label>
                            <Input
                                id="P"
                                type="number"
                                step="any"
                                placeholder="e.g., 0.95"
                                {...register('P')}
                            />
                            {errors.P && (
                                <p className="text-sm text-destructive">{errors.P.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="F">F Value</Label>
                            <Input
                                id="F"
                                type="number"
                                step="any"
                                placeholder="e.g., 0.05"
                                {...register('F')}
                            />
                            {errors.F && (
                                <p className="text-sm text-destructive">{errors.F.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="failure_mode_id">Failure Mode</Label>
                            <Controller
                                name="failure_mode_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || ''} // FIXED: Always controlled with empty string
                                        onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a failure mode (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {failureModes.map((mode) => (
                                                <SelectItem key={mode.id} value={mode.id}>
                                                    {mode.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.failure_mode_id && (
                                <p className="text-sm text-destructive">{errors.failure_mode_id.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Sensor'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}