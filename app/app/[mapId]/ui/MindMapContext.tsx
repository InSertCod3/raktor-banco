'use client';

import type { Edge, Node } from '@xyflow/react';
import React from 'react';

export type Platform = 'LINKEDIN' | 'FACEBOOK' | 'INSTAGRAM';

export type Generation = {
  id: string;
  createdAt: string;
  output: string;
  revision: number;
  model: string;
};

export type NodeType = 'idea' | 'social' | 'notepad' | 'suggestion' | 'painpoint' | 'proofpoint';

export type MindMapContextValue = {
  mapId: string;
  isSaving: boolean;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  updateNodeText: (nodeId: string, text: string) => void;
  updateNodeData: (nodeId: string, dataPatch: Record<string, unknown>) => void;
  getNodeText: (nodeId: string) => string;
  addChildNode: (parentNodeId: string, type?: NodeType, data?: Record<string, unknown>) => void;
  addRootNode: (type: NodeType, data?: Record<string, unknown>) => void;
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
      socialNodeId?: string;
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



