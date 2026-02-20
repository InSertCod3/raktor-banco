import Link from "next/link";
import { type Metadata } from "next";
import BackgroundGrid from "./components/BackgroundGrid";
import LandingFlowDemo from "./components/LandingFlowDemo";

export const metadata: Metadata = {
  title: "MayDove - Visual Content Planning",
  description:
    "Turn scattered thoughts into publish-ready content with a visual map. Start free and map your ideas to LinkedIn, Facebook and Instagram drafts.",
  openGraph: {
    title: "MayDove - Visual Content Planning",
    description:
      "Turn scattered thoughts into publish-ready content with a visual map.",
    siteName: "MayDove",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MayDove - Visual Content Planning",
    description:
      "Turn scattered thoughts into publish-ready content with a visual map.",
    creator: "@MayDove",
  },
};

export const runtime = "edge";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f3f1eb] font-['Space_Grotesk']">
      <BackgroundGrid
        strokeColor="rgba(34, 44, 38, 0.08)"
        gridSize={86}
        strokeWidth={1}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(243,241,235,0.95))]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#d8e4d6]/70 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-36 h-96 w-96 rounded-full bg-[#e6ddce]/70 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#687269]">
            MayDove
          </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
            <Link
              href="/pricing"
              className="rounded-full border border-[#d4d0c4] bg-white/80 px-4 py-2 font-semibold uppercase tracking-wide text-[#2d3a33] hover:bg-white"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[#d4d0c4] bg-white/80 px-4 py-2 font-semibold uppercase tracking-wide text-[#2d3a33] hover:bg-white"
            >
              Open app
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#2d3a33] px-5 py-2 font-semibold uppercase tracking-wide text-white shadow-2 hover:bg-[#243029]"
            >
              Join now
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#d4d0c4] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2d3a33]">
              Built for fast MVP execution
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#2d3a33] sm:text-6xl">
              Turn scattered thoughts into publish-ready content with a visual
              map.
            </h1>
            <p className="mt-5 max-w-[640px] text-base text-[#5f6861] sm:text-lg">
              MayDove helps founders, marketers, and builders move from one core
              idea to structured content in a single workspace. Map your
              thinking, generate LinkedIn, Facebook and Instagram drafts per
              node, and keep every post connected to its source context.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/new"
                className="rounded-full bg-[#6e8b73] px-6 py-3 text-sm font-semibold text-white shadow-2 hover:bg-[#5c7961]"
              >
                Start your first map
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-[#d4d0c4] bg-white/80 px-6 py-3 text-sm font-semibold text-[#2d3a33] hover:bg-white"
              >
                See the workspace
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-[#d4d0c4] bg-white/85 p-6 shadow-2 backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#687269]">
              MVP includes
            </div>
            <ul className="mt-4 space-y-3 text-sm text-[#5f6861]">
              {[
                "Create a central idea node in seconds",
                "Expand branches visually with connected context",
                "Generate LinkedIn, Facebook, and Instagram drafts per node",
                "Regenerate variations without losing structure",
                "Reuse and keep editing maps over time",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-[#e1ddd2] bg-white px-4 py-3"
                >
                  <span className="font-semibold text-[#2d3a33]">•</span> {item}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <LandingFlowDemo />

        <section className="mt-12">
          <div className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#687269]">
            Why teams join
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Map-first clarity",
                body: "The visual graph is the source of truth, so strategy, ideas, and content stay aligned.",
              },
              {
                title: "Faster publishing loop",
                body: "Generate social drafts directly from idea nodes instead of rebuilding context each time.",
              },
              {
                title: "Iterate with memory",
                body: "Return to existing maps, regenerate options, and keep improving without starting over.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-[#d4d0c4] bg-white/90 p-5 shadow-1"
              >
                <h2 className="text-lg font-semibold text-[#2d3a33]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-[#5f6861]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#d4d0c4] bg-white/90 p-6 shadow-2">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#687269]">
            How it works
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              [
                "01",
                "Capture the core idea",
                "Start from one central node and define the main message.",
              ],
              [
                "02",
                "Expand supporting branches",
                "Add sub-ideas, angles, objections, and proof points visually.",
              ],
              [
                "03",
                "Generate and refine content",
                "Create LinkedIn, Facebook and Instagram  drafts and regenerate variations quickly.",
              ],
            ].map(([step, title, body]) => (
              <div
                key={step}
                className="rounded-2xl border border-[#e1ddd2] bg-[#f9f8f4] p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a938b]">
                  {step}
                </div>
                <div className="mt-2 text-base font-semibold text-[#2d3a33]">
                  {title}
                </div>
                <p className="mt-2 text-sm text-[#5f6861]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#2d3a33]/10 bg-[#2d3a33] p-8 text-white shadow-2">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d3ddd2]">
              Join the platform
            </div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Build your next content system around ideas, not chaos.
            </h2>
            <p className="mt-3 text-sm text-[#d5ddd6] sm:text-base">
              This MVP is designed for creators and teams who need a faster path
              from thought to publish-ready output. Start free, map your first
              campaign, and invite your workflow into a more visual process.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-[#a4be8c] px-6 py-3 text-sm font-semibold text-[#1f2923] hover:bg-[#95af7e]"
              >
                Join and create a map
              </Link>
              <Link
                href="#demo"
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Preview platform
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
