/**
 * RATE LIMITING SYSTEM - Implementação Real Completa
 * Sistema de rate limiting com Redis para proteção de APIs
 * 
 * Features:
 * - Multiple strategies (sliding window, token bucket, fixed window)
 * - Por IP, User ID, API Key
 * - Rate limits customizados por rota
 * - Burst allowance
 * - Distributed (Redis)
 * - Headers informativos (X-RateLimit-*)
 * - Blacklist/Whitelist
 * - Auto-ban para abuso
 */

import { createClient, RedisClientType } from 'redis';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface RateLimitConfig {
  points: number; // Número de requests permitidos
  duration: number; // Janela de tempo em segundos
  blockDuration?: number; // Tempo de bloqueio em segundos (default: duration)
  keyPrefix?: string;
  whitelist?: string[];
  blacklist?: string[];
  customHandler?: (req: NextRequest) => Promise<NextResponse | null>;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Segundos até poder tentar novamente
}

export interface RateLimitResult {
  success: boolean;
  info: RateLimitInfo;
  error?: string;
}

export type RateLimitStrategy = 'sliding-window' | 'token-bucket' | 'fixed-window';

// ============================================
// CONFIGURAÇÕES PRÉ-DEFINIDAS
// ============================================

export const RATE_LIMITS = {
  // Público
  PUBLIC_API: { points: 100, duration: 60 }, // 100 req/min
  PUBLIC_STRICT: { points: 10, duration: 60 }, // 10 req/min
  
  // Autenticado
  AUTH_API: { points: 1000, duration: 60 }, // 1000 req/min
  AUTH_STRICT: { points: 100, duration: 60 }, // 100 req/min
  
  // Upload
  UPLOAD: { points: 10, duration: 3600 }, // 10 uploads/hora
  UPLOAD_HEAVY: { points: 3, duration: 3600 }, // 3 uploads pesados/hora
  
  // Render
  RENDER: { points: 5, duration: 3600 }, // 5 renders/hora
  RENDER_PREMIUM: { points: 50, duration: 3600 }, // 50 renders/hora (premium)
  
  // Auth endpoints
  LOGIN: { points: 5, duration: 900, blockDuration: 3600 }, // 5 tentativas/15min, bloqueia 1h
  REGISTER: { points: 3, duration: 3600 }, // 3 registros/hora
  PASSWORD_RESET: { points: 3, duration: 3600 }, // 3 resets/hora
  
  // AI endpoints
  AI_GENERATION: { points: 20, duration: 3600 }, // 20 gerações/hora
  AI_PREMIUM: { points: 100, duration: 3600 }, // 100 gerações/hora (premium)
};

// ============================================
// REDIS CLIENT
// ============================================

class RedisRateLimiter {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Max retries reached');
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Rate Limiter Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Rate Limiter connected');
      this.connected = true;
    });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

const redisLimiter = new RedisRateLimiter();

// ============================================
// RATE LIMITER CLASS
// ============================================

export class RateLimiter {
  private strategy: RateLimitStrategy;
  private redis: RedisClientType;

  constructor(strategy: RateLimitStrategy = 'sliding-window') {
    this.strategy = strategy;
    this.redis = redisLimiter.getClient();
  }

  async initialize(): Promise<void> {
    await redisLimiter.connect();
  }

  // ========================================
  // MÉTODOS PRINCIPAIS
  // ========================================

  async consume(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const { points, duration, blockDuration = duration, whitelist = [], blacklist = [] } = config;

    // Verificar whitelist
    if (whitelist.includes(key)) {
      return {
        success: true,
        info: {
          limit: points,
          remaining: points,
          reset: Date.now() + duration * 1000,
        },
      };
    }

    // Verificar blacklist
    if (blacklist.includes(key)) {
      return {
        success: false,
        info: {
          limit: points,
          remaining: 0,
          reset: Date.now() + blockDuration * 1000,
          retryAfter: blockDuration,
        },
        error: 'IP/User is blacklisted',
      };
    }

    // Verificar se está bloqueado
    const blockKey = `block:${key}`;
    const isBlocked = await this.redis.get(blockKey);
    if (isBlocked) {
      const ttl = await this.redis.ttl(blockKey);
      return {
        success: false,
        info: {
          limit: points,
          remaining: 0,
          reset: Date.now() + ttl * 1000,
          retryAfter: ttl,
        },
        error: 'Rate limit exceeded. Temporarily blocked.',
      };
    }

    // Aplicar estratégia
    let result: RateLimitResult;

    switch (this.strategy) {
      case 'sliding-window':
        result = await this.slidingWindow(key, config);
        break;
      case 'token-bucket':
        result = await this.tokenBucket(key, config);
        break;
      case 'fixed-window':
        result = await this.fixedWindow(key, config);
        break;
      default:
        result = await this.slidingWindow(key, config);
    }

    // Se excedeu o limite, criar bloqueio
    if (!result.success) {
      await this.redis.setEx(blockKey, blockDuration, '1');
    }

    return result;
  }

