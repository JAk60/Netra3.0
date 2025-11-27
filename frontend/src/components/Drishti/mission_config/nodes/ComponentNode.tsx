// components/nodes/ComponentNode.tsx
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Ship, Zap, Settings, Target, Check } from "lucide-react"

// Ship Node Component
export function ShipNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="relative">
      <div className="bg-[#1e1e1e] border-2 border-blue-500 rounded-lg p-4 min-w-[140px]">
        <div className="flex flex-col items-center gap-2">
          <Ship className="w-8 h-8 text-blue-400" />
          <div className="text-white font-semibold text-sm text-center">{data.label}</div>
          <div className="text-[10px] text-gray-400 uppercase">WARSHIP</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  )
}

// System Node Component
export function SystemNode({ data }: NodeProps<{ label: string; count: number; systemKey: string }>) {
  const getIcon = () => {
    switch (data.systemKey) {
      case "propulsion":
        return <Zap className="w-5 h-5" />
      case "power_generation":
        return <Zap className="w-5 h-5" />
      case "support":
        return <Settings className="w-5 h-5" />
      case "firing":
        return <Target className="w-5 h-5" />
      default:
        return <Settings className="w-5 h-5" />
    }
  }

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-600 border-2 border-white"
      />
      <div className="bg-[#2a2a2a] border-2 border-gray-600 rounded-lg p-3 min-w-[120px]">
        <div className="flex flex-col items-center gap-1">
          <div className="text-gray-400">{getIcon()}</div>
          <div className="text-[10px] text-gray-500 uppercase">SYSTEM</div>
          <div className="text-white font-semibold text-sm">{data.label}</div>
          <div className="text-[10px] text-gray-400">{data.count} units</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-600 border-2 border-white"
      />
    </div>
  )
}

// Component Node Component
export function ComponentNode({ data }: NodeProps<{ nomenclature: string; type: string; selected: boolean; kn: { k: number; n: number } | null }>) {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-600 border-2 border-white"
      />
      <div className={`bg-[#2a2a2a] border-2 rounded-lg p-3 min-w-[140px] ${
        data.selected ? "border-green-500" : "border-gray-600"
      }`}>
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 uppercase mb-0.5">{data.type}</div>
              <div className="text-white font-semibold text-sm">{data.nomenclature}</div>
            </div>
            {data.selected && (
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
          </div>
          {data.kn && (
            <div className="text-xs text-yellow-400 mt-1">
              K={data.kn.k} / N={data.kn.n}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Export node types for ReactFlow
export const nodeTypes = {
  ship: ShipNode,
  system: SystemNode,
  component: ComponentNode,
}