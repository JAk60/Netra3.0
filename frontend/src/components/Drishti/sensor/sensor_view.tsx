import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { AlertCircle, CheckCircle, Edit, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import AddSensorForm from './forms/create_sensor';
import { FailureMode } from './failure_mode_view';

// ============= TYPES =============
interface Sensor {
    id: string;
    name: string;
    unit: string;
    range: string;
    frequency: string;
    failureMode: string;
    status: string;
    P?: number;
    F?: number;
}


// ============= FILTER COMPONENT =============
interface SensorFiltersProps {
    sensors: Sensor[];
    selectedStatus: string[];
    setSelectedStatus: (val: string[]) => void;
    selectedUnits: string[];
    setSelectedUnits: (val: string[]) => void;
    selectedFailureModes: string[];
    setSelectedFailureModes: (val: string[]) => void;
    onClose: () => void;
    onClearAll: () => void;
}

function SensorFilters({
    sensors,
    selectedStatus,
    setSelectedStatus,
    selectedUnits,
    setSelectedUnits,
    selectedFailureModes,
    setSelectedFailureModes,
    onClose,
    onClearAll
}: SensorFiltersProps) {
    const uniqueStatuses = Array.from(new Set(sensors.map(s => s.status)));
    const uniqueUnits = Array.from(new Set(sensors.map(s => s.unit)));
    const uniqueFailureModes = Array.from(new Set(sensors.map(s => s.failureMode)));

    const toggleFilter = (value: string, selected: string[], setter: (val: string[]) => void) => {
        if (selected.includes(value)) {
            setter(selected.filter(v => v !== value));
        } else {
            setter([...selected, value]);
        }
    };

    const activeFilterCount = selectedStatus.length + selectedUnits.length + selectedFailureModes.length;

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filters</h3>
                    <div className="flex gap-2">
                        {activeFilterCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={onClearAll}>
                                <X className="w-4 h-4 mr-1" />
                                Clear All
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {/* Status Filter */}
                    <div>
                        <p className="text-sm font-medium mb-2">Status</p>
                        <div className="flex flex-wrap gap-2">
                            {uniqueStatuses.map((status) => (
                                <Button
                                    key={status}
                                    variant={selectedStatus.includes(status) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleFilter(status, selectedStatus, setSelectedStatus)}
                                >
                                    {status === 'alert' ? (
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {status}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Unit Filter */}
                    <div>
                        <p className="text-sm font-medium mb-2">Unit</p>
                        <div className="flex flex-wrap gap-2">
                            {uniqueUnits.map((unit) => (
                                <Button
                                    key={unit}
                                    variant={selectedUnits.includes(unit) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleFilter(unit, selectedUnits, setSelectedUnits)}
                                >
                                    {unit}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Failure Mode Filter */}
                    <div>
                        <p className="text-sm font-medium mb-2">Monitors</p>
                        <div className="flex flex-wrap gap-2">
                            {uniqueFailureModes.map((mode) => (
                                <Button
                                    key={mode}
                                    variant={selectedFailureModes.includes(mode) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleFilter(mode, selectedFailureModes, setSelectedFailureModes)}
                                >
                                    {mode}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ============= MAIN SENSOR VIEW COMPONENT =============
export default function Sensor_view({ failureModes, sensors, loading, componentId }: {failureModes: FailureMode[], sensors: Sensor[], loading?: boolean ,componentId: string | null}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [selectedFailureModes, setSelectedFailureModes] = useState<string[]>([]);

    const clearAllFilters = () => {
        setSelectedStatus([]);
        setSelectedUnits([]);
        setSelectedFailureModes([]);
        setSearchQuery('');
    };

    const handleAddSensor = () => {
        setShowAddForm(true);
        setShowFilters(false);
    };

    const handleFilterToggle = () => {
        setShowFilters(!showFilters);
        setShowAddForm(false);
    };

    const activeFilterCount = selectedStatus.length + selectedUnits.length + selectedFailureModes.length;

    const filteredSensors = sensors.filter((sensor) => {
        const matchesSearch = 
            sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sensor.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sensor.failureMode.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(sensor.status);
        const matchesUnit = selectedUnits.length === 0 || selectedUnits.includes(sensor.unit);
        const matchesFailureMode = selectedFailureModes.length === 0 || selectedFailureModes.includes(sensor.failureMode);

        return matchesSearch && matchesStatus && matchesUnit && matchesFailureMode;
    });

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="h-5 bg-muted rounded w-1/4 mb-3 animate-pulse" />
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="h-10 bg-muted rounded animate-pulse" />
                                                <div className="h-10 bg-muted rounded animate-pulse" />
                                                <div className="h-10 bg-muted rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-3 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search sensors..." 
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button 
                            variant={activeFilterCount > 0 ? "default" : "outline"}
                            onClick={handleFilterToggle}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                            {activeFilterCount > 0 && (
                                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                    <Button onClick={handleAddSensor}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sensor
                    </Button>
                </div>

                {showAddForm && (
                    <AddSensorForm 
                    failureModes={failureModes}
                        componentId={componentId}
                        onClose={() => setShowAddForm(false)}
                        onSuccess={() => {
                            // Optionally refresh sensors list
                            console.log('Sensor created successfully');
                        }}
                    />
                )}

                {showFilters && (
                    <SensorFilters
                        sensors={sensors}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        selectedUnits={selectedUnits}
                        setSelectedUnits={setSelectedUnits}
                        selectedFailureModes={selectedFailureModes}
                        setSelectedFailureModes={setSelectedFailureModes}
                        onClose={() => setShowFilters(false)}
                        onClearAll={clearAllFilters}
                    />
                )}

                {filteredSensors.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>{searchQuery || activeFilterCount > 0 ? 'No sensors match your search or filters.' : 'No sensors found. Select equipment to view data.'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSensors.map((sensor) => (
                            <Card key={sensor.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                {sensor.status === 'alert' ? (
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                )}
                                                <h3 className="font-semibold">{sensor.name}</h3>
                                                <Badge variant="secondary">{sensor.unit}</Badge>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground text-xs mb-1">Range</p>
                                                    <p className="font-medium">{sensor.range}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs mb-1">Frequency</p>
                                                    <p className="font-medium">{sensor.frequency}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs mb-1">Monitors</p>
                                                    <p className="font-medium">{sensor.failureMode}</p>
                                                </div>
                                                {(sensor.P !== undefined || sensor.F !== undefined) && (
                                                    <div>
                                                        <p className="text-muted-foreground text-xs mb-1">P / F Values</p>
                                                        <p className="font-medium">{sensor.P ?? 'N/A'} / {sensor.F ?? 'N/A'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}