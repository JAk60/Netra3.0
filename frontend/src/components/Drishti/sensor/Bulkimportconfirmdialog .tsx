'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/new-york-v4/ui/dialog';
import { Button } from '@/registry/new-york-v4/ui/button';
import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';

import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Progress } from '@/registry/new-york-v4/ui/progress';
import { useBulkImportStore } from '@/store/Bulk import.store';
import { bulkCreateSensorMetadata, bulkCreateSensorReadings } from '@/actions/sensors/Bulk import.actions';

export function BulkImportConfirmDialog() {
  const {
    showConfirmDialog,
    setShowConfirmDialog,
    importType,
    componentId,
    metadataData,
    readingsData,
    isUploading,
    setIsUploading,
    uploadSuccess,
    setUploadSuccess,
    setUploadedCount,
    errorMessage,
    setErrorMessage,
    reset,
  } = useBulkImportStore();
  console.log('componentId', componentId)
  const dataCount = importType === 'metadata' ? metadataData.length : readingsData.length;

  const handleConfirm = async () => {
    if (!componentId) {
      setErrorMessage('Component ID is required');

      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      if (importType === 'metadata') {
        // Add component_id to each metadata item
        const dataWithComponent = metadataData.map((item) => ({
          ...item,
          component_id: componentId,
        }));

        const result = await bulkCreateSensorMetadata(dataWithComponent);

        if (result.success) {
          setUploadSuccess(true);
          setUploadedCount(result.count || 0);

          // Auto-close after success
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else {
          setErrorMessage(result.message || 'Import failed');
        }
      } else {
        // Add component_id to each reading item
        const dataWithComponent = readingsData.map((item) => ({
          ...item,
          component_id: componentId,
        }));

        const result = await bulkCreateSensorReadings(dataWithComponent, componentId);

        if (result.success) {
          setUploadSuccess(true);
          setUploadedCount(result.count || 0);

          // Auto-close after success
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else {
          setErrorMessage(result.message || 'Import failed');
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setShowConfirmDialog(false);
    if (uploadSuccess) {
      reset();
    }
  };

  return (
    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {uploadSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Import Successful
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-blue-500" />
                Confirm Bulk Import
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {uploadSuccess
              ? `Successfully imported ${dataCount} ${importType === 'metadata' ? 'sensor(s)' : 'reading(s)'}.`
              : `You are about to import ${dataCount} ${importType === 'metadata' ? 'sensor(s)' : 'reading(s)'}. This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isUploading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing data...
              </div>
              <Progress value={45} className="h-2" />
            </div>
          )}

          {uploadSuccess && (
            <Alert className="border-green-500 bg-green-950/50">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                All {importType === 'metadata' ? 'sensors' : 'readings'} have been successfully
                imported to the database.
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {!isUploading && !uploadSuccess && !errorMessage && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Import Type:</span>
                <span className="font-semibold capitalize">{importType}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Total Records:</span>
                <span className="font-semibold">{dataCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Action:</span>
                <span className="font-semibold">
                  Create New {importType === 'metadata' ? 'Sensors' : 'Readings'}
                </span>
              </div>
              {/* <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Backend Resolution:</span>
                <span className="font-mono text-xs">
                  {importType === 'metadata' ? 'sensor_id auto-gen' : 'sensor_name → sensor_id'}
                </span>
              </div> */}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          {!uploadSuccess && (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={isUploading} className="gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Confirm Import
                  </>
                )}
              </Button>
            </>
          )}
          {uploadSuccess && (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}