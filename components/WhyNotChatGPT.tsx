'use client'

import { FadeInUp } from '@/components/FadeInUp'

const comparisons = [
  {
    them: 'You paste your data manually every time',
    us: 'Connects directly to QuickBooks — zero manual work',
  },
  {
    them: 'No memory of your business',
    us: 'Tracks your finances over time, spots trends',
  },
  {
    them: 'Generic answers based on your prompt',
    us: 'Built specifically for SMB financials — knows what to look for',
  },
  {
    them: 'You have to know what questions to ask',
    us: 'Proactively finds problems you didn\'t know to look for',
  },
  {
    them: 'No email alerts — you have to log in every time',
    us: 'Weekly digest lands in your inbox every Monday automatically',
  },
  {
    them: 'Not connected to your real accounts',
    us: 'Live data from QuickBooks, CSV exports, and more',
  },
]

export default function WhyNotChatGPT() {
  return (
    <section id="why-not-chatgpt" className="bg-bg-primary py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeInUp>
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            The honest answer
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            "Can't I just use ChatGPT for this?"
          </h2>
          <p className="text-text-secondary text-lg mb-16 max-w-2xl">
            We get this question a lot. The short answer: ChatGPT and Claude are incredible general tools — but they were not built to run your business finances. Here's the difference:
          </p>
        </FadeInUp>

        <div className="grid md:grid-cols-2 gap-4 mb-16">
          {/* Header */}
          <div className="hidden md:block bg-white/5 rounded-xl px-6 py-3 text-text-secondary text-sm font-semibold uppercase tracking-wide">
            ChatGPT / Claude
          </div>
          <div className="hidden md:block bg-accent/10 rounded-xl px-6 py-3 text-accent text-sm font-semibold uppercase tracking-wide">
            PocketCFO
          </div>

          {comparisons.map((row, i) => (
            <>
              <FadeInUp key={`them-${i}`} delay={i * 0.05}>
                <div className="flex items-start gap-3 bg-bg-secondary border border-white/5 rounded-xl px-5 py-4">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                  <p className="text-text-secondary text-sm">{row.them}</p>
                </div>
              </FadeInUp>
              <FadeInUp key={`us-${i}`} delay={i * 0.05 + 0.025}>
                <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl px-5 py-4">
                  <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
                  <p className="text-white text-sm">{row.us}</p>
                </div>
              </FadeInUp>
            </>
          ))}
        </div>

        <FadeInUp>
          <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white text-xl font-bold mb-2">
              ChatGPT tells you what you ask it.<br />
              PocketCFO tells you what you need to know.
            </p>
            <p className="text-text-secondary text-sm mt-3">
              No prompts. No copy-pasting. No thinking about what to ask. Just answers, every week, in your inbox.
            </p>
          </div>
        </FadeInUp>
      </div>
    </section>
  )
}
