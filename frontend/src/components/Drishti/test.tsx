// "use client"
// import { motion } from "framer-motion";
// import type React from "react";

// import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
// import { Badge } from '@/registry/new-york-v4/ui/badge';
// import { Button } from '@/registry/new-york-v4/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
// import { Input } from '@/registry/new-york-v4/ui/input';
// import { ScrollArea } from '@/registry/new-york-v4/ui/scroll-area';
// import {
//   Activity,
//   AlertCircle,
//   Bot,
//   CheckCircle2,
//   Code,
//   Cpu,
//   Database,
//   Eye,
//   Loader2,
//   MessageCircle,
//   Send,
//   Settings,
//   Table,
//   User,
//   Wrench,
// } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import ReactFlow, {
//   type Edge,
//   type Node,
//   type NodeProps,
//   Background,
//   Controls,
//   Handle,
//   MarkerType,
//   Position,
//   useEdgesState,
//   useNodesState,
// } from "reactflow";
// import "reactflow/dist/style.css";


// interface HierarchyComponent {
//   component_id: string
//   component_name: string
//   nomenclature: string
//   ship_name?: string
//   department_id?: string
//   children?: HierarchyComponent[]
//   reliability?: number
// }

// interface ComponentNodeData {
//   component_id: string
//   component_name: string
//   nomenclature: string
//   ship_name?: string
//   department_id?: string
//   level: number
//   isRoot: boolean
//   reliability?: number
//   duration?: string
// }

// interface ApiResponse {
//   error?: boolean
//   message?: string
//   generated_sql?: string
//   result?: Array<Record<string, any>>
//   query_quality?: string
//   records_retrieved?: number
// }

// interface DrishtiResponse {
//   component_id?: string
//   component_name?: string
//   nomenclature?: string
//   ship_name?: string
//   department_id?: string
//   children?: HierarchyComponent[]
//   error?: boolean
//   message?: string
//   detail?: string
// }

// interface QueryMode {
//   mode: "api" | "chat" | "drishti"
//   variables: Record<string, string>
// }

// interface Message {
//   id: number
//   content: string
//   isUser: boolean
//   timestamp: string
//   type: "text" | "table" | "sql" | "reliability" | "mode" | "error" | "warning" | "success" | "hierarchy"
//   data?: any
// }

// interface TableData {
//   data: Array<Record<string, any>>
//   title: string
// }

// interface ModeData {
//   mode: string
//   icon: React.ReactNode
//   color: string
// }

// const API_ENDPOINTS = {
//   ask: "http://127.0.0.1:8000/ask",
//   chat: "http://127.0.0.1:8000/chat",
//   drishti: "http://127.0.0.1:8000/components/hierarchy",
//   reliability: "http://127.0.0.1:8000/reliability",
// } as const

// const getQueryMode = (input: string): QueryMode => {
//   const variablePattern = /@(\w+)\s*=\s*([^@]+?)(?=\s*@|\s*$)/gi
//   const matches = [...input.matchAll(variablePattern)]

//   if (matches.length > 0) {
//     const variables: Record<string, string> = {}
//     matches.forEach((match) => {
//       variables[match[1].toUpperCase()] = match[2].trim()
//     })

//     if (variables.SHIP_NAME && variables.NOMENCLATURE) {
//       return { mode: "drishti", variables }
//     }
//   }

//   const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i
//   if (sqlKeywords.test(input)) {
//     return { mode: "api", variables: {} }
//   }

//   return { mode: "chat", variables: {} }
// }

// const ComponentNode: React.FC<NodeProps<ComponentNodeData>> = ({ data, selected }) => {
//   const getNodeIcon = (componentName: string) => {
//     const name = componentName.toLowerCase()
//     if (name.includes("pump")) return <Wrench className="h-4 w-4" />
//     if (name.includes("motor")) return <Cpu className="h-4 w-4" />
//     if (name.includes("turbine")) return <Settings className="h-4 w-4" />
//     return <Settings className="h-4 w-4" />
//   }

//   const getNodeColor = (level: number, isRoot: boolean) => {
//     if (isRoot) return "from-blue-500 to-blue-600"
//     if (level === 1) return "from-green-500 to-green-600"
//     if (level === 2) return "from-purple-500 to-purple-600"
//     return "from-gray-500 to-gray-600"
//   }

