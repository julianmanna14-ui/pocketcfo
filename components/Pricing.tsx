'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'

const tiers = [
  {
    name: 'Starter',
    monthlyPrice: 79,
    description: 'Find problems before they sink you.',
    features: [
      '1 accounting software connection',
      'Monthly AI financial report',
      'Subscription & expense audit',
      'Email support',
      'First month free',
    ],
    notIncluded: ['Vendor benchmarking', 'Cash flow detection', 'Payroll analysis', 'Multi-user access'],
    cta: 'Start Free Month',
    popular: false,
  },
  {
    name: 'Growth',
    monthlyPrice: 149,
    description: 'Monitor and fix problems in real time.',
    features: [
      'Multiple software connections',
      'Real-time AI monitoring',
      'Subscription & expense audit',
      'Vendor contract benchmarking',
      'Cash flow gap detection',
      'Revenue leakage detection',
      'Priority support',
      'First month free',
    ],
    notIncluded: ['Payroll efficiency analysis', 'Multi-user access', 'Quarterly strategy call'],
    cta: 'Start Free Month',
    popular: true,
  },
  {
    name: 'Pro',
    monthlyPrice: 299,
    description: 'Optimize everything + human backup.',
    features: [
      'Everything in Growth',
      'Payroll efficiency analysis',
      'Multi-user access',
      'Custom savings forecasting',
      'Quarterly strategy call',
      'Phone + priority support',
      'First month free',
    ],
    notIncluded: [],
    cta: 'Start Free Month',
    popular: false,
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  const displayPrice = (monthly: number) =>
    annual ? Math.round(monthly * (10 / 12)) : monthly

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

        {/* Monthly / Annual toggle */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => { setAnnual(false); track('pricing_toggle_monthly') }}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${!annual ? 'bg-accent text-bg-primary' : 'text-text-secondary hover:text-white'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => { setAnnual(true); track('pricing_toggle_annual') }}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${annual ? 'bg-accent text-bg-primary' : 'text-text-secondary hover:text-white'}`}
          >
            Annual
          </button>
          {annual && (
            <span className="text-accent text-sm font-semibold bg-accent/10 px-3 py-1 rounded-full">
              2 months free
            </span>
          )}
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
                  <span className="text-white text-5xl font-black">${displayPrice(tier.monthlyPrice)}</span>
                  <span className="text-text-secondary text-sm mb-2">/mo{annual ? ' billed annually' : ''}</span>
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
                href="#signup"
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
