"use client";

import React, { useState } from "react";
import { useMindMap, type NodeType } from "./MindMapContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faCheck, faChevronLeft, faChevronRight, faLightbulb, faSignsPost, faTriangleExclamation, faWaveSquare } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from 'react-tooltip'

export default function NodeCreationSidebar() {
  const { selectedNodeId, addChildNode, addRootNode } = useMindMap();
  const [isOpen, setIsOpen] = useState(true);
  const tooltipClassName =
    "z-20 max-w-[260px] rounded-xl border border-slate-700/70 bg-slate-900/95 px-3 py-2 text-xs font-medium leading-relaxed text-slate-100 shadow-xl backdrop-blur";

  const handleCreate = (type: NodeType) => {
    if (selectedNodeId) {
      addChildNode(selectedNodeId, type);
      return;
    }
    addRootNode(type);
  };

  const coreTools: Array<{
    type: NodeType;
    title: string;
    subtitle: string;
    tooltip: string;
    cardClass: string;
    iconWrapClass: string;
    icon: any;
  }> = [
    {
      type: "idea",
      title: "Idea Node",
      subtitle: "Define your central thought",
      tooltip: "Create an Idea Node that can generate social content.",
      cardClass: "border-emerald-200 from-emerald-50 to-white hover:from-emerald-100",
      iconWrapClass: "bg-emerald-200/85 text-emerald-700 group-hover:-rotate-6",
      icon: faLightbulb,
    },
    {
      type: "social",
      title: "Social Node",
      subtitle: "Generate platform outputs",
      tooltip: "Create a Social Node for platform-specific generated posts.",
      cardClass: "border-blue-200 from-blue-50 to-white hover:from-blue-100",
      iconWrapClass: "bg-blue-200/85 text-blue-700 group-hover:rotate-6",
      icon: faSignsPost,
    },
    {
      type: "notepad",
      title: "NodePad",
      subtitle: "Capture private notes",
      tooltip: "Create a NodePad for personal ideas and private notes.",
      cardClass: "border-lime-200 from-lime-50 to-white hover:from-lime-100",
      iconWrapClass: "bg-lime-200/85 text-lime-700 group-hover:-rotate-3",
      icon: faBookOpen,
    },
  ];

  const strategyTools: Array<{
    type: NodeType;
    title: string;
    subtitle: string;
    tooltip: string;
    cardClass: string;
    iconWrapClass: string;
    icon: any;
  }> = [
    {
      type: "painpoint",
      title: "Pain Point",
      subtitle: "Capture user friction",
      tooltip: "Create a Pain Point input node to capture audience friction.",
      cardClass: "border-rose-200 from-rose-50 to-white hover:from-rose-100",
      iconWrapClass: "bg-rose-200/85 text-rose-700 group-hover:rotate-3",
      icon: faTriangleExclamation,
    },
    {
      type: "proofpoint",
      title: "Proof Point",
      subtitle: "Capture evidence and data",
      tooltip: "Create a Proof Point input node to store evidence and credibility.",
      cardClass: "border-sky-200 from-sky-50 to-white hover:from-sky-100",
      iconWrapClass: "bg-sky-200/85 text-sky-700 group-hover:-rotate-3",
      icon: faCheck,
    },
    {
      type: "tone",
      title: "Tone Node",
      subtitle: "Control voice and style",
      tooltip: "Create a Tone Node to control the messaging style of generated output.",
      cardClass: "border-amber-200 from-amber-50 to-white hover:from-amber-100",
      iconWrapClass: "bg-amber-200/85 text-amber-700 group-hover:rotate-6",
      icon: faWaveSquare,
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 z-10 -translate-y-1/2">
      <Tooltip
        id="side-bar-tooltip"
        place="right"
        className={tooltipClassName}
        opacity={1}
        delayShow={120}
      />
      <div className="relative w-[320px]">
        {!isOpen ? (
          <button
            type="button"
            aria-label="Expand toolbar"
            onClick={() => setIsOpen(true)}
            className="group absolute left-0 top-1/2 z-30 flex h-12 -translate-x-1/4 -translate-y-1/2 items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-white px-3.5 text-blue-800 shadow-[0_8px_20px_rgba(15,23,42,0.16)] transition duration-200 hover:translate-x-0"
          >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-blue-200/60 opacity-0 blur-md transition duration-200 group-hover:opacity-100" />
            <FontAwesomeIcon icon={faChevronRight} className="relative text-xs transition duration-200 group-hover:scale-110" />
            <span className="relative text-[11px] font-semibold uppercase tracking-[0.1em]">Show Tools</span>
          </button>
        ) : null}

        <div
          className={[
            "relative overflow-hidden rounded-[8px] border border-stone-200 bg-white/95 shadow-[0_22px_48px_rgba(15,23,42,0.18)] backdrop-blur transition-transform duration-300 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-[calc(100%+20px)] pointer-events-none",
          ].join(" ")}
        >
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-emerald-200/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-8 h-24 w-24 rounded-full bg-orange-100/80 blur-2xl" />

        <div className="relative border-b border-stone-200/80 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Builder Panel</div>
              <h3 className="mt-1 text-lg font-semibold text-[#1f2b25]">Node Toolbar</h3>
              <p className="mt-1 text-xs text-stone-500">Select a tool and click to add instantly.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Hide toolbar"
                onClick={() => setIsOpen(false)}
                className="flex h-8 items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-600 transition hover:bg-stone-50"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[9px]" />
                Hide
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-stone-200/90 bg-white px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500">How To Use</div>
            <p className="mt-1 text-xs text-stone-600">
              Core Nodes build the content flow. Strategy Branches shape pain, proof, and tone before generation.
            </p>
          </div>
        </div>

        <div className="relative max-h-[66vh] overflow-y-auto px-5 pb-5 pt-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">Core Nodes</div>
          <div className="mt-2 space-y-2">
            {coreTools.map((tool) => (
              <button
                key={tool.type}
                data-tooltip-id="side-bar-tooltip"
                data-tooltip-content={tool.tooltip}
                className={[
                  "group flex w-full items-center gap-3 rounded-2xl border bg-gradient-to-br px-3 py-3 text-left",
                  "transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  tool.cardClass,
                ].join(" ")}
                onClick={() => handleCreate(tool.type)}
              >
                <span
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition duration-200 group-hover:scale-110",
                    tool.iconWrapClass,
                  ].join(" ")}
                >
                  <FontAwesomeIcon icon={tool.icon} />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-dark">{tool.title}</span>
                  <span className="text-xs text-body-color">{tool.subtitle}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">Strategy Branches</div>
          <div className="mt-2 space-y-2">
            {strategyTools.map((tool) => (
              <button
                key={tool.type}
                data-tooltip-id="side-bar-tooltip"
                data-tooltip-content={tool.tooltip}
                className={[
                  "group flex w-full items-center gap-3 rounded-2xl border bg-gradient-to-br px-3 py-3 text-left",
                  "transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  tool.cardClass,
                ].join(" ")}
                onClick={() => handleCreate(tool.type)}
              >
                <span
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition duration-200 group-hover:scale-110",
                    tool.iconWrapClass,
                  ].join(" ")}
                >
                  <FontAwesomeIcon icon={tool.icon} />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-dark">{tool.title}</span>
                  <span className="text-xs text-body-color">{tool.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
