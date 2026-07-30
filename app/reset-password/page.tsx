import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const hasError = params.error === 'failed'

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-white">
            Pocket<span className="text-accent">CFO</span>
          </Link>
        </div>

        <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white mb-8">Set new password</h1>

          {hasError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">Failed to reset password. Please request a new link.</p>
            </div>
          )}

          <form action={resetPassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Update password →
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
