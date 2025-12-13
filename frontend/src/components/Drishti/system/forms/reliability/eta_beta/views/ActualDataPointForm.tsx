import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';

import { actualDataPointSchema, type ActualDataPointData } from '@/lib/schemas/etabetaform';
import { useEtaBetaStore } from '@/store/etabetaStore';

export const ActualDataPointForm: React.FC = () => {
    const { updateFormData } = useEtaBetaStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ActualDataPointData>({
        resolver: zodResolver(actualDataPointSchema),
        defaultValues: { status: 'Failure' },
    });

    const onSubmit = async (data: ActualDataPointData) => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateFormData('actualDataPoint', data);
        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Actual Data Point</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="componentName">Component Name</Label>
                        <Input id="componentName" {...register('componentName')} />
                        {errors.componentName && (
                            <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="installationDate">Installation Date</Label>
                            <Input id="installationDate" type="date" {...register('installationDate')} />
                            {errors.installationDate && (
                                <p className="text-sm text-red-500 mt-1">{String(errors.installationDate.message)}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="removalDate">Removal Date</Label>
                            <Input id="removalDate" type="date" {...register('removalDate')} />
                            {errors.removalDate && (
                                <p className="text-sm text-red-500 mt-1">{String(errors.removalDate.message)}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="Failure">Failure</option>
                            <option value="Suspension">Suspension</option>
                        </select>
                    </div>

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">Data point saved successfully!</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Data Point
                        </Button>
                        <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};