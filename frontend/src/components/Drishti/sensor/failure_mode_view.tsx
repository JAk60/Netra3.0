import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AddFailureModeForm from './forms/create_failuremode';


// ============= TYPES =============
export interface FailureMode {
    id: string;
    name: string;
    severity: string;
    sensors: number;
}

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

interface Stats {
    totalFailureModes: number;
    totalSensors: number;
    alertedSensors: number;
    sensorsWithoutFailureModes: number;
}

interface AnalysisData {
    stats: Stats;
    failureModes: FailureMode[];
    sensors: Sensor[];
}


export default function Failure_mode_view({ failureModes, loading, componentId }: { failureModes: FailureMode[], loading?: boolean, componentId: string | null }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const getSeverityVariant = (severity: string) => {
        const variants: Record<string, 'destructive' | 'default' | 'secondary'> = {
            Critical: 'destructive',
            High: 'default',
            Medium: 'secondary',
        };
        return variants[severity] || 'default';
    };

    const filteredFailureModes = failureModes.filter((mode) =>
        mode.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSuccess = () => {
        // Refresh the failure modes list
        window.location.reload(); // Or use a better state management approach
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="h-5 bg-muted rounded w-1/3 mb-2 animate-pulse" />
                                            <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
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
                {showAddForm && componentId && (
                    <AddFailureModeForm
                        componentId={componentId}
                        onClose={() => setShowAddForm(false)}
                        onSuccess={handleSuccess}
                    />
                )}

                <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search failure modes..." 
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={() => setShowAddForm(true)}
                        disabled={!componentId}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Failure Mode
                    </Button>
                </div>

                {filteredFailureModes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>{searchQuery ? 'No failure modes match your search.' : 'No failure modes found. Select equipment to view data.'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredFailureModes.map((mode) => (
                            <Card key={mode.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold">{mode.name}</h3>
                                                <Badge variant={getSeverityVariant(mode.severity)}>{mode.severity}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Monitored by {mode.sensors} sensor{mode.sensors !== 1 ? 's' : ''}
                                            </p>
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