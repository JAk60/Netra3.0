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

const schema = z.object({
  eta: z.number({ invalid_type_error: 'Required' }).positive('Eta must be positive'),
  beta: z.number({ invalid_type_error: 'Required' }).positive('Beta must be positive'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const InputParametersForm: React.FC<Props> = ({
  selectedAssembly,
  assemblyLabel,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await saveOrUpdateEtaBeta({
        component_id: selectedAssembly,
        eta: data.eta,
        beta: data.beta,
        priority: 1,
      });
      toast.success('Eta/Beta parameters saved!', {
        description: `Saved for ${assemblyLabel}`,
      });
      reset();
      onSuccess();
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
        <CardTitle className="text-lg">Input Parameters (Eta/Beta) — {assemblyLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eta">Eta (η) — Scale Parameter</Label>
              <Input
                id="eta"
                type="number"
                step="0.01"
                placeholder="e.g. 15000"
                {...register('eta', { valueAsNumber: true })}
              />
              {errors.eta && <p className="text-sm text-red-500 mt-1">{errors.eta.message}</p>}
            </div>
            <div>
              <Label htmlFor="beta">Beta (β) — Shape Parameter</Label>
              <Input
                id="beta"
                type="number"
                step="0.01"
                placeholder="e.g. 1.25"
                {...register('beta', { valueAsNumber: true })}
              />
              {errors.beta && <p className="text-sm text-red-500 mt-1">{errors.beta.message}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                : <><Send className="w-4 h-4 mr-2" />Save Eta/Beta Parameters</>
              }
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};