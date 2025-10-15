type HeaderMap = Record<string, string>

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000']

export function getSecurityHeaders(isDev = false): HeaderMap {
  const commonHeaders: HeaderMap = {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }

  if (isDev) {
    // Avoid issues with localhost setups that may not use HTTPS yet.
    delete commonHeaders['Strict-Transport-Security']
  }

  return commonHeaders
}

export function getCorsHeaders(origin: string | null): HeaderMap {
  const allowOrigin = isValidOrigin(origin) ? origin ?? '*' : DEFAULT_ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,Accept,X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  }
}

export function isValidOrigin(origin: string | null): boolean {
  if (!origin) {
    return false
  }

  try {
    const parsed = new URL(origin)
    return DEFAULT_ALLOWED_ORIGINS.includes(parsed.origin)
  } catch {
    return false
  }
}
