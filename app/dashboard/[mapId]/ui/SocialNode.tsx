'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMindMap, type Platform } from './MindMapContext';
import ConfimationModel from '@/app/components/ConfimationModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faHighlighter, faComment, faXmark, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import { ColorRing } from 'react-loader-spinner';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import ConnectionHandleWarning from './ConnectionHandleWarning';

type SocialNodeData = {
  label?: string;
  type: 'social' | 'coldlead';
  platform?: Platform;
  content?: string;
  contentByPlatform?: Partial<Record<Platform, string>>;
  messagingLengthByPlatform?: Partial<Record<Platform, MessagingLengthOption | 'medium' | 'long'>>;
};

type SocialNodeType = Node<SocialNodeData, 'social' | 'coldlead'>;
type MessagingLengthOption = 'shortest' | 'shorter' | 'standard' | 'longer' | 'longest';
type SentenceChangeKind = 'suggestion' | 'custom' | 'deleted';
type SocialNodeVariant = 'social' | 'coldlead';

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
  onSentenceClick,
  index,
  isActive,
  onHoverChange,
  changeKind,
}: { 
  text: string; 
  isHighlighted: boolean; 
  onSentenceClick: (index: number, event: React.MouseEvent) => void;
  index: number;
  isActive: boolean;
  onHoverChange: (index: number | null) => void;
  changeKind: SentenceChangeKind | null;
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

  const stateClass = changeKind === 'deleted'
    ? `bg-red-100 text-red-800 ring-1 ring-red-300/70 line-through decoration-red-500 ${
        isActive || isHighlighted ? 'scale-105 z-10 ring-red-400' : ''
      }`
    : isActive || isHighlighted
    ? 'text-black bg-yellow-300 scale-105 z-10 ring-1 ring-yellow-400/80'
    : changeKind === 'suggestion'
    ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300/70'
    : changeKind === 'custom'
    ? 'bg-sky-100 text-sky-900 ring-1 ring-sky-300/70'
    : 'bg-transparent hover:bg-gray-100';

  return (
    <span
      onMouseEnter={(e) => {
        onHoverChange(index);
      }}
      onMouseLeave={() => onHoverChange(null)}
      onClick={(e) => {
        e.stopPropagation();
        onSentenceClick(index, e);
      }}
      className={`relative cursor-pointer rounded px-1 py-0.5 transition-all duration-150 ease-out ${stateClass}`}
    >
      {text}
    </span>
  );
}

