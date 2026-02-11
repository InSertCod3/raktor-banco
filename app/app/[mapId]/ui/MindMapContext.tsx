'use client';

import type { Edge, Node } from '@xyflow/react';
import React from 'react';

export type Platform = 'LINKEDIN' | 'FACEBOOK';

export type Generation = {
  id: string;
  createdAt: string;
  output: string;
  revision: number;
  model: string;
};

export type NodeType = 'idea' | 'social';

export type MindMapContextValue = {
  mapId: string;
  isSaving: boolean;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  updateNodeText: (nodeId: string, text: string) => void;
  addChildNode: (parentNodeId: string, type?: NodeType, data?: Record<string, unknown>) => void;
  addRootNode: (type: NodeType, data?: Record<string, unknown>) => void;
  deleteNode: (nodeId: string) => void;

  generate: (
    nodeId: string,
    platform: Platform
  ) => Promise<{
    generation: Generation;
    socialNode?: Node;
    socialEdge?: Edge;
  }>;
  listGenerations: (nodeId: string, platform: Platform) => Promise<Generation[]>;
};

export const MindMapContext = React.createContext<MindMapContextValue | null>(null);

export function useMindMap() {
  const ctx = React.useContext(MindMapContext);
  if (!ctx) throw new Error('useMindMap must be used within MindMapContext.Provider');
  return ctx;
}



