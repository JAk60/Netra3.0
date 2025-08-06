'use client'

import {
    Cpu,
    Eye,
    Loader2,
    Settings,
    Wrench
} from "lucide-react"
import React, { useEffect, useMemo, useState } from 'react'

import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"

// React Flow imports
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

import '@xyflow/react/dist/style.css';

// Custom React Flow Node Component - Fixed version from second code
const ComponentNode: React.FC<NodeProps<ComponentNodeData>> = ({ data, selected }) => {
    const getNodeIcon = (componentName: string) => {
        const name = componentName.toLowerCase()
        if (name.includes("pump")) return <Wrench className="h-4 w-4" />
        if (name.includes("motor")) return <Cpu className="h-4 w-4" />
        if (name.includes("turbine")) return <Settings className="h-4 w-4" />
        return <Settings className="h-4 w-4" />
    }

    const getNodeColor = (level: number, isRoot: boolean) => {
        if (isRoot) return "from-blue-500 to-blue-600"
        if (level === 1) return "from-green-500 to-green-600"
        if (level === 2) return "from-purple-500 to-purple-600"
        return "from-gray-500 to-gray-600"
    }

    const getReliabilityColor = (reliability?: number) => {
        if (!reliability) return "text-gray-300"
        if (reliability >= 90) return "text-green-200"
        if (reliability >= 80) return "text-yellow-200"
        return "text-red-200"
    }

    const getReliabilityBgColor = (reliability?: number) => {
        if (!reliability) return "bg-gray-600"
        if (reliability >= 90) return "bg-green-600"
        if (reliability >= 80) return "bg-yellow-600"
        return "bg-red-600"
    }

    return (
        <>
            <Handle type="target" position={Position.Top} />

            <div
                className={`
          px-4 py-3 rounded-lg shadow-lg border-2 transition-all duration-200
          ${selected ? "border-blue-400 shadow-blue-200" : "border-gray-200"}
          hover:scale-105 hover:shadow-xl
          bg-gradient-to-br ${getNodeColor(data.level, data.isRoot)} text-white
          min-w-[160px] max-w-[220px]
        `}
            >
                {/* Header with icon and name */}
                <div className="flex items-center gap-2 mb-2">
                    {getNodeIcon(data.component_name)}
                    <div className="font-semibold text-sm truncate flex-1">{data.component_name} ({data.nomenclature})</div>
                    {data.isRoot && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                            ROOT
                        </Badge>
                    )}
                </div>

                {/* Ship and Department info */}
                {(data.ship_name || data.department_id) && (
                    <div className="text-xs opacity-80 mb-2 space-y-1">
                        {data.ship_name && <div className="truncate">Ship: {data.ship_name}</div>}
                    </div>
                )}

                {/* Reliability Display */}
                {data.reliability !== undefined && data.reliability !== null ? (
                    <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="text-xs font-medium mb-1 opacity-90">Reliability</div>
                        <div className="text-center">
                            <div className={`text-lg font-bold ${getReliabilityColor(data.reliability)}`}>
                                {data.reliability.toFixed(4)}%
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="text-xs text-center opacity-60">No reliability data</div>
                    </div>
                )}

                {/* Level indicator */}
                <div className="mt-2 text-xs opacity-60 text-center">
                    Level {data.level} • {data.duration || "30d"}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} />
        </>
    )
}

// Add this function to fetch reliability data (fixed for numeric duration)
const fetchComponentReliability = async (componentId: string, duration: string): Promise<number | null> => {
    try {
        const params = new URLSearchParams({
            duration: duration,
        })

        const response = await fetch(`http://127.0.0.1:8000/reliability/${componentId}?${params}`)

        if (!response.ok) {
            const errorData = await response.json()
            console.error("API Error:", response.status, errorData)
            return null
        }

        const data = await response.json()

        // Backend returns a float directly
        return typeof data === 'number' ? data : (data.reliability || null)
    } catch (error) {
        console.error("Error fetching reliability data:", error)
        return null
    }
}

// Enhanced function to recursively fetch reliability for hierarchy
const fetchReliabilityForHierarchy = async (hierarchy: HierarchyResponse, duration: string): Promise<HierarchyResponse> => {
    // Fetch reliability for current component
    const reliabilityData = await fetchComponentReliability(hierarchy.component_id, duration)
    const componentWithReliability = {
        ...hierarchy,
        reliability: reliabilityData,
    }

    // Recursively fetch reliability for children
    if (componentWithReliability.children && componentWithReliability.children.length > 0) {
        const childrenWithReliability = await Promise.all(
            componentWithReliability.children.map(async (child) => {
                return await fetchReliabilityForHierarchy(child as any, duration)
            }),
        )
        componentWithReliability.children = childrenWithReliability as ComponentNode[]
    }

    return componentWithReliability
}

