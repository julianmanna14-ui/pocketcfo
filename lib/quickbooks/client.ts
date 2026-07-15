import OAuthClient from 'intuit-oauth'

export function createOAuthClient(): OAuthClient {
  return new OAuthClient({
    clientId: process.env.INTUIT_CLIENT_ID!,
    clientSecret: process.env.INTUIT_CLIENT_SECRET!,
    environment: (process.env.INTUIT_ENVIRONMENT as 'sandbox' | 'production') ?? 'sandbox',
    redirectUri: process.env.INTUIT_REDIRECT_URI!,
  })
}
