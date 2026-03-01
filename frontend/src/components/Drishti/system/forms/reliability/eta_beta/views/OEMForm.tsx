import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Trash2, Edit, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEtaBetaStore, OEMEntry } from '@/store/etabetaStore';
import { createOEMData } from '@/actions/eta_beta';
import { z } from 'zod';

const oemSchema = z.object({
  L10: z.number().positive('L10 must be positive'),
  L90: z.number().positive('L90 must be positive'),
});

type OEMData = z.infer<typeof oemSchema>;

interface OEMFormProps {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const OEMForm: React.FC<OEMFormProps> = ({
  selectedShip, selectedEquipment, selectedAssembly, assemblyLabel, onSuccess,
}) => {
  const { addOEMData, getOEMData, updateOEMData, deleteOEMData } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<OEMEntry[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<OEMData>({
    resolver: zodResolver(oemSchema),
  });

  useEffect(() => { setDataPoints(getOEMData(selectedAssembly)); }, [selectedAssembly, getOEMData]);

  const onSubmit = async (data: OEMData) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (editingId) {
      updateOEMData(selectedAssembly, editingId, {
        id: editingId, assemblyId: selectedAssembly, assemblyName: assemblyLabel,
        shipId: selectedShip, equipmentId: selectedEquipment, ...data, timestamp: new Date().toISOString(),
      });
      toast.success('OEM data updated successfully!');
      setEditingId(null);
    } else {
      addOEMData(selectedAssembly, {
        id: `${selectedAssembly}-${Date.now()}`, assemblyId: selectedAssembly, assemblyName: assemblyLabel,
        shipId: selectedShip, equipmentId: selectedEquipment, ...data, timestamp: new Date().toISOString(),
      });
      toast.success('OEM data added successfully!', { description: `Added to ${assemblyLabel}` });
    }

    setDataPoints(getOEMData(selectedAssembly));
    setIsSaving(false);
    reset();
  };

  const handleEdit = (point: OEMEntry) => {
    setEditingId(point.id);
    setValue('L10', point.L10);
    setValue('L90', point.L90);
  };

  const handleDelete = (id: string) => {
    deleteOEMData(selectedAssembly, id);
    setDataPoints(getOEMData(selectedAssembly));
    toast.success('OEM data deleted');
    if (editingId === id) { setEditingId(null); reset(); }
  };

  const handleSubmitToServer = async () => {
    if (dataPoints.length === 0) {
      toast.error('No data to submit', { description: 'Please add some OEM data first' });
      return;
    }
    setIsSubmitting(true);
    try {
      // OEM only supports one record at a time (L10/L90 pair), submit each
      for (const p of dataPoints) {
        await createOEMData({
          component_id: selectedAssembly,
          life_estimate1_name: 'L10',
          life_estimate1_val: p.L10,
          life_estimate2_name: 'L90',
          life_estimate2_val: p.L90,
        });
      }
      toast.success(`${dataPoints.length} OEM record${dataPoints.length > 1 ? 's' : ''} saved to server!`);
      dataPoints.forEach((p) => deleteOEMData(selectedAssembly, p.id));
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
        <CardHeader><CardTitle className="text-lg">{editingId ? 'Edit' : 'Add'} OEM Data - {assemblyLabel}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>L10 Life Estimate</Label>
                <Input type="number" step="0.01" {...register('L10', { valueAsNumber: true })} />
                {errors.L10 && <p className="text-sm text-red-500 mt-1">{String(errors.L10.message)}</p>}
              </div>
              <div>
                <Label>L90 Life Estimate</Label>
                <Input type="number" step="0.01" {...register('L90', { valueAsNumber: true })} />
                {errors.L90 && <p className="text-sm text-red-500 mt-1">{String(errors.L90.message)}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit(onSubmit)} disabled={isSaving || isSubmitting} className="flex-1" variant="outline">
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? 'Update OEM Data' : 'Add OEM Data'}
              </Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(); }} disabled={isSubmitting}>Cancel Edit</Button>}
              <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {dataPoints.length > 0 && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-lg">Existing OEM Data ({dataPoints.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dataPoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div><p className="text-sm text-muted-foreground">L10</p><p className="font-medium">{point.L10}</p></div>
                      <div><p className="text-sm text-muted-foreground">L90</p><p className="font-medium">{point.L90}</p></div>
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
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting to Server...</> : <><Send className="w-4 h-4 mr-2" />Submit {dataPoints.length} OEM Data Point{dataPoints.length > 1 ? 's' : ''} to Server</>}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};