import { Upload } from 'lucide-react';
import { useState } from 'react';
interface ComponentUI {
    id: string;
    name: string;
    nomenclature: string;
}
// BulkOperations Component
export default function BulkOperations({ components, shipId }: { components: ComponentUI[], shipId: string | null }) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // TODO: Implement bulk import logic
            setMessage({ type: 'success', text: 'Bulk import completed!' });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: 'Failed to import components' 
            });
        }
    };

    const handleExport = () => {
        const json = JSON.stringify(components, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ship-${shipId}-components.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            {message && (
                <div className={`p-4 rounded-lg border ${message.type === 'error' ? 'bg-destructive/10 border-destructive' : 'bg-green-50 border-green-500'}`}>
                    <p className="text-sm">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Import Card */}
                <div className="bg-card rounded-lg border p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                            <Upload className="w-5 h-5" />
                            Bulk Import
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Import multiple components from a JSON file
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleBulkImport}
                                className="hidden"
                                id="bulk-import"
                            />
                            <label htmlFor="bulk-import" className="cursor-pointer block">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">Click to upload</p>
                                <p className="text-xs text-muted-foreground">JSON files only</p>
                            </label>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">
                                Expected format: Array of component objects matching the API schema
                            </p>
                        </div>
                    </div>
                </div>

                {/* Export Card */}
                <div className="bg-card rounded-lg border p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Data
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Download all components as JSON
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Export all {components.length} components to a JSON file for backup or editing.
                        </p>
                        <button
                            onClick={handleExport}
                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Components
                        </button>
                    </div>
                </div>

                {/* Danger Zone Card */}
                <div className="bg-card rounded-lg border border-destructive p-6 md:col-span-2">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Danger Zone
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Irreversible actions - use with caution
                        </p>
                    </div>

                    <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                        <p className="font-medium mb-2 text-sm">Bulk delete operations will be implemented here.</p>
                        <p className="text-xs text-muted-foreground">
                            This will permanently remove selected components from the system.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}