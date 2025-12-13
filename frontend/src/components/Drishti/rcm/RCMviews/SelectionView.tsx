import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { MultiSelect } from '@/registry/new-york-v4/ui/MultiSelect';
import { Activity, AlertCircle } from 'lucide-react';

interface AssemblyOption {
    value: string;
    label: string;
    parentEquipmentId: string;
}

interface SelectionViewProps {
    ships: any[];
    selectedShip: string;
    selectedEquipmentIds: string[];
    selectedAssemblyIds: string[];
    equipmentGroups: any[];
    assemblyOptions: AssemblyOption[];
    onShipChange: (id: string) => void;
    onEquipmentChange: (values: string[]) => void;
    onAssemblyChange: (values: string[]) => void;
    onStartAnalysis: () => void;
}

export default function SelectionView({
    ships,
    selectedShip,
    selectedEquipmentIds,
    selectedAssemblyIds,
    equipmentGroups,
    assemblyOptions,
    onShipChange,
    onEquipmentChange,
    onAssemblyChange,
    onStartAnalysis
}: SelectionViewProps) {
    // Find equipment that have no assemblies
    const equipmentWithoutAssemblies = selectedEquipmentIds.filter(equipmentId => {
        return !assemblyOptions.some(assembly => assembly.parentEquipmentId === equipmentId);
    });

    // Get equipment names for the error message
    const getEquipmentName = (equipmentId: string) => {
        const equipment = equipmentGroups
            .flatMap(g => g.items)
            .find((item: any) => item.value === equipmentId);
        return equipment?.label || equipmentId;
    };

    const hasEquipmentWithoutAssemblies = equipmentWithoutAssemblies.length > 0;

    return (
        <div className="flex align-center bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
            <Card className="bg-muted/20 w-full">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4">
                        {/* Ship Selection */}
                        <GroupedCombobox
                            label="Select Ship"
                            groups={ships}
                            value={selectedShip}
                            onValueChange={onShipChange}
                            placeholder="Choose a ship"
                        />

                        {/* Equipment Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Equipment</label>
                            <MultiSelect
                                options={equipmentGroups.flatMap(g => g.items)}
                                onValueChange={onEquipmentChange}
                                defaultValue={selectedEquipmentIds}
                                placeholder="Choose equipment"
                                searchable
                            />
                        </div>

                        {/* Assembly Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Assemblies</label>
                            <MultiSelect
                                options={assemblyOptions}
                                onValueChange={onAssemblyChange}
                                defaultValue={selectedAssemblyIds}
                                placeholder="Choose assemblies"
                                searchable
                            />
                        </div>
                    </div>

                    {/* Error Alert for Equipment without Assemblies */}
                    {hasEquipmentWithoutAssemblies && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                The following equipment has no assemblies available:
                                <strong className="ml-1">
                                    {equipmentWithoutAssemblies.map(getEquipmentName).join(', ')}
                                </strong>
                                . RCM analysis is performed on assemblies. Please select equipment with available assemblies.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        className="w-full mt-4"
                        disabled={
                            selectedEquipmentIds.length === 0 ||
                            selectedAssemblyIds.length === 0 ||
                            hasEquipmentWithoutAssemblies
                        }
                        onClick={onStartAnalysis}
                    >
                        <Activity className="w-4 h-4 mr-2" />
                        Start Analysis
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}