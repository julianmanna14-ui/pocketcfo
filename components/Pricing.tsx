'use client'

import { track } from '@/lib/analytics'

const tiers = [
  {
    name: 'Starter',
    monthlyPrice: 49,
    description: 'Find the leaks before they sink you.',
    features: [
      'CSV & QuickBooks sync',
      'AI financial analysis',
      'Subscription & expense audit',
      'Weekly digest email',
      'Email support',
    ],
    notIncluded: ['AI chat assistant', 'Priority support', 'Multi-company support'],
    cta: 'Get Starter',
    plan: 'starter',
    popular: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 99,
    description: 'Ask questions, get answers, take action.',
    features: [
      'Everything in Starter',
      'AI chat — ask anything about your finances',
      'Cash flow gap detection',
      'Revenue leakage detection',
      'Priority support',
    ],
    notIncluded: ['Multi-company support', 'Dedicated CFO review'],
    cta: 'Get Pro',
    plan: 'pro',
    popular: true,
  },
  {
    name: 'Business',
    monthlyPrice: 199,
    description: 'Full CFO coverage for growing companies.',
    features: [
      'Everything in Pro',
      'Multi-company support',
      'Dedicated CFO review',
      'Custom savings forecasting',
      'Phone + priority support',
    ],
    notIncluded: [],
    cta: 'Get Business',
    plan: 'business',
    popular: false,
  },
]

export default function Pricing() {

  return (
    <section id="pricing" className="bg-bg-primary py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Pricing</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
          Start free. Stay because it pays for itself.
        </h2>
        <p className="text-text-secondary text-lg mb-10">
          Your first month is completely free. No credit card required. Cancel anytime.
        </p>

        <div className="mb-12">
          <span className="text-accent text-sm font-semibold bg-accent/10 px-4 py-2 rounded-full">
            Monthly billing · Cancel anytime
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-bg-secondary rounded-2xl p-8 border flex flex-col ${
                tier.popular ? 'border-accent' : 'border-white/10'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-bg-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-2">{tier.name}</h3>
                <p className="text-text-secondary text-sm mb-4">{tier.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-white text-5xl font-black">${tier.monthlyPrice}</span>
                  <span className="text-text-secondary text-sm mb-2">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white">
                    <span className="text-accent mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
                {tier.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary line-through">
                    <span className="mt-0.5">✕</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/pricing"
                onClick={() => track('cta_click_pricing_trial', { tier: tier.name })}
                className={`text-center font-bold py-3 rounded-xl transition-opacity hover:opacity-90 ${
                  tier.popular
                    ? 'bg-accent text-bg-primary'
                    : 'border border-white/20 text-white hover:border-white/40'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-accent font-bold text-lg">
          Even Pro costs less per month than one day of an employee&apos;s salary.
        </p>
      </div>
    </section>
  )
}
