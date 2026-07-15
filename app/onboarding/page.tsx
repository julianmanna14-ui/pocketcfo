import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from './onboarding-flow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // If they already have an analysis, skip onboarding
  const { data: analysis } = await supabase
    .from('analyses')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (analysis) redirect('/dashboard')

  return <OnboardingFlow />
}
