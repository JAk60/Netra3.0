// components/nodes/ComponentNode.tsx
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Ship, Zap, Settings, Target, Check, Box } from "lucide-react"

// Ship Node Component
export function ShipNode({ data }: NodeProps<{ label: string; shipName?: string }>) {
  return (
    <div className="relative group">
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

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
          <div className="font-semibold">{data.shipName || data.label}</div>
          <div className="text-gray-400 mt-1">Naval Vessel</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// System Node Component
export function SystemNode({ data }: NodeProps<{ label: string; count: number; systemKey: string; shipName?: string }>) {
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

  const getSystemName = () => {
    return data.label.replace(/_/g, ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="relative group">
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

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[180px]">
          {data.shipName && (
            <div className="font-semibold mb-2 pb-2 border-b border-gray-700">
              {data.shipName}
            </div>
          )}
          <div className="mb-1">
            <span className="text-gray-400">System:</span> {getSystemName()}
          </div>
          <div>
            <span className="text-gray-400">Components:</span> {data.count}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component Node Component
export function ComponentNode({ data }: NodeProps<{
  nomenclature: string
  type: string
  selected: boolean
  kn: { k: number; n: number } | null
  shipName?: string
  name?: string
  phases?: Array<{
    phase_name: string
    phase_number?: number
    sequence_order?: number
    k: number
    n: number
    duration_hours?: number
  }>
  systemType?: string
}>) {
  // Use phases array if available, otherwise fall back to single kn value
  const hasPhases = data.phases && Array.isArray(data.phases) && data.phases.length > 0
  const hasSingleKn = data.kn && typeof data.kn.k === 'number' && typeof data.kn.n === 'number'

  // Display K/N on the node (show first phase if multiple)
  const displayK = hasPhases ? data.phases[0].k : data.kn?.k
  const displayN = hasPhases ? data.phases[0].n : data.kn?.n
  const hasKnConfig = typeof displayK === 'number' && typeof displayN === 'number'

  return (
    <div className="relative group">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-600 border-2 border-white"
      />
      <div className={`bg-[#2a2a2a] border-2 rounded-lg p-3 min-w-[140px] ${data.selected ? "border-green-500" : "border-gray-600"
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
          {/* {hasKnConfig && (
            <div className="text-xs text-yellow-400 mt-1">
              K={displayK} / N={displayN}
            </div>
          )} */}
        </div>
      </div>

      {/* Enhanced Tooltip with Phase-wise K/N */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[240px] max-w-[320px]">
          {/* Ship Name */}
          {data.shipName && (
            <div className="font-semibold mb-2 pb-2 border-b border-gray-700">
              {data.shipName}
            </div>
          )}

          {/* Equipment Name */}
          <div className="mb-1">
            <span className="text-gray-400">Equipment:</span> {data.name || data.nomenclature}
          </div>

          {/* Nomenclature (if different from name) */}
          {data.name && data.name !== data.nomenclature && (
            <div className="mb-1">
              <span className="text-gray-400">Nomenclature:</span> {data.nomenclature}
            </div>
          )}

          {/* System Type */}
          {(data.type || data.systemType) && (
            <div className="mb-1">
              <span className="text-gray-400">System:</span>{" "}
              <span className="capitalize">{(data.type || data.systemType)?.replace(/_/g, ' ')}</span>
            </div>
          )}

          {/* K/N Configuration by Phase */}
          {hasPhases ? (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="font-semibold mb-2 text-yellow-400">K/N Configuration by Phase</div>
              <div className="space-y-2">
                {data.phases!.map((phase, index) => (
                  <div key={index} className="bg-gray-800 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">
                        {phase.phase_name}
                        {typeof phase.sequence_order === 'number' && (
                          <span className="text-gray-500 ml-1">#{phase.sequence_order + 1}</span>
                        )}
                      </span>
                      {phase.duration_hours && (
                        <span className="text-gray-400 text-[10px]">
                          {phase.duration_hours}h
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">K:</span>
                        <span className="font-mono text-yellow-400 font-semibold">{phase.k}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">N:</span>
                        <span className="font-mono text-yellow-400 font-semibold">{phase.n}</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-500 mt-1">
                      {phase.k} of {phase.n} required operational
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : hasSingleKn ? (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="font-semibold mb-1 text-yellow-400">K/N Configuration</div>
              <div className="flex gap-4 mb-1">
                <div>
                  <span className="text-gray-400">K:</span>{" "}
                  <span className="font-mono text-yellow-400">{data.kn!.k}</span>
                </div>
                <div>
                  <span className="text-gray-400">N:</span>{" "}
                  <span className="font-mono text-yellow-400">{data.kn!.n}</span>
                </div>
              </div>
              <div className="text-[10px] text-gray-400">
                ({data.kn!.k} of {data.kn!.n} required operational)
              </div>
            </div>
          ) : null}

          {/* Selection Status */}
          {data.selected && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="flex items-center gap-1 text-green-400">
                <Check className="w-3 h-3" />
                <span className="text-[10px]">Selected for Configuration</span>
              </div>
            </div>
          )}

          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SubComponentNode = ({ data }) => (
  <div className="relative group">
    <Handle
      type="target"
      position={Position.Top}
      className="w-3 h-3 bg-purple-600 border-2 border-white"
    />
    <div className="bg-[#2a2a2a] border-2 border-purple-500 rounded-lg p-2 min-w-[120px] shadow-sm">
      <div className="flex flex-col items-center gap-1">
        <Box className="w-4 h-4 text-purple-400" />
        <div className="text-[9px] text-gray-500 uppercase">Sub-Component</div>
        <div className="text-white font-medium text-xs text-center">{data.label}</div>
      </div>
    </div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-2xl whitespace-nowrap">
        <div className="font-semibold">{data.label}</div>
        <div className="text-gray-400 mt-1">Sub-Component</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  </div>
);

export const nodeTypes = {
  ship: ShipNode,
  system: SystemNode,
  component: ComponentNode,
  subcomponent: SubComponentNode,
};