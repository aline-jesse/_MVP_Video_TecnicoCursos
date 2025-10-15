
/**
 * 🛡️ Rate Limiter Production-Ready
 * Proteção contra spam e ataques DDoS
 */

import { NextRequest, NextResponse } from 'next/server'
import { productionLogger as logger, metricsCollector } from './logger'

// Configurações de rate limiting
interface RateLimitConfig {
  windowMs: number // Janela de tempo em ms
  maxRequests: number // Máximo de requests por janela
  keyGenerator?: (req: NextRequest) => string // Gerador de chave customizado
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
  statusCode?: number
}

// Storage em memória para rate limiting
class MemoryStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map()
  
  // Limpar registros expirados periodicamente
  constructor() {
    setInterval(() => {
      const now = Date.now()
      for (const [key, data] of this.store.entries()) {
        if (now > data.resetTime) {
          this.store.delete(key)
        }
      }
    }, 60000) // Limpar a cada 1 minuto
  }
  
  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now()
    const resetTime = now + windowMs
    
    const existing = this.store.get(key)
    
    if (!existing || now > existing.resetTime) {
      // Nova janela
      const data = { count: 1, resetTime }
      this.store.set(key, data)
      return data
    } else {
      // Incrementar na janela atual
      existing.count++
      this.store.set(key, existing)
      return existing
    }
  }
  
  get(key: string): { count: number; resetTime: number } | undefined {
    const data = this.store.get(key)
    if (data && Date.now() <= data.resetTime) {
      return data
    }
    return undefined
  }
  
  reset(key: string): void {
    this.store.delete(key)
  }
  
  // Estatísticas
  getStats() {
    return {
      totalKeys: this.store.size,
      activeKeys: Array.from(this.store.values()).filter(
        data => Date.now() <= data.resetTime
      ).length
    }
  }
}

const store = new MemoryStore()

// Rate Limiter principal
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => getClientIP(req),
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later',
    statusCode = 429
  } = config
  
  return async (req: NextRequest): Promise<NextResponse | null> => {
    try {
      const key = keyGenerator(req)
      const { count, resetTime } = store.increment(key, windowMs)
      
      // Headers de rate limiting
      const headers = new Headers()
      headers.set('X-RateLimit-Limit', maxRequests.toString())
      headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - count).toString())
      headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
      
      if (count > maxRequests) {
        // Rate limit excedido
        logger.warn('Rate limit exceeded', {
          ip: key,
          count,
          limit: maxRequests,
          windowMs,
          userAgent: req.headers.get('user-agent'),
          url: req.url
        })
        
        metricsCollector.increment('rate_limit_exceeded', 1, { ip: key })
        
        headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString())
        
        return new NextResponse(JSON.stringify({ error: message }), {
          status: statusCode,
          headers
        })
      }
      
      // Log de requests próximos ao limite
      if (count > maxRequests * 0.8) {
        logger.info('Rate limit warning', {
          ip: key,
          count,
          limit: maxRequests,
          remaining: maxRequests - count
        })
      }
      
      // Continuar com a request
      return null
      
    } catch (error: any) {
      logger.error('Rate limiter error', { error: error.message })
      return null // Permitir request em caso de erro
    }
  }
}

// Obter IP do cliente
function getClientIP(req: NextRequest): string {
  // Tentar vários headers possíveis
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip',
    'true-client-ip'
  ]
  
  for (const header of possibleHeaders) {
    const value = req.headers.get(header)
    if (value) {
      // Pegar primeiro IP se houver lista
      const ip = value.split(',')[0].trim()
      if (ip && ip !== 'unknown') {
        return ip
      }
    }
  }
  
  // Fallback para IP genérico
  return 'unknown'
}

// Rate limiters pré-configurados
export const rateLimiters = {
  // API geral - 100 requests por minuto
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100
  }),
  
  // Upload - 10 uploads por minuto
  upload: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Too many upload attempts, please wait before uploading again'
  }),
  
  // Geração de vídeo - 5 por minuto
  videoGeneration: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: 'Too many video generation requests, please wait before generating more videos'
  }),
  
  // TTS - 20 requests por minuto
  tts: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 20,
    message: 'Too many text-to-speech requests, please wait'
  }),
  
  // Talking Photo - 3 por minuto
  talkingPhoto: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 3,
    message: 'Too many talking photo requests, please wait before generating more'
  }),
  
  // Login - 5 tentativas por 15 minutos
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    message: 'Too many login attempts, please try again later'
  }),
  
  // Strict - Para endpoints sensíveis - 10 por hora
  strict: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,
    message: 'Rate limit exceeded for this sensitive endpoint'
  })
}

