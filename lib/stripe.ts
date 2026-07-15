import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    features: ['CSV & QuickBooks sync', 'AI financial analysis', 'Weekly digest email'],
  },
  pro: {
    name: 'Pro',
    price: 99,
    priceId: process.env.STRIPE_PRICE_PRO!,
    features: ['Everything in Starter', 'AI chat — ask anything', 'Priority support'],
  },
  business: {
    name: 'Business',
    price: 199,
    priceId: process.env.STRIPE_PRICE_BUSINESS!,
    features: ['Everything in Pro', 'Multi-company support', 'Dedicated CFO review'],
  },
} as const

export type PlanKey = keyof typeof PLANS
