import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Lock, Loader2, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { usePMStore } from '@/store/PMstore';
import { useOptimizationStore } from '@/store/optimizationStore';
import { optimizePreventiveMaintenance, OptimizationParams } from '@/actions/optimize';
import OptimizationResults from './OptimizationResults';

import { toast } from "sonner";

// Zod Schemas for each optimization type
const baseSchema = z.object({
  optimizationType: z.string().min(1, 'Optimization type is required'),
});

const ageBased = baseSchema.extend({
  cf: z.number().positive('Must be positive'),
  cp: z.number().positive('Must be positive'),
});

const downtimeBased = baseSchema.extend({
  df: z.number().positive('Must be positive'),
  dp: z.number().positive('Must be positive'),
});

const componentGroup = baseSchema.extend({
  pmdt: z.number().nonnegative('Must be non-negative'),
  cpm: z.number().nonnegative('Must be non-negative'),
  cf: z.number().positive('Must be positive'),
});

const downtimeComponentGroup = baseSchema.extend({
  pmdt: z.number().nonnegative('Must be non-negative'),
});

const calendarTime = baseSchema.extend({
  cf: z.number().positive('Must be positive'),
  cp: z.number().positive('Must be positive'),
});

const riskTarget = baseSchema;

const calendarDowntime = baseSchema.extend({
  df: z.number().positive('Must be positive'),
  dp: z.number().positive('Must be positive'),
});

const getSchemaForType = (type: string) => {
  const schemas: Record<string, any> = {
    'age-based-cost': ageBased,
    'age-based-downtime': downtimeBased,
    'calendar-group-cost': componentGroup,
    'calendar-group-downtime': downtimeComponentGroup,
    'calendar-time-cost': calendarTime,
    'risk-based': riskTarget,
    'calendar-time-downtime': calendarDowntime,
  };
  return schemas[type] || riskTarget;
};

// Optimization type configs
const optimizationTypes = [
  { id: 'risk-based', label: 'Risk Based', category: 'Risk Based Replacement', fields: [] },
  {
    id: 'age-based-cost',
    label: 'Cost Criterion',
    category: 'Age Based Replacement',
    fields: [
      { id: 'cf', label: 'Cost of unplanned failure', type: 'number' },
      { id: 'cp', label: 'Cost of preventive replacement', type: 'number' },
    ],
  },
  {
    id: 'age-based-downtime',
    label: 'Downtime Criterion',
    category: 'Age Based Replacement',
    fields: [
      { id: 'df', label: 'Downtime of unplanned failure', type: 'number' },
      { id: 'dp', label: 'Downtime of preventive replacement', type: 'number' },
    ],
  },
  {
    id: 'calendar-group-cost',
    label: 'Cost Criterion',
    category: 'Calendar Time Based (Group)',
    fields: [
      { id: 'pmdt', label: 'Preventive downtime for group', type: 'number' },
      { id: 'cpm', label: 'Cost per unit preventive maintenance downtime', type: 'number' },
      { id: 'cf', label: 'Cost per unit failure downtime', type: 'number' },
    ],
  },
  {
    id: 'calendar-group-downtime',
    label: 'Downtime Criterion',
    category: 'Calendar Time Based (Group)',
    fields: [{ id: 'pmdt', label: 'Preventive downtime for group', type: 'number' }],
  },
  {
    id: 'calendar-time-cost',
    label: 'Cost Criterion',
    category: 'Calendar Time Based',
    fields: [
      { id: 'cf', label: 'Cost of unplanned failure', type: 'number' },
      { id: 'cp', label: 'Cost of preventive replacement', type: 'number' },
    ],
  },
  {
    id: 'calendar-time-downtime',
    label: 'Downtime Criterion',
    category: 'Calendar Time Based',
    fields: [
      { id: 'df', label: 'Downtime of unplanned failure', type: 'number' },
      { id: 'dp', label: 'Downtime of preventive replacement', type: 'number' },
    ],
  },
];

interface AssemblyOption {
  value: string;
  label: string;
  parentEquipmentId: string;
}

interface StreamlinedPMFormProps {
  selectedShip: string;
  selectedEquipmentIds: string[];
  selectedAssemblyIds: string[];
  assemblyOptions: AssemblyOption[];
  equipmentGroups: any[];
}

