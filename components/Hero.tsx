'use client'

import { useEffect, useState } from 'react'

function SavingsTicker() {
  const [amount, setAmount] = useState(4832441)

  useEffect(() => {
    const interval = setInterval(() => {
      setAmount((prev) => prev + Math.floor(Math.random() * 50 + 10))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-text-secondary mb-8">
      💸 Our AI has found{' '}
      <span className="text-accent font-bold">
        ${amount.toLocaleString()}
      </span>{' '}
      in savings for SMB owners this month
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="relative bg-bg-secondary border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-text-secondary">PocketCFO Dashboard</span>
      </div>
      <div className="space-y-3">
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
          <p className="text-accent text-xs font-semibold uppercase tracking-wide mb-1">⚠ Savings Opportunity Found</p>
          <p className="text-white text-sm font-medium">You're overpaying $840/mo on SaaS subscriptions</p>
          <p className="text-text-secondary text-xs mt-1">3 duplicate tools identified · Renegotiation possible on 2 contracts</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-1">Cash Flow Alert</p>
          <p className="text-white text-sm">$12,400 gap detected in Week 3 of next month</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-1">Revenue Leakage</p>
          <p className="text-white text-sm">2 uninvoiced projects — $3,200 recoverable</p>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="bg-bg-primary min-h-screen flex items-center py-20 px-6">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <div>
          <SavingsTicker />

          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 text-accent text-sm font-medium mb-6">
            ⚡ AI-Powered Financial Analysis
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            You're Losing Money{' '}
            <span className="text-accent">Right Now.</span>{' '}
            We'll Show You Exactly Where.
          </h1>

          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            While you sleep, your AI CFO is finding money you didn't know you had. Connect QuickBooks or Xero in 60 seconds. Our AI scans every expense, subscription, and vendor contract — then shows you exactly how to save.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <a
              href="#pricing"
              className="bg-accent text-bg-primary font-bold text-lg rounded-xl px-8 py-4 text-center hover:opacity-90 transition-opacity"
            >
              Start Free — First Month On Us
            </a>
            <a
              href="#demo"
              className="border border-white/20 text-white font-semibold text-lg rounded-xl px-8 py-4 text-center hover:border-white/40 transition-colors"
            >
              See a Live Demo
            </a>
          </div>

          <p className="text-text-secondary text-sm">
            🔒 Bank-level encryption · No credit card required · Cancel anytime
          </p>
        </div>

        {/* Right: dashboard mockup */}
        <div className="hidden md:block">
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
