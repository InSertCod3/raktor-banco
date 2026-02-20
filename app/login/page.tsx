import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import BackgroundGrid from '../components/BackgroundGrid';

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f3f1eb] font-['Space_Grotesk']">
      <BackgroundGrid strokeColor="rgba(34, 44, 38, 0.08)" gridSize={86} strokeWidth={1} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(243,241,235,0.95))]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#d8e4d6]/70 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-36 h-96 w-96 rounded-full bg-[#e6ddce]/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-[#d4d0c4] bg-white/85 p-6 shadow-2 backdrop-blur sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#687269]">MayDove</div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#2d3a33] sm:text-4xl">
              Welcome back to your visual content workspace.
            </h1>
            <p className="mt-3 text-sm text-[#5f6861] sm:text-base">
              Sign in to access your maps and continue creating content.
            </p>

            <div className="mt-8">
              <SignedIn>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
                  <p className="text-sm text-emerald-800">
                    You are already signed in. Redirecting to dashboard...
                  </p>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="space-y-4">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="w-full rounded-full bg-[#2d3a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#243029]"
                    >
                      Sign in with Email
                    </button>
                  </SignInButton>
                  
                  <div className="relative flex items-center justify-center">
                    <div className="h-px w-full bg-[#d4d0c4]"></div>
                    <span className="absolute px-2 text-xs text-[#9aa39b]">or</span>
                  </div>
                  
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="w-full rounded-full border border-[#d4d0c4] bg-white/90 px-6 py-3 text-sm font-semibold text-[#2d3a33] transition hover:bg-white"
                    >
                      Continue with Google
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
            </div>

            <p className="mt-6 text-xs text-[#7b847d]">
              New to MayDove? <Link href="/signup" className="font-semibold text-[#2d3a33] underline underline-offset-4">Create an account</Link>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
              <Link href="/" className="font-semibold text-[#2d3a33] underline underline-offset-4">
                Back to landing
              </Link>
              <span className="text-[#9aa39b]">•</span>
              <Link href="/dashboard" className="font-semibold text-[#2d3a33] underline underline-offset-4">
                Preview platform
              </Link>
            </div>
          </section>

          <aside className="rounded-3xl border border-[#d4d0c4] bg-white/70 p-6 shadow-1 sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#687269]">What you unlock</div>
            <ul className="mt-4 space-y-3 text-sm text-[#5f6861]">
              {[
                'Visual maps that keep content strategy structured.',
                'Node-level LinkedIn, Facebook and Instagram generation.',
                'Regeneration history without losing context.',
                'Reusable maps for ongoing campaigns.',
                'Usage limits based on your subscription tier.',
              ].map((item) => (
                <li key={item} className="rounded-2xl border border-[#e1ddd2] bg-white px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-[#d4d0c4] bg-[#f9f8f4] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a938b]">Pricing Plans</div>
              <div className="mt-2 space-y-2 text-sm text-[#5f6861]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold">Free Tier:</span> 8 generations/week
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                  <span className="font-semibold">Creator ($19/mo):</span> 200 generations/month
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                  <span className="font-semibold">Pro ($59/mo):</span> 500 generations/month
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
