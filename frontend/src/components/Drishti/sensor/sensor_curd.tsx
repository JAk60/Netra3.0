import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { Activity, Upload } from 'lucide-react';
import { useState } from 'react';
import Header from './header';
import Menu_tabs from './menu_tabs';
import Sensor_cards from './sensor_cards';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { useFailureModesStore } from '@/store/failureModesStore';

const ModernCRUDUI = () => {
    const [selectedShip, setSelectedShip] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState('');

    const { ships, getEquipmentForShip } = useUserSelectionStore();
    const { data, loading, fetchAnalysis } = useFailureModesStore();

    const handleShipChange = (shipId: string) => {
        setSelectedShip(shipId);
        setSelectedEquipment(''); // Reset equipment when ship changes
    };

    const handleEquipmentChange = (equipmentId: string) => {
        setSelectedEquipment(equipmentId);
    };

    const handleSubmit = () => {
        if (selectedEquipment) {
            fetchAnalysis(selectedEquipment);
        }
    };

    const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];
    console.log('equipmentGroups', equipmentGroups)
    return (
        <div className="w-full bg-muted/30 min-h-screen p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-6 w-full">
                <Header />
                <Card className='bg-muted/20'>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <GroupedCombobox
                                    label="Select Ship"
                                    placeholder={ships.length === 0 ? "Loading ships..." : "Choose a ship"}
                                    groups={ships}
                                    value={selectedShip}
                                    onValueChange={handleShipChange}
                                    disabled={ships.length === 0}
                                />
                            </div>
                            <div className="space-y-2">
                                <GroupedCombobox
                                    label="Select Equipment"
                                    placeholder={!selectedShip ? "Select a ship first" : equipmentGroups.length === 0 ? "No equipment available" : "Choose equipment"}
                                    groups={equipmentGroups}
                                    value={selectedEquipment}
                                    onValueChange={handleEquipmentChange}
                                    disabled={!selectedShip || equipmentGroups.length === 0}
                                />
                            </div>
                            <div className="space-y-2 flex items-end">
                                <Button
                                    className="w-full"
                                    disabled={!selectedEquipment}
                                    onClick={handleSubmit}
                                >
                                    <Activity className="w-4 h-4 mr-2" />
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Sensor_cards stats={data?.stats} loading={loading} />
                <Menu_tabs
                    componentId={selectedEquipment}
                    failureModes={data?.failureModes || []}
                    sensors={data?.sensors || []}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default ModernCRUDUI;
