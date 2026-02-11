"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "@xyflow/react";
import toast from "react-hot-toast";

import IdeaNode from "./IdeaNode";
import SocialNode from "./SocialNode";
import NodeCreationSidebar from "./NodeCreationSidebar";
import DeletableEdge from "./DeletableEdge";
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

export default function MindMapClient({ mapId }: { mapId: string }) {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mapTitle, setMapTitle] = useState("Loading…");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const titleTimer = useRef<number | null>(null);

  const nodeTypes = useMemo(
    () => ({
      idea: IdeaNode,
      social: SocialNode,
    }),
    [],
  );
  const edgeTypes = useMemo(
    () => ({
      deletable: DeletableEdge,
    }),
    [],
  );

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
      setLoadError(null);
      const res = await fetch(`/api/maps/${mapId}`, { cache: "no-store" });
      if (!res.ok) {
        if (!cancelled)
          setLoadError("Could not load map (is DATABASE_URL set?)");
        return;
      }
      const data = (await res.json()) as MapResponse;
      if (cancelled) return;

      setMapTitle(data.map.title);
      setNodes(data.map.nodes);
      setEdges(
        data.map.edges.map((edge) => ({
          ...edge,
          type: "deletable",
          data: {
            ...(edge.data as Record<string, unknown>),
            onDelete: deleteEdgeById,
          },
        })),
      );
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [mapId, setEdges, setNodes]);

  // Autosave graph
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      setIsSaving(true);
      try {
        await fetch(`/api/maps/${mapId}/graph`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        });
        toast.success("Saved", {
          id: "autosave",
          position: "top-center",
          duration: 2000,
        });
      } finally {
        setIsSaving(false);
      }
    }, 650);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [loaded, mapId, nodes, edges]);

  // Autosave title
  useEffect(() => {
    if (!loaded) return;
    if (titleTimer.current) window.clearTimeout(titleTimer.current);
    titleTimer.current = window.setTimeout(async () => {
      await fetch(`/api/maps/${mapId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: mapTitle.trim() || "Untitled map" }),
      });
      toast.success("Title saved", {
        id: "autosave-title",
        position: "top-center",
        duration: 2000,
      });
    }, 650);
    return () => {
      if (titleTimer.current) window.clearTimeout(titleTimer.current);
    };
  }, [loaded, mapId, mapTitle]);

  function onConnect(conn: Connection) {
    setEdges((eds) =>
      addEdge(
        {
          ...conn,
          id: crypto.randomUUID(),
          type: "deletable",
          data: { onDelete: deleteEdgeById },
        },
        eds,
      ),
    );
  }

  function addChildNodeById(
    parentNodeId: string,
    type: NodeType = "idea",
    data?: Record<string, unknown>,
  ) {
    const parent = nodes.find((n) => n.id === parentNodeId) ?? nodes[0];
    if (!parent) return;

    const id = crypto.randomUUID();
    const childType: NodeType = type;
    const child: Node = {
      id,
      type: childType,
      position: { x: parent.position.x + 240, y: parent.position.y + 80 },
      data:
        childType === "social"
          ? { label: "Social post", type: "social", content: "", ...data }
          : { text: "New idea", ...data },
    };

    setNodes((ns) => [...ns, child]);
    setEdges((es) => [
      ...es,
      {
        id: crypto.randomUUID(),
        source: parent.id,
        target: id,
        type: "deletable",
        data: { onDelete: deleteEdgeById },
      },
    ]);
    setSelectedNodeId(id);
  }

  function addRootNode(type: NodeType, data?: Record<string, unknown>) {
    const id = crypto.randomUUID();
    const offset = nodes.length * 40;
    const node: Node = {
      id,
      type,
      position: { x: offset, y: offset },
      data:
        type === "social"
          ? { label: "Social post", type: "social", content: "", ...data }
          : { text: "New idea", ...data },
    };

    setNodes((ns) => [...ns, node]);
    setSelectedNodeId(id);
  }

  function updateNodeText(nodeId: string, text: string) {
    setNodes((ns) =>
      ns.map((n) =>
        n.id === nodeId ? { ...n, data: { ...(n.data as any), text } } : n,
      ),
    );
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

  async function generate(
    nodeId: string,
    platform: Platform,
  ): Promise<{ generation: Generation; socialNode?: Node; socialEdge?: Edge }> {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mapId, nodeId, platform }),
    });
    const data = (await res.json()) as any;
    if (!res.ok) throw new Error(data?.error ?? "Generation failed.");

    const socialNode = data?.socialNode as Node | undefined;
    const socialEdge = data?.socialEdge as Edge | undefined;

    if (socialNode) {
      setNodes((current) => {
        const exists = current.some((node) => node.id === socialNode.id);
        if (exists) {
          return current.map((node) => (node.id === socialNode.id ? socialNode : node));
        }
        return [...current, socialNode];
      });
    }

    if (socialEdge) {
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
    }

    return {
      generation: data.generation as Generation,
      socialNode,
      socialEdge,
    };
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
        addChildNode: addChildNodeById,
        addRootNode,
        deleteNode,
        generate,
        listGenerations,
      }}
    >
      <div className="relative h-dvh w-full">
        <div className="pointer-events-none w-[25%] absolute left-4 top-4 z-10 flex items-center justify-between rounded-xl border border-stroke bg-white/90 p-3 shadow-1 backdrop-blur">
          <div className="pointer-events-auto w-full flex items-center gap-3">
            <input
              value={mapTitle}
              onChange={(e) => setMapTitle(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-dark outline-hidden"
              aria-label="Map title"
            />
          </div>
        </div>

        <NodeCreationSidebar />

        <ReactFlow
          nodes={nodes}
          edges={edges}
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
