'use client'

import { FadeInUp } from '@/components/FadeInUp'

const steps = [
  {
    number: '01',
    icon: '🔗',
    title: 'Connect Your Books',
    description: 'Link QuickBooks, Xero, FreshBooks, or upload a CSV. Takes 60 seconds.',
  },
  {
    number: '02',
    icon: '🧠',
    title: 'AI Scans Everything',
    description: 'Our agents comb through every transaction, subscription, vendor, and payroll line — nothing gets missed.',
  },
  {
    number: '03',
    icon: '💰',
    title: 'Get Your Savings Report',
    description: 'You receive a plain-English breakdown of exactly where you\'re overspending and what to do about it.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bg-secondary py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">How It Works</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-16">
          From connected to saving in under 5 minutes.
        </h2>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-accent/20" />

          {steps.map((step, index) => (
            <FadeInUp key={step.number} delay={index * 0.15}>
              <div className="relative">
                <div className="w-16 h-16 bg-accent/10 border border-accent/30 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  {step.icon}
                </div>
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Step {step.number}</p>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            </FadeInUp>
          ))}
        </div>

        {/* Stat bar */}
        <div className="mt-16 bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center">
          <p className="text-white text-xl font-bold">
            📊 Average customer saves{' '}
            <span className="text-accent">$2,400/month</span>{' '}
            in the first 90 days
          </p>
        </div>
      </div>
    </section>
  )
}
