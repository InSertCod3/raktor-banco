'use client';

import React from 'react';
import Link from 'next/link';
import BackgroundGrid from '../components/BackgroundGrid';

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out the platform',
    features: [
      '2 Mind Maps',
      '8 Generations per week',
      'LinkedIn, Facebook, Instagram',
      'Basic content generation',
    ],
    buttonText: 'Current Plan',
    buttonClass: 'bg-[#d4d0c4] text-[#5f6861] cursor-not-allowed',
    popular: false,
  },
  {
    name: 'Creator',
    price: '$19',
    period: '/month',
    description: 'For content creators and solopreneurs',
    features: [
      'Unlimited Mind Maps',
      '200 Generations per month',
      'All platforms',
      'Priority support',
    ],
    buttonText: 'Get Started',
    buttonClass: 'bg-[#6e8b73] text-white hover:bg-[#5c7961]',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$59',
    period: '/month',
    description: 'For founders and serious builders',
    features: [
      'Unlimited Mind Maps',
      '500 Generations per month',
      'All platforms',
      'Priority support',
      'Early access to new features',
    ],
    buttonText: 'Get Started',
    buttonClass: 'bg-[#2d3a33] text-white hover:bg-[#243029]',
    popular: false,
  },
];

const faqs = [
  {
    question: 'What counts as a generation?',
    answer: 'Each time you generate content (LinkedIn post, Facebook post, Instagram caption, or suggestions), it counts as one generation. Regenerating content also counts as a new generation.',
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any payments.',
  },
  {
    question: 'What happens if I exceed my limits?',
    answer: 'You\'ll see a message indicating you\'ve reached your limit with an option to upgrade. Your existing content and maps remain accessible.',
  },
];

export default function PricingPage() {
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
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#687269]">
            MayDove
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Link
              href="/"
              className="rounded-full border border-[#d4d0c4] bg-white/80 px-4 py-2 font-semibold uppercase tracking-wide text-[#2d3a33] hover:bg-white"
            >
              Back to home
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#2d3a33] px-5 py-2 font-semibold uppercase tracking-wide text-white shadow-2 hover:bg-[#243029]"
            >
              Join now
            </Link>
          </div>
        </header>

        {/* Pricing Title */}
        <section className="mt-12 text-center">
          <div className="inline-flex items-center rounded-full border border-[#d4d0c4] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2d3a33]">
            Simple, Transparent Pricing
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#2d3a33] sm:text-6xl">
            Choose your plan
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base text-[#5f6861] sm:text-lg">
            Start free and upgrade as your content needs grow. No hidden fees, cancel anytime.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border bg-white/90 p-6 shadow-2 ${
                plan.popular
                  ? 'border-[#6e8b73] ring-2 ring-[#6e8b73]/20'
                  : 'border-[#d4d0c4]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6e8b73] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Most Popular
                </div>
              )}

              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#687269]">
                {plan.name}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-[#2d3a33]">{plan.price}</span>
                <span className="text-sm text-[#5f6861]">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-[#5f6861]">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[#5f6861]">
                    <span className="mt-0.5 text-[#6e8b73]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`mt-6 w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wide ${plan.buttonClass}`}
                disabled={plan.name === 'Free'}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </section>

        {/* Comparison Table */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-[#2d3a33]">Detailed comparison</h2>
          
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-[#d4d0c4]">
                  <th className="py-3 text-left font-semibold text-[#2d3a33]">Feature</th>
                  <th className="py-3 text-center font-semibold text-[#2d3a33]">Free</th>
                  <th className="py-3 text-center font-semibold text-[#2d3a33]">Creator</th>
                  <th className="py-3 text-center font-semibold text-[#2d3a33]">Pro</th>
                </tr>
              </thead>
              <tbody className="text-[#5f6861]">
                <tr className="border-b border-[#e1ddd2]">
                  <td className="py-3">Mind Maps</td>
                  <td className="py-3 text-center">2</td>
                  <td className="py-3 text-center">Unlimited</td>
                  <td className="py-3 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-[#e1ddd2]">
                  <td className="py-3">Generations per month</td>
                  <td className="py-3 text-center">~32 (8/week)</td>
                  <td className="py-3 text-center">200</td>
                  <td className="py-3 text-center">500</td>
                </tr>
                <tr className="border-b border-[#e1ddd2]">
                  <td className="py-3">Platforms</td>
                  <td className="py-3 text-center">LinkedIn, Facebook, Instagram</td>
                  <td className="py-3 text-center">All</td>
                  <td className="py-3 text-center">All</td>
                </tr>
                <tr className="border-b border-[#e1ddd2]">
                  <td className="py-3">Priority Support</td>
                  <td className="py-3 text-center">—</td>
                  <td className="py-3 text-center">✓</td>
                  <td className="py-3 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-3">Early Access to Features</td>
                  <td className="py-3 text-center">—</td>
                  <td className="py-3 text-center">—</td>
                  <td className="py-3 text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-[#2d3a33]">Frequently Asked Questions</h2>
          
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-[#d4d0c4] bg-white/80 p-5">
                <h3 className="font-semibold text-[#2d3a33]">{faq.question}</h3>
                <p className="mt-2 text-sm text-[#5f6861]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 rounded-3xl border border-[#2d3a33]/10 bg-[#2d3a33] p-8 text-white shadow-2">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Ready to scale your content?
            </h2>
            <p className="mt-3 text-sm text-[#d5ddd6] sm:text-base">
              Join thousands of creators who have transformed their content workflow with MayDove.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/new"
                className="rounded-full bg-[#a4be8c] px-6 py-3 text-sm font-semibold text-[#1f2923] hover:bg-[#95af7e]"
              >
                Start creating
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
