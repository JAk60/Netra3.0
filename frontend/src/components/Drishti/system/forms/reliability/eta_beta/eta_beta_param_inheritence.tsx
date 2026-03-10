import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/new-york-v4/ui/accordion';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { useShipSystemHierarchyStore } from '@/store/shipSystemHierarchyStore';
import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { InputParametersForm } from './views/InputParametersForm';
import { ActualDataPointForm } from './views/ActualDataPointForm';
import { IntervalDataPointForm } from './views/IntervalDataPointForm';
import { OEMForm } from './views/OEMForm';
import { OEMExpertForm } from './views/OEMExpertForm';
import { ExpertJudgementForm } from './views/ExpertJudgementForm';
import { ProbabilityFailureForm } from './views/ProbabilityFailureForm';
import { NPRDForm } from './views/NPRDForm';

interface AssemblyOption {
  value: string;
  label: string;
}

const VIEW_TYPES = [
  { id: 'input-params',        label: 'Input Parameters',    Component: InputParametersForm },
  { id: 'actual-data',         label: 'Actual Data Point',   Component: ActualDataPointForm },
  { id: 'interval-data',       label: 'Interval Data Point', Component: IntervalDataPointForm },
  { id: 'oem',                 label: 'OEM',                 Component: OEMForm },
  { id: 'oem-expert',          label: 'OEM + Expert',        Component: OEMExpertForm },
  { id: 'expert-judgement',    label: 'Expert Judgement',    Component: ExpertJudgementForm },
  { id: 'probability-failure', label: 'Probability Failure', Component: ProbabilityFailureForm },
  { id: 'nprd',                label: 'NPRD',                Component: NPRDForm },
] as const;

export default function EtaBetaParamInheritance() {
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedAssembly, setSelectedAssembly] = useState('');
  const [assemblyOptions, setAssemblyOptions] = useState<AssemblyOption[]>([]);
  const [activeView, setActiveView] = useState('');

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
        setAssemblyOptions(
          children.map((child: any) => ({
            value: child.component_id,
            label: `${child.component_name} (${child.nomenclature})`,
          }))
        );
      } catch {
        setAssemblyOptions([]);
      }
    })();
  }, [selectedEquipment, selectedShip, fetchComponentChildren]);

  const handleShipChange = (id: string) => {
    setSelectedShip(id);
    setSelectedEquipment('');
    setSelectedAssembly('');
    setAssemblyOptions([]);
    setActiveView('');
  };

  const handleEquipmentChange = (id: string) => {
    setSelectedEquipment(id);
    setSelectedAssembly('');
    setActiveView('');
  };

  const selectedAssemblyLabel = assemblyOptions.find(o => o.value === selectedAssembly)?.label ?? '';

  const sharedProps = {
    selectedShip,
    selectedEquipment,
    selectedAssembly,
    assemblyLabel: selectedAssemblyLabel,
    onSuccess: () => {
      // optionally reset assembly selection after save
    },
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
        <Card className="bg-muted/20 w-full">
          <CardContent className="pt-6 space-y-6">

            {/* ── Selection row ── */}
            <div className="grid grid-cols-3 gap-4">
              <GroupedCombobox
                label="Select Ship"
                groups={ships}
                value={selectedShip}
                onValueChange={handleShipChange}
                placeholder="Choose a ship"
              />
              <GroupedCombobox
                label="Select Equipment"
                groups={equipmentGroups}
                value={selectedEquipment}
                onValueChange={handleEquipmentChange}
                placeholder="Choose equipment"
                disabled={!selectedShip}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Assembly</label>
                <GroupedCombobox
                  groups={[{ groupName: 'Assemblies', items: assemblyOptions }]}
                  value={selectedAssembly}
                  onValueChange={setSelectedAssembly}
                  placeholder="Choose assembly"
                  disabled={!selectedEquipment || assemblyOptions.length === 0}
                />
              </div>
            </div>

            {/* ── Forms accordion — only shown once assembly selected ── */}
            {selectedShip && selectedEquipment && selectedAssembly && (
              <Card className="mt-4">
                <CardContent className="pt-4">
                  <Accordion type="single" collapsible value={activeView} onValueChange={setActiveView}>
                    {VIEW_TYPES.map(({ id, label, Component }) => (
                      <AccordionItem key={id} value={id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4" />
                            <span>{label}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4">
                            <Component {...sharedProps} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
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