'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'Is my financial data safe?',
    answer: 'Yes. We use Bank-level 256-bit encryption. We never sell your data, never share it, and you can delete everything at any time. We connect via read-only access — we can see your numbers but we cannot move money or make any changes.',
  },
  {
    question: 'Which accounting software do you connect with?',
    answer: 'We connect with QuickBooks, Xero, FreshBooks, Wave, Sage, Zoho Books, Gusto, ADP, Paychex, Plaid, Expensify, Ramp, Brex, Shopify, and Stripe. Don\'t see yours? Use our CSV upload or contact us — we\'re adding integrations every month.',
  },
  {
    question: 'How accurate is the AI analysis?',
    answer: 'Our agents flag issues with confidence scores — you always see how certain the AI is before acting on a recommendation. Nothing is hidden or black-box.',
  },
  {
    question: 'What happens after my free month?',
    answer: "You'll get a reminder 5 days before your trial ends. If you choose to continue, you're billed on your chosen plan. If not, no charge — ever.",
  },
  {
    question: 'Do I need an accountant or finance background to use this?',
    answer: 'Not at all. Every report is written in plain English. If the AI finds a problem, it tells you exactly what it is and what to do about it — no jargon.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. No contracts, no cancellation fees, no questions asked.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-white font-semibold">{question}</span>
        <span className="text-accent text-xl ml-4 flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '200px' : '0px' }}
      >
        <p className="text-text-secondary text-sm leading-relaxed pb-5">{answer}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  return (
    <section className="bg-bg-secondary py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Common Questions</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-12">
          Everything you're wondering about.
        </h2>

        <div>
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
