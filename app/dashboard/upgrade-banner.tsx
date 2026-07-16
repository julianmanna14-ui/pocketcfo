'use client'

import { useState } from 'react'

export function UpgradeBanner({ savings }: { savings: number }) {
  const [loading, setLoading] = useState(false)

  const checkout = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'starter' }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <div className="bg-accent/5 border border-accent/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <p className="text-accent font-bold text-sm uppercase tracking-wide mb-1">
          Your free analysis is ready
        </p>
        <p className="text-white font-black text-xl mb-1">
          We found <span className="text-accent">${savings.toLocaleString()}/mo</span> in savings opportunities
        </p>
        <p className="text-text-secondary text-sm">
          Subscribe to unlock weekly monitoring, AI chat, and digest emails — starting at $49/mo.
        </p>
      </div>
      <button
        onClick={checkout}
        disabled={loading}
        className="flex-shrink-0 bg-accent text-bg-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? 'Loading…' : 'Unlock full access →'}
      </button>
    </div>
  )
}
