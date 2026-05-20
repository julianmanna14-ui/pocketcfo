import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const insightCards = [
  { icon: '💳', title: 'Savings Opportunities', value: '$0', sub: 'Connect to unlock' },
  { icon: '💰', title: 'Cash Flow', value: '—', sub: 'Connect to unlock' },
  { icon: '📈', title: 'Revenue Leakage', value: '—', sub: 'Connect to unlock' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">
          👋 Welcome, {user.email}
        </h1>
      </div>

      {/* Connect banner */}
      <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-8">
        <h2 className="text-white font-bold text-xl mb-2">
          Connect your books to get started
        </h2>
        <p className="text-text-secondary mb-6">
          Your AI CFO is ready — it just needs access to your financials to get to work.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            disabled
            title="Coming soon"
            className="bg-accent/20 text-accent font-semibold px-6 py-3 rounded-xl cursor-not-allowed opacity-60"
          >
            Connect QuickBooks
          </button>
          <button
            disabled
            title="Coming soon"
            className="border border-white/20 text-white/60 font-semibold px-6 py-3 rounded-xl cursor-not-allowed opacity-60"
          >
            Upload CSV
          </button>
        </div>
        <p className="text-text-secondary text-xs mt-4">
          ⚡ Integrations coming in Phase 2
        </p>
      </div>

      {/* Insight cards — locked */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Your Insights</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {insightCards.map((card) => (
            <div
              key={card.title}
              className="bg-bg-secondary border border-white/5 rounded-2xl p-6 opacity-40 cursor-not-allowed"
            >
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="text-white font-bold text-lg mb-1">{card.title}</h3>
              <p className="text-accent text-2xl font-black mb-1">{card.value}</p>
              <p className="text-text-secondary text-xs">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
