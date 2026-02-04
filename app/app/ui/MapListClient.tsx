'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';

interface MapItem {
  id: string;
  title: string;
  updatedAt: string;
}

interface MapListClientProps {
  initialMaps: MapItem[];
}

export default function MapListClient({ initialMaps }: MapListClientProps) {
  const router = useRouter();
  const [maps, setMaps] = useState(initialMaps);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; mapId: string; mapTitle: string }>({
    isOpen: false,
    mapId: '',
    mapTitle: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, mapId: id, mapTitle: title });
  };

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
        <Link
          href="/app/new"
          className="group rounded-2xl border border-dashed border-primary/40 bg-white/80 p-6 shadow-1 backdrop-blur transition hover:border-primary hover:bg-white"
        >
          <div className="text-sm font-semibold text-dark">Start a new map</div>
          <p className="mt-2 text-sm text-body-color">
            Create a central idea, branch out, and generate posts node-by-node.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Create map <span className="transition group-hover:translate-x-0.5">→</span>
          </div>
        </Link>

        {maps.map((m) => (
          <div key={m.id} className="group relative">
            <Link
              href={`/app/${m.id}`}
              className="block h-full rounded-2xl border border-stroke bg-white/80 p-6 shadow-1 backdrop-blur transition hover:border-primary hover:bg-white"
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

              <div className="mt-5 h-20 rounded-xl border border-stroke bg-gray-1">
                <div className="h-full w-full rounded-xl bg-[radial-gradient(circle_at_20%_30%,rgba(55,88,249,0.15),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(19,194,150,0.14),transparent_55%)]" />
              </div>
            </Link>
            
            <button
              onClick={(e) => handleDeleteClick(e, m.id, m.title)}
              className="absolute bottom-4 right-4 rounded-lg bg-white p-2 text-body-color shadow-md border border-stroke opacity-0 group-hover:opacity-100 transition hover:text-red-500 hover:border-red-200"
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
    </>
  );
}
