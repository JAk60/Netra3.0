// components/nodes/ComponentNode.tsx
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Ship, Zap, Settings, Target, Check, Box, X } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = {
  phase_name: string
  phase_number?: number
  sequence_order?: number
  k: number
  n: number
  duration_hours?: number
}
type ShipNodeData = { label: string; shipName?: string }
type SystemNodeData = { label: string; count: number; systemKey: string; shipName?: string }
type ComponentNodeData = {
  nomenclature: string; type: string; selected: boolean
  kn: { k: number; n: number } | null
  shipName?: string; name?: string; phases?: Phase[]; systemType?: string
}
type SubComponentNodeData = { label: string }

// ─── Popover coords ───────────────────────────────────────────────────────────

interface PopoverCoords {
  x: number        // fixed left
  y: number        // fixed top
  placement: "above" | "below"
  arrowLeft: number // px offset for arrow within the box
}

const POPOVER_W = 270
const MARGIN = 8

function calcCoords(anchor: HTMLElement): PopoverCoords {
  const r = anchor.getBoundingClientRect()
  const vh = window.innerHeight

  // Estimate height for placement decision (real height unknown yet, use 200px guess)
  const estimatedH = 200
  const spaceAbove = r.top
  const spaceBelow = vh - r.bottom
  const placement = spaceAbove >= estimatedH + 12 || spaceAbove >= spaceBelow ? "above" : "below"

  // X: center on anchor, clamp to viewport
  const idealX = r.left + r.width / 2 - POPOVER_W / 2
  const x = Math.max(MARGIN, Math.min(idealX, window.innerWidth - POPOVER_W - MARGIN))

  // Arrow offset relative to popover box (so it always points at the anchor center)
  const arrowLeft = Math.max(12, Math.min(r.left + r.width / 2 - x, POPOVER_W - 12))

  // Y: position below or above — for "above" we'll shift up after measuring height,
  // but we give a safe initial value of just below so there's never an off-screen flash
  const y = placement === "above"
    ? Math.max(MARGIN, r.top - estimatedH - 12)
    : r.bottom + 12

  return { x, y, placement, arrowLeft }
}

// ─── Portal Popover ───────────────────────────────────────────────────────────

interface PortalPopoverProps {
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

function PortalPopover({ anchorRef, open, onClose, children }: PortalPopoverProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<PopoverCoords | null>(null)
  // Track real y after measuring actual height
  const [finalY, setFinalY] = useState<number | null>(null)

  // Calculate on open — synchronous, before any paint
  useEffect(() => {
    if (!open || !anchorRef.current) { setCoords(null); setFinalY(null); return }
    setCoords(calcCoords(anchorRef.current))
    setFinalY(null)
  }, [open]) // eslint-disable-line

  // After box is painted, correct Y using real height (only for "above")
  useEffect(() => {
    if (!coords || finalY !== null || !boxRef.current || !anchorRef.current) return
    if (coords.placement === "above") {
      const realH = boxRef.current.getBoundingClientRect().height
      const r = anchorRef.current.getBoundingClientRect()
      setFinalY(Math.max(MARGIN, r.top - realH - 12))
    } else {
      setFinalY(coords.y)
    }
  }) // run every render until finalY is set

  // Outside click closes — useCapture:true bypasses React Flow's event stopping
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        boxRef.current?.contains(e.target as Node) ||
        anchorRef.current?.contains(e.target as Node)
      ) return
      onClose()
    }
    const id = setTimeout(() => document.addEventListener("mousedown", handler, true), 0)
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler, true) }
  }, [open, onClose]) // eslint-disable-line

  if (!open || !coords || typeof document === "undefined") return null

  const visible = finalY !== null
  const top = finalY ?? coords.y

  return createPortal(
    <div
      ref={boxRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        left: coords.x,
        top,
        width: POPOVER_W,
        zIndex: 99999,
        // Hide only on the very first render before we know real height — no jump
        opacity: visible ? 1 : 0,
        transition: "opacity 0.12s ease",
        pointerEvents: "all",
      }}
    >
      <div className="bg-gray-900 border border-gray-700 text-white text-xs rounded-xl px-3 py-3 shadow-2xl relative">
        <button
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        {children}

        {/* Arrow — always points at anchor center */}
        <div
          style={{ position: "absolute", left: coords.arrowLeft, transform: "translateX(-50%)" }}
          className={coords.placement === "above" ? "top-full" : "bottom-full"}
        >
          {coords.placement === "above"
            ? <div className="border-4 border-transparent border-t-gray-900 -mt-px" />
            : <div className="border-4 border-transparent border-b-gray-900 mb-[-1px]" />
          }
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── usePopover ───────────────────────────────────────────────────────────────

