import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { create } from 'zustand';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Copy, Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

// ============ ZUSTAND STORE ============
interface EtaBetaStore {
  formData: {
    inputParams: any;
    actualDataPoint: any;
    intervalDataPoint: any;
    oem: any;
    oemExpert: any;
    expertJudgement: any;
    probabilityFailure: any;
    nprd: any;
  };
  updateFormData: (formType: string, data: any) => void;
  resetFormData: (formType: string) => void;
}

const useEtaBetaStore = create < EtaBetaStore > ((set) => ({
  formData: {
    inputParams: null,
    actualDataPoint: null,
    intervalDataPoint: null,
    oem: null,
    oemExpert: null,
    expertJudgement: null,
    probabilityFailure: null,
    nprd: null,
  },
  updateFormData: (formType, data) =>
    set((state) => ({
      formData: { ...state.formData, [formType]: data },
    })),
  resetFormData: (formType) =>
    set((state) => ({
      formData: { ...state.formData, [formType]: null },
    })),
}));

// ============ VALIDATION SCHEMAS ============
const inputParamsSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  scaleParameter: z.coerce.number().min(0, 'Scale parameter must be positive'),
  shapeParameter: z.coerce.number().min(0, 'Shape parameter must be positive'),
});

const actualDataPointSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  installationDate: z.string().min(1, 'Installation date is required'),
  removalDate: z.string().min(1, 'Removal date is required'),
  status: z.enum(['Failure', 'Suspension']),
});

const intervalDataPointSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  installationStartDate: z.string().min(1, 'Installation start date is required'),
  installationEndDate: z.string().min(1, 'Installation end date is required'),
  removalStartDate: z.string().min(1, 'Removal start date is required'),
  removalEndDate: z.string().min(1, 'Removal end date is required'),
  status: z.enum(['Failure', 'Suspension']),
});

const oemSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  L10: z.coerce.number().min(0, 'L10 must be positive'),
  L90: z.coerce.number().min(0, 'L90 must be positive'),
});

const oemExpertSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  mostLikely: z.coerce.number().min(0, 'Most likely life must be positive'),
  maxLife: z.coerce.number().min(0, 'Maximum life must be positive'),
  minLife: z.coerce.number().min(0, 'Minimum life must be positive'),
  componentFailure: z.coerce.number().min(0, 'Number of components must be positive'),
  timeWoFailure: z.coerce.number().min(0, 'Time without failure must be positive'),
});

const expertJudgementSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  mostLikely: z.coerce.number().min(0, 'Most likely life must be positive'),
  maxLife: z.coerce.number().min(0, 'Maximum life must be positive'),
  minLife: z.coerce.number().min(0, 'Minimum life must be positive'),
  componentFailure: z.coerce.number().min(0, 'Number of components must be positive'),
  timeWoFailure: z.coerce.number().min(0, 'Time without failure must be positive'),
});

const probabilityFailureSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  time: z.coerce.number().min(0, 'Time must be positive'),
  failureProbability: z.coerce.number().min(0).max(100, 'Probability must be between 0-100'),
});

const nprdSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  failureRate: z.coerce.number().min(0, 'Failure rate must be positive'),
  beta: z.coerce.number().min(0, 'Beta must be positive'),
});

// ============ FORM COMPONENTS ============

