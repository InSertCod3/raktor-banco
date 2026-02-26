'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMindMap } from './MindMapContext';
import ConfimationModel from '@/app/components/ConfimationModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import NodeAddPanel from './NodeAddPanel';

type InsightInputNodeData = {
  text?: string;
  hookType?: string;
  ctaType?: string;
};

type InsightInputNodeType = Node<InsightInputNodeData, 'painpoint' | 'proofpoint' | 'hookcta'>;

const HOOK_TYPE_OPTIONS = [
  'Question Hook',
  'Did You Know',
  'Bold Claim',
  'Contrarian Take',
  'Problem First',
  'Story Lead',
] as const;

const CTA_TYPE_OPTIONS = [
  'Comment CTA',
  'Save CTA',
  'Share CTA',
  'Follow CTA',
  'DM CTA',
  'Link CTA',
] as const;

export default function InsightInputNode({ id, type, data, selected }: NodeProps<InsightInputNodeType>) {
  const mindmap = useMindMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isAddPanelHovering, setIsAddPanelHovering] = useState(false);
  const [draftText, setDraftText] = useState(String(data?.text ?? ''));
  const [isHookTypeMenuOpen, setIsHookTypeMenuOpen] = useState(false);
  const [isCtaTypeMenuOpen, setIsCtaTypeMenuOpen] = useState(false);
  const isEditingRef = useRef(false);
  const hookMenuRef = useRef<HTMLDivElement | null>(null);
  const ctaMenuRef = useRef<HTMLDivElement | null>(null);

  const isFocused = selected || mindmap.selectedNodeId === id;
  const config =
    type === 'painpoint'
      ? {
        badge: 'Audience Pain',
        title: 'Audience Friction',
        placeholder: 'What hurts, blocks, or slows down the audience?',
        wrapperFocus: 'border-rose-300 bg-rose-50 ring-2 ring-rose-300/30',
        wrapper: 'border-stroke bg-white',
        handle: '!bg-rose-500',
        textarea: 'border-rose-200 focus:border-rose-400',
        badgeColor: 'text-rose-700',
      }
      : type === 'proofpoint'
      ? {
        badge: 'Proof & Evidence',
        title: 'Evidence & Trust',
        placeholder: 'Add metrics, outcomes, or examples that prove the claim.',
        wrapperFocus: 'border-sky-300 bg-sky-50 ring-2 ring-sky-300/30',
        wrapper: 'border-stroke bg-white',
        handle: '!bg-sky-500',
        textarea: 'border-sky-200 focus:border-sky-400',
        badgeColor: 'text-sky-700',
      }
      : {
        badge: 'Hook & CTA',
        title: "Grab the Attention",
        placeholder: 'Write a sharp opening hook, a "Did you know...?" line, and a clear CTA.',
        wrapperFocus: 'border-violet-300 bg-violet-50 ring-2 ring-violet-300/30',
        wrapper: 'border-stroke bg-white',
        handle: '!bg-violet-500',
        textarea: 'border-violet-200 focus:border-violet-400',
        badgeColor: 'text-violet-700',
      };

  useEffect(() => {
    if (isEditingRef.current) return;
    setDraftText(String(data?.text ?? ''));
  }, [data?.text]);

  useEffect(() => {
    if (!isHookTypeMenuOpen && !isCtaTypeMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as globalThis.Node;
      if (hookMenuRef.current?.contains(target) || ctaMenuRef.current?.contains(target)) return;
      setIsHookTypeMenuOpen(false);
      setIsCtaTypeMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isHookTypeMenuOpen, isCtaTypeMenuOpen]);

  const label = String(data?.text || `Untitled ${config.badge}`);
  const hookType = String(data?.hookType ?? HOOK_TYPE_OPTIONS[0]);
  const ctaType = String(data?.ctaType ?? CTA_TYPE_OPTIONS[0]);

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

      <ConfimationModel
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

      {type !== 'hookcta' ? (
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
      ) : null}
      {type === 'hookcta' ? (
        <div className="mt-3 rounded-xl border border-violet-200/80 bg-violet-50/40 p-3">
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-violet-800">
                Hook Type
              </label>
              <div ref={hookMenuRef} className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setIsHookTypeMenuOpen((open) => !open)}
                  className="nodrag flex w-full items-center justify-between rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-dark shadow-sm outline-hidden transition hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-200/70"
                >
                  <span className="text-dark">{hookType}</span>
                  <span className={`text-violet-600 transition ${isHookTypeMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isHookTypeMenuOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-violet-200 bg-white shadow-[0_12px_24px_rgba(17,24,39,0.14)]">
                    <ul className="max-h-56 overflow-y-auto py-1">
                      {HOOK_TYPE_OPTIONS.map((option) => {
                        const active = option === hookType;
                        return (
                          <li key={option}>
                            <button
                              type="button"
                              className={[
                                'nodrag flex w-full items-center justify-between px-3 py-2 text-left text-sm transition',
                                active ? 'bg-violet-100/70 font-semibold text-violet-900' : 'text-slate-700 hover:bg-violet-50',
                              ].join(' ')}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={() => {
                                mindmap.updateNodeData(id, { hookType: option });
                                setIsHookTypeMenuOpen(false);
                              }}
                            >
                              <span>{option}</span>
                              {active ? <span className="text-xs text-violet-700">Selected</span> : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-violet-800">
                Call-To-Action Type
              </label>
              <div ref={ctaMenuRef} className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setIsCtaTypeMenuOpen((open) => !open)}
                  className="nodrag flex w-full items-center justify-between rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-dark shadow-sm outline-hidden transition hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-200/70"
                >
                  <span className="text-dark">{ctaType}</span>
                  <span className={`text-violet-600 transition ${isCtaTypeMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isCtaTypeMenuOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-violet-200 bg-white shadow-[0_12px_24px_rgba(17,24,39,0.14)]">
                    <ul className="max-h-56 overflow-y-auto py-1">
                      {CTA_TYPE_OPTIONS.map((option) => {
                        const active = option === ctaType;
                        return (
                          <li key={option}>
                            <button
                              type="button"
                              className={[
                                'nodrag flex w-full items-center justify-between px-3 py-2 text-left text-sm transition',
                                active ? 'bg-violet-100/70 font-semibold text-violet-900' : 'text-slate-700 hover:bg-violet-50',
                              ].join(' ')}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={() => {
                                mindmap.updateNodeData(id, { ctaType: option });
                                setIsCtaTypeMenuOpen(false);
                              }}
                            >
                              <span>{option}</span>
                              {active ? <span className="text-xs text-violet-700">Selected</span> : null}
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
        </div>
      ) : null}
      <NodeAddPanel
        visible={isHovering || isAddPanelHovering}
        title="Add Connected Node"
        subtitle="Expand this branch with strategy or output."
        onMouseEnter={() => setIsAddPanelHovering(true)}
        onMouseLeave={() => setIsAddPanelHovering(false)}
        actions={[
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
            label: '+ Voice & Tone',
            description: 'Set style before generation',
            onClick: () => mindmap.addChildNode(id, 'tone'),
            className:
              'nodrag rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white px-3 py-2 text-left text-xs font-semibold text-amber-700 transition hover:from-amber-100 hover:to-amber-50',
          },
          {
            label: '+ Hook & CTA',
            description: 'Define grab + call-to-action',
            onClick: () => mindmap.addChildNode(id, 'hookcta'),
            className:
              'nodrag rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white px-3 py-2 text-left text-xs font-semibold text-violet-700 transition hover:from-violet-100 hover:to-violet-50',
          },
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
        ]}
      />

    </div>
  );
}



