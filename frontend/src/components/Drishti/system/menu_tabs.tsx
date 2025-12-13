// Menu_tabs.tsx
import { SystemUI, ComponentUI, Department } from '@/actions/system/get-ship-system-hierarchy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Cpu, Package, Settings, Workflow } from 'lucide-react';
import { useEffect } from 'react';
import Systems_view from './views/systems_view';
import Equipment_view from './views/equipment_view';
import Manage_components from './views/manage_components';
import SeeSystemView from './views/see_system_view';
import { useShipSystemHierarchyStore } from '@/store/shipSystemHierarchyStore';

export default function Menu_tabs({
    selectedShip,
    shipId,
    systems = [],
    components = [],
    departments = [],
    loading = false
}: {
    selectedShip: string,
    shipId?: string,
    systems?: SystemUI[],
    components?: ComponentUI[],
    departments?: Department[],
    loading?: boolean
}) {
    const { 
        fetchHierarchyWithMetadata, 
        metadataLoading, 
        metadataError,
        metadataCache,
        metadataShipId
    } = useShipSystemHierarchyStore();

    // Fetch hierarchy with metadata when shipId changes
    useEffect(() => {
        const loadMetadata = async () => {
            if (!shipId) return;

            try {
                await fetchHierarchyWithMetadata(shipId);
            } catch (err) {
                console.error('Failed to fetch hierarchy with metadata:', err);
            }
        };

        loadMetadata();
    }, [shipId, fetchHierarchyWithMetadata]);

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
                <TabsTrigger value="see_system">
                    <Workflow className="w-4 h-4 mr-2" />
                    See System ({components.length})
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

            <TabsContent value="see_system" className="space-y-4">
                <SeeSystemView
                    systems={systems}
                    components={components}
                    loading={loading || metadataLoading}
                    shipId={shipId || null}
                    metadataError={metadataError}
                    metadataLoaded={metadataShipId === shipId && metadataCache.size > 0}
                />
            </TabsContent>

            <TabsContent value="manage" className='space-y-4'>
                <Manage_components
                    selectedShip={selectedShip || ''}
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

// ============================================================
// SeeSystemView.tsx
// ============================================================