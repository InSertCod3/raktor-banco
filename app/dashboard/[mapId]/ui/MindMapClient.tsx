"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import toast from "react-hot-toast";
import { generateId } from "@/app/lib/utils";
import LoadingModal from "@/app/components/LoadingModal";
import IdeaNode from "./IdeaNode";
import InsightInputNode from "./InsightInputNode";
import NodePadNode from "./NodePadNode";
import SocialNode from "./SocialNode";
import SuggestionNode from "./SuggestionNode";
import ToneNode from "./ToneNode";
import NodeCreationSidebar from "./NodeCreationSidebar";
import DeletableEdge from "./DeletableEdge";
import { REACT_FLOW_PANE_BACKGROUND } from "./constant";
import {
  MindMapContext,
  type Generation,
  type NodeType,
  type Platform,
} from "./MindMapContext";

type MapResponse = {
  map: {
    id: string;
    title: string;
    nodes: Node[];
    edges: Edge[];
  };
};

type PersistedGraph = {
  nodes: Array<{
    id: string;
    type?: string;
    position: { x: number; y: number };
    data?: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    data?: Record<string, unknown>;
    animated?: boolean;
    style?: Record<string, unknown>;
  }>;
};

const WORKSPACE_BOUNDS: [[number, number], [number, number]] = [
  [-6800, -6400],
  [6800, 6400],
];
const NODE_COLLISION_X = 390;
const NODE_COLLISION_Y = 280;
const NODE_GRID_STEP_X = 360;
const NODE_GRID_STEP_Y = 220;

function clampPosition(position: { x: number; y: number }): { x: number; y: number } {
  return {
    x: Math.min(Math.max(position.x, WORKSPACE_BOUNDS[0][0]), WORKSPACE_BOUNDS[1][0]),
    y: Math.min(Math.max(position.y, WORKSPACE_BOUNDS[0][1]), WORKSPACE_BOUNDS[1][1]),
  };
}

function createId(): string {
  return generateId(24);
}

function buildNodeData(type: NodeType, data?: Record<string, unknown>): Record<string, unknown> {
  if (type === "social") return { label: "LinkedIn", type: "social", platform: "LINKEDIN", content: "", ...data };
  if (type === "notepad") return { text: "", ...data };
  if (type === "suggestion") return { title: "Generation Suggestion", text: "Use this note to generate content.", ...data };
  if (type === "painpoint") return { text: "", ...data };
  if (type === "proofpoint") return { text: "", ...data };
  if (type === "hookcta") return { text: "", ...data };
  if (type === "tone") return { ...data };
  return { text: "", ...data };
}

function toPersistedGraph(nodes: Node[], edges: Edge[]): PersistedGraph {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: typeof node.type === "string" ? node.type : undefined,
      position: clampPosition(node.position),
      data: (node.data as Record<string, unknown> | undefined) ?? {},
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: typeof edge.type === "string" ? edge.type : undefined,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      data: ((edge.data as Record<string, unknown> | undefined) ?? {}) as Record<string, unknown>,
      animated: edge.animated,
      style: (edge.style as Record<string, unknown> | undefined) ?? undefined,
    })),
  };
}

