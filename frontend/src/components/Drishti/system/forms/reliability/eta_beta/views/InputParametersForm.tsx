import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEtaBetaStore } from '@/store/etabetaStore';
import { z } from 'zod';

const inputParamsSchema = z.object({
  scaleParameter: z.number().positive('Scale parameter must be positive'),
  shapeParameter: z.number().positive('Shape parameter must be positive'),
});

type InputParamsData = z.infer<typeof inputParamsSchema>;

interface InputParametersFormProps {
  selectedShip: string;
  selectedEquipment: string;
  selectedAssembly: string;
  assemblyLabel: string;
  onSuccess: () => void;
}

export const InputParametersForm: React.FC<InputParametersFormProps> = ({
  selectedShip,
  selectedEquipment,
  selectedAssembly,
  assemblyLabel,
  onSuccess,
}) => {
  const { setInputParams, getInputParams, deleteInputParams } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<InputParamsData>({
    resolver: zodResolver(inputParamsSchema),
  });

  // Load existing data when assembly changes
  useEffect(() => {
    const existing = getInputParams(selectedAssembly);
    if (existing) {
      setValue('scaleParameter', existing.scaleParameter);
      setValue('shapeParameter', existing.shapeParameter);
    } else {
      reset();
    }
  }, [selectedAssembly, getInputParams, setValue, reset]);

  const onSave = async (data: InputParamsData) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const entry = {
      assemblyId: selectedAssembly,
      assemblyName: assemblyLabel,
      shipId: selectedShip,
      equipmentId: selectedEquipment,
      scaleParameter: data.scaleParameter,
      shapeParameter: data.shapeParameter,
      timestamp: new Date().toISOString(),
    };

    setInputParams(selectedAssembly, entry);
    
    toast.success('Input parameters saved locally!', {
      description: `Eta/Beta configured for ${assemblyLabel}`,
    });

    setIsSaving(false);
    onSuccess();
  };

  const handleSubmitToServer = async () => {
    const existingData = getInputParams(selectedAssembly);
    
    if (!existingData) {
      toast.error('No data to submit', {
        description: 'Please save parameters first',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // await apiClient.post('/api/eta-beta/input-params', existingData);

      console.log('Submitting Input Parameters:', existingData);

      toast.success('Input parameters submitted successfully!', {
        description: `Data for ${assemblyLabel} sent to server`,
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

  const handleDelete = () => {
    deleteInputParams(selectedAssembly);
    toast.success('Input parameters deleted');
    reset();
  };

  const existingData = getInputParams(selectedAssembly);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Input Parameters (Eta/Beta) - {assemblyLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scaleParameter">Eta (η) - Scale Parameter</Label>
                <Input 
                  id="scaleParameter" 
                  type="number" 
                  step="0.01" 
                  {...register('scaleParameter', { valueAsNumber: true })} 
                />
                {errors.scaleParameter && (
                  <p className="text-sm text-red-500 mt-1">{String(errors.scaleParameter.message)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="shapeParameter">Beta (β) - Shape Parameter</Label>
                <Input 
                  id="shapeParameter" 
                  type="number" 
                  step="0.01" 
                  {...register('shapeParameter', { valueAsNumber: true })} 
                />
                {errors.shapeParameter && (
                  <p className="text-sm text-red-500 mt-1">{String(errors.shapeParameter.message)}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit(onSave)} 
                disabled={isSaving || isSubmitting} 
                className="flex-1"
                variant="outline"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {existingData ? 'Update Parameters' : 'Save Parameters'}
              </Button>
              
              {existingData && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
              )}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit to Server Section */}
      {existingData && (
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
                  Submit Input Parameters to Server
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};