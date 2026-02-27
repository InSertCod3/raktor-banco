import type { Node } from "@xyflow/react";
import type { NodeType } from "./MindMapContext";

type Direction = "source" | "target";

export type NodeConnectionRule = {
  allowAsSource: boolean;
  allowAsTarget: boolean;
  allowedTargets: NodeType[];
  allowedSources: NodeType[];
  sourceWarning: string;
  targetWarning: string;
};

export type ConnectionRulesConfig = Record<NodeType, NodeConnectionRule>;
export type IdeaConnectivityRequirements = Partial<Record<NodeType, string>>;

const CONTENT_SOURCE_TYPES: NodeType[] = [
  "idea",
  "notepad",
  "painpoint",
  "proofpoint",
  "tone",
  "hookcta",
  "datanode",
];

const STRATEGY_AND_OUTPUT_TARGETS: NodeType[] = [
  "notepad",
  "painpoint",
  "proofpoint",
  "tone",
  "hookcta",
  "social",
  "coldlead",
  "suggestion",
];
const STRATEGY_NODE_LIST: NodeType[] = [
  "painpoint",
  "proofpoint",
  "tone",
  "hookcta",
];

export const CONNECTION_RULES: ConnectionRulesConfig = {
  idea: {
    allowAsSource: true,
    allowAsTarget: false,
    allowedTargets: STRATEGY_AND_OUTPUT_TARGETS,
    allowedSources: ["datanode"],
    sourceWarning: "Start from Core Idea, then branch into strategy or an output node.",
    targetWarning: "Core Idea is your starting point, so connect outward from it.",
  },
  notepad: {
    allowAsSource: true,
    allowAsTarget: true,
    allowedTargets: STRATEGY_AND_OUTPUT_TARGETS,
    allowedSources: CONTENT_SOURCE_TYPES,
    sourceWarning: "From Notes, continue to strategy or output nodes.",
    targetWarning: "Connect Notes from Core Idea or a strategy node.",
  },
  painpoint: {
    allowAsSource: true,
    allowAsTarget: true,
    allowedTargets: STRATEGY_AND_OUTPUT_TARGETS,
    allowedSources: CONTENT_SOURCE_TYPES,
    sourceWarning: "From Audience Pain, keep the branch moving to strategy or output.",
    targetWarning: "Connect Audience Pain from Core Idea or another strategy node.",
  },
  proofpoint: {
    allowAsSource: true,
    allowAsTarget: true,
    allowedTargets: STRATEGY_AND_OUTPUT_TARGETS,
    allowedSources: CONTENT_SOURCE_TYPES,
    sourceWarning: "From Proof & Evidence, continue to strategy or output.",
    targetWarning: "Connect Proof & Evidence from Core Idea or another strategy node.",
  },
  tone: {
    allowAsSource: true,
    allowAsTarget: true,
    allowedTargets: STRATEGY_AND_OUTPUT_TARGETS,
    allowedSources: CONTENT_SOURCE_TYPES,
    sourceWarning: "From Voice & Tone, continue to strategy or output.",
    targetWarning: "Connect Voice & Tone from Core Idea or another strategy node.",
  },
  hookcta: {
    allowAsSource: true,
    allowAsTarget: true,
    allowedTargets: STRATEGY_AND_OUTPUT_TARGETS,
    allowedSources: CONTENT_SOURCE_TYPES,
    sourceWarning: "From Hook & CTA, continue to strategy or output.",
    targetWarning: "Connect Hook & CTA from Core Idea or another strategy node.",
  },
  social: {
    allowAsSource: false,
    allowAsTarget: true,
    allowedTargets: [],
    allowedSources: CONTENT_SOURCE_TYPES,
    sourceWarning: "Social Draft is an end point. Create new branches from strategy nodes.",
    targetWarning: "Connect Social Draft from Core Idea or strategy nodes.",
  },
  coldlead: {
    allowAsSource: false,
    allowAsTarget: true,
    allowedTargets: [],
    allowedSources: CONTENT_SOURCE_TYPES,
    sourceWarning: "Prospect Outreach is an end point. Create new branches from strategy nodes.",
    targetWarning: "Connect Prospect Outreach from Core Idea or strategy nodes.",
  },
  suggestion: {
    allowAsSource: false,
    allowAsTarget: true,
    allowedTargets: [],
    allowedSources: [
      "idea",
      "notepad",
      "painpoint",
      "proofpoint",
      "tone",
      "hookcta",
      "social",
      "coldlead",
      "datanode",
    ],
    sourceWarning: "Suggestion is a helper note and should stay as an end point.",
    targetWarning: "Attach Suggestion to Core Idea, Notes, strategy, or output nodes.",
  },
  datanode: {
    allowAsSource: false,
    allowAsTarget: true,
    allowedTargets: [],
    allowedSources: ["idea"],
    sourceWarning: "Data Node is a data container and should stay as an end point.",
    targetWarning: "Attach Data Node to Core Idea only.",
  },
};

