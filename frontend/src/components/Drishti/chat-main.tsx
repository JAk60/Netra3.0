'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Bot,
  Loader2,
  Mic,
  Paperclip,
  Plus,
  Search,
  Send,
  User,
  ChevronDown,
  ChevronRight,
  Wrench,
  Cpu,
  Settings,
  Eye
} from "lucide-react"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Avatar } from "@/registry/new-york-v4/ui/avatar"
import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"

// React Flow imports
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  NodeProps,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'

// Types
interface Ship {
  ship_id: string
  ship_name: string
  ship_class?: string
  ship_category?: string
  command?: string
}

interface ComponentNode {
  component_id: string
  component_name: string
  nomenclature: string
  children: ComponentNode[]
  reliability?: number
  isLoading?: boolean
}

interface HierarchyResponse {
  component_id: string
  component_name: string
  nomenclature: string
  ship_name: string
  department_id: string
  children: ComponentNode[]
}

interface ToolCall {
  name: string
  arguments: Record<string, any>
  result?: any
}

interface AIResponse {
  generated_sql?: string
  records_retrieved?: number
  result?: Record<string, any>[]
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  tool_calls?: ToolCall[]
  ai_response?: AIResponse
  hierarchy_data?: HierarchyResponse
  duration?: number
  isError?: boolean
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  retryCount: number
}

interface AutocompletePosition {
  top: number
  left: number
}

interface ShipWithScore {
  ship: Ship
  score: number
}

interface ReliabilityData {
  name: string
  reliability: string
  ship: string
}

interface ChatErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ChatErrorBoundaryProps {
  children: React.ReactNode
}

// React Flow Node Data Interface - Updated to match second code
interface ComponentNodeData {
  component_id: string
  component_name: string
  nomenclature: string
  ship_name?: string
  department_id?: string
  level: number
  isRoot: boolean
  reliability?: number
  duration?: string
}

