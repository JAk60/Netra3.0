'use client';

import { useState, useMemo } from 'react';
import { SystemUI, ComponentUI } from '@/actions/system/get-ship-system-hierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
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
import { Search, Filter, Package, Edit, Trash2 } from 'lucide-react';

interface EquipmentViewProps {
    systems: SystemUI[];
    components: ComponentUI[];
    loading: boolean;
    shipId: string | null;
}

export default function Equipment_view({ systems, components, loading, shipId }: EquipmentViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSystem, setSelectedSystem] = useState<string>('all');
    const [lmuFilter, setLmuFilter] = useState<string>('all');
    const [hierarchyFilter, setHierarchyFilter] = useState<string>('all');

    const filteredComponents = useMemo(() => {
        return components.filter((component) => {
            // Search filter
            const matchesSearch = 
                searchTerm === '' ||
                component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                component.nomenclature.toLowerCase().includes(searchTerm.toLowerCase());

            // System filter
            const matchesSystem = 
                selectedSystem === 'all' || 
                component.systemType === selectedSystem;

            // LMU filter
            const matchesLmu = 
                lmuFilter === 'all' ||
                (lmuFilter === 'lmu' && component.isLmu) ||
                (lmuFilter === 'non-lmu' && !component.isLmu);

            // Hierarchy filter
            const matchesHierarchy = 
                hierarchyFilter === 'all' ||
                (hierarchyFilter === 'parent' && component.hasParent) ||
                (hierarchyFilter === 'no-parent' && !component.hasParent);

            return matchesSearch && matchesSystem && matchesLmu && matchesHierarchy;
        });
    }, [components, searchTerm, selectedSystem, lmuFilter, hierarchyFilter]);

    const handleReset = () => {
        setSearchTerm('');
        setSelectedSystem('all');
        setLmuFilter('all');
        setHierarchyFilter('all');
    };

    if (loading) {
        return (
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
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Equipment List
                    </CardTitle>
                    <Badge variant="secondary">
                        {filteredComponents.length} of {components.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
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

                    <Select value={lmuFilter} onValueChange={setLmuFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="LMU Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All LMU Status</SelectItem>
                            <SelectItem value="lmu">LMU Only</SelectItem>
                            <SelectItem value="non-lmu">Non-LMU Only</SelectItem>
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

                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredComponents.length} equipment
                    </p>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <Filter className="w-4 h-4 mr-2" />
                        Reset Filters
                    </Button>
                </div>

                {/* Table */}
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
                                            <div className="flex gap-1">
                                                {component.isLmu && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        LMU
                                                    </Badge>
                                                )}
                                                {component.hasParent && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Child
                                                    </Badge>
                                                )}
                                            </div>
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
    );
}