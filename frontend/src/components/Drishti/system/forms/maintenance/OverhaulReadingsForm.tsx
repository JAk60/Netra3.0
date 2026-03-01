'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Loader2,
  Send,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/registry/new-york-v4/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/registry/new-york-v4/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/new-york-v4/ui/table';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { useUserSelectionStore } from '@/store/UserSelectionStore';

// ── Schema ────────────────────────────────────────────────────────────────────
const rowSchema = z.object({
  defect_date: z.string().min(1, 'Date is required'),
  cmms_running_age: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Must be > 0'),
});

type RowFormData = z.infer<typeof rowSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────
type RowStatus = 'pending' | 'submitting' | 'success' | 'error';

interface StagedRow {
  localId: string;
  defect_date: string;
  cmms_running_age: number;
  status: RowStatus;
  dateWarning: boolean;
}

interface OverhaulReading {
  id: string;
  component_id: string;
  maintenance_type: string;
  defect_date: string;
  cmms_running_age: number;
  running_age: number;
}

// ── API helpers ───────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function postReading(payload: {
  component_id: string;
  maintenance_type: string;
  defect_date: string;
  cmms_running_age: number;
  running_age: number;
}): Promise<OverhaulReading> {
  const res = await fetch(`${API_BASE}/overhaul/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function fetchReadings(component_id: string): Promise<OverhaulReading[]> {
  const res = await fetch(`${API_BASE}/overhaul/readings/${component_id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Row status icon ───────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: RowStatus }) {
  if (status === 'submitting')
    return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
  if (status === 'success')
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === 'error')
    return <XCircle className="w-4 h-4 text-destructive" />;
  return <Clock className="w-4 h-4 text-muted-foreground" />;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OverhaulReadingsForm() {
  const { ships, getEquipmentForShip } = useUserSelectionStore();

  // Selection
  const [selectedShip, setSelectedShip] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');

  // Staging
  const [staged, setStaged] = useState<StagedRow[]>([]);
  const [rowError, setRowError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);

  // History
  const [readings, setReadings] = useState<OverhaulReading[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [autoOverhaulDates, setAutoOverhaulDates] = useState<string[]>([]);

  const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<RowFormData>({ resolver: zodResolver(rowSchema) });

  // Last staged row for guard checks
  const lastStaged = staged[staged.length - 1];

  // ── Selection handlers ───────────────────────────────────────────────────
  const handleShipChange = (id: string) => {
    setSelectedShip(id);
    setSelectedEquipment('');
    clearAll();
  };

  const handleEquipmentChange = (id: string) => {
    setSelectedEquipment(id);
    clearAll();
  };

  const clearAll = () => {
    setStaged([]);
    setRowError(null);
    setSubmitDone(false);
    setReadings([]);
    setAutoOverhaulDates([]);
    resetForm();
  };

  // ── Add row ──────────────────────────────────────────────────────────────
  const onAddRow = (data: RowFormData) => {
    setRowError(null);

    // Hard block: running age must strictly increase
    if (lastStaged && data.cmms_running_age <= lastStaged.cmms_running_age) {
      setRowError(
        `CMMS running age (${data.cmms_running_age}) must be greater than the previous entry (${lastStaged.cmms_running_age} hrs). Please correct the value.`,
      );
      return;
    }

    // Soft warn: date going backward — allow but notify
    const dateWarning =
      !!lastStaged && data.defect_date < lastStaged.defect_date;

    if (dateWarning) {
      toast.warning(
        'This date is earlier than the previous entry — this breaks the natural chronological flow. Please verify.',
        { duration: 6000 },
      );
    }

    setStaged((prev) => [
      ...prev,
      {
        localId: `${Date.now()}-${Math.random()}`,
        defect_date: data.defect_date,
        cmms_running_age: data.cmms_running_age,
        status: 'pending',
        dateWarning,
      },
    ]);

    resetForm();
  };

  const removeRow = (localId: string) => {
    setStaged((prev) => prev.filter((r) => r.localId !== localId));
    // Clear block error in case it was related to the last row
    setRowError(null);
  };

  // ── Fetch history ────────────────────────────────────────────────────────
  const loadReadings = async (componentId: string) => {
    setIsFetching(true);
    // Do NOT clear readings here — keep existing rows visible
    // while the request is in flight so the table never disappears
    try {
      const data = await fetchReadings(componentId);
      data.sort(
        (a, b) =>
          new Date(a.defect_date).getTime() - new Date(b.defect_date).getTime(),
      );
      setReadings(data);
      return data;
    } catch {
      toast.error('Failed to fetch readings history');
      return [];
    } finally {
      setIsFetching(false);
    }
  };

  // ── Sequential submit ────────────────────────────────────────────────────
  const handleSubmitAll = async () => {
    if (!selectedEquipment || staged.length === 0) return;

    setIsSubmitting(true);
    setAutoOverhaulDates([]);

    // Snapshot existing IDs to detect trigger-inserted overhaul rows after
    const previousIds = new Set(readings.map((r) => r.id));

    for (let i = 0; i < staged.length; i++) {
      const row = staged[i];

      // Skip already submitted rows
      if (row.status !== 'pending') continue;

      // Mark as submitting
      setStaged((prev) =>
        prev.map((r) =>
          r.localId === row.localId ? { ...r, status: 'submitting' } : r,
        ),
      );

      try {
        await postReading({
          component_id: selectedEquipment,
          maintenance_type: 'Corrective Maintenance',
          defect_date: row.defect_date,
          cmms_running_age: row.cmms_running_age,
          running_age: 0, // trigger overwrites this
        });

        setStaged((prev) =>
          prev.map((r) =>
            r.localId === row.localId ? { ...r, status: 'success' } : r,
          ),
        );
      } catch {
        // Mark as error and stop — trigger state must stay consistent
        setStaged((prev) =>
          prev.map((r) =>
            r.localId === row.localId ? { ...r, status: 'error' } : r,
          ),
        );
        toast.error(
          `Row ${i + 1} failed (${format(new Date(row.defect_date), 'dd MMM yyyy')}). Submission stopped to preserve data integrity.`,
        );
        setIsSubmitting(false);
        // Still fetch so user sees current DB state
        await loadReadings(selectedEquipment);
        return;
      }
    }

    // All succeeded — fetch updated history
    const updated = await loadReadings(selectedEquipment);

    // Detect trigger-generated overhaul rows (new rows with type=Overhaul)
    const newOverhaulDates = updated
      .filter((r) => r.maintenance_type === 'Overhaul' && !previousIds.has(r.id))
      .map((r) => format(new Date(r.defect_date), 'dd MMM yyyy'));

    if (newOverhaulDates.length > 0) {
      setAutoOverhaulDates(newOverhaulDates);
    }

    setSubmitDone(true);
    setIsSubmitting(false);
    toast.success(
      `${staged.length} reading${staged.length > 1 ? 's' : ''} submitted successfully`,
    );
  };

  // ── Counts ───────────────────────────────────────────────────────────────
  const pendingCount = staged.filter((r) => r.status === 'pending').length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Equipment selector */}
      <Card>
        <CardHeader>
          <CardTitle>Overhaul Readings Entry</CardTitle>
          <CardDescription>
            Add readings to the staging table, then submit all at once.
            Each row is inserted sequentially so the overhaul trigger fires
            correctly for each entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GroupedCombobox
              label="Select Ship"
              placeholder={ships.length === 0 ? 'Loading ships…' : 'Choose a ship'}
              groups={ships}
              value={selectedShip}
              onValueChange={handleShipChange}
              disabled={ships.length === 0}
            />
            <GroupedCombobox
              label="Select Equipment"
              placeholder={!selectedShip ? 'Select a ship first' : 'Select equipment'}
              groups={equipmentGroups}
              value={selectedEquipment}
              onValueChange={handleEquipmentChange}
              disabled={!selectedShip || equipmentGroups.length === 0}
            />
          </div>
        </CardContent>
      </Card>

      {/* Row input */}
      {selectedEquipment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a Reading</CardTitle>
            {lastStaged && (
              <CardDescription className="text-xs">
                Previous entry — Date:{' '}
                <strong>
                  {format(new Date(lastStaged.defect_date), 'dd MMM yyyy')}
                </strong>{' '}
                · CMMS Age:{' '}
                <strong>{lastStaged.cmms_running_age.toLocaleString()} hrs</strong>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="defect_date">Defect Date</Label>
                <Input
                  id="defect_date"
                  type="date"
                  {...register('defect_date')}
                  disabled={isSubmitting}
                />
                {errors.defect_date && (
                  <p className="text-sm text-destructive">
                    {errors.defect_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cmms_running_age">CMMS Running Age (hrs)</Label>
                <Input
                  id="cmms_running_age"
                  type="number"
                  step="0.01"
                  placeholder={
                    lastStaged
                      ? `Must be > ${lastStaged.cmms_running_age}`
                      : 'e.g. 4500'
                  }
                  {...register('cmms_running_age')}
                  disabled={isSubmitting}
                />
                {errors.cmms_running_age && (
                  <p className="text-sm text-destructive">
                    {errors.cmms_running_age.message}
                  </p>
                )}
              </div>
            </div>

            {/* Hard block error */}
            {rowError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Cannot Add Row</AlertTitle>
                <AlertDescription>{rowError}</AlertDescription>
              </Alert>
            )}

            {/* Maintenance type read-only indicator */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">
                Maintenance Type:
              </span>
              <Badge variant="secondary">Corrective Maintenance</Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                Auto-assigned · overhaul rows are system-generated
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit(onAddRow)}
              disabled={isSubmitting}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Staging Table
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Staging table */}
      {staged.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">
                Staging Table
                <Badge variant="secondary" className="ml-2">
                  {staged.length} row{staged.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Rows submitted top → bottom in this exact order
              </CardDescription>
            </div>

            {!submitDone && (
              <Button
                onClick={handleSubmitAll}
                disabled={isSubmitting || pendingCount === 0}
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit All ({pendingCount})
                  </>
                )}
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Defect Date</TableHead>
                    <TableHead className="text-right">
                      CMMS Age (hrs)
                    </TableHead>
                    <TableHead className="text-center w-24">Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staged.map((row, index) => (
                    <TableRow
                      key={row.localId}
                      className={
                        row.status === 'success'
                          ? 'bg-green-500/5'
                          : row.status === 'error'
                          ? 'bg-destructive/5'
                          : row.dateWarning
                          ? 'bg-yellow-500/5'
                          : undefined
                      }
                    >
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {index + 1}
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {format(new Date(row.defect_date), 'dd MMM yyyy')}
                          {row.dateWarning && row.status === 'pending' && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-yellow-500 text-yellow-600 dark:text-yellow-400 py-0 px-1"
                            >
                              ⚠ date order
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right tabular-nums">
                        {row.cmms_running_age.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <StatusIcon status={row.status} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {row.status}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {row.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(row.localId)}
                            disabled={isSubmitting}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-overhaul alert */}
      {autoOverhaulDates.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">
            {autoOverhaulDates.length === 1
              ? 'Overhaul Automatically Recorded'
              : `${autoOverhaulDates.length} Overhauls Automatically Recorded`}
          </AlertTitle>
          <AlertDescription>
            The system detected missed overhaul
            {autoOverhaulDates.length > 1 ? 's' : ''} and automatically
            inserted{' '}
            {autoOverhaulDates.length > 1 ? 'entries' : 'an entry'} for:{' '}
            <strong>{autoOverhaulDates.join(', ')}</strong>. These rows are
            highlighted in amber in the history table below.
          </AlertDescription>
        </Alert>
      )}

      {/* History table */}
      {readings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Readings History</CardTitle>
              <CardDescription className="text-xs">
                Read-only · Overhaul rows highlighted in amber
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadReadings(selectedEquipment)}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {/* Table always stays visible — opacity dims during refresh */}
            <div
              className={`overflow-x-auto transition-opacity duration-200 ${
                isFetching ? 'opacity-40 pointer-events-none' : 'opacity-100'
              }`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Maintenance Type</TableHead>
                    <TableHead className="text-right">CMMS Age (hrs)</TableHead>
                    <TableHead className="text-right">Running Age (hrs)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readings.map((row) => {
                    const isOverhaul = row.maintenance_type === 'Overhaul';
                    return (
                      <TableRow
                        key={row.id}
                        className={
                          isOverhaul
                            ? 'bg-amber-500/10 hover:bg-amber-500/20'
                            : undefined
                        }
                      >
                        <TableCell className="font-medium">
                          {format(new Date(row.defect_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isOverhaul ? 'default' : 'secondary'}
                            className={
                              isOverhaul
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : ''
                            }
                          >
                            {row.maintenance_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.cmms_running_age.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.running_age.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}