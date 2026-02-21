'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMindMap, type Platform } from './MindMapContext';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faHighlighter, faComment } from '@fortawesome/free-solid-svg-icons';
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

// Split content into sentences for highlighting
function splitIntoSentences(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  if (sentences.length === 0 || (sentences.length === 1 && sentences[0] === text)) {
    return text.split('\n').filter(s => s.trim().length > 0);
  }
  
  return sentences;
}

// Refine sentence component
function HighlightableSentence({ 
  text, 
  isHighlighted, 
  onClick,
  index,
  onShowSuggestions,
  isActive,
  onHoverChange
}: { 
  text: string; 
  isHighlighted: boolean; 
  onClick: () => void;
  index: number;
  onShowSuggestions: (index: number, event: React.MouseEvent) => void;
  isActive: boolean;
  onHoverChange: (index: number | null) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(text);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <span className="relative inline">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="nodrag rounded border-2 border-primary bg-yellow-50 px-1 py-0.5 text-inherit outline-none"
          autoFocus
        />
      </span>
    );
  }

  return (
    <span
      onMouseEnter={(e) => {
        onHoverChange(index);
        onShowSuggestions(index, e);
      }}
      onMouseLeave={() => onHoverChange(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`relative cursor-pointer rounded px-1 py-0.5 transition-all duration-150 ease-out ${
        isActive
          ? 'text-black bg-yellow-300 scale-105 z-10'
          : 'bg-transparent hover:bg-gray-100'
      } ${isHighlighted ? 'bg-yellow-300' : ''}`}
    >
      {text}
    </span>
  );
}