  // ========================================
  // SLIDING WINDOW (mais preciso)
  // ========================================

  private async slidingWindow(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const { points, duration } = config;
    const now = Date.now();
    const windowStart = now - duration * 1000;

    const redisKey = `ratelimit:sw:${key}`;

    // Remover entradas antigas
    await this.redis.zRemRangeByScore(redisKey, 0, windowStart);

    // Contar requests na janela
    const count = await this.redis.zCard(redisKey);

    if (count >= points) {
      // Calcular quando o próximo request será permitido
      const oldestTimestamp = await this.redis.zRange(redisKey, 0, 0, { BY: 'SCORE' });
      const resetTime = oldestTimestamp.length > 0 
        ? parseInt(oldestTimestamp[0]) + duration * 1000 
        : now + duration * 1000;

      return {
        success: false,
        info: {
          limit: points,
          remaining: 0,
          reset: resetTime,
          retryAfter: Math.ceil((resetTime - now) / 1000),
        },
        error: 'Rate limit exceeded',
      };
    }

    // Adicionar request atual
    await this.redis.zAdd(redisKey, { score: now, value: `${now}` });
    await this.redis.expire(redisKey, duration);

    return {
      success: true,
      info: {
        limit: points,
        remaining: points - count - 1,
        reset: now + duration * 1000,
      },
    };
  }

  // ========================================
  // TOKEN BUCKET (permite burst)
  // ========================================

  private async tokenBucket(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const { points, duration } = config;
    const now = Date.now();

    const redisKey = `ratelimit:tb:${key}`;
    const lastUpdateKey = `${redisKey}:last`;

    // Obter estado atual
    const [tokens, lastUpdate] = await Promise.all([
      this.redis.get(redisKey),
      this.redis.get(lastUpdateKey),
    ]);

    let currentTokens = tokens ? parseInt(tokens) : points;
    const lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : now;

    // Calcular tokens gerados desde última atualização
    const timePassed = (now - lastUpdateTime) / 1000;
    const tokensToAdd = Math.floor((timePassed / duration) * points);
    currentTokens = Math.min(points, currentTokens + tokensToAdd);

    if (currentTokens < 1) {
      const timeToNextToken = ((1 - (currentTokens % 1)) / (points / duration)) * 1000;
      return {
        success: false,
        info: {
          limit: points,
          remaining: 0,
          reset: now + timeToNextToken,
          retryAfter: Math.ceil(timeToNextToken / 1000),
        },
        error: 'Rate limit exceeded',
      };
    }

    // Consumir token
    currentTokens -= 1;

    // Atualizar Redis
    await Promise.all([
      this.redis.setEx(redisKey, duration * 2, currentTokens.toString()),
      this.redis.setEx(lastUpdateKey, duration * 2, now.toString()),
    ]);

    return {
      success: true,
      info: {
        limit: points,
        remaining: Math.floor(currentTokens),
        reset: now + ((points - currentTokens) / (points / duration)) * 1000,
      },
    };
  }

  // ========================================
  // FIXED WINDOW (mais simples)
  // ========================================

  private async fixedWindow(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const { points, duration } = config;
    const now = Date.now();
    const windowStart = Math.floor(now / (duration * 1000)) * duration * 1000;

    const redisKey = `ratelimit:fw:${key}:${windowStart}`;

    const count = await this.redis.incr(redisKey);

    if (count === 1) {
      await this.redis.expire(redisKey, duration);
    }

    if (count > points) {
      const reset = windowStart + duration * 1000;
      return {
        success: false,
        info: {
          limit: points,
          remaining: 0,
          reset,
          retryAfter: Math.ceil((reset - now) / 1000),
        },
        error: 'Rate limit exceeded',
      };
    }

    return {
      success: true,
      info: {
        limit: points,
        remaining: points - count,
        reset: windowStart + duration * 1000,
      },
    };
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  async reset(key: string): Promise<void> {
    const patterns = [
      `ratelimit:sw:${key}`,
      `ratelimit:tb:${key}*`,
      `ratelimit:fw:${key}*`,
      `block:${key}`,
    ];

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    }
  }

