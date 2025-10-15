/**
 * Sistema de Rate Limiting Avançado
 * 
 * Features:
 * - Rate limiting por IP, usuário, endpoint
 * - Sliding window algorithm
 * - Burst allowance
 * - Multiple tiers (free, pro, enterprise)
 * - DDoS protection
 * - Custom rules
 * - Analytics e monitoring
 * 
 * @module RateLimitingSystem
 */

import Redis from 'ioredis';
import { createHash } from 'crypto';
import { monitoringSystem } from './monitoring-system-real';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RateLimitConfig {
  windowMs: number; // Janela de tempo em ms
  maxRequests: number; // Máximo de requisições na janela
  burstAllowance?: number; // Permite picos temporários
  skipSuccessfulRequests?: boolean; // Não conta requisições bem-sucedidas
  skipFailedRequests?: boolean; // Não conta requisições falhadas
  message?: string; // Mensagem customizada
  tier?: 'free' | 'pro' | 'enterprise' | 'custom';
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Timestamp quando o limite reseta
  retryAfter?: number; // Segundos até poder tentar novamente
}

export interface RateLimitRule {
  id: string;
  path: string; // Pode usar wildcards: /api/*, /api/users/:id
  methods?: string[]; // GET, POST, etc.
  config: RateLimitConfig;
  priority?: number;
  enabled?: boolean;
}

export interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
  topOffenders: Array<{
    identifier: string;
    requests: number;
    blocked: number;
  }>;
}

// ============================================================================
// PREDEFINED TIERS
// ============================================================================

export const RATE_LIMIT_TIERS: Record<string, RateLimitConfig> = {
  free: {
    windowMs: 60000, // 1 minuto
    maxRequests: 10,
    burstAllowance: 5,
    message: 'Free tier rate limit exceeded. Upgrade to Pro for higher limits.'
  },
  pro: {
    windowMs: 60000, // 1 minuto
    maxRequests: 100,
    burstAllowance: 20,
    message: 'Pro tier rate limit exceeded.'
  },
  enterprise: {
    windowMs: 60000, // 1 minuto
    maxRequests: 1000,
    burstAllowance: 200,
    message: 'Enterprise tier rate limit exceeded.'
  },
  // Endpoints específicos
  render: {
    windowMs: 60000, // 1 minuto
    maxRequests: 5, // Renders são pesados
    burstAllowance: 2,
    message: 'Render rate limit exceeded. Please wait before creating more render jobs.'
  },
  upload: {
    windowMs: 60000, // 1 minuto
    maxRequests: 20,
    burstAllowance: 5,
    message: 'Upload rate limit exceeded.'
  },
  apiRead: {
    windowMs: 60000, // 1 minuto
    maxRequests: 200,
    burstAllowance: 50,
    message: 'API read rate limit exceeded.'
  },
  apiWrite: {
    windowMs: 60000, // 1 minuto
    maxRequests: 50,
    burstAllowance: 10,
    message: 'API write rate limit exceeded.'
  }
};

// ============================================================================
// RATE LIMITING SYSTEM CLASS
// ============================================================================

export class RateLimitingSystem {
  private static instance: RateLimitingSystem;
  private redis: Redis;
  private rules: Map<string, RateLimitRule> = new Map();
  
  // Statistics
  private stats = {
    totalRequests: 0,
    blockedRequests: 0,
    offenders: new Map<string, { requests: number; blocked: number }>()
  };

