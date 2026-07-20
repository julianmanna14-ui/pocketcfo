import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UploadSection } from './upload'
import { QBSyncButton } from './qb-sync'
import { UpgradeBanner } from './upgrade-banner'
import type { AnalysisFindings } from '@/lib/ai-analyzer'

interface Analysis {
  id: string
  created_at: string
  summary: string
  savings: AnalysisFindings['savings'] | null
  cash_flow: AnalysisFindings['cash_flow'] | null
  revenue: AnalysisFindings['revenue'] | null
  subscriptions: AnalysisFindings['subscriptions'] | null
  vendors: AnalysisFindings['vendors'] | null
  payroll: AnalysisFindings['payroll'] | null
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`
}

function InsightCard({ icon, title, children, chatPrompt }: { icon: string; title: string; children: React.ReactNode; chatPrompt?: string }) {
  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6 flex flex-col">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
      <div className="flex-1">{children}</div>
      {chatPrompt && (
        <a
          href={`/dashboard/chat?q=${encodeURIComponent(chatPrompt)}`}
          className="mt-4 text-accent text-xs font-semibold hover:underline flex items-center gap-1"
        >
          🤖 Ask AI how to action this →
        </a>
      )}
    </div>
  )
}

function LockedCard({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6 opacity-40 cursor-not-allowed">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
      <p className="text-accent text-2xl font-black mb-1">—</p>
      <p className="text-text-secondary text-xs">Connect to unlock</p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: analysis } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as { data: Analysis | null }

  const { data: connection } = await supabase
    .from('connections')
    .select('provider')
    .eq('user_id', user.id)
    .eq('provider', 'quickbooks')
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const hasAnalysis = !!analysis
  const hasQB = !!connection
  const isSubscribed = !!subscription

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">
          👋 Welcome, {user.email}
        </h1>
      </div>

      {/* Upgrade banner — shown if they have analysis but no subscription */}
      {hasAnalysis && !isSubscribed && analysis?.savings && (
        <UpgradeBanner savings={analysis.savings.total} />
      )}

      {/* Upload / sync section */}
      {hasQB ? (
        <QBSyncButton />
      ) : (
        <UploadSection
          hasAnalysis={hasAnalysis}
          summary={analysis?.summary ?? null}
          lastRun={analysis?.created_at ?? null}
        />
      )}

      {/* Insight cards */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Your Insights</h2>

        {/* Primary cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {hasAnalysis && analysis.savings ? (
            <InsightCard icon="💳" title="Savings Opportunities" chatPrompt={`I have ${formatCurrency(analysis.savings.total)}/mo in savings opportunities including ${analysis.savings.items.slice(0,2).map(i=>i.title).join(' and ')}. What should I tackle first and how?`}>
              <p className="text-accent text-2xl font-black mb-2">
                {formatCurrency(analysis.savings.total)}/mo
              </p>
              <ul className="space-y-2 mb-3">
                {analysis.savings.items.slice(0, 4).map((item, i) => (
                  <li key={i} className="text-xs">
                    <span className="text-text-secondary">• {item.title} — {formatCurrency(item.amount)}</span>
                    <span className="text-accent/70 block pl-3">→ Review and renegotiate or cancel</span>
                  </li>
                ))}
              </ul>
            </InsightCard>
          ) : (
            <LockedCard icon="💳" title="Savings Opportunities" />
          )}

          {hasAnalysis && analysis.cash_flow ? (
            <InsightCard icon="💰" title="Cash Flow" chatPrompt={`My cash flow has a ${formatCurrency(analysis.cash_flow.gap)} gap and status is ${analysis.cash_flow.status}. What steps should I take to fix this?`}>
              <span className={`text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block ${
                analysis.cash_flow.status === 'good' ? 'bg-green-500/20 text-green-400' :
                analysis.cash_flow.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {analysis.cash_flow.status.toUpperCase()}
              </span>
              {analysis.cash_flow.gap > 0 && (
                <p className="text-accent text-2xl font-black mb-2">
                  {formatCurrency(analysis.cash_flow.gap)} gap
                </p>
              )}
              <ul className="space-y-2 mb-3">
                {analysis.cash_flow.items.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-xs">
                    <span className="text-text-secondary">• {item.title}</span>
                    <span className="text-accent/70 block pl-3">→ Adjust payment timing</span>
                  </li>
                ))}
              </ul>
            </InsightCard>
          ) : (
            <LockedCard icon="💰" title="Cash Flow" />
          )}

          {hasAnalysis && analysis.revenue ? (
            <InsightCard icon="📈" title="Revenue Leakage" chatPrompt={`I have ${formatCurrency(analysis.revenue.recoverable)} in recoverable revenue leakage. How do I find and invoice these missed payments?`}>
              <p className="text-accent text-2xl font-black mb-2">
                {formatCurrency(analysis.revenue.recoverable)} recoverable
              </p>
              <ul className="space-y-2 mb-3">
                {analysis.revenue.items.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-xs">
                    <span className="text-text-secondary">• {item.title}</span>
                    <span className="text-accent/70 block pl-3">→ Create and send invoice now</span>
                  </li>
                ))}
              </ul>
            </InsightCard>
          ) : (
            <LockedCard icon="📈" title="Revenue Leakage" />
          )}
        </div>

        {/* Bonus cards — only shown when analysis exists */}
        {hasAnalysis && (
          <div className="grid md:grid-cols-3 gap-6">
            {analysis.subscriptions && (
              <InsightCard icon="📦" title="Subscriptions" chatPrompt={`I have ${analysis.subscriptions.total} active subscriptions and ${analysis.subscriptions.unused} unused. Help me decide which to cut and how to cancel them without losing data.`}>
                <p className="text-white text-lg font-bold mb-1">
                  {analysis.subscriptions.total} active · {analysis.subscriptions.unused} unused
                </p>
                <ul className="space-y-2 mb-3">
                  {analysis.subscriptions.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-xs">
                      <span className="text-text-secondary">• {item.title} — {formatCurrency(item.amount)}</span>
                      <span className="text-accent/70 block pl-3">→ Cancel if unused or consolidate</span>
                    </li>
                  ))}
                </ul>
              </InsightCard>
            )}

            {analysis.vendors && analysis.vendors.issues > 0 && (
              <InsightCard icon="🤝" title="Vendor Costs" chatPrompt={`I have ${analysis.vendors.issues} vendors charging above market rate. Write me a negotiation script to get better pricing from each of them.`}>
                <p className="text-white text-lg font-bold mb-1">
                  {analysis.vendors.issues} above market rate
                </p>
                <ul className="space-y-2 mb-3">
                  {analysis.vendors.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-xs">
                      <span className="text-text-secondary">• {item.title}</span>
                      <span className="text-accent/70 block pl-3">→ Request competing quotes, then renegotiate</span>
                    </li>
                  ))}
                </ul>
              </InsightCard>
            )}

            {analysis.payroll && analysis.payroll.overtime > 0 && (
              <InsightCard icon="👥" title="Payroll" chatPrompt={`I'm spending ${formatCurrency(analysis.payroll.overtime)} on overtime. What scheduling or hiring changes should I make to bring this down?`}>
                <p className="text-accent text-2xl font-black mb-1">
                  {formatCurrency(analysis.payroll.overtime)} overtime
                </p>
                <ul className="space-y-2 mb-3">
                  {analysis.payroll.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-xs">
                      <span className="text-text-secondary">• {item.title}</span>
                      <span className="text-accent/70 block pl-3">→ Adjust scheduling to reduce OT hours</span>
                    </li>
                  ))}
                </ul>
              </InsightCard>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
