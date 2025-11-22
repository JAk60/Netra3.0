'use client'
import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Position,
  ConnectionMode,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react';
import dagre from 'dagre';
import { Maximize2, Minimize2 } from 'lucide-react';

import '@xyflow/react/dist/style.css';

import BiDirectionalEdge from '../flow/BiDirectionalEdge';
import BiDirectionalNode from '../flow/BiDirectionalNode';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 272;
const nodeHeight = 180;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: layoutedNodes, edges };
};

const edgeTypes = {
  bidirectional: BiDirectionalEdge,
};

const nodeTypes = {
  bidirectional: BiDirectionalNode,
};

// Helper function to safely extract data and enrich nodes with ship data
const extractFlowData = (drishtiData) => {
  try {
    console.log('=== EXTRACTING FLOW DATA ===');
    console.log('Raw drishtiData:', drishtiData);

    // Check if drishtiData exists and is an array
    if (!drishtiData || !Array.isArray(drishtiData) || drishtiData.length === 0) {
      console.log('No valid drishtiData array found');
      return { nodes: [], edges: [], shipData: null };
    }

    const firstShip = drishtiData[0];
    console.log('First ship data:', firstShip);

    // Extract ship_name data (which contains all the detailed ship information)
    const shipData = firstShip.ship_name || null;
    console.log('Ship data extracted:', shipData);

    // Check if reactflow data exists
    if (!firstShip || !firstShip.reactflow) {
      console.log('No reactflow data found in first ship');
      return { nodes: [], edges: [], shipData };
    }

    console.log('ReactFlow data found:', firstShip.reactflow);
    console.log('Nodes from reactflow:', firstShip.reactflow.nodes);
    console.log('Edges from reactflow:', firstShip.reactflow.edges);

    // Validate nodes structure
    const rawNodes = firstShip.reactflow.nodes || [];
    const rawEdges = firstShip.reactflow.edges || [];

    console.log('Raw nodes count:', rawNodes.length);
    console.log('Raw edges count:', rawEdges.length);

    if (rawNodes.length === 0) {
      console.warn('No nodes found in reactflow data');
      return { nodes: [], edges: [], shipData };
    }

    // Ensure nodes have required ReactFlow properties
    const validatedNodes = rawNodes.map((node, index) => {
      console.log(`Processing node ${index}:`, node);

      // Ensure required ReactFlow node structure
      const validatedNode = {
        id: node.id || `node-${index}`,
        type: node.type || 'bidirectional', // Use your custom node type
        position: node.position || { x: index * 300, y: 0 }, // Fallback positioning
        data: {
          label: node.data?.label || node.label || `Node ${index + 1}`,
          ...node.data,
        },
        // Add any additional properties
        ...node
      };

      console.log('Validated node:', validatedNode);
      return validatedNode;
    });

    // Ensure edges have required ReactFlow properties
    const validatedEdges = rawEdges.map((edge, index) => {
      console.log(`Processing edge ${index}:`, edge);

      const validatedEdge = {
        id: edge.id || `edge-${index}`,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'bidirectional', // Use your custom edge type
        ...edge
      };

      console.log('Validated edge:', validatedEdge);
      return validatedEdge;
    });

    // Enrich nodes with ship data for hover functionality
    const enrichedNodes = validatedNodes.map(node => {
      let additionalData = {
        // Always add ship info to every node
        shipInfo: shipData ? {
          ship_id: shipData.ship_id,
          ship_name: shipData.ship_name,
          ship_category: shipData.ship_category,
          ship_class: shipData.ship_class,
          total_systems: shipData.total_systems
        } : null
      };

      // If shipData exists, try to find matching data for this node
      if (shipData && shipData.systems) {
        // Check if this node represents a system (by ID or type)
        const matchingSystem = shipData.systems.find(system =>
          system.system_id === node.id ||
          (node.data?.label && system.system_type.toLowerCase().includes(node.data.label.toLowerCase())) ||
          (node.data?.type && system.system_type.toLowerCase().includes(node.data.type.toLowerCase()))
        );

        if (matchingSystem) {
          console.log('Found matching system:', matchingSystem);
          additionalData.systemInfo = {
            system_id: matchingSystem.system_id,
            system_type: matchingSystem.system_type,
            created_date: matchingSystem.created_date,
            total_components: matchingSystem.total_components,
            root_components_count: matchingSystem.root_components_count
          };
        }

        // Check if this node represents a component
        shipData.systems.forEach(system => {
          const matchingComponent = system.components?.find(component =>
            component.component_id === node.id ||
            (node.data?.label && component.nomenclature && component.nomenclature.toLowerCase().includes(node.data.label.toLowerCase())) ||
            (node.data?.label && component.component_name && component.component_name.toLowerCase().includes(node.data.label.toLowerCase()))
          );

          if (matchingComponent) {
            console.log('Found matching component:', matchingComponent);
            additionalData.componentInfo = {
              component_id: matchingComponent.component_id,
              component_name: matchingComponent.component_name,
              nomenclature: matchingComponent.nomenclature,
              department_id: matchingComponent.department_id,
              is_lmu: matchingComponent.is_lmu,
              created_date: matchingComponent.created_date,
              belongs_to_system: matchingComponent.belongs_to_system,
              is_root_component: matchingComponent.is_root_component,
              child_count: matchingComponent.child_count
            };
          }
        });
      }

      return {
        ...node,
        data: {
          ...node.data,
          ...additionalData
        }
      };
    });

    console.log('Final enriched nodes:', enrichedNodes);
    console.log('Final validated edges:', validatedEdges);

    return {
      nodes: enrichedNodes,
      edges: validatedEdges,
      shipData
    };
  } catch (error) {
    console.error('Error extracting flow data:', error);
    return { nodes: [], edges: [], shipData: null };
  }
};