function usePopover() {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close = useCallback(() => setOpen(false), [])
  return { ref, open, toggle, close }
}

// ─── Ship Node ────────────────────────────────────────────────────────────────

export function ShipNode({ data }: NodeProps<ShipNodeData>) {
  const { ref, open, toggle, close } = usePopover()
  return (
    <div ref={ref} onClick={toggle} className="cursor-pointer">
      <div className={`bg-[#1e1e1e] border-2 rounded-lg p-4 min-w-[140px] transition-colors ${open ? "border-blue-300" : "border-blue-500"}`}>
        <div className="flex flex-col items-center gap-2">
          <Ship className="w-8 h-8 text-blue-400" />
          <div className="text-white font-semibold text-sm text-center">{data.label}</div>
          <div className="text-[10px] text-gray-400 uppercase">WARSHIP</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <PortalPopover anchorRef={ref} open={open} onClose={close}>
        <div className="font-semibold pr-4">{data.shipName ?? data.label}</div>
        <div className="text-gray-400 mt-1">Naval Vessel</div>
      </PortalPopover>
    </div>
  )
}

// ─── System Node ──────────────────────────────────────────────────────────────

export function SystemNode({ data }: NodeProps<SystemNodeData>) {
  const { ref, open, toggle, close } = usePopover()

  const getIcon = () => {
    switch (data.systemKey) {
      case "propulsion": case "power_generation": return <Zap className="w-5 h-5" />
      case "support": return <Settings className="w-5 h-5" />
      case "firing": return <Target className="w-5 h-5" />
      default: return <Settings className="w-5 h-5" />
    }
  }
  const getSystemName = () =>
    data.label.replace(/_/g, " ").split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

  return (
    <div ref={ref} onClick={toggle} className="cursor-pointer">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-600 border-2 border-white" />
      <div className={`bg-[#2a2a2a] border-2 rounded-lg p-3 min-w-[120px] transition-colors ${open ? "border-gray-400" : "border-gray-600"}`}>
        <div className="flex flex-col items-center gap-1">
          <div className="text-gray-400">{getIcon()}</div>
          <div className="text-[10px] text-gray-500 uppercase">SYSTEM</div>
          <div className="text-white font-semibold text-sm">{data.label}</div>
          <div className="text-[10px] text-gray-400">{data.count} units</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-600 border-2 border-white" />
      <PortalPopover anchorRef={ref} open={open} onClose={close}>
        {data.shipName && <div className="font-semibold mb-2 pb-2 border-b border-gray-700 pr-4">{data.shipName}</div>}
        <div className="mb-1"><span className="text-gray-400">System:</span> {getSystemName()}</div>
        <div><span className="text-gray-400">Components:</span> {data.count}</div>
      </PortalPopover>
    </div>
  )
}

// ─── Component Node ───────────────────────────────────────────────────────────

