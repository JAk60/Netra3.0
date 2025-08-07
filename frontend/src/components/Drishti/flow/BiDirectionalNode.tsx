import React, { memo } from 'react';
import {
    type BuiltInNode,
    type NodeProps,
    Handle,
    Position,
} from '@xyflow/react';

const BiDirectionalNode = ({ data }: NodeProps<BuiltInNode>) => {
    return (
        <div 
        // style={{
        //     background: '#ffffff',
        //     border: '2px solid #1f2937',
        //     borderRadius: '12px',
        //     padding: '12px 20px',
        //     minWidth: '100px',
        //     textAlign: 'center',
        //     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        //     fontSize: '14px',
        //     fontWeight: '500',
        //     color: '#1f2937',
        //     position: 'relative'
        // }}
        >
            {/* Handles for connections */}
            <Handle 
                type="source" 
                position={Position.Left} 
                id="left"
                style={{
                    background: '#6366f1',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    left: '-8px'
                }}
            />
            <Handle 
                type="source" 
                position={Position.Right} 
                id="right"
                style={{
                    background: '#6366f1',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    right: '-8px'
                }}
            />
            <Handle 
                type="source" 
                position={Position.Top} 
                id="top"
                style={{
                    background: '#6366f1',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    top: '-8px'
                }}
            />
            <Handle 
                type="source" 
                position={Position.Bottom} 
                id="bottom"
                style={{
                    background: '#6366f1',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    bottom: '-8px'
                }}
            />
            
            {/* Node content */}
            {data?.label || 'Node'}
        </div>
    );
};

export default memo(BiDirectionalNode);