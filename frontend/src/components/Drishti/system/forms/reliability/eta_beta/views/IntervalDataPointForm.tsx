import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useEtaBetaStore } from '@/store/etabetaStore';
import { intervalDataPointSchema, type IntervalDataPointData } from '@/lib/schemas/etabetaform';

export const IntervalDataPointForm: React.FC = () => {
    const { updateFormData } = useEtaBetaStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<IntervalDataPointData>({
        resolver: zodResolver(intervalDataPointSchema),
        defaultValues: { status: 'Suspension' },
    });

    const onSubmit = async (data: IntervalDataPointData) => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateFormData('intervalDataPoint', data);
        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Interval Data Point</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label>Component Name</Label>
                        <Input {...register('componentName')} />
                        {errors.componentName && <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>}
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium text-sm">Installation Interval</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" {...register('installationStartDate')} />
                                {errors.installationStartDate && <p className="text-sm text-red-500 mt-1">{String(errors.installationStartDate.message)}</p>}
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" {...register('installationEndDate')} />
                                {errors.installationEndDate && <p className="text-sm text-red-500 mt-1">{String(errors.installationEndDate.message)}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium text-sm">Removal Interval</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" {...register('removalStartDate')} />
                                {errors.removalStartDate && <p className="text-sm text-red-500 mt-1">{String(errors.removalStartDate.message)}</p>}
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" {...register('removalEndDate')} />
                                {errors.removalEndDate && <p className="text-sm text-red-500 mt-1">{String(errors.removalEndDate.message)}</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Status</Label>
                        <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="Failure">Failure</option>
                            <option value="Suspension">Suspension</option>
                        </select>
                    </div>

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">Interval data saved!</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Interval Data
                        </Button>
                        <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};