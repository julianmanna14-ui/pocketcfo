import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getConnection } from '@/lib/quickbooks/tokens'
import { SendDigestButton } from './digest-button'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const connection = user ? await getConnection(supabase, user.id) : null
  const isConnected = !!connection

  const errorMessages: Record<string, string> = {
    missing_code: 'Authorization was cancelled or failed. Please try again.',
    token_exchange_failed: 'Failed to exchange authorization code. Please try again.',
    save_failed: 'Failed to save your QuickBooks connection. Please try again.',
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Error banner */}
      {error && errorMessages[error] && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {errorMessages[error]}
        </div>
      )}

      {/* Weekly Digest Card */}
      <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-white font-semibold">Weekly Digest</h2>
            <p className="text-text-secondary text-sm mt-0.5">
              Every Monday at 9am we send a financial summary to your email.
            </p>
          </div>
          <span className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">
            Active
          </span>
        </div>
        <div className="mt-6">
          <SendDigestButton />
        </div>
      </div>

      {/* QuickBooks Connection Card */}
      <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* QuickBooks logo placeholder */}
            <div className="w-10 h-10 rounded-lg bg-[#2CA01C]/15 flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <circle cx="16" cy="16" r="14" fill="#2CA01C" />
                <text
                  x="16"
                  y="21"
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  Q
                </text>
              </svg>
            </div>

            <div>
              <h2 className="text-white font-semibold">QuickBooks Online</h2>
              <p className="text-text-secondary text-sm mt-0.5">
                Connect your QuickBooks account to enable financial analysis
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
              isConnected
                ? 'bg-green-500/15 text-green-400'
                : 'bg-white/5 text-text-secondary'
            }`}
          >
            {isConnected ? 'Connected' : 'Not connected'}
          </span>
        </div>

        {/* Connection details */}
        {isConnected && connection && (
          <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-secondary">Company ID (Realm)</p>
              <p className="text-white font-mono mt-0.5">{connection.realm_id}</p>
            </div>
            <div>
              <p className="text-text-secondary">Connected</p>
              <p className="text-white mt-0.5">
                {new Date(connection.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="mt-6">
          {isConnected ? (
            <Link
              href="/api/quickbooks/connect"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-4 py-2 transition-colors"
            >
              Reconnect QuickBooks
            </Link>
          ) : (
            <Link
              href="/api/quickbooks/connect"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg px-5 py-2.5 transition-colors"
            >
              Connect QuickBooks
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
