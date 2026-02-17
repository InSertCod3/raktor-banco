'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMindMap } from './MindMapContext';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';

type InsightInputNodeData = {
  text?: string;
};

type InsightInputNodeType = Node<InsightInputNodeData, 'painpoint' | 'proofpoint'>;

export default function InsightInputNode({ id, type, data, selected }: NodeProps<InsightInputNodeType>) {
  const mindmap = useMindMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [draftText, setDraftText] = useState(String(data?.text ?? ''));
  const isEditingRef = useRef(false);

  const isPainPoint = type === 'painpoint';
  const isFocused = selected || mindmap.selectedNodeId === id;
  const config = isPainPoint
    ? {
        badge: 'Pain Point',
        title: 'Audience Friction',
        placeholder: 'What hurts, blocks, or slows down the audience?',
        wrapperFocus: 'border-rose-300 bg-rose-50 ring-2 ring-rose-300/30',
        wrapper: 'border-stroke bg-white',
        handle: '!bg-rose-500',
        textarea: 'border-rose-200 focus:border-rose-400',
        badgeColor: 'text-rose-700',
      }
    : {
        badge: 'Proof Point',
        title: 'Evidence & Trust',
        placeholder: 'Add metrics, outcomes, or examples that prove the claim.',
        wrapperFocus: 'border-sky-300 bg-sky-50 ring-2 ring-sky-300/30',
        wrapper: 'border-stroke bg-white',
        handle: '!bg-sky-500',
        textarea: 'border-sky-200 focus:border-sky-400',
        badgeColor: 'text-sky-700',
      };

  useEffect(() => {
    if (isEditingRef.current) return;
    setDraftText(String(data?.text ?? ''));
  }, [data?.text]);

  const label = String(data?.text || `Untitled ${config.badge}`);

  return (
    <div
      className={['w-[360px] rounded-2xl border p-4 shadow-1', isFocused ? config.wrapperFocus : config.wrapper].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Handle type="target" position={Position.Left} className={`!h-2.5 !w-2.5 ${config.handle}`} />
      <Handle type="source" position={Position.Right} className={`!h-2.5 !w-2.5 ${config.handle}`} />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${config.badgeColor}`}>{config.badge}</div>
          <div className="text-sm font-semibold text-dark">{config.title}</div>
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
        title={`Delete ${config.badge}`}
        itemName={label}
        phraseEnforce={false}
      />

      <textarea
        value={draftText}
        onChange={(e) => {
          const nextValue = e.target.value;
          setDraftText(nextValue);
          mindmap.updateNodeText(id, nextValue);
        }}
        onFocus={() => {
          isEditingRef.current = true;
          mindmap.setSelectedNodeId(id);
        }}
        onBlur={() => {
          isEditingRef.current = false;
        }}
        onMouseDown={(e) => e.stopPropagation()}
        rows={5}
        placeholder={config.placeholder}
        className={['nodrag h-40 w-full rounded-xl border bg-white/90 p-3 text-sm text-dark outline-hidden placeholder:text-body-color', config.textarea].join(' ')}
      />

    </div>
  );
}
