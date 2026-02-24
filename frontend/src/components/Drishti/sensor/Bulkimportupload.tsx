'use client';

import { useRef } from 'react';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import { Label } from '@/registry/new-york-v4/ui/label';
import { RadioGroup, RadioGroupItem } from '@/registry/new-york-v4/ui/radio-group';
import { Upload, FileText, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';


import { cn } from '@/lib/utils';
import { useBulkImportStore } from '@/store/Bulk import.store';
import { SensorMetadataCSV, SensorReadingCSV } from '@/types/Schema/sensor-reading.schema';
import { downloadCSV, generateMetadataTemplate, generateReadingsTemplate, parseCSVFile } from '@/lib/csv-parser';

interface BulkImportUploadProps {
  showPreview: boolean;
  handleNewImport: () => void;
}

// Use destructuring to extract props
export function BulkImportUpload({
  showPreview,
  handleNewImport
}: BulkImportUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    importType,
    setImportType,
    file,
    setFile,
    setMetadataData,
    setReadingsData,
    setValidationErrors,
    setShowPreview,
    validationErrors,
    softReset,
  } = useBulkImportStore();

  const handleTypeChange = (type: 'metadata' | 'readings') => {
    setImportType(type);
    softReset();
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setValidationErrors([
        {
          row: 0,
          field: 'file',
          message: 'Please upload a CSV file',
        },
      ]);

      return;
    }

    setFile(selectedFile);

    // Parse the CSV based on import type
    if (importType === 'metadata') {
      const result = await parseCSVFile<SensorMetadataCSV>(selectedFile, 'metadata');
      setMetadataData(result.data);
      setValidationErrors(result.errors);
      if (result.valid) {
        setShowPreview(true);
      }
    } else {
      const result = await parseCSVFile<SensorReadingCSV>(selectedFile, 'readings');
      setReadingsData(result.data);
      setValidationErrors(result.errors);
      if (result.valid) {
        setShowPreview(true);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDownloadTemplate = () => {
    const template = importType === 'metadata'
      ? generateMetadataTemplate()
      : generateReadingsTemplate();
    const filename = importType === 'metadata'
      ? 'sensor_metadata_template.csv'
      : 'sensor_readings_template.csv';
    downloadCSV(template, filename);
  };

  return (
    <div className="space-y-4">
      {/* Import Type Selection */}
      <Card className="bg-muted/20">
        <CardContent className="pt-6">
          <div className="flex space-y-4">
            <Label className="text-base font-semibold">Select Import Type</Label>
            <RadioGroup
              value={importType}
              onValueChange={handleTypeChange}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metadata" id="metadata" />
                <Label htmlFor="metadata" className="font-normal cursor-pointer">
                  Sensor Metadata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="readings" id="readings" />
                <Label htmlFor="readings" className="font-normal cursor-pointer">
                  Sensor Readings
                </Label>
              </div>
            </RadioGroup>

            {!showPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleNewImport}
                className='ml-auto'
              >
                {/* <RefreshCw className={`w-4 h-4 ${showPreview ? "animate-spin" : ""}`} /> */}
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card
        className={cn(
          'border-2 border-dashed cursor-pointer transition-colors',
          'hover:border-blue-600 hover:bg-blue-950/20'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleButtonClick}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Upload {importType === 'metadata' ? 'Metadata' : 'Readings'} CSV
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          <Button type="button" variant="outline" onClick={handleButtonClick}>
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileSelect(selectedFile);
            }}
          />
        </CardContent>
      </Card>

      {/* File Info */}
      {file && (
        <Card className="bg-muted/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">
              Found {validationErrors.length} validation error(s):
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.slice(0, 5).map((error, idx) => (
                <li key={idx}>
                  Row {error.row}: {error.field} - {error.message}
                </li>
              ))}
              {validationErrors.length > 5 && (
                <li className="text-muted-foreground">
                  ... and {validationErrors.length - 5} more errors
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}