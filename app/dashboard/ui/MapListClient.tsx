'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import LoadingModal from '@/app/components/LoadingModal';

interface MapItem {
  id: string;
  title: string;
  updatedAt: string;
}

interface MapListClientProps {
  initialMaps: MapItem[];
}

const MAX_MAP_TITLE = 120;

type GradientTheme = {
  name: 'dawn' | 'glacier' | 'ember' | 'retro' | 'galaxy' | 'mintpaper';
  build: (p: {
    angle: number;
    c1: string;
    c2: string;
    c3: string;
    c4: string;
  }) => React.CSSProperties;
};

const getMindMapGradientStyle = (id: string): React.CSSProperties => {
  let seed = 7;
  for (let i = 0; i < id.length; i++) {
    seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  }

  const themeSeeds = [
    { base: 28, spreadA: 30, spreadB: 70 }, // dawn
    { base: 198, spreadA: 24, spreadB: 60 }, // glacier
    { base: 8, spreadA: 36, spreadB: 90 }, // ember
    { base: 248, spreadA: 22, spreadB: 55 }, // retro
    { base: 292, spreadA: 34, spreadB: 95 }, // galaxy
    { base: 150, spreadA: 18, spreadB: 42 }, // mintpaper
  ];

  const themeSeed = themeSeeds[seed % themeSeeds.length];
  const angle = seed % 360;
  const isMono = themeSeed.base === 0;

  const hueA = isMono ? 0 : (themeSeed.base + (seed % themeSeed.spreadA)) % 360;
  const hueB = isMono ? 0 : (hueA + themeSeed.spreadA + ((seed >> 3) % themeSeed.spreadB)) % 360;
  const hueC = isMono ? 0 : (hueA + themeSeed.spreadB + ((seed >> 5) % 110)) % 360;
  const hueD = isMono ? 0 : (hueB + 30 + ((seed >> 7) % 80)) % 360;

  const satA = isMono ? 0 : 58 + (seed % 20);
  const satB = isMono ? 0 : 52 + ((seed >> 3) % 24);
  const satC = isMono ? 0 : 60 + ((seed >> 5) % 18);
  const satD = isMono ? 0 : 48 + ((seed >> 7) % 28);

  const lightA = 52 + ((seed >> 5) % 12);
  const lightB = 48 + ((seed >> 7) % 14);
  const lightC = 56 + ((seed >> 9) % 10);
  const lightD = 46 + ((seed >> 11) % 16);

  const c1 = `hsla(${hueA}, ${satA}%, ${lightA}%, 0.28)`;
  const c2 = `hsla(${hueB}, ${satB}%, ${lightB}%, 0.22)`;
  const c3 = `hsla(${hueC}, ${satC}%, ${lightC}%, 0.2)`;
  const c4 = `hsla(${hueD}, ${satD}%, ${lightD}%, 0.18)`;

  const themeMap: GradientTheme[] = [
    {
      name: 'dawn',
      build: ({ angle, c1, c2, c4 }) => ({
        backgroundImage: `radial-gradient(circle at 18% 20%, ${c1}, transparent 52%), radial-gradient(circle at 84% 78%, ${c2}, transparent 56%), linear-gradient(${(angle + 18) % 360}deg, ${c4}, transparent 68%)`,
      }),
    },
    {
      name: 'glacier',
      build: ({ angle, c1, c2, c3 }) => ({
        backgroundImage: `linear-gradient(${(angle + 140) % 360}deg, ${c3}, transparent 66%), repeating-linear-gradient(${(angle + 35) % 360}deg, ${c1} 0 11px, transparent 11px 22px), radial-gradient(circle at 72% 30%, ${c2}, transparent 54%)`,
      }),
    },
    {
      name: 'ember',
      build: ({ angle, c1, c2, c3 }) => ({
        backgroundImage: `linear-gradient(${(angle + 190) % 360}deg, ${c1}, ${c3}), radial-gradient(circle at 78% 26%, ${c2}, transparent 48%), radial-gradient(circle at 24% 82%, ${c3}, transparent 58%)`,
      }),
    },
    {
      name: 'retro',
      build: ({ angle, c1, c2, c4 }) => ({
        backgroundImage: `conic-gradient(from ${(angle + 65) % 360}deg at 62% 44%, ${c1}, ${c2}, ${c4}, ${c1}), linear-gradient(${(angle + 210) % 360}deg, transparent 35%, ${c2})`,
      }),
    },
    {
      name: 'galaxy',
      build: ({ angle, c1, c2, c3, c4 }) => ({
        backgroundImage: `radial-gradient(circle at 20% 24%, ${c1}, transparent 46%), radial-gradient(circle at 76% 72%, ${c2}, transparent 50%), conic-gradient(from ${(angle + 250) % 360}deg at 50% 50%, ${c4}, ${c3}, ${c4})`,
      }),
    },
    {
      name: 'mintpaper',
      build: ({ angle, c1, c2, c3 }) => ({
        backgroundImage: `repeating-linear-gradient(${(angle + 8) % 360}deg, ${c1} 0 10px, transparent 10px 20px), radial-gradient(circle at 68% 26%, ${c2}, transparent 52%), linear-gradient(${(angle + 175) % 360}deg, ${c3}, ${c2})`,
      }),
    },
  ];

  const theme = themeMap[seed % themeMap.length];
  return theme.build({ angle, c1, c2, c3, c4 });
};

