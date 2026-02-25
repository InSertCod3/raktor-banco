'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import BackgroundGrid from '../components/BackgroundGrid';
import Image from 'next/image';

function AuthRedirectHandler() {
  const { userId } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (userId) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
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

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f3f1eb] font-['Space_Grotesk']">
      <BackgroundGrid strokeColor="rgba(34, 44, 38, 0.08)" gridSize={86} strokeWidth={1} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(243,241,235,0.95))]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#d8e4d6]/70 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-36 h-96 w-96 rounded-full bg-[#e6ddce]/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-10">
        <section className="w-full rounded-3xl border border-[#d4d0c4] bg-white/85 p-8 shadow-2 backdrop-blur">
          <div className="text-center">
            <Image
              className="text-xs font-semibold uppercase tracking-[0.28em] text-[#687269]"
              src="/assets/images/logo/maydove_logo_only_w_text.svg"
              alt="logo"
              width={160}
              height={40}
            />
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#2d3a33]">
              Welcome back
            </h1>
            <p className="mt-3 text-sm text-[#5f6861]">
              Sign in to continue to your workspace
            </p>
          </div>

          <div className="mt-8">
            <SignedIn>
              <AuthRedirectHandler />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="w-full rounded-full bg-[#2d3a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#243029]"
                >
                  Sign in with Email
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          <p className="mt-6 text-center text-sm text-[#7b847d]">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-[#2d3a33] underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
