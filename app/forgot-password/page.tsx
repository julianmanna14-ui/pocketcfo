import Link from 'next/link'
import { forgotPassword } from '@/app/actions/auth'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const params = await searchParams
  const sent = params.sent === '1'

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-white">
            Pocket<span className="text-accent">CFO</span>
          </Link>
        </div>

        <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white mb-2">Reset password</h1>
          <p className="text-text-secondary text-sm mb-8">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 text-sm">
              Check your email for a password reset link.
            </div>
          ) : (
            <form action={forgotPassword} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Send reset link →
              </button>
            </form>
          )}

          <p className="text-center text-text-secondary text-sm mt-6">
            Remember it?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Log in →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
