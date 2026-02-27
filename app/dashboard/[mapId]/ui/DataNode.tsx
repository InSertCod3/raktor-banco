'use client';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import React, { useEffect, useRef, useState } from 'react';
import { useMindMap } from './MindMapContext';
import ConfimationModel from '@/app/components/ConfimationModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faDatabase } from '@fortawesome/free-solid-svg-icons';
import ConnectionHandleWarning from './ConnectionHandleWarning';
import { LineWave } from 'react-loader-spinner';

export type DataNodeType = Node<{
  text?: string;
  sourceNodeId?: string;
  questions?: string[];
  answers?: string[];
  isLoading?: boolean;
  hasGeneratedQuestions?: boolean;
  singleQuestion?: boolean;
  isCustom?: boolean;
  dataType?: string;
}, 'datanode'>;

export default function DataNode({ id, data, selected }: NodeProps<DataNodeType>) {
  const mindmap = useMindMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNodeHovering, setIsNodeHovering] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isDataTypeMenuOpen, setIsDataTypeMenuOpen] = useState(false);
  const dataTypeMenuRef = useRef<HTMLDivElement | null>(null);
  const isEditingRef = useRef(false);

  const isFocused = selected || mindmap.selectedNodeId === id;
  const isLoading = data?.isLoading ?? false;
  const hasGeneratedQuestions = data?.hasGeneratedQuestions ?? false;
  const isSingleQuestion = data?.singleQuestion ?? false;
  const isCustom = data?.isCustom ?? false;
  const questions = data?.questions || [];
  const warningData = data as
    | { connectionWarning?: string | null; connectionWarningSide?: 'left' | 'right' | 'both' | null }
    | undefined;
  const connectionWarning = warningData?.connectionWarning;
  const connectionWarningSide = warningData?.connectionWarningSide ?? 'left';

  // Get the single question or first question
  const question = isSingleQuestion ? questions[0] : (questions.length > 0 ? questions[0] : '');
  
  // Initialize answer from data
  useEffect(() => {
    if (data?.answers && data.answers.length > 0) {
      setAnswer(data.answers[0] || '');
    }
  }, [data?.answers]);

  // Close data type menu on outside click
  useEffect(() => {
    if (!isDataTypeMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dataTypeMenuRef.current) return;
      if (dataTypeMenuRef.current.contains(event.target as globalThis.Node)) return;
      setIsDataTypeMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDataTypeMenuOpen]);

  const handleDelete = () => {
    mindmap.deleteNode(id);
    setIsDeleteModalOpen(false);
  };

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    // Update the node data with answers
    mindmap.updateNodeData(id, { answers: [value] });
  };

  const getAnswerPlaceholder = (): string => {
    if (!question) return 'Your answer here...';
    
    if (question.toLowerCase().includes('statistic') || question.toLowerCase().includes('percentage')) {
      return 'e.g., 73% of businesses...';
    }
    if (question.toLowerCase().includes('example') || question.toLowerCase().includes('case study')) {
      return 'e.g., Company X achieved...';
    }
    if (question.toLowerCase().includes('proof') || question.toLowerCase().includes('evidence')) {
      return 'e.g., Research shows...';
    }
    return 'Your answer here...';
  };

  return (
    <div
      className="relative w-[300px] rounded-2xl border border-cyan-300 bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
      onMouseEnter={() => setIsNodeHovering(true)}
      onMouseLeave={() => setIsNodeHovering(false)}
      style={{
        boxShadow: isFocused 
          ? '0 0 30px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.1)' 
          : '0 0 20px rgba(6,182,212,0.15)',
      }}
    >
      {/* Animated glow border effect */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-50"
        style={{
          background: `linear-gradient(135deg, 
            rgba(6,182,212,0.1) 0%, 
            rgba(34,211,238,0.05) 50%, 
            rgba(6,182,212,0.1) 100%)`,
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
      />
      
      <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !bg-cyan-500" />
      <ConnectionHandleWarning message={connectionWarning} side={connectionWarningSide} />

      <div className="mb-2 flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-sm">
            <FontAwesomeIcon icon={faDatabase} className="text-[10px] text-white" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan-700">Data Node</div>
            <div className="text-xs font-medium text-dark">
              {isSingleQuestion ? 'One data point' : 'Supporting data'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-1 rounded-md bg-cyan-100 px-2 py-1">
              <LineWave
                visible
                height="16"
                width="20"
                color="#06b6d4"
                ariaLabel="data-loading"
              />
            </div>
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
        title="Delete Data Node"
        itemName="Data Node"
        phraseEnforce={false}
      />

      {/* Content Section */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <LineWave
                visible
                height="40"
                width="50"
                color="#06b6d4"
                ariaLabel="generating-questions"
              />
              <p className="mt-2 text-xs text-cyan-700">Generating...</p>
            </div>
          </div>
        ) : hasGeneratedQuestions && question ? (
          <div className="space-y-2">
            {/* Data Type Dropdown for Custom Nodes */}
            {isCustom && (
              <div ref={dataTypeMenuRef} className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setIsDataTypeMenuOpen((open) => !open)}
                  className="nodrag flex w-full items-center justify-between rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-dark shadow-sm outline-hidden transition hover:border-cyan-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200/70"
                >
                  <span className="flex items-center gap-2">
                    {(data?.dataType === 'text' || !data?.dataType) && <span>📝 Text</span>}
                    {data?.dataType === 'image' && <span>🖼️ Image</span>}
                    {data?.dataType === 'document' && <span>📄 Document</span>}
                    {data?.dataType === 'integration' && <span>🔗 Integration</span>}
                  </span>
                  <span className={`text-cyan-600 transition ${isDataTypeMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isDataTypeMenuOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-cyan-200 bg-white shadow-[0_12px_24px_rgba(17,24,39,0.14)]">
                    <ul className="max-h-48 overflow-y-auto py-1">
                      <li>
                        <button
                          type="button"
                          className="nodrag flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-cyan-50"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            mindmap.updateNodeData(id, { dataType: 'text' });
                            setIsDataTypeMenuOpen(false);
                          }}
                        >
                          <span>📝 Text</span>
                          <span className="text-xs text-cyan-600">(Available)</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="nodrag flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-400 transition cursor-not-allowed"
                          disabled
                        >
                          <span>🖼️ Image</span>
                          <span className="text-xs text-slate-400">(Coming Soon)</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="nodrag flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-400 transition cursor-not-allowed"
                          disabled
                        >
                          <span>📄 Document</span>
                          <span className="text-xs text-slate-400">(Coming Soon)</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="nodrag flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-400 transition cursor-not-allowed"
                          disabled
                        >
                          <span>🔗 Integration</span>
                          <span className="text-xs text-slate-400">(Coming Soon)</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
            <p className="text-xs font-semibold text-cyan-900">{question}</p>
            <textarea
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              onFocus={() => {
                isEditingRef.current = true;
              }}
              onBlur={() => {
                isEditingRef.current = false;
              }}
              placeholder={getAnswerPlaceholder()}
              rows={3}
              className="nodrag w-full resize-none rounded-lg border border-cyan-200 bg-white p-3 text-sm text-dark placeholder:text-body-color focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-cyan-200 bg-white/60 p-3">
            <p className="text-xs text-cyan-700">
              Click the <FontAwesomeIcon icon={faDatabase} className="mx-1 text-[10px]" /> button on the Idea node to generate data questions.
            </p>
          </div>
        )}
        
        {/* Animated flowing dots decoration */}
        {!isLoading && hasGeneratedQuestions && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-400" style={{ animationDelay: '0ms' }} />
            <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-400" style={{ animationDelay: '200ms' }} />
            <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-400" style={{ animationDelay: '400ms' }} />
          </div>
        )}
      </div>

      {/* Flowing border animation */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
