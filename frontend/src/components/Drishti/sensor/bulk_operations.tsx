'use client';

import { downloadCSV, generateMetadataTemplate, generateReadingsTemplate } from '@/lib/csv-parser';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { useBulkImportStore } from '@/store/Bulk import.store';
import { ChevronDown, Upload, FileSpreadsheet, History } from 'lucide-react';
import { BulkImportUpload } from './Bulkimportupload';
import { BulkImportPreview } from './Bulkimportpreview ';
import { BulkImportConfirmDialog } from './Bulkimportconfirmdialog ';

export default function BulkOperations() {
  const { showPreview, file, reset, isImportStarted, setIsImportStarted } = useBulkImportStore();
  
  const isImportActive = isImportStarted || file !== null || showPreview;

  const handleDownloadTemplate = (type: 'metadata' | 'readings' | 'both') => {
    if (type === 'metadata' || type === 'both') {
      const metadataTemplate = generateMetadataTemplate();
      downloadCSV(metadataTemplate, 'sensor_metadata_template.csv');
    }
    
    if (type === 'readings' || type === 'both') {
      const readingsTemplate = generateReadingsTemplate();
      setTimeout(() => {
        downloadCSV(readingsTemplate, 'sensor_readings_template.csv');
      }, 100);
    }
  };

  const handleNewImport = () => {
    console.log('🔄 Starting new import');
    reset(); // This resets everything including isImportStarted to false
    setIsImportStarted(true); // So we set it to true AFTER reset
  };

  console.log('🎨 BulkOperations rendering - isImportActive:', isImportActive, 'isImportStarted:', isImportStarted, 'file:', file?.name, 'showPreview:', showPreview);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Operations</h1>
        <p className="text-muted-foreground mt-2">
          Manage your sensor data efficiently with bulk import and export tools
        </p>
      </div>

      {/* Quick Actions - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Download templates and manage imports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button 
              type="button"
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => handleDownloadTemplate('metadata')}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Metadata Template</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => handleDownloadTemplate('readings')}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Readings Template</span>
            </Button>
          </div>
          
          <Button type="button" variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              View Import History
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      {!isImportActive ? (
        // Default state - Clean call-to-action
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Bulk Import</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Upload CSV files to import sensor metadata or readings in bulk.
              Download a template above to get started.
            </p>
            <Button 
              type="button"
              size="lg" 
              className="gap-2"
              onClick={handleNewImport}
            >
              <Upload className="w-4 h-4" />
              Begin Import
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Active import state
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Import Sensor Data</CardTitle>
                <CardDescription>
                  Upload and preview your CSV file before importing
                </CardDescription>
              </div>
              {!showPreview && (
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={handleNewImport}
                >
                  Start Over
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <BulkImportUpload />
          </CardContent>
        </Card>
      )}

      {/* Preview and confirm */}
      <BulkImportPreview />
      <BulkImportConfirmDialog />
    </div>
  );
}