// Render content with selectable sentence refinement
function HighlightableContent({ 
  content, 
  highlightedIndex,
  onSentenceClick,
  hoveredSentence,
  setHoveredSentence,
  activeSentenceIndex,
  sentenceChangeMap,
}: { 
  content: string; 
  highlightedIndex: number | null;
  onSentenceClick: (index: number, event: React.MouseEvent) => void;
  hoveredSentence: number | null;
  setHoveredSentence: (index: number | null) => void;
  activeSentenceIndex: number | null;
  sentenceChangeMap: Record<number, SentenceChangeKind>;
}) {
  const sentences = useMemo(() => splitIntoSentences(content), [content]);
  
  return (
    <span>
      {sentences.map((sentence, index) => (
        <React.Fragment key={index}>
          <HighlightableSentence
            text={sentence}
            isHighlighted={highlightedIndex === index}
            onSentenceClick={onSentenceClick}
            index={index}
            isActive={activeSentenceIndex === index}
            onHoverChange={setHoveredSentence}
            changeKind={sentenceChangeMap[index] ?? null}
          />
          {index < sentences.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </span>
  );
}

export default function SocialNode({
  id,
  data,
  selected,
  variant = 'social',
}: NodeProps<SocialNodeType> & { variant?: SocialNodeVariant }) {
  const mindmap = useMindMap();
  const tooltipClassName =
    'z-20 rounded-xl border border-slate-700/70 bg-slate-900/95 px-3 py-2 text-xs font-medium text-slate-100 shadow-xl backdrop-blur';
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>(data?.platform ?? 'LINKEDIN');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedOutput, setStreamedOutput] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isCancelRefineModalOpen, setIsCancelRefineModalOpen] = useState(false);
  const [isDoneRefineModalOpen, setIsDoneRefineModalOpen] = useState(false);
  const [isRefineMode, setIsRefineMode] = useState(false);
  const [refinedSentenceIndex, setRefinedSentenceIndex] = useState<number | null>(null);
  const [refineDraftContent, setRefineDraftContent] = useState('');
  const [refineSentenceChanges, setRefineSentenceChanges] = useState<Record<number, SentenceChangeKind>>({});
  const [showSuggestionsMenu, setShowSuggestionsMenu] = useState(false);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [menuSide, setMenuSide] = useState<'right' | 'left'>('right');
  const [hoveredSentence, setHoveredSentence] = useState<number | null>(null);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [previewSuggestion, setPreviewSuggestion] = useState<string | null>(null);
  const suggestionsMenuRef = React.useRef<HTMLDivElement | null>(null);
  const [showCustomEntryModal, setShowCustomEntryModal] = useState(false);
  const [customSentenceInput, setCustomSentenceInput] = useState('');
  const [customSentenceError, setCustomSentenceError] = useState<string | null>(null);
  const nodeContainerRef = React.useRef<HTMLDivElement | null>(null);
  const closeSentenceAssistant = () => {
    setShowSuggestionsMenu(false);
    setSelectedSentenceIndex(null);
    setRefinedSentenceIndex(null);
    setHoveredSentence(null);
    setGeneratedSuggestions([]);
    setSuggestionsError(null);
    setPreviewSuggestion(null);
    setShowCustomEntryModal(false);
    setCustomSentenceInput('');
    setCustomSentenceError(null);
  };

  const isFocused = selected || mindmap.selectedNodeId === id;
  const isColdLead = variant === 'coldlead';
  const titleLabel = isColdLead ? 'Prospect Outreach' : 'Social Draft';
  const generationMode = isColdLead ? 'LINKEDIN_DM_LEAD' : 'SOCIAL_POST';
  const warningData = data as
    | { connectionWarning?: string | null; connectionWarningSide?: 'left' | 'right' | 'both' | null }
    | undefined;
  const connectionWarning = warningData?.connectionWarning;
  const connectionWarningSide = warningData?.connectionWarningSide ?? 'left';
  const headerTagClass = isColdLead ? 'text-indigo-700' : 'text-primary';
  const activeTabClass = isColdLead
    ? 'bg-gradient-to-b from-indigo-600 to-blue-600 text-white shadow-md'
    : 'bg-gradient-to-b from-primary to-blue-600 text-white shadow-md';
  const generateButtonClass = isColdLead
    ? 'nodrag flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60'
    : 'nodrag flex-1 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-dark disabled:opacity-60';
  const contentByPlatform = (data?.contentByPlatform ?? {}) as Partial<Record<Platform, string>>;
  const fallbackContent = String(data?.content ?? '');
  const hasAnyPlatformContent = (['LINKEDIN', 'FACEBOOK', 'INSTAGRAM'] as Platform[]).some((key) =>
    Boolean(contentByPlatform[key]?.trim())
  );
  const rawContent =
    hasAnyPlatformContent
      ? String(contentByPlatform[platform] ?? '')
      : ((data?.platform ?? platform) === platform ? fallbackContent : '');
  
  // Remove asterisks from content
  const content = React.useMemo(() => {
    let processed = rawContent;
    processed = processed.replace(/\*\*/g, '');
    processed = processed.replace(/\*/g, '');
    return processed;
  }, [rawContent]);

  useEffect(() => {
    if (data?.platform && data.platform !== platform) {
      setPlatform(data.platform);
    }
  }, [data?.platform, platform]);

  // Reset selected sentence when active platform content changes
  useEffect(() => {
    setRefinedSentenceIndex(null);
    if (!isRefineMode) {
      setRefineDraftContent(content);
      setRefineSentenceChanges({});
    }
  }, [content, isRefineMode]);

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
    const textToCopy = isGenerating && streamedOutput ? streamedOutput : isRefineMode ? refineDraftContent : content;
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
    const generationSourceContent = isRefineMode ? refineDraftContent : content;
    const sentences = splitIntoSentences(generationSourceContent);
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
        { outputNodeId: id, keptSentences: keptSentence || undefined, generationMode }
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

  // Show suggestions menu anchored beside the social node
  const openSentenceSuggestions = (index: number) => {
    const nodeRect = nodeContainerRef.current?.getBoundingClientRect();
    if (nodeRect) {
      const menuWidth = 320;
      const gap = 12;
      const canPlaceRight = nodeRect.right + gap + menuWidth <= window.innerWidth - 8;
      setMenuSide(canPlaceRight ? 'right' : 'left');
    }
    setSelectedSentenceIndex(index);
    setGeneratedSuggestions([]);
    setSuggestionsError(null);
    setPreviewSuggestion(null);
    setShowSuggestionsMenu(true);
  };

  const handleSentenceClick = (index: number) => {
    setRefinedSentenceIndex(index);
    openSentenceSuggestions(index);
  };

  const applySentenceSuggestion = (suggestion: string) => {
    if (selectedSentenceIndex === null) return;
    const sentences = splitIntoSentences(refineDraftContent);
    if (selectedSentenceIndex >= sentences.length) return;

    const normalizedSuggestion = splitIntoSentences(suggestion.trim())[0] ?? suggestion.trim();
    sentences[selectedSentenceIndex] = normalizedSuggestion;
    const newContent = sentences.join(' ');
    setRefineDraftContent(newContent);
    setRefineSentenceChanges((current) => ({ ...current, [selectedSentenceIndex]: 'suggestion' }));
    setRefinedSentenceIndex(selectedSentenceIndex);
    setHoveredSentence(null);
    setPreviewSuggestion(null);
    setShowCustomEntryModal(false);
    setCustomSentenceInput('');
    setCustomSentenceError(null);
  };

  const generateSentenceSuggestions = async () => {
    if (selectedSentenceIndex === null || isGeneratingSuggestions) return;

    const sentences = splitIntoSentences(refineDraftContent);
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
          generationMode,
          sentence: selectedSentence,
          fullPostText: refineDraftContent,
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
    const sentences = splitIntoSentences(refineDraftContent);
    if (selectedSentenceIndex < 0 || selectedSentenceIndex >= sentences.length) return;

    const customText = customSentenceInput.trim();
    if (!customText) {
      setCustomSentenceError('Please enter a replacement sentence.');
      return;
    }

    const normalizedCustomText = splitIntoSentences(customText)[0] ?? customText;
    sentences[selectedSentenceIndex] = normalizedCustomText;
    const newContent = sentences.join(' ');
    setRefineDraftContent(newContent);
    setRefineSentenceChanges((current) => ({ ...current, [selectedSentenceIndex]: 'custom' }));
    setRefinedSentenceIndex(selectedSentenceIndex);
    setHoveredSentence(null);
    setPreviewSuggestion(null);
    setShowCustomEntryModal(false);
    setCustomSentenceInput('');
    setCustomSentenceError(null);
  };

  const applyDeleteSentence = () => {
    if (selectedSentenceIndex === null) return;
    const sentences = splitIntoSentences(refineDraftContent);
    if (selectedSentenceIndex < 0 || selectedSentenceIndex >= sentences.length) return;

    setRefineSentenceChanges((current) => {
      if (current[selectedSentenceIndex] === 'deleted') {
        const next = { ...current };
        delete next[selectedSentenceIndex];
        return next;
      }
      return { ...current, [selectedSentenceIndex]: 'deleted' };
    });
    setRefinedSentenceIndex(selectedSentenceIndex);
    setHoveredSentence(null);
    setPreviewSuggestion(null);
    setShowCustomEntryModal(false);
    setCustomSentenceInput('');
    setCustomSentenceError(null);
  };

  const restoreOriginalSentence = () => {
    if (selectedSentenceIndex === null) return;
    const draftSentences = splitIntoSentences(refineDraftContent);
    const originalSentences = splitIntoSentences(content);
    if (
      selectedSentenceIndex < 0 ||
      selectedSentenceIndex >= draftSentences.length ||
      selectedSentenceIndex >= originalSentences.length
    ) {
      return;
    }

    draftSentences[selectedSentenceIndex] = originalSentences[selectedSentenceIndex];
    setRefineDraftContent(draftSentences.join(' '));
    setRefineSentenceChanges((current) => {
      const next = { ...current };
      delete next[selectedSentenceIndex];
      return next;
    });
    setRefinedSentenceIndex(selectedSentenceIndex);
    setHoveredSentence(null);
    setPreviewSuggestion(null);
    setShowCustomEntryModal(false);
    setCustomSentenceInput('');
    setCustomSentenceError(null);
  };

  const selectedCount = refinedSentenceIndex === null ? 0 : 1;
  const refineWorkingContent = isRefineMode ? refineDraftContent : content;
  const hasDeletedSentences = Object.values(refineSentenceChanges).some((kind) => kind === 'deleted');
  const hasPendingRefineChanges = refineDraftContent.trim() !== content.trim() || hasDeletedSentences;
  const selectedSentenceIsDeleted =
    selectedSentenceIndex !== null && refineSentenceChanges[selectedSentenceIndex] === 'deleted';
  const totalSentences = splitIntoSentences(refineWorkingContent).length;
  const selectedSentenceText = useMemo(() => {
    if (selectedSentenceIndex === null) return '';
    const sentences = splitIntoSentences(refineWorkingContent);
    if (selectedSentenceIndex < 0 || selectedSentenceIndex >= sentences.length) return '';
    return sentences[selectedSentenceIndex];
  }, [refineWorkingContent, selectedSentenceIndex]);
  const originalSelectedSentenceText = useMemo(() => {
    if (selectedSentenceIndex === null) return '';
    const originalSentences = splitIntoSentences(content);
    if (selectedSentenceIndex < 0 || selectedSentenceIndex >= originalSentences.length) return '';
    return originalSentences[selectedSentenceIndex];
  }, [content, selectedSentenceIndex]);
  const baseDisplayContent = isGenerating && streamedOutput ? streamedOutput : refineWorkingContent;
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

    const sentences = splitIntoSentences(refineWorkingContent);
    if (selectedSentenceIndex < 0 || selectedSentenceIndex >= sentences.length) {
      return baseDisplayContent;
    }
    sentences[selectedSentenceIndex] = previewSuggestion;
    return sentences.join(' ');
  }, [
    baseDisplayContent,
    refineWorkingContent,
    isGenerating,
    isRefineMode,
    previewSuggestion,
    selectedSentenceIndex,
    showSuggestionsMenu,
  ]);

  const enterRefineMode = () => {
    setRefineDraftContent(content);
    setRefineSentenceChanges({});
    setRefinedSentenceIndex(null);
    setHoveredSentence(null);
    closeSentenceAssistant();
    setIsRefineMode(true);
  };

  const exitRefineModeWithoutSaving = () => {
    setIsRefineMode(false);
    setRefineDraftContent(content);
    setRefineSentenceChanges({});
    setRefinedSentenceIndex(null);
    setHoveredSentence(null);
    closeSentenceAssistant();
  };

  const handleRefineDone = () => {
    const draftSentences = splitIntoSentences(refineDraftContent);
    const persistedSentences = draftSentences.filter((_, index) => refineSentenceChanges[index] !== 'deleted');
    const persistedContent = persistedSentences.join(' ');
    const trimmedDraft = persistedContent.trim();
    const trimmedContent = content.trim();
    if (trimmedDraft !== trimmedContent) {
      mindmap.updateNodeData(id, {
        content: persistedContent,
        platform,
        contentByPlatform: {
          ...contentByPlatform,
          [platform]: persistedContent,
        },
      });
    }
    setIsRefineMode(false);
    setRefineSentenceChanges({});
    setRefinedSentenceIndex(null);
    setHoveredSentence(null);
    closeSentenceAssistant();
  };

  const handlePlatformSwitch = (nextPlatform: Platform) => {
    if (nextPlatform === platform) return;

    const currentByPlatform = (data?.contentByPlatform ?? {}) as Partial<Record<Platform, string>>;
    const outgoingContent = content;
    const incomingContent = currentByPlatform[nextPlatform] ?? '';

    setPlatform(nextPlatform);
    mindmap.updateNodeData(id, {
      platform: nextPlatform,
      content: incomingContent,
      contentByPlatform: {
        ...currentByPlatform,
        [platform]: outgoingContent,
      },
    });
  };

  return (
    <div
      ref={nodeContainerRef}
      className={[
        'relative w-[380px] overflow-visible rounded-3xl border p-4 shadow-[0_18px_42px_-26px_rgba(15,23,42,0.45)] backdrop-blur-sm transition-all duration-200',
        isGenerating ? 'select-none' : '',
        isFocused
          ? isColdLead
            ? 'border-indigo-400/60 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 ring-2 ring-indigo-300/30'
            : 'border-primary/50 bg-gradient-to-br from-blue-50 via-white to-cyan-50 ring-2 ring-primary/20'
          : 'border-stroke/70 bg-gradient-to-br from-white via-white to-slate-50',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
    >
      {isGenerating ? (
        <div
          className="absolute inset-0 z-40 rounded-3xl bg-white/45 backdrop-blur-[2px] cursor-wait"
          onMouseDown={(e) => e.stopPropagation()}
          aria-hidden
        />
      ) : null}
      <Tooltip
        id={`social-copy-tooltip-${id}`}
        place="bottom"
        className={tooltipClassName}
        opacity={1}
        delayShow={80}
      />
      <Handle type="target" position={Position.Left} className={`!h-2.5 !w-2.5 ${isColdLead ? '!bg-indigo-500' : '!bg-primary'}`} />
      <ConnectionHandleWarning message={connectionWarning} side={connectionWarningSide} />

      <div className="mb-3 flex items-start justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-3 py-2 shadow-sm">
        <div>
          <div className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${headerTagClass}`}>{titleLabel}</div>
          <div className="mt-0.5 text-sm font-semibold text-dark">{platformLabel(platform)}</div>
        </div>
        <button
          type="button"
          className="nodrag rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] text-red-700 transition-colors hover:bg-red-100"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>

      <ConfimationModel
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${titleLabel}`}
        itemName={data?.label || titleLabel}
        phraseEnforce={false}
      />
      <ConfimationModel
        isOpen={isCancelRefineModalOpen}
        onClose={() => setIsCancelRefineModalOpen(false)}
        onConfirm={() => {
          exitRefineModeWithoutSaving();
          setIsCancelRefineModalOpen(false);
        }}
        title="Discard Refine Changes"
        itemName="Unsaved refine edits"
        phraseEnforce={false}
      />
      <ConfimationModel
        isOpen={isDoneRefineModalOpen}
        onClose={() => setIsDoneRefineModalOpen(false)}
        onConfirm={() => {
          handleRefineDone();
          setIsDoneRefineModalOpen(false);
        }}
        title="Apply Refine Changes"
        itemName="Refined content updates"
        phraseEnforce={false}
        variant="confirm"
        confirmLabel="Apply"
        confirmLoadingLabel="Applying..."
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

      <div className="mb-3 flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-sm">
        {(['LINKEDIN', 'FACEBOOK', 'INSTAGRAM'] as Platform[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handlePlatformSwitch(item)}
            className={[
              'nodrag flex-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all',
              platform === item
                ? activeTabClass
                : 'text-body-color hover:bg-slate-50 hover:text-dark',
            ].join(' ')}
          >
            {platformLabel(item)}
          </button>
        ))}
      </div>

      <div className="mb-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-body-color">Messaging Length</div>
          <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-dark">
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
          className={`nodrag h-2 w-full appearance-none rounded-lg bg-slate-200 outline-none focus:outline-none disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full ${isColdLead ? '[&::-webkit-slider-thumb]:bg-indigo-600' : '[&::-webkit-slider-thumb]:bg-primary'} [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95`}
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
                'rounded-lg py-1.5 text-[10px] font-semibold transition-all',
                index === safeLengthIndex
                  ? activeTabClass
                  : 'bg-slate-50 text-body-color hover:bg-slate-100',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          className={generateButtonClass}
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
        {!isGenerating && (
          <button
            type="button"
            disabled={!content}
            onClick={() => {
              if (!content) return;
              if (isRefineMode) {
                exitRefineModeWithoutSaving();
                return;
              }
              enterRefineMode();
            }}
            className={`nodrag flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
              !content
                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                : isRefineMode 
                ? 'border-amber-300 bg-amber-50 text-amber-700 shadow-sm' 
                : 'border-slate-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50'
            }`}
            title={!content ? 'Generate content first to refine.' : 'Refine content'}
          >
            <FontAwesomeIcon 
              icon={faHighlighter} 
              className={isRefineMode ? 'text-yellow-500' : ''} 
            />
            <span className="hidden sm:inline">Refine</span>
          </button>
        )}
      </div>

      {/* Refine Mode Workspace */}
      {isRefineMode && content && (
        <div className="refine-shell mb-3 overflow-hidden rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-50 via-yellow-50 to-white p-3">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-800">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                Live Refine
              </div>
              <div className="mt-1 text-sm font-semibold text-amber-900">
                <FontAwesomeIcon icon={faHighlighter} className="mr-1.5 text-amber-600" />
                Refine Workspace
              </div>
              <p className="mt-1 text-[11px] text-amber-800/80">
                Click one sentence, test edits, then press <span className="font-semibold">Done</span> to save.
              </p>
            </div>
          </div>

          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                selectedCount > 0 ? 'w-full bg-amber-500' : 'w-0 bg-amber-500'
              }`}
            />
          </div>

          <div className="flex gap-2 text-[10px]">
            {hasPendingRefineChanges ? (
              <button
                type="button"
                onClick={() => setIsCancelRefineModalOpen(true)}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-red-500 px-3 py-1.5 font-semibold text-white ring-1 ring-red-300 ring-offset-2 ring-offset-red-100 transition-all duration-300 ease-out hover:bg-red-600 hover:ring-offset-red-300 focus:outline-none"
              >
                <span className="absolute bottom-0 right-0 h-20 w-8 -mb-8 -mr-5 rotate-45 translate-x-1 bg-white opacity-10 transition-all duration-300 ease-out group-hover:translate-x-0" />
                <span className="absolute left-0 top-0 h-8 w-20 -ml-12 -mt-1 -translate-x-1 -rotate-45 bg-white opacity-10 transition-all duration-300 ease-out group-hover:translate-x-0" />
                <span className="relative z-20">Cancel</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={exitRefineModeWithoutSaving}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 ring-1 ring-slate-300 ring-offset-2 ring-offset-slate-100 transition-all duration-300 ease-out hover:bg-slate-200 hover:ring-offset-slate-200 focus:outline-none"
              >
                <span className="absolute bottom-0 right-0 h-20 w-8 -mb-8 -mr-5 rotate-45 translate-x-1 bg-white opacity-10 transition-all duration-300 ease-out group-hover:translate-x-0" />
                <span className="absolute left-0 top-0 h-8 w-20 -ml-12 -mt-1 -translate-x-1 -rotate-45 bg-white opacity-10 transition-all duration-300 ease-out group-hover:translate-x-0" />
                <span className="relative z-20">Back</span>
              </button>
            )}
           <button
              type="button"
              onClick={() => setIsDoneRefineModalOpen(true)}
              disabled={!hasPendingRefineChanges}
              className={`group relative ml-auto inline-flex items-center justify-center overflow-hidden rounded-md px-3 py-1.5 font-semibold text-white ring-1 ring-offset-2 transition-all duration-300 ease-out focus:outline-none ${
                hasPendingRefineChanges
                  ? 'bg-green-600 ring-green-300 ring-offset-green-200 hover:bg-green-600 hover:ring-offset-green-400 active:bg-green-700'
                  : 'cursor-not-allowed bg-slate-300 text-slate-100 ring-slate-300 ring-offset-slate-200'
              }`}
            >
              <span className="absolute bottom-0 right-0 h-20 w-8 -mb-8 -mr-5 rotate-45 translate-x-1 bg-white opacity-10 transition-all duration-300 ease-out group-hover:translate-x-0" />
              <span className="absolute left-0 top-0 h-8 w-20 -ml-12 -mt-1 -translate-x-1 -rotate-45 bg-white opacity-10 transition-all duration-300 ease-out group-hover:translate-x-0" />
              <span className="relative z-20">Accept</span>
            </button>
          </div>

          <div
            className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-[11px] ${
              hasPendingRefineChanges
                ? 'border-red-300/80 bg-red-50 text-red-900'
                : 'border-amber-300/70 bg-amber-50 text-amber-900'
            }`}
          >
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className={`mt-0.5 ${hasPendingRefineChanges ? 'text-red-600' : 'text-amber-600'}`}
            />
            <p>
              Refine changes are only saved when you click <span className="font-semibold">Done</span>.
              {hasPendingRefineChanges ? ' You have unsaved refine edits to apply.' : ''}
            </p>
          </div>
        </div>
      )}

      <div
        className={`min-h-[190px] rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-sm ${
          isGenerating ? 'relative z-50 pointer-events-none' : ''
        }`}
      >
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
          <p className="text-xs text-body-color">
            No {platformLabel(platform)} draft yet. Click <span className="font-semibold">Generate {platformLabel(platform)}</span> to create one.
          </p>
        ) : null}
        <div className="group relative">
          {!isRefineMode && (
            <button
              type="button"
              className="nodrag absolute right-1 top-1 z-10 rounded-lg bg-gradient-to-r from-primary to-blue-600 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-all duration-150 hover:from-blue-600 hover:to-blue-dark group-hover:translate-y-0 group-hover:opacity-100"
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
                onSentenceClick={handleSentenceClick}
                hoveredSentence={hoveredSentence}
                setHoveredSentence={setHoveredSentence}
                activeSentenceIndex={selectedSentenceIndex}
                sentenceChangeMap={refineSentenceChanges}
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
                className={`absolute z-50 mt-1 w-80 rounded-2xl border border-stroke/80 bg-white/95 p-3 shadow-2 backdrop-blur ${
                  menuSide === 'right' ? 'left-[calc(100%+12px)] top-0' : 'right-[calc(100%+12px)] top-0'
                }`}
              >
                <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/60 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
                        Sentence Assistant
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-blue-900/80">
                        Generate alternatives, hover to preview inline, then apply the one you want.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeSentenceAssistant}
                      className="rounded-md border border-blue-200 bg-white px-2 py-1 text-[11px] text-blue-700 hover:bg-blue-50"
                      aria-label="Close sentence assistant"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                </div>
                {selectedSentenceText ? (
                  <div className="mb-3 rounded-xl border border-yellow-200 bg-yellow-50/70 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-yellow-800">
                      Refining This Sentence
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-yellow-900">
                      "{selectedSentenceText}"
                    </p>
                  </div>
                ) : null}
                {showCustomEntryModal && (
                  <div className="mt-2 mb-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
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
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void generateSentenceSuggestions()}
                    disabled={isGeneratingSuggestions}
                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGeneratingSuggestions ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Generating...
                      </span>
                    ) : (
                      'Generate Suggestions'
                    )}
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
                  <button
                    type="button"
                    onClick={applyDeleteSentence}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 ${
                      selectedSentenceIsDeleted
                        ? 'border-red-300 bg-red-200'
                        : 'border-red-50 bg-red-50'
                    }`}
                  >
                    {selectedSentenceIsDeleted ? 'Restore' : 'Delete'}
                  </button>
                </div>

                {suggestionsError ? (
                  <div className="mb-2 rounded-md bg-red-50 px-2 py-1.5 text-[11px] text-red-600">{suggestionsError}</div>
                ) : null}

                {generatedSuggestions.length > 0 ? (
                  <div className="mb-2 space-y-2">
                    <div
                      className="suggestion-card group rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                      style={{ animationDelay: '0ms' }}
                    >
                      <div className="p-2.5">
                        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                          Original Sentence
                        </div>
                        <p className="rounded-md border border-amber-100 bg-white/80 px-2 py-1.5 text-[11px] leading-relaxed text-slate-800">
                          "{originalSelectedSentenceText || 'No original sentence available.'}"
                        </p>
                      </div>
                      <div className="flex items-center justify-end border-t border-amber-100 px-2.5 py-2">
                        <button
                          type="button"
                          onClick={restoreOriginalSentence}
                          className="rounded-md bg-white px-2.5 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-300 transition-all duration-200 hover:scale-[1.03] hover:bg-amber-500 hover:text-white"
                        >
                          Use Original
                        </button>
                      </div>
                    </div>
                    {generatedSuggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion}-${index}`}
                        className="suggestion-card group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                        style={{ animationDelay: `${(index + 1) * 70}ms` }}
                        onMouseEnter={() => setPreviewSuggestion(suggestion)}
                        onMouseLeave={() => setPreviewSuggestion(null)}
                      >
                        <div className="flex items-start gap-2 p-2.5">
                          <p className="flex-1 text-[11px] leading-relaxed text-slate-800">{suggestion}</p>
                        </div>
                        <div className="flex items-center justify-end border-t border-slate-100 px-2.5 py-2">
                          <button
                            type="button"
                            onClick={() => applySentenceSuggestion(suggestion)}
                            className="rounded-md bg-white px-2.5 py-1 text-[10px] font-semibold text-primary ring-1 ring-primary/25 transition-all duration-200 group-hover:ring-primary/40 hover:scale-[1.03] hover:bg-primary hover:text-white"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-2 rounded-md bg-blue-50 px-2 py-1.5 text-[11px] text-blue-700">
                    Generate suggestions, then press <span className="font-semibold">Use this</span> to drop one in.
                  </div>
                )}
              </div>
              <style jsx>{`
                .refine-shell {
                  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
                  animation: refinePanelIn 260ms cubic-bezier(0.22, 1, 0.36, 1);
                }

                .refine-dot {
                  animation: refinePulse 1.6s ease-in-out infinite;
                }

                .suggestion-card {
                  opacity: 0;
                  transform: translateY(8px) scale(0.98);
                  animation: suggestionReveal 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                @keyframes refinePanelIn {
                  from {
                    opacity: 0;
                    transform: translateY(6px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                @keyframes refinePulse {
                  0%,
                  100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                  50% {
                    opacity: 0.55;
                    transform: scale(0.85);
                  }
                }

                @keyframes suggestionReveal {
                  to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
              `}</style>
            </>
          )}
        </div>
      </div>
    </div>
  );
}



