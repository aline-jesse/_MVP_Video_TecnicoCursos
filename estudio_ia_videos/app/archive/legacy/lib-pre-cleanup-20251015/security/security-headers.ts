
/**
 * 🛡️ Security Headers Configuration
 * 
 * Headers de segurança recomendados para produção
 */

export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS Protection (legacy)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
    "script-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https://api.elevenlabs.io https://*.speech.microsoft.com wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // HSTS (HTTP Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
} as const

/**
 * Headers para desenvolvimento (mais relaxados)
 */
export const DEV_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'no-referrer-when-downgrade',
} as const

/**
 * Get security headers baseado no ambiente
 */
export function getSecurityHeaders(isDevelopment = false) {
  return isDevelopment ? DEV_SECURITY_HEADERS : SECURITY_HEADERS
}

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  // Origens permitidas
  allowedOrigins: [
    'https://treinx.abacusai.app',
    'https://staging.treinx.abacusai.app',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : []),
  ],
  
  // Métodos permitidos
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  // Headers permitidos
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
  ],
  
  // Headers expostos
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  
  // Credenciais
  credentials: true,
  
  // Max age
  maxAge: 86400, // 24 hours
}

/**
 * Validar origem CORS
 */
export function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false
  return CORS_CONFIG.allowedOrigins.some(allowed => 
    allowed === origin || allowed === '*'
  )
}

/**
 * Get CORS headers
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {}
  
  if (isValidOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin!
    headers['Access-Control-Allow-Methods'] = CORS_CONFIG.allowedMethods.join(', ')
    headers['Access-Control-Allow-Headers'] = CORS_CONFIG.allowedHeaders.join(', ')
    headers['Access-Control-Expose-Headers'] = CORS_CONFIG.exposedHeaders.join(', ')
    headers['Access-Control-Max-Age'] = CORS_CONFIG.maxAge.toString()
    
    if (CORS_CONFIG.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true'
    }
  }
  
  return headers
}
