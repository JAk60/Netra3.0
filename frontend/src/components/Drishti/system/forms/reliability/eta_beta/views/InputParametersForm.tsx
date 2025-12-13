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
import { InputParamsData, inputParamsSchema } from '@/lib/schemas/etabetaform';


export const InputParametersForm: React.FC = () => {
    const { updateFormData } = useEtaBetaStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<InputParamsData>({
        resolver: zodResolver(inputParamsSchema),
    });

    const onSubmit = async (data: InputParamsData) => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateFormData('inputParams', data);
        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Input Parameters (Eta/Beta)</CardTitle>
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
                            <Label htmlFor="scaleParameter">Eta (η) - Scale Parameter</Label>
                            <Input id="scaleParameter" type="number" step="0.01" {...register('scaleParameter')} />
                            {errors.scaleParameter && (
                                <p className="text-sm text-red-500 mt-1">{String(errors.scaleParameter.message)}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="shapeParameter">Beta (β) - Shape Parameter</Label>
                            <Input id="shapeParameter" type="number" step="0.01" {...register('shapeParameter')} />
                            {errors.shapeParameter && (
                                <p className="text-sm text-red-500 mt-1">{String(errors.shapeParameter.message)}</p>
                            )}
                        </div>
                    </div>

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                Parameters saved successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Parameters
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