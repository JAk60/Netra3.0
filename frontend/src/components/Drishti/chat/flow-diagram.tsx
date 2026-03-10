'use client'

import {
    Cpu,
    Eye,
    Loader2,
    Settings,
    Wrench,
    Maximize2,
    Minimize2
} from "lucide-react"

import React, { useEffect, useMemo, useState } from 'react'
import { toast } from "sonner"

import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"

import {
    Background,
    Controls,
    Edge,
    Handle,
    MarkerType,
    Node,
    NodeProps,
    Position,
    ReactFlow,
    useEdgesState,
    useNodesState
} from '@xyflow/react'

import '@xyflow/react/dist/style.css'

// ================= TYPES =================

interface ComponentNodeData {
    component_id: string
    component_name: string
    nomenclature: string
    ship_name?: string
    department_id?: string
    level: number
    isRoot: boolean
    reliability?: number | null
    duration?: string
}

interface ComponentNode {
    component_id: string
    component_name: string
    nomenclature: string
    reliability?: number | null
    children?: ComponentNode[]
}

interface HierarchyResponse extends ComponentNode {
    ship_name?: string
    department_id?: string
    children?: ComponentNode[]
}

interface ReactFlowHierarchyProps {
    hierarchyData: HierarchyResponse
    duration?: number | null
}

// ================= TOAST CONTROL =================

const shownWeibullToasts = new Set<string>()

// ================= FETCH RELIABILITY =================

const fetchComponentReliability = async (
    componentId: string,
    componentName: string,
    duration: string
): Promise<number | null> => {

    try {
        const params = new URLSearchParams({ duration })
        const res = await fetch(
            `http://localhost:8000/reliability/${componentId}?${params}`
        )

        if (res.status === 404) {
            const errorData = await res.json().catch(() => null)

            if (
                errorData?.detail?.includes("No AlphaBeta") ||
                errorData?.detail?.includes("No EtaBeta")
            ) {
                if (!shownWeibullToasts.has(componentId)) {
                    toast.warning(
                        `No Weibull parameters found for ${componentName}`
                    )
                    shownWeibullToasts.add(componentId)
                }
            }

            return null
        }

        if (!res.ok) {
            toast.error("Failed to fetch reliability")
            return null
        }

        const data = await res.json()
        return typeof data === "number"
            ? data
            : (data.reliability ?? null)

    } catch {
        toast.error("Network error while fetching reliability")
        return null
    }
}

// ================= RECURSIVE FETCH =================

const fetchReliabilityForHierarchy = async (
    hierarchy: HierarchyResponse,
    duration: string
): Promise<HierarchyResponse> => {

    const reliability = await fetchComponentReliability(
        hierarchy.component_id,
        hierarchy.component_name,
        duration
    )

    let childrenWithReliability: ComponentNode[] | undefined = undefined

    if (hierarchy.children?.length) {
        childrenWithReliability = await Promise.all(
            hierarchy.children.map(child =>
                fetchReliabilityForHierarchy(child as HierarchyResponse, duration)
            )
        )
    }

    return {
        ...hierarchy,
        reliability,
        children: childrenWithReliability
    }
}

// ================= NODE =================

