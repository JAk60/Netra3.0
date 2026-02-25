import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
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
}

export default function AddFailureModeForm({ componentId }: AddFailureModeFormProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FailureModeFormData>({
        resolver: zodResolver(failureModeSchema),
        defaultValues: {
            name: '',
            severity: '',
            component_id: componentId
        }
    });

    const onSubmit = async (data: FailureModeFormData) => {
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
            reset();
            setIsExpanded(false);
        } catch (error) {
            console.error('Error creating failure mode:', error);
            toast.error('Failed to create failure mode. Please try again.');
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-black rounded-lg shadow-lg border border-black-800">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-lg font-medium mb-4 hover:opacity-70 transition-opacity text-black-100"
            >
                <span>Add Failure Mode</span>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {isExpanded && (
                <Card className="p-6 space-y-4">
                    <CardTitle className="text-xl">Add New Failure Mode</CardTitle>

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }} className="space-y-4">
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
                                        <Select value={field.value || ''} onValueChange={field.onChange}>
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

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Failure Mode'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
}