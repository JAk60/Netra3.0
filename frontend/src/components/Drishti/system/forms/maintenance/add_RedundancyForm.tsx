import { MultiSelect } from '@/registry/new-york-v4/ui/MultiSelect';
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card";
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { createRedundancyBatch, RedundancyRowInput } from '@/actions/system/additional_info';

const redundancySchema = z.object({
  redundancies: z.array(
    z.object({
      eqId: z.string(),
      EquipmentName: z.string(),
      EquipmentParentName: z.string(),
      ParallelComponent: z.string(),
      parallelComponentIds: z.array(z.string()),
      RedundancyType: z.enum(['Active Redundancy', 'Inactive Redundancy']),
      K: z.number(),
      N: z.number(),
    })
  ),
});

type RedundancyFormData = z.infer<typeof redundancySchema>;

export default function RedundancyForm({
  hierarchyData,
}: {
  hierarchyData: any;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const flattenHierarchy = (root: any) => {
    const result: any[] = [];
    const visited = new Set();

    const traverse = (node: any, parentName: string | null = null) => {
      if (!node || visited.has(node.component_id)) return;
      visited.add(node.component_id);

      if (parentName !== null) {
        result.push({
          eqId: node.component_id,
          EquipmentName: node.nomenclature,
          componentName: node.component_name,
          EquipmentParentName: parentName,
          parentId: node.parent_id || null,
        });
      }

      if (Array.isArray(node.children)) {
        node.children.forEach((child: any) => traverse(child, node.nomenclature));
      }
    };

    traverse(root);
    return result;
  };

  const flattenedComponents = useMemo(() => {
    if (!hierarchyData) return [];
    return flattenHierarchy(hierarchyData);
  }, [hierarchyData]);

  const initialRows = useMemo(
    () =>
      flattenedComponents.map((comp) => ({
        eqId: comp.eqId,
        EquipmentName: comp.EquipmentName,
        EquipmentParentName: comp.EquipmentParentName,
        ParallelComponent: '',
        parallelComponentIds: [] as string[],
        RedundancyType: 'Active Redundancy' as const,
        K: 1,
        N: 0,
      })),
    [flattenedComponents]
  );

  const { control, handleSubmit, watch } = useForm<RedundancyFormData>({
    resolver: zodResolver(redundancySchema),
    defaultValues: { redundancies: initialRows },
    mode: 'onBlur',
  });

  const redundancies = watch('redundancies');

  const getParallelOptions = (parentName: string, currentEqId: string) => {
    return flattenedComponents
      .filter(
        (comp) =>
          comp.EquipmentParentName === parentName && comp.eqId !== currentEqId
      )
      .map((comp) => ({ label: comp.EquipmentName, value: comp.eqId }));
  };

  const onSubmit = async (data: RedundancyFormData) => {
    // Only rows where user actually picked parallel components
    const selectedRows = data.redundancies.filter(
      (r) => r.parallelComponentIds.length > 0
    );

    if (selectedRows.length === 0) {
      toast.error("No parallel components selected. Nothing to save.");
      return;
    }

    const payload: RedundancyRowInput[] = selectedRows.map((r) => {
      const parallelNames = r.parallelComponentIds
        .map((id) => flattenedComponents.find((c) => c.eqId === id)?.EquipmentName)
        .filter(Boolean)
        .join(', ');

      return {
        component_id: r.eqId,
        k: String(r.K),
        n: r.parallelComponentIds.length,
        redundancy_type: r.RedundancyType,
        system_name: r.EquipmentName,
        system_parent_name: r.EquipmentParentName,
        // ParallelComponent names stored in system_name for reference — adjust if needed
      };
    });

    setIsSubmitting(true);
    const result = await createRedundancyBatch(payload);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`${result.data?.inserted} redundancy record(s) saved.`);
      setIsExpanded(false);
    } else {
      toast.error(result.error ?? "Failed to save redundancy data.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-black rounded-lg shadow-lg border border-gray-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-medium mb-4 hover:opacity-70 transition-opacity"
      >
        <span>Parallel and Redundancy</span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">Redundancy Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Equipment</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Parent</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Parallel Components</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Redundancy Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold w-24">K</th>
                  </tr>
                </thead>
                <tbody>
                  {redundancies.map((row, index) => {
                    const options = getParallelOptions(row.EquipmentParentName, row.eqId);
                    return (
                      <tr key={row.eqId} className="border-b border-border">
                        <td className="px-6 py-4 text-sm">{row.EquipmentName}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {row.EquipmentParentName}
                        </td>

                        <td className="px-6 py-4">
                          <Controller
                            name={`redundancies.${index}.parallelComponentIds`}
                            control={control}
                            render={({ field }) => (
                              <MultiSelect
                                options={options}
                                value={field.value ?? []}
                                onValueChange={field.onChange}
                                disabled={options.length === 0}
                              />
                            )}
                          />
                        </td>

                        <td className="px-6 py-4">
                          <Controller
                            name={`redundancies.${index}.RedundancyType`}
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                              >
                                <option value="Active Redundancy">Active Redundancy</option>
                                <option value="Inactive Redundancy">Inactive Redundancy</option>
                              </select>
                            )}
                          />
                        </td>

                        <td className="px-6 py-4 text-sm text-muted-foreground">1</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving…" : "Save Redundancy Information"}
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}