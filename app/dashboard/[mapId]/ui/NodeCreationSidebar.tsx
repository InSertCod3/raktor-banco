"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMindMap, type NodeType } from "./MindMapContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faBullhorn, faCheck, faChevronLeft, faChevronRight, faLightbulb, faSignsPost, faTriangleExclamation, faWaveSquare } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from 'react-tooltip'

export default function NodeCreationSidebar() {
  const { selectedNodeId, addChildNode, addRootNode } = useMindMap();
  const [isOpen, setIsOpen] = useState(false);
  const creationLockRef = useRef<number | null>(null);
  const tooltipClassName =
    "z-20 max-w-[260px] rounded-xl border border-slate-700/70 bg-slate-900/95 px-3 py-2 text-xs font-medium leading-relaxed text-slate-100 shadow-xl backdrop-blur";

  useEffect(() => {
    return () => {
      if (creationLockRef.current !== null) {
        window.clearTimeout(creationLockRef.current);
      }
    };
  }, []);

  const handleCreate = (type: NodeType) => {
    if (creationLockRef.current !== null) return;
    creationLockRef.current = window.setTimeout(() => {
      creationLockRef.current = null;
    }, 220);

    if (selectedNodeId) {
      addChildNode(selectedNodeId, type);
      return;
    }
    addRootNode(type);
  };

  const coreTools: Array<{
    id: string;
    type: NodeType;
    title: string;
    subtitle: string;
    tooltip: string;
    cardClass: string;
    iconWrapClass: string;
    icon: any;
  }> = [
    {
      id: "core-idea",
      type: "idea",
      title: "Core Idea",
      subtitle: "Set the main message",
      tooltip: "Start your map with the central idea you want to expand.",
      cardClass: "border-emerald-200 from-emerald-50 to-white hover:from-emerald-100",
      iconWrapClass: "bg-emerald-200/85 text-emerald-700 group-hover:-rotate-6",
      icon: faLightbulb,
    },
    {
      id: "social-draft",
      type: "social",
      title: "Social Draft",
      subtitle: "Generate platform-ready copy",
      tooltip: "Create a social output node for generated LinkedIn, Facebook, or Instagram drafts.",
      cardClass: "border-blue-200 from-blue-50 to-white hover:from-blue-100",
      iconWrapClass: "bg-blue-200/85 text-blue-700 group-hover:rotate-6",
      icon: faSignsPost,
    },
    {
      id: "cold-leads",
      type: "coldlead",
      title: "Prospect Outreach",
      subtitle: "Create platform ready direct message outreach",
      tooltip: "Create a standalone Prospect Outreach node to generate direct, ready-to-send LinkedIn outreach messages.",
      cardClass: "border-indigo-200 from-indigo-50 to-white hover:from-indigo-100",
      iconWrapClass: "bg-indigo-200/85 text-indigo-700 group-hover:rotate-3",
      icon: faSignsPost,
    },
    {
      id: "notes",
      type: "notepad",
      title: "Notes",
      subtitle: "Capture context and reminders",
      tooltip: "Add private notes to keep important context tied to your map.",
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
      title: "Audience Pain",
      subtitle: "Capture user friction",
      tooltip: "Document the core struggle your audience is trying to solve.",
      cardClass: "border-rose-200 from-rose-50 to-white hover:from-rose-100",
      iconWrapClass: "bg-rose-200/85 text-rose-700 group-hover:rotate-3",
      icon: faTriangleExclamation,
    },
    {
      type: "proofpoint",
      title: "Proof & Evidence",
      subtitle: "Capture proof and credibility",
      tooltip: "Add data, examples, or outcomes that support your main idea.",
      cardClass: "border-sky-200 from-sky-50 to-white hover:from-sky-100",
      iconWrapClass: "bg-sky-200/85 text-sky-700 group-hover:-rotate-3",
      icon: faCheck,
    },
    {
      type: "tone",
      title: "Voice & Tone",
      subtitle: "Guide style and delivery",
      tooltip: "Define how the message should sound before generating content.",
      cardClass: "border-amber-200 from-amber-50 to-white hover:from-amber-100",
      iconWrapClass: "bg-amber-200/85 text-amber-700 group-hover:rotate-6",
      icon: faWaveSquare,
    },
    {
      type: "hookcta",
      title: "Hook & CTA",
      subtitle: "Grab attention in 2 seconds",
      tooltip: "Create an opening hook with a 'Did you know?' angle and a clear call-to-action.",
      cardClass: "border-violet-200 from-violet-50 to-white hover:from-violet-100",
      iconWrapClass: "bg-violet-200/85 text-violet-700 group-hover:-rotate-6",
      icon: faBullhorn,
    },
  ];

  return (
    <div className="pointer-events-none fixed left-2 right-2 top-16 z-10 sm:left-4 sm:right-auto sm:top-1/2 sm:-translate-y-1/2">
      <Tooltip
        id="side-bar-tooltip"
        place="right"
        className={tooltipClassName}
        opacity={1}
        delayShow={120}
      />
      <div className="relative w-full sm:w-[320px]">
        {!isOpen ? (
          <button
            type="button"
            aria-label="Expand toolbar"
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto group absolute left-2 top-1/2 z-30 flex h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-white px-3.5 text-blue-800 shadow-[0_8px_20px_rgba(15,23,42,0.16)] transition duration-200 sm:left-4 sm:translate-x-0"
          >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-blue-200/60 opacity-0 blur-md transition duration-200 group-hover:opacity-100" />
            <FontAwesomeIcon icon={faChevronRight} className="relative text-xs transition duration-200 group-hover:scale-110" />
            <span className="relative text-[11px] font-semibold uppercase tracking-[0.1em]">Tools</span>
          </button>
        ) : null}

        <div
          className={[
            "relative flex max-h-[80dvh] flex-col overflow-hidden rounded-[8px] border border-stone-200 bg-white/95 shadow-[0_22px_48px_rgba(15,23,42,0.18)] backdrop-blur transition-all duration-300 ease-out sm:max-h-[75dvh]",
            isOpen
              ? "translate-x-0 opacity-100 visible pointer-events-auto"
              : "-translate-x-[calc(100%+20px)] opacity-0 invisible pointer-events-none",
          ].join(" ")}
        >
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-emerald-200/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-8 h-24 w-24 rounded-full bg-orange-100/80 blur-2xl" />

        <div className="relative shrink-0 border-b border-stone-200/80 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Map Builder</div>
              <h3 className="mt-1 text-lg font-semibold text-[#1f2b25]">Build Your Map</h3>
              <p className="mt-1 text-xs text-stone-500">Choose what to add next to keep your idea flow moving.</p>
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
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500">Workflow</div>
            <p className="mt-1 text-xs text-stone-600">
              Start with core nodes, then add strategy branches to shape pain points, proof, and tone before generating content.
            </p>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">1. Core Flow Nodes</div>
          <div className="mt-2 space-y-2">
            {coreTools.map((tool) => (
              <button
                key={tool.id}
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

          <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">2. Strategy Branch Nodes</div>
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
          <div className="h-2" />
        </div>
      </div>
      </div>
    </div>
  );
}
