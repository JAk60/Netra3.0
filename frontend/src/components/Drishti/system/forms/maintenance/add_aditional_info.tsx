import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import MaintenanceInformation from './add_Maintenace_info';
import { useShipSystemHierarchyStore } from "@/store/shipSystemHierarchyStore";
import RedundancyForm from './add_RedundancyForm';
import Average_monthly_utilization_InfoForm from './add_avg_m_utilization';
import MaintenanceDataForm from './add_Maintenance_data';
import AddFailureModeForm from './add_failure_mode';


export default function Additional_Info() {
    const [selectedShipId, setSelectedShipId] = useState('');
    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [hierarchyData, setHierarchyData] = useState(null);

    const { ships, getEquipmentForShip } = useUserSelectionStore();
    const { fetchComponentChildren } = useShipSystemHierarchyStore();

    const equipmentGroups = selectedShipId ? getEquipmentForShip(selectedShipId) : [];

    useEffect(() => {
        if (!selectedShipId || !selectedEquipmentId) {
            setHierarchyData(null);
            return;
        }

        const load = async () => {
            const data = await fetchComponentChildren(selectedEquipmentId, selectedShipId);
            setHierarchyData(data);
        };

        load();
    }, [selectedShipId, selectedEquipmentId]);

    const handleShipChange = (shipId: string) => {
        setSelectedShipId(shipId);
        setSelectedEquipmentId("");
        setHierarchyData(null);
    };

    const handleEquipmentChange = (equipmentId: string) => {
        setSelectedEquipmentId(equipmentId);
    };

    return (
        <div className="min-h-screen w-full bg-muted/30 text-white p-6">
            <Card className="bg-muted/20">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4">
                        <GroupedCombobox
                            label="Select Ship"
                            placeholder="Choose a ship"
                            groups={ships}
                            value={selectedShipId}
                            onValueChange={handleShipChange}
                            disabled={ships.length === 0}
                        />

                        <GroupedCombobox
                            label="Select Equipment"
                            placeholder="Choose equipment"
                            groups={equipmentGroups}
                            value={selectedEquipmentId}
                            onValueChange={handleEquipmentChange}
                            disabled={!selectedShipId}
                        />

                        <div className="flex items-end">
                            <Button
                                className="w-full"
                                disabled={!selectedEquipmentId}
                                onClick={() => console.log("Submitting")}
                            >
                                <Activity className="w-4 h-4 mr-2" /> Submit
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* All child forms receive componentId — only render once equipment is selected */}
            {hierarchyData && selectedEquipmentId && (
                <>
                    <RedundancyForm hierarchyData={hierarchyData} />
                    <MaintenanceInformation componentId={selectedEquipmentId} />
                    <AddFailureModeForm componentId={selectedEquipmentId} />
                    <MaintenanceDataForm componentId={selectedEquipmentId} />
                    <Average_monthly_utilization_InfoForm componentId={selectedEquipmentId} />
                </>
            )}
        </div>
    );
}