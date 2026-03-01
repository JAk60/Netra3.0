import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Trash2, Edit, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEtaBetaStore, ProbabilityFailureEntry } from '@/store/etabetaStore';
import { createProbabilityFailureBulk } from '@/actions/eta_beta';
import { z } from 'zod';

const probabilityFailureSchema = z.object({
  time: z.number().positive('Time must be positive'),
  failureProbability: z.number().min(0).max(100, 'Must be between 0 and 100'),
});

type ProbabilityFailureData = z.infer<typeof probabilityFailureSchema>;

interface ProbabilityFailureFormProps {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const ProbabilityFailureForm: React.FC<ProbabilityFailureFormProps> = ({
  selectedShip, selectedEquipment, selectedAssembly, assemblyLabel, onSuccess,
}) => {
  const { addProbabilityFailure, getProbabilityFailure, updateProbabilityFailure, deleteProbabilityFailure } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<ProbabilityFailureEntry[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProbabilityFailureData>({
    resolver: zodResolver(probabilityFailureSchema),
  });

  useEffect(() => { setDataPoints(getProbabilityFailure(selectedAssembly)); }, [selectedAssembly, getProbabilityFailure]);

  const onSubmit = async (data: ProbabilityFailureData) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (editingId) {
      updateProbabilityFailure(selectedAssembly, editingId, {
        id: editingId, assemblyId: selectedAssembly, assemblyName: assemblyLabel,
        shipId: selectedShip, equipmentId: selectedEquipment, ...data, timestamp: new Date().toISOString(),
      });
      toast.success('Probability data updated successfully!');
      setEditingId(null);
    } else {
      addProbabilityFailure(selectedAssembly, {
        id: `${selectedAssembly}-${Date.now()}`, assemblyId: selectedAssembly, assemblyName: assemblyLabel,
        shipId: selectedShip, equipmentId: selectedEquipment, ...data, timestamp: new Date().toISOString(),
      });
      toast.success('Probability data added successfully!', { description: `Added to ${assemblyLabel}` });
    }
    setDataPoints(getProbabilityFailure(selectedAssembly));
    setIsSaving(false);
    reset();
  };

  const handleEdit = (point: ProbabilityFailureEntry) => {
    setEditingId(point.id);
    setValue('time', point.time);
    setValue('failureProbability', point.failureProbability);
  };

  const handleDelete = (id: string) => {
    deleteProbabilityFailure(selectedAssembly, id);
    setDataPoints(getProbabilityFailure(selectedAssembly));
    toast.success('Probability data deleted');
    if (editingId === id) { setEditingId(null); reset(); }
  };

  const handleSubmitToServer = async () => {
    if (dataPoints.length === 0) { toast.error('No data to submit'); return; }
    setIsSubmitting(true);
    try {
      await createProbabilityFailureBulk(
        dataPoints.map((p) => ({
          component_id: selectedAssembly,
          p_time: p.time,
          failure_p: p.failureProbability,
        }))
      );
      toast.success(`${dataPoints.length} probability data point${dataPoints.length > 1 ? 's' : ''} saved to server!`);
      dataPoints.forEach((p) => deleteProbabilityFailure(selectedAssembly, p.id));
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
        <CardHeader><CardTitle className="text-lg">{editingId ? 'Edit' : 'Add'} Probability of Failure - {assemblyLabel}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Time (T&lt;) hrs</Label><Input type="number" step="0.01" {...register('time', { valueAsNumber: true })} />{errors.time && <p className="text-sm text-red-500 mt-1">{String(errors.time.message)}</p>}</div>
              <div><Label>Failure Probability (%)</Label><Input type="number" step="0.01" {...register('failureProbability', { valueAsNumber: true })} />{errors.failureProbability && <p className="text-sm text-red-500 mt-1">{String(errors.failureProbability.message)}</p>}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit(onSubmit)} disabled={isSaving || isSubmitting} className="flex-1" variant="outline">{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingId ? 'Update Probability Data' : 'Add Probability Data'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(); }} disabled={isSubmitting}>Cancel Edit</Button>}
              <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {dataPoints.length > 0 && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-lg">Existing Probability Data ({dataPoints.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dataPoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div><p className="text-sm text-muted-foreground">Time (hrs)</p><p className="font-medium">{point.time}</p></div>
                      <div><p className="text-sm text-muted-foreground">Failure Probability</p><p className="font-medium">{point.failureProbability}%</p></div>
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
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting to Server...</> : <><Send className="w-4 h-4 mr-2" />Submit {dataPoints.length} Probability Data Point{dataPoints.length > 1 ? 's' : ''} to Server</>}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};