  private constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    this.setupDefaultRules();
    this.startStatsCleanup();
  }

  public static getInstance(): RateLimitingSystem {
    if (!RateLimitingSystem.instance) {
      RateLimitingSystem.instance = new RateLimitingSystem();
    }
    return RateLimitingSystem.instance;
  }

  // ============================================================================
  // RATE LIMITING CORE
  // ============================================================================

  /**
   * Verifica se requisição está dentro do rate limit
   * @returns RateLimitInfo com informações do limite
   */
  public async checkRateLimit(
    identifier: string, // IP, userId, apiKey, etc.
    config: RateLimitConfig,
    namespace: string = 'default'
  ): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    this.stats.totalRequests++;
    this.trackOffender(identifier, false);

    const key = this.buildKey(identifier, namespace);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Remove entradas antigas (sliding window)
      await this.redis.zremrangebyscore(key, '-inf', windowStart);

      // Conta requisições na janela atual
      const requestCount = await this.redis.zcard(key);

      // Calcula limite efetivo (com burst allowance)
      const effectiveLimit = config.maxRequests + (config.burstAllowance || 0);

      // Verifica se excedeu o limite
      if (requestCount >= effectiveLimit) {
        this.stats.blockedRequests++;
        this.trackOffender(identifier, true);

        // Cria alerta se muitas requisições bloqueadas
        if (requestCount > effectiveLimit * 2) {
          monitoringSystem.createAlert(
            'warning',
            `Rate limit exceeded significantly by ${identifier}`,
            { identifier, requests: requestCount, limit: effectiveLimit }
          );
        }

        // Calcula quando o limite reseta
        const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldestRequest.length > 0
          ? parseInt(oldestRequest[1]) + config.windowMs
          : now + config.windowMs;

        return {
          allowed: false,
          info: {
            limit: config.maxRequests,
            remaining: 0,
            reset: resetTime,
            retryAfter: Math.ceil((resetTime - now) / 1000)
          }
        };
      }

      // Adiciona a requisição atual
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);
      await this.redis.pexpire(key, config.windowMs);

      // Calcula remaining considerando o limite base (sem burst)
      const remaining = Math.max(0, config.maxRequests - requestCount - 1);

      // Calcula reset time
      const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldestRequest.length > 0
        ? parseInt(oldestRequest[1]) + config.windowMs
        : now + config.windowMs;

      return {
        allowed: true,
        info: {
          limit: config.maxRequests,
          remaining,
          reset: resetTime
        }
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      
      // Em caso de erro, permite a requisição (fail-open)
      return {
        allowed: true,
        info: {
          limit: config.maxRequests,
          remaining: config.maxRequests,
          reset: now + config.windowMs
        }
      };
    }
  }

  /**
   * Verifica rate limit por path e método
   */
  public async checkByRule(
    identifier: string,
    path: string,
    method: string = 'GET'
  ): Promise<{ allowed: boolean; info: RateLimitInfo; rule?: RateLimitRule }> {
    const rule = this.findMatchingRule(path, method);
    
    if (!rule || !rule.enabled) {
      // Sem regra ou regra desabilitada, aplica tier padrão
      const config = RATE_LIMIT_TIERS.apiRead;
      const result = await this.checkRateLimit(identifier, config, 'default');
      return { ...result, rule: undefined };
    }

    const result = await this.checkRateLimit(identifier, rule.config, rule.id);
    return { ...result, rule };
  }

  /**
   * Verifica múltiplos limites (composto)
   */
  public async checkMultiple(
    checks: Array<{
      identifier: string;
      config: RateLimitConfig;
      namespace?: string;
    }>
  ): Promise<{ allowed: boolean; failedChecks: number[] }> {
    const results = await Promise.all(
      checks.map((check, index) =>
        this.checkRateLimit(check.identifier, check.config, check.namespace)
          .then(result => ({ index, ...result }))
      )
    );

    const failedChecks = results
      .filter(r => !r.allowed)
      .map(r => r.index);

    return {
      allowed: failedChecks.length === 0,
      failedChecks
    };
  }

  // ============================================================================
  // RULES MANAGEMENT
  // ============================================================================

  /**
   * Adiciona uma regra de rate limiting
   */
  public addRule(rule: RateLimitRule): void {
    this.rules.set(rule.id, {
      ...rule,
      priority: rule.priority ?? 0,
      enabled: rule.enabled ?? true
    });
  }

  /**
   * Remove uma regra
   */
  public removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Obtém todas as regras
   */
  public getRules(): RateLimitRule[] {
    return Array.from(this.rules.values())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Encontra regra que match o path e método
   */
  private findMatchingRule(path: string, method: string): RateLimitRule | null {
    const rules = this.getRules();

    for (const rule of rules) {
      if (!rule.enabled) continue;

      // Verifica método
      if (rule.methods && !rule.methods.includes(method.toUpperCase())) {
        continue;
      }

      // Match de path (suporta wildcards)
      if (this.pathMatches(path, rule.path)) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Verifica se path match o padrão (suporta * e :param)
   */
  private pathMatches(path: string, pattern: string): boolean {
    // Converte pattern para regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/:[\w]+/g, '[^/]+')
      .replace(/\//g, '\\/');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Setup de regras padrão
   */
  private setupDefaultRules(): void {
    // Render endpoints
    this.addRule({
      id: 'render-api',
      path: '/api/render/*',
      methods: ['POST'],
      config: RATE_LIMIT_TIERS.render,
      priority: 100
    });

    // Upload endpoints
    this.addRule({
      id: 'upload-api',
      path: '/api/upload/*',
      methods: ['POST'],
      config: RATE_LIMIT_TIERS.upload,
      priority: 90
    });

    // Write endpoints
    this.addRule({
      id: 'write-api',
      path: '/api/*',
      methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
      config: RATE_LIMIT_TIERS.apiWrite,
      priority: 50
    });

    // Read endpoints
    this.addRule({
      id: 'read-api',
      path: '/api/*',
      methods: ['GET'],
      config: RATE_LIMIT_TIERS.apiRead,
      priority: 40
    });
  }

  // ============================================================================
  // WHITELIST / BLACKLIST
  // ============================================================================

  /**
   * Adiciona identificador à whitelist (bypass rate limiting)
   */
  public async addToWhitelist(identifier: string, expiresIn?: number): Promise<void> {
    const key = `ratelimit:whitelist:${identifier}`;
    
    if (expiresIn) {
      await this.redis.setex(key, expiresIn, '1');
    } else {
      await this.redis.set(key, '1');
    }
  }

  /**
   * Remove da whitelist
   */
  public async removeFromWhitelist(identifier: string): Promise<void> {
    await this.redis.del(`ratelimit:whitelist:${identifier}`);
  }

  /**
   * Verifica se está na whitelist
   */
  public async isWhitelisted(identifier: string): Promise<boolean> {
    const result = await this.redis.exists(`ratelimit:whitelist:${identifier}`);
    return result === 1;
  }

  /**
   * Adiciona identificador à blacklist (bloqueia completamente)
   */
  public async addToBlacklist(
    identifier: string,
    reason?: string,
    expiresIn?: number
  ): Promise<void> {
    const key = `ratelimit:blacklist:${identifier}`;
    const value = JSON.stringify({
      reason: reason || 'Manual blacklist',
      timestamp: Date.now()
    });

    if (expiresIn) {
      await this.redis.setex(key, expiresIn, value);
    } else {
      await this.redis.set(key, value);
    }

    monitoringSystem.createAlert(
      'warning',
      `Identifier ${identifier} added to blacklist`,
      { identifier, reason }
    );
  }

  /**
   * Remove da blacklist
   */
  public async removeFromBlacklist(identifier: string): Promise<void> {
    await this.redis.del(`ratelimit:blacklist:${identifier}`);
  }

  /**
   * Verifica se está na blacklist
   */
  public async isBlacklisted(identifier: string): Promise<boolean> {
    const result = await this.redis.exists(`ratelimit:blacklist:${identifier}`);
    return result === 1;
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Obtém estatísticas do sistema
   */
  public async getStats(): Promise<RateLimitStats> {
    const blockRate = this.stats.totalRequests > 0
      ? (this.stats.blockedRequests / this.stats.totalRequests) * 100
      : 0;

    // Top 10 offenders
    const offenders = Array.from(this.stats.offenders.entries())
      .map(([identifier, data]) => ({
        identifier,
        requests: data.requests,
        blocked: data.blocked
      }))
      .sort((a, b) => b.blocked - a.blocked)
      .slice(0, 10);

    return {
      totalRequests: this.stats.totalRequests,
      blockedRequests: this.stats.blockedRequests,
      blockRate,
      topOffenders: offenders
    };
  }

  /**
   * Reseta estatísticas
   */
  public resetStats(): void {
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      offenders: new Map()
    };
  }

  /**
   * Rastreia offenders
   */
  private trackOffender(identifier: string, blocked: boolean): void {
    const current = this.stats.offenders.get(identifier) || { requests: 0, blocked: 0 };
    
    current.requests++;
    if (blocked) current.blocked++;
    
    this.stats.offenders.set(identifier, current);

    // Limita tamanho do map
    if (this.stats.offenders.size > 10000) {
      const firstKey = this.stats.offenders.keys().next().value;
      this.stats.offenders.delete(firstKey);
    }
  }

  /**
   * Cleanup de estatísticas antigas
   */
  private startStatsCleanup(): void {
    setInterval(() => {
      // Mantém apenas offenders com atividade recente
      const threshold = 1; // Pelo menos 1 request
      
      for (const [identifier, data] of this.stats.offenders.entries()) {
        if (data.requests < threshold) {
          this.stats.offenders.delete(identifier);
        }
      }
    }, 3600000); // A cada 1 hora
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Constrói chave do Redis
   */
  private buildKey(identifier: string, namespace: string): string {
    const hash = createHash('sha256').update(identifier).digest('hex').substring(0, 16);
    return `ratelimit:${namespace}:${hash}`;
  }

  /**
   * Cleanup ao encerrar
   */
  public async cleanup(): Promise<void> {
    await this.redis.quit();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const rateLimitingSystem = RateLimitingSystem.getInstance();

// ============================================================================
// MIDDLEWARE HELPER
// ============================================================================

/**
 * Middleware Express/Next.js para rate limiting
 */
export function rateLimitMiddleware(config?: RateLimitConfig) {
  const defaultConfig = config || RATE_LIMIT_TIERS.apiRead;

  return async (req: any, res: any, next: any) => {
    // Identifica usuário (por IP, userId, apiKey, etc.)
    const identifier = req.user?.id
      || req.headers['x-api-key']
      || req.headers['x-forwarded-for']
      || req.ip
      || 'anonymous';

    // Verifica blacklist primeiro
    if (await rateLimitingSystem.isBlacklisted(identifier)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Your access has been blocked. Contact support if you believe this is an error.'
      });
    }

    // Verifica whitelist
    if (await rateLimitingSystem.isWhitelisted(identifier)) {
      return next();
    }

    // Verifica rate limit
    const result = await rateLimitingSystem.checkRateLimit(
      identifier,
      defaultConfig
    );

    // Define headers de rate limit
    res.setHeader('X-RateLimit-Limit', result.info.limit);
    res.setHeader('X-RateLimit-Remaining', result.info.remaining);
    res.setHeader('X-RateLimit-Reset', result.info.reset);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.info.retryAfter || 60);
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: defaultConfig.message || 'Rate limit exceeded',
        retryAfter: result.info.retryAfter,
        limit: result.info.limit,
        reset: new Date(result.info.reset).toISOString()
      });
    }

    next();
  };
}

/**
 * Helper para rate limit por tier de usuário
 */
export async function checkUserRateLimit(
  userId: string,
  userTier: 'free' | 'pro' | 'enterprise' = 'free'
): Promise<{ allowed: boolean; info: RateLimitInfo }> {
  const config = RATE_LIMIT_TIERS[userTier];
  return rateLimitingSystem.checkRateLimit(userId, config, `user-${userTier}`);
}
