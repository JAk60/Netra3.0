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
import Sensor_cards from './sensor_cards';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { useFailureModesStore } from '@/store/failureModesStore';

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
    const { data, loading, fetchAnalysis } = useFailureModesStore();

    const handleShipChange = (shipId: string) => {
        setSelectedShip(shipId);
        setSelectedEquipment('');
        setShowMaintenanceTypes(false);
        setMaintenanceType('');
    };

    const handleEquipmentChange = (equipmentId: string) => {
        setSelectedEquipment(equipmentId);
        setShowMaintenanceTypes(false);
        setMaintenanceType('');
    };

    const handleSubmit = () => {
        if (selectedEquipment) {
            fetchAnalysis(selectedEquipment);
            setShowMaintenanceTypes(true);
        }
    };

    const handleMaintenanceTypeChange = (value: string) => {
        setMaintenanceType(value);
        // Reset values when changing maintenance type
        setAgeBasedUnit('');
        setAgeBasedValue('');
        setCalendarBasedUnit('');
        setCalendarBasedValue('');
    };

    const handleSave = () => {
        // Implement save logic based on maintenance type
        console.log('Saving maintenance type:', maintenanceType);
        if (maintenanceType === 'ageBased') {
            console.log('Age Based:', { unit: ageBasedUnit, value: ageBasedValue });
        } else if (maintenanceType === 'calendarBased') {
            console.log('Calendar Based:', { unit: calendarBasedUnit, value: calendarBasedValue });
        }
        // Add your save API call here
    };

    const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];

    return (
        <div className="w-full bg-muted/30 min-h-screen p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-6 w-full">
                <Header />
                
                {/* Ship and Equipment Selection */}
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

                {/* Maintenance Type Selection */}
                {showMaintenanceTypes && (
                    <Card className='bg-black'>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-semibold">Select Maintenance Type</Label>
                                </div>
                                <RadioGroup value={maintenanceType} onValueChange={handleMaintenanceTypeChange} className="flex flex-wrap gap-6">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="runToFailure" id="runToFailure" />
                                        <Label htmlFor="runToFailure" className="font-normal cursor-pointer">
                                            Run to Failure
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="ageBased" id="ageBased" />
                                        <Label htmlFor="ageBased" className="font-normal cursor-pointer">
                                            Age Based Maintenance
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="calendarBased" id="calendarBased" />
                                        <Label htmlFor="calendarBased" className="font-normal cursor-pointer">
                                            Calendar Based Maintenance
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="conditionBased" id="conditionBased" />
                                        <Label htmlFor="conditionBased" className="font-normal cursor-pointer">
                                            Condition Based Maintenance
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Run to Failure */}
                {maintenanceType === 'runToFailure' && (
                    <Card className='bg-black'>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-medium">Run to Failure</span>
                                <Button onClick={handleSave}>
                                    Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Age Based Maintenance */}
                {maintenanceType === 'ageBased' && (
                    <Card className='bg-black'>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="age-unit">Unit of Measurement</Label>
                                        <Select value={ageBasedUnit} onValueChange={setAgeBasedUnit}>
                                            <SelectTrigger id="age-unit">
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
                                        <Label htmlFor="age-value">Replacement Age</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="age-value"
                                                type="text"
                                                value={ageBasedValue}
                                                onChange={(e) => setAgeBasedValue(e.target.value)}
                                                placeholder="Enter value"
                                            />
                                            <Button onClick={handleSave}>
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Calendar Based Maintenance */}
                {maintenanceType === 'calendarBased' && (
                    <Card className='bg-black'>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="calendar-unit">Unit of Measurement</Label>
                                        <Select value={calendarBasedUnit} onValueChange={setCalendarBasedUnit}>
                                            <SelectTrigger id="calendar-unit">
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
                                        <Label htmlFor="calendar-value">Replacement Age</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="calendar-value"
                                                type="text"
                                                value={calendarBasedValue}
                                                onChange={(e) => setCalendarBasedValue(e.target.value)}
                                                placeholder="Enter value"
                                            />
                                            <Button onClick={handleSave}>
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Condition Based Maintenance */}
                {maintenanceType === 'conditionBased' && (
                    <>
                        <Sensor_cards stats={data?.stats} loading={loading} />
                        <Menu_tabs
                            componentId={selectedEquipment}
                            failureModes={data?.failureModes || []}
                            sensors={data?.sensors || []}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ModernCRUDUI;