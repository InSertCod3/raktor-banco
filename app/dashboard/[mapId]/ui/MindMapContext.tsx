'use client';

import type { Edge, Node } from '@xyflow/react';
import React from 'react';

export type Platform = 'LINKEDIN' | 'FACEBOOK' | 'INSTAGRAM';
export type GenerationMode = 'SOCIAL_POST' | 'LINKEDIN_DM_LEAD';

export type Generation = {
  id: string;
  createdAt: string;
  output: string;
  revision: number;
  model: string;
};

export type NodeType = 'idea' | 'social' | 'coldlead' | 'notepad' | 'suggestion' | 'painpoint' | 'proofpoint' | 'tone' | 'hookcta';

export type MindMapContextValue = {
  mapId: string;
  isSaving: boolean;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  updateNodeText: (nodeId: string, text: string) => void;
  updateNodeData: (nodeId: string, dataPatch: Record<string, unknown>) => void;
  getNodeText: (nodeId: string) => string;
  addChildNode: (
    parentNodeId: string,
    type?: NodeType,
    data?: Record<string, unknown>
  ) => string | null;
  addRootNode: (type: NodeType, data?: Record<string, unknown>) => string;
  createSuggestionNode: (sourceNodeId: string) => void;
  deleteNode: (nodeId: string) => void;

  generate: (
    nodeId: string,
    platform: Platform,
    handlers?: {
      onStart?: () => void;
      onDelta?: (delta: string) => void;
    },
    options?: {
      outputNodeId?: string;
      socialNodeId?: string;
      keptSentences?: string;
      generationMode?: GenerationMode;
    }
  ) => Promise<{
    generation: Generation;
    socialNode?: Node;
    socialEdge?: Edge;
  }>;
  generateSuggestion: (
    sourceNodeId: string,
    handlers?: {
      onStart?: () => void;
      onDelta?: (delta: string) => void;
    }
  ) => Promise<{ output: string }>;
  listGenerations: (nodeId: string, platform: Platform) => Promise<Generation[]>;
};

export const MindMapContext = React.createContext<MindMapContextValue | null>(null);

export function useMindMap() {
  const ctx = React.useContext(MindMapContext);
  if (!ctx) throw new Error('useMindMap must be used within MindMapContext.Provider');
  return ctx;
}



