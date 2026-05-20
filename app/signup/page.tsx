import Link from 'next/link'
import { signup } from '@/app/actions/auth'

const errorMessages: Record<string, string> = {
  passwords_mismatch: 'Passwords do not match.',
  password_too_short: 'Password must be at least 8 characters.',
  email_exists: 'An account with this email already exists. Log in instead.',
  unknown: 'Something went wrong. Please try again.',
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const errorMessage = params.error ? errorMessages[params.error] : null

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-white">
            Pocket<span className="text-accent">CFO</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white mb-2">
            Create your free account
          </h1>
          <p className="text-text-secondary text-sm mb-8">
            First month completely free — no credit card needed
          </p>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          <form action={signup} className="space-y-4">
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

            <div>
              <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-text-secondary mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="Repeat your password"
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-2"
            >
              Start My Free Month →
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Log in →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
