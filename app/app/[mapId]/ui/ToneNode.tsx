'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [isToneMenuOpen, setIsToneMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const tone = data?.tone && TONE_OPTIONS.includes(data.tone) ? data.tone : undefined;
  const isFocused = selected || mindmap.selectedNodeId === id;

  useEffect(() => {
    if (!isToneMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as globalThis.Node)) return;
      setIsToneMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isToneMenuOpen]);

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
        itemName={tone ? `Tone: ${tone}` : 'Untitled Tone'}
        phraseEnforce={false}
      />

      <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-white p-3">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-800">Tone Style</label>
        <p className="mt-1 text-[11px] text-amber-700/80">Choose how the message should feel.</p>

        <div ref={menuRef} className="relative mt-2">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsToneMenuOpen((open) => !open)}
            className="nodrag flex w-full items-center justify-between rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-dark shadow-sm outline-hidden transition hover:border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/70"
          >
            <span className={tone ? 'text-dark' : 'text-body-color'}>{tone ?? 'Select tone...'}</span>
            <span className={`text-amber-600 transition ${isToneMenuOpen ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {isToneMenuOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-[0_12px_24px_rgba(17,24,39,0.14)]">
              <ul className="max-h-56 overflow-y-auto py-1">
                {TONE_OPTIONS.map((option) => {
                  const active = option === tone;
                  return (
                    <li key={option}>
                      <button
                        type="button"
                        className={[
                          'nodrag flex w-full items-center justify-between px-3 py-2 text-left text-sm transition',
                          active ? 'bg-amber-100/70 font-semibold text-amber-900' : 'text-slate-700 hover:bg-amber-50',
                        ].join(' ')}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          mindmap.updateNodeData(id, { tone: option });
                          setIsToneMenuOpen(false);
                        }}
                      >
                        <span>{option}</span>
                        {active ? <span className="text-xs text-amber-700">Selected</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
