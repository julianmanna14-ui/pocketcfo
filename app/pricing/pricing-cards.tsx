'use client'

import { useState } from 'react'

type Plan = { name: string; price: number; priceId: string; features: readonly string[] }
type Plans = Record<string, Plan>

export function PricingCards({ plans }: { plans: Plans }) {
  const [loading, setLoading] = useState<string | null>(null)

  const checkout = async (plan: string) => {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else if (data.error === 'Unauthorized') window.location.href = '/login'
    } catch {
      setLoading(null)
    }
  }

  const planKeys = Object.keys(plans) as string[]

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {planKeys.map((key) => {
        const plan = plans[key]
        const isPro = key === 'pro'
        return (
          <div
            key={key}
            className={`relative rounded-2xl p-8 border ${
              isPro
                ? 'bg-accent/5 border-accent/40'
                : 'bg-bg-secondary border-white/5'
            }`}
          >
            {isPro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-bg-primary text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}

            <h2 className="text-white font-bold text-xl mb-1">{plan.name}</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">${plan.price}</span>
              <span className="text-text-secondary">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-accent mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => checkout(key)}
              disabled={loading === key}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
                isPro
                  ? 'bg-accent text-bg-primary hover:opacity-90'
                  : 'border border-white/20 text-white hover:border-white/50'
              }`}
            >
              {loading === key ? 'Redirecting…' : `Get ${plan.name}`}
            </button>
          </div>
        )
      })}
    </div>
  )
}
