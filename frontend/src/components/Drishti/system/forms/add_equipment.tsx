import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Label } from '@/registry/new-york-v4/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/new-york-v4/ui/select';
import { Checkbox } from '@/registry/new-york-v4/ui/checkbox';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';

// Define the form schema with Zod
const componentSchema = z.object({
  componentName: z.string().min(1, 'Component name is required').min(3, 'Component name must be at least 3 characters'),
  nomenclature: z.string().min(1, 'Nomenclature is required'),
  systemType: z.string().min(1, 'System is required'),
  departmentId: z.string().min(1, 'Department is required'),
  parentId: z.string(),
  cmmsCode: z.string().optional(),
  isLmu: z.boolean(),
});

type ComponentFormData = z.infer<typeof componentSchema>;

interface System {
  id: string;
  type: string;
  name: string;
}

interface Component {
  id: string;
  name: string;
  nomenclature: string;
  parent_id?: string | null;
  level?: number;
}

interface Department {
  department_id: string;
  department_name: string;
  department_code: string;
}

interface ManageComponentsProps {
  systems: System[];
  components: Component[];
  departments: Department[];
  loading: boolean;
  shipId: string;
}

export default function AddComponentForm({ systems, components, departments, loading, shipId }: ManageComponentsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComponentFormData>({
    resolver: zodResolver(componentSchema),
    defaultValues: {
      componentName: '',
      nomenclature: '',
      systemType: '',
      departmentId: '',
      parentId: 'none',
      cmmsCode: '',
      isLmu: true,
    },
  });

  const onSubmit = async (data: ComponentFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // TODO: Implement API call to create component
      console.log('Form data:', data);
      
      setMessage({ type: 'success', text: 'Component created successfully!' });
      
      // Reset form after successful submission
      reset();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create component'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setMessage(null);
  };

  const handleFormSubmit = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Add New Equipment</h2>
        <p className="text-muted-foreground text-sm">
          Create a new equipment component and optionally assign it to a parent in the hierarchy
        </p>
      </div>

      {message && (
        <Alert className="mb-4" variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Component Name */}
          <div className="space-y-2">
            <Label htmlFor="componentName">Name *</Label>
            <Controller
              name="componentName"
              control={control}
              render={({ field }) => (
                <Input
                  id="componentName"
                  placeholder="e.g., Gas Turbine"
                  {...field}
                />
              )}
            />
            {errors.componentName && (
              <p className="text-sm font-medium text-destructive">{errors.componentName.message}</p>
            )}
          </div>

          {/* Nomenclature */}
          <div className="space-y-2">
            <Label htmlFor="nomenclature">Nomenclature *</Label>
            <Controller
              name="nomenclature"
              control={control}
              render={({ field }) => (
                <Input
                  id="nomenclature"
                  placeholder="e.g., GT 1"
                  {...field}
                />
              )}
            />
            {errors.nomenclature && (
              <p className="text-sm font-medium text-destructive">{errors.nomenclature.message}</p>
            )}
          </div>

          {/* System Type */}
          <div className="space-y-2">
            <Label htmlFor="systemType">System *</Label>
            <Controller
              name="systemType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="systemType">
                    <SelectValue placeholder="Select system" />
                  </SelectTrigger>
                  <SelectContent>
                    {systems.map((system) => (
                      <SelectItem key={system.id} value={system.type}>
                        {system.name.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.systemType && (
              <p className="text-sm font-medium text-destructive">{errors.systemType.message}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department *</Label>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="departmentId">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.department_id} value={dept.department_id}>
                        {dept.department_name} ({dept.department_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.departmentId && (
              <p className="text-sm font-medium text-destructive">{errors.departmentId.message}</p>
            )}
          </div>

          {/* Parent Component */}
          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Component (Optional)</Label>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="No parent (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent (top-level)</SelectItem>
                    {components.map((component) => (
                      <SelectItem key={component.id} value={component.id}>
                        {component.nomenclature} - {component.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Select a parent to create a hierarchical relationship
            </p>
          </div>

          {/* CMMS Code */}
          <div className="space-y-2">
            <Label htmlFor="cmmsCode">CMMS Equipment Code (Optional)</Label>
            <Controller
              name="cmmsCode"
              control={control}
              render={({ field }) => (
                <Input
                  id="cmmsCode"
                  placeholder="e.g., EQ-001"
                  {...field}
                />
              )}
            />
          </div>
        </div>

        {/* LMU Toggle */}
        <div className="flex items-center space-x-2">
          <Controller
            name="isLmu"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="isLmu"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="isLmu" className="font-medium cursor-pointer">
            Line Maintenance Unit (LMU)
          </Label>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Component'}
          </Button>
        </div>
      </div>
    </div>
  );
}