// Tooltip component for displaying node information on hover
const NodeTooltip = ({ nodeData, position, containerRef }) => {
  if (!nodeData) return null;

  // Calculate position relative to container to prevent overflow
  const containerRect = containerRef?.current?.getBoundingClientRect() || { left: 0, top: 0, width: window.innerWidth };
  const tooltipWidth = 300;

  let left = position.x - containerRect.left + 20;
  let top = position.y - containerRect.top - 10;

  // Prevent horizontal overflow
  if (left + tooltipWidth > containerRect.width) {
    left = position.x - containerRect.left - tooltipWidth - 20;
  }

  // Prevent going off left edge
  if (left < 0) {
    left = 10;
  }

  // Prevent vertical overflow
  if (top < 0) {
    top = 10;
  }

  return (
    <div
      className="absolute z-50 bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-600 text-xs"
      style={{
        left: left,
        top: top,
        pointerEvents: 'none',
        width: '280px',
        maxHeight: '300px',
        overflow: 'auto'
      }}
    >
      {/* Ship Information - Always show if available */}
      {nodeData.shipInfo && (
        <div className="mb-2">
          <h3 className="font-bold text-blue-300 mb-1 text-sm">Ship Information</h3>
          <p className="text-xs"><span className="font-semibold">Name:</span> {nodeData.shipInfo.ship_name}</p>
          <p className="text-xs"><span className="font-semibold">Category:</span> {nodeData.shipInfo.ship_category}</p>
          <p className="text-xs"><span className="font-semibold">Class:</span> {nodeData.shipInfo.ship_class}</p>
        </div>
      )}

      {/* System Information */}
      {nodeData.systemInfo && (
        <div className="mb-2">
          <h3 className="font-bold text-green-300 mb-1 text-sm">System Information</h3>
          <p className="text-xs"><span className="font-semibold">Type:</span> {nodeData.systemInfo.system_type}</p>
          <p className="text-xs"><span className="font-semibold">Components:</span> {nodeData.systemInfo.total_components}</p>
        </div>
      )}

      {/* Component Information */}
      {nodeData.componentInfo && (
        <div className="mb-2">
          <h3 className="font-bold text-yellow-300 mb-1 text-sm">Component Information</h3>
          <p className="text-xs"><span className="font-semibold">Name:</span> {nodeData.componentInfo.component_name}</p>
          <p className="text-xs"><span className="font-semibold">Nomenclature:</span> {nodeData.componentInfo.nomenclature}</p>
        </div>
      )}

      {/* Basic node information - always show */}
      <div>
        <h3 className="font-bold text-white mb-1 text-sm">Node Details</h3>
        <p className="text-xs"><span className="font-semibold">ID:</span> {nodeData.id || 'N/A'}</p>
        <p className="text-xs"><span className="font-semibold">Label:</span> {nodeData.label || 'N/A'}</p>
        {nodeData.type && <p className="text-xs"><span className="font-semibold">Type:</span> {nodeData.type}</p>}
      </div>
    </div>
  );
};

