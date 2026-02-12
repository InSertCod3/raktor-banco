"use client";

import React from "react";
import { useMindMap, type NodeType } from "./MindMapContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faSignsPost } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from 'react-tooltip'

export default function NodeCreationSidebar() {
  const { selectedNodeId, addChildNode, addRootNode } = useMindMap();
  const tooltipClassName =
    "z-20 max-w-[260px] rounded-xl border border-slate-700/70 bg-slate-900/95 px-3 py-2 text-xs font-medium leading-relaxed text-slate-100 shadow-xl backdrop-blur";

  const handleCreate = (type: NodeType) => {
    if (selectedNodeId) {
      addChildNode(selectedNodeId, type);
      return;
    }
    addRootNode(type);
  };

  return (
    <div className="fixed left-4 top-1/2 z-10 w-64 -translate-y-1/2">
      <Tooltip
        id="side-bar-tooltip"
        place="right"
        className={tooltipClassName}
        opacity={1}
        delayShow={120}
      />
      <div className="w-full overflow-hidden rounded-2xl border border-stroke bg-white/90 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-dark">
              Tools
            </h3>
            <p className="mt-1 text-xs text-body-color">Create nodes fast</p>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-white">
            <span className="relative inline-block">
    <img
    className="h-10 w-10 rounded-full"
  src="https://api.dicebear.com/9.x/bottts/svg?seed=Wyatt"
  alt="avatar" />
    <span className="absolute animate-pulse top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
</span>
          </div>

        </div>
        <div className="px-4 pb-4">
          <button
            data-tooltip-id="side-bar-tooltip"
            data-tooltip-content="Create an Idea Node that can generate social content."
            className="group flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-3 py-3 text-left transition hover:from-emerald-100 hover:to-white"
            onClick={() => handleCreate("idea")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200/70 text-emerald-700 shadow-sm">
              <FontAwesomeIcon icon={faLightbulb} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-dark">Idea Node</span>
              <span className="text-xs text-body-color">Capture a thought</span>
            </span>
          </button>

          <button
            className="group mt-3 flex w-full items-center gap-3 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white px-3 py-3 text-left transition hover:from-blue-100 hover:to-white"
            onClick={() => handleCreate("social")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-200/70 text-blue-700 shadow-sm">
              <FontAwesomeIcon icon={faSignsPost} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-dark">Social Node</span>
              <span className="text-xs text-body-color">Attach generated copy</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