export const IDEA_CONNECTIVITY_REQUIREMENTS: IdeaConnectivityRequirements = {
  idea: "Core Idea should have at least one strategy branch and one output node.",
  painpoint: "Audience Pain should be part of a branch that starts from Core Idea.",
  proofpoint: "Proof & Evidence should be part of a branch that starts from Core Idea.",
  tone: "Voice & Tone should be part of a branch that starts from Core Idea.",
  hookcta: "Hook & CTA should be part of a branch that starts from Core Idea.",
  social: "Social Draft should be connected to a branch from Core Idea.",
  coldlead: "Prospect Outreach should be connected to a branch from Core Idea.",
};

const NODE_TYPES: NodeType[] = [
  "idea",
  "social",
  "coldlead",
  "notepad",
  "suggestion",
  "painpoint",
  "proofpoint",
  "tone",
  "hookcta",
  "datanode",
];

function isNodeType(value: unknown): value is NodeType {
  return typeof value === "string" && NODE_TYPES.includes(value as NodeType);
}

function isStrategyType(value: NodeType | null): value is NodeType {
  return Boolean(value && STRATEGY_NODE_LIST.includes(value));
}

export function getNodeType(node: Node | undefined): NodeType | null {
  return isNodeType(node?.type) ? node.type : null;
}

export function getNodeWarning(nodeType: NodeType | null, direction: Direction): string | null {
  if (!nodeType) return null;
  const rule = CONNECTION_RULES[nodeType];
  return direction === "source" ? rule.sourceWarning : rule.targetWarning;
}

export function validateConnectionTypes(
  sourceType: NodeType | null,
  targetType: NodeType | null,
  sourceHandle?: string | null,
): { valid: boolean; reason: string } {
  if (!sourceType || !targetType) {
    return { valid: false, reason: "Pick two valid nodes, then connect them." };
  }
  if (sourceType === targetType && sourceType === "idea") {
    return { valid: false, reason: "Connect each Core Idea to a different node." };
  }

  // DataNodes can only be connected via the "datanode" handle (bottom of IdeaNode)
  if (targetType === "datanode") {
    if (sourceType !== "idea") {
      return { valid: false, reason: "Data Nodes can only be attached to Core Idea." };
    }
    if (sourceHandle !== "datanode") {
      return { valid: false, reason: "Use the bottom handle to connect Data Nodes." };
    }
    return { valid: true, reason: "" };
  }

  if (isStrategyType(sourceType) && isStrategyType(targetType)) {
    return { valid: true, reason: "" };
  }

  const sourceRule = CONNECTION_RULES[sourceType];
  const targetRule = CONNECTION_RULES[targetType];

  if (!sourceRule.allowAsSource) {
    return { valid: false, reason: sourceRule.sourceWarning };
  }
  if (!targetRule.allowAsTarget) {
    return { valid: false, reason: targetRule.targetWarning };
  }
  if (!sourceRule.allowedTargets.includes(targetType)) {
    return { valid: false, reason: sourceRule.sourceWarning };
  }
  if (!targetRule.allowedSources.includes(sourceType)) {
    return { valid: false, reason: targetRule.targetWarning };
  }

  return { valid: true, reason: "" };
}
