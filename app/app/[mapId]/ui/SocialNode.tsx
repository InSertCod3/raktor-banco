'use client';

import React, { useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMindMap, type Platform } from './MindMapContext';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';

type SocialNodeData = {
  label?: string;
  type: 'social';
  platform?: Platform;
  content?: string;
};

type SocialNodeType = Node<SocialNodeData, 'social'>;

function platformLabel(platform: Platform) {
  if (platform === 'LINKEDIN') return 'LinkedIn';
  if (platform === 'FACEBOOK') return 'Facebook';
  return 'Instagram';
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

  const isFocused = selected || mindmap.selectedNodeId === id;
  const content = String(data?.content ?? '');

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
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className={[
        'w-[360px] rounded-2xl border p-4 shadow-1',
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
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">Social Output</div>
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
        title="Delete Social Node"
        itemName={data?.label || 'Social Node'}
        phraseEnforce={false}
      />

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

      <button
        type="button"
        className="nodrag mb-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-dark disabled:opacity-60"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? `Generating ${platformLabel(platform)}...` : `Generate ${platformLabel(platform)}`}
      </button>

      <div className="min-h-[170px] rounded-xl border border-stroke bg-white p-3">
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {!error && !content && !streamedOutput ? (
          <p className="text-xs text-body-color">Generate a post from connected idea context.</p>
        ) : null}
        <p
          className="whitespace-pre-wrap text-sm leading-relaxed text-dark cursor-copy"
          data-tooltip-id={`social-copy-tooltip-${id}`}
          data-tooltip-content="click to copy"
          onClick={async () => {
            const textToCopy = isGenerating && streamedOutput ? streamedOutput : content;
            if (!textToCopy) return;
            await navigator.clipboard.writeText(textToCopy);
            toast.success('copied to clipboard', {
              id: `copy-social-${id}`,
              position: 'top-right',
            });
          }}
        >
          {isGenerating && streamedOutput ? streamedOutput : content}
        </p>
      </div>
    </div>
  );
}
