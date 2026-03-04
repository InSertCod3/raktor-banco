'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatBytes } from '@/app/lib/filePolicy';

type UserFile = {
  id: string;
  originalName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  downloadUrl: string;
};

type FileBrowserClientProps = {
  initialFiles: UserFile[];
  uploadsEnabled: boolean;
  maxStorageBytes: number;
  usedBytes: number;
};

type FileUsageMap = {
  id: string;
  title: string;
  nodeCount: number;
};

type DeleteDialogState = {
  isOpen: boolean;
  file: UserFile | null;
  maps: FileUsageMap[];
  isLoadingUsage: boolean;
};

export default function FileBrowserClient({
  initialFiles,
  uploadsEnabled,
  maxStorageBytes,
  usedBytes,
}: FileBrowserClientProps) {
  const [files, setFiles] = useState(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingById, setIsDeletingById] = useState<Record<string, boolean>>({});
  const [isCheckingUsageById, setIsCheckingUsageById] = useState<Record<string, boolean>>({});
  const [storageUsedBytes, setStorageUsedBytes] = useState(usedBytes);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    file: null,
    maps: [],
    isLoadingUsage: false,
  });

  const usagePercent = useMemo(() => {
    if (maxStorageBytes <= 0) return 0;
    return Math.min((storageUsedBytes / maxStorageBytes) * 100, 100);
  }, [maxStorageBytes, storageUsedBytes]);

  const onUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set('file', file);

      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      const payload = (await res.json().catch(() => null)) as
        | {
            item?: UserFile;
            storage?: { usedBytes: number };
            error?: string;
          }
        | null;

      if (!res.ok || !payload?.item) {
        throw new Error(payload?.error ?? 'Upload failed.');
      }

      setFiles((current) => [payload.item!, ...current]);
      if (payload.storage?.usedBytes !== undefined) {
        setStorageUsedBytes(payload.storage.usedBytes);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      event.target.value = '';
      setIsUploading(false);
    }
  };

  const deleteFile = async (file: UserFile): Promise<boolean> => {
    setError(null);
    setIsDeletingById((current) => ({ ...current, [file.id]: true }));
    try {
      const res = await fetch(`/api/files/${file.id}`, { method: 'DELETE' });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(payload?.error ?? 'Delete failed.');
      }
      setFiles((current) => current.filter((item) => item.id !== file.id));
      setStorageUsedBytes((current) => Math.max(current - file.sizeBytes, 0));
      return true;
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed.');
      return false;
    } finally {
      setIsDeletingById((current) => ({ ...current, [file.id]: false }));
    }
  };

  const openDeleteDialog = async (file: UserFile) => {
    setError(null);
    setIsCheckingUsageById((current) => ({ ...current, [file.id]: true }));
    setDeleteDialog({
      isOpen: true,
      file,
      maps: [],
      isLoadingUsage: true,
    });

    try {
      const res = await fetch(`/api/files/${file.id}/usage`, { cache: 'no-store' });
      const payload = (await res.json().catch(() => null)) as
        | { maps?: FileUsageMap[]; error?: string }
        | null;

      if (!res.ok) {
        throw new Error(payload?.error ?? 'Could not load file usage.');
      }

      setDeleteDialog((current) => ({
        ...current,
        maps: payload?.maps ?? [],
        isLoadingUsage: false,
      }));
    } catch (usageError) {
      setDeleteDialog((current) => ({ ...current, isLoadingUsage: false }));
      setError(usageError instanceof Error ? usageError.message : 'Could not load file usage.');
    } finally {
      setIsCheckingUsageById((current) => ({ ...current, [file.id]: false }));
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      file: null,
      maps: [],
      isLoadingUsage: false,
    });
  };

  return (
    <section className="mt-10 rounded-3xl border border-dark/10 bg-white/85 p-5 shadow-2 backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-body-color">File Library</div>
          <div className="mt-2 text-lg font-semibold text-dark">Your uploaded files</div>
          <div className="mt-1 text-xs text-body-color">
            Files stay available even after a mind map is deleted.
          </div>
        </div>
        {uploadsEnabled ? (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-stroke bg-white px-4 py-2 text-xs font-semibold text-dark hover:bg-gray-1">
            {isUploading ? 'Uploading...' : 'Upload file'}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={onUploadChange}
              disabled={isUploading}
            />
          </label>
        ) : (
          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
            Upgrade to Creator or Pro for file uploads
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-stroke bg-white px-4 py-3">
        <div className="flex items-center justify-between text-xs text-body-color">
          <span>Storage used</span>
          <span>
            {formatBytes(storageUsedBytes)} / {formatBytes(maxStorageBytes)}
          </span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${usagePercent}%` }} />
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      ) : null}

      <div className="mt-4 space-y-2">
        {files.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stroke bg-gray-1 px-4 py-6 text-sm text-body-color">
            No files yet. Upload JPG, JPEG, PNG, or PDF.
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between gap-3 rounded-2xl border border-stroke bg-white px-4 py-3">
              <div className="min-w-0">
                <a href={file.downloadUrl} target="_blank" rel="noreferrer" className="truncate text-sm font-semibold text-dark underline">
                  {file.originalName}
                </a>
                <div className="mt-1 text-xs text-body-color">
                  {file.extension.toUpperCase()} • {formatBytes(file.sizeBytes)} • {new Date(file.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100"
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={() => {
                    void openDeleteDialog(file);
                  }}
                  disabled={Boolean(isDeletingById[file.id]) || Boolean(isCheckingUsageById[file.id])}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCheckingUsageById[file.id] ? 'Checking...' : isDeletingById[file.id] ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteDialog.isOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-stroke bg-white p-5 shadow-2xl">
            <div className="text-sm font-semibold text-dark">Delete file</div>
            <p className="mt-2 text-sm text-body-color">
              {deleteDialog.file?.originalName}
            </p>

            {deleteDialog.isLoadingUsage ? (
              <div className="mt-4 rounded-lg border border-stroke bg-gray-1 px-3 py-2 text-xs text-body-color">
                Checking active usage...
              </div>
            ) : deleteDialog.maps.length > 0 ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-800">
                  This file is actively used in {deleteDialog.maps.length} mind map{deleteDialog.maps.length === 1 ? '' : 's'}
                </div>
                <ul className="mt-2 space-y-1 text-xs text-amber-900">
                  {deleteDialog.maps.map((map) => (
                    <li key={map.id} className="flex items-center justify-between gap-2">
                      <Link href={`/dashboard/${map.id}`} className="truncate underline">
                        {map.title}
                      </Link>
                      <span className="shrink-0 text-[10px] text-amber-800">
                        {map.nodeCount} node{map.nodeCount === 1 ? '' : 's'}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-amber-800">
                  Detach this file from all listed mind maps before deleting.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                This file is not currently attached in any mind map.
              </div>
            )}

            <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800">
              Be mindful: deleting a file can change your workflow and affect how you generate content from related Data Nodes.
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-semibold text-body-color hover:bg-gray-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!deleteDialog.file) return;
                  void deleteFile(deleteDialog.file).then((ok) => {
                    if (ok) closeDeleteDialog();
                  });
                }}
                disabled={
                  Boolean(deleteDialog.file && isDeletingById[deleteDialog.file.id]) ||
                  deleteDialog.isLoadingUsage ||
                  deleteDialog.maps.length > 0
                }
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteDialog.maps.length > 0
                  ? 'Detach from all maps first'
                  : deleteDialog.file && isDeletingById[deleteDialog.file.id]
                    ? 'Deleting...'
                    : 'Delete file'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
