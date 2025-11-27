"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { phaseConfigSchema, type PhaseConfigFormValues } from "@/types/Schema/Mission_config_schema"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/registry/new-york-v4/ui/form"
import type { Phase } from "@/types/mission_config"

interface PhaseConfigurationStepProps {
  phases: Phase[]
  onNext: (phases: Phase[]) => void
  onBack: () => void
}

export function PhaseConfigurationStep({ phases, onNext, onBack }: PhaseConfigurationStepProps) {
  const form = useForm<PhaseConfigFormValues>({
    resolver: zodResolver(phaseConfigSchema),
    defaultValues: {
      phase_count: phases.length,
      phases: phases,
    },
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "phases",
  })

  const phaseCount = form.watch("phase_count")

  // Update phases array when count changes
  const handlePhaseCountChange = (count: number) => {
    const newPhases = Array.from({ length: count }, (_, i) => ({
      phase_number: i + 1,
      phase_name: phases[i]?.phase_name || "",
    }))
    replace(newPhases)
  }

  const handleSubmit = (values: PhaseConfigFormValues) => {
    onNext(values.phases)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phase_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-gray-300">Number of Phases</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1
                    field.onChange(value)
                    handlePhaseCountChange(value)
                  }}
                  className="bg-[#3c3c3c] border-gray-700 text-xs text-gray-200 focus:border-purple-500"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel className="text-xs font-medium text-gray-300">Phase Names</FormLabel>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`phases.${index}.phase_name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`Phase ${index + 1} name`}
                      className="bg-[#3c3c3c] border-gray-700 text-xs text-gray-200 placeholder-gray-500 focus:border-purple-500"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
          >
            Next →
          </Button>
        </div>
      </form>
    </Form>
  )
}