const ComponentNode: React.FC<NodeProps<ComponentNodeData>> = ({ data, selected }) => {

    const getIcon = (name: string) => {
        const lower = name.toLowerCase()
        if (lower.includes("pump")) return <Wrench className="h-4 w-4" />
        if (lower.includes("motor")) return <Cpu className="h-4 w-4" />
        if (lower.includes("turbine")) return <Settings className="h-4 w-4" />
        return <Settings className="h-4 w-4" />
    }

    const getColor = (value?: number | null) => {
        if (value == null) return "text-gray-300"
        if (value >= 90) return "text-green-200"
        if (value >= 80) return "text-yellow-200"
        return "text-red-200"
    }

    const hasDuration = !!data.duration

    return (
        <>
            <Handle type="target" position={Position.Top} />

            <div
                className={`
                    px-4 py-3 rounded-lg shadow-lg border-2 transition-all duration-200
                    ${selected ? "border-blue-300 shadow-blue-200" : "border-gray-200"}
                    hover:scale-105 hover:shadow-xl
                    bg-gradient-to-br from-blue-500 to-blue-600 text-white
                    min-w-[160px] max-w-[220px]
                `}
            >
                <div className="flex items-center gap-2 mb-2">
                    {getIcon(data.component_name)}
                    <div className="font-semibold text-sm truncate flex-1">
                        {data.component_name} ({data.nomenclature})
                    </div>
                    {data.isRoot && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                            ROOT
                        </Badge>
                    )}
                </div>

                {data.ship_name && (
                    <div className="text-xs opacity-80 mb-2 truncate">
                        Ship: {data.ship_name}
                    </div>
                )}

                {hasDuration && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                        {data.reliability != null ? (
                            <div className="text-center">
                                <div className="text-xs opacity-90 mb-1">
                                    Reliability
                                </div>
                                <div className={`text-lg font-bold ${getColor(data.reliability)}`}>
                                    {data.reliability}%
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-center opacity-60">
                                No reliability data
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-2 text-xs opacity-60 text-center">
                    Level {data.level}{hasDuration ? ` • ${data.duration}h` : ""}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} />
        </>
    )
}

// ================= MAIN =================

export function ReactFlowHierarchy({ hierarchyData, duration }: ReactFlowHierarchyProps) {

    const [hierarchyWithReliability, setHierarchyWithReliability] =
        useState<HierarchyResponse | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const hasDuration = duration != null && duration > 0

    useEffect(() => {

        const load = async () => {
            setIsLoading(true)

            try {
                if (!hasDuration) {
                    setHierarchyWithReliability(hierarchyData)
                } else {
                    const result = await fetchReliabilityForHierarchy(
                        hierarchyData,
                        duration!.toString()
                    )
                    setHierarchyWithReliability(result)
                }
            } finally {
                setIsLoading(false)
            }
        }

        load()

    }, [hierarchyData, duration])

    // ESC exits fullscreen
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsFullscreen(false)
            }
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [])

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {

        if (!hierarchyWithReliability) {
            return { nodes: [], edges: [] }
        }

        const nodes: Node<ComponentNodeData>[] = []
        const edges: Edge[] = []

        const processNode = (
            component: HierarchyResponse | ComponentNode,
            x: number,
            y: number,
            level: number,
            isRoot = false
        ) => {

            nodes.push({
                id: component.component_id,
                type: "component",
                position: { x, y },
                data: {
                    component_id: component.component_id,
                    component_name: component.component_name,
                    nomenclature: component.nomenclature,
                    ship_name: 'ship_name' in component ? component.ship_name : undefined,
                    department_id: 'department_id' in component ? component.department_id : undefined,
                    level,
                    isRoot,
                    reliability: component.reliability,
                    duration: hasDuration ? duration!.toString() : undefined
                }
            })

            if (component.children?.length) {

                const spacing = 220
                const startX =
                    x - ((component.children.length - 1) * spacing) / 2

                component.children.forEach((child, index) => {

                    const childX = startX + index * spacing
                    const childY = y + 150

                    edges.push({
                        id: `${component.component_id}-${child.component_id}`,
                        source: component.component_id,
                        target: child.component_id,
                        type: "smoothstep",
                        animated: true,
                        markerEnd: { type: MarkerType.ArrowClosed }
                    })

                    processNode(child, childX, childY, level + 1)
                })
            }
        }

        processNode(hierarchyWithReliability, 0, 0, 0, true)

        return { nodes, edges }

    }, [hierarchyWithReliability, duration])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    useEffect(() => {
        setNodes(initialNodes)
        setEdges(initialEdges)
    }, [initialNodes, initialEdges])

    const nodeTypes = { component: ComponentNode }

    if (isLoading) {
        return (
            <Card className="mt-4 h-[600px]">
                <CardContent className="h-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    const content = (
        <>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-[500px]">
                        <Eye className="h-5 w-5" />
                        Component Hierarchy - {hierarchyData.ship_name}
                        {hasDuration && (
                            <Badge variant="outline">
                                Duration: {duration}h
                            </Badge>
                        )}
                    </div>

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 bg-white rounded text-black"
                    >
                        {isFullscreen
                            ? <Minimize2 className="h-5 w-5" />
                            : <Maximize2 className="h-5 w-5" />}
                    </button>
                </CardTitle>
            </CardHeader>

            <CardContent className={isFullscreen ? "h-[calc(100vh-80px)] p-0" : "h-[500px] p-0"}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    className="bg-gray-50"
                >
                    <Background />
                    <Controls className="text-black"/>
                </ReactFlow>
            </CardContent>
        </>
    )

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-white">
                <Card className="w-full h-full border-none shadow-none">
                    {content}
                </Card>
            </div>
        )
    }

    return (
        <Card className="w-full mt-4 h-[600px]">
            {content}
        </Card>
    )
}