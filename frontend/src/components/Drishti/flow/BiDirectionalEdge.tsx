import React from 'react';
import {
    getBezierPath,
    useStore,
    BaseEdge,
    EdgeLabelRenderer,
    type EdgeProps,
    type ReactFlowState,
} from '@xyflow/react';

export type GetSpecialPathParams = {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
};

export const getSpecialPath = (
    { sourceX, sourceY, targetX, targetY }: GetSpecialPathParams,
    offsetX: number,
    offsetY: number
) => {
    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;

    return `M ${sourceX} ${sourceY} Q ${centerX + offsetX} ${centerY + offsetY} ${targetX} ${targetY}`;
};

export default function CustomEdge({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    label
}: EdgeProps) {
    const { isBiDirectional, isFirstEdge } = useStore((s: ReactFlowState) => {
        // Check if there's a bidirectional connection
        const reverseEdge = s.edges.find(
            (e) => e.source === target && e.target === source
        );

        const isBiDirectional = !!reverseEdge;

        // Determine if this is the "first" edge (for consistent spacing)
        const isFirstEdge = !reverseEdge || (reverseEdge && id < reverseEdge.id);

        return { isBiDirectional, isFirstEdge };
    });

    const edgePathParams = {
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    };

    let path = '';
    let labelX = 0;
    let labelY = 0;

    if (isBiDirectional) {
        // Calculate spacing based on edge direction and position
        const isHorizontal = Math.abs(targetX - sourceX) > Math.abs(targetY - sourceY);
        const spacing = 45;

        let offsetX = 0;
        let offsetY = 0;

        if (isHorizontal) {
            // For horizontal edges, offset vertically
            offsetY = isFirstEdge ? -spacing : spacing;
        } else {
            // For vertical edges, offset horizontally
            offsetX = isFirstEdge ? -spacing : spacing;
            // Also add a small vertical offset for better separation
            offsetY = isFirstEdge ? -spacing / 2 : spacing / 2;
        }

        path = getSpecialPath(edgePathParams, offsetX, offsetY);

        // Calculate label position for curved path
        const centerX = (sourceX + targetX) / 2;
        const centerY = (sourceY + targetY) / 2;
        labelX = centerX + offsetX;
        labelY = centerY + offsetY;
    } else {
        [path, labelX, labelY] = getBezierPath(edgePathParams);
    }

    return (
        <>
            <BaseEdge path={path} markerEnd={markerEnd} />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            color:'black',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            fontWeight: 700,
                            background: 'white',
                            padding: '2px 6px',
                            borderRadius: 3,
                            border: '1px solid #ccc',
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}