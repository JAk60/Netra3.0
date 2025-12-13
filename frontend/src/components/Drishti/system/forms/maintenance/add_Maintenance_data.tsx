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



// Maintenance Data Form Schema
const maintenanceDataSchema = z.object({
  eventType: z.enum(["preventive", "breakdown"]).refine((val) => val !== undefined, {
    message: "Please select an event type",
  }),
  date: z.date().nullable().refine((val) => val !== null, {
          message: "date is required",
      }),
  maintenanceType: z.enum(["repaired", "replaced"]).refine((val) => val !== undefined, {
    message: "Please select a maintenance type",
  }),
  replaceComponentType: z.enum(["new", "refurbished", "cannibalised", "duplicate"]).refine((val) => val !== undefined, {
    message: "Please select a component type",
  }),
  cannibalisedAge: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Must be a valid number",
  }),
  maintenanceDuration: z.string().min(1, "Maintenance duration is required"),
  remark: z.string().optional(),
});

type MaintenanceDataValues = z.infer<typeof maintenanceDataSchema>;


// Maintenance Data Component
export default function MaintenanceDataForm() {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
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

  const onSubmit = (data: MaintenanceDataValues) => {
    console.log("Maintenance Data Form Data:", data);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-black rounded-lg shadow-lg border border-black-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-medium mb-4 hover:opacity-70 transition-opacity text-black-100"
      >
        <span>Maintenance Data (Optional)</span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full px-4 py-2 bg-black border-black-700 text-black-100">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-black-700">
                    <SelectItem value="preventive" className="text-black-100">Preventive</SelectItem>
                    <SelectItem value="breakdown" className="text-black-100">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.eventType && (
              <p className="text-red-400 text-sm mt-1">{errors.eventType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-black-400 mb-1">Date</label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-black border-black-700 text-black-100 hover:bg-black hover:text-black-100"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span className="text-black-500">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black border-black-700">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      className="bg-black text-black-100"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
          </div>

          <div>
            <Controller
              name="maintenanceType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full px-4 py-2 bg-black border-black-700 text-black-100">
                    <SelectValue placeholder="Maintenance Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-black-700">
                    <SelectItem value="repaired" className="text-black-100">Repaired</SelectItem>
                    <SelectItem value="replaced" className="text-black-100">Replaced</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.maintenanceType && (
              <p className="text-red-400 text-sm mt-1">{errors.maintenanceType.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="replaceComponentType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full px-4 py-2 bg-black border-black-700 text-black-100">
                    <SelectValue placeholder="Replace Component Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-black-700">
                    <SelectItem value="new" className="text-black-100">New</SelectItem>
                    <SelectItem value="refurbished" className="text-black-100">Refurbished</SelectItem>
                    <SelectItem value="cannibalised" className="text-black-100">Cannibalised</SelectItem>
                    <SelectItem value="duplicate" className="text-black-100">Duplicate</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.replaceComponentType && (
              <p className="text-red-400 text-sm mt-1">{errors.replaceComponentType.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="cannibalisedAge"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Cannibalised Age"
                  className="w-full px-4 py-2 bg-black border-black-700 text-black-100 placeholder:text-black-500"
                  {...field}
                />
              )}
            />
            {errors.cannibalisedAge && (
              <p className="text-red-400 text-sm mt-1">{errors.cannibalisedAge.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="maintenanceDuration"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Maintenance Duration"
                  className="w-full px-4 py-2 bg-black border-black-700 text-black-100 placeholder:text-black-500"
                  {...field}
                />
              )}
            />
            {errors.maintenanceDuration && (
              <p className="text-red-400 text-sm mt-1">{errors.maintenanceDuration.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="remark"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Remark"
                  className="w-full px-4 py-2 bg-black border-black-700 text-black-100 placeholder:text-black-500 min-h-[100px]"
                  {...field}
                />
              )}
            />
            {errors.remark && <p className="text-red-400 text-sm mt-1">{errors.remark.message}</p>}
          </div>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-2 rounded-md"
          >
            SUBMIT
          </Button>
        </div>
      )}
    </div>
  );
}