//   const getReliabilityColor = (reliability?: number) => {
//     if (!reliability) return "text-gray-300"
//     if (reliability >= 90) return "text-green-200"
//     if (reliability >= 80) return "text-yellow-200"
//     return "text-red-200"
//   }

//   const getReliabilityBgColor = (reliability?: number) => {
//     if (!reliability) return "bg-gray-600"
//     if (reliability >= 90) return "bg-green-600"
//     if (reliability >= 80) return "bg-yellow-600"
//     return "bg-red-600"
//   }

//   return (
//     <>
//       <Handle type="target" position={Position.Top} />

//       <div
//         className={`
//           px-4 py-3 rounded-lg shadow-lg border-2 transition-all duration-200
//           ${selected ? "border-blue-400 shadow-blue-200" : "border-gray-200"}
//           hover:scale-105 hover:shadow-xl
//           bg-gradient-to-br ${getNodeColor(data.level, data.isRoot)} text-white
//           min-w-[160px] max-w-[220px]
//         `}
//       >
//         {/* Header with icon and name */}
//         <div className="flex items-center gap-2 mb-2">
//           {getNodeIcon(data.component_name)}
//           <div className="font-semibold text-sm truncate flex-1">{data.component_name} ({data.nomenclature})</div>
//           {data.isRoot && (
//             <Badge variant="secondary" className="text-xs px-1 py-0">
//               ROOT
//             </Badge>
//           )}
//         </div>

//         {/* Ship and Department info */}
//         {(data.ship_name || data.department_id) && (
//           <div className="text-xs opacity-80 mb-2 space-y-1">
//             {data.ship_name && <div className="truncate">Ship: {data.ship_name}</div>}
//           </div>
//         )}

//         {/* Reliability Display */}
//         {data.reliability !== undefined && data.reliability !== null ? (
//           <div className="mt-2 pt-2 border-t border-white/20">
//             <div className="text-xs font-medium mb-1 opacity-90">Reliability</div>
//             <div className="text-center">
//               <div className={`text-lg font-bold ${getReliabilityColor(data.reliability)}`}>
//                 {data.reliability.toFixed(4)}%
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="mt-2 pt-2 border-t border-white/20">
//             <div className="text-xs text-center opacity-60">No reliability data</div>
//           </div>
//         )}

//         {/* Level indicator */}
//         <div className="mt-2 text-xs opacity-60 text-center">
//           Level {data.level} • {data.duration || "30d"}
//         </div>
//       </div>

//       <Handle type="source" position={Position.Bottom} />
//     </>
//   )
// }

// const convertHierarchyToFlow = (hierarchy: HierarchyComponent, duration = "30d") => {
//   const nodes: Node<ComponentNodeData>[] = []
//   const edges: Edge[] = []

//   const processNode = (component: HierarchyComponent, x: number, y: number, level: number, isRoot = false) => {
//     const nodeData: ComponentNodeData = {
//       component_id: component.component_id,
//       component_name: component.component_name,
//       nomenclature: component.nomenclature,
//       ship_name: component.ship_name,
//       department_id: component.department_id,
//       level,
//       isRoot,
//       reliability: component.reliability,
//       duration,
//     }

//     nodes.push({
//       id: component.component_id,
//       type: "component",
//       position: { x, y },
//       data: nodeData,
//     })

//     if (component.children && component.children.length > 0) {
//       const childrenCount = component.children.length
//       const childSpacing = 220
//       const startX = x - ((childrenCount - 1) * childSpacing) / 2

//       component.children.forEach((child, index) => {
//         const childX = startX + index * childSpacing
//         const childY = y + 150

//         edges.push({
//           id: `${component.component_id}-${child.component_id}`,
//           source: component.component_id,
//           target: child.component_id,
//           type: "smoothstep",
//           animated: true,
//           style: { stroke: "#64748b", strokeWidth: 2 },
//           markerEnd: {
//             type: MarkerType.ArrowClosed,
//             color: "#64748b",
//           },
//         })

