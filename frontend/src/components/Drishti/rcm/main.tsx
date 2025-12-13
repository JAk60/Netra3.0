"use client";

import { useState, useEffect } from 'react';
import { Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york-v4/ui/tabs";
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { useShipSystemHierarchyStore } from "@/store/shipSystemHierarchyStore";

import SelectionView from './RCMviews/SelectionView';
import RCMAnalysis from "./RCMviews/rcm";
import StreamlinedPMForm from "./optimize/optimize";

interface AssemblyOption {
    value: string;
    label: string;
    parentEquipmentId: string;
}

export function RCMmainView() {
    // Shared selection state
    const [selectedShip, setSelectedShip] = useState('');
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
    const [selectedAssemblyIds, setSelectedAssemblyIds] = useState<string[]>([]);
    const [assemblyOptions, setAssemblyOptions] = useState<AssemblyOption[]>([]);

    // Stores
    const { ships, getEquipmentForShip, getShipLabel, getEquipmentLabel } = useUserSelectionStore();
    const { fetchComponentChildren } = useShipSystemHierarchyStore();

    const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];

    // Load assemblies when equipment changes
    useEffect(() => {
        if (!selectedShip || selectedEquipmentIds.length === 0) {
            setAssemblyOptions([]);
            setSelectedAssemblyIds([]);
            return;
        }

        (async () => {
            try {
                let merged: AssemblyOption[] = [];

                for (const eqId of selectedEquipmentIds) {
                    const hierarchy = await fetchComponentChildren(eqId, selectedShip);
                    const children = hierarchy.children || [];

                    const opts = children.map((child: any) => ({
                        value: child.component_id,
                        label: `${child.component_name} (${child.nomenclature})`,
                        parentEquipmentId: eqId
                    }));

                    merged = [...merged, ...opts];
                }

                const unique = merged.filter(
                    (item, index, arr) =>
                        arr.findIndex(o => o.value === item.value) === index
                );

                setAssemblyOptions(unique);
            } catch (err) {
                console.error("Error loading assemblies", err);
            }
        })();
    }, [selectedEquipmentIds, selectedShip, fetchComponentChildren]);

    // Selection handlers
    const handleShipChange = (id: string) => {
        setSelectedShip(id);
        setSelectedEquipmentIds([]);
        setSelectedAssemblyIds([]);
        setAssemblyOptions([]);
    };

    const handleEquipmentChange = (values: string[]) => {
        setSelectedEquipmentIds(values);
        setSelectedAssemblyIds([]);
    };

    const handleAssemblyChange = (values: string[]) => setSelectedAssemblyIds(values);

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Shared Selection View */}
            <SelectionView
                ships={ships}
                selectedShip={selectedShip}
                selectedEquipmentIds={selectedEquipmentIds}
                selectedAssemblyIds={selectedAssemblyIds}
                equipmentGroups={equipmentGroups}
                assemblyOptions={assemblyOptions}
                onShipChange={handleShipChange}
                onEquipmentChange={handleEquipmentChange}
                onAssemblyChange={handleAssemblyChange}
                onStartAnalysis={() => {}} // No action needed here since tabs handle their own logic
            />

            {/* Tabs for different workflows */}
            <Tabs defaultValue="rcm" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="rcm" className="w-full">
                        <Activity className="w-4 h-4 mr-2" />
                        RCM Analysis
                    </TabsTrigger>
                    <TabsTrigger value="optimize" className="w-full">
                        <Activity className="w-4 h-4 mr-2" />
                        Optimize PM
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="rcm" className="w-full">
                    <RCMAnalysis 
                        selectedShip={selectedShip}
                        selectedEquipmentIds={selectedEquipmentIds}
                        selectedAssemblyIds={selectedAssemblyIds}
                        assemblyOptions={assemblyOptions}
                        equipmentGroups={equipmentGroups}
                    />
                </TabsContent>
                
                <TabsContent value="optimize" className="w-full">
                    <StreamlinedPMForm 
                        selectedShip={selectedShip}
                        selectedEquipmentIds={selectedEquipmentIds}
                        selectedAssemblyIds={selectedAssemblyIds}
                        assemblyOptions={assemblyOptions}
                        equipmentGroups={equipmentGroups}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}