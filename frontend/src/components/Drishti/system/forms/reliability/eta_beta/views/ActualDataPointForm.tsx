import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Trash2, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createActualDataBulk } from '@/actions/eta_beta';
import { z } from 'zod';

const schema = z.object({
  interval_start_date: z.string().min(1, 'Installation date required'),
  interval_end_date: z.string().min(1, 'Removal date required'),
  f_s: z.enum(['Failure', 'Suspension']),
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

export const ActualDataPointForm: React.FC<Props> = ({
  selectedAssembly,
  assemblyLabel,
}) => {
  const [staged, setStaged] = useState<StagedRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { f_s: 'Failure' },
  });

  const addRow = (data: FormData) => {
    setStaged(prev => [...prev, { ...data, id: `${Date.now()}-${Math.random()}` }]);
    reset({ f_s: 'Failure' });
    toast.success('Row added to staging');
  };

  const removeRow = (id: string) => setStaged(prev => prev.filter(r => r.id !== id));

  const submitAll = async () => {
    if (staged.length === 0) return;
    setIsSubmitting(true);
    try {
      await createActualDataBulk(
        staged.map(r => ({
          component_id: selectedAssembly,
          interval_start_date: r.interval_start_date,
          interval_end_date: r.interval_end_date,
          f_s: r.f_s,
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
          <CardTitle className="text-lg">Actual Data Point — {assemblyLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Installation Date</Label>
              <Input type="date" {...register('interval_start_date')} />
              {errors.interval_start_date && <p className="text-sm text-red-500 mt-1">{errors.interval_start_date.message}</p>}
            </div>
            <div>
              <Label>Removal Date</Label>
              <Input type="date" {...register('interval_end_date')} />
              {errors.interval_end_date && <p className="text-sm text-red-500 mt-1">{errors.interval_end_date.message}</p>}
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <select {...register('f_s')} className="w-full px-3 py-2 border rounded-md bg-background text-sm">
              <option value="Failure">Failure</option>
              <option value="Suspension">Suspension</option>
            </select>
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
                <span>{row.interval_start_date} → {row.interval_end_date}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${row.f_s === 'Failure' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {row.f_s}
                </span>
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