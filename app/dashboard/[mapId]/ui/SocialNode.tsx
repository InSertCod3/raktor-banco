'use client';

import React, { useState, useMemo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMindMap, type Platform } from './MindMapContext';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import { ColorRing } from 'react-loader-spinner';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

type SocialNodeData = {
  label?: string;
  type: 'social';
  platform?: Platform;
  content?: string;
  messagingLengthByPlatform?: Partial<Record<Platform, MessagingLengthOption | 'medium' | 'long'>>;
};

type SocialNodeType = Node<SocialNodeData, 'social'>;
type MessagingLengthOption = 'shortest' | 'shorter' | 'standard' | 'longer' | 'longest';

const MESSAGING_LENGTH_OPTIONS: { value: MessagingLengthOption; label: string }[] = [
  { value: 'shortest', label: 'Shortest' },
  { value: 'shorter', label: 'Shorter' },
  { value: 'standard', label: 'Standard' },
  { value: 'longer', label: 'Longer' },
  { value: 'longest', label: 'Longest' },
];

function platformLabel(platform: Platform) {
  if (platform === 'LINKEDIN') return 'LinkedIn';
  if (platform === 'FACEBOOK') return 'Facebook';
  return 'Instagram';
}

// Markdown renderer for social node content
function SocialMarkdownContent({ content }: { content: string }) {
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
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children, ...props }) => <em className="italic" {...props}>{children}</em>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function SocialNode({ id, data, selected }: NodeProps<SocialNodeType>) {
  const mindmap = useMindMap();
  const tooltipClassName =
    'z-20 rounded-xl border border-slate-700/70 bg-slate-900/95 px-3 py-2 text-xs font-medium text-slate-100 shadow-xl backdrop-blur';
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>(data?.platform ?? 'LINKEDIN');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedOutput, setStreamedOutput] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Process streamed output to remove asterisks
  const processedStreamedOutput = React.useMemo(() => {
    let processed = streamedOutput;
    processed = processed.replace(/\*\*/g, '');
    processed = processed.replace(/\*/g, '');
    return processed;
  }, [streamedOutput]);

  const isFocused = selected || mindmap.selectedNodeId === id;
  const rawContent = String(data?.content ?? '');
  
  // Remove asterisks from content
  const content = React.useMemo(() => {
    let processed = rawContent;
    processed = processed.replace(/\*\*/g, ''); // remove double asterisks first
    processed = processed.replace(/\*/g, '');   // then remove single asterisks
    return processed;
  }, [rawContent]);
  
  const messagingLengthByPlatform = data?.messagingLengthByPlatform ?? {};
  const currentLengthValue =
    messagingLengthByPlatform[platform] === 'medium'
      ? 'standard'
      : messagingLengthByPlatform[platform] === 'long'
      ? 'longer'
      : messagingLengthByPlatform[platform] ?? 'standard';
  const currentLengthIndex = MESSAGING_LENGTH_OPTIONS.findIndex((option) => option.value === currentLengthValue);
  const safeLengthIndex = currentLengthIndex >= 0 ? currentLengthIndex : 2;

  const copyWithFallback = (text: string): boolean => {
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

  const handleCopy = async () => {
    const textToCopy = isGenerating && streamedOutput ? streamedOutput : content;
    if (!textToCopy) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else if (!copyWithFallback(textToCopy)) {
        throw new Error('Fallback copy failed');
      }
      toast.success('copied to clipboard', {
        id: `copy-social-${id}`,
        position: 'top-right',
      });
    } catch {
      const ok = copyWithFallback(textToCopy);
      if (ok) {
        toast.success('copied to clipboard', {
          id: `copy-social-${id}`,
          position: 'top-right',
        });
      } else {
        toast.error('copy failed', {
          id: `copy-social-${id}`,
          position: 'top-right',
        });
      }
    }
  };

  const handleDelete = () => {
    mindmap.deleteNode(id);
    setIsDeleteModalOpen(false);
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setStreamedOutput('');
    try {
      await mindmap.generate(
        id,
        platform,
        {
          onDelta: (delta) => setStreamedOutput((current) => `${current}${delta}`),
        },
        { socialNodeId: id }
      );
      setStreamedOutput('');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Generation failed.';
      setError(errorMessage);
      // Check if it's a usage limit error
      if (errorMessage.includes('Usage limit exceeded')) {
        setShowUpgradeModal(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className={[
        'relative w-[360px] rounded-2xl border p-4 shadow-1',
        isFocused ? 'border-primary bg-blue-50 ring-2 ring-primary/20' : 'border-stroke bg-white',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
    >
      <Tooltip
        id={`social-copy-tooltip-${id}`}
        place="bottom"
        className={tooltipClassName}
        opacity={1}
        delayShow={80}
      />
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-primary" />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">Social Draft</div>
          <div className="text-sm font-semibold text-dark">{platformLabel(platform)}</div>
        </div>
        <button
          type="button"
          className="nodrag rounded-md bg-red-500 px-2 py-1 text-[11px] text-white hover:bg-red-6"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Social Draft"
        itemName={data?.label || 'Social Draft'}
        phraseEnforce={false}
      />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-stroke bg-white p-6 shadow-2">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-dark">Usage Limit Reached</h3>
              <p className="mb-6 text-body-color">
                You've reached your monthly generation limit. Upgrade to continue creating content.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/pricing"
                  className="w-full rounded-lg bg-primary py-3 text-center font-semibold text-white hover:bg-blue-dark"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  View Pricing Plans
                </Link>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full rounded-lg border border-stroke py-3 text-center font-semibold text-body-color hover:bg-gray-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center gap-1 rounded-xl bg-gray-1 p-1">
        {(['LINKEDIN', 'FACEBOOK', 'INSTAGRAM'] as Platform[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPlatform(item)}
            className={[
              'nodrag rounded-lg px-2.5 py-1 text-xs font-medium',
              platform === item ? 'bg-white text-dark shadow-1' : 'text-body-color hover:text-dark',
            ].join(' ')}
          >
            {platformLabel(item)}
          </button>
        ))}
      </div>

      <div className="mb-3 rounded-xl border border-stroke bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-body-color">Messaging Length</div>
                <div className="text-[11px] font-semibold text-dark">
                  {MESSAGING_LENGTH_OPTIONS[safeLengthIndex].label}
                </div>
              </div>
              <div className="relative mb-2">
                <input
                  type="range"
                  min={0}
                  max={MESSAGING_LENGTH_OPTIONS.length - 1}
                  step={1}
                  value={safeLengthIndex}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const nextIndex = Number(e.target.value);
                    const nextValue = MESSAGING_LENGTH_OPTIONS[nextIndex]?.value ?? 'standard';
                    mindmap.updateNodeData(id, {
                      messagingLengthByPlatform: {
                        ...messagingLengthByPlatform,
                        [platform]: nextValue,
                      },
                    });
                  }}
                  className="nodrag h-2 w-full appearance-none rounded-lg bg-gray-200 outline-none focus:outline-none disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95"
                  aria-label={`Messaging length for ${platformLabel(platform)}`}
                />
              </div>
              <div className="grid grid-cols-5 gap-1">
                {MESSAGING_LENGTH_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      mindmap.updateNodeData(id, {
                        messagingLengthByPlatform: {
                          ...messagingLengthByPlatform,
                          [platform]: option.value,
                        },
                      });
                    }}
                    className={[
                      'rounded-lg py-1.5 text-[10px] font-medium transition-all',
                      index === safeLengthIndex
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-50 text-body-color hover:bg-gray-100',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

      <button
        type="button"
        className="nodrag mb-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-dark disabled:opacity-60"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <span className="inline-flex items-center gap-2">
            <ColorRing
              visible
              height={18}
              width={18}
              ariaLabel="social-generation-loading"
              colors={['#ffffff', '#dbeafe', '#bfdbfe', '#93c5fd', '#ffffff']}
            />
            {`Generating ${platformLabel(platform)}...`}
          </span>
        ) : (
          `Generate ${platformLabel(platform)}`
        )}
      </button>

      <div className="min-h-[170px] rounded-xl border border-stroke bg-white p-3">
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {!error && isGenerating && !streamedOutput ? (
          <div className="mb-2 flex items-center gap-2 text-xs text-body-color">
            <ColorRing
              visible
              height={22}
              width={22}
              ariaLabel="social-stream-loading"
              colors={['#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe', '#2563eb']}
            />
            <span>Preparing your post...</span>
          </div>
        ) : null}
        {!error && !content && !streamedOutput ? (
          <p className="text-xs text-body-color">Generate a post from connected idea context.</p>
        ) : null}
        <div className="group relative">
          <button
            type="button"
            className="nodrag absolute right-1 top-1 z-10 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-all duration-150 hover:bg-blue-dark group-hover:translate-y-0 group-hover:opacity-100"
            style={{ transform: 'translateY(-4px)' }}
            data-tooltip-id={`social-copy-tooltip-${id}`}
            data-tooltip-content="copy all the text"
            onClick={() => void handleCopy()}
          >
            Copy all
          </button>
          <div className="nodrag cursor-default select-text whitespace-pre-wrap text-sm leading-relaxed text-dark">
            <SocialMarkdownContent content={isGenerating && streamedOutput ? streamedOutput : content} />
          </div>
        </div>
      </div>
    </div>
  );
}