export default function MindMapClient({ mapId }: { mapId: string }) {
  const reactFlowRef = useRef<ReactFlowInstance<Node, Edge> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mapTitle, setMapTitle] = useState("Loading…");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [activeGenerations, setActiveGenerations] = useState(0);
  const lastSavedGraphRef = useRef<string>("");
  const autosaveAbortRef = useRef<AbortController | null>(null);
  const autosaveRequestSeqRef = useRef(0);
  const persistedTitleRef = useRef<string>("");
  const isProcessingWork = activeGenerations > 0 || isSaving || isSavingTitle;

  const nodeTypes = useMemo(
    () => ({
      idea: IdeaNode,
      painpoint: InsightInputNode,
      proofpoint: InsightInputNode,
      hookcta: InsightInputNode,
      tone: ToneNode,
      social: SocialNode,
      notepad: NodePadNode,
      suggestion: SuggestionNode,
    }),
    [],
  );
  const edgeTypes = useMemo(
    () => ({
      deletable: DeletableEdge,
    }),
    [],
  );
  const normalizedTitle = mapTitle.trim() || "Untitled map";
  const hasUnsavedTitleChanges =
    loaded && normalizedTitle !== persistedTitleRef.current;

  function isPositionOccupied(position: { x: number; y: number }): boolean {
    return nodes.some(
      (node) =>
        Math.abs(node.position.x - position.x) < NODE_COLLISION_X &&
        Math.abs(node.position.y - position.y) < NODE_COLLISION_Y,
    );
  }

  function findNearestFreePosition(basePosition: { x: number; y: number }): { x: number; y: number } {
      const clampedBase = clampPosition(basePosition);
      if (!isPositionOccupied(clampedBase)) return clampedBase;
  
      for (let ring = 1; ring <= 10; ring += 1) {
        // First, check positions to the right (positive x direction)
        for (let dy = -ring; dy <= ring; dy += 1) {
          const dx = ring;
          const candidate = clampPosition({
            x: clampedBase.x + dx * NODE_GRID_STEP_X,
            y: clampedBase.y + dy * NODE_GRID_STEP_Y,
          });
          if (!isPositionOccupied(candidate)) return candidate;
        }
        // Then check other positions in the ring
        for (let dx = -ring; dx <= ring; dx += 1) {
          for (let dy = -ring; dy <= ring; dy += 1) {
            if (Math.abs(dx) !== ring && Math.abs(dy) !== ring) continue;
            const candidate = clampPosition({
              x: clampedBase.x + dx * NODE_GRID_STEP_X,
              y: clampedBase.y + dy * NODE_GRID_STEP_Y,
            });
            if (!isPositionOccupied(candidate)) return candidate;
          }
        }
      }
  
      return clampPosition({
        x: clampedBase.x + NODE_GRID_STEP_X,
        y: clampedBase.y + NODE_GRID_STEP_Y,
      });
    }

  function getViewportCenterPosition(): { x: number; y: number } {
    const reactFlow = reactFlowRef.current;
    if (reactFlow && typeof window !== "undefined") {
      const centerScreen = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      if ("screenToFlowPosition" in reactFlow && typeof reactFlow.screenToFlowPosition === "function") {
        return clampPosition(reactFlow.screenToFlowPosition(centerScreen));
      }
      const viewport = reactFlow.getViewport();
      return clampPosition({
        x: (centerScreen.x - viewport.x) / viewport.zoom,
        y: (centerScreen.y - viewport.y) / viewport.zoom,
      });
    }
    return { x: 0, y: 0 };
  }

  useEffect(() => {
    toast(
      (t) => (
        <div className="flex items-center gap-2">
          <span>Tip: click a node to edit/generate</span>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-2 rounded-full p-1 hover:bg-black/5"
          >
            ✕
          </button>
        </div>
      ),
      {
        id: "map-tip",
        position: "top-right",
        duration: 8000,
      },
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoaded(false);
      setLoadError(null);
      const res = await fetch(`/api/maps/${mapId}`, { cache: "no-store" });
      if (!res.ok) {
        if (!cancelled)
          setLoadError("Could not load map (is DATABASE_URL set?)");
        return;
      }
      const data = (await res.json()) as MapResponse;
      if (cancelled) return;

      const hydratedNodes = data.map.nodes.map((node) => ({
        ...node,
        position: clampPosition(node.position),
      }));
      const hydratedEdges = data.map.edges.map((edge) => ({
        ...edge,
        type: "deletable",
        data: {
          ...(edge.data as Record<string, unknown>),
          onDelete: deleteEdgeById,
        },
      }));

      setMapTitle(data.map.title);
      persistedTitleRef.current = data.map.title.trim() || "Untitled map";
      setNodes(hydratedNodes);
      setEdges(hydratedEdges);
      lastSavedGraphRef.current = JSON.stringify(toPersistedGraph(hydratedNodes, hydratedEdges));
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [mapId, setEdges, setNodes]);

  // Autosave graph
  useEffect(() => {
    if (!loaded) return;
    if (activeGenerations > 0) return;
    const graphPayload = toPersistedGraph(nodes, edges);
    const graphSnapshot = JSON.stringify(graphPayload);
    if (graphSnapshot === lastSavedGraphRef.current) return;

    const requestSeq = ++autosaveRequestSeqRef.current;
    const timeoutId = window.setTimeout(() => {
      autosaveAbortRef.current?.abort();
      const controller = new AbortController();
      autosaveAbortRef.current = controller;

      setIsSaving(true);
      void (async () => {
        try {
          const res = await fetch(`/api/maps/${mapId}/graph`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(graphPayload),
            signal: controller.signal,
          });
          if (!res.ok) return;
          if (requestSeq !== autosaveRequestSeqRef.current) return;

          lastSavedGraphRef.current = graphSnapshot;
          toast.success("Saved", {
            id: "autosave",
            position: "top-center",
            duration: 2000,
          });
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }
        } finally {
          if (requestSeq === autosaveRequestSeqRef.current) {
            setIsSaving(false);
          }
        }
      })();
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loaded, mapId, nodes, edges, activeGenerations]);

  useEffect(() => {
    if (!isProcessingWork) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [isProcessingWork]);

  async function saveTitleIfChanged() {
    if (!loaded) return;
    const nextTitle = normalizedTitle;
    if (nextTitle === persistedTitleRef.current) return;
    setIsSavingTitle(true);
    setMapTitle(nextTitle);
    try {
      const res = await fetch(`/api/maps/${mapId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      if (!res.ok) {
        toast.error("Could not save title", {
          id: "autosave-title-error",
          position: "top-center",
          duration: 2000,
        });
        return;
      }
      persistedTitleRef.current = nextTitle;
      toast.success("Title saved", {
        id: "autosave-title",
        position: "top-center",
        duration: 2000,
      });
    } finally {
      setIsSavingTitle(false);
    }
  }

  function onConnect(conn: Connection) {
    setEdges((eds) =>
      addEdge(
        {
          ...conn,
          id: createId(),
          type: "deletable",
          data: { onDelete: deleteEdgeById },
        },
        eds,
      ),
    );
  }

  function snapToNode(node: Node) {
    const reactFlow = reactFlowRef.current;
    if (!reactFlow) return;
    const currentZoom = reactFlow.getZoom();
    reactFlow.setCenter(node.position.x + 170, node.position.y + 90, {
      duration: 180,
      zoom: Math.max(currentZoom, 1),
    });
  }

  function addChildNodeById(
    parentNodeId: string,
    type: NodeType = "idea",
    data?: Record<string, unknown>,
    options?: {
      sourceHandle?: string;
      targetHandle?: string;
      positionOffset?: { x: number; y: number };
    },
  ): string | null {
    const parent = nodes.find((n) => n.id === parentNodeId) ?? nodes[0];
    if (!parent) return null;

    const collectConnectedNodeIds = (startId: string): Set<string> => {
      const visited = new Set<string>([startId]);
      const queue: string[] = [startId];

      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) continue;

        for (const edge of edges) {
          if (edge.source !== current && edge.target !== current) continue;
          const neighbor = edge.source === current ? edge.target : edge.source;
          if (visited.has(neighbor)) continue;
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }

      return visited;
    };

    const id = createId();
    const childType: NodeType = type;
    let edgeSourceId = parent.id;
    let position = options?.positionOffset
      ? {
          x: parent.position.x + options.positionOffset.x,
          y: parent.position.y + options.positionOffset.y,
        }
      : getViewportCenterPosition();

    // Social nodes should attach to the selected source node.
    if (childType === "social" && !options?.positionOffset) {
      edgeSourceId = parent.id;
      position = getViewportCenterPosition();
    }

    const clampedPosition = findNearestFreePosition(position);

    const child: Node = {
      id,
      type: childType,
      position: clampedPosition,
      data: buildNodeData(childType, data),
    };

    setNodes((ns) => [...ns, child]);
    setEdges((es) => [
      ...es,
      {
        id: createId(),
        source: edgeSourceId,
        target: id,
        sourceHandle: options?.sourceHandle,
        targetHandle: options?.targetHandle,
        type: "deletable",
        data: { onDelete: deleteEdgeById },
      },
    ]);
    setSelectedNodeId(id);
    window.requestAnimationFrame(() => snapToNode(child));
    return id;
  }

  function addRootNode(type: NodeType, data?: Record<string, unknown>): string {
    const id = createId();
    const node: Node = {
      id,
      type,
      position: findNearestFreePosition(getViewportCenterPosition()),
      data: buildNodeData(type, data),
    };

    setNodes((ns) => [...ns, node]);
    setSelectedNodeId(id);
    window.requestAnimationFrame(() => snapToNode(node));
    return id;
  }

  function updateNodeText(nodeId: string, text: string) {
    setNodes((ns) =>
      ns.map((n) =>
        n.id === nodeId ? { ...n, data: { ...(n.data as any), text } } : n,
      ),
    );
  }

  function updateNodeData(nodeId: string, dataPatch: Record<string, unknown>) {
    setNodes((ns) =>
      ns.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...(n.data as Record<string, unknown>), ...dataPatch } }
          : n,
      ),
    );
  }

  function getNodeText(nodeId: string): string {
    const node = nodes.find((n) => n.id === nodeId);
    return String((node?.data as { text?: unknown } | undefined)?.text ?? "");
  }

  function deleteNode(nodeId: string) {
    setSelectedNodeId((current) => (current === nodeId ? null : current));
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setEdges((es) =>
      es.filter((e) => e.source !== nodeId && e.target !== nodeId),
    );
  }

  function deleteEdgeById(edgeId: string) {
    setEdges((es) => es.filter((e) => e.id !== edgeId));
  }

  function createSuggestionNode(sourceNodeId: string) {
    const source = nodes.find((node) => node.id === sourceNodeId);
    if (!source) return;

    const existingSuggestionEdge = edges.find((edge) => {
      if (edge.source !== sourceNodeId) return false;
      const targetNode = nodes.find((node) => node.id === edge.target);
      return targetNode?.type === "suggestion";
    });

    if (existingSuggestionEdge) {
      setSelectedNodeId(existingSuggestionEdge.target);
      return;
    }

    const suggestionId = createId();
    const suggestionNode: Node = {
      id: suggestionId,
      type: "suggestion",
      position: findNearestFreePosition(getViewportCenterPosition()),
      data: {
        title: "Smart Advice",
        text: "I will analyze the connected parent node and suggest improvements.",
        sourceNodeId,
        lastGeneratedSourceText: "",
      },
    };

    const suggestionEdge: Edge = {
      id: createId(),
      source: sourceNodeId,
      target: suggestionId,
      type: "deletable",
      animated: true,
      style: { strokeDasharray: "6 4", stroke: "#8b5cf6", strokeWidth: 1.8 },
      data: { onDelete: deleteEdgeById, suggestion: true },
    };

    setNodes((current) => [...current, suggestionNode]);
    setEdges((current) => [...current, suggestionEdge]);
    setSelectedNodeId(suggestionId);
    window.requestAnimationFrame(() => snapToNode(suggestionNode));
  }

  async function generate(
    nodeId: string,
    platform: Platform,
    handlers?: {
      onStart?: () => void;
      onDelta?: (delta: string) => void;
    },
    options?: {
      socialNodeId?: string;
      keptSentences?: string;
    },
  ): Promise<{ generation: Generation; socialNode?: Node; socialEdge?: Edge }> {
    setActiveGenerations((current) => current + 1);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mapId,
          nodeId,
          platform,
          socialNodeId: options?.socialNodeId,
          keptSentences: options?.keptSentences,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Generation failed.");
      }

      if (!res.body) {
        throw new Error("Generation stream is unavailable.");
      }

      const upsertSocialNode = (socialNode: Node | undefined) => {
        if (!socialNode) return;
        setNodes((current) => {
          const exists = current.some((node) => node.id === socialNode.id);
          if (exists) {
            return current.map((node) => (node.id === socialNode.id ? socialNode : node));
          }
          return [...current, socialNode];
        });
      };

      const upsertSocialEdge = (socialEdge: Edge | undefined) => {
        if (!socialEdge) return;
        const edgeWithDelete = {
          ...socialEdge,
          type: "deletable",
          data: {
            ...(socialEdge.data as Record<string, unknown> | undefined),
            onDelete: deleteEdgeById,
          },
        };

        setEdges((current) => {
          const exists = current.some((edge) => edge.id === edgeWithDelete.id);
          if (exists) {
            return current.map((edge) => (edge.id === edgeWithDelete.id ? edgeWithDelete : edge));
          }
          return [...current, edgeWithDelete];
        });
      };

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedSocialNodeId: string | null = null;
      let finalGeneration: Generation | undefined;
      let finalSocialNode: Node | undefined;
      let finalSocialEdge: Edge | undefined;

      const processLine = (line: string) => {
        const event = JSON.parse(line) as {
          type?: "start" | "delta" | "done" | "error";
          error?: string;
          delta?: string;
          socialNodeId?: string;
          socialNode?: Node;
          socialEdge?: Edge;
          generation?: Generation;
        };

        if (event.type === "error") {
          throw new Error(event.error ?? "Generation failed.");
        }

        if (event.type === "start") {
          handlers?.onStart?.();
          finalSocialNode = event.socialNode;
          finalSocialEdge = event.socialEdge;
          streamedSocialNodeId = event.socialNode?.id ?? null;
          upsertSocialNode(event.socialNode);
          upsertSocialEdge(event.socialEdge);
          return;
        }

        if (event.type === "delta" && event.delta) {
          handlers?.onDelta?.(event.delta);
          const socialNodeId = event.socialNodeId ?? streamedSocialNodeId;
          if (socialNodeId) {
            setNodes((current) =>
              current.map((node) =>
                node.id === socialNodeId
                  ? {
                      ...node,
                      data: {
                        ...(node.data as Record<string, unknown>),
                        content: `${String((node.data as { content?: unknown } | null)?.content ?? "")}${event.delta}`,
                      },
                    }
                  : node,
              ),
            );
          }
          return;
        }

        if (event.type === "done") {
          finalGeneration = event.generation;
          finalSocialNode = event.socialNode;
          finalSocialEdge = event.socialEdge;
          upsertSocialNode(event.socialNode);
          upsertSocialEdge(event.socialEdge);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let lineBreak = buffer.indexOf("\n");
        while (lineBreak >= 0) {
          const line = buffer.slice(0, lineBreak).trim();
          buffer = buffer.slice(lineBreak + 1);
          if (line) {
            processLine(line);
          }
          lineBreak = buffer.indexOf("\n");
        }
      }

      const trailing = buffer.trim();
      if (trailing) {
        processLine(trailing);
      }

      if (!finalGeneration) {
        throw new Error("Generation ended without a final result.");
      }

      return {
        generation: finalGeneration,
        socialNode: finalSocialNode,
        socialEdge: finalSocialEdge,
      };
    } finally {
      setActiveGenerations((current) => Math.max(0, current - 1));
    }
  }

  async function listGenerations(
    nodeId: string,
    platform: Platform,
  ): Promise<Generation[]> {
    const res = await fetch(
      `/api/nodes/${nodeId}/generated?platform=${platform}`,
      {
        cache: "no-store",
      },
    );
    const data = (await res.json()) as any;
    if (!res.ok) throw new Error(data?.error ?? "Could not load generations.");
    return (data.items as Generation[]) ?? [];
  }

  async function generateSuggestion(
    sourceNodeId: string,
    handlers?: {
      onStart?: () => void;
      onDelta?: (delta: string) => void;
    },
  ): Promise<{ output: string }> {
    const res = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mapId, sourceNodeId }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Suggestion generation failed.");
    }
    if (!res.body) {
      throw new Error("Suggestion stream is unavailable.");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let output = "";

    const processLine = (line: string) => {
      const event = JSON.parse(line) as {
        type?: "start" | "delta" | "done" | "error";
        delta?: string;
        output?: string;
        error?: string;
      };

      if (event.type === "error") {
        throw new Error(event.error ?? "Suggestion generation failed.");
      }

      if (event.type === "start") {
        handlers?.onStart?.();
        return;
      }

      if (event.type === "delta" && event.delta) {
        output += event.delta;
        handlers?.onDelta?.(event.delta);
        return;
      }

      if (event.type === "done") {
        output = event.output ?? output;
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let lineBreak = buffer.indexOf("\n");
      while (lineBreak >= 0) {
        const line = buffer.slice(0, lineBreak).trim();
        buffer = buffer.slice(lineBreak + 1);
        if (line) {
          processLine(line);
        }
        lineBreak = buffer.indexOf("\n");
      }
    }

    const trailing = buffer.trim();
    if (trailing) {
      processLine(trailing);
    }

    return { output };
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-1">
          <div className="text-lg font-semibold text-dark">
            Can’t load this map
          </div>
          <p className="mt-2 text-sm text-body-color">{loadError}</p>
          <p className="mt-4 text-sm text-body-color">
            Set <code className="rounded bg-gray-2 px-1">DATABASE_URL</code> and
            run{" "}
            <code className="rounded bg-gray-2 px-1">
              npm run prisma:migrate
            </code>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <MindMapContext.Provider
      value={{
        mapId,
        isSaving,
        selectedNodeId,
        setSelectedNodeId,
        updateNodeText,
        updateNodeData,
        getNodeText,
        addChildNode: addChildNodeById,
        addRootNode,
        createSuggestionNode,
        deleteNode,
        generate,
        generateSuggestion,
        listGenerations,
      }}
    >
      <div className="relative h-dvh w-full">
        <LoadingModal
          isOpen={!loaded && !loadError}
          title="Opening map"
          description="Loading nodes and connections..."
        />
        <div
          className={`pointer-events-none absolute left-2 right-2 top-3 z-10 rounded-xl border border-stroke bg-white/90 p-3 shadow-1 backdrop-blur transition-[width] duration-300 ease-out sm:left-4 sm:right-auto sm:top-4 ${
            hasUnsavedTitleChanges
              ? "sm:w-[42%] md:w-[38%] lg:w-[34%]"
              : "sm:w-[30%] md:w-[28%] lg:w-[25%]"
          }`}
        >
          <div className="pointer-events-auto w-full flex items-center gap-3">
            <input
              value={mapTitle}
              onChange={(e) => setMapTitle(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-dark outline-hidden"
              aria-label="Map title"
            />
            {hasUnsavedTitleChanges ? (
              <>
                <button
                  type="button"
                  onClick={() => setMapTitle(persistedTitleRef.current)}
                  className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800"
                >
                  Revert
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void saveTitleIfChanged();
                  }}
                  disabled={isSavingTitle}
                  className="shrink-0 rounded-full bg-dark px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-dark-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingTitle ? "Saving..." : "Save"}
                </button>
              </>
            ) : null}
            <Link
              href="/dashboard"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-600 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800"
            >
              <FontAwesomeIcon icon={faHouse} className="text-[10px]" />
              Home
            </Link>
          </div>
        </div>

        {isProcessingWork ? (
          <div className="pointer-events-none absolute right-2 top-3 z-20 rounded-full border border-blue-200 bg-blue-50/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700 shadow-sm backdrop-blur sm:right-4 sm:top-4">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              {activeGenerations > 0 ? "Generating content..." : "Saving changes..."}
            </span>
          </div>
        ) : null}

        <NodeCreationSidebar />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          style={{ backgroundColor: REACT_FLOW_PANE_BACKGROUND }}
          translateExtent={WORKSPACE_BOUNDS}
          nodeExtent={WORKSPACE_BOUNDS}
          onInit={(instance) => {
            reactFlowRef.current = instance;
          }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background gap={24} size={1} color="#dfe4ea" />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </div>
    </MindMapContext.Provider>
  );
}
