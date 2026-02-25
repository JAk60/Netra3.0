'use client';

import { useState, useMemo } from 'react';
import { SystemUI, ComponentUI } from '@/actions/system/get-ship-system-hierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { CardDescription } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Button } from '@/registry/new-york-v4/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/registry/new-york-v4/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/registry/new-york-v4/ui/table';
import { Search, Filter, Package, Edit, Trash2, Cpu, Zap, Shield, Wind, LayoutGrid, List } from 'lucide-react';

interface EquipmentViewProps {
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

export default function Equipment_view({ systems, components, loading, shipId }: EquipmentViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSystem, setSelectedSystem] = useState<string>('all');
    const [hierarchyFilter, setHierarchyFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'system' | 'list'>('system');

    const filteredComponents = useMemo(() => {
        return components.filter((component) => {
            const matchesSearch =
                searchTerm === '' ||
                component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                component.nomenclature.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSystem =
                selectedSystem === 'all' ||
                component.systemType === selectedSystem;

            const matchesHierarchy =
                hierarchyFilter === 'all' ||
                (hierarchyFilter === 'parent' && component.hasParent) ||
                (hierarchyFilter === 'no-parent' && !component.hasParent);

            return matchesSearch && matchesSystem && matchesHierarchy;
        });
    }, [components, searchTerm, selectedSystem, hierarchyFilter]);

    const handleReset = () => {
        setSearchTerm('');
        setSelectedSystem('all');
        setHierarchyFilter('all');
    };

    const getComponentsForSystem = (systemType: string) => {
        return filteredComponents.filter(c => c.systemType === systemType);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or nomenclature..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Systems" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Systems</SelectItem>
                                {systems.map((system) => (
                                    <SelectItem key={system.id} value={system.type}>
                                        {system.name.replace(/_/g, ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={hierarchyFilter} onValueChange={setHierarchyFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Hierarchy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Components</SelectItem>
                                <SelectItem value="parent">Has Parent</SelectItem>
                                <SelectItem value="no-parent">No Parent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredComponents.length} of {components.length} equipment
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleReset}>
                                <Filter className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            {/* View toggle */}
                            <div className="flex items-center border rounded-md overflow-hidden">
                                <Button
                                    variant={viewMode === 'system' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="rounded-none border-0"
                                    onClick={() => setViewMode('system')}
                                >
                                    <LayoutGrid className="w-4 h-4 mr-1" />
                                    System
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="rounded-none border-0"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4 mr-1" />
                                    List
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System View */}
            {viewMode === 'system' && (
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
                                            {systemComponents.length} {systemComponents.length === 1 ? 'Component' : 'Components'}
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
                                                        {component.hasParent && (
                                                            <Badge variant="outline" className="text-xs">Child</Badge>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">No components match filters</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <Card>
                    <CardContent className="pt-4">
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nomenclature</TableHead>
                                        <TableHead>Component Name</TableHead>
                                        <TableHead>System</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>CMMS Code</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredComponents.length > 0 ? (
                                        filteredComponents.map((component) => (
                                            <TableRow key={component.id}>
                                                <TableCell className="font-medium">
                                                    {component.nomenclature}
                                                </TableCell>
                                                <TableCell>{component.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {component.systemType.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {component.hasParent && (
                                                        <Badge variant="outline" className="text-xs">Child</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {component.cmmsCode || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No equipment found matching your filters
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}