import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Trash2, Edit, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEtaBetaStore, ExpertJudgementEntry } from '@/store/etabetaStore';
import { createExpertJudgement } from '@/actions/eta_beta';
import { z } from 'zod';

const expertJudgementSchema = z.object({
  mostLikely: z.number().positive('Most likely life must be positive'),
  maxLife: z.number().positive('Max life must be positive'),
  minLife: z.number().positive('Min life must be positive'),
  componentFailure: z.number().int().nonnegative('Must be non-negative integer'),
  timeWoFailure: z.number().nonnegative('Must be non-negative'),
});

type ExpertJudgementData = z.infer<typeof expertJudgementSchema>;

interface ExpertJudgementFormProps {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const ExpertJudgementForm: React.FC<ExpertJudgementFormProps> = ({
  selectedShip, selectedEquipment, selectedAssembly, assemblyLabel, onSuccess,
}) => {
  const { addExpertJudgement, getExpertJudgement, updateExpertJudgement, deleteExpertJudgement } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<ExpertJudgementEntry[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ExpertJudgementData>({
    resolver: zodResolver(expertJudgementSchema),
  });

  useEffect(() => { setDataPoints(getExpertJudgement(selectedAssembly)); }, [selectedAssembly, getExpertJudgement]);

  const onSubmit = async (data: ExpertJudgementData) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (editingId) {
      updateExpertJudgement(selectedAssembly, editingId, {
        id: editingId, assemblyId: selectedAssembly, assemblyName: assemblyLabel,
        shipId: selectedShip, equipmentId: selectedEquipment, ...data, timestamp: new Date().toISOString(),
      });
      toast.success('Expert judgement updated successfully!');
      setEditingId(null);
    } else {
      addExpertJudgement(selectedAssembly, {
        id: `${selectedAssembly}-${Date.now()}`, assemblyId: selectedAssembly, assemblyName: assemblyLabel,
        shipId: selectedShip, equipmentId: selectedEquipment, ...data, timestamp: new Date().toISOString(),
      });
      toast.success('Expert judgement added successfully!', { description: `Added to ${assemblyLabel}` });
    }
    setDataPoints(getExpertJudgement(selectedAssembly));
    setIsSaving(false);
    reset();
  };

  const handleEdit = (point: ExpertJudgementEntry) => {
    setEditingId(point.id);
    setValue('mostLikely', point.mostLikely); setValue('maxLife', point.maxLife);
    setValue('minLife', point.minLife); setValue('componentFailure', point.componentFailure);
    setValue('timeWoFailure', point.timeWoFailure);
  };

  const handleDelete = (id: string) => {
    deleteExpertJudgement(selectedAssembly, id);
    setDataPoints(getExpertJudgement(selectedAssembly));
    toast.success('Expert judgement deleted');
    if (editingId === id) { setEditingId(null); reset(); }
  };

  const handleSubmitToServer = async () => {
    if (dataPoints.length === 0) { toast.error('No data to submit'); return; }
    setIsSubmitting(true);
    try {
      for (const p of dataPoints) {
        await createExpertJudgement({
          component_id: selectedAssembly,
          most_likely_life: p.mostLikely,
          max_life: p.maxLife,
          min_life: p.minLife,
          num_component_wo_failure: p.componentFailure,
          time_wo_failure: p.timeWoFailure,
        });
      }
      toast.success(`${dataPoints.length} expert judgement${dataPoints.length > 1 ? 's' : ''} saved to server!`);
      dataPoints.forEach((p) => deleteExpertJudgement(selectedAssembly, p.id));
      setDataPoints([]);
    } catch (error) {
      toast.error('Submission failed', { description: error instanceof Error ? error.message : 'Please try again' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">{editingId ? 'Edit' : 'Add'} Expert Judgement - {assemblyLabel}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Most Likely Life</Label><Input type="number" step="0.01" {...register('mostLikely', { valueAsNumber: true })} />{errors.mostLikely && <p className="text-sm text-red-500 mt-1">{String(errors.mostLikely.message)}</p>}</div>
              <div><Label>Maximum Life</Label><Input type="number" step="0.01" {...register('maxLife', { valueAsNumber: true })} />{errors.maxLife && <p className="text-sm text-red-500 mt-1">{String(errors.maxLife.message)}</p>}</div>
              <div><Label>Minimum Life</Label><Input type="number" step="0.01" {...register('minLife', { valueAsNumber: true })} />{errors.minLife && <p className="text-sm text-red-500 mt-1">{String(errors.minLife.message)}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Components Without Failure</Label><Input type="number" {...register('componentFailure', { valueAsNumber: true })} />{errors.componentFailure && <p className="text-sm text-red-500 mt-1">{String(errors.componentFailure.message)}</p>}</div>
              <div><Label>Total Time Without Failure</Label><Input type="number" step="0.01" {...register('timeWoFailure', { valueAsNumber: true })} />{errors.timeWoFailure && <p className="text-sm text-red-500 mt-1">{String(errors.timeWoFailure.message)}</p>}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit(onSubmit)} disabled={isSaving || isSubmitting} className="flex-1" variant="outline">{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingId ? 'Update Expert Judgement' : 'Add Expert Judgement'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(); }} disabled={isSubmitting}>Cancel Edit</Button>}
              <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {dataPoints.length > 0 && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-lg">Existing Expert Judgements ({dataPoints.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dataPoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div><p className="text-sm text-muted-foreground">Life Estimates</p><p className="font-medium text-sm">Min: {point.minLife} | Likely: {point.mostLikely} | Max: {point.maxLife}</p></div>
                      <div><p className="text-sm text-muted-foreground">Components w/o Failure</p><p className="font-medium">{point.componentFailure}</p></div>
                      <div><p className="text-sm text-muted-foreground">Time w/o Failure</p><p className="font-medium">{point.timeWoFailure}</p></div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(point)} disabled={isSubmitting}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(point.id)} disabled={isSubmitting}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <Button onClick={handleSubmitToServer} disabled={isSubmitting || isSaving} className="w-full" size="lg">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting to Server...</> : <><Send className="w-4 h-4 mr-2" />Submit {dataPoints.length} Expert Judgement{dataPoints.length > 1 ? 's' : ''} to Server</>}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};