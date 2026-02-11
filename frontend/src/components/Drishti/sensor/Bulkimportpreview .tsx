'use client';

import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/new-york-v4/ui/table';
import { CheckCircle2, X, Upload } from 'lucide-react';

import { ScrollArea } from '@/registry/new-york-v4/ui/scroll-area';
import { useBulkImportStore } from '@/store/Bulk import.store';

export function BulkImportPreview() {
  const {
    importType,
    metadataData,
    readingsData,
    showPreview,
    setShowPreview,
    setShowConfirmDialog,
    softReset,
  } = useBulkImportStore();

  if (!showPreview) return null;

  const dataToShow = importType === 'metadata' ? metadataData : readingsData;
  const dataCount = dataToShow.length;

  if (dataCount === 0) return null;

  const handleIngest = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    softReset();
  };

  return (
    <Card className="bg-muted/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Preview {importType === 'metadata' ? 'Metadata' : 'Readings'} Data
            </CardTitle>
            <CardDescription>
              Review {dataCount} {importType === 'metadata' ? 'sensor(s)' : 'reading(s)'} before importing
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] w-full rounded-md border">
          {importType === 'metadata' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Sensor Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Min</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead>Freq</TableHead>
                  <TableHead>P</TableHead>
                  <TableHead>F</TableHead>
                  <TableHead>Failure Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metadataData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-semibold">{row.sensor_name}</TableCell>
                    <TableCell>{row.unit || '-'}</TableCell>
                    <TableCell className="font-mono">{row.min_value}</TableCell>
                    <TableCell className="font-mono">{row.max_value}</TableCell>
                    <TableCell>{row.frequency || '-'}</TableCell>
                    <TableCell>{row.P || '-'}</TableCell>
                    <TableCell>{row.F || '-'}</TableCell>
                    <TableCell className="text-sm">{row.failure_mode_name || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Sensor Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Operating Hours</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readingsData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-semibold">{row.sensor_name}</TableCell>
                    <TableCell className="font-mono">{row.value}</TableCell>
                    <TableCell className="font-mono">{row.operating_hours || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(row.date).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Total rows to import:{' '}
            <span className="font-semibold text-foreground">{dataCount}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleIngest} className="gap-2">
              <Upload className="w-4 h-4" />
              Ingest Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}