'use client'

import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/registry/new-york-v4/ui/select';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { Pencil, Trash2, Check, X, AlertTriangle, SendHorizonal, Plus } from 'lucide-react';
import { createSensor } from '@/actions/sensors/metadata';
import { FailureMode } from '../failure_mode_view';

// ============= CONSTANTS =============
const MAX_SENSORS = 10;

// ============= ZOD SCHEMA =============
const sensorSchema = z.object({
    sensor_name: z.string().min(1, 'Required').max(255, 'Max 255 chars'),
    unit: z.string().min(1, 'Required').max(50, 'Max 50 chars'),
    min_value: z.coerce.number({ required_error: 'Required', invalid_type_error: 'Required' }),
    max_value: z.coerce.number({ required_error: 'Required', invalid_type_error: 'Required' }),
    frequency: z.union([z.coerce.number(), z.literal('')]).optional().nullable().transform(v => v === '' ? null : v),
    P: z.union([z.coerce.number(), z.literal('')]).optional().nullable().transform(v => v === '' ? null : v),
    F: z.union([z.coerce.number(), z.literal('')]).optional().nullable().transform(v => v === '' ? null : v),
    failure_mode_id: z.string().optional(),
}).refine(data => data.max_value > data.min_value, {
    message: 'Max must be > Min',
    path: ['max_value'],
});

type SensorFormData = z.infer<typeof sensorSchema>;

// ============= STAGED SENSOR TYPE =============
interface StagedSensor extends SensorFormData {
    _id: string; // local temp id
    failureModeName?: string;
}

