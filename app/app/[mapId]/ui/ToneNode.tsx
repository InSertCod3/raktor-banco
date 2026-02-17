'use client';

import React, { useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMindMap } from './MindMapContext';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';

type ToneOption =
  | 'Cooperative'
  | 'Surprised'
  | 'Encouraging'
  | 'Assertive'
  | 'Curious'
  | 'Friendly'
  | 'Optimistic'
  | 'Informal';

type ToneNodeData = {
  tone?: ToneOption;
};

type ToneNodeType = Node<ToneNodeData, 'tone'>;

const TONE_OPTIONS: ToneOption[] = [
  'Cooperative',
  'Surprised',
  'Encouraging',
  'Assertive',
  'Curious',
  'Friendly',
  'Optimistic',
  'Informal',
];

export default function ToneNode({ id, data, selected }: NodeProps<ToneNodeType>) {
  const mindmap = useMindMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const tone = data?.tone && TONE_OPTIONS.includes(data.tone) ? data.tone : 'Friendly';
  const isFocused = selected || mindmap.selectedNodeId === id;

  return (
    <div
      className={[
        'w-[320px] rounded-2xl border p-4 shadow-1',
        isFocused ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-300/30' : 'border-stroke bg-white',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-amber-500" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-amber-500" />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700">Tone Node</div>
          <div className="text-sm font-semibold text-dark">Messaging Voice</div>
        </div>
        <div className="flex items-center gap-2">
          {isHovering ? (
            <button
              type="button"
              className="nodrag rounded-md bg-violet-500 px-2 py-1 text-[11px] text-white hover:bg-violet-600"
              onClick={() => mindmap.createSuggestionNode(id)}
              title="Create suggestion"
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} />
            </button>
          ) : null}
          <button
            type="button"
            className="nodrag rounded-md bg-red-500 px-2 py-1 text-[11px] text-white hover:bg-red-600"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          mindmap.deleteNode(id);
          setIsDeleteModalOpen(false);
        }}
        title="Delete Tone Node"
        itemName={`Tone: ${tone}`}
        phraseEnforce={false}
      />

      <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-body-color">Tone Style</label>
      <select
        value={tone}
        onChange={(e) => mindmap.updateNodeData(id, { tone: e.target.value })}
        onMouseDown={(e) => e.stopPropagation()}
        className="nodrag mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-dark outline-hidden focus:border-amber-400"
      >
        {TONE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
