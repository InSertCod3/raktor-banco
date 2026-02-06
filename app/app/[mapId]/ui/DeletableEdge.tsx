"use client";

import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";

type DeleteHandler = (edgeId: string) => void;

type DeletableEdgeData = {
  onDelete?: DeleteHandler;
};

export default function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<DeletableEdgeData>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          className="nodrag"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            zIndex: 5,
          }}
        >
          <button
            type="button"
            className="rounded-md bg-white px-2 py-1 text-[11px] text-red-600 shadow-1 hover:bg-red-50"
            onClick={(event) => {
              event.stopPropagation();
              data?.onDelete?.(id);
            }}
          >
            Delete
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
