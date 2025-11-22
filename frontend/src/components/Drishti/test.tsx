'use client'
import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Position,
  ConnectionMode,
  MarkerType,
  useReactFlow,
  type OnConnect,
  type Node,
  type Edge,
} from '@xyflow/react';
import dagre from 'dagre';

import '@xyflow/react/dist/style.css';

import BiDirectionalEdge from './flow/BiDirectionalEdge';
import BiDirectionalNode from './flow/BiDirectionalNode';
const data = {
  "nodes": [
    {
      "id": "33f13701-849f-4030-8d71-a0f65eac992e",
      "type": "bidirectional",
      "position": {
        "x": 400,
        "y": 50
      },
      "data": {
        "label": "INS ONE",
        "ship_category": "DESTROYER AND FRIGATES",
        "ship_class": "KOLKATA (P-15A)",
        "total_systems": 4,
        "node_type": "ship"
      },
      "style": {
        "background": "#1f2937",
        "color": "white",
        "border": "2px solid #3b82f6",
        "borderRadius": "8px",
        "width": 200,
        "height": 80
      }
    },
    {
      "id": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "type": "bidirectional",
      "position": {
        "x": 400,
        "y": 200
      },
      "data": {
        "label": "Systems",
        "total_systems": 4,
        "total_system_types": 4,
        "node_type": "systems_collective"
      },
      "style": {
        "background": "#059669",
        "color": "white",
        "border": "2px solid #10b981",
        "borderRadius": "6px",
        "width": 150,
        "height": 60
      }
    },
    {
      "id": "system_type_SystemType.FIRING",
      "type": "bidirectional",
      "position": {
        "x": 650,
        "y": 350
      },
      "data": {
        "label": "firing",
        "system_type": "firing",
        "instances_count": 1,
        "node_type": "system_type"
      },
      "style": {
        "background": "#7c3aed",
        "color": "white",
        "border": "2px solid #8b5cf6",
        "borderRadius": "6px",
        "width": 120,
        "height": 50
      }
    },
    {
      "id": "system_type_SystemType.PROPULSION",
      "type": "bidirectional",
      "position": {
        "x": 400,
        "y": 600
      },
      "data": {
        "label": "propulsion",
        "system_type": "propulsion",
        "instances_count": 1,
        "node_type": "system_type"
      },
      "style": {
        "background": "#7c3aed",
        "color": "white",
        "border": "2px solid #8b5cf6",
        "borderRadius": "6px",
        "width": 120,
        "height": 50
      }
    },
    {
      "id": "system_type_SystemType.SUPPORT",
      "type": "bidirectional",
      "position": {
        "x": 150,
        "y": 350.00000000000006
      },
      "data": {
        "label": "support",
        "system_type": "support",
        "instances_count": 1,
        "node_type": "system_type"
      },
      "style": {
        "background": "#7c3aed",
        "color": "white",
        "border": "2px solid #8b5cf6",
        "borderRadius": "6px",
        "width": 120,
        "height": 50
      }
    },
    {
      "id": "system_type_SystemType.POWER_GENERATION",
      "type": "bidirectional",
      "position": {
        "x": 399.99999999999994,
        "y": 100
      },
      "data": {
        "label": "power_generation",
        "system_type": "power_generation",
        "instances_count": 1,
        "node_type": "system_type"
      },
      "style": {
        "background": "#7c3aed",
        "color": "white",
        "border": "2px solid #8b5cf6",
        "borderRadius": "6px",
        "width": 120,
        "height": 50
      }
    },
    {
      "id": "5358d044-9f4f-44cf-a975-341221f7189d",
      "type": "bidirectional",
      "position": {
        "x": 550,
        "y": 600
      },
      "data": {
        "label": "Gas Turbine",
        "component_id": "5358d044-9f4f-44cf-a975-341221f7189d",
        "system_type": "propulsion",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
      "type": "bidirectional",
      "position": {
        "x": 400,
        "y": 750
      },
      "data": {
        "label": "Gas Turbine",
        "component_id": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
        "system_type": "propulsion",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
      "type": "bidirectional",
      "position": {
        "x": 250,
        "y": 600
      },
      "data": {
        "label": "Gas Turbine",
        "component_id": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
        "system_type": "propulsion",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
      "type": "bidirectional",
      "position": {
        "x": 400,
        "y": 450
      },
      "data": {
        "label": "Gas Turbine",
        "component_id": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
        "system_type": "propulsion",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "443360a0-6218-486b-a34c-1813963177b7",
      "type": "bidirectional",
      "position": {
        "x": 550,
        "y": 100
      },
      "data": {
        "label": "Generator",
        "component_id": "443360a0-6218-486b-a34c-1813963177b7",
        "system_type": "power_generation",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
      "type": "bidirectional",
      "position": {
        "x": 399.99999999999994,
        "y": 250
      },
      "data": {
        "label": "Generator",
        "component_id": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
        "system_type": "power_generation",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
      "type": "bidirectional",
      "position": {
        "x": 249.99999999999994,
        "y": 100.00000000000001
      },
      "data": {
        "label": "Generator",
        "component_id": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
        "system_type": "power_generation",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
      "type": "bidirectional",
      "position": {
        "x": 399.99999999999994,
        "y": -50
      },
      "data": {
        "label": "Generator",
        "component_id": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
        "system_type": "power_generation",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "308804ec-bca2-45e9-b665-515de88ffa70",
      "type": "bidirectional",
      "position": {
        "x": 300,
        "y": 350.00000000000006
      },
      "data": {
        "label": "Air Conditioner",
        "component_id": "308804ec-bca2-45e9-b665-515de88ffa70",
        "system_type": "support",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
      "type": "bidirectional",
      "position": {
        "x": 225,
        "y": 479.90381056766586
      },
      "data": {
        "label": "Air Conditioner",
        "component_id": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
        "system_type": "support",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
      "type": "bidirectional",
      "position": {
        "x": 75.00000000000003,
        "y": 479.90381056766586
      },
      "data": {
        "label": "Air Conditioner",
        "component_id": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
        "system_type": "support",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "73c2a73c-0e92-4742-9775-af95e89e1841",
      "type": "bidirectional",
      "position": {
        "x": 0,
        "y": 350.00000000000006
      },
      "data": {
        "label": "Air Conditioner",
        "component_id": "73c2a73c-0e92-4742-9775-af95e89e1841",
        "system_type": "support",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
      "type": "bidirectional",
      "position": {
        "x": 74.99999999999993,
        "y": 220.0961894323343
      },
      "data": {
        "label": "Air Conditioner",
        "component_id": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
        "system_type": "support",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "d10aa05d-1f80-436d-b612-f52e28c44676",
      "type": "bidirectional",
      "position": {
        "x": 225,
        "y": 220.09618943233426
      },
      "data": {
        "label": "Air Conditioner",
        "component_id": "d10aa05d-1f80-436d-b612-f52e28c44676",
        "system_type": "support",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "1c16dacf-69cd-4061-b004-113d85948c61",
      "type": "bidirectional",
      "position": {
        "x": 800,
        "y": 350
      },
      "data": {
        "label": "Missile",
        "component_id": "1c16dacf-69cd-4061-b004-113d85948c61",
        "system_type": "firing",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    },
    {
      "id": "db30946a-2baf-49e4-9ceb-ec72365089b4",
      "type": "bidirectional",
      "position": {
        "x": 500,
        "y": 350
      },
      "data": {
        "label": "Super Rapid Gun Mount",
        "component_id": "db30946a-2baf-49e4-9ceb-ec72365089b4",
        "system_type": "firing",
        "node_type": "component"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #ef4444",
        "borderRadius": "4px",
        "width": 100,
        "height": 40
      }
    }
  ],
  "edges": [
    {
      "id": "ship-33f13701-849f-4030-8d71-a0f65eac992e-to-systems",
      "source": "33f13701-849f-4030-8d71-a0f65eac992e",
      "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_systems",
      "style": {
        "stroke": "#3b82f6",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "systems-to-ship-33f13701-849f-4030-8d71-a0f65eac992e",
      "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "target": "33f13701-849f-4030-8d71-a0f65eac992e",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "are_on",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systems-to-type-SystemType.FIRING",
      "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "target": "system_type_SystemType.FIRING",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_category",
      "style": {
        "stroke": "#7c3aed",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "type-SystemType.FIRING-to-systems",
      "source": "system_type_SystemType.FIRING",
      "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_a_type_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systems-to-type-SystemType.PROPULSION",
      "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "target": "system_type_SystemType.PROPULSION",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_category",
      "style": {
        "stroke": "#7c3aed",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "type-SystemType.PROPULSION-to-systems",
      "source": "system_type_SystemType.PROPULSION",
      "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_a_type_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systems-to-type-SystemType.SUPPORT",
      "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "target": "system_type_SystemType.SUPPORT",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_category",
      "style": {
        "stroke": "#7c3aed",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "type-SystemType.SUPPORT-to-systems",
      "source": "system_type_SystemType.SUPPORT",
      "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_a_type_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systems-to-type-SystemType.POWER_GENERATION",
      "source": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "target": "system_type_SystemType.POWER_GENERATION",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_category",
      "style": {
        "stroke": "#7c3aed",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "type-SystemType.POWER_GENERATION-to-systems",
      "source": "system_type_SystemType.POWER_GENERATION",
      "target": "systems_collective_33f13701-849f-4030-8d71-a0f65eac992e",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_a_type_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.PROPULSION-to-component-5358d044-9f4f-44cf-a975-341221f7189d",
      "source": "system_type_SystemType.PROPULSION",
      "target": "5358d044-9f4f-44cf-a975-341221f7189d",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-5358d044-9f4f-44cf-a975-341221f7189d-to-systemtype-SystemType.PROPULSION",
      "source": "5358d044-9f4f-44cf-a975-341221f7189d",
      "target": "system_type_SystemType.PROPULSION",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.PROPULSION-to-component-ab055ca1-2aa1-4c55-a1b1-39ead450a131",
      "source": "system_type_SystemType.PROPULSION",
      "target": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-ab055ca1-2aa1-4c55-a1b1-39ead450a131-to-systemtype-SystemType.PROPULSION",
      "source": "ab055ca1-2aa1-4c55-a1b1-39ead450a131",
      "target": "system_type_SystemType.PROPULSION",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.PROPULSION-to-component-8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
      "source": "system_type_SystemType.PROPULSION",
      "target": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-8e7c0c15-f44e-42be-bbf4-e04a62fc242e-to-systemtype-SystemType.PROPULSION",
      "source": "8e7c0c15-f44e-42be-bbf4-e04a62fc242e",
      "target": "system_type_SystemType.PROPULSION",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.PROPULSION-to-component-da570729-9a1e-4fa1-8399-e21c93c46e8f",
      "source": "system_type_SystemType.PROPULSION",
      "target": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-da570729-9a1e-4fa1-8399-e21c93c46e8f-to-systemtype-SystemType.PROPULSION",
      "source": "da570729-9a1e-4fa1-8399-e21c93c46e8f",
      "target": "system_type_SystemType.PROPULSION",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.POWER_GENERATION-to-component-443360a0-6218-486b-a34c-1813963177b7",
      "source": "system_type_SystemType.POWER_GENERATION",
      "target": "443360a0-6218-486b-a34c-1813963177b7",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-443360a0-6218-486b-a34c-1813963177b7-to-systemtype-SystemType.POWER_GENERATION",
      "source": "443360a0-6218-486b-a34c-1813963177b7",
      "target": "system_type_SystemType.POWER_GENERATION",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.POWER_GENERATION-to-component-5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
      "source": "system_type_SystemType.POWER_GENERATION",
      "target": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-5eefd3c9-cbe0-48db-a43d-89247f46ed8a-to-systemtype-SystemType.POWER_GENERATION",
      "source": "5eefd3c9-cbe0-48db-a43d-89247f46ed8a",
      "target": "system_type_SystemType.POWER_GENERATION",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.POWER_GENERATION-to-component-1872dfb4-58f9-48d4-a713-953cd7e1048a",
      "source": "system_type_SystemType.POWER_GENERATION",
      "target": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-1872dfb4-58f9-48d4-a713-953cd7e1048a-to-systemtype-SystemType.POWER_GENERATION",
      "source": "1872dfb4-58f9-48d4-a713-953cd7e1048a",
      "target": "system_type_SystemType.POWER_GENERATION",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.POWER_GENERATION-to-component-c652b6b3-9d13-4e4d-833e-dd71aecd102b",
      "source": "system_type_SystemType.POWER_GENERATION",
      "target": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-c652b6b3-9d13-4e4d-833e-dd71aecd102b-to-systemtype-SystemType.POWER_GENERATION",
      "source": "c652b6b3-9d13-4e4d-833e-dd71aecd102b",
      "target": "system_type_SystemType.POWER_GENERATION",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.SUPPORT-to-component-308804ec-bca2-45e9-b665-515de88ffa70",
      "source": "system_type_SystemType.SUPPORT",
      "target": "308804ec-bca2-45e9-b665-515de88ffa70",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-308804ec-bca2-45e9-b665-515de88ffa70-to-systemtype-SystemType.SUPPORT",
      "source": "308804ec-bca2-45e9-b665-515de88ffa70",
      "target": "system_type_SystemType.SUPPORT",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.SUPPORT-to-component-38093be3-acb7-40db-80ec-542dfc8d5d7d",
      "source": "system_type_SystemType.SUPPORT",
      "target": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-38093be3-acb7-40db-80ec-542dfc8d5d7d-to-systemtype-SystemType.SUPPORT",
      "source": "38093be3-acb7-40db-80ec-542dfc8d5d7d",
      "target": "system_type_SystemType.SUPPORT",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.SUPPORT-to-component-6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
      "source": "system_type_SystemType.SUPPORT",
      "target": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-6493cf2d-16e8-4d8f-b25c-a700e2c184b0-to-systemtype-SystemType.SUPPORT",
      "source": "6493cf2d-16e8-4d8f-b25c-a700e2c184b0",
      "target": "system_type_SystemType.SUPPORT",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.SUPPORT-to-component-73c2a73c-0e92-4742-9775-af95e89e1841",
      "source": "system_type_SystemType.SUPPORT",
      "target": "73c2a73c-0e92-4742-9775-af95e89e1841",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-73c2a73c-0e92-4742-9775-af95e89e1841-to-systemtype-SystemType.SUPPORT",
      "source": "73c2a73c-0e92-4742-9775-af95e89e1841",
      "target": "system_type_SystemType.SUPPORT",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.SUPPORT-to-component-73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
      "source": "system_type_SystemType.SUPPORT",
      "target": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-73e87156-1ff9-494e-9f7f-f0fdad5f4a20-to-systemtype-SystemType.SUPPORT",
      "source": "73e87156-1ff9-494e-9f7f-f0fdad5f4a20",
      "target": "system_type_SystemType.SUPPORT",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.SUPPORT-to-component-d10aa05d-1f80-436d-b612-f52e28c44676",
      "source": "system_type_SystemType.SUPPORT",
      "target": "d10aa05d-1f80-436d-b612-f52e28c44676",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-d10aa05d-1f80-436d-b612-f52e28c44676-to-systemtype-SystemType.SUPPORT",
      "source": "d10aa05d-1f80-436d-b612-f52e28c44676",
      "target": "system_type_SystemType.SUPPORT",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.FIRING-to-component-1c16dacf-69cd-4061-b004-113d85948c61",
      "source": "system_type_SystemType.FIRING",
      "target": "1c16dacf-69cd-4061-b004-113d85948c61",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-1c16dacf-69cd-4061-b004-113d85948c61-to-systemtype-SystemType.FIRING",
      "source": "1c16dacf-69cd-4061-b004-113d85948c61",
      "target": "system_type_SystemType.FIRING",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    },
    {
      "id": "systemtype-SystemType.FIRING-to-component-db30946a-2baf-49e4-9ceb-ec72365089b4",
      "source": "system_type_SystemType.FIRING",
      "target": "db30946a-2baf-49e4-9ceb-ec72365089b4",
      "type": "bidirectional",
      "sourceHandle": "bottom",
      "targetHandle": "top",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "has_equipment",
      "style": {
        "stroke": "#10b981",
        "strokeWidth": 2
      },
      "labelStyle": {
        "fill": "#374151",
        "fontWeight": 600
      }
    },
    {
      "id": "component-db30946a-2baf-49e4-9ceb-ec72365089b4-to-systemtype-SystemType.FIRING",
      "source": "db30946a-2baf-49e4-9ceb-ec72365089b4",
      "target": "system_type_SystemType.FIRING",
      "type": "bidirectional",
      "sourceHandle": "top",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "ArrowClosed"
      },
      "label": "is_part_of",
      "style": {
        "stroke": "#6b7280",
        "strokeWidth": 1,
        "strokeDasharray": "3,3"
      },
      "labelStyle": {
        "fill": "#6b7280",
        "fontWeight": 400
      }
    }
  ],
  "metadata": {
    "ship_id": "33f13701-849f-4030-8d71-a0f65eac992e",
    "ship_name": "INS ONE",
    "total_nodes": 22,
    "total_edges": 42,
    "hierarchy": {
      "ships": 1,
      "systems": 1,
      "system_types": 4,
      "components": 16
    }
  }
}
const initialNodes: Node[] = data.nodes

const initialEdges: Edge[] = data.edges

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 272;
const nodeHeight = 180;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
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

const AutoLayoutFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [nodes, edges, setNodes, setEdges, fitView]
  );

  // Auto-layout on mount
  useEffect(() => {
    onLayout('TB');
  }, []);

  return (
    <div className="flex border-white rounded-md bg-black/50 h-screen w-1/2 text-black" >
      <div style={{
        justifyContent: "flex-end",
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 4,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => onLayout('TB')}
          style={{
            padding: '8px 16px',
            background: '#1a365d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Vertical Layout
        </button>
        <button
          onClick={() => onLayout('LR')}
          style={{
            padding: '8px 16px',
            background: '#1a365d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Horizontal Layout
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="top-right"
        connectionMode={ConnectionMode.Loose}
      >
        {/* <Controls /> */}
        {/* <Background /> */}
      </ReactFlow>
    </div>
  );
};

export default AutoLayoutFlow;