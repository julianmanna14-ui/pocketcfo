'use client'

import { FadeInUp } from '@/components/FadeInUp'

const pains = [
  {
    icon: '😰',
    title: 'You don\'t know if you\'re actually profitable',
    body: 'Revenue looks fine but cash is always tight. You can\'t tell if it\'s a timing issue, a cost problem, or something worse.',
  },
  {
    icon: '💸',
    title: 'Money disappears and you can\'t find where',
    body: 'Subscriptions, vendor fees, payroll overhead — it adds up to thousands a month. But pulling the data takes hours you don\'t have.',
  },
  {
    icon: '📊',
    title: 'Your accountant tells you what happened, not what to do',
    body: 'They file your taxes. They\'re not watching your expenses every week. Nobody is — until now.',
  },
]

export default function Problem() {
  return (
    <section className="bg-bg-primary py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeInUp>
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Sound familiar?</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-16">
            Running a business is hard enough without your finances being a black box.
          </h2>
        </FadeInUp>

        <div className="grid md:grid-cols-3 gap-6">
          {pains.map((p, i) => (
            <FadeInUp key={p.title} delay={i * 0.1}>
              <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6">
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-white font-bold text-lg mb-3">{p.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{p.body}</p>
              </div>
            </FadeInUp>
          ))}
        </div>

        <FadeInUp delay={0.3}>
          <div className="mt-10 text-center">
            <p className="text-text-secondary text-lg">
              The average SMB has <span className="text-white font-bold">3–5 fixable money problems</span> right now. Most never find them.
            </p>
          </div>
        </FadeInUp>
      </div>
    </section>
  )
}
