import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/new-york-v4/ui/accordion';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { useShipSystemHierarchyStore } from "@/store/shipSystemHierarchyStore";
import { FileText, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    // Single selections
    const [selectedShip, setSelectedShip] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [selectedAssembly, setSelectedAssembly] = useState('');
    const [assemblyOptions, setAssemblyOptions] = useState<AssemblyOption[]>([]);
    const [activeView, setActiveView] = useState('');

    // Stores
    const { ships, getEquipmentForShip } = useUserSelectionStore();
    const { fetchComponentChildren } = useShipSystemHierarchyStore();

    const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];

    // Load assemblies when equipment changes
    useEffect(() => {
        if (!selectedShip || !selectedEquipment) {
            setAssemblyOptions([]);
            setSelectedAssembly('');
            return;
        }

        (async () => {
            try {
                const hierarchy = await fetchComponentChildren(selectedEquipment, selectedShip);
                const children = hierarchy.children || [];

                const opts = children.map((child: any) => ({
                    value: child.component_id,
                    label: `${child.component_name} (${child.nomenclature})`,
                }));

                setAssemblyOptions(opts);
            } catch (err) {
                console.error("Error loading assemblies", err);
                setAssemblyOptions([]);
            }
        })();
    }, [selectedEquipment, selectedShip, fetchComponentChildren]);

    // Selection handlers
    const handleShipChange = (id: string) => {
        setSelectedShip(id);
        setSelectedEquipment('');
        setSelectedAssembly('');
        setAssemblyOptions([]);
    };

    const handleEquipmentChange = (id: string) => {
        setSelectedEquipment(id);
        setSelectedAssembly('');
    };

    const handleAssemblyChange = (id: string) => {
        setSelectedAssembly(id);
    };

    // Reset selections after successful save
    const handleSuccessfulSave = () => {
        setSelectedShip('');
        setSelectedEquipment('');
        setSelectedAssembly('');
        setAssemblyOptions([]);
        setActiveView('');
    };

    // Get selected assembly details
    const selectedAssemblyDetails = assemblyOptions.find(opt => opt.value === selectedAssembly);

    return (
        <div className="container mx-auto p-6 space-y-6">
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
                            <GroupedCombobox
                                label="Select Equipment"
                                groups={equipmentGroups}
                                value={selectedEquipment}
                                onValueChange={handleEquipmentChange}
                                placeholder="Choose equipment"
                                disabled={!selectedShip}
                            />

                            {/* Assembly Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Assembly</label>
                                <GroupedCombobox
                                    groups={[{ groupName: 'Assemblies', items: assemblyOptions }]}
                                    value={selectedAssembly}
                                    onValueChange={handleAssemblyChange}
                                    placeholder="Choose assembly"
                                    disabled={!selectedEquipment || assemblyOptions.length === 0}
                                />
                            </div>
                        </div>


                {/* View Types Accordion - Only show if assembly is selected */}
                {selectedShip && selectedEquipment && selectedAssembly && (
                    <Card className='mt-4'>
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
                                                    <ViewComponent
                                                        selectedShip={selectedShip}
                                                        selectedEquipment={selectedEquipment}
                                                        selectedAssembly={selectedAssembly}
                                                        assemblyLabel={selectedAssemblyDetails?.label || ''}
                                                        onSuccess={handleSuccessfulSave}
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}