//         processNode(child, childX, childY, level + 1)
//       })
//     }
//   }

//   processNode(hierarchy, 0, 0, 0, true)
//   return { nodes, edges }
// }

// interface HierarchyVisualizationProps {
//   hierarchy: HierarchyComponent
//   duration: string
// }

// const HierarchyVisualization: React.FC<HierarchyVisualizationProps> = ({ hierarchy, duration }) => {
//   const { nodes: initialNodes, edges: initialEdges } = convertHierarchyToFlow(hierarchy, duration)
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

//   const nodeTypes = {
//     component: ComponentNode,
//   }

//   return (
//     <Card className="mt-4 h-[600px]">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Eye className="h-5 w-5" />
//           Component Hierarchy - {hierarchy.ship_name}
//           <Badge variant="outline">Duration: {duration}</Badge>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="h-[500px] p-0">
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           nodeTypes={nodeTypes}
//           fitView
//           fitViewOptions={{ padding: 0.2 }}
//           defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
//           className="bg-gray-50"
//           nodesDraggable={true}
//           nodesConnectable={false}
//           elementsSelectable={true}
//         >
//           <Background color="#e2e8f0" gap={20} />
//           <Controls className="bg-white border border-gray-200 rounded-lg shadow-lg" showInteractive={false} />
//         </ReactFlow>
//       </CardContent>
//     </Card>
//   )
// }

// interface MessageBubbleProps {
//   message: string
//   isUser: boolean
//   timestamp: string
// }

// const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser, timestamp }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     className={`flex gap-3 mb-6 ${isUser ? "flex-row-reverse" : "flex-row"}`}
//   >
//     <div
//       className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-blue-500 text-white" : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
//         }`}
//     >
//       {isUser ? <User size={16} /> : <Bot size={16} />}
//     </div>
//     <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
//       <Card className={`${isUser ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"} shadow-sm`}>
//         <CardContent className="p-4">
//           <div className="text-sm text-gray-900 whitespace-pre-wrap">{message}</div>
//         </CardContent>
//       </Card>
//       <div className="text-xs text-gray-500 mt-1 px-2">{timestamp}</div>
//     </div>
//   </motion.div>
// )

// interface ResultsTableProps {
//   data: Array<Record<string, any>>
//   title: string
// }

// const ResultsTable: React.FC<ResultsTableProps> = ({ data, title }) => {
//   if (!data || !Array.isArray(data) || data.length === 0) {
//     return (
//       <Alert>
//         <AlertCircle className="h-4 w-4" />
//         <AlertDescription>No data available</AlertDescription>
//       </Alert>
//     )
//   }

//   const columns = Object.keys(data[0])

//   return (
//     <Card className="mt-4">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Table className="h-5 w-5" />
//           {title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="border-b">
//                 {columns.map((col) => (
//                   <th key={col} className="text-left p-2 font-medium text-gray-700 bg-gray-50">
//                     {col}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {data.map((row, i) => (
//                 <tr key={i} className="border-b hover:bg-gray-50">
//                   {columns.map((col) => (
//                     <td key={col} className="p-2 text-gray-900">
//                       {row[col] !== null && row[col] !== undefined ? String(row[col]) : ""}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// interface SQLDisplayProps {
//   sql: string
// }

// const SQLDisplay: React.FC<SQLDisplayProps> = ({ sql }) => (
//   <Card className="mt-4">
//     <CardHeader>
//       <CardTitle className="flex items-center gap-2">
//         <Code className="h-5 w-5" />
//         Generated SQL Query
//       </CardTitle>
//     </CardHeader>
//     <CardContent>
//       <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">{sql}</pre>
//     </CardContent>
//   </Card>
// )

// interface ReliabilityStatsDisplayProps {
//   reliability: number
//   totalComponents: number
// }

