import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Loader2, CheckCircle2, Info } from 'lucide-react';

import { nprdSchema, type NPRDData } from '@/lib/schemas/etabetaform';
import { useNPRDStore } from '@/store/etabetaStore';

export const NPRDForm: React.FC = () => {
    const { updateNPRDData } = useNPRDStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<NPRDData>({
        resolver: zodResolver(nprdSchema),
        defaultValues: {
            componentName: '',
            failureRate: 2,
            beta: 2,
        },
    });

    const onSubmit = async (data: NPRDData) => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateNPRDData(data);
        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => setSuccess(false), 3000);
        console.log('NPRD Data submitted:', data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>NPRD (Navy Parts Reliability Data)</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInfo(!showInfo)}
                    >
                        <Info className="w-4 h-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {showInfo && (
                    <Alert className="mb-4 bg-blue-50 border-blue-200">
                        <AlertDescription className="text-sm text-blue-800">
                            <strong>Beta (β) Guidelines:</strong>
                            <br />
                            • If failure occurs in a narrow time window: use β = 2.5
                            <br />
                            • If failure occurs in a scattered time window: use β = 1.5
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="nprd-componentName">Component Name</Label>
                        <Input
                            id="nprd-componentName"
                            {...register('componentName')}
                            placeholder="Enter component name"
                        />
                        {errors.componentName && (
                            <p className="text-sm text-red-500 mt-1">
                                {String(errors.componentName.message)}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nprd-failureRate">Failure Rate</Label>
                            <Input
                                id="nprd-failureRate"
                                type="number"
                                step="0.01"
                                {...register('failureRate')}
                                placeholder="Enter failure rate"
                            />
                            {errors.failureRate && (
                                <p className="text-sm text-red-500 mt-1">
                                    {String(errors.failureRate.message)}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="nprd-beta">Beta (β) - Shape Parameter</Label>
                            <Input
                                id="nprd-beta"
                                type="number"
                                step="0.01"
                                {...register('beta')}
                                placeholder="Enter beta value"
                            />
                            {errors.beta && (
                                <p className="text-sm text-red-500 mt-1">
                                    {String(errors.beta.message)}
                                </p>
                            )}
                        </div>
                    </div>

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                NPRD data saved successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save NPRD Data
                        </Button>
                        <Button type="button" variant="outline" onClick={() => reset()}>
                            Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};