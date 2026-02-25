'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignUpButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import BackgroundGrid from '../components/BackgroundGrid';
import Image from 'next/image';

function AuthRedirectHandler() {
  const { userId } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (userId) {
      const timer = setInterval(() => {
        setCountdown((prev: number) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [userId, router]);

  if (!userId) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
      <p className="text-sm text-emerald-800">
        You are already signed in. Redirecting to dashboard in {countdown} seconds...
      </p>
    </div>
  );
}

const benefits = [
  { icon: '🗺️', title: 'Visual Mind Maps', desc: 'Plan content visually with intuitive node-based workflows' },
  { icon: '⚡', title: 'AI-Powered Generation', desc: 'Generate platform-specific content in seconds' },
  { icon: '📱', title: 'Multi-Platform', desc: 'LinkedIn, Facebook & Instagram content from one place' },
  { icon: '🔄', title: 'Easy Regeneration', desc: 'Refine and iterate content without losing context' },
];

const socialProof = [
  { number: '2,500+', label: 'Creators' },
  { number: '50K+', label: 'Posts Generated' },
  { number: '4.9/5', label: 'Rating' },
];

export default function SignupPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f3f1eb] font-['Space_Grotesk']">
      <BackgroundGrid strokeColor="rgba(34, 44, 38, 0.08)" gridSize={86} strokeWidth={1} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(243,241,235,0.95))]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#d8e4d6]/70 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-36 h-96 w-96 rounded-full bg-[#e6ddce]/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#c9d9c5]/50 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Left Column - Form */}
          <section className="rounded-3xl border border-[#d4d0c4] bg-white/90 p-8 shadow-2 backdrop-blur">
            <Image
              className="text-xs font-semibold uppercase tracking-[0.28em] text-[#687269]"
              src="/assets/images/logo/maydove_logo_only_w_text.svg"
              alt="logo"
              width={160}
              height={40}
            />
            
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#2d3a33] sm:text-4xl">
              Start creating content smarter
            </h1>
            <p className="mt-3 text-base text-[#5f6861]">
              Join thousands of creators who've transformed their content workflow
            </p>

            <div className="mt-8">
              <SignedIn>
                <AuthRedirectHandler />
              </SignedIn>

              <SignedOut>
                <div className="space-y-4">
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="w-full rounded-full bg-[#2d3a33] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#243029] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Create Free Account
                    </button>
                  </SignUpButton>
                  
                  <p className="text-center text-xs text-[#9aa39b]">
                    No credit card required • 2-minute setup
                  </p>
                </div>
              </SignedOut>
            </div>

            <p className="mt-6 text-center text-sm text-[#7b847d]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#2d3a33] underline underline-offset-4">
                Sign in
              </Link>
            </p>

            {/* Social Proof Stats */}
            <div className="mt-8 flex justify-center gap-8 border-t border-[#e1ddd2] pt-6">
              {socialProof.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-bold text-[#2d3a33]">{stat.number}</div>
                  <div className="text-xs text-[#9aa39b]">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column - Benefits */}
          <aside className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-[#2d3a33]">
              Why creators love MayDove
            </h2>
            
            <div className="mt-8 space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0f5ef] text-2xl">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2d3a33]">{benefit.title}</h3>
                    <p className="mt-1 text-sm text-[#5f6861]">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="mt-10 rounded-2xl border border-[#d4d0c4] bg-white/70 p-5">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#f59e0b]">★</span>
                ))}
              </div>
              <p className="mt-2 text-sm text-[#5f6861] italic">
                "MayDove cut my content planning time in half. The visual approach makes it so easy to see the big picture while working on individual posts."
              </p>
              <p className="mt-3 text-xs font-semibold text-[#2d3a33]">
                — Sarah Chen, Content Strategist
              </p>
            </div>

            {/* CTA to pricing */}
            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-[#7b847d]">
              <span>Interested in paid plans?</span>
              <Link href="/pricing" className="font-semibold text-[#2d3a33] underline underline-offset-4">
                View pricing
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
