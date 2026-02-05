'use client';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMindMap, type Generation, type Platform } from './MindMapContext';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


export type IdeaNodeType = Node<{ text?: string }, 'idea'>;

function platformLabel(p: Platform) {
  return p === 'LINKEDIN' ? 'LinkedIn' : 'Facebook';
}

export default function IdeaNode({ id, data, selected }: NodeProps<IdeaNodeType>) {
  const mindmap = useMindMap();

  const [showOutput, setShowOutput] = React.useState(false);
  const [platform, setPlatform] = React.useState<Platform>('LINKEDIN');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<Generation[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isFocused = selected || mindmap.selectedNodeId === id;

  async function refresh() {
    setError(null);
    try {
      const list = await mindmap.listGenerations(id, platform);
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load generations.');
    }
  }

  async function doGenerate() {
    setError(null);
    setLoading(true);
    try {
      const gen = await mindmap.generate(id, platform);
      setItems((prev) => [gen, ...prev]);
      setShowOutput(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = () => {
    mindmap.deleteNode(id);
    setIsDeleteModalOpen(false);
  };

  React.useEffect(() => {
    if (!showOutput) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOutput, platform]);

  return (
    <div
      className={[
        'min-w-[220px] max-w-[320px] rounded-xl border bg-white p-3 shadow-1',
        isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-stroke',
      ].join(' ')}
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-primary" />
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-primary" />

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-dark">Idea</div>
        <button
          type="button"
          className="nodrag bg-red-500 rounded-md bg-red-5 px-2 py-1 text-[11px] text-white hover:bg-red-6"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Idea"
        itemName={data?.text || 'Untitled Idea'}
        phraseEnforce={false}
      />

      <textarea
        value={String(data?.text ?? '')}
        onChange={(e) => mindmap.updateNodeText(id, e.target.value)}
        onFocus={() => mindmap.setSelectedNodeId(id)}
        rows={3}
        placeholder="Write the idea…"
        className="nodrag mt-2 w-full rounded-lg border border-stroke bg-transparent p-2 text-sm text-dark outline-hidden focus:border-primary"
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="nodrag rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-dark"
          onClick={() => mindmap.addChildNode(id)}
        >
          + Child
        </button>

        <div className="nodrag ml-auto flex items-center gap-1 rounded-md bg-gray-1 p-1">
          {(['LINKEDIN', 'FACEBOOK'] as Platform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={[
                'rounded px-2 py-1 text-[11px]',
                platform === p ? 'bg-white text-dark shadow-1' : 'text-body-color hover:text-dark',
              ].join(' ')}
            >
              {platformLabel(p)}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={loading}
          className="nodrag w-full rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-dark disabled:opacity-60"
          onClick={doGenerate}
        >
          {loading ? 'Generating…' : items.length ? `Regenerate (${platformLabel(platform)})` : `Generate (${platformLabel(platform)})`}
        </button>
      </div>

      <div className="mt-2">
        <button
          type="button"
          className="nodrag text-xs font-medium text-primary hover:underline"
          onClick={() => setShowOutput((v) => !v)}
        >
          {showOutput ? 'Hide output' : 'Show output'}
        </button>
      </div>

      {showOutput ? (
        <div className="mt-2 rounded-lg border border-stroke bg-gray-1 p-2">
          {error ? <div className="text-xs text-dark">{error}</div> : null}
          {!error && !items.length ? (
            <div className="text-xs text-body-color">No generations yet for this node.</div>
          ) : null}

          {items[0] ? (
            <>
              <div className="whitespace-pre-wrap text-xs text-dark">{items[0].output}</div>
              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-body-color">
                <span>
                  Rev {items[0].revision} • {items[0].model}
                </span>
                <button
                  type="button"
                  className="nodrag rounded bg-white px-2 py-1 text-[11px] text-dark shadow-1 hover:bg-gray-2"
                  onClick={async () => {
                    await navigator.clipboard.writeText(items[0].output);
                    toast.success('Copied to clipboard', {
                      id: 'copy-toast',
                      position: 'top-right',
                    });
                  }}
                >
                  Copy
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}