  async block(key: string, durationSeconds: number): Promise<void> {
    const blockKey = `block:${key}`;
    await this.redis.setEx(blockKey, durationSeconds, '1');

    // Registrar no banco
    await prisma.rateLimitBlock.create({
      data: {
        key,
        reason: 'Manual block',
        expiresAt: new Date(Date.now() + durationSeconds * 1000),
      },
    });
  }

  async unblock(key: string): Promise<void> {
    const blockKey = `block:${key}`;
    await this.redis.del(blockKey);

    // Atualizar no banco
    await prisma.rateLimitBlock.updateMany({
      where: { key, expiresAt: { gte: new Date() } },
      data: { expiresAt: new Date() },
    });
  }

  async isBlocked(key: string): Promise<boolean> {
    const blockKey = `block:${key}`;
    const result = await this.redis.get(blockKey);
    return result !== null;
  }

  async getInfo(key: string): Promise<RateLimitInfo | null> {
    // Tentar obter info de qualquer estratégia
    const swKey = `ratelimit:sw:${key}`;
    const count = await this.redis.zCard(swKey);

    if (count > 0) {
      const ttl = await this.redis.ttl(swKey);
      return {
        limit: 100, // Default
        remaining: Math.max(0, 100 - count),
        reset: Date.now() + ttl * 1000,
      };
    }

    return null;
  }
}

// ============================================
// MIDDLEWARE HELPER
// ============================================

export function getRateLimitKey(req: NextRequest, type: 'ip' | 'user' | 'apikey' = 'ip'): string {
  switch (type) {
    case 'ip':
      return req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             'unknown';
    
    case 'user':
      // Assumindo que você tem autenticação
      const userId = req.headers.get('x-user-id') || 'anonymous';
      return `user:${userId}`;
    
    case 'apikey':
      const apiKey = req.headers.get('x-api-key') || 'none';
      return `apikey:${apiKey}`;
    
    default:
      return 'unknown';
  }
}

export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: result.error || 'Rate limit exceeded',
      retryAfter: result.info.retryAfter,
    },
    { status: 429 }
  );

  response.headers.set('X-RateLimit-Limit', result.info.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.info.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.info.reset.toString());

  if (result.info.retryAfter) {
    response.headers.set('Retry-After', result.info.retryAfter.toString());
  }

  return response;
}

export function addRateLimitHeaders(response: NextResponse, info: RateLimitInfo): NextResponse {
  response.headers.set('X-RateLimit-Limit', info.limit.toString());
  response.headers.set('X-RateLimit-Remaining', info.remaining.toString());
  response.headers.set('X-RateLimit-Reset', info.reset.toString());
  return response;
}

// ============================================
// DECORATOR PARA ROTAS
// ============================================

export function withRateLimit(config: RateLimitConfig, keyType: 'ip' | 'user' | 'apikey' = 'ip') {
  return function (handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async function (req: NextRequest, ...args: any[]): Promise<NextResponse> {
      const limiter = new RateLimiter();
      await limiter.initialize();

      const key = getRateLimitKey(req, keyType);
      const result = await limiter.consume(key, config);

      if (!result.success) {
        return createRateLimitResponse(result);
      }

      const response = await handler(req, ...args);
      return addRateLimitHeaders(response, result.info);
    };
  };
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const rateLimiter = new RateLimiter('sliding-window');

// Inicializar automaticamente
rateLimiter.initialize().catch(console.error);

// ============================================
// EXEMPLO DE USO
// ============================================

/*
// Em uma rota API (app/api/videos/route.ts)
import { rateLimiter, RATE_LIMITS, getRateLimitKey, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limiter-real';

export async function POST(req: NextRequest) {
  // Rate limit por IP
  const key = getRateLimitKey(req, 'ip');
  const result = await rateLimiter.consume(key, RATE_LIMITS.UPLOAD);

  if (!result.success) {
    return createRateLimitResponse(result);
  }

  // Processar request...
  const response = NextResponse.json({ success: true });
  return addRateLimitHeaders(response, result.info);
}

// Ou usando decorator
export const POST = withRateLimit(RATE_LIMITS.UPLOAD, 'user')(async (req) => {
  // Processar request...
  return NextResponse.json({ success: true });
});

// Bloquear usuário manualmente
await rateLimiter.block('user:123', 3600); // 1 hora

// Desbloquear
await rateLimiter.unblock('user:123');

// Reset rate limit
await rateLimiter.reset('user:123');

// Verificar status
const info = await rateLimiter.getInfo('user:123');
console.log(`Remaining: ${info?.remaining}/${info?.limit}`);
*/
