import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { useShipSystemHierarchyStore } from '@/store/shipSystemHierarchyStore';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { Activity } from 'lucide-react';
import { useState } from 'react';
import Header from './header';
import Menu_tabs from './menu_tabs';
import System_cards from './system_cards';

const SystemView = () => {
    const [selectedShip, setSelectedShip] = useState('');
    const { ships } = useUserSelectionStore();
    const { data, loading, error, fetchHierarchy } = useShipSystemHierarchyStore();

    const handleShipChange = (shipId: string) => {
        setSelectedShip(shipId);
    };

    const handleSubmit = () => {
        if (selectedShip) {
            fetchHierarchy(selectedShip);
        }
    };

    console.log('data', data, selectedShip, ships);

    return (
        <div className="w-full bg-muted/30 min-h-screen p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-6 w-full">
                <Header />
                <Card className='bg-muted/20'>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="space-y-2 flex items-end">
                                <Button
                                    className="w-full"
                                    disabled={!selectedShip}
                                    onClick={handleSubmit}
                                >
                                    <Activity className="w-4 h-4 mr-2" />
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            <System_cards stats={data?.stats} loading={loading} />
            <Menu_tabs shipId={selectedShip}
                systems={data?.systems || []}
                components={data?.components || []}
                departments={data?.departments || []}
                loading={loading}
                />
                </div>
        </div>
    );
}
export default SystemView;