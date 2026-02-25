'use client'

import React, { useState } from 'react';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Checkbox } from '@/registry/new-york-v4/ui/checkbox';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { AlertTriangle, Activity, Plus, Pencil, Trash2, Check, X, SendHorizonal } from 'lucide-react';
import { addSensorReading } from '@/actions/sensors/addReading';
import { toast } from 'sonner';
import { Sensor } from '@/actions/sensors/metadata';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// ============= CONSTANTS =============
const MAX_READINGS = 10;

// ============= ZOD SCHEMA =============
const readingSchema = z.object({
    sensor_id: z.string().min(1, 'Please select a sensor'),
    value: z.coerce.number({ required_error: 'Required', invalid_type_error: 'Required' }),
    operating_hours: z.coerce.number({ required_error: 'Required', invalid_type_error: 'Required' }).int('Must be a whole number').min(0, 'Must be positive'),
    alert: z.boolean().default(false),
});

type ReadingFormData = z.infer<typeof readingSchema>;

// ============= STAGED READING TYPE =============
interface StagedReading extends ReadingFormData {
    _id: string;
    sensorName: string;
    unit: string;
}

// ============= INLINE EDIT ROW =============
function EditableRow({
    reading,
    sensors,
    onSave,
    onCancel,
}: {
    reading: StagedReading;
    sensors: Sensor[];
    onSave: (updated: StagedReading) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ReadingFormData>({
        resolver: zodResolver(readingSchema),
        defaultValues: {
            sensor_id: reading.sensor_id,
            value: reading.value,
            operating_hours: reading.operating_hours,
            alert: reading.alert,
        },
    });

    const watchedSensorId = watch('sensor_id');
    const selectedSensor = sensors.find(s => s.id === watchedSensorId);

    const onSubmit = (data: ReadingFormData) => {
        const sensor = sensors.find(s => s.id === data.sensor_id);
        onSave({
            ...data,
            _id: reading._id,
            sensorName: sensor?.name ?? '',
            unit: sensor?.unit ?? '',
        });
    };

    return (
        <tr className="bg-muted/30">
            {/* Sensor */}
            <td className="border p-1">
                <Controller
                    name="sensor_id"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {sensors.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.sensor_id && <p className="text-[10px] text-destructive mt-0.5">{errors.sensor_id.message}</p>}
            </td>
            {/* Value */}
            <td className="border p-1">
                <div className="flex items-center gap-1">
                    <Input className="h-7 text-xs px-2" type="number" step="any" {...register('value')} />
                    {selectedSensor && <span className="text-[10px] text-muted-foreground whitespace-nowrap">{selectedSensor.unit}</span>}
                </div>
                {errors.value && <p className="text-[10px] text-destructive mt-0.5">{errors.value.message}</p>}
            </td>
            {/* Operating Hours */}
            <td className="border p-1">
                <Input className="h-7 text-xs px-2" type="number" {...register('operating_hours')} />
                {errors.operating_hours && <p className="text-[10px] text-destructive mt-0.5">{errors.operating_hours.message}</p>}
            </td>
            {/* Alert */}
            <td className="border p-1 text-center">
                <Controller
                    name="alert"
                    control={control}
                    render={({ field }) => (
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    )}
                />
            </td>
            {/* Actions */}
            <td className="border p-1">
                <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSubmit(onSubmit)}>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCancel}>
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

// ============= MAIN COMPONENT =============
export default function AddSensorData({ sensors, componentId }: { sensors: Sensor[]; componentId: string | null }) {
    const [stagedReadings, setStagedReadings] = useState<StagedReading[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmittingAll, setIsSubmittingAll] = useState(false);

    const isFull = stagedReadings.length >= MAX_READINGS;

    const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<ReadingFormData>({
        resolver: zodResolver(readingSchema),
        defaultValues: {
            sensor_id: '',
            value: '' as unknown as number,
            operating_hours: '' as unknown as number,
            alert: false,
        },
    });

    const watchedSensorId = watch('sensor_id');
    const selectedSensor = sensors.find(s => s.id === watchedSensorId);

    const onAddToTable = (data: ReadingFormData) => {
        if (isFull) return;
        const sensor = sensors.find(s => s.id === data.sensor_id);
        setStagedReadings(prev => [
            ...prev,
            {
                ...data,
                _id: crypto.randomUUID(),
                sensorName: sensor?.name ?? '',
                unit: sensor?.unit ?? '',
            },
        ]);
        reset({ sensor_id: data.sensor_id, value: '' as unknown as number, operating_hours: '' as unknown as number, alert: false });
    };

    const handleDelete = (id: string) => setStagedReadings(prev => prev.filter(r => r._id !== id));

    const handleSaveEdit = (updated: StagedReading) => {
        setStagedReadings(prev => prev.map(r => r._id === updated._id ? updated : r));
        setEditingId(null);
    };

    const handleSubmitAll = async () => {
        if (!componentId) { toast.error('Component ID is required'); return; }
        if (stagedReadings.length === 0) return;

        setIsSubmittingAll(true);

        const results = await Promise.allSettled(
            stagedReadings.map(r =>
                addSensorReading(r.sensor_id, {
                    value: r.value,
                    operating_hours: r.operating_hours,
                    alert: r.alert,
                    component_id: componentId,
                    sensor_id: r.sensor_id,
                })
            )
        );

        const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
        setIsSubmittingAll(false);

        if (failed.length === 0) {
            toast.success(`${stagedReadings.length} reading${stagedReadings.length > 1 ? 's' : ''} added successfully!`);
            setStagedReadings([]);
            reset();
        } else {
            toast.error(`${failed.length} reading(s) failed. Please try again.`);
        }
    };


    const getSeverityColor = (status: string) =>
        status === 'alert' ? 'text-amber-500' : 'text-green-500';

    return (
        <Card className="border-2 w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Add Sensor Readings</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

                {/* TOP ROW: FORM + METADATA */}
                <div className="flex flex-col lg:flex-row gap-4">

                    {/* LEFT: Form */}
                    <div className="flex-1 space-y-4">
                        {isFull ? (
                            <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 p-3 text-sm text-yellow-700 dark:text-yellow-400">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                Table is full (max {MAX_READINGS}). Submit or remove readings to add more.
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onAddToTable)(e); }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">

                                    {/* Sensor Select */}
                                    <div className="space-y-1 col-span-2">
                                        <Label>Sensor</Label>
                                        <Controller
                                            name="sensor_id"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a sensor" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sensors.map(s => (
                                                            <SelectItem key={s.id} value={s.id}>
                                                                {s.name} ({s.unit})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.sensor_id && <p className="text-xs text-destructive">{errors.sensor_id.message}</p>}
                                    </div>

                                    {/* Value */}
                                    <div className="space-y-1">
                                        <Label>Value{selectedSensor ? ` (${selectedSensor.unit})` : ''}</Label>
                                        <Input type="number" step="any" placeholder="e.g., 78.5" {...register('value')} />
                                        {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
                                    </div>

                                    {/* Operating Hours */}
                                    <div className="space-y-1">
                                        <Label>Operating Hours</Label>
                                        <Input type="number" placeholder="e.g., 1204" {...register('operating_hours')} />
                                        {errors.operating_hours && <p className="text-xs text-destructive">{errors.operating_hours.message}</p>}
                                    </div>

                                    {/* Alert */}
                                    <div className="flex items-center gap-2 col-span-2 pt-1">
                                        <Controller
                                            name="alert"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox id="alert" checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                        <Label htmlFor="alert" className="cursor-pointer">Mark as alert</Label>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add to Table
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* RIGHT: Sensor Metadata Panel */}
                    <div className="w-full lg:w-72 shrink-0">
                        <Card className="h-full">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold">Sensor Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                {selectedSensor ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2.5 bg-muted rounded-lg">
                                            <span className="text-xs font-medium text-muted-foreground">Name</span>
                                            <span className="text-xs font-semibold">{selectedSensor.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2.5 bg-muted rounded-lg">
                                            <span className="text-xs font-medium text-muted-foreground">Unit</span>
                                            <span className="text-xs font-semibold">{selectedSensor.unit}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2.5 bg-muted rounded-lg">
                                            <span className="text-xs font-medium text-muted-foreground">Mininum value</span>
                                            <span className="text-xs font-semibold">{selectedSensor.min_value}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2.5 bg-muted rounded-lg">
                                            <span className="text-xs font-medium text-muted-foreground">Maximum value</span>
                                            <span className="text-xs font-semibold">{selectedSensor.max_value}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2.5 bg-muted rounded-lg">
                                            <span className="text-xs font-medium text-muted-foreground">Failure Mode</span>
                                            <span className="text-xs font-semibold">{selectedSensor.failureMode ?? '—'}</span>
                                        </div>
                                        {/* <div className="flex justify-between items-center p-2.5 bg-muted rounded-lg">
                                            <span className="text-xs font-medium text-muted-foreground">Status</span>
                                            <span className={`text-xs font-semibold flex items-center gap-1 ${getSeverityColor(selectedSensor.status)}`}>
                                                {selectedSensor.status === 'alert' ? (
                                                    <><AlertTriangle className="w-3 h-3" /> Alert</>
                                                ) : (
                                                    <><Activity className="w-3 h-3" /> Normal</>
                                                )}
                                            </span>
                                        </div> */}
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <div className="p-2.5 bg-muted rounded-lg">
                                                <div className="text-[10px] text-muted-foreground mb-1">P Value</div>
                                                <div className="text-lg font-bold">{selectedSensor.P ?? '—'}</div>
                                            </div>
                                            <div className="p-2.5 bg-muted rounded-lg">
                                                <div className="text-[10px] text-muted-foreground mb-1">F Value</div>
                                                <div className="text-lg font-bold">{selectedSensor.F ?? '—'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8 text-xs">
                                        Select a sensor to view metadata
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* PREVIEW TABLE */}
                {stagedReadings.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                Preview — {stagedReadings.length} / {MAX_READINGS} readings staged
                            </p>
                            <Badge variant={isFull ? 'destructive' : 'secondary'}>
                                {isFull ? 'Full' : `${MAX_READINGS - stagedReadings.length} slots left`}
                            </Badge>
                        </div>

                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full border-collapse text-xs">
                                <thead className="bg-muted">
                                    <tr>
                                        {['Sensor', 'Value', 'Operating Hours', 'Alert', ''].map(h => (
                                            <th key={h} className="border p-2 text-left font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {stagedReadings.map(reading =>
                                        editingId === reading._id ? (
                                            <EditableRow
                                                key={reading._id}
                                                reading={reading}
                                                sensors={sensors}
                                                onSave={handleSaveEdit}
                                                onCancel={() => setEditingId(null)}
                                            />
                                        ) : (
                                            <tr key={reading._id} className="hover:bg-muted/40 transition-colors">
                                                <td className="border p-2">{reading.sensorName}</td>
                                                <td className="border p-2">{reading.value} <span className="text-muted-foreground">{reading.unit}</span></td>
                                                <td className="border p-2">{reading.operating_hours} hrs</td>
                                                <td className="border p-2">
                                                    {reading.alert ? (
                                                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                                                            <AlertTriangle className="w-3 h-3" /> Alert
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-green-500">
                                                            <Activity className="w-3 h-3" /> Normal
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="border p-2">
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(reading._id)}>
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(reading._id)}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* SUBMIT ALL */}
                        <div className="flex justify-end pt-1">
                            <Button
                                onClick={handleSubmitAll}
                                disabled={isSubmittingAll || stagedReadings.length === 0}
                                className="gap-2"
                            >
                                <SendHorizonal className="w-4 h-4" />
                                {isSubmittingAll
                                    ? `Submitting ${stagedReadings.length} reading${stagedReadings.length > 1 ? 's' : ''}...`
                                    : `Submit All (${stagedReadings.length})`
                                }
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}