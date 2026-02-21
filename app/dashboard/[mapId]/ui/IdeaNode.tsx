'use client';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import React, { useEffect, useRef, useState } from 'react';
import { useMindMap } from './MindMapContext';
import ConfimationModel from '@/app/components/ConfimationModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import NodeAddPanel from './NodeAddPanel';

export type IdeaNodeType = Node<{ text?: string }, 'idea'>;

export default function IdeaNode({ id, data, selected }: NodeProps<IdeaNodeType>) {
  const mindmap = useMindMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNodeHovering, setIsNodeHovering] = useState(false);
  const [isTextareaHovering, setIsTextareaHovering] = useState(false);
  const [isBranchPopupHovering, setIsBranchPopupHovering] = useState(false);
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
      onMouseEnter={() => setIsNodeHovering(true)}
      onMouseLeave={() => setIsNodeHovering(false)}
    >
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-emerald-500" />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Core Idea</div>
          <div className="text-sm font-semibold text-dark">Main Message</div>
        </div>
        <div className="flex items-center gap-2">
          {isNodeHovering ? (
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

      <ConfimationModel
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Idea"
        itemName={data?.text || 'Untitled Idea'}
        phraseEnforce={false}
      />

      <div className="relative">
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
          onMouseEnter={() => setIsTextareaHovering(true)}
          onMouseLeave={() => setIsTextareaHovering(false)}
          rows={5}
          placeholder="Write the idea..."
          className="nodrag h-40 w-full rounded-xl border border-emerald-200 bg-white/90 p-3 text-sm text-dark outline-hidden placeholder:text-body-color focus:border-emerald-400"
        />

        <NodeAddPanel
          visible={isTextareaHovering || isBranchPopupHovering}
          title="Add Branch Node"
          subtitle="Add strategy or output nodes from this idea."
          onMouseEnter={() => setIsBranchPopupHovering(true)}
          onMouseLeave={() => setIsBranchPopupHovering(false)}
          actions={[
            {
              label: '+ Audience Pain',
              description: 'Add audience blockers and objections',
              onClick: () => mindmap.addChildNode(id, 'painpoint'),
              className:
                'nodrag rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white px-3 py-2 text-left text-xs font-semibold text-rose-700 transition hover:from-rose-100 hover:to-rose-50',
            },
            {
              label: '+ Proof & Evidence',
              description: 'Add metrics, case studies, or proof',
              onClick: () => mindmap.addChildNode(id, 'proofpoint'),
              className:
                'nodrag rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white px-3 py-2 text-left text-xs font-semibold text-sky-700 transition hover:from-sky-100 hover:to-sky-50',
            },
            {
              label: '+ Voice & Tone',
              description: 'Set the messaging voice for outputs',
              onClick: () => mindmap.addChildNode(id, 'tone'),
              className:
                'nodrag rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white px-3 py-2 text-left text-xs font-semibold text-amber-700 transition hover:from-amber-100 hover:to-amber-50',
            },
            {
              label: '+ Hook & CTA',
              description: 'Add a first-2-second hook and clear CTA',
              onClick: () => mindmap.addChildNode(id, 'hookcta'),
              className:
                'nodrag rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white px-3 py-2 text-left text-xs font-semibold text-violet-700 transition hover:from-violet-100 hover:to-violet-50',
            },
            {
              label: '+ Social Draft',
              description: 'Generate platform-ready social output',
              onClick: () => mindmap.addChildNode(id, 'social', { label: 'LinkedIn', platform: 'LINKEDIN' }),
              className:
                'nodrag rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white px-3 py-2 text-left text-xs font-semibold text-blue-700 transition hover:from-blue-100 hover:to-blue-50',
            },
          ]}
        />
      </div>

    </div>
  );
}


