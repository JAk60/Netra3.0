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
import { oemSchema, type OEMData } from '@/lib/schemas/etabetaform';

export const OEMForm: React.FC = () => {
    const { updateFormData } = useEtaBetaStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<OEMData>({
        resolver: zodResolver(oemSchema),
    });

    const onSubmit = async (data: OEMData) => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateFormData('oem', data);
        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>OEM Data</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label>Component Name</Label>
                        <Input {...register('componentName')} />
                        {errors.componentName && <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>L10 Life Estimate</Label>
                            <Input type="number" step="0.01" {...register('L10')} />
                            {errors.L10 && <p className="text-sm text-red-500 mt-1">{String(errors.L10.message)}</p>}
                        </div>
                        <div>
                            <Label>L90 Life Estimate</Label>
                            <Input type="number" step="0.01" {...register('L90')} />
                            {errors.L90 && <p className="text-sm text-red-500 mt-1">{String(errors.L90.message)}</p>}
                        </div>
                    </div>

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">OEM data saved!</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save OEM Data
                        </Button>
                        <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};