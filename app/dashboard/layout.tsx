import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Dashboard Nav */}
      <nav className="bg-bg-secondary border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-bold text-white">
            Pocket<span className="text-accent">CFO</span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/dashboard" className="text-white font-semibold">
              Dashboard
            </Link>
            <Link href="/dashboard/settings" className="text-text-secondary hover:text-white transition-colors">
              Settings
            </Link>
          </div>

          {/* Log Out */}
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-text-secondary hover:text-white transition-colors border border-white/10 rounded-lg px-4 py-2 hover:border-white/30"
            >
              Log Out
            </button>
          </form>
        </div>
      </nav>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}