const StreamlinedPMForm = ({
  selectedShip,
  selectedEquipmentIds,
  selectedAssemblyIds,
  assemblyOptions
}: StreamlinedPMFormProps) => {

  const { results, isOptimizing, error, setResults, setOptimizing, setError, reset: resetOptimization } =
    useOptimizationStore();

  const [selectedOptType, setSelectedOptType] = React.useState('risk-based');

  const currentOptConfig = optimizationTypes.find(t => t.id === selectedOptType);

  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(getSchemaForType(selectedOptType)),
    defaultValues: { 
      optimizationType: 'risk-based',
      cf: undefined,
      cp: undefined,
      df: undefined,
      dp: undefined,
      pmdt: undefined,
      cpm: undefined,
    },
  });

  // Reset form when optimization type changes
  useEffect(() => {
    reset({ optimizationType: selectedOptType });
  }, [selectedOptType, reset]);

  if (!selectedShip || selectedEquipmentIds.length === 0 || selectedAssemblyIds.length === 0) {
    return (
      <div className="min-h-[400px] w-full bg-muted/30 rounded-xl p-8 border border-gray-800 flex items-center justify-center">
        <p className="text-gray-500 text-center">
          Please select a ship, equipment, and assemblies above to optimize preventive maintenance.
        </p>
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    setOptimizing(true);
    setError(null);

    try {
      // Build component names map
      const componentNames: Record<string, string> = {};
      selectedAssemblyIds.forEach(id => {
        const assembly = assemblyOptions.find(a => a.value === id);
        componentNames[id] = assembly?.label || id;
      });

      // Build params - method is the optimization type ID
      const params: OptimizationParams = {
        method: selectedOptType, // e.g., 'risk-based', 'age-based-cost'
        componentIds: selectedAssemblyIds,
        componentNames,
      };

      // Add method-specific parameters
      if (data.cf !== undefined) params.cf = data.cf;
      if (data.cp !== undefined) params.cp = data.cp;
      if (data.df !== undefined) params.df = data.df;
      if (data.dp !== undefined) params.dp = data.dp;
      if (data.pmdt !== undefined) params.pmdt = data.pmdt;
      if (data.cpm !== undefined) params.cpm = data.cpm;

      // Add p_values for risk-based method
      if (selectedOptType === 'risk-based') {
        params.p_values = [0.8, 0.85, 0.9, 0.95];
      }

      console.log('Submitting optimization params:', params);

      const result = await optimizePreventiveMaintenance(params);

      if (result.success && result.data) {
        setResults(result.data);
        toast.success(`Optimized ${selectedAssemblyIds.length} component(s) successfully`);
      } else {
        throw new Error(result.error || "Optimization failed");
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error(msg);
    } finally {
      setOptimizing(false);
    }
  };

  const handleReset = () => {
    reset({ 
      optimizationType: "risk-based",
      cf: undefined,
      cp: undefined,
      df: undefined,
      dp: undefined,
      pmdt: undefined,
      cpm: undefined,
    });
    setSelectedOptType("risk-based");
    resetOptimization();
    toast("Form reset");
  };

  const groupedTypes = optimizationTypes.reduce((acc, type) => {
    if (!acc[type.category]) acc[type.category] = [];
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof optimizationTypes>);

  return (
    <>
      <div className="w-full bg-muted/30 rounded-xl p-8 border border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-light mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
              Preventive Maintenance Optimization
            </h1>

            <div className="space-y-8">


              {/* Optimization Types */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-300">Optimization Type *</label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(groupedTypes).map(([category, types]) => (
                    <div key={category} className="space-y-3 p-4 bg-muted/40 rounded-lg border border-gray-700">
                      <h3 className="font-semibold text-gray-300 text-sm">{category}</h3>

                      {types.map(type => (
                        <label
                          key={type.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedOptType === type.id
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-black/50 hover:bg-muted/60 text-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="optimizationType"
                            value={type.id}
                            checked={selectedOptType === type.id}
                            onChange={(e) => {
                              setSelectedOptType(e.target.value);
                              resetOptimization();
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-medium">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Parameter Fields */}
              {currentOptConfig && currentOptConfig.fields.length > 0 && (
                <div className="p-6 bg-muted/40 rounded-xl border-2 border-gray-700 space-y-4">
                  <h3 className="font-semibold text-gray-300">Additional Parameters</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentOptConfig.fields.map(field => (
                      <div key={field.id} className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                          {field.label} *
                        </label>

                        <Controller
                          name={field.id as any}
                          control={control}
                          render={({ field: formField }) => (
                            <input
                              {...formField}
                              type="number"
                              step="any"
                              placeholder="Enter value"
                              onChange={(e) => {
                                const value = e.target.value;
                                formField.onChange(value === '' ? undefined : parseFloat(value));
                              }}
                              value={formField.value ?? ''}
                              className="w-full px-4 py-3 bg-black/50 border-2 border-gray-700 rounded-lg
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-300
                                transition-all"
                            />
                          )}
                        />

                        {errors[field.id] && (
                          <p className="text-red-400 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[field.id]?.message as string}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isOptimizing}
                  className="px-6 py-3 bg-muted/40 text-gray-300 rounded-lg hover:bg-muted/60
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isOptimizing}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                    disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2
                    transition-all shadow-lg hover:shadow-xl"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      Optimize
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <OptimizationResults results={results} methodType={selectedOptType} />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 mt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="text-red-400 font-semibold">Optimization Error</h3>
              <p className="text-gray-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StreamlinedPMForm;