import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UploadSection } from './upload'
import { QBSyncButton } from './qb-sync'
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

function InsightCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
      {children}
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

  const hasAnalysis = !!analysis
  const hasQB = !!connection

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">
          👋 Welcome, {user.email}
        </h1>
      </div>

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
            <InsightCard icon="💳" title="Savings Opportunities">
              <p className="text-accent text-2xl font-black mb-2">
                {formatCurrency(analysis.savings.total)}/mo
              </p>
              <ul className="space-y-1">
                {analysis.savings.items.slice(0, 4).map((item, i) => (
                  <li key={i} className="text-text-secondary text-xs">
                    • {item.title} — {formatCurrency(item.amount)}
                  </li>
                ))}
              </ul>
            </InsightCard>
          ) : (
            <LockedCard icon="💳" title="Savings Opportunities" />
          )}

          {hasAnalysis && analysis.cash_flow ? (
            <InsightCard icon="💰" title="Cash Flow">
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
              <ul className="space-y-1">
                {analysis.cash_flow.items.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-text-secondary text-xs">
                    • {item.title}
                  </li>
                ))}
              </ul>
            </InsightCard>
          ) : (
            <LockedCard icon="💰" title="Cash Flow" />
          )}

          {hasAnalysis && analysis.revenue ? (
            <InsightCard icon="📈" title="Revenue Leakage">
              <p className="text-accent text-2xl font-black mb-2">
                {formatCurrency(analysis.revenue.recoverable)} recoverable
              </p>
              <ul className="space-y-1">
                {analysis.revenue.items.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-text-secondary text-xs">
                    • {item.title}
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
              <InsightCard icon="📦" title="Subscriptions">
                <p className="text-white text-lg font-bold mb-1">
                  {analysis.subscriptions.total} active · {analysis.subscriptions.unused} unused
                </p>
                <ul className="space-y-1">
                  {analysis.subscriptions.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-text-secondary text-xs">
                      • {item.title} — {formatCurrency(item.amount)}
                    </li>
                  ))}
                </ul>
              </InsightCard>
            )}

            {analysis.vendors && analysis.vendors.issues > 0 && (
              <InsightCard icon="🤝" title="Vendor Costs">
                <p className="text-white text-lg font-bold mb-1">
                  {analysis.vendors.issues} above market rate
                </p>
                <ul className="space-y-1">
                  {analysis.vendors.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-text-secondary text-xs">
                      • {item.title}
                    </li>
                  ))}
                </ul>
              </InsightCard>
            )}

            {analysis.payroll && analysis.payroll.overtime > 0 && (
              <InsightCard icon="👥" title="Payroll">
                <p className="text-accent text-2xl font-black mb-1">
                  {formatCurrency(analysis.payroll.overtime)} overtime
                </p>
                <ul className="space-y-1">
                  {analysis.payroll.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-text-secondary text-xs">
                      • {item.title}
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
