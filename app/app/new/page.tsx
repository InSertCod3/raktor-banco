'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CREATING_KEY = 'mm_creating_map';

export default function NewMapPage() {
  const router = useRouter();
  const hasCreated = useRef(false);

  useEffect(() => {
    // Prevent duplicate map creation on remounts (e.g., back button, React Strict Mode)
    if (hasCreated.current) return;

    // Check if we're already in the process of creating (prevents back-button duplicates)
    if (sessionStorage.getItem(CREATING_KEY)) {
      // If we're already creating, redirect to app list instead
      router.push('/app');
      return;
    }

    hasCreated.current = true;
    sessionStorage.setItem(CREATING_KEY, '1');

    (async () => {
      try {
        const res = await fetch('/api/maps', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ title: 'Untitled map' }),
        });
        if (!res.ok) {
          sessionStorage.removeItem(CREATING_KEY);
          router.push('/app?error=create_failed');
          return;
        }
        const data = (await res.json()) as { mapId: string };
        sessionStorage.removeItem(CREATING_KEY);
        router.push(`/app/${data.mapId}`);
      } catch {
        sessionStorage.removeItem(CREATING_KEY);
        router.push('/app?error=create_failed');
      }
    })();
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-1">
      <div className="text-sm text-body-color">Creating map…</div>
    </div>
  );
}


