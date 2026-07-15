import { SupabaseClient } from '@supabase/supabase-js'
import { createOAuthClient } from './client'

interface SaveTokensParams {
  supabase: SupabaseClient
  userId: string
  realmId: string
  accessToken: string
  refreshToken: string
  expiresIn: number // seconds
}

/**
 * Save (upsert) QuickBooks tokens to the connections table.
 * Replaces any existing connection for this user.
 */
export async function saveTokens({
  supabase,
  userId,
  realmId,
  accessToken,
  refreshToken,
  expiresIn,
}: SaveTokensParams): Promise<void> {
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  const { error } = await supabase.from('connections').upsert(
    {
      user_id: userId,
      provider: 'quickbooks',
      realm_id: realmId,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    throw new Error(`Failed to save QuickBooks tokens: ${error.message}`)
  }
}

/**
 * Retrieve the stored QuickBooks connection for the current user.
 * Returns null if not connected.
 */
export async function getConnection(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'quickbooks')
    .single()

  if (error || !data) return null
  return data
}

/**
 * Refresh the access token if it has expired and save the new tokens.
 * Returns the (possibly refreshed) access token.
 */
export async function getValidAccessToken(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const connection = await getConnection(supabase, userId)
  if (!connection) return null

  const expiresAt = new Date(connection.token_expires_at).getTime()
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000

  // Return existing token if not expiring soon
  if (expiresAt - now > fiveMinutes) {
    return connection.access_token
  }

  // Refresh the token
  const oauthClient = createOAuthClient()
  oauthClient.setToken({
    access_token: connection.access_token,
    refresh_token: connection.refresh_token,
    realmId: connection.realm_id,
    token_type: 'bearer',
  })

  const authResponse = await oauthClient.refresh()
  const newToken = authResponse.getToken()

  await saveTokens({
    supabase,
    userId,
    realmId: connection.realm_id,
    accessToken: newToken.access_token ?? '',
    refreshToken: newToken.refresh_token ?? connection.refresh_token,
    expiresIn: newToken.expires_in ?? 3600,
  })

  return newToken.access_token ?? null
}
