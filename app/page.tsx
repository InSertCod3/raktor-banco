import Link from 'next/link';
import BackgroundGrid from './components/BackgroundGrid';

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f4f6f8] font-['Sora'] text-[#1c232b]">
      <BackgroundGrid strokeColor="rgba(28, 35, 43, 0.08)" gridSize={90} strokeWidth={1} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(244,246,248,0.95))]" />
      <div className="pointer-events-none absolute -left-32 top-8 h-80 w-80 rounded-full bg-[#e3ecf8] blur-3xl float-soft" />
      <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-[#e9e3ff] blur-3xl drift" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#f7efe7] blur-3xl pulse-soft" />
      <div className="pointer-events-none absolute left-10 top-1/2 h-40 w-40 rounded-full bg-[#dff6f0] blur-2xl float-soft" />

      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7a8794]">
            Mind Mapper
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#7a8794] md:flex">
            <Link href="#features" className="hover:text-[#1c232b]">Features</Link>
            <Link href="#workflow" className="hover:text-[#1c232b]">Workflow</Link>
            <Link href="#pricing" className="hover:text-[#1c232b]">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="rounded-full border border-[#cfd6de] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#4e5a66] hover:text-[#1c232b]"
            >
              Open App
            </Link>
            <Link
              href="/app"
              className="rounded-full bg-[#1c232b] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#2a3440]"
            >
              Start Mapping
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-12 md:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7dfe7] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#5b6772]">
              Calm. Clear. Visual-first.
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
              A dove-quiet space for bold ideas.
            </h1>
            <p className="mt-4 max-w-[560px] text-base text-[#5b6772]">
              Map your thinking in a gentle, visual flow. Generate LinkedIn and Facebook drafts from any node without breaking the calm.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/app/new"
                className="rounded-full bg-gradient-to-r from-[#2f3b46] to-[#3b4b60] px-6 py-3 text-sm font-semibold text-white shadow-2 transition hover:from-[#3a4652] hover:to-[#4a5a6f]"
              >
                Create your first map
              </Link>
              <Link
                href="/app"
                className="rounded-full border border-[#cfd6de] px-6 py-3 text-sm font-semibold text-[#4e5a66] transition hover:border-[#9fb7d1] hover:text-[#1c232b]"
              >
                Explore the workspace
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#dde4eb] bg-white/80 p-6 shadow-2 backdrop-blur float-soft">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a96a2]">Live preview</div>
                <div className="mt-2 text-lg font-semibold text-[#1c232b]">Map → Idea → Social</div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#cfe7ff] via-[#f6e7ff] to-[#fff1d6]" />
            </div>
            <div className="mt-5 grid gap-3 text-sm text-[#5b6772]">
              <div className="rounded-2xl border border-[#e3e9f0] bg-white px-4 py-3">
                Central idea: “Launch a new product”
              </div>
              <div className="rounded-2xl border border-[#e3e9f0] bg-white px-4 py-3">
                Branch: Audience pain points
              </div>
              <div className="rounded-2xl border border-[#e3e9f0] bg-white px-4 py-3">
                Generated: LinkedIn draft attached
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: 'Visual-first', body: 'Nodes and connections are the source of truth, not chat logs.' },
            { title: 'Reusable maps', body: 'Return to any map, regenerate variations, keep context intact.' },
            { title: 'Platform aware', body: 'Outputs tuned for LinkedIn and Facebook out of the box.' },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-[#e3e9f0] bg-gradient-to-br from-white to-[#f7f7fb] p-6 shadow-1 transition hover:-translate-y-1 hover:shadow-2">
              <div className="text-lg font-semibold text-[#1c232b]">{item.title}</div>
              <p className="mt-2 text-sm text-[#5b6772]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-[#dde4eb] bg-white/80 p-8 shadow-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a96a2]">Workflow</div>
          <div className="mt-2 text-2xl font-semibold text-[#1c232b]">Make ideas shippable in three moves.</div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { step: '01', title: 'Create a central idea', body: 'Start with a single node, expand as you think.' },
              { step: '02', title: 'Branch supporting ideas', body: 'Keep the structure readable and visual.' },
              { step: '03', title: 'Generate social drafts', body: 'Attach outputs to the exact idea they came from.' },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-[#e3e9f0] bg-gradient-to-br from-white to-[#f5f9ff] p-5 transition hover:-translate-y-1 hover:shadow-1">
                <div className="text-xs text-[#9aa6b2]">{item.step}</div>
                <div className="mt-2 text-base font-semibold text-[#1c232b]">{item.title}</div>
                <p className="mt-2 text-sm text-[#5b6772]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a96a2]">Pricing</div>
            <h2 className="mt-2 text-3xl font-semibold text-[#1c232b]">Built for MVP speed.</h2>
          </div>
          <Link
            href="/app/new"
            className="rounded-full bg-[#1c232b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2a3440]"
          >
            Start free mapping
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { name: 'Starter', price: '$0', body: 'Perfect for exploring your first map.' },
            { name: 'Launch', price: '$29', body: 'Unlimited maps and generations.' },
            { name: 'Studio', price: 'Contact', body: 'Custom workflows and support.' },
          ].map((item) => (
            <div key={item.name} className="rounded-3xl border border-[#e3e9f0] bg-gradient-to-br from-white to-[#f7f4ff] p-6 shadow-1 transition hover:-translate-y-1 hover:shadow-2">
              <div className="text-sm text-[#7a8794]">{item.name}</div>
              <div className="mt-3 text-3xl font-semibold text-[#1c232b]">{item.price}</div>
              <p className="mt-2 text-sm text-[#5b6772]">{item.body}</p>
              <button
                type="button"
                className="mt-5 w-full rounded-full border border-[#d7dfe7] bg-white py-2 text-sm font-semibold text-[#3a4652] transition hover:border-[#b7c7d8] hover:bg-[#f0f7ff]"
              >
                Choose {item.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#dde4eb] pb-10 pt-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-[#7a8794]">
          <span>Mind Mapper • Visual-first ideation</span>
          <div className="flex items-center gap-4">
            <Link href="/app" className="hover:text-[#1c232b]">Open App</Link>
            <Link href="/app/new" className="hover:text-[#1c232b]">New map</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
