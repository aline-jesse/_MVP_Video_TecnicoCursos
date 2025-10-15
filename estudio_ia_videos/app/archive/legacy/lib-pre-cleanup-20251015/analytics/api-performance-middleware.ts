/**
 * FASE 4 - ANALYTICS COMPLETO
 * Middleware de Performance para APIs
 * 
 * Captura automaticamente:
 * - Tempo de resposta das APIs
 * - Códigos de status HTTP
 * - Tamanho das respostas
 * - Erros e exceções
 * - Métricas de uso por endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsCollector } from './real-time-collector';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';

export interface APIPerformanceMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string;
  ipAddress?: string;
  userId?: string;
  organizationId?: string;
  error?: string;
}

export class APIPerformanceMiddleware {
  /**
   * Wrapper para APIs que captura métricas automaticamente
   */
  static withPerformanceTracking(
    handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
      const startTime = Date.now();
      const endpoint = req.nextUrl.pathname;
      const method = req.method;
      
      let response: NextResponse;
      let error: string | undefined;
      let statusCode = 200;

      try {
        // Executar o handler original
        response = await handler(req, ...args);
        statusCode = response.status;
        
      } catch (err: any) {
        // Capturar erros
        error = err.message || 'Unknown error';
        statusCode = 500;
        
        // Criar resposta de erro
        response = NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }

      // Calcular métricas
      const responseTime = Date.now() - startTime;
      const requestSize = await this.getRequestSize(req);
      const responseSize = await this.getResponseSize(response);
      
      // Obter informações do usuário
      const session = await getServerSession(authConfig);
      const userId = session?.user?.id;
      const organizationId = (session?.user as any)?.currentOrgId;

      // Coletar métricas
      const metrics: APIPerformanceMetrics = {
        endpoint,
        method,
        statusCode,
        responseTime,
        requestSize,
        responseSize,
        userAgent: req.headers.get('user-agent') || undefined,
        ipAddress: this.getClientIP(req),
        userId,
        organizationId,
        error,
      };

      // Enviar para o coletor de analytics
      await this.trackAPIMetrics(metrics);

      return response;
    };
  }

  /**
   * Calcula o tamanho da requisição
   */
  private static async getRequestSize(req: NextRequest): Promise<number> {
    try {
      const contentLength = req.headers.get('content-length');
      if (contentLength) {
        return parseInt(contentLength, 10);
      }
      
      // Se não tiver content-length, tentar calcular do body
      const body = await req.text();
      return Buffer.byteLength(body, 'utf8');
    } catch {
      return 0;
    }
  }

  /**
   * Calcula o tamanho da resposta
   */
  private static async getResponseSize(response: NextResponse): Promise<number> {
    try {
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        return parseInt(contentLength, 10);
      }
      
      // Estimar baseado no corpo da resposta
      const responseText = await response.text();
      return Buffer.byteLength(responseText, 'utf8');
    } catch {
      return 0;
    }
  }

  /**
   * Obtém o IP do cliente
   */
  private static getClientIP(req: NextRequest): string | undefined {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const remoteAddr = req.headers.get('remote-addr');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return realIP || remoteAddr || undefined;
  }

  /**
   * Envia métricas para o sistema de analytics
   */
  private static async trackAPIMetrics(metrics: APIPerformanceMetrics): Promise<void> {
    try {
      await analyticsCollector.trackEvent({
        category: 'api_performance',
        action: `${metrics.method}_${metrics.endpoint}`,
        label: `${metrics.statusCode}`,
        duration: metrics.responseTime,
        fileSize: metrics.requestSize + metrics.responseSize,
        status: metrics.statusCode >= 400 ? 'error' : 'success',
        errorCode: metrics.statusCode >= 400 ? metrics.statusCode.toString() : undefined,
        errorMessage: metrics.error,
        metadata: {
          endpoint: metrics.endpoint,
          method: metrics.method,
          statusCode: metrics.statusCode,
          responseTime: metrics.responseTime,
          requestSize: metrics.requestSize,
          responseSize: metrics.responseSize,
          userAgent: metrics.userAgent,
          ipAddress: metrics.ipAddress,
        }
      }, metrics.userId, metrics.organizationId);

      // Tracking adicional para endpoints específicos
      await this.trackEndpointSpecificMetrics(metrics);
      
    } catch (error) {
      console.error('[API Performance] Error tracking metrics:', error);
    }
  }

  /**
   * Tracking específico para diferentes tipos de endpoints
   */
  private static async trackEndpointSpecificMetrics(metrics: APIPerformanceMetrics): Promise<void> {
    const { endpoint, responseTime, statusCode, userId, organizationId } = metrics;

    // PPTX Processing
    if (endpoint.includes('/api/pptx/')) {
      await analyticsCollector.trackEvent({
        category: 'pptx_processing',
        action: 'api_call',
        duration: responseTime,
        status: statusCode >= 400 ? 'error' : 'success',
        metadata: { endpoint, statusCode, responseTime }
      }, userId, organizationId);
    }

    // TTS/Audio
    if (endpoint.includes('/api/tts/') || endpoint.includes('/api/voice/')) {
      await analyticsCollector.trackEvent({
        category: 'tts_processing',
        action: 'api_call',
        duration: responseTime,
        status: statusCode >= 400 ? 'error' : 'success',
        metadata: { endpoint, statusCode, responseTime }
      }, userId, organizationId);
    }

    // Render/Video
    if (endpoint.includes('/api/render/') || endpoint.includes('/api/video/')) {
      await analyticsCollector.trackEvent({
        category: 'video_processing',
        action: 'api_call',
        duration: responseTime,
        status: statusCode >= 400 ? 'error' : 'success',
        metadata: { endpoint, statusCode, responseTime }
      }, userId, organizationId);
    }

    // Analytics próprio
    if (endpoint.includes('/api/analytics/')) {
      await analyticsCollector.trackEvent({
        category: 'analytics_usage',
        action: 'api_call',
        duration: responseTime,
        status: statusCode >= 400 ? 'error' : 'success',
        metadata: { endpoint, statusCode, responseTime }
      }, userId, organizationId);
    }

    // Slow API detection (> 5 segundos)
    if (responseTime > 5000) {
      await analyticsCollector.trackEvent({
        category: 'performance_issue',
        action: 'slow_api_response',
        duration: responseTime,
        status: 'warning',
        metadata: { 
          endpoint, 
          responseTime, 
          threshold: 5000,
          severity: responseTime > 10000 ? 'critical' : 'warning'
        }
      }, userId, organizationId);
    }
  }
}

/**
 * Helper function para aplicar o middleware facilmente
 */
export function withAnalytics<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return APIPerformanceMiddleware.withPerformanceTracking(handler);
}

/**
 * Decorator para classes de API
 */
export function TrackPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    
    try {
      const result = await method.apply(this, args);
      const duration = Date.now() - startTime;
      
      await analyticsCollector.trackEvent({
        category: 'method_performance',
        action: `${target.constructor.name}.${propertyName}`,
        duration,
        status: 'success',
        metadata: { className: target.constructor.name, methodName: propertyName }
      });
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      await analyticsCollector.trackEvent({
        category: 'method_performance',
        action: `${target.constructor.name}.${propertyName}`,
        duration,
        status: 'error',
        errorMessage: error.message,
        metadata: { className: target.constructor.name, methodName: propertyName }
      });
      
      throw error;
    }
  };
  
  return descriptor;
}