import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { createOEMData } from '@/actions/eta_beta';
import { z } from 'zod';

const schema = z.object({
  L10: z.number({ invalid_type_error: 'Required' }).positive('L10 must be positive'),
  L90: z.number({ invalid_type_error: 'Required' }).positive('L90 must be positive'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const OEMForm: React.FC<Props> = ({ selectedAssembly, assemblyLabel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await createOEMData({
        component_id: selectedAssembly,
        life_estimate1_name: 'L10',
        life_estimate1_val: data.L10,
        life_estimate2_name: 'L90',
        life_estimate2_val: data.L90,
      });
      toast.success('OEM data saved!', { description: `Saved for ${assemblyLabel}` });
      reset();
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
        <CardTitle className="text-lg">OEM Data — {assemblyLabel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>L10 Life Estimate</Label>
            <Input type="number" step="0.01" placeholder="e.g. 5000" {...register('L10', { valueAsNumber: true })} />
            {errors.L10 && <p className="text-sm text-red-500 mt-1">{errors.L10.message}</p>}
          </div>
          <div>
            <Label>L90 Life Estimate</Label>
            <Input type="number" step="0.01" placeholder="e.g. 20000" {...register('L90', { valueAsNumber: true })} />
            {errors.L90 && <p className="text-sm text-red-500 mt-1">{errors.L90.message}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              : <><Send className="w-4 h-4 mr-2" />Save OEM Data</>
            }
          </Button>
          <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
};