// Render content with selectable sentence refinement
function HighlightableContent({ 
  content, 
  highlightedIndex,
  onToggle,
  onShowSuggestions,
  hoveredSentence,
  setHoveredSentence,
  activeSentenceIndex
}: { 
  content: string; 
  highlightedIndex: number | null;
  onToggle: (index: number) => void;
  onShowSuggestions: (index: number, event: React.MouseEvent) => void;
  hoveredSentence: number | null;
  setHoveredSentence: (index: number | null) => void;
  activeSentenceIndex: number | null;
}) {
  const sentences = useMemo(() => splitIntoSentences(content), [content]);
  
  return (
    <span>
      {sentences.map((sentence, index) => (
        <React.Fragment key={index}>
          <HighlightableSentence
            text={sentence}
            isHighlighted={highlightedIndex === index}
            onClick={() => onToggle(index)}
            index={index}
            onShowSuggestions={onShowSuggestions}
            isActive={hoveredSentence === index || activeSentenceIndex === index}
            onHoverChange={setHoveredSentence}
          />
          {index < sentences.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </span>
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
  const [isRefineMode, setIsRefineMode] = useState(false);
  const [refinedSentenceIndex, setRefinedSentenceIndex] = useState<number | null>(null);
  const [showSuggestionsMenu, setShowSuggestionsMenu] = useState(false);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [hoveredSentence, setHoveredSentence] = useState<number | null>(null);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [previewSuggestion, setPreviewSuggestion] = useState<string | null>(null);
  const suggestionsMenuRef = React.useRef<HTMLDivElement | null>(null);
  const [showCustomEntryModal, setShowCustomEntryModal] = useState(false);
  const [customSentenceInput, setCustomSentenceInput] = useState('');
  const [customSentenceError, setCustomSentenceError] = useState<string | null>(null);

  // Reset selected sentence when content changes
  useEffect(() => {
    setRefinedSentenceIndex(null);
  }, [data?.content]);

  useEffect(() => {
    if (!showSuggestionsMenu) return;

    const onDocumentMouseDown = (event: MouseEvent) => {
      const target = event.target as globalThis.Node | null;
      if (target && suggestionsMenuRef.current?.contains(target)) return;
      setShowSuggestionsMenu(false);
      setSelectedSentenceIndex(null);
      setGeneratedSuggestions([]);
      setSuggestionsError(null);
      setPreviewSuggestion(null);
      setHoveredSentence(null);
      setShowCustomEntryModal(false);
      setCustomSentenceInput('');
      setCustomSentenceError(null);
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  }, [showSuggestionsMenu]);

  const isFocused = selected || mindmap.selectedNodeId === id;
  const rawContent = String(data?.content ?? '');
  
  // Remove asterisks from content
  const content = React.useMemo(() => {
    let processed = rawContent;
    processed = processed.replace(/\*\*/g, '');
    processed = processed.replace(/\*/g, '');
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
    
    // Keep only the selected sentence during regeneration
    const sentences = splitIntoSentences(content);
    const keptSentence =
      refinedSentenceIndex !== null && refinedSentenceIndex < sentences.length
        ? sentences[refinedSentenceIndex]
        : '';
    
    try {
      await mindmap.generate(
        id,
        platform,
        {
          onDelta: (delta) => setStreamedOutput((current) => `${current}${delta}`),
        },
        { socialNodeId: id, keptSentences: keptSentence || undefined }
      );
      setStreamedOutput('');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Generation failed.';
      setError(errorMessage);
      if (errorMessage.includes('Usage limit exceeded')) {
        setShowUpgradeModal(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle single sentence selection for refinement
  const toggleHighlight = (index: number) => {
    setRefinedSentenceIndex((current) => (current === index ? null : index));
  };

  // Show suggestions menu at sentence position
  const showSentenceSuggestions = (index: number, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    // Position popup right below the sentence in viewport coordinates.
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setSelectedSentenceIndex(index);
    setGeneratedSuggestions([]);
    setSuggestionsError(null);
    setPreviewSuggestion(null);
    setShowSuggestionsMenu(true);
  };

  const applySentenceSuggestion = (suggestion: string) => {
    if (selectedSentenceIndex === null) return;
    const sentences = splitIntoSentences(content);
    if (selectedSentenceIndex >= sentences.length) return;

    sentences[selectedSentenceIndex] = suggestion;
    const newContent = sentences.join(' ');
    mindmap.updateNodeData(id, { content: newContent });
    setRefinedSentenceIndex(selectedSentenceIndex);
    setHoveredSentence(null);
    setShowSuggestionsMenu(false);
    setSelectedSentenceIndex(null);
    setGeneratedSuggestions([]);
    setPreviewSuggestion(null);
    setShowCustomEntryModal(false);
    setCustomSentenceInput('');
    setCustomSentenceError(null);
  };

  const generateSentenceSuggestions = async () => {
    if (selectedSentenceIndex === null || isGeneratingSuggestions) return;

    const sentences = splitIntoSentences(content);
    const selectedSentence = sentences[selectedSentenceIndex];
    if (!selectedSentence) return;

    setIsGeneratingSuggestions(true);
    setSuggestionsError(null);
    setGeneratedSuggestions([]);
    setPreviewSuggestion(null);

    try {
      const res = await fetch('/api/sentence-suggestions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mapId: mindmap.mapId,
          nodeId: id,
          platform,
          sentence: selectedSentence,
          fullPostText: content,
        }),
      });

      const data = (await res.json().catch(() => null)) as { suggestions?: string[]; error?: string } | null;
      if (!res.ok) {
        const message = data?.error ?? 'Could not generate suggestions.';
        setSuggestionsError(message);
        if (message.includes('Usage limit exceeded')) {
          setShowUpgradeModal(true);
        }
        return;
      }

      const suggestions = (data?.suggestions ?? []).map((item) => item.trim()).filter(Boolean);
      if (suggestions.length === 0) {
        setSuggestionsError('No suggestions returned.');
        return;
      }
      setGeneratedSuggestions(suggestions);
    } catch {
      setSuggestionsError('Could not generate suggestions.');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const applyCustomSentenceSuggestion = () => {
    if (selectedSentenceIndex === null) return;
    const sentences = splitIntoSentences(content);
    if (selectedSentenceIndex < 0 || selectedSentenceIndex >= sentences.length) return;

    const customText = customSentenceInput.trim();
    if (!customText) {
      setCustomSentenceError('Please enter a replacement sentence.');
      return;
    }

    sentences[selectedSentenceIndex] = customText;
    const newContent = sentences.join(' ');
    mindmap.updateNodeData(id, { content: newContent });
    setRefinedSentenceIndex(selectedSentenceIndex);
    setHoveredSentence(null);
    setShowSuggestionsMenu(false);
    setSelectedSentenceIndex(null);
    setPreviewSuggestion(null);
    setShowCustomEntryModal(false);
    setCustomSentenceInput('');
    setCustomSentenceError(null);
  };

  const selectedCount = refinedSentenceIndex === null ? 0 : 1;
  const totalSentences = splitIntoSentences(content).length;
  const baseDisplayContent = isGenerating && streamedOutput ? streamedOutput : content;
  const displayContent = useMemo(() => {
    if (
      !isRefineMode ||
      isGenerating ||
      !showSuggestionsMenu ||
      selectedSentenceIndex === null ||
      !previewSuggestion
    ) {
      return baseDisplayContent;
    }

    const sentences = splitIntoSentences(content);
    if (selectedSentenceIndex < 0 || selectedSentenceIndex >= sentences.length) {
      return baseDisplayContent;
    }
    sentences[selectedSentenceIndex] = previewSuggestion;
    return sentences.join(' ');
  }, [
    baseDisplayContent,
    content,
    isGenerating,
    isRefineMode,
    previewSuggestion,
    selectedSentenceIndex,
    showSuggestionsMenu,
  ]);

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

      <div className="flex gap-2">
        <button
          type="button"
          className="nodrag mb-3 flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-dark disabled:opacity-60"
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
              Generating...
            </span>
          ) : (
            `Generate ${platformLabel(platform)}`
          )}
        </button>

        {/* Refine Toggle */}
        {content && !isGenerating && (
          <button
            type="button"
            onClick={() => {
              setIsRefineMode(!isRefineMode);
            }}
            className={`nodrag mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
              isRefineMode 
                ? 'border-yellow-400 bg-yellow-50 text-yellow-700' 
                : 'border-gray-200 bg-white text-gray-600 hover:border-yellow-300 hover:bg-yellow-50'
            }`}
          >
            <FontAwesomeIcon 
              icon={faHighlighter} 
              className={isRefineMode ? 'text-yellow-500' : ''} 
            />
            <span className="hidden sm:inline">Refine</span>
          </button>
        )}
      </div>

      {/* Refine Mode Controls */}
      {isRefineMode && content && (
        <div className="mb-3 rounded-xl border-2 border-yellow-300/50 bg-yellow-50/80 p-2">
          <div className="mb-2 flex items-center justify-between text-[10px]">
            <span className="font-semibold text-yellow-800">
              <FontAwesomeIcon icon={faHighlighter} className="mr-1" />
              Refine Mode
            </span>
            <span className="text-yellow-700">
              {selectedCount} of {totalSentences} selected
            </span>
          </div>
          <div className="flex gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => setRefinedSentenceIndex(null)}
              className="rounded bg-white px-2 py-1.5 font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={() => setIsRefineMode(false)}
              className="ml-auto rounded bg-yellow-400 px-2 py-1.5 font-semibold text-yellow-900 shadow-sm hover:bg-yellow-500"
            >
              Done
            </button>
          </div>
          <div className="mt-2 text-[9px] text-yellow-700/70">
            Pick one sentence to preserve on regenerate. Hover any sentence for suggestions, click to switch selection.
          </div>
        </div>
      )}

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
          {!isRefineMode && (
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
          )}
          <div className="nodrag select-text whitespace-pre-wrap text-sm leading-relaxed text-dark">
            {isRefineMode ? (
              <HighlightableContent
                content={displayContent}
                highlightedIndex={refinedSentenceIndex}
                onToggle={toggleHighlight}
                onShowSuggestions={showSentenceSuggestions}
                hoveredSentence={hoveredSentence}
                setHoveredSentence={setHoveredSentence}
                activeSentenceIndex={selectedSentenceIndex}
              />
            ) : (
              <ReactMarkdown>
                {displayContent}
              </ReactMarkdown>
            )}
          </div>
          
          {/* Context Menu for Sentence Suggestions */}
          {showSuggestionsMenu && selectedSentenceIndex !== null && (
            <>
              <div 
                ref={suggestionsMenuRef}
                className="fixed z-50 mt-1 w-80 rounded-2xl border border-stroke/80 bg-white/95 p-3 shadow-2 backdrop-blur"
                style={{ left: menuPosition.x, top: menuPosition.y }}
              >
                <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/60 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
                    Sentence Assistant
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-blue-900/80">
                    Generate alternatives, hover to preview inline, then apply the one you want.
                  </p>
                </div>
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void generateSentenceSuggestions()}
                    disabled={isGeneratingSuggestions}
                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGeneratingSuggestions ? 'Generating...' : 'Generate Suggestions'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomEntryModal(true);
                      setCustomSentenceInput('');
                      setCustomSentenceError(null);
                      setPreviewSuggestion(null);
                    }}
                    className="rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-semibold text-dark hover:bg-gray-50"
                  >
                    <FontAwesomeIcon icon={faComment} className="mr-1.5 text-body-color" />
                    Custom
                  </button>
                </div>

                {suggestionsError ? (
                  <div className="mb-2 rounded-md bg-red-50 px-2 py-1.5 text-[11px] text-red-600">{suggestionsError}</div>
                ) : null}

                {generatedSuggestions.length > 0 ? (
                  <div className="mb-2 space-y-2">
                    {generatedSuggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion}-${index}`}
                        className="rounded-lg border border-gray-100 bg-gray-50 p-2"
                        onMouseEnter={() => setPreviewSuggestion(suggestion)}
                        onMouseLeave={() => setPreviewSuggestion(null)}
                      >
                        <p className="text-[11px] leading-relaxed text-dark">{suggestion}</p>
                        <button
                          type="button"
                          onClick={() => applySentenceSuggestion(suggestion)}
                          className="mt-2 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-primary ring-1 ring-primary/20 hover:bg-primary hover:text-white"
                        >
                          Use this
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-2 rounded-md bg-blue-50 px-2 py-1.5 text-[11px] text-blue-700">
                    Generate suggestions, then press <span className="font-semibold">Use this</span> to drop one in.
                  </div>
                )}
                {showCustomEntryModal && (
                  <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <div className="mb-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                        Custom Replacement
                      </div>
                      <p className="mt-1 text-[11px] text-body-color">Your text previews inline while you type.</p>
                    </div>
                    <textarea
                      value={customSentenceInput}
                      onChange={(e) => {
                        const next = e.target.value;
                        setCustomSentenceInput(next);
                        setCustomSentenceError(null);
                        setPreviewSuggestion(next.trim() || null);
                      }}
                      placeholder="Type a new sentence for this spot..."
                      rows={4}
                      className="nodrag w-full rounded-xl border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary"
                    />
                    {customSentenceError ? (
                      <p className="mt-2 text-xs text-red-600">{customSentenceError}</p>
                    ) : null}
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomEntryModal(false);
                          setCustomSentenceInput('');
                          setCustomSentenceError(null);
                          setPreviewSuggestion(null);
                        }}
                        className="rounded-lg border border-stroke px-3 py-2 text-xs font-semibold text-body-color hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={applyCustomSentenceSuggestion}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-dark"
                      >
                        Apply Replacement
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