// Error Boundary Component
class ChatErrorBoundary extends React.Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
            <p className="text-muted-foreground">Please refresh the page to continue</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

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
function ReactFlowHierarchy({ hierarchyData, duration }: ReactFlowHierarchyProps) {
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

// Fuzzy search implementation
const fuzzySearch = (query: string, ships: Ship[]): Ship[] => {
  if (!query.trim()) return ships.slice(0, 10)

  const searchTerm = query.toLowerCase()

  return ships
    .map((ship): ShipWithScore | null => {
      const name = ship.ship_name.toLowerCase()
      const class_ = ship.ship_class?.toLowerCase() || ''
      const category = ship.ship_category?.toLowerCase() || ''

      // Exact match gets highest score
      if (name === searchTerm) return { ship, score: 100 }

      // Starts with search term
      if (name.startsWith(searchTerm)) return { ship, score: 90 }

      // Contains search term
      if (name.includes(searchTerm)) return { ship, score: 80 }

      // Class or category match
      if (class_.includes(searchTerm) || category.includes(searchTerm)) {
        return { ship, score: 70 }
      }

      // Fuzzy character matching
      let score = 0
      let searchIndex = 0

      for (let i = 0; i < name.length && searchIndex < searchTerm.length; i++) {
        if (name[i] === searchTerm[searchIndex]) {
          score += 1
          searchIndex++
        }
      }

      // If we matched all characters, calculate fuzzy score
      if (searchIndex === searchTerm.length) {
        const fuzzyScore = (score / name.length) * 60
        return { ship, score: fuzzyScore }
      }

      return null
    })
    .filter((item): item is ShipWithScore => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(item => item.ship)
}

// Debounce hook
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Autocomplete Dropdown Component Props
interface AutocompleteDropdownProps {
  show: boolean
  ships: Ship[]
  position: AutocompletePosition
  selectedIndex: number
  onSelect: (ship: Ship) => void
  onMouseEnter: (index: number) => void
  forwardRef: React.RefObject<HTMLDivElement>
}

function AutocompleteDropdown({
  show,
  ships,
  position,
  selectedIndex,
  onSelect,
  onMouseEnter,
  forwardRef
}: AutocompleteDropdownProps) {
  if (!show) return null

  return (
    <div
      ref={forwardRef}
      className="absolute z-50 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-80"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="p-2">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
          Ships ({ships.length})
        </div>
        {ships.map((ship, index) => (
          <div
            key={ship.ship_id}
            className={`px-3 py-2 rounded-md cursor-pointer flex flex-col gap-1 ${index === selectedIndex
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent/50'
              }`}
            onClick={() => onSelect(ship)}
            onMouseEnter={() => onMouseEnter(index)}
          >
            <div className="font-medium text-sm">{ship.ship_name}</div>
            <div className="text-xs text-muted-foreground">
              {ship.ship_class} • {ship.ship_category} • {ship.command}
            </div>
          </div>
        ))}
        {ships.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No ships found
          </div>
        )}
      </div>
    </div>
  )
}

// SQL Results Table Component
interface SQLResultsTableProps {
  aiResponse: AIResponse
}

function SQLResultsTable({ aiResponse }: SQLResultsTableProps) {
  if (!aiResponse.result || aiResponse.result.length === 0) {
    return (
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-muted-foreground text-center">No results found</p>
      </div>
    )
  }

  const results = aiResponse.result
  const allColumns = Object.keys(results[0])
  const columns = allColumns.filter(column => {
    const lowerColumn = column.toLowerCase()
    return !lowerColumn.endsWith('id') && !lowerColumn.endsWith('_id')
  })
  return (
    <div className="mt-6 space-y-4">
      {/* Query Info */}
      <div className="bg-card/70 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Query Results</h3>
          <span className="text-sm text-muted-foreground">
            {aiResponse.records_retrieved} record{aiResponse.records_retrieved !== 1 ? 's' : ''} found
          </span>
        </div>
        
        {/* Generated SQL */}
        {aiResponse.generated_sql && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              View generated SQL query
            </summary>
            <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-x-auto border border-border">
              <code>{aiResponse.generated_sql}</code>
            </pre>
          </details>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-sm font-medium text-foreground border-b border-border"
                  >
                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="px-4 py-3 text-sm text-foreground border-b border-border/50"
                    >
                      {row[column] !== null && row[column] !== undefined 
                        ? String(row[column]) 
                        : '-'
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Reliability Chart Component Props
interface ReliabilityChartProps {
  toolCalls: ToolCall[]
}

function ReliabilityChart({ toolCalls }: ReliabilityChartProps) {
  const getReliabilityChartData = (toolCalls: ToolCall[]): ReliabilityData[] | null => {
    if (!toolCalls || !Array.isArray(toolCalls)) return null

    const reliabilityTool = toolCalls.find(tool => tool.name === 'get_component_reliability')
    if (!reliabilityTool || !reliabilityTool.result) return null

    const result = reliabilityTool.result

    // Handle single component result
    if (result.data && result.data.reliability_score !== undefined) {
      return [{
        name: result.data.nomenclature || result.data.component_name || 'Component',
        reliability: (result.data.reliability_score * 100).toFixed(2),
        ship: result.data.ship
      }]
    }

    // Handle multiple component results
    if (result.data && result.data.results && Array.isArray(result.data.results)) {
      return result.data.results
        .filter((item: any) => item.reliability !== null && item.reliability !== undefined)
        .map((item: any): ReliabilityData => ({
          name: `${item.nomenclature || 'Unknown'} (${item.ship || 'Unknown Ship'})`,
          reliability: (item.reliability * 100).toFixed(2),
          ship: item.ship || 'Unknown Ship'
        }))
    }

    return null
  }

  interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
      payload: ReliabilityData
    }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">
            {`Reliability: ${data.reliability}%`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`Ship: ${data.ship}`}
          </p>
        </div>
      )
    }
    return null
  }

  const chartData = getReliabilityChartData(toolCalls)

  if (!chartData || chartData.length === 0) return null

  return (
    <div className="mt-6">
      <div className=" rounded-lg border border-border p-4 bg-white">
        <h3 className="text-black font-semibold mb-4">
          Reliability Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
              label={{ value: 'Reliability (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="reliability"
              name="Equipment"
              fill="#25547e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 text-sm text-muted-foreground">
          * Reliability scores are shown as percentages. Higher values indicate better reliability.
        </div>
      </div>
    </div>
  )
}

// Message Component Props
interface MessageProps {
  message: Message
  index: number
}

function Message({ message, index }: MessageProps) {
  const hasReliabilityToolCall = (toolCalls?: ToolCall[]): boolean => {
    if (!toolCalls || !Array.isArray(toolCalls)) return false
    return toolCalls.some(tool => tool.name === 'get_component_reliability')
  }

  const hasSQLResponse = (aiResponse?: AIResponse): boolean => {
    return !!(aiResponse && aiResponse.result && aiResponse.result.length > 0)
  }

  return (
    <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <Avatar className="w-8 h-8 mt-1">
          <Bot className="w-4 h-4" />
        </Avatar>
      )}

      <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
        <div className={`rounded-lg p-4 ${message.role === 'user'
          ? 'bg-primary text-primary-foreground ml-auto'
          : message.isError
            ? 'bg-destructive/10 text-destructive border border-destructive/20'
            : 'bg-muted'
          }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Component Hierarchy Display with React Flow */}
          {message.role === 'assistant' && message.hierarchy_data && (
            <ReactFlowHierarchy 
              hierarchyData={message.hierarchy_data} 
              duration={message.duration}
            />
          )}

          {/* SQL Results Table */}
          {message.role === 'assistant' && hasSQLResponse(message.ai_response) && message.ai_response && (
            <SQLResultsTable aiResponse={message.ai_response} />
          )}

          {/* Reliability Chart */}
          {message.role === 'assistant' && hasReliabilityToolCall(message.tool_calls) && message.tool_calls && (
            <ReliabilityChart toolCalls={message.tool_calls} />
          )}

          {/* Tool Calls Display */}
          {message.tool_calls && message.tool_calls.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <div className="text-sm text-muted-foreground mb-2">Tool calls:</div>
              {message.tool_calls.map((tool, toolIndex) => (
                <div key={toolIndex} className="bg-background/50 rounded p-3 mb-2 text-sm">
                  <div className="font-medium text-foreground">{tool.name}</div>
                  <div className="text-muted-foreground mt-1">
                    Arguments: {JSON.stringify(tool.arguments, null, 2)}
                  </div>
                  {tool.result && (
                    <div className="text-muted-foreground mt-2">
                      <details className="cursor-pointer">
                        <summary className="hover:text-foreground">View result</summary>
                        <pre className="mt-2 text-xs overflow-x-auto bg-background/80 p-2 rounded">
                          {JSON.stringify(tool.result, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-1 px-4">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {message.role === 'user' && (
        <Avatar className="w-8 h-8 mt-1">
          <User className="w-4 w-4" />
        </Avatar>
      )}
    </div>
  )
}

// Chat Input Component Props
interface ChatInputProps {
  inputValue: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onSend: () => void
  isLoading: boolean
  forwardRef: React.RefObject<HTMLInputElement>
}

function ChatInput({
  inputValue,
  onChange,
  onKeyDown,
  onSend,
  isLoading,
  forwardRef
}: ChatInputProps) {
  return (
    <div className="p-6 border-border">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/70 border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Input
              ref={forwardRef}
              value={inputValue}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder="Ask about components... Use @ship_name=SHIP_NAME, nomenclature=NOMENCLATURE, duration=HOURS"
              className="flex-1 border-0 focus-visible:ring-0 text-base bg-transparent"
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onSend}
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2" disabled={isLoading}>
                <Mic className="w-4 h-4" />
                Voice Message
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" disabled={isLoading}>
                <Search className="w-4 h-4" />
                Browse Prompts
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {inputValue.length} / 3,000
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          etra may generate inaccurate information please confirm first
        </p>
      </div>
    </div>
  )
}

// Main Chat Component Props
interface ChatMainProps {
  ships?: Ship[]
}

interface WelcomeScreenProps {
  onQuickAction?: (action: string) => void
}

function WelcomeScreen({ onQuickAction }: WelcomeScreenProps) {
  const quickActions = [
    {
      icon: "🚢",
      title: "Component Hierarchy",
      action: "@ship_name=INS ONE, nomenclature=GT 1"
    },
    {
      icon: "📊",
      title: "Reliability Analysis",
      action: "@ship_name=INS ONE, nomenclature=GT 1, duration=40"
    },
    {
      icon: "🔍",
      title: "Search Components",
      action: "Show me all components for INS ONE"
    },
    {
      icon: "💻",
      title: "Write code",
      action: "Write Python code to analyze data"
    }
  ]

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-normal text-5xl font-bold text-white tracking-tight">Welcome to Netra</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            <p className="py-1 font-normal bg-muted/80 rounded-2xl text-lg text-white leading-relaxed">
              Get started by asking about component hierarchy, reliability analysis, or any other task.
            </p>
            <p className="text-sm text-gray-300">
              Use: <code className="bg-gray-700 px-2 py-1 rounded">@ship_name=SHIP_NAME, nomenclature=NOMENCLATURE, duration=HOURS</code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {quickActions.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-16 flex items-center justify-between p-4 hover:bg-accent hover:text-accent-foreground border-border bg-card/70"
              onClick={() => handleQuickAction(item.action)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground">{item.icon}</span>
                </div>
                <span className="font-medium">{item.title}</span>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Chat Component
export default function ChatMain({ ships = [] }: ChatMainProps) {
  // Consolidated state
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    retryCount: 0
  })

  // Input and autocomplete state
  const [inputValue, setInputValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompletePosition, setAutocompletePosition] = useState<AutocompletePosition>({ top: 0, left: 0 })
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 200)

  // Memoized filtered ships with fuzzy search
  const filteredShips = useMemo(() => {
    return fuzzySearch(debouncedSearchQuery, ships)
  }, [debouncedSearchQuery, ships])

  // Parse message for hierarchy request
  const parseHierarchyRequest = useCallback((message: string) => {
    const shipNameMatch = message.match(/@ship_name=([^,@]+)/i)
    const nomenclatureMatch = message.match(/nomenclature=([^,@]+)/i)
    const durationMatch = message.match(/duration=(\d+(?:\.\d+)?)/i)

    if (shipNameMatch && nomenclatureMatch) {
      return {
        shipName: shipNameMatch[1].trim(),
        nomenclature: nomenclatureMatch[1].trim(),
        duration: durationMatch ? parseFloat(durationMatch[1]) : undefined
      }
    }

    return null
  }, [])

  // Fetch component hierarchy
  const fetchHierarchy = async (shipName: string, nomenclature: string): Promise<HierarchyResponse> => {
    const encodedShipName = encodeURIComponent(shipName)
    const encodedNomenclature = encodeURIComponent(nomenclature)
    
    const response = await fetch(
      `http://127.0.0.1:8000/components/hierarchy?nomenclature=${encodedNomenclature}&ship_name=${encodedShipName}`
    )
    
    if (!response.ok) {
      throw new Error(`Failed to fetch hierarchy: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  // Extract ship names from the message
  const extractShipNames = useCallback((message: string): string[] => {
    const shipNamePattern = /@ship_name=([^@\s,]+(?:\s+[^@\s,]*)*)/g
    const matches: string[] = []
    let match

    while ((match = shipNamePattern.exec(message)) !== null) {
      const shipNamesString = match[1].trim()
      const shipNames = shipNamesString.split(',').map(name => name.trim()).filter(name => name.length > 0)
      matches.push(...shipNames)
    }

    return [...new Set(matches)]
  }, [])

  // Send message function with hierarchy support
  const sendMessage = async () => {
    if (!inputValue.trim() || chatState.isLoading) return

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }))

    const messageToSend = inputValue.trim()
    const hierarchyRequest = parseHierarchyRequest(messageToSend)

    setInputValue("")
    setShowAutocomplete(false)

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      let assistantMessage: Message

      // Handle hierarchy request
      if (hierarchyRequest) {
        try {
          const hierarchyData = await fetchHierarchy(
            hierarchyRequest.shipName, 
            hierarchyRequest.nomenclature
          )

          assistantMessage = {
            role: "assistant",
            content: `Component hierarchy for ${hierarchyRequest.nomenclature} on ${hierarchyRequest.shipName}${
              hierarchyRequest.duration ? ` with reliability analysis for ${hierarchyRequest.duration} hours` : ''
            }:`,
            timestamp: new Date().toISOString(),
            hierarchy_data: hierarchyData,
            duration: hierarchyRequest.duration
          }

        } catch (hierarchyError) {
          console.error('Error fetching hierarchy:', hierarchyError)
          assistantMessage = {
            role: "assistant",
            content: `Failed to fetch component hierarchy: ${hierarchyError instanceof Error ? hierarchyError.message : 'Unknown error'}`,
            timestamp: new Date().toISOString(),
            isError: true
          }
        }
      } else {
        // Handle regular chat request
        const extractedShips = extractShipNames(messageToSend)

        const requestBody = {
          message: messageToSend,
          conversation_history: chatState.messages,
          filters: {
            ships: extractedShips,
            explain: false
          }
        }

        const response = await fetch('http://127.0.0.1:8000/chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        assistantMessage = {
          role: "assistant",
          content: data.response,
          timestamp: data.timestamp,
          tool_calls: data.tool_calls,
          ai_response: data.ai_response
        }
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        retryCount: 0
      }))

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was cancelled, don't update state
      }

      console.error('Error sending message:', error)

      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
        isError: true
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: prev.retryCount + 1
      }))
    }
  }

  // Handle input changes and autocomplete logic
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.substring(0, cursorPosition)

    const shipNameMatch = textBeforeCursor.match(/@ship_name=([^@]*?)([^@,\s]*)$/)

    if (shipNameMatch) {
      const searchTerm = shipNameMatch[2]
      setSearchQuery(searchTerm)

      const input = inputRef.current
      if (input) {
        const rect = input.getBoundingClientRect()
        setAutocompletePosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX
        })
      }
      setShowAutocomplete(true)
      setSelectedIndex(-1)
    } else {
      setShowAutocomplete(false)
      setSearchQuery("")
    }
  }, [])

  // Handle ship selection
  const selectShip = useCallback((ship: Ship) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const textBeforeCursor = inputValue.substring(0, cursorPosition)
    const textAfterCursor = inputValue.substring(cursorPosition)

    const newText = textBeforeCursor.replace(/@ship_name=([^@]*?)([^@,\s]*)$/, (match, existingShips, currentSearch) => {
      const prefix = existingShips.trim() ? existingShips + ', ' : ''
      return `@ship_name=${prefix}${ship.ship_name}`
    }) + textAfterCursor

    setInputValue(newText)
    setShowAutocomplete(false)
    setSelectedIndex(-1)
    setSearchQuery("")

    setTimeout(() => {
      inputRef.current?.focus()
      const newCursorPosition = newText.length - textAfterCursor.length
      inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)
  }, [inputValue])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => prev < filteredShips.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredShips.length) {
          selectShip(filteredShips[selectedIndex])
        } else if (!e.shiftKey) {
          sendMessage()
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowAutocomplete(false)
        setSelectedIndex(-1)
        break
      case 'Tab':
        if (selectedIndex >= 0 && selectedIndex < filteredShips.length) {
          e.preventDefault()
          selectShip(filteredShips[selectedIndex])
        }
        break
    }
  }, [showAutocomplete, selectedIndex, filteredShips, selectShip, sendMessage])

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle quick actions from welcome screen
  const handleQuickAction = useCallback((action: string) => {
    setInputValue(action)
    // Focus the input after setting the value
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <ChatErrorBoundary>
      <div className="bg-muted/30 rounded-xl border border-white/80 shadow-lg shadow-[0_3px_10px_rgba(0,0,0,0.2)] rounded-[10px] flex-1 flex flex-col relative ml-4 mr-4 mb-5 mt-4">
        {/* Autocomplete Dropdown */}
        <AutocompleteDropdown
          show={showAutocomplete}
          ships={filteredShips}
          position={autocompletePosition}
          selectedIndex={selectedIndex}
          onSelect={selectShip}
          onMouseEnter={setSelectedIndex}
          forwardRef={autocompleteRef}
        />

        {/* Chat Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {chatState.messages.length === 0 ? (
            <WelcomeScreen onQuickAction={handleQuickAction} />
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {chatState.messages.map((message, index) => (
                  <Message key={index} message={message} index={index} />
                ))}

                {chatState.isLoading && (
                  <div className="flex gap-4 justify-start">
                    <Avatar className="w-8 h-8 mt-1">
                      <Bot className="w-4 h-4" />
                    </Avatar>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          inputValue={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={sendMessage}
          isLoading={chatState.isLoading}
          forwardRef={inputRef}
        />
      </div>
    </ChatErrorBoundary>
  )
}