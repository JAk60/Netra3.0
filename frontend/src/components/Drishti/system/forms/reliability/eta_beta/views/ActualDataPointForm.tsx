import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Trash2, Edit, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEtaBetaStore, ActualDataPointEntry } from '@/store/etabetaStore';
import { z } from 'zod';

const actualDataPointSchema = z.object({
  installationDate: z.string().min(1, 'Installation date is required'),
  removalDate: z.string().min(1, 'Removal date is required'),
  status: z.enum(['Failure', 'Suspension']),
});

type ActualDataPointData = z.infer<typeof actualDataPointSchema>;

interface ActualDataPointFormProps {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const ActualDataPointForm: React.FC<ActualDataPointFormProps> = ({
  selectedShip,
  selectedEquipment,
  selectedAssembly,
  assemblyLabel,
  onSuccess,
}) => {
  const { 
    addActualDataPoint, 
    getActualDataPoints, 
    updateActualDataPoint, 
    deleteActualDataPoint 
  } = useEtaBetaStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<ActualDataPointEntry[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ActualDataPointData>({
    resolver: zodResolver(actualDataPointSchema),
    defaultValues: { status: 'Failure' },
  });

  // Load existing data points for this assembly
  useEffect(() => {
    const points = getActualDataPoints(selectedAssembly);
    setDataPoints(points);
  }, [selectedAssembly, getActualDataPoints]);

  const onSubmit = async (data: ActualDataPointData) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (editingId) {
      // Update existing entry
      const entry: ActualDataPointEntry = {
        id: editingId,
        assemblyId: selectedAssembly,
        assemblyName: assemblyLabel,
        shipId: selectedShip,
        equipmentId: selectedEquipment,
        ...data,
        timestamp: new Date().toISOString(),
      };

      updateActualDataPoint(selectedAssembly, editingId, entry);
      toast.success('Data point updated successfully!');
      setEditingId(null);
    } else {
      // Add new entry
      const entry: ActualDataPointEntry = {
        id: `${selectedAssembly}-${Date.now()}`,
        assemblyId: selectedAssembly,
        assemblyName: assemblyLabel,
        shipId: selectedShip,
        equipmentId: selectedEquipment,
        ...data,
        timestamp: new Date().toISOString(),
      };

      addActualDataPoint(selectedAssembly, entry);
      toast.success('Data point added successfully!', {
        description: `Added to ${assemblyLabel}`,
      });
    }

    // Refresh list
    const points = getActualDataPoints(selectedAssembly);
    setDataPoints(points);

    setIsSaving(false);
    reset({ status: 'Failure' });
  };

  const handleEdit = (point: ActualDataPointEntry) => {
    setEditingId(point.id);
    setValue('installationDate', point.installationDate);
    setValue('removalDate', point.removalDate);
    setValue('status', point.status);
  };

  const handleDelete = (id: string) => {
    deleteActualDataPoint(selectedAssembly, id);
    const points = getActualDataPoints(selectedAssembly);
    setDataPoints(points);
    toast.success('Data point deleted');
    
    if (editingId === id) {
      setEditingId(null);
      reset({ status: 'Failure' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({ status: 'Failure' });
  };

  const handleSubmitToServer = async () => {
    if (dataPoints.length === 0) {
      toast.error('No data to submit', {
        description: 'Please add some data points first',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // await apiClient.post('/api/eta-beta/actual-data-points', {
      //   assemblyId: selectedAssembly,
      //   dataPoints: dataPoints
      // });

      console.log('Submitting Actual Data Points:', dataPoints);

      toast.success('Actual data points submitted successfully!', {
        description: `${dataPoints.length} data points sent to server`,
      });

    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Submission failed', {
        description: 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingId ? 'Edit' : 'Add'} Actual Data Point - {assemblyLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="installationDate">Installation Date</Label>
                <Input 
                  id="installationDate" 
                  type="date" 
                  {...register('installationDate')} 
                />
                {errors.installationDate && (
                  <p className="text-sm text-red-500 mt-1">{String(errors.installationDate.message)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="removalDate">Removal Date</Label>
                <Input 
                  id="removalDate" 
                  type="date" 
                  {...register('removalDate')} 
                />
                {errors.removalDate && (
                  <p className="text-sm text-red-500 mt-1">{String(errors.removalDate.message)}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select 
                {...register('status')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Failure">Failure</option>
                <option value="Suspension">Suspension</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit(onSubmit)} 
                disabled={isSaving || isSubmitting} 
                className="flex-1"
                variant="outline"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? 'Update Data Point' : 'Add Data Point'}
              </Button>
              
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel Edit
                </Button>
              )}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => reset({ status: 'Failure' })}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List of existing data points */}
      {dataPoints.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Existing Data Points ({dataPoints.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dataPoints.map((point) => (
                  <div 
                    key={point.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Installation</p>
                        <p className="font-medium">{point.installationDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Removal</p>
                        <p className="font-medium">{point.removalDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">
                          <span className={`px-2 py-1 rounded text-xs ${
                            point.status === 'Failure' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {point.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(point)}
                        disabled={isSubmitting}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(point.id)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit to Server Section */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <Button 
                onClick={handleSubmitToServer} 
                disabled={isSubmitting || isSaving}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting to Server...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit {dataPoints.length} Data Point{dataPoints.length > 1 ? 's' : ''} to Server
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};