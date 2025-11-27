
import { Button } from '@/registry/new-york-v4/ui/button';
import { Download, Upload, X } from 'lucide-react';

export default function Header({ 
  selectedConfig = null, 
  mode = "view",
  onCancel = () => {},
  onExport = () => {},
  onBulkImport = () => {}
}) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        <div className="flex flex-1 items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Ship Configuration Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedConfig
                ? `Viewing: ${selectedConfig.config_name}`
                : mode === "create"
                ? "Create new configuration"
                : mode === "edit"
                ? "Edit configuration"
                : "Equipment redundancy & phase management system"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {(mode === "create" || mode === "edit") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkImport}
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
        </div>
      </div>
    </div>
  );
}