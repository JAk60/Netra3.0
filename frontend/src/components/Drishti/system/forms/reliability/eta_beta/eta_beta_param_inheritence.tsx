import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { MultiSelect } from '@/registry/new-york-v4/ui/MultiSelect';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/new-york-v4/ui/accordion';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { useShipSystemHierarchyStore } from "@/store/shipSystemHierarchyStore";
import { FileText, AlertCircle, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { ActualDataPointForm } from './views/ActualDataPointForm';
import { ExpertJudgementForm } from './views/ExpertJudgementForm';
import { InputParametersForm } from './views/InputParametersForm';
import { IntervalDataPointForm } from './views/IntervalDataPointForm';
import { OEMExpertForm } from './views/OEMExpertForm';
import { ProbabilityFailureForm } from './views/ProbabilityFailureForm';
import { OEMForm } from './views/OEMForm';
import { NPRDForm } from './views/NPRDForm';

interface AssemblyOption {
    value: string;
    label: string;
    parentEquipmentId: string;
}

const viewTypes = [
    { id: 'input-params', label: 'Input Parameters', icon: FileText, component: InputParametersForm },
    { id: 'actual-data', label: 'Actual Data Point', icon: FileText, component: ActualDataPointForm },
    { id: 'interval-data', label: 'Interval Data Point', icon: FileText, component: IntervalDataPointForm },
    { id: 'oem', label: 'OEM', icon: FileText, component: OEMForm },
    { id: 'oem-expert', label: 'OEM Expert', icon: FileText, component: OEMExpertForm },
    { id: 'expert-judgement', label: 'Expert Judgement', icon: FileText, component: ExpertJudgementForm },
    { id: 'probability-failure', label: 'Probability Failure', icon: FileText, component: ProbabilityFailureForm },
    { id: 'nprd', label: 'NPRD', icon: FileText, component: NPRDForm },
];

export default function EtaBetaParamInheritance() {
    // Selection state
    const [selectedShip, setSelectedShip] = useState('');
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
    const [selectedAssemblyIds, setSelectedAssemblyIds] = useState<string[]>([]);
    const [assemblyOptions, setAssemblyOptions] = useState<AssemblyOption[]>([]);
    const [activeView, setActiveView] = useState('');

    // Stores
    const { ships, getEquipmentForShip } = useUserSelectionStore();
    const { fetchComponentChildren } = useShipSystemHierarchyStore();

    const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];

    // Load assemblies when equipment changes
    useEffect(() => {
        if (!selectedShip || selectedEquipmentIds.length === 0) {
            setAssemblyOptions([]);
            setSelectedAssemblyIds([]);
            return;
        }

        (async () => {
            try {
                let merged: AssemblyOption[] = [];

                for (const eqId of selectedEquipmentIds) {
                    const hierarchy = await fetchComponentChildren(eqId, selectedShip);
                    const children = hierarchy.children || [];

                    const opts = children.map((child: any) => ({
                        value: child.component_id,
                        label: `${child.component_name} (${child.nomenclature})`,
                        parentEquipmentId: eqId
                    }));

                    merged = [...merged, ...opts];
                }

                const unique = merged.filter(
                    (item, index, arr) =>
                        arr.findIndex(o => o.value === item.value) === index
                );

                setAssemblyOptions(unique);
            } catch (err) {
                console.error("Error loading assemblies", err);
            }
        })();
    }, [selectedEquipmentIds, selectedShip, fetchComponentChildren]);

    // Selection handlers
    const handleShipChange = (id: string) => {
        setSelectedShip(id);
        setSelectedEquipmentIds([]);
        setSelectedAssemblyIds([]);
        setAssemblyOptions([]);
    };

    const handleEquipmentChange = (values: string[]) => {
        setSelectedEquipmentIds(values);
        setSelectedAssemblyIds([]);
    };

    const handleAssemblyChange = (values: string[]) => setSelectedAssemblyIds(values);

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
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Parameter Inheritance</h1>
            </div>

            {/* Selection View */}
            <div className="flex align-center bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
                <Card className="bg-muted/20 w-full">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4">
                            {/* Ship Selection */}
                            <GroupedCombobox
                                label="Select Ship"
                                groups={ships}
                                value={selectedShip}
                                onValueChange={handleShipChange}
                                placeholder="Choose a ship"
                            />

                            {/* Equipment Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Equipment</label>
                                <MultiSelect
                                    options={equipmentGroups.flatMap(g => g.items)}
                                    onValueChange={handleEquipmentChange}
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
                                    onValueChange={handleAssemblyChange}
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
                                    . Please select equipment with available assemblies.
                                </AlertDescription>
                            </Alert>
                        )}

                        {selectedAssemblyIds.length > 0 && (
                            <Alert className="mt-4">
                                <Activity className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>{selectedAssemblyIds.length}</strong> assemblies selected. 
                                    You can now configure parameters using the view types below.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View Types Accordion - Only show if selections are made */}
            {selectedShip && selectedEquipmentIds.length > 0 && selectedAssemblyIds.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Configure Parameters by View Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible value={activeView} onValueChange={setActiveView}>
                            {viewTypes.map((view) => {
                                const Icon = view.icon;
                                const ViewComponent = view.component;

                                return (
                                    <AccordionItem key={view.id} value={view.id}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-4 h-4" />
                                                <span>{view.label}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pt-4">
                                                {/* Pass selected context to view components */}
                                                <ViewComponent 
                                                    selectedShip={selectedShip}
                                                    selectedEquipmentIds={selectedEquipmentIds}
                                                    selectedAssemblyIds={selectedAssemblyIds}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}