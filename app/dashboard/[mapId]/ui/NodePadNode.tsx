'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMindMap } from './MindMapContext';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';

type NodePadData = {
  text?: string;
};

type NodePadType = Node<NodePadData, 'notepad'>;

export default function NodePadNode({ id, data, selected }: NodeProps<NodePadType>) {
  const mindmap = useMindMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [draftText, setDraftText] = useState(String(data?.text ?? ''));
  const isEditingRef = useRef(false);
  const isFocused = selected || mindmap.selectedNodeId === id;

  useEffect(() => {
    if (isEditingRef.current) return;
    setDraftText(String(data?.text ?? ''));
  }, [data?.text]);

  return (
    <div
      className={[
        'w-[370px] rounded-2xl border p-0 shadow-1 overflow-hidden',
        isFocused ? 'border-emerald-300 ring-2 ring-emerald-300/30' : 'border-stone-200',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-emerald-500" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-emerald-500" />

      <div className="relative border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-lime-50 to-emerald-100 px-4 py-3">
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-300/70" />
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-800">Notes</div>
            <div className="text-sm font-semibold text-stone-800">Context & Reminders</div>
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
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          mindmap.deleteNode(id);
          setIsDeleteModalOpen(false);
        }}
        title="Delete Notes"
        itemName={String(data?.text || 'Untitled Note').slice(0, 36)}
        phraseEnforce={false}
      />

      <div className="relative bg-[#fffef8] px-3 pb-3 pt-2">
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
          rows={8}
          placeholder="Write down private ideas, reminders, and sparks..."
          className="nodrag h-52 w-full rounded-lg border border-stone-200 bg-transparent pl-3 pr-3 pt-2 text-[16px] leading-7 text-stone-800 outline-hidden placeholder:text-stone-400 focus:border-emerald-300"
        />
      </div>
    </div>
  );
}
