"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/registry/new-york-v4/ui/table";
import {
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    Send,
    RefreshCw,
    Activity,
    AlertCircle,
    Clock,
} from "lucide-react";
import { UtilizationRecord } from "@/actions/Monthlyutilization ";
import { useMonthlyUtilizationStore } from "@/store/Monthlyutilizationstore ";



// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const draftRowSchema = z.object({
    operation_date: z.string().min(1, "Date is required").regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM"),
    utlization: z
        .string()
        .min(1, "Required")
        .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be ≥ 0"),
});

const bulkDraftSchema = z.object({
    rows: z.array(draftRowSchema).min(1, "Add at least one row"),
});

const editSchema = z.object({
    operation_date: z.string().min(1, "Date is required").regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM"),
    utlization: z
        .string()
        .min(1, "Required")
        .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be ≥ 0"),
});

type BulkDraftForm = z.infer<typeof bulkDraftSchema>;
type EditForm = z.infer<typeof editSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoDate: string) {
    try {
        // Backend stores full ISO; we only care about month/year
        const d = isoDate.includes("T") ? parseISO(isoDate) : parseISO(`${isoDate}-01`);
        return format(d, "MMM yyyy");
    } catch {
        return isoDate;
    }
}

// Convert "2024-01" → "2024-01-01T00:00:00" for the API
function monthToIso(month: string) {
    return `${month}-01T00:00:00`;
}

