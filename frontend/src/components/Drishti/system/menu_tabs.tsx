import { SystemUI, ComponentUI, Department } from '@/actions/system/get-ship-system-hierarchy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Cpu, Package, Settings } from 'lucide-react';
import Systems_view from './systems_view';
import Equipment_view from './equipment_view';
import Manage_components from './manage_components';

export default function Menu_tabs({
    shipId,
    systems = [],
    components = [],
    departments = [],
    loading = false
}: {
    shipId?: string,
    systems?: SystemUI[],
    components?: ComponentUI[],
    departments?: Department[],
    loading?: boolean
}) {
    return (
        <Tabs defaultValue="systems" className="space-y-4">
            <TabsList>
                <TabsTrigger value="systems">
                    <Cpu className="w-4 h-4 mr-2" />
                    Systems ({systems.length})
                </TabsTrigger>
                <TabsTrigger value="equipment">
                    <Package className="w-4 h-4 mr-2" />
                    Equipment ({components.length})
                </TabsTrigger>
                <TabsTrigger value="manage">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                </TabsTrigger>
            </TabsList>

            <TabsContent value="systems" className="space-y-4">
                <Systems_view 
                    systems={systems} 
                    components={components}
                    loading={loading} 
                    shipId={shipId || null}
                />
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4">
                <Equipment_view 
                    systems={systems}
                    components={components} 
                    loading={loading} 
                    shipId={shipId || null} 
                />
            </TabsContent>

            <TabsContent value="manage" className='space-y-4'>
                <Manage_components 
                    systems={systems}
                    components={components}
                    departments={departments}
                    loading={loading}
                    shipId={shipId || null}
                />
            </TabsContent>
        </Tabs>
    );
}