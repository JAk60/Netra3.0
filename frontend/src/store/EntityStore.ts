// types.ts

export interface Ship {
  ship_id: string;
  ship_name: string;
  ship_category: string;
  ship_class: string;
  command: string;
  created_date: string;
  modified_date: string;
}

export interface SystemConfiguration {
  id: string;
  name: string;
  shipId: string;
}

export interface Sensor {
  id: string;
  name: string;
  systemConfigurationId: string;
}

// store/entityStore.ts

import { create } from 'zustand';
import { Ship, SystemConfiguration, Sensor } from '../types';

interface EntityStore {
  ships: Record<string, Ship>;
  systemConfigurations: Record<string, SystemConfiguration>;
  sensors: Record<string, Sensor>;

  // Ship actions
  addShip: (ship: Ship) => void;
  removeShip: (id: string) => void;
  updateShip: (ship: Ship) => void;

  // System Configuration actions
  addSystemConfiguration: (systemConfiguration: SystemConfiguration) => void;
  removeSystemConfiguration: (id: string) => void;
  updateSystemConfiguration: (systemConfiguration: SystemConfiguration) => void;

  // Sensor actions
  addSensor: (sensor: Sensor) => void;
  removeSensor: (id: string) => void;
  updateSensor: (sensor: Sensor) => void;
}

export const useEntityStore = create<EntityStore>((set) => ({
  ships: {},
  systemConfigurations: {},
  sensors: {},

  // SHIP actions
  addShip: (ship) =>
    set((state) => ({
      ships: { ...state.ships, [ship.ship_id]: ship },
    })),
  removeShip: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.ships;
      return { ships: rest };
    }),
  updateShip: (ship) =>
    set((state) => ({
      ships: { ...state.ships, [ship.ship_id]: ship },
    })),

  // SYSTEM CONFIGURATION actions
  addSystemConfiguration: (systemConfiguration) =>
    set((state) => ({
      systemConfigurations: { 
        ...state.systemConfigurations, 
        [systemConfiguration.id]: systemConfiguration 
      },
    })),
  removeSystemConfiguration: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.systemConfigurations;
      return { systemConfigurations: rest };
    }),
  updateSystemConfiguration: (systemConfiguration) =>
    set((state) => ({
      systemConfigurations: { 
        ...state.systemConfigurations, 
        [systemConfiguration.id]: systemConfiguration 
      },
    })),

  // SENSOR actions
  addSensor: (sensor) =>
    set((state) => ({
      sensors: { ...state.sensors, [sensor.id]: sensor },
    })),
  removeSensor: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.sensors;
      return { sensors: rest };
    }),
  updateSensor: (sensor) =>
    set((state) => ({
      sensors: { ...state.sensors, [sensor.id]: sensor },
    })),
}));