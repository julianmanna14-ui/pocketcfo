const testimonials = [
  {
    quote: 'Within the first week, the AI found $1,200/month in overlapping software subscriptions we completely forgot about. That\'s $14,400 back in our pocket every year.',
    name: 'Marcus T.',
    role: 'Restaurant Owner',
    saved: 'Saved $14,400/yr',
  },
  {
    quote: 'I was overpaying three vendors by 20–30% compared to market rates. The AI flagged it with exact numbers. I renegotiated two contracts the same week.',
    name: 'Lisa R.',
    role: 'Retail Boutique Owner',
    saved: 'Saved $8,600/yr',
  },
  {
    quote: 'It found unbilled work from the past 6 months I never invoiced. Found $4,000 in revenue I just left on the table. Paid for itself in day one.',
    name: 'James K.',
    role: 'Freelance Contractor',
    saved: 'Recovered $4,000',
  },
]

const stats = [
  { value: '$2,400/mo', label: 'Average savings' },
  { value: '3–5 issues', label: 'Found per business' },
  { value: '60 seconds', label: 'To get started' },
]

export default function SocialProof() {
  return (
    <section className="bg-bg-secondary py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Real Businesses. Real Savings.</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-16">
          SMB owners found money they didn't know they had.
        </h2>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-bg-primary border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-accent text-lg">★</span>
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">"{t.quote}"</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-text-secondary text-xs">{t.role}</p>
                </div>
                <span className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full">
                  {t.saved}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-accent text-3xl md:text-4xl font-black mb-2">{s.value}</p>
              <p className="text-text-secondary text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
