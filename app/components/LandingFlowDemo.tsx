"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addEdge,
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";

type DemoNodeData = {
  title: string;
  body: string;
  kind: "idea" | "branch" | "output";
  platform?: "LinkedIn" | "Facebook" | "Instagram";
};

type DemoNode = Node<DemoNodeData>;

function DemoNodeCard({ data, selected }: NodeProps<DemoNode>) {
  const tone =
    data.kind === "idea"
      ? "border-[#638266] bg-[#edf4ee]"
      : data.kind === "branch"
        ? "border-[#cfb98e] bg-[#fbf6ea]"
        : "border-[#9eb5cb] bg-[#ecf3fb]";

  return (
    <div
      className={`min-w-[180px] max-w-[220px] rounded-xl border px-3 py-2 shadow-sm transition ${tone} ${
        selected ? "ring-2 ring-[#2d3a33]/40" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-[#5f6861]" />
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#687269]">{data.kind}</div>
      <div className="mt-1 text-sm font-semibold text-[#2d3a33]">{data.title}</div>
      <p className="mt-1 text-xs leading-relaxed text-[#4d5550]">{data.body}</p>
      {data.platform ? (
        <div className="mt-2 inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2d3a33]">
          {data.platform}
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-[#5f6861]" />
    </div>
  );
}

const initialNodes: DemoNode[] = [
  {
    id: "core",
    type: "demo",
    position: { x: 40, y: 170 },
    data: {
      kind: "idea",
      title: "AI onboarding strategy",
      body: "Core thesis for a 3-post content sprint.",
    },
  },
  {
    id: "branch-1",
    type: "demo",
    position: { x: 350, y: 80 },
    data: {
      kind: "branch",
      title: "Pain points",
      body: "Why teams lose users in week one.",
    },
  },
  {
    id: "branch-2",
    type: "demo",
    position: { x: 350, y: 260 },
    data: {
      kind: "branch",
      title: "Proof points",
      body: "Metrics and examples that build trust.",
    },
  },
  {
    id: "out-li",
    type: "demo",
    position: { x: 690, y: 20 },
    data: {
      kind: "output",
      title: "Thought-leadership post",
      body: "Hook + framework + CTA format.",
      platform: "LinkedIn",
    },
  },
  {
    id: "out-fb",
    type: "demo",
    position: { x: 690, y: 210 },
    data: {
      kind: "output",
      title: "Community post",
      body: "Relatable story with engagement question.",
      platform: "Facebook",
    },
  },
  {
    id: "out-ig",
    type: "demo",
    position: { x: 690, y: 400 },
    data: {
      kind: "output",
      title: "Carousel caption",
      body: "Short punchy lines for swipe-through.",
      platform: "Instagram",
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "core", target: "branch-1", animated: true },
  { id: "e2", source: "core", target: "branch-2", animated: true },
  { id: "e3", source: "branch-1", target: "out-li", animated: true },
  { id: "e4", source: "branch-1", target: "out-fb", animated: true },
  { id: "e5", source: "branch-2", target: "out-ig", animated: true },
];

const outputVariants = [
  {
    outLi: "Contrarian hook + 3 lessons + comment CTA.",
    outFb: "Behind-the-scenes narrative + honest takeaway.",
    outIg: "7-step checklist with crisp one-line prompts.",
  },
  {
    outLi: "Data-led opener + mini case study + save CTA.",
    outFb: "Personal failure story + lesson + discussion prompt.",
    outIg: "Myths vs facts caption for educational carousel.",
  },
  {
    outLi: "Founder POV + tactical framework + follow CTA.",
    outFb: "Audience pain snapshot + practical tip thread.",
    outIg: "Swipe format: problem, shift, examples, next step.",
  },
];

export default function LandingFlowDemo() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [variantIndex, setVariantIndex] = useState(0);

  const nodeTypes = useMemo(() => ({ demo: DemoNodeCard }), []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  const regenerateOutputs = useCallback(() => {
    const nextIndex = (variantIndex + 1) % outputVariants.length;
    const next = outputVariants[nextIndex];

    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === "out-li") return { ...node, data: { ...node.data, body: next.outLi } };
        if (node.id === "out-fb") return { ...node, data: { ...node.data, body: next.outFb } };
        if (node.id === "out-ig") return { ...node, data: { ...node.data, body: next.outIg } };
        return node;
      }),
    );
    setVariantIndex(nextIndex);
  }, [setNodes, variantIndex]);

  const addBranch = useCallback(() => {
    const id = `branch-${Date.now()}`;
    const y = 130 + Math.floor(Math.random() * 220);
    const newNode: DemoNode = {
      id,
      type: "demo",
      position: { x: 360, y },
      data: {
        kind: "branch",
        title: "New angle",
        body: "Drag this node and connect it to outputs.",
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, { id: `e-${id}`, source: "core", target: id, animated: true }]);
  }, [setEdges, setNodes]);

  const resetDemo = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setVariantIndex(0);
  }, [setEdges, setNodes]);

  return (
    <section id="demo" className="mt-12 rounded-3xl border border-[#d4d0c4] bg-white/90 p-4 shadow-2 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#687269]">Interactive demo</div>
          <p className="mt-1 text-sm text-[#5f6861]">Drag nodes, create new links, and regenerate platform outputs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addBranch}
            className="rounded-full border border-[#d4d0c4] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d3a33] hover:bg-[#f5f3ee]"
          >
            Add branch
          </button>
          <button
            type="button"
            onClick={regenerateOutputs}
            className="rounded-full bg-[#6e8b73] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#5c7961]"
          >
            Regenerate outputs
          </button>
          <button
            type="button"
            onClick={resetDemo}
            className="rounded-full border border-[#d4d0c4] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d3a33] hover:bg-[#f5f3ee]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="h-[460px] w-full overflow-hidden rounded-2xl border border-[#e1ddd2] bg-[#f7f5ef]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.14 }}
          proOptions={{ hideAttribution: true }}
          className="bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(247,245,239,1))]"
        >
          <MiniMap
            pannable
            zoomable
            className="!rounded-xl !border !border-[#d4d0c4] !bg-white/90"
            nodeColor="#c7c2b6"
            maskColor="rgba(0,0,0,0.05)"
          />
          <Controls className="!border-[#d4d0c4] !bg-white" />
          <Background gap={20} size={1} color="#d8d3c8" />
        </ReactFlow>
      </div>
    </section>
  );
}
