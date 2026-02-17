'use client';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import React, { useEffect, useRef, useState } from 'react';
import { useMindMap } from './MindMapContext';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';

export type IdeaNodeType = Node<{ text?: string }, 'idea'>;

export default function IdeaNode({ id, data, selected }: NodeProps<IdeaNodeType>) {
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

  const handleDelete = () => {
    mindmap.deleteNode(id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div
      className={[
        'relative w-[360px] rounded-2xl border p-4 shadow-1',
        isFocused ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300/30' : 'border-stroke bg-white',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-emerald-500" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-emerald-500" />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Idea Node</div>
          <div className="text-sm font-semibold text-dark">Core Thought</div>
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
            className="nodrag rounded-md bg-red-500 px-2 py-1 text-[11px] text-white hover:bg-red-6"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
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

      {isHovering ? (
        <div className="absolute left-full top-1/2 z-20 -translate-y-1/2 -translate-x-1">
          <div className="w-[240px] rounded-2xl border border-stone-200/90 bg-white p-3 shadow-[0_14px_34px_rgba(17,24,39,0.14)] backdrop-blur">
            <div className="mb-2.5 px-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-body-color">Add Branch</div>
              <div className="mt-1 text-xs text-slate-500">Capture friction, proof, and messaging style.</div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="nodrag rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white px-3 py-2 text-left text-xs font-semibold text-rose-700 transition hover:from-rose-100 hover:to-rose-50"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => mindmap.addChildNode(id, 'painpoint', { text: 'Main customer pain point...' })}
              >
                + Pain Point
                <div className="mt-0.5 text-[11px] font-medium text-rose-600/90">Add audience blockers and objections</div>
              </button>
              <button
                type="button"
                className="nodrag rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white px-3 py-2 text-left text-xs font-semibold text-sky-700 transition hover:from-sky-100 hover:to-sky-50"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => mindmap.addChildNode(id, 'proofpoint', { text: 'Proof point, data, or example...' })}
              >
                + Proof Point
                <div className="mt-0.5 text-[11px] font-medium text-sky-600/90">Add metrics, case studies, or proof</div>
              </button>
              <button
                type="button"
                className="nodrag rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white px-3 py-2 text-left text-xs font-semibold text-amber-700 transition hover:from-amber-100 hover:to-amber-50"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => mindmap.addChildNode(id, 'tone', { tone: 'Friendly' })}
              >
                + Tone Node
                <div className="mt-0.5 text-[11px] font-medium text-amber-700/90">Set the messaging voice for outputs</div>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
