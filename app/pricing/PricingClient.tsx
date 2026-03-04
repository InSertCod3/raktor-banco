'use client';

import Link from 'next/link';

type SubscriptionTier = 'FREE' | 'CREATOR' | 'PRO' | 'AGENCY';

const pricingPlans = [
  {
    name: 'Free',
    tier: 'FREE' as SubscriptionTier,
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out the platform',
    features: [
      '2 Mind Maps',
      '8 Generations per week',
      'LinkedIn, Facebook, Instagram',
      'Basic content generation',
      'No Data Node file uploads',
    ],
    buttonClass: 'bg-[#10b981] text-white hover:bg-[#059669] shadow-lg shadow-emerald-500/30',
    popular: false,
  },
  {
    name: 'Creator',
    tier: 'CREATOR' as SubscriptionTier,
    price: '$19',
    period: '/month',
    description: 'For content creators and solopreneurs',
    features: [
      '15 Mind Maps',
      '50 Generations per week',
      'LinkedIn, Facebook, Instagram',
      'Data Node file uploads (JPG, JPEG, PNG, PDF)',
      '1 GB file storage',
      'Priority support',
    ],
    buttonClass: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/30',
    popular: true,
  },
  {
    name: 'Pro',
    tier: 'PRO' as SubscriptionTier,
    price: '$59',
    period: '/month',
    description: 'For founders and serious builders',
    features: [
      '35 Mind Maps',
      '125 Generations per week',
      'LinkedIn, Facebook, Instagram',
      'Data Node file uploads (JPG, JPEG, PNG, PDF)',
      '5 GB file storage',
      'Priority support',
      'Early access to new features',
    ],
    buttonClass: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/30',
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

interface PricingClientProps {
  subscriptionTier: SubscriptionTier;
}

export default function PricingClient({ subscriptionTier }: PricingClientProps) {
  // Check if a plan should be disabled based on user's current subscription
  const isPlanDisabled = (planTier: SubscriptionTier): boolean => {
    const tierHierarchy: Record<SubscriptionTier, number> = {
      'FREE': 0,
      'CREATOR': 1,
      'PRO': 2,
      'AGENCY': 3,
    };

    const userTierLevel = tierHierarchy[subscriptionTier];
    const planTierLevel = tierHierarchy[planTier];

    // Disable if user is on same or higher tier
    return userTierLevel >= planTierLevel;
  };

  const getButtonText = (plan: typeof pricingPlans[0]) => {
    if (plan.tier === 'AGENCY') {
      return 'Contact Us';
    }
    if (isPlanDisabled(plan.tier)) {
      return 'Current Plan';
    }
    return 'Get Started';
  };

  const getButtonClass = (plan: typeof pricingPlans[0]) => {
    if (isPlanDisabled(plan.tier)) {
      return 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none';
    }
    return plan.buttonClass;
  };

  const getButtonHref = (plan: typeof pricingPlans[0]) => {
    if (plan.tier === 'AGENCY') {
      return undefined; // Opens Tidio
    }
    if (isPlanDisabled(plan.tier)) {
      return undefined;
    }
    return '/signup';
  };

  return (
    <>
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
      <section className="mt-12 space-y-6">
        {/* Main plans in 3 columns */}
        <div className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border bg-white/90 p-6 shadow-2 ${
                plan.popular
                  ? 'border-orange-400 ring-2 ring-orange-400/20'
                  : 'border-[#d4d0c4]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-orange-500/30">
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

              <ul className="mt-6 space-y-3 mb-4">
                <hr></hr>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[#5f6861]">
                    <span className="mt-0.5 text-emerald-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                    const tidioChatApi = (window as any).tidioChatApi;
                    if (tidioChatApi) {
                      tidioChatApi.display(true);
                      tidioChatApi.open();
                      tidioChatApi.messageFromVisitor("Hello! I'd like to learn more about the " + plan.name + " plan. Can you help me?");
                    }
                  }}
                className={`mt-auto w-full block rounded-full py-3 text-sm font-semibold uppercase tracking-wide text-center ${getButtonClass(plan)}`}
              >
                {getButtonText(plan)}
              </button>
            </div>
          ))}
        </div>

        {/* Agency plan - full width */}
        <div className="rounded-3xl border border-slate-400 bg-gradient-to-r from-slate-50 to-slate-100 p-8 shadow-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#687269]">
                Agency
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-[#2d3a33]">Custom Pricing</span>
              </div>
              <p className="mt-2 text-base text-[#5f6861]">For agencies and high-volume creators</p>
            </div>
            <div className="flex-1">
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-sm text-[#5f6861]">
                  <span className="text-emerald-500">✓</span> 500+ Mind Maps
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5f6861]">
                  <span className="text-emerald-500">✓</span> 1,000+ Generations per week
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5f6861]">
                  <span className="text-emerald-500">✓</span> LinkedIn, Facebook, Instagram, TikTok
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5f6861]">
                  <span className="text-emerald-500">✓</span> Priority support
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5f6861]">
                  <span className="text-emerald-500">✓</span> Early access to new features
                </li>
              </ul>
            </div>
            <div className="shrink-0">
              {isPlanDisabled('AGENCY') ? (
                <span className="block rounded-full bg-gray-200 px-8 py-4 text-base font-semibold uppercase tracking-wide text-center text-gray-500">
                  Current Plan
                </span>
              ) : (
                <button
                  onClick={() => {
                    const tidioChatApi = (window as any).tidioChatApi;
                    if (tidioChatApi) {
                      tidioChatApi.display(true);
                      tidioChatApi.open();
                    }
                  }}
                  className="block rounded-full bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-4 text-base font-semibold uppercase tracking-wide text-center text-white shadow-lg shadow-slate-500/30 hover:from-slate-800 hover:to-slate-900 cursor-pointer"
                >
                  Contact Us
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-[#2d3a33]">Detailed comparison</h2>
        
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-[#d4d0c4]">
                <th className="py-3 text-left font-semibold text-[#2d3a33]">Feature</th>
                <th className="py-3 text-center font-semibold text-[#2d3a33]">Free</th>
                <th className="py-3 text-center font-semibold text-[#2d3a33]">Creator</th>
                <th className="py-3 text-center font-semibold text-[#2d3a33]">Pro</th>
                <th className="py-3 text-center font-semibold text-[#2d3a33]">Agency</th>
              </tr>
            </thead>
            <tbody className="text-[#5f6861]">
              <tr className="border-b border-[#e1ddd2]">
                <td className="py-3">Mind Maps</td>
                <td className="py-3 text-center">2</td>
                <td className="py-3 text-center">15</td>
                <td className="py-3 text-center">35</td>
                <td className="py-3 text-center">500+</td>
              </tr>
              <tr className="border-b border-[#e1ddd2]">
                <td className="py-3">Generations per week</td>
                <td className="py-3 text-center">8</td>
                <td className="py-3 text-center">50</td>
                <td className="py-3 text-center">125</td>
                <td className="py-3 text-center">1,000</td>
              </tr>
              <tr className="border-b border-[#e1ddd2]">
                <td className="py-3">Platforms</td>
                <td className="py-3 text-center">3</td>
                <td className="py-3 text-center">3</td>
                <td className="py-3 text-center">3</td>
                <td className="py-3 text-center">4</td>
              </tr>
              <tr className="border-b border-[#e1ddd2]">
                <td className="py-3">Data Node File Storage</td>
                <td className="py-3 text-center">—</td>
                <td className="py-3 text-center">1 GB</td>
                <td className="py-3 text-center">5 GB</td>
                <td className="py-3 text-center">Custom</td>
              </tr>
              <tr className="border-b border-[#e1ddd2]">
                <td className="py-3">Priority Support</td>
                <td className="py-3 text-center">—</td>
                <td className="py-3 text-center">✓</td>
                <td className="py-3 text-center">✓</td>
                <td className="py-3 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3">Early Access to Features</td>
                <td className="py-3 text-center">—</td>
                <td className="py-3 text-center">—</td>
                <td className="py-3 text-center">✓</td>
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
              href="/signup"
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600"
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
    </>
  );
}
