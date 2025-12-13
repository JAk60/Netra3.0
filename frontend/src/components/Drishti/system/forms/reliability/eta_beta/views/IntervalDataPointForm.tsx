import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Trash2, Edit, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEtaBetaStore, IntervalDataPointEntry } from '@/store/etabetaStore';
import { z } from 'zod';

const intervalDataPointSchema = z.object({
  installationStartDate: z.string().min(1, 'Installation start date is required'),
  installationEndDate: z.string().min(1, 'Installation end date is required'),
  removalStartDate: z.string().min(1, 'Removal start date is required'),
  removalEndDate: z.string().min(1, 'Removal end date is required'),
  status: z.enum(['Failure', 'Suspension']),
});

type IntervalDataPointData = z.infer<typeof intervalDataPointSchema>;

interface IntervalDataPointFormProps {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const IntervalDataPointForm: React.FC<IntervalDataPointFormProps> = ({
  selectedShip,
  selectedEquipment,
  selectedAssembly,
  assemblyLabel,
  onSuccess,
}) => {
  const { 
    addIntervalDataPoint, 
    getIntervalDataPoints, 
    updateIntervalDataPoint, 
    deleteIntervalDataPoint 
  } = useEtaBetaStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<IntervalDataPointEntry[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<IntervalDataPointData>({
    resolver: zodResolver(intervalDataPointSchema),
    defaultValues: { status: 'Suspension' },
  });

  useEffect(() => {
    const points = getIntervalDataPoints(selectedAssembly);
    setDataPoints(points);
  }, [selectedAssembly, getIntervalDataPoints]);

  const onSubmit = async (data: IntervalDataPointData) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (editingId) {
      const entry: IntervalDataPointEntry = {
        id: editingId,
        assemblyId: selectedAssembly,
        assemblyName: assemblyLabel,
        shipId: selectedShip,
        equipmentId: selectedEquipment,
        ...data,
        timestamp: new Date().toISOString(),
      };

      updateIntervalDataPoint(selectedAssembly, editingId, entry);
      toast.success('Interval data updated successfully!');
      setEditingId(null);
    } else {
      const entry: IntervalDataPointEntry = {
        id: `${selectedAssembly}-${Date.now()}`,
        assemblyId: selectedAssembly,
        assemblyName: assemblyLabel,
        shipId: selectedShip,
        equipmentId: selectedEquipment,
        ...data,
        timestamp: new Date().toISOString(),
      };

      addIntervalDataPoint(selectedAssembly, entry);
      toast.success('Interval data added successfully!', {
        description: `Added to ${assemblyLabel}`,
      });
    }

    const points = getIntervalDataPoints(selectedAssembly);
    setDataPoints(points);
    setIsSaving(false);
    reset({ status: 'Suspension' });
  };

  const handleEdit = (point: IntervalDataPointEntry) => {
    setEditingId(point.id);
    setValue('installationStartDate', point.installationStartDate);
    setValue('installationEndDate', point.installationEndDate);
    setValue('removalStartDate', point.removalStartDate);
    setValue('removalEndDate', point.removalEndDate);
    setValue('status', point.status);
  };

  const handleDelete = (id: string) => {
    deleteIntervalDataPoint(selectedAssembly, id);
    const points = getIntervalDataPoints(selectedAssembly);
    setDataPoints(points);
    toast.success('Interval data deleted');
    
    if (editingId === id) {
      setEditingId(null);
      reset({ status: 'Suspension' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({ status: 'Suspension' });
  };

  const handleSubmitToServer = async () => {
    if (dataPoints.length === 0) {
      toast.error('No data to submit', {
        description: 'Please add some interval data points first',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // await apiClient.post('/api/eta-beta/interval-data-points', {
      //   assemblyId: selectedAssembly,
      //   dataPoints: dataPoints
      // });

      console.log('Submitting Interval Data Points:', dataPoints);

      toast.success('Interval data points submitted successfully!', {
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
            {editingId ? 'Edit' : 'Add'} Interval Data Point - {assemblyLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Installation Interval</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" {...register('installationStartDate')} />
                  {errors.installationStartDate && (
                    <p className="text-sm text-red-500 mt-1">{String(errors.installationStartDate.message)}</p>
                  )}
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" {...register('installationEndDate')} />
                  {errors.installationEndDate && (
                    <p className="text-sm text-red-500 mt-1">{String(errors.installationEndDate.message)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Removal Interval</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" {...register('removalStartDate')} />
                  {errors.removalStartDate && (
                    <p className="text-sm text-red-500 mt-1">{String(errors.removalStartDate.message)}</p>
                  )}
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" {...register('removalEndDate')} />
                  {errors.removalEndDate && (
                    <p className="text-sm text-red-500 mt-1">{String(errors.removalEndDate.message)}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
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
                {editingId ? 'Update Interval Data' : 'Add Interval Data'}
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
                onClick={() => reset({ status: 'Suspension' })}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {dataPoints.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Existing Interval Data Points ({dataPoints.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dataPoints.map((point) => (
                  <div 
                    key={point.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Installation Interval</p>
                        <p className="font-medium text-sm">
                          {point.installationStartDate} → {point.installationEndDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Removal Interval</p>
                        <p className="font-medium text-sm">
                          {point.removalStartDate} → {point.removalEndDate}
                        </p>
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
                    Submit {dataPoints.length} Interval Data Point{dataPoints.length > 1 ? 's' : ''} to Server
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