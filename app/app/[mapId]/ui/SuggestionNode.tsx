'use client';

import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { useMindMap } from './MindMapContext';

type SuggestionNodeData = {
  title?: string;
  text?: string;
  sourceNodeId?: string;
  lastGeneratedSourceText?: string;
  lastGeneratedAt?: string;
};

type SuggestionNodeType = Node<SuggestionNodeData, 'suggestion'>;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInlineMarkdown(line: string): string {
  return line
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const output: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      output.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      output.push('</ol>');
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeLists();
      continue;
    }

    const safeLine = renderInlineMarkdown(escapeHtml(line));

    if (line.startsWith('### ')) {
      closeLists();
      output.push(`<h3>${safeLine.slice(4)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeLists();
      output.push(`<h2>${safeLine.slice(3)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      closeLists();
      output.push(`<h1>${safeLine.slice(2)}</h1>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (inOl) {
        output.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        output.push('<ul>');
        inUl = true;
      }
      output.push(`<li>${safeLine.replace(/^[-*]\s+/, '')}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (inUl) {
        output.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        output.push('<ol>');
        inOl = true;
      }
      output.push(`<li>${safeLine.replace(/^\d+\.\s+/, '')}</li>`);
      continue;
    }

    closeLists();
    output.push(`<p>${safeLine}</p>`);
  }

  closeLists();
  return output.join('');
}

export default function SuggestionNode({ id, data, selected }: NodeProps<SuggestionNodeType>) {
  const mindmap = useMindMap();
  const isFocused = selected || mindmap.selectedNodeId === id;
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
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

  return (
    <div
      className={[
        'w-[320px] rounded-2xl border border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 shadow-1',
        isFocused ? 'ring-2 ring-violet-300/40' : '',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-violet-500" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-violet-500" />

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
      <div
        className="mt-2 text-xs leading-5 text-black [&_h1]:mb-1 [&_h1]:text-sm [&_h1]:font-semibold [&_h2]:mb-1 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:text-[12px] [&_h3]:font-semibold [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_code]:rounded [&_code]:bg-violet-100/70 [&_code]:px-1 [&_code]:py-0.5 [&_strong]:font-semibold [&_em]:italic"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(suggestionText) }}
      />

      <button
        type="button"
        onClick={() => void runGenerate()}
        disabled={!canGenerate}
        className="mt-3 w-full rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
      >
        {isGenerating ? 'Generating suggestion...' : 'Generate suggestion'}
      </button>

      {!hasSourceChanged && !isGenerating ? (
        <p className="mt-2 text-[11px] text-body-color">Button unlocks when source text changes.</p>
      ) : null}
      {error ? <p className="mt-2 text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}
