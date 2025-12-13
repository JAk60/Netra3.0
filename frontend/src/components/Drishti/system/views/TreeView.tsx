import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import * as dagre from 'dagre';
import React, { useCallback, useMemo, useState } from 'react';

import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/registry/new-york-v4/ui/dialog';

import '@xyflow/react/dist/style.css';
import { seeSystemnodeTypes } from './seeSystemCanvasElements';

// Type definitions
interface ComponentMetadata {
  alpha: number | null;
  beta: number | null;
  eta: number | null;
  eta_beta: number | null;
  priority: number | null;
  current_age: number | null;
}

interface ShipComponent {
  component_id: string;
  component_name: string;
  nomenclature?: string;
  is_root_component?: boolean;
  children?: ShipComponent[];
  status_level?: number;
  metadata?: ComponentMetadata;
  department_id?: string;
  parent_id?: string | null;
  CMMS_EquipmentCode?: string | null;
  is_lmu?: number;
  parent_name?: string | null;
  etl?: boolean;
  created_date?: string;
  modified_date?: string;
  belongs_to_system?: string;
  has_children?: string[];
  is_child_of?: string | null;
  has_descendants?: string[];
  child_count?: number;
  descendant_count?: number;
}

interface ShipSystem {
  system_id: string;
  system_type: string;
  total_components: number;
  components: ShipComponent[];
  created_date?: string;
  root_components_count?: number;
  belongs_to_ship?: string;
  has_components?: string[];
  system_type_shared_with_systems?: string[];
}

interface ShipData {
  ship_id: string;
  ship_name: string;
  ship_category: string;
  ship_class: string;
  systems: ShipSystem[];
  total_systems?: number;
  has_systems?: string[];
}

interface Props {
  shipData: ShipData;
  loading?: boolean;
}

interface NodeData {
  label: string;
  category?: string;
  class?: string;
  nomenclature?: string;
  type?: string;
  selected?: boolean;
  count?: number;
  systemKey?: string;
  shipName?: string;
  metadata?: ComponentMetadata;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: 'TB',
    nodesep: 60,
    ranksep: 120,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const transformShipData = (shipData: ShipData): { nodes: Node<NodeData>[]; edges: Edge[] } => {
  const initialNodes: Node<NodeData>[] = [];
  const initialEdges: Edge[] = [];

  if (!shipData?.systems) return { nodes: [], edges: [] };

  // Ship node
  initialNodes.push({
    id: shipData.ship_id,
    type: 'ship',
    data: {
      label: shipData.ship_name,
      category: shipData.ship_category,
      class: shipData.ship_class,
    },
    position: { x: 0, y: 0 },
  });

  shipData.systems.forEach((system) => {
    initialNodes.push({
      id: system.system_id,
      type: 'system',
      data: {
        label: system.system_type,
        count: system.total_components,
        systemKey: system.system_type,
        shipName: shipData.ship_name,
      },
      position: { x: 0, y: 0 },
    });

    initialEdges.push({
      id: `e-${shipData.ship_id}-${system.system_id}`,
      source: shipData.ship_id,
      target: system.system_id,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    });

    const rootComponents = system.components.filter((c) => c.is_root_component);

    rootComponents.forEach((component) => {
      initialNodes.push({
        id: component.component_id,
        type: 'component',
        data: {
          label: component.nomenclature || component.component_name,
          nomenclature: component.nomenclature,
          type: system.system_type,
          selected: false,
          metadata: component.metadata,
        },
        position: { x: 0, y: 0 },
      });

      const status = component.status_level ?? 0;
      let color = '#10b981';
      let className = '';
      let animated = false;

      if (status === 2) color = '#f59e0b';
      if (status >= 3) {
        color = '#ef4444';
        className = 'edge-blinking-red';
        animated = true;
      }

      initialEdges.push({
        id: `e-${system.system_id}-${component.component_id}`,
        source: system.system_id,
        target: component.component_id,
        animated,
        className,
        style: { stroke: color, strokeWidth: 2 },
      });

      if (component.children?.length) {
        component.children.forEach((child) => {
          initialNodes.push({
            id: child.component_id,
            type: 'subcomponent',
            data: {
              label: child.nomenclature || child.component_name,
              metadata: child.metadata,
            },
            position: { x: 0, y: 0 },
          });

          initialEdges.push({
            id: `e-${component.component_id}-${child.component_id}`,
            source: component.component_id,
            target: child.component_id,
            animated,
            className,
            style: { stroke: color, strokeWidth: 2 },
          });
        });
      }
    });
  });

  return getLayoutedElements(initialNodes, initialEdges);
};

const ShipHierarchyCanvas: React.FC<Props> = ({ shipData }) => {
  const { nodes, edges } = useMemo(
    () => transformShipData(shipData),
    [shipData]
  );

  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [open, setOpen] = useState(false);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node);
    setOpen(true);
  }, []);

  return (
    <div className="h-screen w-full bg-black">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          nodeTypes={seeSystemnodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          minZoom={0.2}
          maxZoom={1.5}
          className="bg-white"
        >
          <Controls className='text-black' />
          <Background
            color="#eff1f4"
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
          />
        </ReactFlow>
      </ReactFlowProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>{selectedNode?.data?.label}</DialogTitle>
          </DialogHeader>

          {selectedNode && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Node Details</h3>
                  <div className="space-y-2">
                    {/* <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">{selectedNode.type}</span>
                    </div> */}
                    {selectedNode.data.nomenclature && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nomenclature:</span>
                        <span className="text-white">{selectedNode.data.nomenclature}</span>
                      </div>
                    )}
                    {selectedNode.data.category && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white">{selectedNode.data.category}</span>
                      </div>
                    )}
                    {selectedNode.data.class && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Class:</span>
                        <span className="text-white">{selectedNode.data.class}</span>
                      </div>
                    )}
                    {selectedNode.data.count !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Components:</span>
                        <span className="text-white">{selectedNode.data.count}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedNode.data.metadata && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Metadata</h3>
                    <div className="space-y-2">
                      {selectedNode.data.metadata.alpha !== null && selectedNode.data.metadata.alpha !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Alpha:</span>
                          <span className="text-white font-mono">{selectedNode.data.metadata.alpha.toFixed(6)}</span>
                        </div>
                      )}
                      {selectedNode.data.metadata.beta !== null && selectedNode.data.metadata.beta !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Beta:</span>
                          <span className="text-white font-mono">{selectedNode.data.metadata.beta.toFixed(6)}</span>
                        </div>
                      )}
                      {selectedNode.data.metadata.eta !== null && selectedNode.data.metadata.eta !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Eta:</span>
                          <span className="text-white font-mono">{selectedNode.data.metadata.eta}</span>
                        </div>
                      )}
                      {selectedNode.data.metadata.eta_beta !== null && selectedNode.data.metadata.eta_beta !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Eta Beta:</span>
                          <span className="text-white font-mono">{selectedNode.data.metadata.eta_beta}</span>
                        </div>
                      )}
                      {selectedNode.data.metadata.priority !== null && selectedNode.data.metadata.priority !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Priority:</span>
                          <span className="text-white">{selectedNode.data.metadata.priority}</span>
                        </div>
                      )}
                      {selectedNode.data.metadata.current_age !== null && selectedNode.data.metadata.current_age !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Age:</span>
                          <span className="text-white">{selectedNode.data.metadata.current_age} hours</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end mt-4">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShipHierarchyCanvas;