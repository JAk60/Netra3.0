import { Button } from '@/registry/new-york-v4/ui/button';
import { Download, Upload } from 'lucide-react';

export default function Header() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
                <p className="text-muted-foreground mt-1">Configure failure modes, sensors, and readings</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
                <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Import
                </Button>
            </div>
        </div>
    )
}
