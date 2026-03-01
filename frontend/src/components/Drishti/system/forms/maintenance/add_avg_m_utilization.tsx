"use client";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import { Card, CardTitle } from "@/registry/new-york-v4/ui/card";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/new-york-v4/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { createSystemConfigAdditional } from "@/actions/system/additional_info";

const additionalInfoSchema = z.object({
  installationDate: z.date().nullable().refine((val) => val !== null, {
    message: "Installation date is required",
  }),
  defaultAvgMonthlyUtilization: z
    .string()
    .min(1, "This field is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid number"),
  unit: z.enum(["days", "hours", "cycles"]),
});

type AdditionalInfoValues = z.infer<typeof additionalInfoSchema>;

interface AvgMonthlyUtilizationFormProps {
  componentId: string;
}

export default function Average_monthly_utilization_InfoForm({ componentId }: AvgMonthlyUtilizationFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdditionalInfoValues>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      installationDate: undefined,
      defaultAvgMonthlyUtilization: "",
      unit: undefined,
    },
  });

  const onSubmit = async (data: AdditionalInfoValues) => {
    if (!componentId) {
      toast.error("No component selected.");
      return;
    }

    const result = await createSystemConfigAdditional({
      component_id: componentId,
      num_cycle_or_runtime: parseFloat(data.defaultAvgMonthlyUtilization),
      installation_date: format(data.installationDate!, "yyyy-MM-dd"),
      unit: data.unit,
    });

    if (result.success) {
      toast.success("Average monthly utilization saved.");
      reset();
      setIsExpanded(false);
    } else {
      toast.error(result.error ?? "Failed to save.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-black rounded-lg shadow-lg border border-gray-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-medium mb-4 hover:opacity-70 transition-opacity text-gray-100"
      >
        <span>Average Monthly Utilization (Optional)</span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <Card className="space-y-4 p-4">
          <CardTitle className="text-2xl">Average Monthly Utilization</CardTitle>

          {/* Installation Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Installation Date</label>
            <Controller
              name="installationDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-black border-gray-700 text-gray-100 hover:bg-black hover:text-gray-100"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span className="text-gray-500">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black border-gray-700">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      className="bg-black text-gray-100"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.installationDate && (
              <p className="text-red-400 text-sm mt-1">{errors.installationDate.message}</p>
            )}
          </div>

          {/* Avg Monthly Utilization */}
          <div>
            <Controller
              name="defaultAvgMonthlyUtilization"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Default Avg. Monthly Utilization"
                  className="w-full bg-black border-gray-700 text-gray-100 placeholder:text-gray-500"
                  {...field}
                />
              )}
            />
            {errors.defaultAvgMonthlyUtilization && (
              <p className="text-red-400 text-sm mt-1">{errors.defaultAvgMonthlyUtilization.message}</p>
            )}
          </div>

          {/* Unit */}
          <div>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full bg-black border-gray-700 text-gray-100">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="days" className="text-gray-100">Days</SelectItem>
                    <SelectItem value="hours" className="text-gray-100">Hours</SelectItem>
                    <SelectItem value="cycles" className="text-gray-100">Cycles</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.unit && <p className="text-red-400 text-sm mt-1">{errors.unit.message}</p>}
          </div>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-2 rounded-md disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Submit"}
          </Button>
        </Card>
      )}
    </div>
  );
}