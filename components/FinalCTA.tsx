'use client'

import { track } from '@/lib/analytics'

export default function FinalCTA() {
  return (
    <section className="relative bg-bg-primary py-32 px-6 overflow-hidden">
      {/* Green glow behind headline */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
          Stop guessing.{' '}
          <span className="text-accent">Start saving.</span>{' '}
          Today.
        </h2>
        <p className="text-text-secondary text-lg mb-10">
          Join hundreds of SMB owners who found money they didn't know they had — in the first week.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="#signup"
            onClick={() => track('cta_click_final_trial')}
            className="bg-accent text-bg-primary font-bold text-lg rounded-xl px-10 py-4 text-center hover:opacity-90 transition-opacity"
          >
            Start My Free Month — No Card Needed
          </a>
          <a
            href="#demo"
            onClick={() => track('cta_click_final_demo')}
            className="border border-white/20 text-white font-semibold text-lg rounded-xl px-10 py-4 text-center hover:border-white/40 transition-colors"
          >
            Book a Demo Instead
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-text-secondary text-sm">
          <span>🔒 Bank-level encryption</span>
          <span>✅ No credit card required</span>
          <span>❌ Cancel anytime</span>
          <span>⚡ Live in 60 seconds</span>
        </div>
      </div>
    </section>
  )
}
