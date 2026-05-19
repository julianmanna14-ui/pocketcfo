'use client'

import { FadeInUp } from '@/components/FadeInUp'

const features = [
  { icon: '💳', title: 'Subscription Audit', description: 'Finds duplicate, unused, or overpriced SaaS tools you forgot you\'re paying for.' },
  { icon: '🧾', title: 'Expense Analysis', description: 'Flags unusual spending patterns and categories bleeding cash.' },
  { icon: '🤝', title: 'Vendor Contracts', description: 'Compares your rates against market benchmarks and spots renegotiation opportunities.' },
  { icon: '💰', title: 'Cash Flow Gaps', description: 'Identifies timing mismatches between income and payments before they become a crisis.' },
  { icon: '👥', title: 'Payroll Efficiency', description: 'Surfaces overtime patterns, redundant roles, or scheduling inefficiencies.' },
  { icon: '📈', title: 'Revenue Leakage', description: 'Catches unbilled work, missed invoices, and lost revenue hiding in your books.' },
]

const comparisonRows = [
  { human: '$60,000–$120,000/year', ai: 'Starting at $79/month' },
  { human: '+ Health insurance', ai: 'No benefits package' },
  { human: '+ PTO & sick days', ai: 'Never takes a day off' },
  { human: '+ Payroll taxes', ai: 'No payroll taxes' },
  { human: '+ 401K / retirement', ai: 'No retirement contributions' },
  { human: '+ Onboarding & training', ai: 'Live in 60 seconds' },
  { human: 'Works 9–5, takes vacation', ai: 'Runs 24/7, 365 days a year' },
  { human: 'Reviews last month\'s data', ai: 'Real-time, always current' },
  { human: 'Misses patterns in volume', ai: 'Scans every single line' },
]

export default function Features() {
  return (
    <section id="features" className="bg-bg-primary py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">What the AI Looks At</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-16">
          Every dollar. Every line. Nothing hidden.
        </h2>

        {/* Feature cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((f, index) => (
            <FadeInUp key={f.title} delay={index * 0.1}>
              <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6 hover:border-accent/20 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
              </div>
            </FadeInUp>
          ))}
        </div>

        {/* Callout box */}
        <div className="border-l-4 border-accent bg-accent/5 rounded-r-2xl p-6 mb-16">
          <p className="text-white font-medium">
            "Most SMBs have 3–5 fixable cost problems they don't know about. Our AI finds all of them."
          </p>
        </div>

        {/* Hiring comparison table */}
        <div className="overflow-x-auto">
        <div className="bg-bg-secondary border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 bg-white/5">
            <div className="p-4 text-text-secondary text-sm font-semibold uppercase tracking-wide border-r border-white/10">
              Hiring a Bookkeeper / CFO
            </div>
            <div className="p-4 text-accent text-sm font-semibold uppercase tracking-wide">
              PocketCFO AI
            </div>
          </div>

          {comparisonRows.map((row, i) => (
            <div key={i} className="grid grid-cols-2 border-t border-white/5">
              <div className="p-4 text-text-secondary text-sm border-r border-white/5">{row.human}</div>
              <div className="p-4 text-white text-sm">{row.ai}</div>
            </div>
          ))}

          {/* Total row */}
          <div className="grid grid-cols-2 border-t-2 border-white/20 bg-white/5">
            <div className="p-4 text-white font-bold text-sm border-r border-white/10">TRUE COST: $90K–$150K+/yr</div>
            <div className="p-4 text-accent font-bold text-sm">A fraction of that. Daily.</div>
          </div>
        </div>
        </div>

        {/* Anchor callout */}
        <p className="text-center text-accent font-bold text-xl mt-8">
          Get CFO-level insight at 1% of the true cost of hiring.
        </p>
      </div>
    </section>
  )
}
