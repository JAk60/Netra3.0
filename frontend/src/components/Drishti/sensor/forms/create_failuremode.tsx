import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { createFailureMode } from '@/actions/sensors/failuremode';

// ============= ZOD SCHEMA =============
const failureModeSchema = z.object({
    name: z.string().min(1, 'Failure mode name is required').max(100, 'Max 100 characters'),
    severity: z.string().min(1, 'Severity is required'),
    component_id: z.string().uuid('Invalid component UUID')
});

type FailureModeFormData = z.infer<typeof failureModeSchema>;

// ============= ADD FAILURE MODE FORM COMPONENT =============
interface AddFailureModeFormProps {
    componentId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddFailureModeForm({ componentId, onClose, onSuccess }: AddFailureModeFormProps) {
    
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FailureModeFormData>({
        resolver: zodResolver(failureModeSchema),
        defaultValues: {
            name: '',
            severity: '',
            component_id: componentId
        }
    });

    const onSubmitHandler = async (data: FailureModeFormData, e?: React.BaseSyntheticEvent) => {
        e?.preventDefault(); // Explicitly prevent default
        console.log('>>>>>>data', data);
        try {
            const result = await createFailureMode({
                name: data.name,
                severity: data.severity,
                component_id: data.component_id
            });

            if (!result.success) {
                toast.error(result.error || 'Failed to create failure mode. Please try again.');
                return;
            }

            toast.success('Failure mode created successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error creating failure mode:', error);
            toast.error('Failed to create failure mode. Please try again.');
        }
    };

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Add New Failure Mode</h3>
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
                            <Label htmlFor="name">Failure Mode Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Bearing Wear, Overheating"
                                {...register('name')}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="severity">Severity *</Label>
                            <Controller
                                name="severity"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || ''}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select severity level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Critical">Critical</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.severity && (
                                <p className="text-sm text-destructive">{errors.severity.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Failure Mode'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}