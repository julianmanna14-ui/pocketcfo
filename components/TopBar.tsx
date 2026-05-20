export default function TopBar() {
  return (
    <div className="w-full bg-accent text-bg-primary text-sm font-semibold text-center py-2 px-4 sticky top-0 z-50">
      🎉 First month completely free — no credit card, no commitment, no risk.{' '}
      <a href="/signup" className="underline hover:no-underline">
        Start free →
      </a>
    </div>
  )
}
