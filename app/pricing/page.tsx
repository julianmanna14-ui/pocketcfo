import { PLANS } from '@/lib/stripe'
import { PricingCards } from './pricing-cards'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-text-secondary text-lg">
            Start free. Upgrade when you're ready to save more.
          </p>
        </div>
        <PricingCards plans={PLANS} />
      </div>
    </div>
  )
}
