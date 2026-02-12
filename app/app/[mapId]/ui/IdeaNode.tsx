'use client';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import React, { useState } from 'react';
import { useMindMap } from './MindMapContext';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export type IdeaNodeType = Node<{ text?: string }, 'idea'>;

export default function IdeaNode({ id, data, selected }: NodeProps<IdeaNodeType>) {
  const mindmap = useMindMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isFocused = selected || mindmap.selectedNodeId === id;

  const handleDelete = () => {
    mindmap.deleteNode(id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div
      className={[
        'w-[360px] rounded-2xl border p-4 shadow-1',
        isFocused ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300/30' : 'border-stroke bg-white',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-emerald-500" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-emerald-500" />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Idea Node</div>
          <div className="text-sm font-semibold text-dark">Core Thought</div>
        </div>
        <button
          type="button"
          className="nodrag rounded-md bg-red-500 px-2 py-1 text-[11px] text-white hover:bg-red-6"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Idea"
        itemName={data?.text || 'Untitled Idea'}
        phraseEnforce={false}
      />

      <textarea
        value={String(data?.text ?? '')}
        onChange={(e) => mindmap.updateNodeText(id, e.target.value)}
        onFocus={() => mindmap.setSelectedNodeId(id)}
        rows={5}
        placeholder="Write the idea..."
        className="nodrag h-40 w-full rounded-xl border border-emerald-200 bg-white/90 p-3 text-sm text-dark outline-hidden placeholder:text-body-color focus:border-emerald-400"
      />

      <div className="mt-3">
        <button
          type="button"
          className="nodrag w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          onClick={() => mindmap.addChildNode(id, 'social', { label: 'LinkedIn', platform: 'LINKEDIN' })}
        >
          Create Social
        </button>
      </div>
    </div>
  );
}
