import { jwtVerify, type JWTPayload } from 'jose'

export interface DecodedToken extends JWTPayload {
  sub: string // user_id
  email: string
  role: string
}

export async function verifySupabaseToken(
  token: string,
  jwksUrl: string,
  jwtSecret: string
): Promise<DecodedToken | null> {
  try {
    // Verify JWT with Supabase JWKS
    const { payload } = await jwtVerify(
      token,
      async () => new TextEncoder().encode(jwtSecret),
      {
        issuer: 'https://supabase.com',
      }
    )

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      ...payload,
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}
