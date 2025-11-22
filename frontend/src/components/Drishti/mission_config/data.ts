export const MOCK_SHIP_DATA = {
  "33f13701-849f-4030-8d71-a0f65eac992e": {
    ship_name: "INS Vikrant",
    systems: {
      propulsion: {
        system_id: "64044bde-5b46-4ab3-b44d-2d140833284b",
        components: [
          { component_id: "5358d044-9f4f-44cf-a975-341221f7189d", nomenclature: "GT 1", component_name: "Gas Turbine" },
          { component_id: "da570729-9a1e-4fa1-8399-e21c93c46e8f", nomenclature: "GT 2", component_name: "Gas Turbine" },
          { component_id: "ab055ca1-2aa1-4c55-a1b1-39ead450a131", nomenclature: "GT 3", component_name: "Gas Turbine" },
          { component_id: "8e7c0c15-f44e-42be-bbf4-e04a62fc242e", nomenclature: "GT 4", component_name: "Gas Turbine" }
        ]
      },
      power_generation: {
        system_id: "017bdf6b-d9f2-4f31-869d-842ad61a9627",
        components: [
          { component_id: "443360a0-6218-486b-a34c-1813963177b7", nomenclature: "GTG 1", component_name: "Generator" },
          { component_id: "c652b6b3-9d13-4e4d-833e-dd71aecd102b", nomenclature: "GTG 2", component_name: "Generator" },
          { component_id: "5eefd3c9-cbe0-48db-a43d-89247f46ed8a", nomenclature: "GTG 3", component_name: "Generator" },
          { component_id: "1872dfb4-58f9-48d4-a713-953cd7e1048a", nomenclature: "GTG 4", component_name: "Generator" }
        ]
      },
      support: {
        system_id: "6b3a59eb-4cc2-4480-b512-9357aed35540",
        components: [
          { component_id: "d10aa05d-1f80-436d-b612-f52e28c44676", nomenclature: "AC 1", component_name: "Air Conditioner" },
          { component_id: "73e87156-1ff9-494e-9f7f-f0fdad5f4a20", nomenclature: "AC 2", component_name: "Air Conditioner" },
          { component_id: "73c2a73c-0e92-4742-9775-af95e89e1841", nomenclature: "AC 3", component_name: "Air Conditioner" },
          { component_id: "38093be3-acb7-40db-80ec-542dfc8d5d7d", nomenclature: "AC 4", component_name: "Air Conditioner" },
          { component_id: "6493cf2d-16e8-4d8f-b25c-a700e2c184b0", nomenclature: "AC 5", component_name: "Air Conditioner" },
          { component_id: "308804ec-bca2-45e9-b665-515de88ffa70", nomenclature: "AC 6", component_name: "Air Conditioner" }
        ]
      },
      firing: {
        system_id: "a2b3e95b-c3b8-43ce-af79-eb445794f7ab",
        components: [
          { component_id: "db30946a-2baf-49e4-9ceb-ec72365089b4", nomenclature: "SRGM 1", component_name: "Super Rapid Gun Mount" },
          { component_id: "1c16dacf-69cd-4061-b004-113d85948c61", nomenclature: "BrahMos", component_name: "Missile" }
        ]
      }
    }
  }
};
export interface PhaseConfig {
  phase_number: number;
  phase_name: string;
  k: number;
  n: number;
}

export interface SystemConfig {
  system_id: string;
  selected_equipment: any[];
  phases: PhaseConfig[];
}

export interface Config {
  id: string;
  config_name: string;
  ship_id: string;
  ship_name: string;
  created_date: string;
  modified_date: string;
  configuration: {
    propulsion?: SystemConfig;
    power_generation?: SystemConfig;
    support?: SystemConfig;
    firing?: SystemConfig;
  };
}

// Types
export type ViewMode = 'list' | 'create' | 'edit' | 'view';

// Glassmorphism utility classes
export const glassCard = "bg-slate-900/75 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl";
export const glassInput = "bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50";