// const ReliabilityStatsDisplay: React.FC<ReliabilityStatsDisplayProps> = ({ reliability, totalComponents }) => (
//   <div className="grid grid-cols-2 gap-4 mt-4">
//     <Card>
//       <CardContent className="p-4">
//         <div className="flex items-center gap-2">
//           <Activity className="h-4 w-4 text-green-500" />
//           <div>
//             <p className="text-sm text-gray-600">Average Reliability</p>
//             <p className="text-xl font-bold">{reliability.toFixed(1)}%</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//     <Card>
//       <CardContent className="p-4">
//         <div className="flex items-center gap-2">
//           <Database className="h-4 w-4 text-blue-500" />
//           <div>
//             <p className="text-sm text-gray-600">Total Components</p>
//             <p className="text-xl font-bold">{totalComponents}</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   </div>
// )

// const fetchComponentReliability = async (componentId: string, duration: string): Promise<number | null> => {
//   try {
//     const params = new URLSearchParams({
//       duration: duration,
//     })

//     const response = await fetch(`${API_ENDPOINTS.reliability}/${componentId}?${params}`)
//     const data = await response.json()

//     if (response.ok) {
//       // Backend returns a float directly
//       return typeof data === 'number' ? data : data.reliability
//     } else {
//       console.error("Failed to fetch reliability data:", data)
//       return null
//     }
//   } catch (error) {
//     console.error("Error fetching reliability data:", error)
//     return null
//   }
// }

// const calculateHierarchyStats = (hierarchy: HierarchyComponent): { totalComponents: number; avgReliability: number } => {
//   let totalComponents = 0
//   let totalReliability = 0
//   let componentsWithReliability = 0

//   const traverse = (component: HierarchyComponent) => {
//     totalComponents++
//     if (component.reliability !== undefined && component.reliability !== null) {
//       totalReliability += component.reliability
//       componentsWithReliability++
//     }

//     if (component.children) {
//       component.children.forEach(child => traverse(child))
//     }
//   }

//   traverse(hierarchy)

//   return {
//     totalComponents,
//     avgReliability: componentsWithReliability > 0 ? totalReliability / componentsWithReliability : 0
//   }
// }

// export default function SQLAgentChat() {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState<string>("")
//   const [isLoading, setIsLoading] = useState<boolean>(false)
//   const [isClient, setIsClient] = useState<boolean>(false)
//   const scrollAreaRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     setIsClient(true)
//     setMessages([
//       {
//         id: 1,
//         content:
//           "Hello! I'm your Schema-Aware AI SQL Agent. You can:\n\n• Ask natural language questions about your data\n• Use SQL queries directly\n• Create visualizations using @SHIP_NAME=value @NOMENCLATURE=value @DURATION=value format\n\nWhat would you like to explore today?",
//         isUser: false,
//         timestamp: new Date().toLocaleTimeString(),
//         type: "text",
//       },
//     ])
//   }, [])

//   const scrollToBottom = () => {
//     if (scrollAreaRef.current) {
//       const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight
//       }
//     }
//   }

//   useEffect(() => {
//     if (isClient) {
//       scrollToBottom()
//     }
//   }, [messages, isClient])

//   const addMessage = (content: string, isUser = false, type: Message["type"] = "text", data: any = null): Message => {
//     const newMessage: Message = {
//       id: Date.now(),
//       content,
//       isUser,
//       timestamp: new Date().toLocaleTimeString(),
//       type,
//       data,
//     }
//     setMessages((prev) => [...prev, newMessage])
//     return newMessage
//   }

//   const handleApiRequest = async (query: string) => {
//     try {
//       const response = await fetch(API_ENDPOINTS.ask, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ question: query }),
//       })

//       const data: ApiResponse = await response.json()

//       if (response.ok) {
//         if (data.error) {
//           addMessage(`Error: ${data.message || "Unknown error"}`, false, "error")
//         } else {
//           if (data.generated_sql) {
//             addMessage("", false, "sql", data.generated_sql)
//           }
//           if (data.result && Array.isArray(data.result) && data.result.length > 0) {
//             addMessage("", false, "table", { data: data.result, title: "Query Results" })
//           } else {
//             addMessage("Query executed successfully, but no records were found.", false, "warning")
//           }
//         }
//       } else {
//         addMessage(`API Error: ${data.message || "Unknown error"}`, false, "error")
//       }
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Unknown error"
//       addMessage(`Connection error: ${errorMessage}`, false, "error")
//     }
//   }

//   const handleChatRequest = async (query: string) => {
//     try {
//       const response = await fetch(API_ENDPOINTS.chat, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query }),
//       })