const InputParametersForm: React.FC = () => {
  const { updateFormData } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(inputParamsSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateFormData('inputParams', data);
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Parameters (Eta/Beta)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="componentName">Component Name</Label>
            <Input id="componentName" {...register('componentName')} />
            {errors.componentName && (
              <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scaleParameter">Eta (η) - Scale Parameter</Label>
              <Input id="scaleParameter" type="number" step="0.01" {...register('scaleParameter')} />
              {errors.scaleParameter && (
                <p className="text-sm text-red-500 mt-1">{String(errors.scaleParameter.message)}</p>
              )}
            </div>

            <div>
              <Label htmlFor="shapeParameter">Beta (β) - Shape Parameter</Label>
              <Input id="shapeParameter" type="number" step="0.01" {...register('shapeParameter')} />
              {errors.shapeParameter && (
                <p className="text-sm text-red-500 mt-1">{String(errors.shapeParameter.message)}</p>
              )}
            </div>
          </div>

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Parameters saved successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Parameters
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const ActualDataPointForm: React.FC = () => {
  const { updateFormData } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(actualDataPointSchema),
    defaultValues: { status: 'Failure' },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateFormData('actualDataPoint', data);
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actual Data Point</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="componentName">Component Name</Label>
            <Input id="componentName" {...register('componentName')} />
            {errors.componentName && (
              <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="installationDate">Installation Date</Label>
              <Input id="installationDate" type="date" {...register('installationDate')} />
              {errors.installationDate && (
                <p className="text-sm text-red-500 mt-1">{String(errors.installationDate.message)}</p>
              )}
            </div>

            <div>
              <Label htmlFor="removalDate">Removal Date</Label>
              <Input id="removalDate" type="date" {...register('removalDate')} />
              {errors.removalDate && (
                <p className="text-sm text-red-500 mt-1">{String(errors.removalDate.message)}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="Failure">Failure</option>
              <option value="Suspension">Suspension</option>
            </select>
          </div>

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Data point saved successfully!</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Data Point
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const IntervalDataPointForm: React.FC = () => {
  const { updateFormData } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(intervalDataPointSchema),
    defaultValues: { status: 'Suspension' },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateFormData('intervalDataPoint', data);
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interval Data Point</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Component Name</Label>
            <Input {...register('componentName')} />
            {errors.componentName && <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Installation Interval</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" {...register('installationStartDate')} />
                {errors.installationStartDate && <p className="text-sm text-red-500 mt-1">{String(errors.installationStartDate.message)}</p>}
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" {...register('installationEndDate')} />
                {errors.installationEndDate && <p className="text-sm text-red-500 mt-1">{String(errors.installationEndDate.message)}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Removal Interval</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" {...register('removalStartDate')} />
                {errors.removalStartDate && <p className="text-sm text-red-500 mt-1">{String(errors.removalStartDate.message)}</p>}
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" {...register('removalEndDate')} />
                {errors.removalEndDate && <p className="text-sm text-red-500 mt-1">{String(errors.removalEndDate.message)}</p>}
              </div>
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="Failure">Failure</option>
              <option value="Suspension">Suspension</option>
            </select>
          </div>

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Interval data saved!</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Interval Data
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const OEMForm: React.FC = () => {
  const { updateFormData } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(oemSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateFormData('oem', data);
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OEM Data</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Component Name</Label>
            <Input {...register('componentName')} />
            {errors.componentName && <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>L10 Life Estimate</Label>
              <Input type="number" step="0.01" {...register('L10')} />
              {errors.L10 && <p className="text-sm text-red-500 mt-1">{String(errors.L10.message)}</p>}
            </div>
            <div>
              <Label>L90 Life Estimate</Label>
              <Input type="number" step="0.01" {...register('L90')} />
              {errors.L90 && <p className="text-sm text-red-500 mt-1">{String(errors.L90.message)}</p>}
            </div>
          </div>

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">OEM data saved!</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save OEM Data
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const OEMExpertForm: React.FC = () => {
  const { updateFormData } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(oemExpertSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateFormData('oemExpert', data);
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OEM + Expert Judgement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Component Name</Label>
            <Input {...register('componentName')} />
            {errors.componentName && <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Most Likely Life</Label>
              <Input type="number" step="0.01" {...register('mostLikely')} />
              {errors.mostLikely && <p className="text-sm text-red-500 mt-1">{String(errors.mostLikely.message)}</p>}
            </div>
            <div>
              <Label>Maximum Life</Label>
              <Input type="number" step="0.01" {...register('maxLife')} />
              {errors.maxLife && <p className="text-sm text-red-500 mt-1">{String(errors.maxLife.message)}</p>}
            </div>
            <div>
              <Label>Minimum Life</Label>
              <Input type="number" step="0.01" {...register('minLife')} />
              {errors.minLife && <p className="text-sm text-red-500 mt-1">{String(errors.minLife.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Components Without Failure</Label>
              <Input type="number" {...register('componentFailure')} />
              {errors.componentFailure && <p className="text-sm text-red-500 mt-1">{String(errors.componentFailure.message)}</p>}
            </div>
            <div>
              <Label>Total Time Without Failure</Label>
              <Input type="number" step="0.01" {...register('timeWoFailure')} />
              {errors.timeWoFailure && <p className="text-sm text-red-500 mt-1">{String(errors.timeWoFailure.message)}</p>}
            </div>
          </div>

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">OEM + Expert data saved!</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Data
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const ExpertJudgementForm: React.FC = () => {
  const { updateFormData } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(expertJudgementSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateFormData('expertJudgement', data);
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expert Judgement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Component Name</Label>
            <Input {...register('componentName')} />
            {errors.componentName && <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Most Likely Life</Label>
              <Input type="number" step="0.01" {...register('mostLikely')} />
              {errors.mostLikely && <p className="text-sm text-red-500 mt-1">{String(errors.mostLikely.message)}</p>}
            </div>
            <div>
              <Label>Maximum Life</Label>
              <Input type="number" step="0.01" {...register('maxLife')} />
              {errors.maxLife && <p className="text-sm text-red-500 mt-1">{String(errors.maxLife.message)}</p>}
            </div>
            <div>
              <Label>Minimum Life</Label>
              <Input type="number" step="0.01" {...register('minLife')} />
              {errors.minLife && <p className="text-sm text-red-500 mt-1">{String(errors.minLife.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Components Without Failure</Label>
              <Input type="number" {...register('componentFailure')} />
              {errors.componentFailure && <p className="text-sm text-red-500 mt-1">{String(errors.componentFailure.message)}</p>}
            </div>
            <div>
              <Label>Total Time Without Failure</Label>
              <Input type="number" step="0.01" {...register('timeWoFailure')} />
              {errors.timeWoFailure && <p className="text-sm text-red-500 mt-1">{String(errors.timeWoFailure.message)}</p>}
            </div>
          </div>

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Expert judgement saved!</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Expert Judgement
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const ProbabilityFailureForm: React.FC = () => {
  const { updateFormData } = useEtaBetaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(probabilityFailureSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateFormData('probabilityFailure', data);
    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Probability of Failure</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Component Name</Label>
            <Input {...register('componentName')} />
            {errors.componentName && <p className="text-sm text-red-500 mt-1">{String(errors.componentName.message)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Time (T&lt;) hrs</Label>
              <Input type="number" step="0.01" {...register('time')} />
              {errors.time && <p className="text-sm text-red-500 mt-1">{String(errors.time.message)}</p>}
            </div>
            <div>
              <Label>Failure Probability (%)</Label>
              <Input type="number" step="0.01" {...register('failureProbability')} />
              {errors.failureProbability && <p className="text-sm text-red-500 mt-1">{String(errors.failureProbability.message)}</p>}
            </div>
          </div>

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Probability data saved!</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Probability Data
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { create } from 'zustand';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { Loader2, CheckCircle2, Info } from 'lucide-react';

// ============ ZUSTAND STORE ============
interface NPRDStore {
  nprdData: any;
  updateNPRDData: (data: any) => void;
  resetNPRDData: () => void;
}

export const useNPRDStore = create < NPRDStore > ((set) => ({
  nprdData: null,
  updateNPRDData: (data) => set({ nprdData: data }),
  resetNPRDData: () => set({ nprdData: null }),
}));

// ============ VALIDATION SCHEMA ============
const nprdSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  failureRate: z.coerce.number().min(0, 'Failure rate must be positive'),
  beta: z.coerce.number().min(0, 'Beta must be positive'),
});

type NPRDFormData = z.infer<typeof nprdSchema>;

// ============ NPRD FORM COMPONENT ============
export const NPRDForm: React.FC = () => {
  const { updateNPRDData } = useNPRDStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm < NPRDFormData > ({
    resolver: zodResolver(nprdSchema),
    defaultValues: {
      componentName: '',
      failureRate: 2,
      beta: 2,
    },
  });

  const onSubmit = async (data: NPRDFormData) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update store
    updateNPRDData(data);

    setSuccess(true);
    setIsSubmitting(false);

    // Hide success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);

    console.log('NPRD Data submitted:', data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>NPRD (Navy Parts Reliability Data)</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showInfo && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-800">
              <strong>Beta (β) Guidelines:</strong>
              <br />
              • If failure occurs in a narrow time window: use β = 2.5
              <br />
              • If failure occurs in a scattered time window: use β = 1.5
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nprd-componentName">Component Name</Label>
            <Input
              id="nprd-componentName"
              {...register('componentName')}
              placeholder="Enter component name"
            />
            {errors.componentName && (
              <p className="text-sm text-red-500 mt-1">
                {String(errors.componentName.message)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nprd-failureRate">Failure Rate</Label>
              <Input
                id="nprd-failureRate"
                type="number"
                step="0.01"
                {...register('failureRate')}
                placeholder="Enter failure rate"
              />
              {errors.failureRate && (
                <p className="text-sm text-red-500 mt-1">
                  {String(errors.failureRate.message)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="nprd-beta">Beta (β) - Shape Parameter</Label>
              <Input
                id="nprd-beta"
                type="number"
                step="0.01"
                {...register('beta')}
                placeholder="Enter beta value"
              />
              {errors.beta && (
                <p className="text-sm text-red-500 mt-1">
                  {String(errors.beta.message)}
                </p>
              )}
            </div>
          </div>

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                NPRD data saved successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save NPRD Data
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// ============ EXAMPLE USAGE ============
export default function NPRDFormDemo() {
  const { nprdData } = useNPRDStore();

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">NPRD Form</h1>
        <p className="text-muted-foreground">
          Navy Parts Reliability Data Entry
        </p>
      </div>

      <NPRDForm />

      {/* Display saved data */}
      {nprdData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Saved NPRD Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Component Name:</span>
                <span>{nprdData.componentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Failure Rate:</span>
                <span>{nprdData.failureRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Beta (β):</span>
                <span>{nprdData.beta}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}