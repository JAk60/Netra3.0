import {
    Background,
    Controls,
    Position,
    ReactFlow,Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import { glassCard } from './data';

interface FlowCanvasProps {
  shipData: any;
  selectedEquipment: any;
  currentSystemIndex: number;
}

export default function FlowCanvas({ shipData, selectedEquipment, currentSystemIndex }: FlowCanvasProps) {
  const systems = ['propulsion', 'power_generation', 'support', 'firing'];
  const systemLabels: Record<string, string> = {
    propulsion: 'PROPULSION',
    power_generation: 'POWER GENERATION',
    support: 'SUPPORT',
    firing: 'FIRING'
  };

  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [];
    let xOffset = 50;

    systems.forEach((systemKey, sysIdx) => {
      const system = shipData.systems[systemKey];
      if (!system) return;

      result.push({
        id: `system-${systemKey}`,
        type: 'default',
        position: { x: xOffset, y: 50 },
        data: { 
          label: (
            <div className="font-bold text-xs px-3 py-1 bg-slate-800 rounded-lg border border-white/20">
              {systemLabels[systemKey]}
            </div>
          ) 
        },
        style: {
          background: 'transparent',
          border: 'none',
          padding: 0
        }
      });

      system.components.forEach((component: any, idx: number) => {
        const isSelected = selectedEquipment[systemKey]?.some((eq: any) => eq.component_id === component.component_id);
        const isCurrent = sysIdx === currentSystemIndex;
        
        result.push({
          id: component.component_id,
          type: 'default',
          position: { x: xOffset, y: 120 + (idx * 80) },
          data: { 
            label: (
              <div className="text-center">
                <div className="font-semibold text-sm">{component.nomenclature}</div>
                <div className="text-xs text-gray-400">{component.component_name}</div>
              </div>
            ) 
          },
          style: {
            background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(71, 85, 105, 0.3)',
            border: isSelected ? '2px solid rgba(59, 130, 246, 0.6)' : '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            opacity: isCurrent ? 1 : 0.5,
            width: 150,
            fontSize: '12px',
            color: 'white'
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left
        });
      });

      xOffset += 300;
    });

    return result;
  }, [shipData, selectedEquipment, currentSystemIndex]);

  return (
    <div className={`${glassCard} h-[500px] relative`}>
      <ReactFlow
        nodes={nodes}
        edges={[]}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#334155" gap={20} />
        <Controls className="bg-slate-800/80 border border-white/10 rounded-lg" />
      </ReactFlow>
    </div>
  );
}