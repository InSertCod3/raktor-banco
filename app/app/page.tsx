import Link from 'next/link';
import { prisma } from '@/app/lib/db';
import { getCurrentUserId } from '@/app/lib/currentUser';
import BackgroundGrid from '@/app/components/BackgroundGrid';
import MapListClient from './ui/MapListClient';

export default async function MindAppHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const createFailed = sp.error === 'create_failed';

  let maps: { id: string; title: string; updatedAt: string }[] = [];
  let dbError: string | null = null;

  try {
    const userId = await getCurrentUserId();
    if (userId) {
      const dbMaps = await prisma.map.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true, updatedAt: true },
        take: 50,
      });
      
      maps = dbMaps.map(m => ({
        ...m,
        updatedAt: m.updatedAt.toISOString()
      }));
    }
    // If no userId (no cookie yet), maps stays empty - that's fine, user will get cookie on first API call
  } catch (err) {
    console.log(err);
    dbError = 'Set DATABASE_URL and run npm run prisma:migrate to enable saving and loading maps.';
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f6f5f1] font-['Space_Grotesk']">
      <BackgroundGrid strokeColor="rgba(9, 14, 52, 0.08)" gridSize={84} strokeWidth={1} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(246,245,241,0.9))]" />
      <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-body-color">
            Back to landing
          </Link>
          <div className="flex items-center gap-3 text-xs text-body-color">
            <span className="rounded-full border border-stroke bg-white/70 px-3 py-1">
              {dbError ? 'Offline' : `${maps.length} map${maps.length === 1 ? '' : 's'}`}
            </span>
            <Link
              href="/app?create=1"
              className="rounded-full bg-dark px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-2 hover:bg-dark-2"
            >
              New map
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-dark/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-dark">
              Visual-first ideation
            </div>
            <h1 className="mt-5 text-4xl font-semibold text-dark sm:text-5xl">
              Mind Mapper turns ideas into share-ready content.
            </h1>
            <p className="mt-4 max-w-[560px] text-base text-body-color">
              Build a map around one thought, branch into supporting ideas, then generate LinkedIn and Facebook drafts
              from any node without leaving the flow.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/app?create=1"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-2 hover:bg-blue-dark"
              >
                Start a new map
              </Link>
              <div className="text-xs text-body-color">
                <span className="font-semibold text-dark">Tip:</span> click a node to edit or generate.
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-dark/10 bg-white/80 p-5 shadow-2 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-body-color">Quick actions</div>
                <div className="mt-2 text-lg font-semibold text-dark">Create, connect, publish.</div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-200 to-amber-200" />
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-stroke bg-white px-4 py-3 shadow-1">
                <div className="text-sm font-semibold text-dark">Idea → Social in minutes</div>
                <div className="mt-1 text-xs text-body-color">Generate copy and keep it attached to the idea node.</div>
              </div>
              <div className="rounded-2xl border border-stroke bg-white px-4 py-3 shadow-1">
                <div className="text-sm font-semibold text-dark">Reusable idea graphs</div>
                <div className="mt-1 text-xs text-body-color">Return to any map and regenerate variations.</div>
              </div>
            </div>
          </div>
        </div>

        {createFailed ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/60 p-4 text-sm text-dark">
            <div className="font-semibold">Couldn’t create a map</div>
            <p className="mt-1 text-body-color">
              Double-check <code className="rounded bg-white px-1">DATABASE_URL</code> and run{' '}
              <code className="rounded bg-white px-1">npm run prisma:migrate</code>.
            </p>
          </div>
        ) : null}

        {dbError ? (
          <div className="mt-10 rounded-3xl border border-stroke bg-white/90 p-6 shadow-2 backdrop-blur">
            <div className="text-sm font-semibold text-dark">Database not configured</div>
            <p className="mt-2 text-sm text-body-color">{dbError}</p>
            <div className="mt-4 rounded-2xl bg-gray-1 p-4 text-sm text-dark">
              <div className="font-semibold">Quick start</div>
              <div className="mt-2">
                1) Set <code className="rounded bg-white px-1">DATABASE_URL</code> in <code className="rounded bg-white px-1">.env</code>
              </div>
              <div className="mt-1">
                2) Run <code className="rounded bg-white px-1">npm run prisma:migrate</code>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-body-color">Your maps</div>
                <div className="mt-2 text-lg font-semibold text-dark">Recent work</div>
              </div>
            </div>
            <MapListClient initialMaps={maps} />
          </div>
        )}
      </div>
    </main>
  );
}
