import React, { useState } from "react";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Label } from "@/registry/new-york-v4/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { createMaintenanceConfig } from "@/actions/system/additional_info";

interface MaintenanceInfoProps {
  componentId: string;
}

export default function MaintenanceInformation({ componentId }: MaintenanceInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pmApplicable, setPmApplicable] = useState("");
  const [shipStaffReplaceable, setShipStaffReplaceable] = useState("");
  const [parametersRecorded, setParametersRecorded] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!componentId) {
      toast.error("No component selected.");
      return;
    }

    setIsSubmitting(true);
    const result = await createMaintenanceConfig({
      component_id: componentId,
      pm_applicable: pmApplicable,
      can_be_replaced_by_ship_staff: shipStaffReplaceable,
      is_system_param_recorded: parametersRecorded,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Maintenance configuration saved.");
      // reset
      setPmApplicable("");
      setShipStaffReplaceable("");
      setParametersRecorded("");
      setIsExpanded(false);
    } else {
      toast.error(result.error ?? "Failed to save maintenance configuration.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-black rounded-lg shadow-lg border border-gray-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-medium mb-4 hover:opacity-70 transition-opacity text-gray-100"
      >
        <span>Maintenance Information</span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="space-y-6">
          {/* Preventive Maintenance */}
          <div className="space-y-2">
            <Label htmlFor="preventive" className="text-base text-gray-300">
              Preventive Maintenance Applicable
            </Label>
            <Select value={pmApplicable} onValueChange={setPmApplicable}>
              <SelectTrigger id="preventive" className="w-full bg-black border-gray-700 text-gray-100">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                <SelectItem value="Yes" className="text-gray-100">Yes</SelectItem>
                <SelectItem value="No" className="text-gray-100">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ship Staff Replaceable */}
          <div className="space-y-2">
            <Label htmlFor="replaceable" className="text-base text-gray-300">
              Can it be replaced by ship staff?
            </Label>
            <Select value={shipStaffReplaceable} onValueChange={setShipStaffReplaceable}>
              <SelectTrigger id="replaceable" className="w-full bg-black border-gray-700 text-gray-100">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                <SelectItem value="Yes" className="text-gray-100">Yes</SelectItem>
                <SelectItem value="No" className="text-gray-100">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parameters Recorded */}
          <div className="space-y-2">
            <Label htmlFor="parameters" className="text-base text-gray-300">
              Are System Parameters Recorded?
            </Label>
            <Select value={parametersRecorded} onValueChange={setParametersRecorded}>
              <SelectTrigger id="parameters" className="w-full bg-black border-gray-700 text-gray-100">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                <SelectItem value="Yes" className="text-gray-100">Yes</SelectItem>
                <SelectItem value="No" className="text-gray-100">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={
                isSubmitting ||
                !pmApplicable ||
                !shipStaffReplaceable ||
                !parametersRecorded
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving…" : "Save Maintenance Info"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}