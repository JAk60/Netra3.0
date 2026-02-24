import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Plus, Upload } from 'lucide-react';
import AddComponentForm from '../forms/ship/add_equipment';
import BulkOperations from '../bulk_operations';
import { Department } from '@/actions/system/get-ship-system-hierarchy';
import OverhaulEntryForm from '../forms/maintenance/add_overhaul_info';
import ParamInheritance from '../forms/reliability/alpha_beta/alpha_beta_param_inheritence';
import MaintenanceInfo from '../forms/maintenance/add_Maintenace_info';
import RedundancyForm from '../forms/maintenance/add_Maintenace_info';
import Additional_Info from '../forms/maintenance/add_aditional_info';
import { Parameters } from '../forms/reliability/Params_Main';

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
    selectedShip: string;
    systems: SystemUI[];
    components: ComponentUI[];
    departments: Department[];
    loading: boolean;
    shipId: string | null;
}

export default function ManageComponents({ selectedShip, systems, components, departments, loading, shipId }: ManageComponentsProps) {
    return (
        <Tabs defaultValue="add" className="space-y-4">
            <TabsList>
                <TabsTrigger value="add">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Component
                </TabsTrigger>
                <TabsTrigger value="overhaul">
                    <Plus className="w-4 h-4 mr-2" />
                    Overhaul Information
                </TabsTrigger>
                <TabsTrigger value="params">
                    <Upload className="w-4 h-4 mr-2" />
                    Parameters
                </TabsTrigger>
                <TabsTrigger value="Additional_Info">
                    <Upload className="w-4 h-4 mr-2" />
                    Additional Information
                </TabsTrigger>
                {/* <TabsTrigger value="bulk">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Operations
                </TabsTrigger> */}
            </TabsList>

            <TabsContent value="add">
                <AddComponentForm systems={systems} components={components} departments={departments} loading shipId={shipId || ""} />
            </TabsContent>
            <TabsContent value="overhaul">
                <OverhaulEntryForm />
            </TabsContent>

            <TabsContent value="params">
                <Parameters />
            </TabsContent>

            <TabsContent value="Additional_Info">
                <Additional_Info />
            </TabsContent>

            <TabsContent value="bulk">
                <BulkOperations components={components} shipId={shipId} />
            </TabsContent>
        </Tabs>
    );
}