//       const data: ApiResponse = await response.json()

//       if (response.ok) {
//         if (data.message && data.message.startsWith("CLARIFY:")) {
//           const clarification = data.message.replace("CLARIFY:", "").trim()
//           addMessage(`I need more details: ${clarification}`, false, "warning")
//         } else if (data.error) {
//           addMessage(`${data.message || "Unknown error"}`, false, "error")
//         } else {
//           if (data.generated_sql) {
//             addMessage("", false, "sql", data.generated_sql)
//           }
//           if (data.result && Array.isArray(data.result) && data.result.length > 0) {
//             addMessage("", false, "table", { data: data.result, title: "Query Results" })
//           } else {
//             addMessage("Query executed successfully, but no records were found.", false, "warning")
//           }
//         }
//       } else {
//         addMessage(`API Error: ${data.message || "Unknown error"}`, false, "error")
//       }
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Unknown error"
//       addMessage(`Connection error: ${errorMessage}`, false, "error")
//     }
//   }

//   const handleDrishtiRequest = async (variables: Record<string, string>) => {
//     try {
//       const params = new URLSearchParams({
//         nomenclature: variables.NOMENCLATURE,
//         ship_name: variables.SHIP_NAME,
//       })

//       const response = await fetch(`${API_ENDPOINTS.drishti}?${params}`)
//       const data: DrishtiResponse = await response.json()

//       if (response.ok) {
//         if (data.error) {
//           addMessage(`API Error: ${data.message || "Unknown error"}`, false, "error")
//         } else {
//           const componentInfo = `Component: ${data.component_name || "N/A"}\nID: ${data.component_id || "N/A"}\nNomenclature: ${data.nomenclature || "N/A"}`
//           addMessage(componentInfo, false, "success")

//           const fetchReliabilityForHierarchy = async (hierarchy: HierarchyComponent) => {
//             const duration = variables.DURATION || "30d"
//             const reliabilityData = await fetchComponentReliability(hierarchy.component_id, duration)
//             const componentWithReliability = {
//               ...hierarchy,
//               reliability: reliabilityData,
//             }

//             if (componentWithReliability.children && componentWithReliability.children.length > 0) {
//               const childrenWithReliability = await Promise.all(
//                 componentWithReliability.children.map(async (child) => {
//                   return await fetchReliabilityForHierarchy(child)
//                 }),
//               )
//               componentWithReliability.children = childrenWithReliability
//             }

//             return componentWithReliability
//           }

//           const hierarchyWithReliability = await fetchReliabilityForHierarchy(data)
//           addMessage("", false, "hierarchy", hierarchyWithReliability)

//           const stats = calculateHierarchyStats(hierarchyWithReliability)
//           addMessage("", false, "reliability", { reliability: stats.avgReliability, totalComponents: stats.totalComponents })
//           addMessage("✅ Component hierarchy visualization loaded successfully!", false, "success")
//         }
//       } else {
//         addMessage(`HTTP ${response.status}: ${data.detail || "Request failed"}`, false, "error")
//       }
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Unknown error"
//       addMessage(`Connection error: ${errorMessage}`, false, "error")
//     }
//   }

//   const handleSubmit = async () => {
//     if (!input.trim()) return

//     const userMessage = input.trim()
//     setInput("")
//     setIsLoading(true)

//     addMessage(userMessage, true)

//     const { mode, variables } = getQueryMode(userMessage)

//     const modeIcons = {
//       api: <Database className="h-4 w-4" />,
//       chat: <MessageCircle className="h-4 w-4" />,
//       drishti: <Eye className="h-4 w-4" />,
//     }

//     const modeColors = {
//       api: "bg-blue-100 text-blue-800",
//       chat: "bg-green-100 text-green-800",
//       drishti: "bg-purple-100 text-purple-800",
//     }

//     const modeData: ModeData = {
//       mode,
//       icon: modeIcons[mode],
//       color: modeColors[mode],
//     }

//     addMessage("", false, "mode", modeData)

