'use client';

import React from 'react';

export type Platform = 'LINKEDIN' | 'FACEBOOK';

export type Generation = {
  id: string;
  createdAt: string;
  output: string;
  revision: number;
  model: string;
};

export type MindMapContextValue = {
  mapId: string;
  isSaving: boolean;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  updateNodeText: (nodeId: string, text: string) => void;
  addChildNode: (parentNodeId: string) => void;
  deleteNode: (nodeId: string) => void;

  generate: (nodeId: string, platform: Platform) => Promise<Generation>;
  listGenerations: (nodeId: string, platform: Platform) => Promise<Generation[]>;
};

export const MindMapContext = React.createContext<MindMapContextValue | null>(null);

export function useMindMap() {
  const ctx = React.useContext(MindMapContext);
  if (!ctx) throw new Error('useMindMap must be used within MindMapContext.Provider');
  return ctx;
}



