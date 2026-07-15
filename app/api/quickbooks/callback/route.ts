import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOAuthClient } from '@/lib/quickbooks/client'
import { saveTokens } from '@/lib/quickbooks/tokens'

export async function GET(request: NextRequest) {
  // 1. Check authentication
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Get query params from callback URL
  const searchParams = request.nextUrl.searchParams
  const realmId = searchParams.get('realmId')
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code || !realmId) {
    const reason = error ?? 'missing_code'
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${reason}`, request.url)
    )
  }

  // 3. Exchange auth code for tokens
  const oauthClient = createOAuthClient()

  let accessToken: string
  let refreshToken: string
  let expiresIn: number

  try {
    const authResponse = await oauthClient.createToken(request.url)
    const token = authResponse.getToken()
    accessToken = token.access_token ?? ''
    refreshToken = token.refresh_token ?? ''
    expiresIn = token.expires_in ?? 3600
  } catch (err) {
    console.error('[qb/callback] token exchange failed:', err)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=token_exchange_failed', request.url)
    )
  }

  // 4. Save tokens to Supabase connections table
  try {
    await saveTokens({
      supabase,
      userId: user.id,
      realmId,
      accessToken,
      refreshToken,
      expiresIn,
    })
  } catch (err) {
    console.error('[qb/callback] save tokens failed:', err)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=save_failed', request.url)
    )
  }

  // 5. Redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
