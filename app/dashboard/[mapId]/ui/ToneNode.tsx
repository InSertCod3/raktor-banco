'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMindMap } from './MindMapContext';
import ConfimationModel from '@/app/components/ConfimationModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import NodeAddPanel from './NodeAddPanel';
import ConnectionHandleWarning from './ConnectionHandleWarning';

type ToneOption =
  | 'Cooperative'
  | 'Surprised'
  | 'Encouraging'
  | 'Assertive'
  | 'Curious'
  | 'Friendly'
  | 'Optimistic'
  | 'Informal'
  | 'Educational'
  | 'Professional'
  | 'Flirty';

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
  'Educational',
  'Professional',
  'Flirty',
];

export default function ToneNode({ id, data, selected }: NodeProps<ToneNodeType>) {
  const mindmap = useMindMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isAddPanelHovering, setIsAddPanelHovering] = useState(false);
  const [isToneMenuOpen, setIsToneMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const tone = data?.tone && TONE_OPTIONS.includes(data.tone) ? data.tone : undefined;
  const showToneWarning = !tone;
  const isFocused = selected || mindmap.selectedNodeId === id;
  const warningData = data as
    | { connectionWarning?: string | null; connectionWarningSide?: 'left' | 'right' | 'both' | null }
    | undefined;
  const connectionWarning = warningData?.connectionWarning;
  const connectionWarningSide = warningData?.connectionWarningSide ?? 'both';

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
        'relative w-[320px] rounded-2xl border p-4 shadow-1',
        isFocused ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-300/30' : 'border-stroke bg-white',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-amber-500" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-amber-500" />
      <ConnectionHandleWarning message={connectionWarning} side={connectionWarningSide} />
      {showToneWarning ? (
        <div className="group absolute -top-3 -right-3 z-20">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-amber-700 shadow-sm">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-[12px]" />
          </div>
          <div className="pointer-events-none absolute right-0 top-[calc(100%+8px)] hidden w-64 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900 shadow-lg group-hover:block">
            No tone selected yet. Choose a tone style so outputs match your intended voice.
          </div>
        </div>
      ) : null}

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700">Voice & Tone</div>
          <div className="text-sm font-semibold text-dark">Message Delivery</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="nodrag rounded-md bg-red-500 px-2 py-1 text-[11px] text-white hover:bg-red-600"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      <ConfimationModel
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          mindmap.deleteNode(id);
          setIsDeleteModalOpen(false);
        }}
        title="Delete Voice & Tone"
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
      <NodeAddPanel
        visible={isHovering || isAddPanelHovering}
        title="Add Connected Node"
        subtitle="Continue from tone into output and strategy."
        onMouseEnter={() => setIsAddPanelHovering(true)}
        onMouseLeave={() => setIsAddPanelHovering(false)}
        actions={[
          {
            label: '+ Social Draft',
            description: 'Generate post content',
            onClick: () => mindmap.addChildNode(id, 'social', { label: 'LinkedIn', platform: 'LINKEDIN' }),
            className:
              'nodrag rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white px-3 py-2 text-left text-xs font-semibold text-blue-700 transition hover:from-blue-100 hover:to-blue-50',
          },
          {
            label: '+ Prospect Outreach',
            description: 'Generate outreach DM copy',
            onClick: () =>
              mindmap.addChildNode(id, 'coldlead', {
                label: 'Prospect Outreach',
                platform: 'LINKEDIN',
              }),
            className:
              'nodrag rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white px-3 py-2 text-left text-xs font-semibold text-indigo-700 transition hover:from-indigo-100 hover:to-indigo-50',
          },
          {
            label: '+ Audience Pain',
            description: 'Capture audience blockers',
            onClick: () => mindmap.addChildNode(id, 'painpoint'),
            className:
              'nodrag rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white px-3 py-2 text-left text-xs font-semibold text-rose-700 transition hover:from-rose-100 hover:to-rose-50',
          },
          {
            label: '+ Proof & Evidence',
            description: 'Add proof points and outcomes',
            onClick: () => mindmap.addChildNode(id, 'proofpoint'),
            className:
              'nodrag rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white px-3 py-2 text-left text-xs font-semibold text-sky-700 transition hover:from-sky-100 hover:to-sky-50',
          },
          {
            label: '+ Hook & CTA',
            description: 'Define first-hook + CTA',
            onClick: () => mindmap.addChildNode(id, 'hookcta'),
            className:
              'nodrag rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white px-3 py-2 text-left text-xs font-semibold text-violet-700 transition hover:from-violet-100 hover:to-violet-50',
          },
        ]}
      />
    </div>
  );
}



