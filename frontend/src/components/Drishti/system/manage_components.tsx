import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Plus, Upload } from 'lucide-react';
import AddComponentForm from './forms/add_equipment';
import BulkOperations from './bulk_operations';
import { Department } from '@/actions/system/get-ship-system-hierarchy';

// Type definitions
interface SystemUI {
    id: string;
    name: string;
    type: string;
}

interface ComponentUI {
    id: string;
    name: string;
    nomenclature: string;
}

export interface ManageComponentsProps {
    systems: SystemUI[];
    components: ComponentUI[];
    departments: Department[];
    loading: boolean;
    shipId: string | null;
}

export default function ManageComponents({ systems, components,departments,loading, shipId }: ManageComponentsProps) {
    return (
        <Tabs defaultValue="add" className="space-y-4">
            <TabsList>
                <TabsTrigger value="add">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Component
                </TabsTrigger>
                <TabsTrigger value="bulk">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Operations
                </TabsTrigger>
            </TabsList>

            <TabsContent value="add">
                <AddComponentForm systems={systems} components={components} departments={departments} loading shipId={shipId} />
            </TabsContent>

            <TabsContent value="bulk">
                <BulkOperations components={components} shipId={shipId} />
            </TabsContent>
        </Tabs>
    );
}