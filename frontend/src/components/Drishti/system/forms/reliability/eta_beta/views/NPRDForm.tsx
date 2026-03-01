import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Loader2, Trash2, Edit, Info, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEtaBetaStore, NPRDEntry } from '@/store/etabetaStore';
import { createNPRDData } from '@/actions/eta_beta';
import { z } from 'zod';

const nprdSchema = z.object({
  failureRate: z.number().positive('Failure rate must be positive'),
  beta: z.number().positive('Beta must be positive'),
});

type NPRDData = z.infer<typeof nprdSchema>;

interface NPRDFormProps {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const NPRDForm: React.FC<NPRDFormProps> = ({
  selectedShip, selectedEquipment, selectedAssembly, assemblyLabel, onSuccess,
}) => {
  const { addNPRDData, getNPRDData, updateNPRDData, deleteNPRDData } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<NPRDEntry[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<NPRDData>({
    resolver: zodResolver(nprdSchema),
    defaultValues: { failureRate: 2, beta: 2 },
  });

  useEffect(() => { setDataPoints(getNPRDData(selectedAssembly)); }, [selectedAssembly, getNPRDData]);

  const onSubmit = async (data: NPRDData) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (editingId) {
      updateNPRDData(selectedAssembly, editingId, {
        id: editingId, assemblyId: selectedAssembly, assemblyName: assemblyLabel,
        shipId: selectedShip, equipmentId: selectedEquipment, ...data, timestamp: new Date().toISOString(),
      });
      toast.success('NPRD data updated successfully!');
      setEditingId(null);
    } else {
      addNPRDData(selectedAssembly, {
        id: `${selectedAssembly}-${Date.now()}`, assemblyId: selectedAssembly, assemblyName: assemblyLabel,
        shipId: selectedShip, equipmentId: selectedEquipment, ...data, timestamp: new Date().toISOString(),
      });
      toast.success('NPRD data added successfully!', { description: `Added to ${assemblyLabel}` });
    }
    setDataPoints(getNPRDData(selectedAssembly));
    setIsSaving(false);
    reset({ failureRate: 2, beta: 2 });
  };

  const handleEdit = (point: NPRDEntry) => {
    setEditingId(point.id);
    setValue('failureRate', point.failureRate);
    setValue('beta', point.beta);
  };

  const handleDelete = (id: string) => {
    deleteNPRDData(selectedAssembly, id);
    setDataPoints(getNPRDData(selectedAssembly));
    toast.success('NPRD data deleted');
    if (editingId === id) { setEditingId(null); reset({ failureRate: 2, beta: 2 }); }
  };

  const handleSubmitToServer = async () => {
    if (dataPoints.length === 0) { toast.error('No data to submit'); return; }
    setIsSubmitting(true);
    try {
      for (const p of dataPoints) {
        await createNPRDData({
          component_id: selectedAssembly,
          failure_rate: p.failureRate,
          beta: p.beta,
        });
      }
      toast.success(`${dataPoints.length} NPRD record${dataPoints.length > 1 ? 's' : ''} saved to server!`);
      dataPoints.forEach((p) => deleteNPRDData(selectedAssembly, p.id));
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
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>{editingId ? 'Edit' : 'Add'} NPRD (Navy Parts Reliability Data) - {assemblyLabel}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowInfo(!showInfo)}><Info className="w-4 h-4" /></Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showInfo && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-800">
                <strong>Beta (β) Guidelines:</strong><br />
                • If failure occurs in a narrow time window: use β = 2.5<br />
                • If failure occurs in a scattered time window: use β = 1.5
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Failure Rate</Label><Input type="number" step="0.01" {...register('failureRate', { valueAsNumber: true })} placeholder="Enter failure rate" />{errors.failureRate && <p className="text-sm text-red-500 mt-1">{String(errors.failureRate.message)}</p>}</div>
              <div><Label>Beta (β) - Shape Parameter</Label><Input type="number" step="0.01" {...register('beta', { valueAsNumber: true })} placeholder="Enter beta value" />{errors.beta && <p className="text-sm text-red-500 mt-1">{String(errors.beta.message)}</p>}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit(onSubmit)} disabled={isSaving || isSubmitting} className="flex-1" variant="outline">{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingId ? 'Update NPRD Data' : 'Add NPRD Data'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset({ failureRate: 2, beta: 2 }); }} disabled={isSubmitting}>Cancel Edit</Button>}
              <Button type="button" variant="outline" onClick={() => reset({ failureRate: 2, beta: 2 })} disabled={isSubmitting}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {dataPoints.length > 0 && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-lg">Existing NPRD Data ({dataPoints.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dataPoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div><p className="text-sm text-muted-foreground">Failure Rate</p><p className="font-medium">{point.failureRate}</p></div>
                      <div><p className="text-sm text-muted-foreground">Beta (β)</p><p className="font-medium">{point.beta}</p></div>
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
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting to Server...</> : <><Send className="w-4 h-4 mr-2" />Submit {dataPoints.length} NPRD Data Point{dataPoints.length > 1 ? 's' : ''} to Server</>}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};