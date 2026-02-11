'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/registry/new-york-v4/ui/dialog';

import { useEffect } from 'react';
import { BulkImportUpload } from './Bulkimportupload';
import { BulkImportPreview } from './Bulkimportpreview ';
import { BulkImportConfirmDialog } from './Bulkimportconfirmdialog ';
import { useBulkImportStore } from '@/store/Bulk import.store';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  componentId: string;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  componentId,
}: BulkImportDialogProps) {
  const { setComponentId, reset } = useBulkImportStore();

  // Set component ID when dialog opens
  useEffect(() => {
    if (open && componentId) {
      setComponentId(componentId);
    }
  }, [open, componentId, setComponentId]);

  // Reset when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Import</DialogTitle>
            <DialogDescription>
              Upload CSV files to bulk import sensor metadata or readings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <BulkImportUpload />
            <BulkImportPreview />
          </div>
        </DialogContent>
      </Dialog>

      <BulkImportConfirmDialog />
    </>
  );
}