// Updated ReactFlowHierarchy component
export function ReactFlowHierarchy({ hierarchyData, duration }: ReactFlowHierarchyProps) {
    const [hierarchyWithReliability, setHierarchyWithReliability] = useState<HierarchyResponse | null>(null)
    const [isLoadingReliability, setIsLoadingReliability] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Fetch reliability data when component mounts or duration changes
    useEffect(() => {
        const loadReliabilityData = async () => {
            setIsLoadingReliability(true)
            try {
                const durationValue = duration ? duration.toString() : "30"
                const hierarchyWithRel = await fetchReliabilityForHierarchy(hierarchyData, durationValue)
                setHierarchyWithReliability(hierarchyWithRel)
            } catch (error) {
                console.error('Error loading reliability data:', error)
                setHierarchyWithReliability(hierarchyData) // Fallback to original data
            } finally {
                setIsLoadingReliability(false)
            }
        }

        loadReliabilityData()
    }, [hierarchyData, duration])

    // Use hierarchyWithReliability for flow generation
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        if (!hierarchyWithReliability) return { nodes: [], edges: [] }
        const durationValue = duration ? duration.toString() : "30"
        return convertHierarchyToFlow(hierarchyWithReliability, durationValue)
    }, [hierarchyWithReliability, duration])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    // Update nodes when initialNodes change
    useEffect(() => {
        setNodes(initialNodes)
        setEdges(initialEdges)
    }, [initialNodes, initialEdges, setNodes, setEdges])

    // Handle escape key to exit fullscreen
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false)
            }
        }

        document.addEventListener('keydown', handleEscKey)
        return () => document.removeEventListener('keydown', handleEscKey)
    }, [isFullscreen])

    const nodeTypes = {
        component: ComponentNode,
    }

    const durationString = duration ? `${duration} hours` : "30 hours"

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    if (isLoadingReliability) {
        return (
            <Card className="mt-4 h-[600px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Component Hierarchy - {hierarchyData.ship_name}
                        <Badge variant="outline">Duration: {durationString}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[500px] flex items-center justify-center">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading reliability data...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const cardContent = (
        <>
            <CardHeader className={isFullscreen ? "p-4" : ""}>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Component Hierarchy - {hierarchyData.ship_name}
                        <Badge variant="outline">Duration: {durationString}</Badge>
                    </div>
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
                    >
                        {isFullscreen ? (
                            <span className="text-lg">⤡</span>
                        ) : (
                            <span className="text-lg">⛶</span>
                        )}
                    </button>
                </CardTitle>
            </CardHeader>
            <CardContent className={`p-0 ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[500px]'}`}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    className="bg-gray-50"
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={true}
                >
                    <Background color="#e2e8f0" gap={20} />
                    <Controls className="bg-white border border-gray-200 rounded-lg shadow-lg" showInteractive={false} />
                </ReactFlow>
            </CardContent>
        </>
    )

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-white">
                <Card className="w-full h-full border-none shadow-none">
                    {cardContent}
                </Card>
            </div>
        )
    }

    return (
        <Card className="w-full mt-4 h-[600px]">
            {cardContent}
        </Card>
    )
}

// Also update the convertHierarchyToFlow function to handle reliability properly
const convertHierarchyToFlow = (hierarchy: HierarchyResponse, duration = "30") => {
    const nodes: Node<ComponentNodeData>[] = []
    const edges: Edge[] = []

    const processNode = (component: HierarchyResponse | ComponentNode, x: number, y: number, level: number, isRoot = false) => {
        const nodeData: ComponentNodeData = {
            component_id: component.component_id,
            component_name: component.component_name,
            nomenclature: component.nomenclature,
            ship_name: 'ship_name' in component ? component.ship_name : undefined,
            department_id: 'department_id' in component ? component.department_id : undefined,
            level,
            isRoot,
            reliability: component.reliability,
            duration,
        }

        nodes.push({
            id: component.component_id,
            type: "component",
            position: { x, y },
            data: nodeData,
        })

        if (component.children && component.children.length > 0) {
            const childrenCount = component.children.length
            const childSpacing = 220
            const startX = x - ((childrenCount - 1) * childSpacing) / 2

            component.children.forEach((child, index) => {
                const childX = startX + index * childSpacing
                const childY = y + 150

                edges.push({
                    id: `${component.component_id}-${child.component_id}`,
                    source: component.component_id,
                    target: child.component_id,
                    type: "smoothstep",
                    animated: true,
                    style: { stroke: "#64748b", strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: "#64748b",
                    },
                })

                processNode(child, childX, childY, level + 1)
            })
        }
    }

    processNode(hierarchy, 0, 0, 0, true)
    return { nodes, edges }
}