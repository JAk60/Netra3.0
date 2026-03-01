import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { saveOrUpdateEtaBeta } from '@/actions/eta_beta';
import { z } from 'zod';

const inputParamsSchema = z.object({
  scaleParameter: z.number().positive('Scale parameter (Eta) must be positive'),
  shapeParameter: z.number().positive('Shape parameter (Beta) must be positive'),
});

type InputParamsData = z.infer<typeof inputParamsSchema>;

interface InputParametersFormProps {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const InputParametersForm: React.FC<InputParametersFormProps> = ({
  selectedAssembly,
  assemblyLabel,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InputParamsData>({
    resolver: zodResolver(inputParamsSchema),
  });

  const onSubmit = async (data: InputParamsData) => {
    setIsSubmitting(true);
    try {
      await saveOrUpdateEtaBeta({
        component_id: selectedAssembly,
        eta: data.scaleParameter,
        beta: data.shapeParameter,
        priority: 1,
      });
      toast.success('Eta/Beta parameters saved!', {
        description: `Parameters updated for ${assemblyLabel}`,
      });
      reset();
      onSuccess();
    } catch (error) {
      toast.error('Submission failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Input Parameters (Eta/Beta) - {assemblyLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scaleParameter">Eta (η) - Scale Parameter</Label>
                <Input id="scaleParameter" type="number" step="0.01" {...register('scaleParameter', { valueAsNumber: true })} />
                {errors.scaleParameter && <p className="text-sm text-red-500 mt-1">{String(errors.scaleParameter.message)}</p>}
              </div>
              <div>
                <Label htmlFor="shapeParameter">Beta (β) - Shape Parameter</Label>
                <Input id="shapeParameter" type="number" step="0.01" {...register('shapeParameter', { valueAsNumber: true })} />
                {errors.shapeParameter && <p className="text-sm text-red-500 mt-1">{String(errors.shapeParameter.message)}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  : <><Send className="w-4 h-4 mr-2" />Save Eta/Beta Parameters</>
                }
              </Button>
              <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};