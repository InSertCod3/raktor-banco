"use client";

import React from "react";
import { useMindMap, type NodeType } from "./MindMapContext";

export default function NodeCreationSidebar() {
  const { selectedNodeId, addChildNode, addRootNode } = useMindMap();

  const handleCreate = (type: NodeType) => {
    if (selectedNodeId) {
      addChildNode(selectedNodeId, type);
      return;
    }
    addRootNode(type);
  };

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 w-64">
      <div className="w-full bg-white/90 backdrop-blur shadow-lg rounded-lg border border-stroke">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-dark">Create Nodes</h3>
        </div>
        <div className="p-4 space-y-4">
          <button
            className="w-full justify-start text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md px-4 py-2 text-left hover:bg-blue-50"
            onClick={() => handleCreate("idea")}
          >
            <span className="inline-block w-4 h-4 mr-2">+</span>
            Create Idea Node
          </button>

          <button
            className="w-full justify-start text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md px-4 py-2 text-left hover:bg-blue-50"
            onClick={() => handleCreate("social")}
          >
            <span className="inline-block w-4 h-4 mr-2">+</span>
            Create Social Node
          </button>
        </div>
      </div>
    </div>
  );
}
