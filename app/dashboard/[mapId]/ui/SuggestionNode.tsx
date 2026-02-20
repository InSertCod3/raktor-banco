'use client';

import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import { LineWave } from 'react-loader-spinner';
import ReactMarkdown from 'react-markdown';
import { useMindMap } from './MindMapContext';

type SuggestionNodeData = {
  title?: string;
  text?: string;
  sourceNodeId?: string;
  lastGeneratedSourceText?: string;
  lastGeneratedAt?: string;
};

type SuggestionNodeType = Node<SuggestionNodeData, 'suggestion'>;

// Secure markdown renderer using react-markdown
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 className="mb-1 text-sm font-semibold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-1 text-[13px] font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-1 text-xs font-semibold">{children}</h3>,
        p: ({ children }) => <p className="mb-2">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc pl-4">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal pl-4">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !String(children).includes('\n');
          if (isInline) {
            return (
              <code className="rounded bg-violet-100/70 px-1 py-0.5" {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function SuggestionNode({ id, data, selected }: NodeProps<SuggestionNodeType>) {
  const mindmap = useMindMap();
  const tooltipClassName =
    'z-20 rounded-xl border border-slate-700/70 bg-slate-900/95 px-3 py-2 text-xs font-medium text-slate-100 shadow-xl backdrop-blur';
  const isFocused = selected || mindmap.selectedNodeId === id;
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copyMessage, setCopyMessage] = React.useState<string | null>(null);
  const hasAutoTriggeredRef = React.useRef(false);

  const sourceNodeId = data?.sourceNodeId;
  const sourceText = sourceNodeId ? mindmap.getNodeText(sourceNodeId).trim() : '';
  const lastGeneratedSourceText = String(data?.lastGeneratedSourceText ?? '').trim();
  const hasSourceChanged = !!sourceText && sourceText !== lastGeneratedSourceText;
  const canGenerate = !isGenerating && !!sourceNodeId && hasSourceChanged;
  const suggestionText = data?.text || 'Auto-generates practical advice from the connected source node.';

  const runGenerate = React.useCallback(async () => {
    if (!sourceNodeId) return;
    const currentSourceText = mindmap.getNodeText(sourceNodeId).trim();
    if (!currentSourceText) {
      setError('Add text to the source node before generating.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      let streamedText = '';
      const result = await mindmap.generateSuggestion(sourceNodeId, {
        onStart: () => {
          streamedText = '';
          mindmap.updateNodeData(id, { text: '' });
        },
        onDelta: (delta) => {
          streamedText += delta;
          mindmap.updateNodeData(id, {
            text: streamedText,
          });
        },
      });
      mindmap.updateNodeData(id, {
        text: result.output,
        lastGeneratedSourceText: currentSourceText,
        lastGeneratedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  }, [id, mindmap, sourceNodeId]);

  React.useEffect(() => {
    if (hasAutoTriggeredRef.current) return;
    if (!sourceNodeId) return;
    if (!sourceText) return;
    if (lastGeneratedSourceText) return;

    hasAutoTriggeredRef.current = true;
    void runGenerate();
  }, [lastGeneratedSourceText, runGenerate, sourceNodeId, sourceText]);

  const copySuggestion = React.useCallback(async () => {
    const plainText = suggestionText.trim();
    if (!plainText) return;

    const fallbackCopy = (text: string): boolean => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
      } catch {
        return false;
      }
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(plainText);
      } else {
        const ok = fallbackCopy(plainText);
        if (!ok) throw new Error('Fallback copy failed');
      }
      setCopyMessage('Copied');
      setTimeout(() => setCopyMessage(null), 1500);
    } catch {
      const ok = fallbackCopy(plainText);
      setCopyMessage(ok ? 'Copied' : 'Copy failed');
      setTimeout(() => setCopyMessage(null), 1500);
    }
  }, [suggestionText]);

  return (
    <div
      className={[
        'relative w-[320px] rounded-2xl border border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 shadow-1',
        isFocused ? 'ring-2 ring-violet-300/40' : '',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
    >
      <Tooltip
        id={`suggestion-copy-tooltip-${id}`}
        place="bottom"
        className={tooltipClassName}
        opacity={1}
        delayShow={80}
      />
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-violet-500" />
      {/* <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-violet-500" /> */}

      <div className="mb-2 flex items-center gap-2 text-violet-700">
        <FontAwesomeIcon icon={faWandMagicSparkles} />
        <span className="text-xs font-semibold uppercase tracking-[0.08em]">Suggestion</span>
        <button
          type="button"
          className="nodrag ml-auto flex h-5 w-5 items-center justify-center rounded bg-white/70 text-[11px] text-violet-700 hover:bg-white"
          onClick={() => mindmap.deleteNode(id)}
          aria-label="Delete suggestion"
        >
          X
        </button>
      </div>
      <div className="text-sm font-semibold text-dark">{data?.title || 'Generation Suggestion'}</div>
      <div className="group relative mt-2">
        <button
          type="button"
          className="nodrag absolute right-1 top-1 z-10 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-all duration-150 hover:bg-violet-700 group-hover:translate-y-0 group-hover:opacity-100"
          style={{ transform: 'translateY(-4px)' }}
          data-tooltip-id={`suggestion-copy-tooltip-${id}`}
          data-tooltip-content="copy all the text"
          onClick={() => void copySuggestion()}
        >
          Copy all
        </button>
        <div
          className="nodrag cursor-default select-text text-xs leading-5 text-black"
        >
          <MarkdownContent content={suggestionText} />
        </div>
      </div>
      {copyMessage ? <p className="mt-1 text-[11px] text-violet-700">{copyMessage}</p> : null}

      <button
        type="button"
        onClick={() => void runGenerate()}
        disabled={!canGenerate}
        className="mt-3 w-full rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
      >
        {isGenerating ? (
          <span className="inline-flex items-center gap-2">
            <LineWave
              visible
              height="28"
              width="36"
              color="#ffffff"
              ariaLabel="suggestion-loading"
            />
            Generating suggestion...
          </span>
        ) : (
          'Generate suggestion'
        )}
      </button>

      {isGenerating ? (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-violet-700">
          <LineWave
            visible
            height="20"
            width="30"
            color="#7c3aed"
            ariaLabel="suggestion-panel-loading"
          />
          <span>Analyzing source and crafting suggestions...</span>
        </div>
      ) : null}

      {!hasSourceChanged && !isGenerating ? (
        <p className="mt-2 text-[11px] text-body-color">Button unlocks when source text changes.</p>
      ) : null}
      {error ? <p className="mt-2 text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

