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
  const { showPreview, file, softReset, isImportStarted, setIsImportStarted ,componentId} = useBulkImportStore();

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
    softReset(); // This resets everything including isImportStarted to false
    setIsImportStarted(true); // So we set it to true AFTER reset
  };

  console.log('🎨 BulkOperations rendering - isImportActive:', isImportActive, 'isImportStarted:', isImportStarted, 'file:', file?.name, 'showPreview:', showPreview);

  return (
    <div className='w-full'>
      {/* Quick Actions - Always visible */}
      <Card>
        {/* <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Download templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col">
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
        </CardContent> */}

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
                <div className="flex">
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => handleDownloadTemplate('metadata')}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Sensor Creation Template</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => handleDownloadTemplate('readings')}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Sensor Readings Template</span>
                  </Button>
                </div>
               
              </div>
            </CardHeader>
            <CardContent>
              <BulkImportUpload showPreview={showPreview} handleNewImport={handleNewImport} />
            </CardContent>
          </Card>
        )}

      </Card>
      {/* Preview and confirm */}
      <BulkImportPreview />
      <BulkImportConfirmDialog />
    </div>
  );
}