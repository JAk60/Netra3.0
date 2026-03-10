import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { createExpertJudgement } from '@/actions/eta_beta';
import { z } from 'zod';

const schema = z.object({
  most_likely_life: z.number({ invalid_type_error: 'Required' }).positive(),
  max_life: z.number({ invalid_type_error: 'Required' }).positive(),
  min_life: z.number({ invalid_type_error: 'Required' }).positive(),
  num_component_wo_failure: z.number({ invalid_type_error: 'Required' }).int().nonnegative(),
  time_wo_failure: z.number({ invalid_type_error: 'Required' }).nonnegative(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const ExpertJudgementForm: React.FC<Props> = ({ selectedAssembly, assemblyLabel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await createExpertJudgement({ component_id: selectedAssembly, ...data });
      toast.success('Expert Judgement saved!', { description: `Saved for ${assemblyLabel}` });
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
        <CardTitle className="text-lg">Expert Judgement — {assemblyLabel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Most Likely Life</Label>
            <Input type="number" step="0.01" {...register('most_likely_life', { valueAsNumber: true })} />
            {errors.most_likely_life && <p className="text-sm text-red-500 mt-1">{errors.most_likely_life.message}</p>}
          </div>
          <div>
            <Label>Max Life</Label>
            <Input type="number" step="0.01" {...register('max_life', { valueAsNumber: true })} />
            {errors.max_life && <p className="text-sm text-red-500 mt-1">{errors.max_life.message}</p>}
          </div>
          <div>
            <Label>Min Life</Label>
            <Input type="number" step="0.01" {...register('min_life', { valueAsNumber: true })} />
            {errors.min_life && <p className="text-sm text-red-500 mt-1">{errors.min_life.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Components Without Failure</Label>
            <Input type="number" {...register('num_component_wo_failure', { valueAsNumber: true })} />
            {errors.num_component_wo_failure && <p className="text-sm text-red-500 mt-1">{errors.num_component_wo_failure.message}</p>}
          </div>
          <div>
            <Label>Time Without Failure (hrs)</Label>
            <Input type="number" step="0.01" {...register('time_wo_failure', { valueAsNumber: true })} />
            {errors.time_wo_failure && <p className="text-sm text-red-500 mt-1">{errors.time_wo_failure.message}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1">
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              : <><Send className="w-4 h-4 mr-2" />Save Expert Judgement</>
            }
          </Button>
          <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
};