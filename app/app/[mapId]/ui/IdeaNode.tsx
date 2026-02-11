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
        'min-w-[430px] max-w-[340px] rounded-xl border bg-white p-3 shadow-1',
        isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-stroke',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-primary" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-primary" />

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-dark">Idea</div>
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
        rows={4}
        placeholder="Write the idea..."
        className="nodrag mt-2 h-36 w-full rounded-lg border border-stroke bg-transparent p-2 text-sm text-dark outline-hidden focus:border-primary"
      />

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="nodrag rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-dark"
          onClick={() => mindmap.addChildNode(id, 'idea')}
        >
          Create Idea
        </button>
        <button
          type="button"
          className="nodrag rounded-md border border-stroke bg-white px-2.5 py-1.5 text-xs font-medium text-dark hover:bg-gray-1"
          onClick={() => mindmap.addChildNode(id, 'social', { label: 'LinkedIn', platform: 'LINKEDIN' })}
        >
          Create Social
        </button>
      </div>
    </div>
  );
}
