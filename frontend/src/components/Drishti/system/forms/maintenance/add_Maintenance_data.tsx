"use client";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select";
import { Textarea } from "@/registry/new-york-v4/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/new-york-v4/ui/popover";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { createMaintenanceData } from "@/actions/system/additional_info";

const maintenanceDataSchema = z.object({
  eventType: z.enum(["preventive", "breakdown"]),
  date: z.date().nullable().refine((val) => val !== null, { message: "Date is required" }),
  maintenanceType: z.enum(["repaired", "replaced"]),
  replaceComponentType: z.enum(["new", "refurbished", "cannibalised", "duplicate"]),
  cannibalisedAge: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Must be a valid number",
  }),
  maintenanceDuration: z.string().min(1, "Maintenance duration is required"),
  remark: z.string().optional(),
});

type MaintenanceDataValues = z.infer<typeof maintenanceDataSchema>;

interface MaintenanceDataFormProps {
  componentId: string;
}

export default function MaintenanceDataForm({ componentId }: MaintenanceDataFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceDataValues>({
    resolver: zodResolver(maintenanceDataSchema),
    defaultValues: {
      eventType: undefined,
      date: undefined,
      maintenanceType: undefined,
      replaceComponentType: undefined,
      cannibalisedAge: "",
      maintenanceDuration: "",
      remark: "",
    },
  });

  const onSubmit = async (data: MaintenanceDataValues) => {
    if (!componentId) {
      toast.error("No component selected.");
      return;
    }

    const result = await createMaintenanceData({
      component_id: componentId,
      event_type: data.eventType,
      maint_date: format(data.date!, "yyyy-MM-dd"),
      maintenance_type: data.maintenanceType,
      replaced_component_type: data.replaceComponentType,
      cannabalised_age: data.cannibalisedAge,
      maintenance_duration: parseFloat(data.maintenanceDuration),
      description: data.remark,
    });

    if (result.success) {
      toast.success("Maintenance data saved.");
      reset();
      setIsExpanded(false);
    } else {
      toast.error(result.error ?? "Failed to save maintenance data.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-black rounded-lg shadow-lg border border-gray-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-medium mb-4 hover:opacity-70 transition-opacity text-gray-100"
      >
        <span>Maintenance Data (Optional)</span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Event Type */}
          <div>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full bg-black border-gray-700 text-gray-100">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="preventive" className="text-gray-100">Preventive</SelectItem>
                    <SelectItem value="breakdown" className="text-gray-100">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.eventType && <p className="text-red-400 text-sm mt-1">{errors.eventType.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <Controller
              name="date"
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
            {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
          </div>

          {/* Maintenance Type */}
          <div>
            <Controller
              name="maintenanceType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full bg-black border-gray-700 text-gray-100">
                    <SelectValue placeholder="Maintenance Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="repaired" className="text-gray-100">Repaired</SelectItem>
                    <SelectItem value="replaced" className="text-gray-100">Replaced</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.maintenanceType && <p className="text-red-400 text-sm mt-1">{errors.maintenanceType.message}</p>}
          </div>

          {/* Replace Component Type */}
          <div>
            <Controller
              name="replaceComponentType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full bg-black border-gray-700 text-gray-100">
                    <SelectValue placeholder="Replace Component Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="new" className="text-gray-100">New</SelectItem>
                    <SelectItem value="refurbished" className="text-gray-100">Refurbished</SelectItem>
                    <SelectItem value="cannibalised" className="text-gray-100">Cannibalised</SelectItem>
                    <SelectItem value="duplicate" className="text-gray-100">Duplicate</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.replaceComponentType && <p className="text-red-400 text-sm mt-1">{errors.replaceComponentType.message}</p>}
          </div>

          {/* Cannibalised Age */}
          <div>
            <Controller
              name="cannibalisedAge"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Cannibalised Age"
                  className="w-full bg-black border-gray-700 text-gray-100 placeholder:text-gray-500"
                  {...field}
                />
              )}
            />
            {errors.cannibalisedAge && <p className="text-red-400 text-sm mt-1">{errors.cannibalisedAge.message}</p>}
          </div>

          {/* Maintenance Duration */}
          <div>
            <Controller
              name="maintenanceDuration"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Maintenance Duration"
                  className="w-full bg-black border-gray-700 text-gray-100 placeholder:text-gray-500"
                  {...field}
                />
              )}
            />
            {errors.maintenanceDuration && <p className="text-red-400 text-sm mt-1">{errors.maintenanceDuration.message}</p>}
          </div>

          {/* Remark */}
          <div>
            <Controller
              name="remark"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Remark"
                  className="w-full bg-black border-gray-700 text-gray-100 placeholder:text-gray-500 min-h-[100px]"
                  {...field}
                />
              )}
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-2 rounded-md disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Submit"}
          </Button>
        </div>
      )}
    </div>
  );
}