const AutoLayoutFlow = ({ drishtiData }) => {
  // Debug logs
  console.log('=== AUTOLAYOUT FLOW COMPONENT ===');
  console.log('Received drishtiData:', drishtiData);

  // Safely extract the data
  const { nodes: initialNodes, edges: initialEdges, shipData } = extractFlowData(drishtiData);
  console.log('Extracted nodes:', initialNodes);
  console.log('Extracted edges:', initialEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = React.useRef(null);
  const { fitView } = useReactFlow();

  // Update nodes and edges when drishtiData changes
  useEffect(() => {
    console.log('=== DRISHTI DATA CHANGED ===');
    console.log('New drishtiData:', drishtiData);

    const { nodes: newNodes, edges: newEdges } = extractFlowData(drishtiData);
    console.log('New nodes from data change:', newNodes);
    console.log('New edges from data change:', newEdges);

    setNodes(newNodes);
    setEdges(newEdges);
    setIsInitialized(false); // Reset initialization
  }, [drishtiData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onLayout = useCallback(
    (direction) => {
      console.log('=== APPLYING LAYOUT ===');
      console.log('Current nodes for layout:', nodes);
      console.log('Current edges for layout:', edges);

      if (nodes.length === 0) {
        console.log('No nodes to layout');
        return;
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      console.log('Layouted nodes:', layoutedNodes);
      console.log('Layouted edges:', layoutedEdges);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      window.requestAnimationFrame(() => {
        fitView();
        setIsInitialized(true);
      });
    },
    [nodes, edges, setNodes, setEdges, fitView]
  );

  // Handle node hover
  const onNodeMouseEnter = useCallback((event, node) => {
    setHoveredNode(node);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  // Track mouse position for tooltip positioning
  const onMouseMove = useCallback((event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    // Refit view after fullscreen toggle
    setTimeout(() => {
      fitView();
    }, 100);
  }, [fitView]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);

  // Auto-layout when nodes change and component is not yet initialized
  useEffect(() => {
    console.log('=== LAYOUT EFFECT ===');
    console.log('Nodes length:', nodes.length);
    console.log('Is initialized:', isInitialized);

    if (nodes.length > 0 && !isInitialized) {
      console.log('Triggering auto-layout');
      setTimeout(() => {
        onLayout('LR');
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [nodes, isInitialized, onLayout]);

  // Debug current state
  console.log('=== RENDER STATE ===');
  console.log('Current nodes:', nodes);
  console.log('Current edges:', edges);
  console.log('Initial nodes length:', initialNodes.length);

  // Show "No nodes" message if no data is available
  if (initialNodes.length === 0) {
    return (
      <div className="flex border-white rounded-md bg-black h-screen w-1/2 text-white items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Nodes Available</h2>
          <p className="text-gray-300">No flow data found in the provided dataset.</p>
          <div className="mt-4 p-4 bg-gray-800 rounded text-left text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>DrishtiData type: {typeof drishtiData}</p>
            <p>DrishtiData is array: {Array.isArray(drishtiData).toString()}</p>
            <p>DrishtiData length: {drishtiData?.length || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  }

  const flowContent = (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-white"
        attributionPosition="top-right"
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Controls />
        <Background color="#f5f5f5" variant={BackgroundVariant.Dots} />
      </ReactFlow>

      {/* Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-50 bg-gray-900 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors duration-200"
        title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* Debug overlay */}
      <div className="absolute top-4 left-4 bg-gray-900 text-white p-2 rounded text-xs z-50">
        <p>Nodes: {nodes.length}</p>
        <p>Edges: {edges.length}</p>
        <p>Initialized: {isInitialized.toString()}</p>
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <NodeTooltip
          nodeData={hoveredNode.data}
          position={mousePosition}
          containerRef={containerRef}
        />
      )}
    </>
  );

  if (isFullscreen) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-50 bg-black text-black"
        onMouseMove={onMouseMove}
      >
        {flowContent}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex border-white rounded-md bg-black h-screen w-1/2 text-black relative overflow-hidden"
      onMouseMove={onMouseMove}
    >
      {flowContent}
    </div>
  );
};

export default AutoLayoutFlow;