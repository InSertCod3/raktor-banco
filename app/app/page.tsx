import Link from 'next/link';
import { prisma } from '@/app/lib/db';
import { getCurrentUserId } from '@/app/lib/currentUser';
import BackgroundGrid from '@/app/components/BackgroundGrid';

export default async function MindAppHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const createFailed = sp.error === 'create_failed';

  let maps: { id: string; title: string; updatedAt: Date }[] = [];
  let dbError: string | null = null;

  try {
    const userId = await getCurrentUserId();
    if (userId) {
      maps = await prisma.map.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true, updatedAt: true },
        take: 50,
      });
    }
    // If no userId (no cookie yet), maps stays empty - that's fine, user will get cookie on first API call
  } catch (err) {
    console.log(err);
    dbError = 'Set DATABASE_URL and run npm run prisma:migrate to enable saving and loading maps.';
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-gray-1">
      <BackgroundGrid strokeColor="rgba(55, 88, 249, 0.08)" gridSize={72} strokeWidth={1} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/20 to-white/70" />

      <div className="relative mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-[260px]">
            <Link href="/" className="text-xs font-medium text-body-color hover:text-primary">
              ← Back to landing
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-dark">Mind Mapper</h1>
            <p className="mt-2 max-w-[560px] text-body-color">
              A visual-first workspace: map your ideas, then generate LinkedIn/Facebook posts from any node.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-body-color">
              {dbError ? 'Offline' : `${maps.length} map${maps.length === 1 ? '' : 's'}`}
            </div>
            <Link
              href="/app/new"
              className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-1 hover:bg-blue-dark"
            >
              New map
            </Link>
          </div>
        </div>

        {createFailed ? (
          <div className="mt-6 rounded-xl border border-stroke bg-white/90 p-4 shadow-1 backdrop-blur">
            <div className="text-sm font-semibold text-dark">Couldn’t create a map</div>
            <p className="mt-1 text-sm text-body-color">
              Double-check <code className="rounded bg-gray-2 px-1">DATABASE_URL</code> and run{' '}
              <code className="rounded bg-gray-2 px-1">npm run prisma:migrate</code>.
            </p>
          </div>
        ) : null}

        {dbError ? (
          <div className="mt-10 rounded-2xl border border-stroke bg-white/90 p-6 shadow-1 backdrop-blur">
            <div className="text-sm font-semibold text-dark">Database not configured</div>
            <p className="mt-2 text-sm text-body-color">{dbError}</p>
            <div className="mt-4 rounded-lg bg-gray-1 p-3 text-sm text-dark">
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
              <Link
                key={m.id}
                href={`/app/${m.id}`}
                className="rounded-2xl border border-stroke bg-white/80 p-6 shadow-1 backdrop-blur transition hover:border-primary hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-dark">{m.title}</div>
                    <div className="mt-2 text-xs text-body-color">
                      Updated {m.updatedAt.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-primary">Open</div>
                </div>

                <div className="mt-5 h-20 rounded-xl border border-stroke bg-gray-1">
                  <div className="h-full w-full rounded-xl bg-[radial-gradient(circle_at_20%_30%,rgba(55,88,249,0.15),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(19,194,150,0.14),transparent_55%)]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


