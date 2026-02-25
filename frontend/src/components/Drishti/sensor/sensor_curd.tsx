'use client'

import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import { Label } from '@/registry/new-york-v4/ui/label';
import { RadioGroup, RadioGroupItem } from '@/registry/new-york-v4/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Input } from '@/registry/new-york-v4/ui/input';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { Activity } from 'lucide-react';
import { useState } from 'react';

import Header from './header';
import Menu_tabs from './menu_tabs';

import { useUserSelectionStore } from '@/store/UserSelectionStore';

import { useBulkImportStore } from '@/store/Bulk import.store';
import { useSensorStore } from '@/store/useSensorsStore';
import Sensor_cards from './sensor_cards';

const ModernCRUDUI = () => {

    const [selectedShip, setSelectedShip] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [showMaintenanceTypes, setShowMaintenanceTypes] = useState(false);
    const [maintenanceType, setMaintenanceType] = useState('');
    const [ageBasedUnit, setAgeBasedUnit] = useState('');
    const [ageBasedValue, setAgeBasedValue] = useState('');
    const [calendarBasedUnit, setCalendarBasedUnit] = useState('');
    const [calendarBasedValue, setCalendarBasedValue] = useState('');

    const { ships, getEquipmentForShip } = useUserSelectionStore();

    // 🔥 UPDATED STORE USAGE
    const { sensors,failureModes, loading, fetchSensors } = useSensorStore();

    const { setComponentId } = useBulkImportStore();

    const handleShipChange = (shipId: string) => {
        setSelectedShip(shipId);
        setSelectedEquipment('');
        setShowMaintenanceTypes(false);
        setMaintenanceType('');
    };

    const handleEquipmentChange = (equipmentId: string) => {
        setSelectedEquipment(equipmentId);
        setComponentId(equipmentId);
        setShowMaintenanceTypes(false);
        setMaintenanceType('');
    };

    const handleSubmit = async () => {
        if (selectedEquipment) {
            await fetchSensors(selectedEquipment); // 🔥 updated function
            setShowMaintenanceTypes(true);
        }
    };

    const handleMaintenanceTypeChange = (value: string) => {
        setMaintenanceType(value);
        setAgeBasedUnit('');
        setAgeBasedValue('');
        setCalendarBasedUnit('');
        setCalendarBasedValue('');
    };

    const handleSave = () => {
        console.log('Saving maintenance type:', maintenanceType);

        if (maintenanceType === 'ageBased') {
            console.log('Age Based:', { unit: ageBasedUnit, value: ageBasedValue });
        }

        if (maintenanceType === 'calendarBased') {
            console.log('Calendar Based:', { unit: calendarBasedUnit, value: calendarBasedValue });
        }
    };

    const equipmentGroups = selectedShip
        ? getEquipmentForShip(selectedShip)
        : [];

    return (
        <div className="w-full bg-muted/30 min-h-screen p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-6 w-full">

                <Header />

                {/* Ship and Equipment Selection */}
                <Card className='bg-muted/20'>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4">

                            <GroupedCombobox
                                label="Select Ship"
                                placeholder={ships.length === 0 ? "Loading ships..." : "Choose a ship"}
                                groups={ships}
                                value={selectedShip}
                                onValueChange={handleShipChange}
                                disabled={ships.length === 0}
                            />

                            <GroupedCombobox
                                label="Select Equipment"
                                placeholder={
                                    !selectedShip
                                        ? "Select a ship first"
                                        : equipmentGroups.length === 0
                                            ? "No equipment available"
                                            : "Choose equipment"
                                }
                                groups={equipmentGroups}
                                value={selectedEquipment}
                                onValueChange={handleEquipmentChange}
                                disabled={!selectedShip || equipmentGroups.length === 0}
                            />

                            <div className="flex items-end">
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

                {!showMaintenanceTypes && (
                    <div className="min-h-[400px] w-full bg-muted/30 rounded-xl p-8 border border-gray-800 flex items-center justify-center">
                        <p className="text-gray-200 text-center">
                            Please select a ship and equipment above to configure sensors.
                        </p>
                    </div>
                )}

                {/* Maintenance Type Selection */}
                {showMaintenanceTypes && (
                    <Card className='bg-black'>
                        <CardContent className="pt-6">
                            <Label className="text-base font-semibold">
                                Select Maintenance Type
                            </Label>

                            <RadioGroup
                                value={maintenanceType}
                                onValueChange={handleMaintenanceTypeChange}
                                className="flex flex-wrap gap-6 mt-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="runToFailure" id="runToFailure" />
                                    <Label htmlFor="runToFailure">Run to Failure</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ageBased" id="ageBased" />
                                    <Label htmlFor="ageBased">Age Based Maintenance</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="calendarBased" id="calendarBased" />
                                    <Label htmlFor="calendarBased">Calendar Based Maintenance</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="conditionBased" id="conditionBased" />
                                    <Label htmlFor="conditionBased">Condition Based Maintenance</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                )}

                {/* Run to Failure */}
                {maintenanceType === 'runToFailure' && (
                    <Card className='bg-black'>
                        <CardContent className="pt-6 flex justify-between items-center">
                            <span className="text-lg font-medium">Run to Failure</span>
                            <Button onClick={handleSave}>Save</Button>
                        </CardContent>
                    </Card>
                )}

                {/* Age Based */}
                {maintenanceType === 'ageBased' && (
                    <Card className='bg-black'>
                        <CardContent className="pt-6 grid grid-cols-2 gap-4">

                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Select value={ageBasedUnit} onValueChange={setAgeBasedUnit}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hours">Hours</SelectItem>
                                        <SelectItem value="days">Days</SelectItem>
                                        <SelectItem value="weeks">Weeks</SelectItem>
                                        <SelectItem value="months">Months</SelectItem>
                                        <SelectItem value="years">Years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Replacement Age</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={ageBasedValue}
                                        onChange={(e) => setAgeBasedValue(e.target.value)}
                                        placeholder="Enter value"
                                    />
                                    <Button onClick={handleSave}>Save</Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                )}

                {/* Calendar Based */}
                {maintenanceType === 'calendarBased' && (
                    <Card className='bg-black'>
                        <CardContent className="pt-6 grid grid-cols-2 gap-4">

                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Select value={calendarBasedUnit} onValueChange={setCalendarBasedUnit}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hours">Hours</SelectItem>
                                        <SelectItem value="days">Days</SelectItem>
                                        <SelectItem value="weeks">Weeks</SelectItem>
                                        <SelectItem value="months">Months</SelectItem>
                                        <SelectItem value="years">Years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Replacement Age</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={calendarBasedValue}
                                        onChange={(e) => setCalendarBasedValue(e.target.value)}
                                        placeholder="Enter value"
                                    />
                                    <Button onClick={handleSave}>Save</Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                )}

                {/* Condition Based */}
                {maintenanceType === 'conditionBased' && (
                    <>
                        <Sensor_cards
                            sensors={sensors || []}
                            loading={loading}
                        />
                        <Menu_tabs
                        failureModes={failureModes}
                            componentId={selectedEquipment}
                            sensors={sensors || []}
                            loading={loading}
                        />
                    </>
                )}

            </div>
        </div>
    );
};

export default ModernCRUDUI;