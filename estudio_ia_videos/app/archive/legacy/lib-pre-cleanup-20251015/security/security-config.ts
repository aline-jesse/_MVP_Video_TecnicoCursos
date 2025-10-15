/**
 * 🔒 Security Configuration
 * FASE 5: Implementação de Segurança Avançada
 */

import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// Configuração de Rate Limiting
export const rateLimitConfig = {
  // API endpoints gerais
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Endpoints de autenticação
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas de login
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true,
  },

  // Upload de arquivos
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // máximo 20 uploads por hora
    message: {
      error: 'Upload limit exceeded, please try again later.',
      retryAfter: '1 hour'
    },
  },

  // Criação de projetos
  projects: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // máximo 10 projetos por hora
    message: {
      error: 'Project creation limit exceeded, please try again later.',
      retryAfter: '1 hour'
    },
  }
};

// Configuração de Slow Down (redução gradual de velocidade)
export const slowDownConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // permitir 50 requests por 15 min sem delay
  delayMs: 500, // adicionar 500ms de delay por request após o limite
  maxDelayMs: 20000, // máximo delay de 20 segundos
};

// Configuração CORS
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://treinx.abacusai.app', 'https://www.treinx.abacusai.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  credentials: true,
  maxAge: 86400, // 24 horas
};

// Headers de segurança
export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https:",
  ].join('; '),
};

// Classe para gerenciar rate limiting
export class RateLimiter {
  private static instance: RateLimiter;
  private limiters: Map<string, any> = new Map();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  // Criar rate limiter para endpoint específico
  createLimiter(key: string, config: any) {
    if (!this.limiters.has(key)) {
      this.limiters.set(key, rateLimit(config));
    }
    return this.limiters.get(key);
  }

  // Verificar rate limit
  async checkLimit(req: NextRequest, key: string): Promise<boolean> {
    const limiter = this.limiters.get(key);
    if (!limiter) return true;

    return new Promise((resolve) => {
      limiter(req, {}, (err: any) => {
        resolve(!err);
      });
    });
  }
}

// Middleware de segurança
export function securityMiddleware(req: NextRequest): NextResponse | null {
  const response = NextResponse.next();

  // Aplicar headers de segurança
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Verificar CORS
  const origin = req.headers.get('origin');
  if (origin && corsConfig.origin.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return null;
}

// Validação de input
export class InputValidator {
  // Sanitizar string
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validar email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar senha forte
  static isStrongPassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  // Validar URL
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validar UUID
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

// Configuração JWT
export const jwtConfig = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
  expiresIn: '24h',
  refreshExpiresIn: '7d',
  algorithm: 'HS256' as const,
  issuer: 'estudio-ia-videos',
  audience: 'estudio-ia-videos-users',
};

// Configuração de sessão
export const sessionConfig = {
  name: 'estudio-session',
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict' as const,
  },
};

// Configuração de criptografia
export const cryptoConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,
  saltLength: 32,
  iterations: 100000,
};

// Classe para criptografia
export class CryptoUtils {
  private static readonly algorithm = 'aes-256-gcm';

  // Gerar chave aleatória
  static generateKey(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  // Criptografar dados
  static encrypt(text: string, key: string): string {
    const crypto = require('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('estudio-ia-videos'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  }

  // Descriptografar dados
  static decrypt(encryptedData: string, key: string): string {
    const crypto = require('crypto');
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from('estudio-ia-videos'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Hash de senha
  static async hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verificar senha
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
  }
}

// Configuração de auditoria
export class SecurityAudit {
  private static logs: Array<{
    timestamp: number;
    event: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    details?: any;
  }> = [];

  // Log de evento de segurança
  static logSecurityEvent(
    event: string,
    req?: NextRequest,
    userId?: string,
    details?: any
  ): void {
    this.logs.push({
      timestamp: Date.now(),
      event,
      userId,
      ip: req?.ip || req?.headers.get('x-forwarded-for') || undefined,
      userAgent: req?.headers.get('user-agent') || undefined,
      details,
    });

    // Manter apenas os últimos 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Log crítico - enviar alerta
    if (event.includes('CRITICAL') || event.includes('ATTACK')) {
      this.sendSecurityAlert(event, details);
    }
  }

  // Enviar alerta de segurança
  private static async sendSecurityAlert(event: string, details?: any): Promise<void> {
    try {
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 SECURITY ALERT: ${event}`,
            details,
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  // Obter logs de segurança
  static getSecurityLogs(limit: number = 100): typeof this.logs {
    return this.logs.slice(-limit);
  }
}

export const rateLimiter = RateLimiter.getInstance();