// Middleware para aplicar rate limiting automaticamente
export function withRateLimit(rateLimiter: (req: NextRequest) => Promise<NextResponse | null>) {
  return async (req: NextRequest, context?: any) => {
    const rateLimitResponse = await rateLimiter(req)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    // Continuar para o próximo handler se não houver rate limiting
    return null
  }
}

// Rate limiter por usuário (requer autenticação)
export function createUserRateLimit(config: RateLimitConfig) {
  return createRateLimiter({
    ...config,
    keyGenerator: (req) => {
      // Tentar obter user ID do token/session
      const authorization = req.headers.get('authorization')
      if (authorization) {
        try {
          // Implementar extração de user ID do token
          return `user:${authorization.slice(0, 10)}`
        } catch {
          // Fallback para IP
          return `ip:${getClientIP(req)}`
        }
      }
      return `ip:${getClientIP(req)}`
    }
  })
}

// Sistema de whitelist/blacklist
class IPManager {
  private whitelist: Set<string> = new Set()
  private blacklist: Set<string> = new Set()
  
  // Adicionar à whitelist
  addToWhitelist(ip: string) {
    this.whitelist.add(ip)
    logger.info('IP added to whitelist', { ip })
  }
  
  // Adicionar à blacklist
  addToBlacklist(ip: string) {
    this.blacklist.add(ip)
    logger.warn('IP added to blacklist', { ip })
  }
  
  // Remover da whitelist
  removeFromWhitelist(ip: string) {
    this.whitelist.delete(ip)
    logger.info('IP removed from whitelist', { ip })
  }
  
  // Remover da blacklist
  removeFromBlacklist(ip: string) {
    this.blacklist.delete(ip)
    logger.info('IP removed from blacklist', { ip })
  }
  
  // Verificar se IP está na whitelist
  isWhitelisted(ip: string): boolean {
    return this.whitelist.has(ip)
  }
  
  // Verificar se IP está na blacklist
  isBlacklisted(ip: string): boolean {
    return this.blacklist.has(ip)
  }
  
  // Obter listas
  getWhitelist(): string[] {
    return Array.from(this.whitelist)
  }
  
  getBlacklist(): string[] {
    return Array.from(this.blacklist)
  }
}

export const ipManager = new IPManager()

// Middleware de segurança para IPs
export function createIPSecurityMiddleware() {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const ip = getClientIP(req)
    
    // Verificar blacklist
    if (ipManager.isBlacklisted(ip)) {
      logger.warn('Blocked request from blacklisted IP', { ip, url: req.url })
      
      return new NextResponse(JSON.stringify({ 
        error: 'Access denied' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Se estiver na whitelist, não aplicar rate limiting
    if (ipManager.isWhitelisted(ip)) {
      logger.debug('Request from whitelisted IP', { ip })
      return null
    }
    
    return null
  }
}

// Auto-blacklist para IPs suspeitos
class AutoBlacklist {
  private suspiciousActivity: Map<string, { count: number; lastActivity: number }> = new Map()
  
  // Reportar atividade suspeita
  reportSuspiciousActivity(ip: string, reason: string) {
    const now = Date.now()
    const existing = this.suspiciousActivity.get(ip) || { count: 0, lastActivity: now }
    
    existing.count++
    existing.lastActivity = now
    this.suspiciousActivity.set(ip, existing)
    
    logger.warn('Suspicious activity reported', { ip, reason, count: existing.count })
    
    // Auto-blacklist após 5 atividades suspeitas em 1 hora
    if (existing.count >= 5 && now - existing.lastActivity < 60 * 60 * 1000) {
      ipManager.addToBlacklist(ip)
      logger.error('IP auto-blacklisted for suspicious activity', { ip, count: existing.count })
      
      // Limpar do tracking
      this.suspiciousActivity.delete(ip)
    }
  }
  
  // Limpar atividades antigas
  cleanup() {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    
    for (const [ip, data] of this.suspiciousActivity.entries()) {
      if (now - data.lastActivity > oneHour) {
        this.suspiciousActivity.delete(ip)
      }
    }
  }
}

export const autoBlacklist = new AutoBlacklist()

// Limpar auto-blacklist periodicamente
setInterval(() => {
  autoBlacklist.cleanup()
}, 5 * 60 * 1000) // A cada 5 minutos

// Exportar store para monitoramento
export { store as rateLimitStore }
