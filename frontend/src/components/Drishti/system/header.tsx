import { Button } from '@/registry/new-york-v4/ui/button';
import { Download, Ship, Upload } from 'lucide-react';

export default function Header({showShipForm, setShowShipForm }: { showShipForm: boolean,setShowShipForm: (show: boolean) => void }) {

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Management</h1>
                <p className="text-muted-foreground mt-1">Manage ship equipment hierarchy</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
                <Button
                    onClick={() => setShowShipForm(!showShipForm)}          
                >
                    <Ship className="w-4 h-4 mr-2" />
                    Create New Ship
                </Button>
            </div>
        </div>
    )
}
