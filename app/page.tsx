import Link from "next/link";
import { type Metadata } from "next";
import BackgroundGrid from "./components/BackgroundGrid";
import LandingFlowDemo from "./components/LandingFlowDemo";
import FloatingBalls from "./components/FloatingBalls";

export const metadata: Metadata = {
  title: "MayDove - Visual Content Planning for LinkedIn, Facebook & Instagram",
  description:
    "Turn scattered thoughts into publish-ready content with a visual mind map. Generate platform-specific posts from idea nodes. Built for founders and marketers who need speed.",
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
      <FloatingBalls />
      <div id="ball-container" className="pointer-events-none absolute inset-0 overflow-hidden"></div>
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
              href="/signup"
              className="rounded-full bg-[#2d3a33] px-5 py-2 font-semibold uppercase tracking-wide text-white shadow-2 hover:bg-[#243029]"
            >
              Join now
            </Link>
          </div>
        </header>

        <section className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6e8b73]/30 bg-[#6e8b73]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6e8b73]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6e8b73] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6e8b73]"></span>
              </span>
              Now in public beta
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#2d3a33] sm:text-5xl lg:text-6xl">
              From one idea to <span className="text-[#6e8b73]">dozens of posts</span> in minutes.
            </h1>
            <p className="mt-5 max-w-[560px] text-base text-[#5f6861] sm:text-lg">
              Map your thinking visually. Generate LinkedIn, Facebook, and Instagram drafts directly from idea nodes. No more context-switching or starting from blank pages.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/new"
                className="rounded-full bg-[#6e8b73] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6e8b73]/25 hover:bg-[#5c7961] hover:shadow-xl hover:shadow-[#6e8b73]/30"
              >
                Create your first map
              </Link>
              <Link
                href="#demo"
                className="rounded-full border border-[#d4d0c4] bg-white/80 px-6 py-3 text-sm font-semibold text-[#2d3a33] hover:bg-white"
              >
                See how it works
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-[#8a938b]">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#6e8b73]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span className="font-medium text-[#5f6861]">4.9/5 rating</span>
              </div>
              <div className="h-3 w-px bg-[#d4d0c4]"></div>
              <div>
                <span className="font-medium text-[#5f6861]">2,400+</span> maps created
              </div>
              <div className="h-3 w-px bg-[#d4d0c4]"></div>
              <div>
                <span className="font-medium text-[#5f6861]">LinkedIn</span>, Facebook, Instagram
              </div>
            </div>
          </div>

          <div className="hidden relative mt-8 lg:mt-0 lg:flex xl:flex 2xl:flex">
            <style>{`
              .group-1,
              .group-2,
              .group-3,
              .split-right,
              .split-middle,
              .split-left,
              .isometric-tower-top,
              .isometric-tower-right,
              .isometric-tower-left {
                position: absolute;
                transform-origin: 0 0;
              }

              .isometric-tower-top {
                width: 47px;
                height: 47px;
                background: #4fa0f8;
                transform: rotate(210deg) skewX(-30deg) scaleY(0.864);
              }

              .isometric-tower-right {
                width: 47px;
                height: 139px;
                background: #f99f3e;
                transform: rotate(-30deg) skewX(-30deg) translate(0, -0.1px) scaleY(0.864);
              }

              .isometric-tower-left {
                width: 139px;
                height: 47px;
                background: #4ff8de;
                transform: rotate(90deg) skewX(-30deg) scaleY(0.864) translate(-0.5px, 0);
              }

              .tower-1, .tower-4, .tower-7 {
                top: -46px;
                left: 80px;
              }

              .tower-2, .tower-5, .tower-8 {
                top: -23px;
                left: 40px;
              }

              .tower-3, .tower-6, .tower-9 {
                top: 0px;
                left: 0px;
              }

              .group-1 {
                top: 206px;
                left: 163px;
                animation: group-1 5s cubic-bezier(0.68, -0.41, 0.265, 1) infinite;
              }

              .group-2 {
                top: 229px;
                left: 203px;
              }

              .group-3 {
                top: 252px;
                left: 243px;
                animation: group-3 5s cubic-bezier(0.68, -0.41, 0.265, 1) infinite;
              }

              .split-right {
                translate: 0px 0px;
                animation: split-right 5s cubic-bezier(0.68, -0.41, 0.265, 1) infinite;
              }

              .split-middle {
                translate: 0px 0px;
                animation: split-middle 5s cubic-bezier(0.68, -0.41, 0.265, 1) infinite;
              }

              .split-left {
                translate: 0px 0px;
                animation: split-left 5s cubic-bezier(0.68, -0.41, 0.265, 1) infinite;
              }

              @keyframes group-1 {
                0%, 100% { top: 206px; left: 163px; }
                50%, 80% { top: 170px; left: 108px; }
              }

              @keyframes group-3 {
                0%, 100% { top: 252px; left: 243px; }
                50%, 80% { top: 292px; left: 300px; }
              }

              @keyframes split-right {
                0%, 40%, 100% { translate: 0px 0px; }
                50%, 80% { translate: 79px -59px; }
              }

              @keyframes split-middle {
                0%, 40%, 100% { translate: 0px 0px; }
                50%, 80% { translate: 8px -5px; }
              }

              @keyframes split-left {
                0%, 40%, 100% { translate: 0px 0px; }
                50%, 80% { translate: -66px 49px; }
              }
            `}</style>
            <div className="w-full h-[250px] relative justify-center items-center mt-6">
              <div className="group-1">
                <div className="tower-1 split-right">
                  <div className="isometric-tower-top"></div>
                  <div className="isometric-tower-right"></div>
                  <div className="isometric-tower-left"></div>
                </div>
                <div className="tower-2 split-middle">
                  <div className="isometric-tower-top"></div>
                  <div className="isometric-tower-right"></div>
                  <div className="isometric-tower-left"></div>
                </div>
                <div className="tower-3 split-left">
                  <div className="isometric-tower-top"></div>
                  <div className="isometric-tower-right"></div>
                  <div className="isometric-tower-left"></div>
                </div>
              </div>
              <div className="group-2">
                <div className="tower-4 split-right">
                  <div className="isometric-tower-top"></div>
                  <div className="isometric-tower-right"></div>
                  <div className="isometric-tower-left"></div>
                </div>
                <div className="tower-5 split-middle">
                  <div className="isometric-tower-top"></div>
                  <div className="isometric-tower-right"></div>
                  <div className="isometric-tower-left"></div>
                </div>
                <div className="tower-6 split-left">
                  <div className="isometric-tower-top"></div>
                  <div className="isometric-tower-right"></div>
                  <div className="isometric-tower-left"></div>
                </div>
              </div>
              <div className="group-3">
                <div className="tower-7 split-right">
                  <div className="isometric-tower-top"></div>
                  <div className="isometric-tower-right"></div>
                  <div className="isometric-tower-left"></div>
                </div>
                <div className="tower-8 split-middle">
                  <div className="isometric-tower-top"></div>
                  <div className="isometric-tower-right"></div>
                  <div className="isometric-tower-left"></div>
                </div>
                <div className="tower-9 split-left">
                  <div className="isometric-tower-top"></div>
                  <div className="isometric-tower-right"></div>
                  <div className="isometric-tower-left"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingFlowDemo />

        <section className="mt-12">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Map-first clarity",
                body: "The visual graph is the source of truth. Strategy, ideas, and content stay aligned in one place.",
              },
              {
                title: "Faster publishing loop",
                body: "Generate social drafts directly from idea nodes. No more rebuilding context each time.",
              },
              {
                title: "Built for iteration",
                body: "Regenerate variations instantly. Return to existing maps and improve without starting over.",
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

        <section className="mt-16 rounded-3xl border border-[#d4d0c4] bg-white/90 p-6 shadow-2 sm:p-8">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#687269]">
              The problem
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#2d3a33] sm:text-3xl">
              Content creation is fragmented and wasteful
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: "🔄",
                title: "Context switching",
                body: "You switch between notes, docs, and scheduling tools. Every post rebuilds context from scratch.",
              },
              {
                icon: "📝",
                title: "Blank page syndrome",
                body: "Starting from zero for every platform wastes time. The same idea gets reworked repeatedly.",
              },
              {
                icon: "🔗",
                title: "Disconnected strategy",
                body: "Posts live in silos with no connection to the original idea. Strategy gets lost in the noise.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#e1ddd2] bg-[#f9f8f4] p-5"
              >
                <div className="text-2xl">{item.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-[#2d3a33]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#5f6861]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#687269]">
              How it works
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[#2d3a33] sm:text-3xl">
              Visual content planning, end-to-end
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Capture the core idea", "Start from one central node. Define the main message you want to communicate.", "💡"],
              ["02", "Branch out angles", "Add sub-ideas, pain points, proof points. Build your argument visually.", "🌿"],
              ["03", "Generate platform drafts", "One-click LinkedIn, Facebook, and Instagram posts from any node.", "⚡"],
            ].map(([step, title, body, icon]) => (
              <div
                key={step}
                className="relative rounded-2xl border border-[#e1ddd2] bg-[#f9f8f4] p-5"
              >
                <div className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#d4d0c4] bg-white text-lg shadow-sm">
                  {icon}
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a938b]">
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

        <section className="mt-16 rounded-3xl border border-[#2d3a33]/10 bg-[#2d3a33] p-8 text-white shadow-2">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d3ddd2]">
              Start building today
            </div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Ship content faster with visual clarity.
            </h2>
            <p className="mt-3 text-sm text-[#d5ddd6] sm:text-base">
              Join 2,400+ creators who stopped starting from blank pages. Map once, publish everywhere.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-[#a4be8c] px-6 py-3 text-sm font-semibold text-[#1f2923] hover:bg-[#95af7e]"
              >
                Create free account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
