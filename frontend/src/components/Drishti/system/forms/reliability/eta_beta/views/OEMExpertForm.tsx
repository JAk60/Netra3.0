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
import { oemExpertSchema, type OEMExpertData } from '@/lib/schemas/etabetaform';

export const OEMExpertForm: React.FC = () => {
    const { updateFormData } = useEtaBetaStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<OEMExpertData>({
        resolver: zodResolver(oemExpertSchema),
    });

    const onSubmit = async (data: OEMExpertData) => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateFormData('oemExpert', data);
        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>OEM + Expert Judgement</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label>Component Name</Label>
                        <Input {...register('componentName')} />
                        {errors.componentName && <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>Most Likely Life</Label>
                            <Input type="number" step="0.01" {...register('mostLikely')} />
                            {errors.mostLikely && <p className="text-sm text-red-500 mt-1">{String(errors.mostLikely.message)}</p>}
                        </div>
                        <div>
                            <Label>Maximum Life</Label>
                            <Input type="number" step="0.01" {...register('maxLife')} />
                            {errors.maxLife && <p className="text-sm text-red-500 mt-1">{String(errors.maxLife.message)}</p>}
                        </div>
                        <div>
                            <Label>Minimum Life</Label>
                            <Input type="number" step="0.01" {...register('minLife')} />
                            {errors.minLife && <p className="text-sm text-red-500 mt-1">{String(errors.minLife.message)}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Components Without Failure</Label>
                            <Input type="number" {...register('componentFailure')} />
                            {errors.componentFailure && <p className="text-sm text-red-500 mt-1">{String(errors.componentFailure.message)}</p>}
                        </div>
                        <div>
                            <Label>Total Time Without Failure</Label>
                            <Input type="number" step="0.01" {...register('timeWoFailure')} />
                            {errors.timeWoFailure && <p className="text-sm text-red-500 mt-1">{String(errors.timeWoFailure.message)}</p>}
                        </div>
                    </div>

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">OEM + Expert data saved!</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Data
                        </Button>
                        <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};