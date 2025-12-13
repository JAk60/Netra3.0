import { ComponentUI, SystemUI } from '@/actions/system/get-ship-system-hierarchy';
import { useShipSystemHierarchyStore } from '@/store/shipSystemHierarchyStore';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import ShipHierarchyTree from './TreeView';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/registry/new-york-v4/ui/alert';

interface SeeSystemViewProps {
    systems: SystemUI[];
    components: ComponentUI[];
    loading: boolean;
    shipId: string | null;
    metadataError?: string | null;
    metadataLoaded?: boolean;
}

export default function SeeSystemView({
    systems,
    components,
    loading,
    shipId,
    metadataError,
    metadataLoaded
}: SeeSystemViewProps) {
    const { 
        fetchHierarchyWithMetadata, 
        fullShipData, 
        metadataLoading,
        metadataShipId 
    } = useShipSystemHierarchyStore();

    // Fetch metadata when component mounts or shipId changes
    useEffect(() => {
        if (shipId && metadataShipId !== shipId) {
            console.log('🚀 SeeSystemView: Fetching metadata for ship:', shipId);
            fetchHierarchyWithMetadata(shipId);
        }
    }, [shipId, metadataShipId, fetchHierarchyWithMetadata]);

    // Debug logging
    useEffect(() => {
        console.log('📊 SeeSystemView State:', {
            shipId,
            metadataShipId,
            hasFullShipData: !!fullShipData,
            metadataLoading,
            metadataError,
            fullShipDataPreview: fullShipData ? {
                ship_id: fullShipData.ship_id,
                ship_name: fullShipData.ship_name,
                systemsCount: fullShipData.systems?.length
            } : null
        });
    }, [shipId, metadataShipId, fullShipData, metadataLoading, metadataError]);

    if (loading || metadataLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    {loading ? 'Loading ship data...' : 'Loading metadata...'}
                </p>
            </div>
        );
    }

    if (!shipId) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Ship Selected</AlertTitle>
                        <AlertDescription>
                            Please select a ship to view its system hierarchy.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (metadataError) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Metadata</AlertTitle>
                        <AlertDescription>{metadataError}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (!fullShipData) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Data Available</AlertTitle>
                        <AlertDescription>
                            Ship hierarchy data is not available. The metadata may still be loading.
                        </AlertDescription>
                    </Alert>
                    <div className="mt-4 p-4 bg-muted rounded text-xs">
                        <p className="font-mono">Debug Info:</p>
                        <p>Ship ID: {shipId}</p>
                        <p>Metadata Ship ID: {metadataShipId || 'null'}</p>
                        <p>Has Full Data: {fullShipData ? 'yes' : 'no'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <ShipHierarchyTree 
                shipData={fullShipData} 
                loading={metadataLoading} 
            />
        </div>
    );
}