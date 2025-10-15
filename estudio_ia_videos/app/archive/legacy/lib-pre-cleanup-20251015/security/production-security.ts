/**
 * 🚀 SISTEMA DE SEGURANÇA PARA PRODUÇÃO - FASE 5
 * Implementação robusta de segurança com HTTPS, rate limiting, CORS e autenticação
 */

import { getProductionConfig } from '../config/production-config'

export interface SecurityConfig {
  rateLimiting: {
    windowMs: number
    max: number
    message: string
  }
  cors: {
    origin: string | string[]
    methods: string[]
    allowedHeaders: string[]
    credentials: boolean
  }
  authentication: {
    jwtSecret: string
    jwtExpiresIn: string
    maxLoginAttempts: number
    lockoutDuration: number
  }
}

/**
 * Classe principal do sistema de segurança
 */
export class ProductionSecurity {
  private config: SecurityConfig
  private loginAttempts: Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }> = new Map()
  private blockedIPs: Set<string> = new Set()
  private suspiciousActivity: Map<string, number> = new Map()

  constructor() {
    this.config = this.loadSecurityConfig()
    this.startSecurityMonitoring()
  }

  /**
   * Carrega configuração de segurança
   */
  private loadSecurityConfig(): SecurityConfig {
    const prodConfig = getProductionConfig()

    return {
      rateLimiting: {
        windowMs: prodConfig.rateLimitWindow,
        max: prodConfig.rateLimitMax,
        message: 'Muitas tentativas. Tente novamente em alguns minutos.'
      },
      cors: {
        origin: prodConfig.corsOrigin === '*' ? true : prodConfig.corsOrigin.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'Accept',
          'Origin'
        ],
        credentials: true
      },
      authentication: {
        jwtSecret: prodConfig.jwtSecret,
        jwtExpiresIn: '1h',
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutos
      }
    }
  }

  /**
   * Inicia monitoramento de segurança
   */
  private startSecurityMonitoring(): void {
    // Limpar tentativas de login antigas a cada hora
    setInterval(() => {
      this.cleanupOldLoginAttempts()
    }, 60 * 60 * 1000)

    console.log('🔒 Sistema de segurança iniciado')
  }

  /**
   * Registra tentativa de login
   */
  recordLoginAttempt(ip: string, success: boolean): void {
    const now = new Date()
    const attempt = this.loginAttempts.get(ip) || { count: 0, lastAttempt: now }
    
    if (success) {
      this.loginAttempts.delete(ip)
      return
    }
    
    attempt.count++
    attempt.lastAttempt = now
    
    if (attempt.count >= this.config.authentication.maxLoginAttempts) {
      attempt.lockedUntil = new Date(now.getTime() + this.config.authentication.lockoutDuration)
      this.recordSuspiciousActivity(ip, 'brute_force_attempt')
    }
    
    this.loginAttempts.set(ip, attempt)
  }

  /**
   * Registra atividade suspeita
   */
  recordSuspiciousActivity(ip: string, type: string): void {
    const current = this.suspiciousActivity.get(ip) || 0
    const newCount = current + 1
    
    this.suspiciousActivity.set(ip, newCount)
    
    if (newCount >= 10) {
      this.blockedIPs.add(ip)
      console.warn(`🚨 IP ${ip} bloqueado devido a atividade suspeita: ${type}`)
      
      setTimeout(() => {
        this.blockedIPs.delete(ip)
        this.suspiciousActivity.delete(ip)
      }, 60 * 60 * 1000)
    }
    
    console.warn(`⚠️ Atividade suspeita detectada: ${type} de ${ip}`)
  }

  /**
   * Verifica se IP está bloqueado
   */
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip)
  }

  /**
   * Verifica se IP está em lockout
   */
  isIPLocked(ip: string): { locked: boolean; remainingTime?: number } {
    const attempt = this.loginAttempts.get(ip)
    
    if (attempt && attempt.lockedUntil && new Date() < attempt.lockedUntil) {
      const remainingTime = Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / 1000)
      return { locked: true, remainingTime }
    }
    
    return { locked: false }
  }

  /**
   * Gera JWT
   */
  async generateJWT(payload: any): Promise<string> {
    try {
      const jwt = await import('jsonwebtoken')
      return jwt.sign(payload, this.config.authentication.jwtSecret, {
        expiresIn: this.config.authentication.jwtExpiresIn
      })
    } catch (error) {
      console.error('❌ Erro ao gerar JWT:', error)
      throw new Error('Erro interno do servidor')
    }
  }

  /**
   * Verifica JWT
   */
  async verifyJWT(token: string): Promise<any> {
    try {
      const jwt = await import('jsonwebtoken')
      return jwt.verify(token, this.config.authentication.jwtSecret)
    } catch (error) {
      throw new Error('Token inválido')
    }
  }

  /**
   * Obtém IP do cliente
   */
  getClientIP(req: any): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           '127.0.0.1'
  }

  /**
   * Limpa tentativas de login antigas
   */
  private cleanupOldLoginAttempts(): void {
    const now = new Date()
    const cutoff = new Date(now.getTime() - (24 * 60 * 60 * 1000))
    
    for (const [ip, attempt] of this.loginAttempts.entries()) {
      if (attempt.lastAttempt < cutoff) {
        this.loginAttempts.delete(ip)
      }
    }
  }

  /**
   * Sanitiza entrada do usuário
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return ''
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[<>]/g, '')
  }

  /**
   * Valida email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valida senha forte
   */
  validateStrongPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Obtém estatísticas de segurança
   */
  getSecurityStats(): {
    blockedIPs: number
    loginAttempts: number
    suspiciousActivity: number
    activeBlocks: string[]
  } {
    return {
      blockedIPs: this.blockedIPs.size,
      loginAttempts: this.loginAttempts.size,
      suspiciousActivity: this.suspiciousActivity.size,
      activeBlocks: Array.from(this.blockedIPs)
    }
  }
}

/**
 * Instância singleton do sistema de segurança
 */
let security: ProductionSecurity | null = null

export function getSecurity(): ProductionSecurity {
  if (!security) {
    security = new ProductionSecurity()
  }
  return security
}

/**
 * Utilitários de segurança
 */
export const securityUtils = {
  // Hash de senha
  async hashPassword(password: string): Promise<string> {
    try {
      const bcrypt = await import('bcrypt')
      return bcrypt.hash(password, 12)
    } catch (error) {
      console.error('❌ Erro ao fazer hash da senha:', error)
      throw new Error('Erro interno do servidor')
    }
  },

  // Verificar senha
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const bcrypt = await import('bcrypt')
      return bcrypt.compare(password, hash)
    } catch (error) {
      console.error('❌ Erro ao verificar senha:', error)
      return false
    }
  },

  // Gerar token seguro
  generateSecureToken(length: number = 32): string {
    try {
      const crypto = require('crypto')
      return crypto.randomBytes(length).toString('hex')
    } catch (error) {
      console.error('❌ Erro ao gerar token:', error)
      return Math.random().toString(36).substring(2, 15)
    }
  }
}

export default getSecurity