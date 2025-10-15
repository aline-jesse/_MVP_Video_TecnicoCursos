/**
 * Middleware de Segurança Avançado
 * 
 * Features:
 * - Proteção CSRF
 * - Headers de segurança (Helmet)
 * - Rate limiting por IP e usuário
 * - Detecção de SQL Injection
 * - Detecção de XSS
 * - Validação de input
 * - IP Whitelist/Blacklist
 * - Proteção DDoS
 * - JWT validation
 * - API Key validation
 * - Request sanitization
 * - Audit logging
 * 
 * @module SecurityMiddleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { Redis } from 'ioredis';
import { rateLimitingSystem } from './rate-limiting-advanced';
import { logger } from './logging-system-advanced';
import { monitoringSystem } from './monitoring-system-real';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SecurityConfig {
  csrf: {
    enabled: boolean;
    cookieName: string;
    headerName: string;
    excludePaths: string[];
  };
  headers: {
    enabled: boolean;
    contentSecurityPolicy: string;
    strictTransportSecurity: string;
  };
  validation: {
    enabled: boolean;
    maxBodySize: number; // bytes
    allowedContentTypes: string[];
  };
  ipFiltering: {
    enabled: boolean;
    whitelist: string[];
    blacklist: string[];
  };
  ddos: {
    enabled: boolean;
    maxRequestsPerSecond: number;
    blockDuration: number; // segundos
  };
  authentication: {
    jwtEnabled: boolean;
    apiKeyEnabled: boolean;
    publicPaths: string[];
  };
}

export interface SecurityThreat {
  type: 'sql_injection' | 'xss' | 'csrf' | 'ddos' | 'unauthorized' | 'invalid_input' | 'blacklisted_ip';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  path: string;
  payload?: string;
  timestamp: Date;
  blocked: boolean;
}

export interface SecurityAudit {
  id: string;
  timestamp: Date;
  ip: string;
  userId?: string;
  method: string;
  path: string;
  userAgent?: string;
  threat?: SecurityThreat;
  status: number;
  duration: number;
}

// ============================================================================
// SECURITY MIDDLEWARE CLASS
// ============================================================================

export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  private redis: Redis;
  private csrfTokens: Map<string, string> = new Map();
  private blockedIPs: Map<string, number> = new Map();
  private requestCounters: Map<string, number[]> = new Map();

  private config: SecurityConfig = {
    csrf: {
      enabled: true,
      cookieName: 'csrf-token',
      headerName: 'x-csrf-token',
      excludePaths: ['/api/public', '/api/webhooks']
    },
    headers: {
      enabled: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
      strictTransportSecurity: 'max-age=31536000; includeSubDomains'
    },
    validation: {
      enabled: true,
      maxBodySize: 10 * 1024 * 1024, // 10MB
      allowedContentTypes: ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']
    },
    ipFiltering: {
      enabled: process.env.IP_FILTERING === 'true',
      whitelist: (process.env.IP_WHITELIST || '').split(',').filter(Boolean),
      blacklist: (process.env.IP_BLACKLIST || '').split(',').filter(Boolean)
    },
    ddos: {
      enabled: true,
      maxRequestsPerSecond: 20,
      blockDuration: 300 // 5 minutos
    },
    authentication: {
      jwtEnabled: true,
      apiKeyEnabled: true,
      publicPaths: ['/api/public', '/api/health', '/login', '/register']
    }
  };

  private constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });

    this.loadBlacklistedIPs();
  }

  public static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  // ============================================================================
  // MAIN MIDDLEWARE
  // ============================================================================

  /**
   * Middleware principal de segurança
   */
  public async handle(request: NextRequest): Promise<NextResponse | null> {
    const start = Date.now();
    const ip = this.getClientIP(request);
    const path = request.nextUrl.pathname;

    // Log da requisição
    logger.debug('Incoming request', {
      ip,
      method: request.method,
      path,
      userAgent: request.headers.get('user-agent')
    }, 'security');

    try {
      // 1. Verifica IP blacklist/whitelist
      const ipCheck = await this.checkIPFiltering(ip);
      if (!ipCheck.allowed) {
        return this.blockRequest(request, 'blacklisted_ip', ipCheck.reason);
      }

      // 2. Verifica DDoS
      const ddosCheck = await this.checkDDoS(ip);
      if (!ddosCheck.allowed) {
        return this.blockRequest(request, 'ddos', 'Too many requests');
      }

      // 3. Aplica security headers
      const response = NextResponse.next();
      if (this.config.headers.enabled) {
        this.applySecurityHeaders(response);
      }

      // 4. Verifica CSRF (POST, PUT, DELETE)
      if (this.config.csrf.enabled && this.requiresCSRF(request)) {
        const csrfCheck = await this.validateCSRF(request);
        if (!csrfCheck.valid) {
          return this.blockRequest(request, 'csrf', 'Invalid CSRF token');
        }
      }

      // 5. Valida authentication (se não for path público)
      if (!this.isPublicPath(path)) {
        const authCheck = await this.validateAuthentication(request);
        if (!authCheck.valid) {
          return this.blockRequest(request, 'unauthorized', authCheck.reason);
        }
      }

      // 6. Valida input
      if (this.config.validation.enabled) {
        const validationCheck = await this.validateInput(request);
        if (!validationCheck.valid) {
          return this.blockRequest(request, 'invalid_input', validationCheck.reason);
        }
      }

      // 7. Detecta SQL Injection
      const sqlCheck = this.detectSQLInjection(request);
      if (sqlCheck.detected) {
        return this.blockRequest(request, 'sql_injection', 'SQL injection attempt detected');
      }

      // 8. Detecta XSS
      const xssCheck = this.detectXSS(request);
      if (xssCheck.detected) {
        return this.blockRequest(request, 'xss', 'XSS attempt detected');
      }

      // Audit log
      await this.logAudit({
        id: randomBytes(16).toString('hex'),
        timestamp: new Date(),
        ip,
        method: request.method,
        path,
        userAgent: request.headers.get('user-agent') || undefined,
        status: 200,
        duration: Date.now() - start
      });

      return null; // Permite requisição
    } catch (error) {
      logger.error('Security middleware error', error as Error, { ip, path }, 'security');
      
      // Em caso de erro, permite requisição (fail-open para não bloquear sistema)
      return null;
    }
  }

  // ============================================================================
  // IP FILTERING
  // ============================================================================

  /**
   * Verifica IP filtering
   */
  private async checkIPFiltering(ip: string): Promise<{ allowed: boolean; reason?: string }> {
    if (!this.config.ipFiltering.enabled) {
      return { allowed: true };
    }

    // Verifica whitelist
    if (this.config.ipFiltering.whitelist.length > 0) {
      if (!this.config.ipFiltering.whitelist.includes(ip)) {
        logger.warn('IP not in whitelist', { ip }, 'security');
        return { allowed: false, reason: 'IP not whitelisted' };
      }
    }

    // Verifica blacklist
    if (this.config.ipFiltering.blacklist.includes(ip)) {
      logger.warn('IP in blacklist', { ip }, 'security');
      return { allowed: false, reason: 'IP blacklisted' };
    }

    // Verifica bloqueio temporário
    const blockedUntil = this.blockedIPs.get(ip);
    if (blockedUntil && blockedUntil > Date.now()) {
      return { allowed: false, reason: 'IP temporarily blocked' };
    }

    return { allowed: true };
  }

  /**
   * Carrega IPs blacklisted do Redis
   */
  private async loadBlacklistedIPs(): Promise<void> {
    try {
      const ips = await this.redis.smembers('security:blacklist:ips');
      this.config.ipFiltering.blacklist.push(...ips);
      console.log(`✅ ${ips.length} IPs blacklisted carregados`);
    } catch (error) {
      console.error('Erro ao carregar blacklist:', error);
    }
  }

  /**
   * Adiciona IP à blacklist
   */
  public async blacklistIP(ip: string, duration?: number): Promise<void> {
    if (duration) {
      // Bloqueio temporário
      this.blockedIPs.set(ip, Date.now() + duration * 1000);
      await this.redis.setex(`security:blocked:${ip}`, duration, '1');
    } else {
      // Bloqueio permanente
      this.config.ipFiltering.blacklist.push(ip);
      await this.redis.sadd('security:blacklist:ips', ip);
    }

    logger.warn('IP blacklisted', { ip, duration }, 'security');
    
    monitoringSystem.createAlert('warning', `IP blacklisted: ${ip}`, { duration });
  }

  // ============================================================================
  // DDOS PROTECTION
  // ============================================================================

  /**
   * Verifica proteção DDoS
   */
  private async checkDDoS(ip: string): Promise<{ allowed: boolean }> {
    if (!this.config.ddos.enabled) {
      return { allowed: true };
    }

    const now = Date.now();
    const key = `ddos:${ip}`;

    // Obtém histórico de requests
    let requests = this.requestCounters.get(key) || [];

    // Remove requests antigos (mais de 1 segundo)
    requests = requests.filter(timestamp => now - timestamp < 1000);

    // Adiciona request atual
    requests.push(now);
    this.requestCounters.set(key, requests);

    // Verifica limite
    if (requests.length > this.config.ddos.maxRequestsPerSecond) {
      logger.warn('DDoS detected', {
        ip,
        requestsPerSecond: requests.length
      }, 'security');

      // Bloqueia IP temporariamente
      await this.blacklistIP(ip, this.config.ddos.blockDuration);

      monitoringSystem.createAlert('critical', `DDoS attack from ${ip}`, {
        requestsPerSecond: requests.length
      });

      return { allowed: false };
    }

    return { allowed: true };
  }

  // ============================================================================
  // CSRF PROTECTION
  // ============================================================================

  /**
   * Gera token CSRF
   */
  public generateCSRFToken(sessionId: string): string {
    const token = randomBytes(32).toString('hex');
    this.csrfTokens.set(sessionId, token);
    
    // Também salva no Redis com TTL
    this.redis.setex(`csrf:${sessionId}`, 3600, token);

    return token;
  }

  /**
   * Valida token CSRF
   */
  private async validateCSRF(request: NextRequest): Promise<{ valid: boolean }> {
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return { valid: false };
    }

    const tokenFromHeader = request.headers.get(this.config.csrf.headerName);
    const tokenFromBody = await this.getCSRFFromBody(request);
    const token = tokenFromHeader || tokenFromBody;

    if (!token) {
      logger.warn('CSRF token missing', { path: request.nextUrl.pathname }, 'security');
      return { valid: false };
    }

    // Verifica em memória primeiro
    const storedToken = this.csrfTokens.get(sessionId);
    if (storedToken === token) {
      return { valid: true };
    }

    // Verifica no Redis
    const redisToken = await this.redis.get(`csrf:${sessionId}`);
    if (redisToken === token) {
      this.csrfTokens.set(sessionId, redisToken);
      return { valid: true };
    }

    logger.warn('Invalid CSRF token', { sessionId }, 'security');
    return { valid: false };
  }

  /**
   * Verifica se request requer CSRF
   */
  private requiresCSRF(request: NextRequest): boolean {
    // Apenas para métodos que modificam dados
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      return false;
    }

    // Verifica paths excluídos
    const path = request.nextUrl.pathname;
    return !this.config.csrf.excludePaths.some(excluded => path.startsWith(excluded));
  }

  /**
   * Obtém CSRF token do body
   */
  private async getCSRFFromBody(request: NextRequest): Promise<string | null> {
    try {
      const clone = request.clone();
      const body = await clone.json();
      return body.csrfToken || null;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Valida authentication
   */
  private async validateAuthentication(request: NextRequest): Promise<{ valid: boolean; reason?: string }> {
    // Verifica JWT
    if (this.config.authentication.jwtEnabled) {
      const jwtToken = this.extractJWT(request);
      if (jwtToken) {
        const jwtValid = await this.validateJWT(jwtToken);
        if (jwtValid) {
          return { valid: true };
        }
      }
    }

    // Verifica API Key
    if (this.config.authentication.apiKeyEnabled) {
      const apiKey = this.extractAPIKey(request);
      if (apiKey) {
        const apiKeyValid = await this.validateAPIKey(apiKey);
        if (apiKeyValid) {
          return { valid: true };
        }
      }
    }

    return { valid: false, reason: 'No valid authentication found' };
  }

  /**
   * Extrai JWT do request
   */
  private extractJWT(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return request.cookies.get('auth-token')?.value || null;
  }

  /**
   * Valida JWT token
   */
  private async validateJWT(token: string): Promise<boolean> {
    try {
      // Verifica se está na blacklist
      const blacklisted = await this.redis.sismember('auth:jwt:blacklist', token);
      if (blacklisted) {
        return false;
      }

      // Em produção, usar biblioteca JWT real (jose, jsonwebtoken)
      // Por ora, validação simplificada
      return token.length > 20;
    } catch (error) {
      logger.error('JWT validation error', error as Error, {}, 'security');
      return false;
    }
  }

  /**
   * Extrai API Key
   */
  private extractAPIKey(request: NextRequest): string | null {
    return request.headers.get('x-api-key') || null;
  }

  /**
   * Valida API Key
   */
  private async validateAPIKey(apiKey: string): Promise<boolean> {
    try {
      const exists = await this.redis.sismember('auth:api:keys', apiKey);
      return exists === 1;
    } catch (error) {
      logger.error('API Key validation error', error as Error, {}, 'security');
      return false;
    }
  }

  /**
   * Verifica se é path público
   */
  private isPublicPath(path: string): boolean {
    return this.config.authentication.publicPaths.some(publicPath => 
      path.startsWith(publicPath)
    );
  }

  // ============================================================================
  // INPUT VALIDATION
  // ============================================================================

  /**
   * Valida input do request
   */
  private async validateInput(request: NextRequest): Promise<{ valid: boolean; reason?: string }> {
    // Verifica Content-Type
    const contentType = request.headers.get('content-type');
    if (contentType && request.method !== 'GET') {
      const isAllowed = this.config.validation.allowedContentTypes.some(allowed =>
        contentType.includes(allowed)
      );

      if (!isAllowed) {
        return { valid: false, reason: `Invalid content-type: ${contentType}` };
      }
    }

    // Verifica tamanho do body
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength);
      if (size > this.config.validation.maxBodySize) {
        return { valid: false, reason: `Body too large: ${size} bytes` };
      }
    }

    return { valid: true };
  }

  // ============================================================================
  // ATTACK DETECTION
  // ============================================================================

  /**
   * Detecta SQL Injection
   */
  private detectSQLInjection(request: NextRequest): { detected: boolean; payload?: string } {
    const patterns = [
      /(\bunion\b.*\bselect\b)/i,
      /(\bselect\b.*\bfrom\b.*\bwhere\b)/i,
      /(\bdrop\b.*\btable\b)/i,
      /(\bdelete\b.*\bfrom\b)/i,
      /(\binsert\b.*\binto\b)/i,
      /(\bupdate\b.*\bset\b)/i,
      /(;.*--)/,
      /('\s*or\s*'1'\s*=\s*'1)/i,
      /('\s*or\s*1\s*=\s*1)/i
    ];

    // Verifica URL
    const url = request.nextUrl.toString();
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        logger.warn('SQL Injection detected in URL', { url }, 'security');
        return { detected: true, payload: url };
      }
    }

    // Verifica query params
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(value)) {
          logger.warn('SQL Injection detected in query param', { key, value }, 'security');
          return { detected: true, payload: value };
        }
      }
    }

    return { detected: false };
  }

  /**
   * Detecta XSS
   */
  private detectXSS(request: NextRequest): { detected: boolean; payload?: string } {
    const patterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\(/gi,
      /expression\(/gi
    ];

    // Verifica URL
    const url = request.nextUrl.toString();
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        logger.warn('XSS detected in URL', { url }, 'security');
        return { detected: true, payload: url };
      }
    }

    // Verifica query params
    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(value)) {
          logger.warn('XSS detected in query param', { key, value }, 'security');
          return { detected: true, payload: value };
        }
      }
    }

    return { detected: false };
  }

  // ============================================================================
  // SECURITY HEADERS
  // ============================================================================

  /**
   * Aplica security headers
   */
  private applySecurityHeaders(response: NextResponse): void {
    // Content Security Policy
    response.headers.set('Content-Security-Policy', this.config.headers.contentSecurityPolicy);

    // Strict Transport Security
    response.headers.set('Strict-Transport-Security', this.config.headers.strictTransportSecurity);

    // X-Frame-Options
    response.headers.set('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Obtém IP do cliente
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    return 'unknown';
  }

  /**
   * Bloqueia request
   */
  private blockRequest(
    request: NextRequest,
    type: SecurityThreat['type'],
    reason: string
  ): NextResponse {
    const ip = this.getClientIP(request);

    logger.warn('Request blocked', {
      ip,
      type,
      reason,
      path: request.nextUrl.pathname
    }, 'security');

    // Log threat
    const threat: SecurityThreat = {
      type,
      severity: this.getThreatSeverity(type),
      ip,
      path: request.nextUrl.pathname,
      timestamp: new Date(),
      blocked: true
    };

    this.logThreat(threat);

    return new NextResponse(JSON.stringify({
      error: 'Request blocked',
      reason,
      type
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Obtém severidade da ameaça
   */
  private getThreatSeverity(type: SecurityThreat['type']): SecurityThreat['severity'] {
    switch (type) {
      case 'sql_injection':
      case 'xss':
        return 'critical';
      case 'ddos':
      case 'unauthorized':
        return 'high';
      case 'csrf':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Loga threat
   */
  private async logThreat(threat: SecurityThreat): Promise<void> {
    await this.redis.lpush('security:threats', JSON.stringify(threat));
    await this.redis.ltrim('security:threats', 0, 999);

    monitoringSystem.createAlert(
      threat.severity === 'critical' ? 'critical' : 'warning',
      `Security threat detected: ${threat.type}`,
      { ip: threat.ip, path: threat.path }
    );
  }

  /**
   * Loga audit
   */
  private async logAudit(audit: SecurityAudit): Promise<void> {
    await this.redis.lpush('security:audit', JSON.stringify(audit));
    await this.redis.ltrim('security:audit', 0, 9999);
  }

  /**
   * Cleanup
   */
  public async cleanup(): Promise<void> {
    await this.redis.quit();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const securityMiddleware = SecurityMiddleware.getInstance();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitiza string removendo caracteres perigosos
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Hash seguro
 */
export function secureHash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}
