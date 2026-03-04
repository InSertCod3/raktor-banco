'use client';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useMindMap } from './MindMapContext';
import ConfimationModel from '@/app/components/ConfimationModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faPaperclip, faTrash, faUpload, faWandMagicSparkles, faLinkSlash, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import ConnectionHandleWarning from './ConnectionHandleWarning';
import { LineWave } from 'react-loader-spinner';
import { formatBytes } from '@/app/lib/filePolicy';

type AttachedFile = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  description?: string | null;
  createdAt: string;
  downloadUrl: string;
};

type FileConfig = {
  tier: string;
  dataNodeFileUploadEnabled: boolean;
  maxStorageBytes: number;
  usedBytes: number;
  remainingBytes: number;
  allowedExtensions: string[];
};

type FileListResponse = {
  items: AttachedFile[];
};

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
  attachedFiles?: AttachedFile[];
}, 'datanode'>;

export default function DataNode({ id, data, selected }: NodeProps<DataNodeType>) {
  const mindmap = useMindMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isDataTypeMenuOpen, setIsDataTypeMenuOpen] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(120);
  const [isUploading, setIsUploading] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isAnalyzingById, setIsAnalyzingById] = useState<Record<string, boolean>>({});
  const [attachError, setAttachError] = useState<string | null>(null);
  const [fileConfig, setFileConfig] = useState<FileConfig | null>(null);
  const [fileLibrary, setFileLibrary] = useState<AttachedFile[]>([]);
  const [fileLibraryLoaded, setFileLibraryLoaded] = useState(false);
  const [deletedFileIds, setDeletedFileIds] = useState<Record<string, boolean>>({});
  const [selectedLibraryFileId, setSelectedLibraryFileId] = useState('');
  const [isFileLibraryMenuOpen, setIsFileLibraryMenuOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [analysisModal, setAnalysisModal] = useState<{ open: boolean; fileName: string; content: string }>({
    open: false,
    fileName: '',
    content: '',
  });
  const dataTypeMenuRef = useRef<HTMLDivElement | null>(null);
  const fileLibraryMenuRef = useRef<HTMLDivElement | null>(null);
  const fileLibraryDropdownRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
  const question = isSingleQuestion ? questions[0] : (questions.length > 0 ? questions[0] : '');
  const hasAnswerContent = answer.trim().length > 0;

  const attachableFiles = useMemo(
    () => fileLibrary.filter((file) => !attachedFiles.some((attached) => attached.id === file.id)),
    [attachedFiles, fileLibrary],
  );
  const availableFileIdSet = useMemo(() => new Set(fileLibrary.map((file) => file.id)), [fileLibrary]);
  const missingAttachedFileIds = useMemo(() => {
    if (!fileLibraryLoaded) return new Set<string>();
    return new Set(
      attachedFiles
        .map((file) => file.id)
        .filter((fileId) => !availableFileIdSet.has(fileId)),
    );
  }, [attachedFiles, availableFileIdSet, fileLibraryLoaded]);
  const hasMissingFiles = missingAttachedFileIds.size > 0;
  const primaryAttachedFile = attachedFiles[0] ?? null;
  const nodeMode = (data?.dataType === 'document' ? 'document' : 'text') as 'text' | 'document';
  const isAnyAnalyzing = Object.values(isAnalyzingById).some(Boolean);
  const hasAttachedFile = attachedFiles.length > 0;
  const showDataWarning =
    !isLoading &&
    ((nodeMode === 'document' && !hasAttachedFile) || (nodeMode === 'text' && !hasAnswerContent));
  const isNodeLocked = isAnyAnalyzing;

  useEffect(() => {
    if (!textareaRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = Math.round(entry.contentRect.height);
        setTextareaHeight((prev) => (Math.abs(prev - newHeight) > 10 ? newHeight : prev));
      }
    });
    observer.observe(textareaRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (data?.answers && data.answers.length > 0) {
      setAnswer(data.answers[0] || '');
    }
  }, [data?.answers]);

  useEffect(() => {
    setAttachedFiles((data?.attachedFiles ?? []) as AttachedFile[]);
  }, [data?.attachedFiles]);

  useEffect(() => {
    const fetchConfig = async () => {
      const [configRes, filesRes] = await Promise.all([
        fetch('/api/files/config', { cache: 'no-store' }),
        fetch('/api/files?limit=100', { cache: 'no-store' }),
      ]);

      if (configRes.ok) {
        const config = (await configRes.json()) as FileConfig;
        setFileConfig(config);
      }
      if (filesRes.ok) {
        const payload = (await filesRes.json()) as FileListResponse;
        setFileLibrary(payload.items ?? []);
      }
      setFileLibraryLoaded(true);
    };

    void fetchConfig();
  }, []);

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

  useEffect(() => {
    if (!isFileLibraryMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!fileLibraryMenuRef.current) return;
      if (fileLibraryMenuRef.current.contains(event.target as globalThis.Node)) return;
      setIsFileLibraryMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isFileLibraryMenuOpen]);

  const syncAttachedFiles = (next: AttachedFile[]) => {
    setAttachedFiles(next);
    mindmap.updateNodeData(id, { attachedFiles: next });
  };

  const analyzeAttachedFile = async (fileId: string) => {
    setAttachError(null);
    setIsAnalyzingById((current) => ({ ...current, [fileId]: true }));
    try {
      const res = await fetch('/api/files/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileId, nodeId: id }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { fileId?: string; description?: string; error?: string }
        | null;
      if (!res.ok || !payload?.fileId || !payload.description) {
        if (res.status === 404) {
          setDeletedFileIds((current) => ({ ...current, [fileId]: true }));
        }
        throw new Error(payload?.error ?? 'Failed to analyze file.');
      }

      const nextFiles = attachedFiles.map((file) =>
        file.id === payload.fileId ? { ...file, description: payload.description } : file,
      );
      syncAttachedFiles(nextFiles);
    } catch (error) {
      setAttachError(error instanceof Error ? error.message : 'Failed to analyze file.');
    } finally {
      setIsAnalyzingById((current) => ({ ...current, [fileId]: false }));
    }
  };

  const handleDelete = () => {
    mindmap.deleteNode(id);
    setIsDeleteModalOpen(false);
  };

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    mindmap.updateNodeData(id, { answers: [value] });
  };

  const handleUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAttachError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('nodeId', id);

      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      const payload = (await res.json().catch(() => null)) as
        | {
            item?: AttachedFile;
            attachment?: AttachedFile;
            error?: string;
            storage?: { usedBytes: number };
            upgradeUrl?: string;
          }
        | null;
      if (!res.ok || !payload?.item) {
        const message = payload?.upgradeUrl
          ? `${payload.error ?? 'Upload failed.'} Upgrade in pricing.`
          : payload?.error ?? 'Upload failed.';
        throw new Error(message);
      }

      const attached = payload.attachment ?? payload.item;
      const next = [attached, ...attachedFiles];
      syncAttachedFiles(next);
      setFileLibrary((current) => [payload.item!, ...current.filter((item) => item.id !== payload.item!.id)]);
      if (fileConfig && payload.storage) {
        setFileConfig({ ...fileConfig, usedBytes: payload.storage.usedBytes });
      }
    } catch (error) {
      setAttachError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleAttachExisting = async () => {
    if (!selectedLibraryFileId) return;
    setAttachError(null);
    setIsAttaching(true);
    try {
      const res = await fetch('/api/files/links', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nodeId: id, fileId: selectedLibraryFileId }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { item?: AttachedFile; error?: string }
        | null;
      if (!res.ok || !payload?.item) {
        throw new Error(payload?.error ?? 'Could not attach file.');
      }
      syncAttachedFiles([payload.item, ...attachedFiles]);
      setSelectedLibraryFileId('');
      setIsFileLibraryMenuOpen(false);
    } catch (error) {
      setAttachError(error instanceof Error ? error.message : 'Could not attach file.');
    } finally {
      setIsAttaching(false);
    }
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
      className="relative w-[432px] overflow-visible rounded-2xl border border-cyan-300 bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
      onMouseDown={() => mindmap.setSelectedNodeId(id)}
      style={{
        boxShadow: isFocused
          ? '0 0 30px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.1)'
          : '0 0 20px rgba(6,182,212,0.15)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-50"
        style={{
          background: `linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(34,211,238,0.05) 50%, rgba(6,182,212,0.1) 100%)`,
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
      />

      <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !bg-cyan-500" />
      <ConnectionHandleWarning message={connectionWarning} side={connectionWarningSide} />
      {showDataWarning ? (
        <div className="group absolute -top-3 -right-3 z-20">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-amber-700 shadow-sm">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-[12px]" />
          </div>
          <div className="pointer-events-none absolute right-0 top-[calc(100%+8px)] hidden w-64 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900 shadow-lg group-hover:block">
            {nodeMode === 'document'
              ? 'No file is attached yet. Upload or attach one file to this Data Node so outputs can use it.'
              : 'No answer added yet. Add information to this Data Node so outputs have context.'}
          </div>
        </div>
      ) : null}
      {isNodeLocked ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl border border-cyan-300/80 bg-cyan-50/70 backdrop-blur-[1px]">
          <div className="data-node-lock inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan-800 shadow-sm">
            <span className="data-node-lock-orb h-2 w-2 rounded-full bg-cyan-500" />
            Analyzing file...
          </div>
        </div>
      ) : null}

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
              <LineWave visible height="16" width="20" color="#06b6d4" ariaLabel="data-loading" />
            </div>
          ) : null}
          <button
            type="button"
            disabled={isNodeLocked}
            className="nodrag rounded-md bg-red-500 px-2 py-1 text-[11px] text-white hover:bg-red-6 disabled:cursor-not-allowed disabled:opacity-50"
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

      <div
        className="relative z-10 space-y-3 pr-1 nowheel"
        onWheel={(e) => {
          if (isFileLibraryMenuOpen && fileLibraryDropdownRef.current) {
            const target = e.target as globalThis.Node;
            if (!fileLibraryDropdownRef.current.contains(target)) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
          }
          e.stopPropagation();
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <LineWave visible height="40" width="50" color="#06b6d4" ariaLabel="generating-questions" />
              <p className="mt-2 text-xs text-cyan-700">Generating...</p>
            </div>
          </div>
        ) : hasGeneratedQuestions && question ? (
          <div className="space-y-2">
            {isCustom && (
              <div ref={dataTypeMenuRef} className="rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm font-medium text-dark shadow-sm">
                <span className="text-xs text-cyan-700">
                  Node mode: {nodeMode === 'document' ? 'File Upload' : 'Custom Text'}
                </span>
              </div>
            )}
            {nodeMode === 'text' ? (
              <>
                <p className="text-xs font-semibold text-cyan-900">{question}</p>
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  readOnly={isNodeLocked}
                  placeholder={getAnswerPlaceholder()}
                  rows={5}
                  style={{ height: textareaHeight, minHeight: '220px' }}
                  className="nodrag w-full resize-y rounded-lg border border-cyan-200 bg-white p-3 text-sm text-dark placeholder:text-body-color focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                />
              </>
            ) : (
              <div className="rounded-lg border border-cyan-200 bg-cyan-50/60 p-3 text-xs text-cyan-700">
                This node is file-upload only. Create a separate custom text Data Node if you also need manual notes.
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-cyan-200 bg-white/60 p-3">
            <p className="text-xs text-cyan-700">
              Add source data that supports your message.
            </p>
          </div>
        )}

        {nodeMode === 'document' ? (
        <div className="rounded-xl border border-cyan-200 bg-white/80 p-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan-700">
              File Attachments
            </div>
            <div className="flex items-center gap-2">
              {isAnyAnalyzing ? (
                <div className="analyze-glow-chip rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-700">
                  reading file
                </div>
              ) : null}
              {fileConfig ? (
                <div className="text-[10px] text-cyan-700">
                  {formatBytes(fileConfig.usedBytes)} / {formatBytes(fileConfig.maxStorageBytes)}
                </div>
              ) : null}
            </div>
          </div>

          {!fileConfig?.dataNodeFileUploadEnabled ? (
            <p className="mt-2 text-xs text-amber-700">
              File upload is available on Creator and Pro plans.
            </p>
          ) : primaryAttachedFile ? (
            <div className="mt-2">
              <a
                href={primaryAttachedFile.downloadUrl}
                target="_blank"
                rel="noreferrer"
                onMouseDown={(e) => e.stopPropagation()}
                className="nodrag block min-w-0 truncate rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-semibold text-cyan-800 underline"
                title={primaryAttachedFile.originalName}
              >
                {primaryAttachedFile.originalName}
              </a>
              {(missingAttachedFileIds.has(primaryAttachedFile.id) || deletedFileIds[primaryAttachedFile.id]) ? (
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-amber-700" />
                  <span>This file is unavailable because it could not be found in your library.</span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <label className={`nodrag inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 ${isNodeLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-cyan-100'}`}>
                <FontAwesomeIcon icon={faUpload} />
                {isUploading ? 'Uploading...' : 'Upload JPG, PNG, PDF'}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={handleUploadChange}
                  disabled={isUploading || isNodeLocked}
                />
              </label>

              <div className="relative flex min-w-0 flex-1 gap-2" ref={fileLibraryMenuRef}>
                <button
                  type="button"
                  disabled={isNodeLocked}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setIsFileLibraryMenuOpen((open) => !open)}
                  className="nodrag flex min-w-0 flex-1 items-center justify-between rounded-lg border border-cyan-200 bg-white px-2 py-2 text-xs text-dark hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="truncate text-left">
                    {selectedLibraryFileId
                      ? attachableFiles.find((file) => file.id === selectedLibraryFileId)?.originalName ?? 'Selected file'
                      : 'Attach from your file library'}
                  </span>
                  <span className={`ml-2 text-cyan-600 transition ${isFileLibraryMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isFileLibraryMenuOpen ? (
                  <div
                    className="nodrag nowheel absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-52 rounded-xl border border-cyan-200 bg-white shadow-[0_12px_24px_rgba(17,24,39,0.14)]"
                    onWheel={(e) => e.stopPropagation()}
                    ref={fileLibraryDropdownRef}
                  >
                    {attachableFiles.length === 0 ? (
                      <div className="px-3 py-2 text-[11px] text-slate-500">No available files to attach.</div>
                    ) : (
                      <ul className="py-1">
                        {attachableFiles.map((file) => (
                          <li key={file.id}>
                            <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-cyan-50">
                              <button
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => {
                                  setSelectedLibraryFileId(file.id);
                                  setIsFileLibraryMenuOpen(false);
                                }}
                                className="nodrag min-w-0 flex-1 rounded-md px-1 py-1 text-left text-xs text-slate-700"
                              >
                                <div className="truncate">{file.originalName}</div>
                                <div className="text-[10px] text-cyan-700">{formatBytes(file.sizeBytes)}</div>
                              </button>
                              <a
                                href={file.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                onMouseDown={(e) => e.stopPropagation()}
                                className="nodrag shrink-0 rounded-md border border-cyan-200 bg-white px-2 py-1 text-[10px] font-semibold text-cyan-700 hover:bg-cyan-100"
                              >
                                View
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    void handleAttachExisting();
                  }}
                  disabled={!selectedLibraryFileId || isAttaching || isNodeLocked}
                  className="nodrag rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-semibold text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAttaching ? 'Attaching...' : 'Attach'}
                </button>
              </div>
            </div>
          )}

          {attachError ? <p className="mt-2 text-xs text-red-600">{attachError}</p> : null}
          {hasMissingFiles ? (
            <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
              The attached file is unavailable because it could not be found in your file library.
            </div>
          ) : null}

          <div className="mt-3 space-y-1">
            {attachedFiles.length === 0 ? (
              <p className="text-xs text-cyan-700">No files attached yet.</p>
            ) : (
              attachedFiles.map((file) => (
                <div key={file.id} className="rounded-xl border border-cyan-100 bg-white p-2.5 shadow-[0_2px_10px_rgba(6,182,212,0.08)]">
                  {(missingAttachedFileIds.has(file.id) || deletedFileIds[file.id]) ? (
                    <div className="mb-2 flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px] text-amber-700" />
                      <span>File unavailable</span>
                    </div>
                  ) : null}
                  {file.mimeType.startsWith('image/') ? (
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      onMouseDown={(e) => e.stopPropagation()}
                      className="mb-2 block overflow-hidden rounded-lg border border-cyan-200 bg-cyan-50"
                    >
                      <img
                        src={file.downloadUrl}
                        alt={file.originalName}
                        className="h-28 w-full object-contain transition-transform duration-200 hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </a>
                  ) : null}
                  <div className="min-w-0">
                    <div className="mt-1 text-[10px] text-cyan-700/80">
                      {file.mimeType.startsWith('image/') ? 'Image' : 'Document'} • {formatBytes(file.sizeBytes)}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void analyzeAttachedFile(file.id);
                      }}
                      disabled={isNodeLocked || Boolean(isAnalyzingById[file.id]) || missingAttachedFileIds.has(file.id) || Boolean(deletedFileIds[file.id])}
                      className="wand-analyze-btn nodrag inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-violet-300 bg-[#2f2452] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="wand-icon-wrap">
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="wand-icon text-[13px]" />
                        <span className="wand-spark wand-spark-1" />
                        <span className="wand-spark wand-spark-2" />
                        <span className="wand-spark wand-spark-3" />
                      </span>
                      {isAnalyzingById[file.id] ? (
                        <span className="wand-btn-text inline-flex items-center gap-2">
                          <span className="analyze-orb h-1.5 w-1.5 rounded-full bg-amber-300" />
                          Analyzing...
                        </span>
                      ) : (missingAttachedFileIds.has(file.id) || deletedFileIds[file.id]) ? (
                        <span className="wand-btn-text">Unavailable</span>
                      ) : (
                        <span className="wand-btn-text">Analyze</span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isNodeLocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        syncAttachedFiles(attachedFiles.filter((attached) => attached.id !== file.id));
                      }}
                      className="banish-detach-btn nodrag inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-300 bg-gradient-to-r from-rose-50 via-white to-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faLinkSlash} className="banish-icon text-[11px]" />
                      Detach
                    </button>
                  </div>
                  {file.description ? (
                    <div className="description-reveal mt-2 rounded-lg border border-cyan-200 bg-cyan-50/65 px-2 py-1.5">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-700">
                        AI Analysis
                      </div>
                      <div className="relative mt-1">
                        <article
                          className="prose prose-sm max-w-none text-slate-700"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          <ReactMarkdown>{file.description}</ReactMarkdown>
                        </article>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-cyan-50/90 to-transparent" />
                      </div>
                      <button
                        type="button"
                        disabled={isNodeLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnalysisModal({
                            open: true,
                            fileName: file.originalName,
                            content: file.description ?? '',
                          });
                        }}
                        className="nodrag mt-2 rounded-md border border-cyan-200 bg-white px-2 py-1 text-[10px] font-semibold text-cyan-700 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        View analysis
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg border border-dashed border-cyan-200 bg-white px-2 py-1.5 text-[10px] text-slate-500">
                      No AI analysis available for this file.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes analyze-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.25);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(6, 182, 212, 0.02);
          }
        }
        @keyframes orb-wave {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.55);
            opacity: 0.45;
          }
        }
        @keyframes reveal-up {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes data-node-lock-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.25);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(6, 182, 212, 0.03);
          }
        }
        .wand-analyze-btn {
          min-height: 44px;
          transition: all 0.28s ease;
          box-shadow: 0 6px 20px rgba(47, 36, 82, 0.35);
          position: relative;
          overflow: hidden;
        }
        .wand-analyze-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
          transform: translateX(-120%);
          animation: wand-sheen 2.7s ease-in-out infinite;
          pointer-events: none;
        }
        .wand-analyze-btn:hover {
          background-color: #3a2c63;
          transform: translateY(-1px);
        }
        .wand-analyze-btn:active {
          transform: scale(0.98);
        }
        .wand-icon-wrap {
          position: relative;
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #d7c4ff;
        }
        .wand-icon {
          transform: rotate(-12deg);
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .wand-analyze-btn:hover .wand-icon {
          transform: rotate(-20deg) scale(1.05);
          color: #f4e8ff;
        }
        .wand-spark {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #f9dc84;
          box-shadow: 0 0 8px rgba(249, 220, 132, 0.8);
          opacity: 0;
          animation: spark-pop 1.5s ease-in-out infinite;
        }
        .wand-spark-1 {
          top: -1px;
          right: -1px;
          animation-delay: 0s;
        }
        .wand-spark-2 {
          bottom: -1px;
          right: -3px;
          animation-delay: 0.4s;
        }
        .wand-spark-3 {
          top: 1px;
          left: -3px;
          animation-delay: 0.85s;
        }
        .wand-btn-text {
          letter-spacing: 0.3px;
          color: #f4ecff;
        }
        .banish-detach-btn {
          transition: all 0.24s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 14px rgba(225, 29, 72, 0.12);
        }
        .banish-detach-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 90% 15%, rgba(251, 113, 133, 0.24), transparent 38%);
          opacity: 0.75;
          transition: opacity 0.24s ease;
          pointer-events: none;
        }
        .banish-detach-btn:hover {
          transform: translateY(-1px);
          border-color: #fb7185;
          background: linear-gradient(95deg, #ffe4e6 0%, #fff 45%, #fecdd3 100%);
          box-shadow: 0 8px 20px rgba(225, 29, 72, 0.2);
        }
        .banish-detach-btn:hover::after {
          opacity: 1;
        }
        .banish-detach-btn:active {
          transform: scale(0.98);
        }
        .banish-icon {
          transition: transform 0.22s ease;
        }
        .banish-detach-btn:hover .banish-icon {
          transform: rotate(-10deg) scale(1.08);
        }
        .analyze-orb {
          animation: orb-wave 1.2s ease-in-out infinite;
        }
        .analyze-glow-chip {
          animation: analyze-pulse 1.8s ease-in-out infinite;
        }
        .description-reveal {
          animation: reveal-up 280ms ease-out;
        }
        .data-node-lock {
          animation: data-node-lock-pulse 1.5s ease-in-out infinite;
        }
        .data-node-lock-orb {
          animation: orb-wave 1s ease-in-out infinite;
        }
        @keyframes wand-sheen {
          0% {
            transform: translateX(-120%);
          }
          55% {
            transform: translateX(140%);
          }
          100% {
            transform: translateX(140%);
          }
        }
        @keyframes spark-pop {
          0%, 100% {
            transform: scale(0.6);
            opacity: 0;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
          70% {
            transform: scale(0.9);
            opacity: 0.4;
          }
        }
        @keyframes modal-rise {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .analysis-modal-pop {
          animation: modal-rise 200ms ease-out;
        }
      `}</style>

      {analysisModal.open ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#120b24]/60 p-4 backdrop-blur-md">
          <div className="analysis-modal-pop relative w-full rounded-xl border border-violet-200/70 bg-white shadow-[0_30px_80px_rgba(10,8,25,0.4)]">
            <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-violet-200/35 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl" />
            <div className="relative flex items-center justify-between border-b border-violet-100 bg-gradient-to-r from-violet-50 via-white to-cyan-50 px-5 py-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-700">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[10px]" />
                  AI Analysis
                </div>
                <div className="mt-1 truncate text-sm font-semibold text-dark">{analysisModal.fileName}</div>
              </div>
              <button
                type="button"
                onClick={() => setAnalysisModal({ open: false, fileName: '', content: '' })}
                className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                >
                  Close
                </button>
              </div>
            <div className="relative h-[calc(82vh-78px)] px-5 py-5">
              <article className="prose prose-sm max-w-none text-slate-700 prose-headings:text-violet-900 prose-strong:text-slate-900 prose-code:text-violet-700">
                <ReactMarkdown>{analysisModal.content}</ReactMarkdown>
              </article>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
