import Link from 'next/link';
import BackgroundGrid from '../components/BackgroundGrid';
import { getOrCreateCurrentUserId } from '@/app/lib/currentUser';
import { getUserSubscriptionTier } from '@/app/lib/usage';
import PricingClient from './PricingClient';
import Image from 'next/image';

export default async function PricingPage() {
  // Get user's subscription tier if logged in
  let subscriptionTier: 'FREE' | 'CREATOR' | 'PRO' | 'AGENCY' = 'FREE';
  
  try {
    const userId = await getOrCreateCurrentUserId();
    if (userId) {
      const subscription = await getUserSubscriptionTier(userId);
      if (subscription) {
        subscriptionTier = subscription.tier;
      }
    }
  } catch (error) {
    // User not logged in
    subscriptionTier = 'FREE';
  }

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
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Image
            className="text-xs font-semibold uppercase tracking-[0.28em] text-[#687269]"
            src="/assets/images/logo/maydove_logo_only_w_text.svg"
            alt="logo"
            width={160}
            height={40}
          />
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Link
              href="/"
              className="rounded-full border border-[#d4d0c4] bg-white/80 px-4 py-2 font-semibold uppercase tracking-wide text-[#2d3a33] hover:bg-white hover:shadow-md"
            >
              Back to home
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 font-semibold uppercase tracking-wide text-white shadow-lg shadow-violet-500/30 hover:from-violet-700 hover:to-indigo-700"
            >
              Join now
            </Link>
          </div>
        </header>

        {/* Pass subscription tier to client component */}
        <PricingClient subscriptionTier={subscriptionTier} />
      </div>
    </main>
  );
}
