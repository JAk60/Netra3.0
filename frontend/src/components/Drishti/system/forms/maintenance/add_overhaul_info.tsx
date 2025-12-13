'use client';

import {
  createOverhaulMetadata,
  type OverhaulMetadataInput,
} from '@/actions/overhaul-actions';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';

// Zod schema
const overhaulMetadataSchema = z.object({
  component_id: z.string().min(1, 'Equipment selection is required'),
  overhaul_frequency_hours: z.coerce.number().int().min(1, 'Must be at least 1 hour'),
  total_overhaul_events: z.coerce.number().int().min(0, 'Must be a non-negative number').optional(),
  last_overhaul_date: z.string().optional(),
});

type OverhaulMetadata = z.infer<typeof overhaulMetadataSchema> & { id: string; component_name?: string };

export default function OverhaulEntryForm() {
  const [selectedShip, setSelectedShip] = useState('');
  const [metadata, setMetadata] = useState<OverhaulMetadata[]>([]);
  const [isSubmittingMetadata, setIsSubmittingMetadata] = useState(false);
  const [selectedMetadataEquipment, setSelectedMetadataEquipment] = useState('');

  const { ships, getEquipmentForShip, getEquipmentLabel } = useUserSelectionStore();

  // Get equipment groups for the selected ship
  const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];

  // Metadata form
  const metadataForm = useForm<z.infer<typeof overhaulMetadataSchema>>({
    resolver: zodResolver(overhaulMetadataSchema),
    defaultValues: {
      component_id: '',
      overhaul_frequency_hours: 0,
      total_overhaul_events: 0,
      last_overhaul_date: '',
    },
  });

  // Handle ship selection change
  const handleShipChange = (shipId: string) => {
    setSelectedShip(shipId);
    setSelectedMetadataEquipment('');
    metadataForm.reset();
  };

  const getComponentName = (componentId: string) => {
    if (!selectedShip) return 'Unknown';
    return getEquipmentLabel(selectedShip, componentId);
  };

  const handleMetadataEquipmentChange = (equipmentId: string) => {
    setSelectedMetadataEquipment(equipmentId);
    metadataForm.setValue('component_id', equipmentId, { shouldValidate: true });
  };

  const onSubmitMetadata = async (data: z.infer<typeof overhaulMetadataSchema>) => {
    setIsSubmittingMetadata(true);

    const metadataData: OverhaulMetadataInput = {
      component_id: data.component_id,
      overhaul_frequency_hours: data.overhaul_frequency_hours,
      total_overhaul_events: data.total_overhaul_events,
      last_overhaul_date: data.last_overhaul_date || undefined,
    };

    const result = await createOverhaulMetadata(metadataData);

    if (result.success && result.data) {
      const newMetadata: OverhaulMetadata = {
        ...data,
        id: result.data.id,
        component_name: getComponentName(data.component_id),
      };
      setMetadata([...metadata, newMetadata]);
      metadataForm.reset();
      setSelectedMetadataEquipment('');

      toast.success('Overhaul metadata created successfully');
    } else {
      toast.error(result.error || 'Failed to create overhaul metadata');
    }

    setIsSubmittingMetadata(false);
  };

  const deleteMetadata = (id: string) => {
    setMetadata(metadata.filter(m => m.id !== id));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Overhaul Entry</h1>
      </div>

      {/* Metadata Form */}
      <Card>
        <CardHeader>
          <CardTitle>Overhaul Metadata Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <GroupedCombobox
                  label="Select Ship"
                  placeholder={ships.length === 0 ? "Loading ships..." : "Choose a ship"}
                  groups={ships}
                  value={selectedShip}
                  onValueChange={handleShipChange}
                  disabled={ships.length === 0}
                />
              </div>

              <div>
                <GroupedCombobox
                  label="Select Equipment"
                  placeholder={!selectedShip ? "Select a ship first" : "Select equipment"}
                  groups={equipmentGroups}
                  value={selectedMetadataEquipment}
                  onValueChange={handleMetadataEquipmentChange}
                  disabled={!selectedShip || equipmentGroups.length === 0}
                />
                {metadataForm.formState.errors.component_id && (
                  <p className="text-sm text-red-500 mt-1">
                    {metadataForm.formState.errors.component_id.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="overhaul-frequency">Overhaul Frequency (Hours)</Label>
                <Input
                  id="overhaul-frequency"
                  type="number"
                  {...metadataForm.register('overhaul_frequency_hours')}
                />
                {metadataForm.formState.errors.overhaul_frequency_hours && (
                  <p className="text-sm text-red-500 mt-1">
                    {metadataForm.formState.errors.overhaul_frequency_hours.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="total-events">Total Overhaul Events (Optional)</Label>
                <Input
                  id="total-events"
                  type="number"
                  {...metadataForm.register('total_overhaul_events')}
                />
              </div>

              <div>
                <Label htmlFor="last-overhaul-date">Last Overhaul Date (Optional)</Label>
                <Input
                  id="last-overhaul-date"
                  type="date"
                  {...metadataForm.register('last_overhaul_date')}
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={metadataForm.handleSubmit(onSubmitMetadata)}
              className="w-full"
              disabled={isSubmittingMetadata || !selectedShip}
            >
              {isSubmittingMetadata && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmittingMetadata ? 'Creating...' : 'Add Metadata'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metadata Table */}
      {metadata.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overhaul Metadata Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Equipment</th>
                    <th className="text-left p-2 font-medium">Frequency (hrs)</th>
                    <th className="text-left p-2 font-medium">Total Events</th>
                    <th className="text-left p-2 font-medium">Last Overhaul</th>
                    <th className="text-left p-2 font-medium w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metadata.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{item.component_name}</td>
                      <td className="p-2">{item.overhaul_frequency_hours}</td>
                      <td className="p-2">{item.total_overhaul_events || 0}</td>
                      <td className="p-2">{item.last_overhaul_date || 'N/A'}</td>
                      <td className="p-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMetadata(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}