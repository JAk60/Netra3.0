import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Trash2, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createProbabilityFailureBulk } from '@/actions/eta_beta';
import { z } from 'zod';

const schema = z.object({
  p_time: z.number({ invalid_type_error: 'Required' }).positive('Must be positive'),
  failure_p: z.number({ invalid_type_error: 'Required' }).min(0).max(100, 'Must be 0–100'),
});

type FormData = z.infer<typeof schema>;

interface StagedRow extends FormData {
  id: string;
}

interface Props {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const ProbabilityFailureForm: React.FC<Props> = ({ selectedAssembly, assemblyLabel }) => {
  const [staged, setStaged] = useState<StagedRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const addRow = (data: FormData) => {
    setStaged(prev => [...prev, { ...data, id: `${Date.now()}-${Math.random()}` }]);
    reset();
    toast.success('Row added');
  };

  const removeRow = (id: string) => setStaged(prev => prev.filter(r => r.id !== id));

  const submitAll = async () => {
    if (staged.length === 0) return;
    setIsSubmitting(true);
    try {
      await createProbabilityFailureBulk(
        staged.map(r => ({
          component_id: selectedAssembly,
          p_time: r.p_time,
          failure_p: r.failure_p,
        }))
      );
      toast.success(`${staged.length} record${staged.length > 1 ? 's' : ''} saved!`);
      setStaged([]);
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
          <CardTitle className="text-lg">Probability of Failure — {assemblyLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Time T&lt; (hrs)</Label>
              <Input type="number" step="0.01" placeholder="e.g. 8760" {...register('p_time', { valueAsNumber: true })} />
              {errors.p_time && <p className="text-sm text-red-500 mt-1">{errors.p_time.message}</p>}
            </div>
            <div>
              <Label>Failure Probability (%)</Label>
              <Input type="number" step="0.01" placeholder="e.g. 10" {...register('failure_p', { valueAsNumber: true })} />
              {errors.failure_p && <p className="text-sm text-red-500 mt-1">{errors.failure_p.message}</p>}
            </div>
          </div>
          <Button type="button" variant="outline" onClick={handleSubmit(addRow)} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Row
          </Button>
        </CardContent>
      </Card>

      {staged.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Staged Rows ({staged.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {staged.map(row => (
              <div key={row.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <span>T&lt; {row.p_time} hrs</span>
                <span className="font-mono">{row.failure_p}%</span>
                <Button size="sm" variant="ghost" onClick={() => removeRow(row.id)} disabled={isSubmitting}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button onClick={submitAll} disabled={isSubmitting} className="w-full mt-2">
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                : <><Send className="w-4 h-4 mr-2" />Submit {staged.length} Record{staged.length > 1 ? 's' : ''} to Server</>
              }
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};