export default function MapListClient({ initialMaps }: MapListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [maps, setMaps] = useState(initialMaps);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; mapId: string; mapTitle: string }>({
    isOpen: false,
    mapId: '',
    mapTitle: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStepIndex, setCreateStepIndex] = useState(0);
  const [mapTitleInput, setMapTitleInput] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreatingMap, setIsCreatingMap] = useState(false);
  const [openingMapTitle, setOpeningMapTitle] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('create') !== '1') return;
    setIsCreateModalOpen(true);
    setCreateStepIndex(0);
    setCreateError(null);
    setMapTitleInput('');
    router.replace(pathname);
  }, [pathname, router, searchParams]);

  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, mapId: id, mapTitle: title });
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    setCreateStepIndex(0);
    setCreateError(null);
    setMapTitleInput('');
  };

  const closeCreateModal = (force = false) => {
    if (isCreatingMap && !force) return;
    setIsCreateModalOpen(false);
    setCreateStepIndex(0);
    setCreateError(null);
    setMapTitleInput('');
  };

  const normalizedMapTitle = mapTitleInput.trim();

  const titleValidationError = useMemo(() => {
    if (normalizedMapTitle.length === 0) return 'A map name is required.';
    if (normalizedMapTitle.length > MAX_MAP_TITLE) return `Map name must be ${MAX_MAP_TITLE} characters or fewer.`;
    return null;
  }, [normalizedMapTitle]);

  const handleCreateNameOk = () => {
    if (titleValidationError) {
      setCreateError(titleValidationError);
      return;
    }
    setCreateError(null);
    setCreateStepIndex(1);
  };

  const handleBackStep = () => {
    if (isCreatingMap) return;
    setCreateError(null);
    setCreateStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleGetStarted = async () => {
    if (titleValidationError) {
      setCreateStepIndex(0);
      setCreateError(titleValidationError);
      return;
    }

    setIsCreatingMap(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: normalizedMapTitle }),
      });

      if (!res.ok) {
        setCreateError('Could not create map. Please try again.');
        setCreateStepIndex(0);
        return;
      }

      const data = (await res.json()) as { mapId: string };
      closeCreateModal(true);
      router.push(`/dashboard/${data.mapId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setCreateError('Could not create map. Please try again.');
      setCreateStepIndex(0);
    } finally {
      setIsCreatingMap(false);
    }
  };

  const modalSteps = [
    <div key="name" className="min-w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <div className="text-2xl font-semibold text-dark">Name your mind map</div>
          <p className="mt-2 text-sm text-body-color">A valid name is required before creating a map.</p>
          <div className="mt-6 text-left">
            <label htmlFor="mapTitle" className="block text-sm font-medium text-dark mb-2">
              Mind map name
            </label>
            <input
              id="mapTitle"
              value={mapTitleInput}
              onChange={(e) => {
                setMapTitleInput(e.target.value);
                if (createError) setCreateError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNameOk();
              }}
              placeholder="e.g. Q1 Content Strategy"
              maxLength={MAX_MAP_TITLE}
              className="w-full rounded-xl border border-stroke bg-gray-1 px-4 py-3 text-dark outline-none focus:border-primary transition"
              autoFocus
            />
            <div className="mt-2 text-right text-xs text-body-color">{normalizedMapTitle.length}/{MAX_MAP_TITLE}</div>
            {createError ? <div className="mt-2 text-sm text-red-600">{createError}</div> : null}
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-stroke/70 bg-white/80 px-6 py-4">
        <button
          onClick={() => closeCreateModal()}
          disabled={isCreatingMap}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-body-color hover:bg-gray-2 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateNameOk}
          disabled={isCreatingMap}
          className="rounded-lg bg-dark px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-dark-2 transition disabled:opacity-50"
        >
          OK
        </button>
      </div>
    </div>,
    <div key="ready" className="min-w-full min-h-[360px] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700 shadow-sm animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m20 6-11 11-5-5" />
            </svg>
          </div>
          <div className="text-2xl font-semibold text-dark">All set</div>
          <p className="mt-2 text-sm text-body-color">
            Your new map will be created as <span className="font-semibold text-dark">{normalizedMapTitle}</span>.
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-stroke/70 bg-white/80 px-6 py-4">
        <button
          onClick={handleBackStep}
          disabled={isCreatingMap}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-body-color hover:bg-gray-2 transition disabled:opacity-50"
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => closeCreateModal()}
            disabled={isCreatingMap}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-body-color hover:bg-gray-2 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGetStarted}
            disabled={isCreatingMap}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-dark transition disabled:opacity-50"
          >
            {isCreatingMap ? 'Creating...' : 'Get started'}
          </button>
        </div>
      </div>
    </div>,
  ];

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/maps/${deleteModal.mapId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMaps((prev) => prev.filter((m) => m.id !== deleteModal.mapId));
        setDeleteModal({ isOpen: false, mapId: '', mapTitle: '' });
        router.refresh();
      } else {
        alert('Failed to delete map');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={openCreateModal}
          className="group rounded-2xl border border-dashed border-primary/40 bg-white/80 p-6 shadow-1 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-white hover:shadow-xl"
        >
          <div className="text-sm font-semibold text-dark">Start a new map</div>
          <p className="mt-2 text-sm text-body-color">
            Create a central idea, branch out, and generate posts node-by-node.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Create map <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
        </button>

        {maps.map((m) => (
          <div key={m.id} className="group relative">
            <Link
              href={`/dashboard/${m.id}`}
              onClick={() => setOpeningMapTitle(m.title)}
              className="block h-full rounded-2xl border border-stroke bg-white/80 p-6 shadow-1 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-white hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-dark">{m.title}</div>
                  <div className="mt-2 text-xs text-body-color">
                    Updated {new Date(m.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs font-semibold text-primary">Open</div>
              </div>

              <div className="relative mt-5 h-20 overflow-hidden rounded-xl border border-stroke bg-gray-1">
                <div
                  className="h-full w-full rounded-xl transition-transform duration-700 ease-out group-hover:scale-110"
                  style={getMindMapGradientStyle(m.id)}
                />
                <div className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,transparent_35%,rgba(255,255,255,0.38)_50%,transparent_65%)] transition-transform duration-1000 ease-out group-hover:translate-x-[120%]" />
              </div>
            </Link>
            
            <button
              onClick={(e) => handleDeleteClick(e, m.id, m.title)}
              className="absolute bottom-4 right-4 translate-y-1 rounded-lg border border-stroke bg-white p-2 text-body-color opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:border-red-200 hover:text-red-500"
              title="Delete map"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Mind Map"
        itemName={deleteModal.mapTitle}
        phraseEnforce={true}
        isLoading={isDeleting}
      />

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-stroke bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl animate-pulse" style={{ animationDelay: '350ms' }} />
            <div className="relative flex items-center justify-center gap-2 border-b border-stroke/70 px-6 py-4">
              {[0, 1].map((idx) => (
                <span
                  key={idx}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === createStepIndex ? 'w-7 bg-primary shadow-sm shadow-primary/40' : 'w-2.5 bg-dark/20'
                  }`}
                />
              ))}
            </div>
            <div
              className="relative flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${createStepIndex * 100}%)` }}
            >
              {modalSteps}
            </div>
          </div>
        </div>
      ) : null}

      <LoadingModal
        isOpen={openingMapTitle !== null}
        title="Opening map"
        description={`Loading "${openingMapTitle ?? 'map'}"...`}
      />
    </>
  );
}
