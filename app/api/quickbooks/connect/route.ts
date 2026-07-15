import { NextRequest, NextResponse } from 'next/server'
import OAuthClient from 'intuit-oauth'
import { createClient } from '@/lib/supabase/server'
import { createOAuthClient } from '@/lib/quickbooks/client'

export async function GET(request: NextRequest) {
  // 1. Check authentication
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Create OAuth client and generate authorization URL
  const oauthClient = createOAuthClient()

  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: crypto.randomUUID(),
  })

  // 3. Redirect user to Intuit consent page
  return NextResponse.redirect(authUri)
}
