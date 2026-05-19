export default function Nav() {
  return (
    <nav className="sticky top-[36px] z-40 w-full bg-bg-primary/90 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-white">
          Pocket<span className="text-accent">CFO</span>
        </a>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="#demo"
            className="hidden md:inline-block text-sm text-white border border-white/20 rounded-lg px-4 py-2 hover:border-white/40 transition-colors"
          >
            Book a Demo
          </a>
          <a
            href="#pricing"
            className="text-sm font-semibold bg-accent text-bg-primary rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </nav>
  )
}