// ============= PROPS =============
interface AddSensorFormProps {
    failureModes: FailureMode[];
    componentId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

// ============= INLINE EDIT ROW =============
function EditableRow({
    sensor,
    failureModes,
    onSave,
    onCancel,
}: {
    sensor: StagedSensor;
    failureModes: FailureMode[];
    onSave: (updated: StagedSensor) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, control, formState: { errors } } = useForm<SensorFormData>({
        resolver: zodResolver(sensorSchema),
        defaultValues: {
            sensor_name: sensor.sensor_name,
            unit: sensor.unit,
            min_value: sensor.min_value,
            max_value: sensor.max_value,
            frequency: sensor.frequency ?? null,
            P: sensor.P ?? null,
            F: sensor.F ?? null,
            failure_mode_id: sensor.failure_mode_id ?? '',
        },
    });

    const onSubmit = (data: SensorFormData) => {
        const fm = failureModes.find(f => f.id === data.failure_mode_id);
        onSave({ ...data, _id: sensor._id, failureModeName: fm?.name });
    };

    return (
        <tr className="bg-muted/30">
            {(['sensor_name', 'unit', 'min_value', 'max_value', 'frequency', 'P', 'F'] as const).map(field => (
                <td key={field} className="border p-1">
                    <Input
                        className="h-7 text-xs px-2"
                        type={field === 'sensor_name' || field === 'unit' ? 'text' : 'number'}
                        step="any"
                        placeholder={field}
                        {...register(field)}
                    />
                    {errors[field] && (
                        <p className="text-[10px] text-destructive mt-0.5">{(errors[field] as any)?.message}</p>
                    )}
                </td>
            ))}
            <td className="border p-1">
                <Controller
                    name="failure_mode_id"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={v => field.onChange(v === 'none' ? '' : v)}>
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {failureModes.map(fm => (
                                    <SelectItem key={fm.id} value={fm.id}>{fm.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </td>
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
export default function AddSensorForm({ failureModes, componentId, onClose, onSuccess }: AddSensorFormProps) {
    const [stagedSensors, setStagedSensors] = useState<StagedSensor[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmittingAll, setIsSubmittingAll] = useState(false);

    const isFull = stagedSensors.length >= MAX_SENSORS;

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<SensorFormData>({
        resolver: zodResolver(sensorSchema),
        defaultValues: {
            sensor_name: '',
            unit: '',
            min_value: '' as unknown as number,
            max_value: '' as unknown as number,
            frequency: null,
            P: null,
            F: null,
            failure_mode_id: '',
        },
    });

    const onAddToTable = (data: SensorFormData) => {
        if (isFull) return;
        const fm = failureModes.find(f => f.id === data.failure_mode_id);
        setStagedSensors(prev => [
            ...prev,
            { ...data, _id: crypto.randomUUID(), failureModeName: fm?.name },
        ]);
        reset();
    };

    const handleDelete = (id: string) => {
        setStagedSensors(prev => prev.filter(s => s._id !== id));
    };

    const handleSaveEdit = (updated: StagedSensor) => {
        setStagedSensors(prev => prev.map(s => s._id === updated._id ? updated : s));
        setEditingId(null);
    };

    const handleSubmitAll = async () => {
        if (stagedSensors.length === 0) return;
        setIsSubmittingAll(true);

        const results = await Promise.allSettled(
            stagedSensors.map(sensor =>
                createSensor({
                    sensor_name: sensor.sensor_name,
                    unit: sensor.unit,
                    min_value: sensor.min_value,
                    max_value: sensor.max_value,
                    frequency: sensor.frequency ?? null,
                    P: sensor.P ?? null,
                    F: sensor.F ?? null,
                    component_id: componentId,
                    failure_mode_id: sensor.failure_mode_id || undefined,
                })
            )
        );

        const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

        setIsSubmittingAll(false);

        if (failed.length === 0) {
            toast.success(`${stagedSensors.length} sensor${stagedSensors.length > 1 ? 's' : ''} created successfully!`);
            setStagedSensors([]);
            reset();
            onSuccess?.();
        } else {
            toast.error(`${failed.length} sensor(s) failed to create. Please try again.`);
        }
    };

    return (
        <Card className="mb-6 border-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Add Sensors</CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4 mr-1" /> Close
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* ── FORM ── */}
                {isFull ? (
                    <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 p-3 text-sm text-yellow-700 dark:text-yellow-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Table is full (max {MAX_SENSORS}). Submit or remove sensors to add more.
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSubmit(onAddToTable)(e); }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Sensor Name */}
                            <div className="space-y-1 md:col-span-2">
                                <Label htmlFor="sensor_name">Sensor Name</Label>
                                <Input id="sensor_name" placeholder="e.g., Temperature Sensor 1" {...register('sensor_name')} />
                                {errors.sensor_name && <p className="text-xs text-destructive">{errors.sensor_name.message}</p>}
                            </div>

                            {/* Unit */}
                            <div className="space-y-1">
                                <Label htmlFor="unit">Unit</Label>
                                <Input id="unit" placeholder="e.g., °C, PSI" {...register('unit')} />
                                {errors.unit && <p className="text-xs text-destructive">{errors.unit.message}</p>}
                            </div>

                            {/* Frequency */}
                            <div className="space-y-1">
                                <Label htmlFor="frequency">Frequency <span className="text-muted-foreground text-xs">(optional)</span></Label>
                                <Input id="frequency" type="number" placeholder="e.g., 60" {...register('frequency')} />
                            </div>

                            {/* Min Value */}
                            <div className="space-y-1">
                                <Label htmlFor="min_value">Min Value</Label>
                                <Input id="min_value" type="number" step="any" placeholder="e.g., 0" {...register('min_value')} />
                                {errors.min_value && <p className="text-xs text-destructive">{errors.min_value.message}</p>}
                            </div>

                            {/* Max Value */}
                            <div className="space-y-1">
                                <Label htmlFor="max_value">Max Value</Label>
                                <Input id="max_value" type="number" step="any" placeholder="e.g., 100" {...register('max_value')} />
                                {errors.max_value && <p className="text-xs text-destructive">{errors.max_value.message}</p>}
                            </div>

                            {/* P Value */}
                            <div className="space-y-1">
                                <Label htmlFor="P">P Value</Label>
                                <Input id="P" type="number" step="any" placeholder="e.g., 0.95" {...register('P')} />
                            </div>

                            {/* F Value */}
                            <div className="space-y-1">
                                <Label htmlFor="F">F Value</Label>
                                <Input id="F" type="number" step="any" placeholder="e.g., 0.05" {...register('F')} />
                            </div>

                            {/* Failure Mode */}
                            <div className="space-y-1 md:col-span-4">
                                <Label>Failure Mode <span className="text-muted-foreground text-xs">(optional)</span></Label>
                                <Controller
                                    name="failure_mode_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value || ''} onValueChange={v => field.onChange(v === 'none' ? '' : v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a failure mode (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {failureModes.map(fm => (
                                                    <SelectItem key={fm.id} value={fm.id}>{fm.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
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

                {/* ── PREVIEW TABLE ── */}
                {stagedSensors.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                Preview — {stagedSensors.length} / {MAX_SENSORS} sensors staged
                            </p>
                            <Badge variant={isFull ? 'destructive' : 'secondary'}>
                                {isFull ? 'Full' : `${MAX_SENSORS - stagedSensors.length} slots left`}
                            </Badge>
                        </div>

                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full border-collapse text-xs">
                                <thead className="bg-muted">
                                    <tr>
                                        {['Sensor Name', 'Unit', 'Min', 'Max', 'Frequency', 'P', 'F', 'Failure Mode', ''].map(h => (
                                            <th key={h} className="border p-2 text-left font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {stagedSensors.map(sensor =>
                                        editingId === sensor._id ? (
                                            <EditableRow
                                                key={sensor._id}
                                                sensor={sensor}
                                                failureModes={failureModes}
                                                onSave={handleSaveEdit}
                                                onCancel={() => setEditingId(null)}
                                            />
                                        ) : (
                                            <tr key={sensor._id} className="hover:bg-muted/40 transition-colors">
                                                <td className="border p-2">{sensor.sensor_name}</td>
                                                <td className="border p-2">{sensor.unit}</td>
                                                <td className="border p-2">{sensor.min_value}</td>
                                                <td className="border p-2">{sensor.max_value}</td>
                                                <td className="border p-2">{sensor.frequency ?? '—'}</td>
                                                <td className="border p-2">{sensor.P ?? '—'}</td>
                                                <td className="border p-2">{sensor.F ?? '—'}</td>
                                                <td className="border p-2">
                                                    {sensor.failureModeName
                                                        ? <Badge variant="outline" className="text-xs">{sensor.failureModeName}</Badge>
                                                        : <span className="text-muted-foreground">—</span>
                                                    }
                                                </td>
                                                <td className="border p-2">
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7"
                                                            onClick={() => setEditingId(sensor._id)}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(sensor._id)}
                                                        >
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

                        {/* ── SUBMIT ALL ── */}
                        <div className="flex justify-end pt-1">
                            <Button
                                onClick={handleSubmitAll}
                                disabled={isSubmittingAll || stagedSensors.length === 0}
                                className="gap-2"
                            >
                                <SendHorizonal className="w-4 h-4" />
                                {isSubmittingAll
                                    ? `Creating ${stagedSensors.length} sensor${stagedSensors.length > 1 ? 's' : ''}...`
                                    : `Submit All (${stagedSensors.length})`
                                }
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}