// Convert ISO → "2024-01" for the month input
function isoToMonth(iso: string) {
    try {
        return format(parseISO(iso.includes("T") ? iso : `${iso}-01`), "yyyy-MM");
    } catch {
        return iso.slice(0, 7);
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AgeBadge({ age, loading }: { age: number | null; loading: boolean }) {
    if (loading)
        return (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <RefreshCw className="w-3 h-3 animate-spin" /> Fetching age…
            </span>
        );
    if (age === null)
        return (
            <Badge variant="outline" className="border-gray-700 text-gray-500 font-mono text-xs">
                No data
            </Badge>
        );
    if (age === 0)
        return (
            <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono text-xs">
                <Clock className="w-3 h-3 mr-1" /> 0 hrs — Post Overhaul
            </Badge>
        );
    return (
        <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono text-xs">
            <Activity className="w-3 h-3 mr-1" />
            {age.toLocaleString()} hrs
        </Badge>
    );
}

// ─── Edit Row ─────────────────────────────────────────────────────────────────

function EditableRow({
    record,
    onSave,
    onCancel,
    isSaving,
}: {
    record: UtilizationRecord;
    onSave: (values: EditForm) => void;
    onCancel: () => void;
    isSaving: boolean;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EditForm>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            operation_date: isoToMonth(record.operation_date),
            utlization: record.utlization,
        },
    });

    return (
        <TableRow className="border-gray-700 bg-indigo-950/30">
            <TableCell className="text-gray-600 text-xs w-8" />
            <TableCell>
                <div className="space-y-1">
                    <Input
                        type="month"
                        {...register("operation_date")}
                        className="bg-gray-800 border-indigo-600/60 text-gray-100 h-7 text-sm w-40 focus-visible:ring-indigo-500"
                    />
                    {errors.operation_date && (
                        <p className="text-red-400 text-xs">{errors.operation_date.message}</p>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="space-y-1">
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("utlization")}
                        className="bg-gray-800 border-indigo-600/60 text-gray-100 h-7 text-sm w-36 font-mono focus-visible:ring-indigo-500"
                    />
                    {errors.utlization && (
                        <p className="text-red-400 text-xs">{errors.utlization.message}</p>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSubmit(onSave)}
                        disabled={isSaving}
                        className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                        {isSaving ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Check className="w-3.5 h-3.5" />
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="h-7 w-7 p-0 text-gray-500 hover:text-gray-300 hover:bg-gray-700"
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MonthlyUtilizationCRUDProps {
    componentId: string;
}

export default function MonthlyUtilizationCRUD({ componentId }: MonthlyUtilizationCRUDProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const {
        records,
        currentAge,
        recordsState,
        ageState,
        inserting,
        updatingId,
        deletingId,
        recordsError,
        mutationError,
        loadAll,
        bulkInsert,
        updateRecord,
        deleteRecord,
        clearErrors,
    } = useMonthlyUtilizationStore();

    // ── Bulk-draft form (react-hook-form + zod) ──────────────────────────────

    const {
        control,
        register,
        handleSubmit,
        reset: resetForm,
        formState: { errors: formErrors },
    } = useForm<BulkDraftForm>({
        resolver: zodResolver(bulkDraftSchema),
        defaultValues: {
            rows: [{ operation_date: format(new Date(), "yyyy-MM"), utlization: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "rows" });

    // ── Load data on expand ──────────────────────────────────────────────────

    useEffect(() => {
        if (isExpanded && componentId) {
            loadAll(componentId);
        }
    }, [isExpanded, componentId, loadAll]);

    // ── Show mutation errors via toast ───────────────────────────────────────

    useEffect(() => {
        if (mutationError) {
            toast.error(mutationError);
            clearErrors();
        }
    }, [mutationError, clearErrors]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleBulkInsert = useCallback(
        async (data: BulkDraftForm) => {
            const payload = data.rows.map((r) => ({
                component_id: componentId,
                operation_date: monthToIso(r.operation_date),
                utlization: r.utlization,
            }));

            const result = await bulkInsert(payload);

            if (result) {
                toast.success(`${result.inserted} record${result.inserted !== 1 ? "s" : ""} inserted`);
                resetForm({
                    rows: [{ operation_date: format(new Date(), "yyyy-MM"), utlization: "" }],
                });
            }
        },
        [componentId, bulkInsert, resetForm]
    );

    const handleSaveEdit = useCallback(
        async (recordId: string, values: EditForm) => {
            const ok = await updateRecord(recordId, {
                operation_date: monthToIso(values.operation_date),
                utlization: values.utlization,
            });
            if (ok) {
                toast.success("Record updated");
                setEditingId(null);
            }
        },
        [updateRecord]
    );

    const handleDelete = useCallback(
        async (recordId: string) => {
            const ok = await deleteRecord(recordId);
            if (ok) toast.success("Record deleted");
        },
        [deleteRecord]
    );

    const handleRefresh = useCallback(() => {
        loadAll(componentId);
    }, [componentId, loadAll]);

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-black rounded-lg shadow-lg border border-gray-800">

            {/* ── Collapsible header ─────────────────────────────────────── */}
            <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-lg font-medium mb-4 hover:opacity-70 transition-opacity text-gray-100"
            >
                <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Monthly Utilization
                </span>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {isExpanded && (
                <div className="space-y-6">

                    {/* ── Top bar: age + refresh ──────────────────────────── */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            {/* <span className="text-xs text-gray-500 uppercase tracking-widest">
                                Running Age
                            </span>
                            <AgeBadge age={currentAge} loading={ageState === "loading"} /> */}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={recordsState === "loading"}
                            className="h-7 gap-1.5 text-gray-500 hover:text-gray-200 text-xs"
                        >
                            <RefreshCw
                                className={`w-3.5 h-3.5 ${recordsState === "loading" ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>
                    </div>

                    {/* Records error */}
                    {recordsError && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-md px-3 py-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {recordsError}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        SECTION 1 — Add new rows (bulk draft)
                    ═══════════════════════════════════════════════════════ */}
                    <Card className="bg-gray-900/60 border-gray-700/70">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-gray-300 flex items-center justify-between">
                                <span>Add Records</span>
                                <Badge
                                    variant="outline"
                                    className="border-gray-700 text-gray-500 font-normal text-xs"
                                >
                                    {fields.length} row{fields.length !== 1 ? "s" : ""} pending
                                </Badge>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="px-4 pb-4 space-y-3">
                            <div className="overflow-x-auto rounded-md border border-gray-800">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-800 hover:bg-transparent">
                                            <TableHead className="text-gray-500 text-xs font-medium py-2">
                                                Operation Month
                                            </TableHead>
                                            <TableHead className="text-gray-500 text-xs font-medium py-2">
                                                Utilization (hrs)
                                            </TableHead>
                                            <TableHead className="w-10 py-2" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, idx) => (
                                            <TableRow
                                                key={field.id}
                                                className="border-gray-800 hover:bg-gray-800/30"
                                            >
                                                <TableCell className="py-2">
                                                    <div>
                                                        <Controller
                                                            control={control}
                                                            name={`rows.${idx}.operation_date`}
                                                            render={({ field: f }) => (
                                                                <Input
                                                                    type="month"
                                                                    {...f}
                                                                    className="bg-gray-800 border-gray-700 text-gray-100 h-8 text-sm w-44 focus-visible:ring-indigo-500/50"
                                                                />
                                                            )}
                                                        />
                                                        {formErrors.rows?.[idx]?.operation_date && (
                                                            <p className="text-red-400 text-xs mt-1">
                                                                {formErrors.rows[idx]?.operation_date?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-2">
                                                    <div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="e.g. 720"
                                                            {...register(`rows.${idx}.utlization`)}
                                                            className="bg-gray-800 border-gray-700 text-gray-100 h-8 text-sm w-40 font-mono focus-visible:ring-indigo-500/50"
                                                        />
                                                        {formErrors.rows?.[idx]?.utlization && (
                                                            <p className="text-red-400 text-xs mt-1">
                                                                {formErrors.rows[idx]?.utlization?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={fields.length === 1}
                                                        onClick={() => remove(idx)}
                                                        className="h-8 w-8 p-0 text-gray-600 hover:text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Form-level error */}
                            {formErrors.rows?.root && (
                                <p className="text-red-400 text-xs">
                                    {formErrors.rows.root.message}
                                </p>
                            )}

                            {/* Action bar */}
                            <div className="flex items-center justify-between pt-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        append({
                                            operation_date: format(new Date(), "yyyy-MM"),
                                            utlization: "",
                                        })
                                    }
                                    className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-xs gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Row
                                </Button>

                                <Button
                                    onClick={handleSubmit(handleBulkInsert)}
                                    disabled={inserting}
                                    className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 gap-2"
                                >
                                    {inserting ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            Inserting…
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            Insert Monthly Data
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ══════════════════════════════════════════════════════
                        SECTION 2 — Existing records (view / edit / delete)
                    ═══════════════════════════════════════════════════════ */}
                    <Card className="bg-gray-900/60 border-gray-700/70">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-gray-300 flex items-center justify-between">
                                <span>Saved Records</span>
                                <Badge
                                    variant="outline"
                                    className="border-gray-700 text-gray-500 font-normal text-xs"
                                >
                                    {records.length} total
                                </Badge>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="px-4 pb-4">
                            {recordsState === "loading" && records.length === 0 ? (
                                <div className="flex items-center justify-center gap-2 py-12 text-gray-600 text-sm">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Loading records…
                                </div>
                            ) : records.length === 0 ? (
                                <div className="text-center py-12 text-gray-600 text-sm">
                                    No records yet.{" "}
                                    <span className="text-indigo-400">Add rows above</span> and click{" "}
                                    <span className="text-indigo-400 font-medium">Insert Monthly Data</span>.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border border-gray-800">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gray-800 hover:bg-transparent">
                                                <TableHead className="text-gray-500 text-xs font-medium w-10 py-2">
                                                    #
                                                </TableHead>
                                                <TableHead className="text-gray-500 text-xs font-medium py-2">
                                                    Month
                                                </TableHead>
                                                <TableHead className="text-gray-500 text-xs font-medium py-2">
                                                    Utilization (hrs)
                                                </TableHead>
                                                <TableHead className="text-gray-500 text-xs font-medium py-2 text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {records.map((rec, idx) => {
                                                const isEditing = editingId === rec.id;
                                                const isDeleting = deletingId === rec.id;
                                                const isSaving = updatingId === rec.id;
                                                const anyBusy = !!editingId || !!deletingId || inserting;

                                                if (isEditing) {
                                                    return (
                                                        <EditableRow
                                                            key={rec.id}
                                                            record={rec}
                                                            isSaving={isSaving}
                                                            onSave={(vals) => handleSaveEdit(rec.id, vals)}
                                                            onCancel={() => setEditingId(null)}
                                                        />
                                                    );
                                                }

                                                return (
                                                    <TableRow
                                                        key={rec.id}
                                                        className="border-gray-800 hover:bg-gray-800/30 transition-colors"
                                                    >
                                                        <TableCell className="text-gray-600 text-xs py-2.5">
                                                            {idx + 1}
                                                        </TableCell>

                                                        <TableCell className="text-gray-200 text-sm py-2.5">
                                                            {formatDate(rec.operation_date)}
                                                        </TableCell>

                                                        <TableCell className="text-gray-200 text-sm font-mono py-2.5">
                                                            {Number(rec.utlization).toLocaleString()}
                                                        </TableCell>

                                                        <TableCell className="py-2.5 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    disabled={anyBusy}
                                                                    onClick={() => setEditingId(rec.id)}
                                                                    className="h-7 w-7 p-0 text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    disabled={anyBusy}
                                                                    onClick={() => handleDelete(rec.id)}
                                                                    className="h-7 w-7 p-0 text-gray-600 hover:text-red-400 hover:bg-red-500/10"
                                                                >
                                                                    {isDeleting ? (
                                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}