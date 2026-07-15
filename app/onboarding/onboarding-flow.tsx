'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'welcome' | 'connect'

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>('welcome')
  const router = useRouter()

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-6">👋</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            Welcome to PocketCFO
          </h1>
          <p className="text-text-secondary text-lg mb-4 leading-relaxed">
            In the next 60 seconds, your AI CFO will scan your finances and show you exactly where your money is going.
          </p>
          <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="text-accent font-bold">✓</span>
              Finds hidden savings opportunities
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="text-accent font-bold">✓</span>
              Flags unused subscriptions and overpaid vendors
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="text-accent font-bold">✓</span>
              Sends you a digest every Monday — no login needed
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="text-accent font-bold">✓</span>
              Plain English — no finance background required
            </div>
          </div>
          <button
            onClick={() => setStep('connect')}
            className="w-full bg-accent text-bg-primary font-bold text-lg rounded-xl px-8 py-4 hover:opacity-90 transition-opacity"
          >
            Let's find my savings →
          </button>
          <p className="text-text-secondary text-xs mt-4">Takes less than 60 seconds</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
            Connect your financial data
          </h1>
          <p className="text-text-secondary">
            Choose how you want to bring in your numbers. You can add more later.
          </p>
        </div>

        <div className="space-y-4">
          {/* QuickBooks */}
          <a
            href="/api/quickbooks/connect"
            className="flex items-center gap-5 bg-bg-secondary border border-white/10 hover:border-accent/40 rounded-2xl p-6 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#2CA01C]/15 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                <circle cx="16" cy="16" r="14" fill="#2CA01C" />
                <text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Q</text>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">Connect QuickBooks</p>
              <p className="text-text-secondary text-sm">Automatic sync — we pull everything for you</p>
            </div>
            <span className="text-accent text-lg group-hover:translate-x-1 transition-transform">→</span>
          </a>

          {/* CSV Upload */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-5 bg-bg-secondary border border-white/10 hover:border-accent/40 rounded-2xl p-6 transition-colors group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 text-2xl">
              📄
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">Upload a CSV</p>
              <p className="text-text-secondary text-sm">Export from any accounting software and upload</p>
            </div>
            <span className="text-accent text-lg group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Skip */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full text-center text-text-secondary text-sm hover:text-white transition-colors py-3"
          >
            Skip for now — I'll do this later
          </button>
        </div>

        <p className="text-center text-text-secondary text-xs mt-6">
          🔒 Read-only access · We never move money or make changes
        </p>
      </div>
    </div>
  )
}
