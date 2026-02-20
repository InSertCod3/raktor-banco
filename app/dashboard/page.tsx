import Link from 'next/link';
import { prisma } from '@/app/lib/db';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import BackgroundGrid from '@/app/components/BackgroundGrid';
import MapListClient from './ui/MapListClient';
import LogoutButton from '@/app/components/LogoutButton';
import { getUsageData, getUserSubscriptionTier } from '@/app/lib/usage';
import { SubscriptionTier } from '@prisma/client';

export default async function MindAppHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const createFailed = sp.error === 'create_failed';

  let maps: { id: string; title: string; updatedAt: string }[] = [];
  let dbError: string | null = null;
  let userId: string | null = null;

  try {
    try {
      userId = await getOrCreateCurrentUserId();
    } catch (authError) {
      // User not authenticated, continue with null userId
      userId = null;
    }
    
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
  } catch (err) {
    console.log(err);
    dbError = 'Set DATABASE_URL and run npm run prisma:migrate to enable saving and loading maps.';
  }

  const hasMaps = maps.length > 0;
  const mapsUpdatedLast7Days = maps.filter((m) => {
    const updated = new Date(m.updatedAt).getTime();
    return updated >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;
  const latestMapUpdate = hasMaps ? new Date(maps[0].updatedAt) : null;
  const latestMapUpdateLabel = latestMapUpdate
    ? latestMapUpdate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No edits yet';
  
  // Get usage data and subscription info
  let usageData: any = null;
  let subscriptionTier = 'FREE' as const;
  let usageLimit = 8;
  let currentUsage = 0;
  let mapLimit = 2;
  let currentMaps = 0;
  
  if (userId) {
    try {
      usageData = await getUsageData(userId);
      subscriptionTier = usageData.tier;
      usageLimit = usageData.limit;
      currentUsage = usageData.currentUsage;
      mapLimit = usageData.mapLimit ?? 2;
      currentMaps = usageData.currentMaps ?? 0;
    } catch (err) {
      console.log('Error fetching usage data:', err);
    }
  }
  
  // Get plan label based on tier
  const planLabels: Record<string, string> = {
    FREE: 'Free Tier',
    CREATOR: 'Creator ($19/mo)',
    PRO: 'Pro ($59/mo)',
  };
  const currentPlanLabel = planLabels[subscriptionTier] || 'Free Tier';

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f6f5f1] font-['Space_Grotesk']">
      <BackgroundGrid strokeColor="rgba(9, 14, 52, 0.08)" gridSize={84} strokeWidth={1} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(246,245,241,0.9))]" />
      <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-body-color transition hover:text-dark">
            Back to landing
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-body-color">
            <span className="rounded-full border border-stroke bg-white/80 px-3 py-1">
              {dbError ? 'Database offline' : `${maps.length} map${maps.length === 1 ? '' : 's'}`}
            </span>
            <span className="rounded-full border border-stroke bg-white/80 px-3 py-1">LinkedIn + Facebook + instagram</span>
            <Link
              href="/dashboard?create=1"
              className="rounded-full bg-dark px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-2 transition hover:bg-dark-2"
            >
              New map
            </Link>
            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-full border border-stroke bg-white/80 px-2 py-1.5 transition hover:bg-white">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-200 to-amber-200" />
                <svg className="h-4 w-4 text-body-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 top-full z-50 mt-1 hidden w-40 rounded-xl border border-stroke bg-white py-1 shadow-lg group-hover:block">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="rounded-3xl border border-dark/10 bg-white/75 p-6 shadow-2 backdrop-blur sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-dark/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-dark">
              Visual-first ideation
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-dark sm:text-5xl">
              Build once in the map, then generate post drafts where ideas happen.
            </h1>
            <p className="mt-4 max-w-[620px] text-base text-body-color">
              Start with one core idea, expand into branches, and generate concise LinkedIn, Facebook and Instagram content from any
              node without leaving your visual workflow.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard?create=1"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-2 transition hover:bg-blue-dark"
              >
                Start a new map
              </Link>
              <span className="rounded-full border border-stroke bg-white px-4 py-2 text-xs font-medium text-body-color">
                Tip: click a node to edit or regenerate
              </span>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-dark/10 bg-white/85 p-5 shadow-2 backdrop-blur sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-body-color">Start From Your Map</div>
                <div className="mt-2 text-lg font-semibold text-dark">Account snapshot</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stroke bg-white px-4 py-3 shadow-1">
                <div className="text-xs uppercase tracking-[0.14em] text-body-color">Total maps</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-xl font-semibold text-dark">{maps.length}</div>
                  {subscriptionTier === 'FREE' && mapLimit && (
                    <span className="text-xs text-body-color">/ {mapLimit}</span>
                  )}
                </div>
                {subscriptionTier === 'FREE' && mapLimit && maps.length >= mapLimit && (
                  <Link href="/pricing" className="mt-1 inline-block text-xs text-primary hover:underline">
                    Upgrade for more
                  </Link>
                )}
              </div>
              <div className="rounded-2xl border border-stroke bg-white px-4 py-3 shadow-1">
                <div className="text-xs uppercase tracking-[0.14em] text-body-color">Updated (7d)</div>
                <div className="mt-1 text-xl font-semibold text-dark">{mapsUpdatedLast7Days}</div>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-stroke bg-white px-4 py-3 shadow-1">
                <div className="text-xs uppercase tracking-[0.14em] text-body-color">Current plan</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-dark">{currentPlanLabel}</div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    Active
                  </span>
                </div>
                <div className="mt-2 text-xs text-body-color">Includes core map creation and LinkedIn/Facebook/Instagram generation.</div>
              </div>
              
              {/* Usage Metrics */}
              <div className="rounded-2xl border border-stroke bg-white px-4 py-3 shadow-1">
                <div className="text-xs uppercase tracking-[0.14em] text-body-color">Generations used</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-dark">
                    {currentUsage} <span className="text-xs text-body-color">/ {usageLimit}</span>
                  </div>
                  <div className="text-xs text-body-color">
                    {subscriptionTier === 'FREE' ? 'weekly' : 'monthly'}
                  </div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${
                      currentUsage >= usageLimit
                        ? 'bg-red-500'
                        : subscriptionTier === 'FREE'
                          ? 'bg-emerald-500'
                          : subscriptionTier === 'CREATOR'
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min((currentUsage / usageLimit) * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-body-color">
                  {currentUsage >= usageLimit
                    ? (
                      <span>
                        Usage limit reached.{' '}
                        <Link href="/pricing" className="text-primary hover:underline">Upgrade for more</Link>
                      </span>
                    )
                    : `${usageLimit - currentUsage} generations remaining`}
                </div>
              </div>
              
              <div className="rounded-2xl border border-stroke bg-white px-4 py-3 shadow-1">
                <div className="text-xs uppercase tracking-[0.14em] text-body-color">Last activity</div>
                <div className="mt-1 text-sm font-semibold text-dark">{latestMapUpdateLabel}</div>
              </div>
            </div>
          </div>
        </section>

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
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-body-color">Your maps</div>
                <div className="mt-2 text-lg font-semibold text-dark">Recent work</div>
              </div>
              <div className="text-xs text-body-color">
                {hasMaps ? `Showing ${maps.length} map${maps.length === 1 ? '' : 's'}` : 'No maps yet. Create your first one to begin.'}
              </div>
            </div>
            {!hasMaps ? (
              <div className="mb-4 rounded-2xl border border-dashed border-primary/40 bg-white/75 p-4 text-sm text-body-color">
                Build your first map around a central idea, then branch into supporting thoughts and generate drafts per
                node.
              </div>
            ) : null}
            <MapListClient initialMaps={maps} />
          </div>
        )}
      </div>
    </main>
  );
}
