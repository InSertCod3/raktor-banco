import BackgroundGrid from '@/app/components/BackgroundGrid';
import LoadingModal from '@/app/components/LoadingModal';

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-300/60 ${className}`} />;
}

export default function Loading() {
  return (
    <>
      <main className="relative min-h-dvh overflow-hidden bg-[#f6f5f1] font-['Space_Grotesk']">
        <BackgroundGrid strokeColor="rgba(9, 14, 52, 0.08)" gridSize={84} strokeWidth={1} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(246,245,241,0.9))]" />
        <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="relative blur-[3px] saturate-75">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SkeletonBlock className="h-4 w-28" />
              <div className="flex gap-2">
                <SkeletonBlock className="h-8 w-24 rounded-full" />
                <SkeletonBlock className="h-8 w-36 rounded-full" />
                <SkeletonBlock className="h-8 w-8 rounded-full" />
              </div>
            </div>

            <section className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
              <div className="rounded-3xl border border-dark/10 bg-white/75 p-6 shadow-2 backdrop-blur sm:p-8">
                <SkeletonBlock className="h-8 w-44 rounded-full" />
                <SkeletonBlock className="mt-5 h-12 w-full max-w-[520px]" />
                <SkeletonBlock className="mt-3 h-4 w-full max-w-[560px]" />
                <SkeletonBlock className="mt-2 h-4 w-full max-w-[480px]" />
                <div className="mt-6 flex gap-3">
                  <SkeletonBlock className="h-11 w-40 rounded-full" />
                  <SkeletonBlock className="h-10 w-56 rounded-full" />
                </div>
              </div>

              <div className="grid gap-4 rounded-3xl border border-dark/10 bg-white/85 p-5 shadow-2 backdrop-blur sm:p-6">
                <SkeletonBlock className="h-4 w-36" />
                <div className="grid grid-cols-2 gap-3">
                  <SkeletonBlock className="h-24" />
                  <SkeletonBlock className="h-24" />
                </div>
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-20" />
              </div>
            </section>

            <div className="mt-10">
              <SkeletonBlock className="mb-4 h-4 w-24" />
              <div className="space-y-3">
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-16 w-full" />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-white/20" />
        </div>
      </main>

      <LoadingModal isOpen title="Opening dashboard" description="Loading your maps and account snapshot..." />
    </>
  );
}
