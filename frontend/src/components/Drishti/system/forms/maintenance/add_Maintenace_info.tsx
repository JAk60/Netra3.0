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

interface MaintenanceInfoProps {
    onSave?: (data: {
        preventiveApplicable: string;
        shipStaffReplaceable: string;
        parametersRecorded: string;
    }) => void;
}

export default function MaintenanceInformation({ onSave }: MaintenanceInfoProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [preventiveApplicable, setPreventiveApplicable] = useState("");
    const [shipStaffReplaceable, setShipStaffReplaceable] = useState("");
    const [parametersRecorded, setParametersRecorded] = useState("");

    const handleSave = () => {
        const data = {
            preventiveApplicable,
            shipStaffReplaceable,
            parametersRecorded,
        };

        console.log("Maintenance Info Saved:", data);
        onSave?.(data);
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
                        <Select
                            value={preventiveApplicable}
                            onValueChange={setPreventiveApplicable}
                        >
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
                        <Select
                            value={shipStaffReplaceable}
                            onValueChange={setShipStaffReplaceable}
                        >
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
                        <Select
                            value={parametersRecorded}
                            onValueChange={setParametersRecorded}
                        >
                            <SelectTrigger id="parameters" className="w-full bg-black border-gray-700 text-gray-100">
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-gray-700">
                                <SelectItem value="Yes" className="text-gray-100">Yes</SelectItem>
                                <SelectItem value="No" className="text-gray-100">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={
                                !preventiveApplicable ||
                                !shipStaffReplaceable ||
                                !parametersRecorded
                            }
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Maintenance Info
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}