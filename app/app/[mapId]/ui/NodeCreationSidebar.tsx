"use client";

import React from "react";
import { useMindMap, type NodeType } from "./MindMapContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faCheck, faLightbulb, faSignsPost, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
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
            data-tooltip-id="side-bar-tooltip"
            data-tooltip-content="Create a Social Node for platform-specific generated posts."
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

          <button
            className="group mt-3 flex w-full items-center gap-3 rounded-xl border border-lime-200 bg-gradient-to-br from-lime-50 to-white px-3 py-3 text-left transition hover:from-lime-100 hover:to-white"
            data-tooltip-id="side-bar-tooltip"
            data-tooltip-content="Create a NodePad for personal ideas and private notes."
            onClick={() => handleCreate("notepad")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-200/70 text-lime-700 shadow-sm">
              <FontAwesomeIcon icon={faBookOpen} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-dark">NodePad</span>
              <span className="text-xs text-body-color">Save personal ideas</span>
            </span>
          </button>

          <button
            className="group mt-3 flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white px-3 py-3 text-left transition hover:from-rose-100 hover:to-white"
            data-tooltip-id="side-bar-tooltip"
            data-tooltip-content="Create a Pain Point input node to capture audience friction."
            onClick={() => handleCreate("painpoint")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-200/70 text-rose-700 shadow-sm">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-dark">Pain Point</span>
              <span className="text-xs text-body-color">Capture user friction</span>
            </span>
          </button>

          <button
            className="group mt-3 flex w-full items-center gap-3 rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white px-3 py-3 text-left transition hover:from-sky-100 hover:to-white"
            data-tooltip-id="side-bar-tooltip"
            data-tooltip-content="Create a Proof Point input node to store evidence and credibility."
            onClick={() => handleCreate("proofpoint")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-200/70 text-sky-700 shadow-sm">
              <FontAwesomeIcon icon={faCheck} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-dark">Proof Point</span>
              <span className="text-xs text-body-color">Capture data and evidence</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
