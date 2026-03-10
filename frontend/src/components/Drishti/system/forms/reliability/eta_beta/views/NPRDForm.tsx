import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Loader2, Send, Info } from 'lucide-react';
import { toast } from 'sonner';
import { createNPRDData } from '@/actions/eta_beta';
import { z } from 'zod';

const schema = z.object({
  failure_rate: z.number({ invalid_type_error: 'Required' }).positive('Must be positive'),
  beta: z.number({ invalid_type_error: 'Required' }).positive('Must be positive'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const NPRDForm: React.FC<Props> = ({ selectedAssembly, assemblyLabel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { failure_rate: 2, beta: 2 },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await createNPRDData({
        component_id: selectedAssembly,
        failure_rate: data.failure_rate,
        beta: data.beta,
      });
      toast.success('NPRD data saved!', { description: `Saved for ${assemblyLabel}` });
      reset({ failure_rate: 2, beta: 2 });
    } catch (error) {
      toast.error('Failed to save', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>NPRD (Navy Parts Reliability Data) — {assemblyLabel}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowInfo(v => !v)}>
            <Info className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showInfo && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-800">
              <strong>Beta (β) Guidelines:</strong><br />
              • Failure in a narrow time window → use β = 2.5<br />
              • Failure in a scattered time window → use β = 1.5
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Failure Rate (λ)</Label>
            <Input type="number" step="0.01" placeholder="e.g. 2" {...register('failure_rate', { valueAsNumber: true })} />
            {errors.failure_rate && <p className="text-sm text-red-500 mt-1">{errors.failure_rate.message}</p>}
          </div>
          <div>
            <Label>Beta (β) — Shape Parameter</Label>
            <Input type="number" step="0.01" placeholder="1.5 or 2.5" {...register('beta', { valueAsNumber: true })} />
            {errors.beta && <p className="text-sm text-red-500 mt-1">{errors.beta.message}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              : <><Send className="w-4 h-4 mr-2" />Save NPRD Data</>
            }
          </Button>
          <Button type="button" variant="outline" onClick={() => reset({ failure_rate: 2, beta: 2 })} disabled={isSubmitting}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
};