export function ComponentNode({ data }: NodeProps<ComponentNodeData>) {
  const { ref, open, toggle, close } = usePopover()
  const hasPhases = Array.isArray(data.phases) && data.phases.length > 0
  const hasSingleKn = data.kn != null && typeof data.kn.k === "number" && typeof data.kn.n === "number"

  return (
    <div ref={ref} onClick={toggle} className="cursor-pointer">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-600 border-2 border-white" />
      <div className={`bg-[#2a2a2a] border-2 rounded-lg p-3 min-w-[140px] transition-colors ${
        data.selected ? (open ? "border-green-300" : "border-green-500") : (open ? "border-gray-400" : "border-gray-600")
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 uppercase mb-0.5">{data.type}</div>
            <div className="text-white font-semibold text-sm">{data.nomenclature}</div>
          </div>
          {data.selected && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
        </div>
      </div>
      <PortalPopover anchorRef={ref} open={open} onClose={close}>
        {data.shipName && <div className="font-semibold mb-2 pb-2 border-b border-gray-700 pr-4">{data.shipName}</div>}
        <div className="mb-1"><span className="text-gray-400">Equipment:</span> {data.name ?? data.nomenclature}</div>
        {data.name && data.name !== data.nomenclature && (
          <div className="mb-1"><span className="text-gray-400">Nomenclature:</span> {data.nomenclature}</div>
        )}
        {(data.type || data.systemType) && (
          <div className="mb-1">
            <span className="text-gray-400">System:</span>{" "}
            <span className="capitalize">{(data.type ?? data.systemType)?.replace(/_/g, " ")}</span>
          </div>
        )}
        {hasPhases ? (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="font-semibold mb-2 text-yellow-400">K/N Configuration by Phase</div>
            <div className="space-y-2">
              {data.phases!.map((phase, index) => (
                <div key={index} className="bg-gray-800 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">
                      {phase.phase_name}
                      {typeof phase.sequence_order === "number" && (
                        <span className="text-gray-500 ml-1">#{phase.sequence_order + 1}</span>
                      )}
                    </span>
                    {phase.duration_hours != null && <span className="text-gray-400 text-[10px]">{phase.duration_hours}h</span>}
                  </div>
                  <div className="flex gap-3">
                    <div><span className="text-gray-400">K:</span> <span className="font-mono text-yellow-400 font-semibold">{phase.k}</span></div>
                    <div><span className="text-gray-400">N:</span> <span className="font-mono text-yellow-400 font-semibold">{phase.n}</span></div>
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1">{phase.k} of {phase.n} required operational</div>
                </div>
              ))}
            </div>
          </div>
        ) : hasSingleKn ? (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="font-semibold mb-1 text-yellow-400">K/N Configuration</div>
            <div className="flex gap-4 mb-1">
              <div><span className="text-gray-400">K:</span> <span className="font-mono text-yellow-400">{data.kn!.k}</span></div>
              <div><span className="text-gray-400">N:</span> <span className="font-mono text-yellow-400">{data.kn!.n}</span></div>
            </div>
            <div className="text-[10px] text-gray-400">({data.kn!.k} of {data.kn!.n} required operational)</div>
          </div>
        ) : null}
        {data.selected && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" />
              <span className="text-[10px]">Selected for Configuration</span>
            </div>
          </div>
        )}
      </PortalPopover>
    </div>
  )
}

// ─── Sub-Component Node ───────────────────────────────────────────────────────

export function SubComponentNode({ data }: NodeProps<SubComponentNodeData>) {
  const { ref, open, toggle, close } = usePopover()
  return (
    <div ref={ref} onClick={toggle} className="cursor-pointer">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-600 border-2 border-white" />
      <div className={`bg-[#2a2a2a] border-2 rounded-lg p-2 min-w-[120px] shadow-sm transition-colors ${open ? "border-purple-300" : "border-purple-500"}`}>
        <div className="flex flex-col items-center gap-1">
          <Box className="w-4 h-4 text-purple-400" />
          <div className="text-[9px] text-gray-500 uppercase">Sub-Component</div>
          <div className="text-white font-medium text-xs text-center">{data.label}</div>
        </div>
      </div>
      <PortalPopover anchorRef={ref} open={open} onClose={close}>
        <div className="font-semibold pr-4">{data.label}</div>
        <div className="text-gray-400 mt-1">Sub-Component</div>
      </PortalPopover>
    </div>
  )
}

// ─── Node Types Map ───────────────────────────────────────────────────────────

export const nodeTypes = {
  ship: ShipNode,
  system: SystemNode,
  component: ComponentNode,
  subcomponent: SubComponentNode,
}