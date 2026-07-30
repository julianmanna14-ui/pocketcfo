import Link from 'next/link'
import { login } from '@/app/actions/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const hasError = params.error === 'invalid_credentials'

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
          <h1 className="text-2xl font-black text-white mb-8">
            Welcome back
          </h1>

          {hasError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">Invalid email or password.</p>
            </div>
          )}

          <form action={login} className="space-y-4">
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
                placeholder="Your password"
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-2"
            >
              Log In →
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up free →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
