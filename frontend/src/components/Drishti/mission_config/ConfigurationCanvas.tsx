"use client"
import { ReactFlow, Background, Controls, type Node, type Edge, BackgroundVariant } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Ship } from "lucide-react"
import { nodeTypes } from "./nodes/ComponentNode"

interface ConfigurationCanvasProps {
  nodes: Node[]
  edges: Edge[]
  mode: "view" | "create" | "edit"
}

export function ConfigurationCanvas({ nodes, edges, mode }: ConfigurationCanvasProps) {
  console.log("Canvas rendering with:", { 
    nodeCount: nodes.length, 
    edgeCount: edges.length,
    nodes: nodes.map(n => ({ id: n.id, type: n.type })),
    edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
  })

  return (
    <div className="flex-1 relative overflow-hidden bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-white"
        proOptions={{ hideAttribution: true }}
        // Add default edge options to ensure visibility
        defaultEdgeOptions={{
          style: { 
            stroke: "#666", 
            strokeWidth: 3 
          },
          animated: false,
        }}
      >
        <Controls className="text-black" />
        <Background color="#ddd" variant={BackgroundVariant.Dots} />
      </ReactFlow>
      
      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-600">
            <Ship className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              {mode === "create" ? "Start configuring your ship" : "Select or create a configuration"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}