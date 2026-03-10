import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Trash2, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createIntervalDataBulk } from '@/actions/eta_beta';
import { z } from 'zod';

const schema = z.object({
  installation_start_date: z.string().min(1, 'Required'),
  installation_end_date: z.string().min(1, 'Required'),
  removal_start_date: z.string().min(1, 'Required'),
  removal_end_date: z.string().min(1, 'Required'),
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

export const IntervalDataPointForm: React.FC<Props> = ({
  selectedAssembly,
  assemblyLabel,
}) => {
  const [staged, setStaged] = useState<StagedRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { f_s: 'Suspension' },
  });

  const addRow = (data: FormData) => {
    setStaged(prev => [...prev, { ...data, id: `${Date.now()}-${Math.random()}` }]);
    reset({ f_s: 'Suspension' });
    toast.success('Row added to staging');
  };

  const removeRow = (id: string) => setStaged(prev => prev.filter(r => r.id !== id));

  const submitAll = async () => {
    if (staged.length === 0) return;
    setIsSubmitting(true);
    try {
      await createIntervalDataBulk(
        staged.map(r => ({
          component_id: selectedAssembly,
          installation_start_date: r.installation_start_date,
          installation_end_date: r.installation_end_date,
          removal_start_date: r.removal_start_date,
          removal_end_date: r.removal_end_date,
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
          <CardTitle className="text-lg">Interval Data Point — {assemblyLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Installation Interval</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" {...register('installation_start_date')} />
                {errors.installation_start_date && <p className="text-sm text-red-500 mt-1">{errors.installation_start_date.message}</p>}
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" {...register('installation_end_date')} />
                {errors.installation_end_date && <p className="text-sm text-red-500 mt-1">{errors.installation_end_date.message}</p>}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Removal Interval</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" {...register('removal_start_date')} />
                {errors.removal_start_date && <p className="text-sm text-red-500 mt-1">{errors.removal_start_date.message}</p>}
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" {...register('removal_end_date')} />
                {errors.removal_end_date && <p className="text-sm text-red-500 mt-1">{errors.removal_end_date.message}</p>}
              </div>
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
                <div className="space-y-0.5">
                  <p>Install: {row.installation_start_date} → {row.installation_end_date}</p>
                  <p>Removal: {row.removal_start_date} → {row.removal_end_date}</p>
                </div>
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