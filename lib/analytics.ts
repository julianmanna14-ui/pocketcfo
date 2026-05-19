type EventName =
  | 'cta_click_hero_trial'
  | 'cta_click_hero_demo'
  | 'cta_click_pricing_trial'
  | 'cta_click_final_trial'
  | 'cta_click_final_demo'
  | 'exit_intent_shown'
  | 'exit_intent_dismissed'
  | 'exit_intent_converted'
  | 'pricing_toggle_annual'
  | 'pricing_toggle_monthly'

export function track(event: EventName, properties?: Record<string, string | number>) {
  if (typeof window === 'undefined') return
  // Replace with your analytics provider (e.g., Plausible, PostHog, GA4)
  console.log('[analytics]', event, properties)
}