//     try {
//       switch (mode) {
//         case "api":
//           await handleApiRequest(userMessage)
//           break
//         case "chat":
//           await handleChatRequest(userMessage)
//           break
//         case "drishti":
//           await handleDrishtiRequest(variables)
//           break
//       }
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Unknown error"
//       addMessage(`Unexpected error: ${errorMessage}`, false, "error")
//     }

//     setIsLoading(false)
//   }

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       handleSubmit()
//     }
//   }

//   const renderMessage = (message: Message) => {
//     switch (message.type) {
//       case "table":
//         return <ResultsTable data={message.data.data} title={message.data.title} />
//       case "sql":
//         return <SQLDisplay sql={message.data} />
//       case "reliability":
//         return <ReliabilityStatsDisplay reliability={message.data.reliability} totalComponents={message.data.totalComponents} />
//       case "hierarchy":
//         return <HierarchyVisualization hierarchy={message.data} duration="30d" />
//       case "mode":
//         return (
//           <div className="flex items-center gap-2 my-2">
//             <Badge className={`${message.data.color} flex items-center gap-1`}>
//               {message.data.icon}
//               {message.data.mode.toUpperCase()} Mode
//             </Badge>
//           </div>
//         )
//       case "error":
//         return (
//           <Alert className="border-red-200 bg-red-50">
//             <AlertCircle className="h-4 w-4 text-red-600" />
//             <AlertDescription className="text-red-800">{message.content}</AlertDescription>
//           </Alert>
//         )
//       case "warning":
//         return (
//           <Alert className="border-yellow-200 bg-yellow-50">
//             <AlertCircle className="h-4 w-4 text-yellow-600" />
//             <AlertDescription className="text-yellow-800">{message.content}</AlertDescription>
//           </Alert>
//         )
//       case "success":
//         return (
//           <Alert className="border-green-200 bg-green-50">
//             <CheckCircle2 className="h-4 w-4 text-green-600" />
//             <AlertDescription className="text-green-800">{message.content}</AlertDescription>
//           </Alert>
//         )
//       default:
//         return <MessageBubble message={message.content} isUser={message.isUser} timestamp={message.timestamp} />
//     }
//   }

//   if (!isClient) {
//     return (
//       <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//         <div className="flex items-center justify-center h-full">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="bg-white border-b border-gray-200 p-4">
//         <h1 className="text-xl font-bold text-gray-900">SQL Agent Chat</h1>
//       </div>
//       <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
//         <div className="max-w-4xl mx-auto">
//           {messages.map((message) => (
//             <div key={message.id} className="mb-4">
//               {renderMessage(message)}
//             </div>
//           ))}
//           {isLoading && (
//             <div className="flex items-center gap-2 text-gray-500 mb-4">
//               <Loader2 className="h-4 w-4 animate-spin" />
//               Processing your request...
//             </div>
//           )}
//         </div>
//       </ScrollArea>

//       <div className="bg-white border-t border-gray-200 p-4 shadow-sm">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex items-center gap-2">
//             <Input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyPress}
//               placeholder="Ask a question, write SQL, or use @SHIP_NAME=value @NOMENCLATURE=value..."
//               className="flex-1 text-black"
//               disabled={isLoading}
//             />
//             <Button
//               onClick={handleSubmit}
//               disabled={!input.trim() || isLoading}
//               className="bg-blue-500 hover:bg-blue-600 text-white"
//             >
//               {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
//             </Button>
//           </div>
//           <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
//             <span>💡 Examples:</span>
//             <span>Natural language: "Show top customers"</span>
//             <span>SQL: "SELECT * FROM customers"</span>
//             <span>Visualization: "@SHIP_NAME=INS ONE @NOMENCLATURE=GT 1"</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



// Add this function to fetch reliability data (from your old code)
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

  const nodeTypes = {
    component: ComponentNode,
  }

  const durationString = duration ? `${duration} hours` : "30 hours"

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

  return (
    <Card className="mt-4 h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Component Hierarchy - {hierarchyData.ship_name}
          <Badge variant="outline">Duration: {durationString}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[500px] p-0">
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
    </Card>
  )
}

// Also update the convertHierarchyToFlow function to handle reliability properly
const convertHierarchyToFlow = (hierarchy: HierarchyResponse, duration = "30d") => {
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