import { create } from 'zustand';
import { type UserSelectionData } from '@/actions/user_selection';

// Define the structure of an item in a group (e.g., ship or equipment)
interface GroupItem {
  value: string; // ID (UUID)
  label: string; // Human-readable name
}

// Define the structure of a group (e.g., "Western Naval Command")
interface Group {
  groupName: string;
  items: GroupItem[];
}

// Define the structure of equipment groups for a ship
type EquipmentGroups = Record<string, Group[]>;

// Define the store interface
interface UserSelectionStore {
  data: UserSelectionData | null;
  ships: Group[];
  equipment: EquipmentGroups;
  setData: (data: UserSelectionData) => void;
  getEquipmentForShip: (shipId: string) => Group[];
  getShipLabel: (shipId: string) => string;
  getEquipmentLabel: (shipId: string, equipmentId: string) => string;
}

export const useUserSelectionStore = create<UserSelectionStore>((set, get) => ({
  data: null,
  ships: [],
  equipment: {},

  // Set the data and update ships and equipment
  setData: (data: UserSelectionData) => {
    set({
      data,
      ships: data.ships,
      equipment: data.equipment,
    });
  },

  // Get equipment groups for a specific ship
  getEquipmentForShip: (shipId: string): Group[] => {
    const { equipment } = get();
    return equipment[shipId] || [];
  },

  // Get the label for a ship by its ID
  getShipLabel: (shipId: string): string => {
    const { ships } = get();
    for (const group of ships) {
      const ship = group.items.find((item: GroupItem) => item.value === shipId);
      if (ship) return ship.label;
    }
    return "Unknown Ship";
  },

  // Get the label for equipment by its ID and ship ID
  getEquipmentLabel: (shipId: string, equipmentId: string): string => {
    const { equipment } = get();
    const shipEquipmentGroups = equipment[shipId] || [];
    for (const group of shipEquipmentGroups) {
      const equipmentItem = group.items.find((item: GroupItem) => item.value === equipmentId);
      if (equipmentItem) return equipmentItem.label;
    }
    return "Unknown Equipment";
  },
}));
