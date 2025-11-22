import { SystemUI, ComponentUI } from '@/actions/system/get-ship-system-hierarchy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Cpu, Package, Zap, Shield, Wind } from 'lucide-react';

interface SystemsViewProps {
    systems: SystemUI[];
    components: ComponentUI[];
    loading: boolean;
    shipId: string | null;
}

const systemIcons: Record<string, any> = {
    propulsion: Wind,
    power_generation: Zap,
    support: Package,
    firing: Shield,
};

const systemColors: Record<string, string> = {
    propulsion: 'bg-blue-100 text-blue-700 border-blue-300',
    power_generation: 'bg-green-100 text-green-700 border-green-300',
    support: 'bg-purple-100 text-purple-700 border-purple-300',
    firing: 'bg-red-100 text-red-700 border-red-300',
};

export default function Systems_view({ systems, components, loading, shipId }: SystemsViewProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <div className="h-6 w-32 bg-muted rounded" />
                            <div className="h-4 w-24 bg-muted rounded mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-20 bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const getComponentsForSystem = (systemType: string) => {
        return components.filter(c => c.systemType === systemType);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systems.map((system) => {
                const Icon = systemIcons[system.type] || Cpu;
                const colorClass = systemColors[system.type] || 'bg-gray-100 text-gray-700 border-gray-300';
                const systemComponents = getComponentsForSystem(system.type);
                
                return (
                    <Card key={system.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${colorClass}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg capitalize">
                                            {system.name.replace(/_/g, ' ')}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            System ID: {system.id.slice(0, 8)}...
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="secondary">
                                    {system.componentCount} {system.componentCount === 1 ? 'Component' : 'Components'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Components:</h4>
                                <div className="space-y-1">
                                    {systemComponents.length > 0 ? (
                                        systemComponents.map((component) => (
                                            <div 
                                                key={component.id} 
                                                className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{component.nomenclature}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {component.name}
                                                    </span>
                                                </div>
                                                {component.isLmu && (
                                                    <Badge variant="outline" className="text-xs">LMU</Badge>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No components found</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}