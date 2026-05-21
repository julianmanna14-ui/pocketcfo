import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-white/5 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white">
          Pocket<span className="text-accent">CFO</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>

        {/* Tagline */}
        <p className="text-text-secondary text-sm text-center md:text-right">
          Your AI CFO works 24/7 to make sure your business keeps every dollar it earns.
        </p>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5">
        <p className="text-text-secondary text-xs text-center">
          © 2026 PocketCFO. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
