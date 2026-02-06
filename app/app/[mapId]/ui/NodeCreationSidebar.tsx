"use client";

import React from "react";
import { useMindMap, type NodeType } from "./MindMapContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faSignsPost } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from 'react-tooltip'

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
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 w-24">
      <Tooltip className="z-10" id="side-bar-tooltip" place="right" />
      <div className="w-full bg-white/90 backdrop-blur shadow-lg rounded-lg border border-stroke">
        <div className="flex flex-col items-center p-4">
          <h3 className="text-lg font-semibold text-dark">Tools</h3>
        </div>
        <div className="flex flex-col items-center p-4 space-y-4">
          <button
            data-tooltip-id="side-bar-tooltip" data-tooltip-content="Create a 'Idea Node' that uses your ideas to generate social media content for your feed."
            className="justify-start text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md px-4 py-2 text-left hover:bg-blue-50"
            onClick={() => handleCreate("idea")}
          >
            <FontAwesomeIcon icon={faLightbulb} />
          </button>

          <button
            className="justify-start text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md px-4 py-2 text-left hover:bg-blue-50"
            onClick={() => handleCreate("social")}
          >
            <FontAwesomeIcon icon={faSignsPost} />
          </button>
        </div>
      </div>
    </div>
  );
}
