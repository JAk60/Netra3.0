import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Ship, Settings, Target, Check, Box, Fuel, Wrench, Crosshair, Zap, Fan, Wind, Rocket, BatteryCharging } from "lucide-react"

// ---------------- SHIP NODE ----------------
export function ShipNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="relative group">
      <div className="bg-[#1e1e1e] border-2 border-blue-500 rounded-lg p-4 min-w-[140px]">
        <div className="flex flex-col items-center gap-2">
          <Ship className="w-8 h-8 text-blue-400" />
          <div className="text-white font-semibold">{data.label}</div>
        </div>
      </div>

      {/* ↓ FLOW DOWNWARDS */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  )
}

// ---------------- SYSTEM NODE ----------------
export function SystemNode({ data }: NodeProps<any>) {

  // Select icons based on system type
  const getSystemIcon = () => {
    switch (data.label) {
      case "propulsion":
        return <Fuel className="w-8 h-8 text-blue-400" />
      case "power_generation":
        return <Zap className="w-8 h-8 text-yellow-400" />
      case "support":
        return <Wrench className="w-8 h-8 text-green-400" />
      case "firing":
        return <Crosshair className="w-8 h-8 text-red-400" />
      default:
        return <Ship className="w-8 h-8 text-gray-400" />
    }
  }

  return (
    <div className="relative group">

      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-600 border-2 border-white"
      />

      <div className="bg-[#1e1e1e] border-2 border-blue-500 rounded-lg p-4 min-w-[140px]">
        <div className="flex flex-col items-center gap-2">

          {/* Dynamic Icon */}
          {getSystemIcon()}

          {/* System label */}
          <div className="text-white text-sm font-semibold">
            {data.label}
          </div>

        </div>
      </div>

      {/* Outgoing handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-600 border-2 border-white"
      />
    </div>
  )
}


// ---------------- COMPONENT NODE ----------------
export function ComponentNode({ data }: NodeProps<any>) {
  console.log("basic data", { data })

  const getComponentIcon = () => {
    switch (data.type) {

      // Gas Turbine (Propulsion)
      case "propulsion":
        return <Fan className="w-8 h-8 text-blue-400" />;

      // ACS (Support)
      case "support":
        return <Wind className="w-8 h-8 text-green-400" />;

      // Firing (SRGM / Missile)
      case "firing":
        return <Rocket className="w-8 h-8 text-red-400" />;

      // GTGS (Power generation)
      case "power_generation":
        return <BatteryCharging className="w-8 h-8 text-yellow-400" />;

      // Fallback icon
      default:
        return <Ship className="w-8 h-8 text-gray-300" />;
    }
  };

  // Determine border styling based on beta value
  const getBorderClass = () => {
    const beta = data.metadata?.beta;
    if (beta == null) return "border-blue-500 border-2";

    if (beta >= 2) {
      return "border-blue-500 border-2";
    } else if (beta >= 1 && beta < 2) {
      return "border-orange-500 border-2";
    } else {
      return "node-blinking-red";
    }
  };

  return (
    <div className="relative group">
      {/* Add inline styles for the blinking animation */}
      <style>{`
        @keyframes blink-red-border {
          0%, 100% { 
            border-color: #ef4444;
            border-width: 3px;
            opacity: 1;
          }
          50% { 
            border-color: #ff7777;
            border-width: 5px;
            opacity: 0.5;
          }
        }
        
        @keyframes tada {
          0% { transform: scale(1); }
          10%, 20% { transform: scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
          40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }
        
        .node-blinking-red {
          border-style: solid;
          animation: blink-red-border 1s infinite alternate, tada 1s ease-in-out infinite;
        }
      `}</style>

      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-green-600 border-2 border-white"
      />

      {/* Card */}
      <div className={`bg-[#1e1e1e] ${getBorderClass()} rounded-lg p-4 min-w-[140px]`}>
        <div className="flex flex-col items-center gap-2">

          {/* Component Icon */}
          {getComponentIcon()}

          {/* Component Label */}
          <div className="text-white font-semibold">
            {data.nomenclature}
          </div>

        </div>
      </div>

      {/* Outgoing handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-600 border-2 border-white"
      />
    </div>
  );
}
// ---------------- SUB COMPONENT NODE ----------------
export function SubComponentNode({ data }) {

  return (
    <div className="relative group">
      {/* ↑ incoming */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-600 border-2 border-white"
      />

      <div className="bg-[#1e1e1e] border-2 border-blue-500 rounded-lg p-4 min-w-[140px]">
        <div className="flex flex-col items-center gap-2">
          <Wind className="w-8 h-8 text-blue-400" />
        <div className="text-white text-xs">{data.label}</div>
        </div>
      </div>
    </div>
  )
}

export const seeSystemnodeTypes = {
  ship: ShipNode,
  system: SystemNode,
  component: ComponentNode,
  subcomponent: SubComponentNode,
};
