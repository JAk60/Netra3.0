'use client'

import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Search, Plus, RefreshCcw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AddSensorForm from './forms/create_sensor';
import { FailureMode } from './failure_mode_view';
import AddFailureModeForm from './forms/create_failuremode';

// ================= TYPES =================
interface Sensor {
    id: string;
    name: string;
    unit: string;
    min_value: number;
    max_value: number;
    frequency: string | null;
    failureMode: string;
    status: string;
    P?: number;
    F?: number;
}

// ================= MAIN COMPONENT =================
export default function Sensor_view({
    failureModes,
    sensors,
    loading,
    componentId
}: {
    failureModes: any[],
    sensors: Sensor[],
    loading?: boolean,
    componentId: string | null
}) {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddFailureModeForm, setShowAddFailureModeForm] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => setRefreshing(false), 500);
    };

    const filteredSensors = useMemo(() => {
        return sensors
            .filter(sensor =>
                sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sensor.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sensor.failureMode.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [searchQuery, sensors]);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p>Loading sensors...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">

                {/* Top Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search sensor..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>

                        <Button onClick={() => setShowAddFailureModeForm(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Failure Mode
                        </Button>

                        <Button onClick={() => setShowAddForm(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Sensor
                        </Button>
                    </div>
                </div>

                {/* Add Failure Mode Form */}
                {showAddFailureModeForm && (
                    <AddFailureModeForm
                        componentId={componentId || ''}
                        onClose={() => setShowAddFailureModeForm(false)}
                        onSuccess={() => {
                            setShowAddFailureModeForm(false);
                            router.refresh();
                        }}
                    />
                )}

                {/* Add Sensor Form */}
                {showAddForm && (
                    <AddSensorForm
                        failureModes={failureModes}
                        componentId={componentId || ''}
                        onClose={() => setShowAddForm(false)}
                        onSuccess={() => {
                            setShowAddForm(false);
                            router.refresh();
                        }}
                    />
                )}

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="border p-2 text-left">Sensor Name</th>
                                <th className="border p-2 text-left">Unit</th>
                                <th className="border p-2 text-left">Min Value</th>
                                <th className="border p-2 text-left">Max Value</th>
                                <th className="border p-2 text-left">Frequency</th>
                                <th className="border p-2 text-left">Failure Mode</th>
                                <th className="border p-2 text-left">P Value</th>
                                <th className="border p-2 text-left">F Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSensors.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center p-4">
                                        No sensors found.
                                    </td>
                                </tr>
                            ) : (
                                filteredSensors.map(sensor => (
                                    <tr key={sensor.id} className="hover:bg-muted/50">
                                        <td className="border p-2">{sensor.name}</td>
                                        <td className="border p-2">{sensor.unit}</td>
                                        <td className="border p-2">{sensor.min_value}</td>
                                        <td className="border p-2">{sensor.max_value}</td>
                                        <td className="border p-2">{sensor.frequency ?? '—'}</td>
                                        <td className="border p-2">{sensor.failureMode ?? '—'}</td>
                                        <td className="border p-2">{sensor.P ?? '—'}</td>
                                        <td className="border p-2">{sensor.F ?? '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </CardContent>
        </Card>
    );
}