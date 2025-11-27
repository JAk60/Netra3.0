"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { shipSelectionSchema, type ShipSelectionFormValues } from "@/types/Schema/Mission_config_schema"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/registry/new-york-v4/ui/form"
import GroupedCombobox from "@/registry/new-york-v4/ui/combo-box"
import { ArrowRight } from "lucide-react"

interface ShipSelectionStepProps {
  shipGroups: any[] // Array of ship groups from useUserSelectionStore
  selectedShipId: string
  onNext: (shipId: string) => void
}

export function ShipSelectionStep({ shipGroups, selectedShipId, onNext }: ShipSelectionStepProps) {
  const form = useForm<ShipSelectionFormValues>({
    resolver: zodResolver(shipSelectionSchema),
    defaultValues: {
      ship_id: selectedShipId,
    },
  })

  const handleSubmit = (values: ShipSelectionFormValues) => {
    onNext(values.ship_id)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="ship_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-gray-300">Select Ship</FormLabel>
              <FormControl>
                <GroupedCombobox
                  label=""
                  placeholder={shipGroups.length === 0 ? "Loading ships..." : "Choose a ship..."}
                  groups={shipGroups}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={shipGroups.length === 0}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={!form.watch("ship_id")}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
        >
          Next <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>
    </Form>
  )
}