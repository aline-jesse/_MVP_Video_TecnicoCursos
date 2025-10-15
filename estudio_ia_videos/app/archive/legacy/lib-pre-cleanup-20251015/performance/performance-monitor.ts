
/**
 * 📊 Sistema de Monitoramento de Performance Real-Time
 * Monitora CPU, memória, latência de APIs e métricas do sistema
 */

'use client';

import { EventEmitter } from 'events';

export interface PerformanceMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    load: number[];
    threads: number;
  };
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
    heap: {
      used: number;
      total: number;
      limit: number;
    };
  };
  network: {
    requests: number;
    responses: number;
    errors: number;
    avgLatency: number;
  };
  performance: {
    renderTime: number;
    jsHeapSize: number;
    domNodes: number;
    fps: number;
  };
  apis: {
    [endpoint: string]: {
      calls: number;
      avgResponseTime: number;
      errors: number;
      lastCall: number;
    };
  };
}

export interface AlertThresholds {
  cpu: number;
  memory: number;
  latency: number;
  errorRate: number;
}

class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private currentMetrics: Partial<PerformanceMetrics> = {};
  private intervalId: NodeJS.Timeout | null = null;
  private apiCallTracker = new Map<string, number[]>();
  private thresholds: AlertThresholds = {
    cpu: 80,
    memory: 85,
    latency: 2000,
    errorRate: 10
  };

  constructor() {
    super();
    this.initializeMonitoring();
  }

  /**
   * Inicializa o monitoramento contínuo
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitora a cada 1 segundo
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, 1000);

    // Observer para mudanças de performance
    this.setupPerformanceObserver();
    
    // Monitora APIs
    this.setupNetworkMonitoring();
  }

  /**
   * Coleta métricas do sistema
   */
  private collectMetrics(): void {
    if (typeof window === 'undefined') return;

    const timestamp = Date.now();
    
    const metrics: PerformanceMetrics = {
      timestamp,
      cpu: this.getCPUMetrics(),
      memory: this.getMemoryMetrics(),
      network: this.getNetworkMetrics(),
      performance: this.getPerformanceMetrics(),
      apis: this.getAPIMetrics()
    };

    this.metrics.push(metrics);
    
    // Manter apenas os últimos 60 pontos (1 minuto)
    if (this.metrics.length > 60) {
      this.metrics.shift();
    }

    this.currentMetrics = metrics;
    this.emit('metrics', metrics);
    this.checkAlerts(metrics);
  }

  /**
   * Obtém métricas de CPU (simuladas no browser)
   */
  private getCPUMetrics() {
    // No browser, simulamos baseado em performance
    const now = performance.now();
    let usage = 0;
    
    // Teste de CPU intensivo rápido
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      Math.random();
    }
    const cpuTime = performance.now() - start;
    
    usage = Math.min(100, cpuTime * 10);

    return {
      usage: Math.round(usage),
      load: [usage / 100, usage / 100, usage / 100],
      threads: navigator.hardwareConcurrency || 4
    };
  }

  /**
   * Obtém métricas de memória
   */
  private getMemoryMetrics() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        free: memory.totalJSHeapSize - memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
        heap: {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        }
      };
    }

    // Fallback
    return {
      used: 0,
      free: 0,
      total: 0,
      percentage: 0,
      heap: { used: 0, total: 0, limit: 0 }
    };
  }

  /**
   * Obtém métricas de rede
   */
  private getNetworkMetrics() {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalRequests = resources.length;
    let totalLatency = 0;
    let errors = 0;

    resources.forEach(resource => {
      totalLatency += resource.duration;
      if (resource.name.includes('error') || resource.duration > 5000) {
        errors++;
      }
    });

    return {
      requests: totalRequests,
      responses: totalRequests - errors,
      errors,
      avgLatency: totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0
    };
  }

  /**
   * Obtém métricas de performance da UI
   */
  private getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      renderTime: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : 0,
      jsHeapSize: 'memory' in performance ? (performance as any).memory.usedJSHeapSize : 0,
      domNodes: document.querySelectorAll('*').length,
      fps: this.getFPS()
    };
  }

  /**
   * Obtém métricas das APIs
   */
  private getAPIMetrics() {
    const apis: PerformanceMetrics['apis'] = {};
    
    this.apiCallTracker.forEach((times, endpoint) => {
      const recentCalls = times.filter(time => Date.now() - time < 60000); // Último minuto
      const avgResponseTime = recentCalls.length > 0 
        ? recentCalls.reduce((a, b) => a + b, 0) / recentCalls.length 
        : 0;

      apis[endpoint] = {
        calls: recentCalls.length,
        avgResponseTime: Math.round(avgResponseTime),
        errors: 0, // TODO: Implementar tracking de erros
        lastCall: Math.max(...times)
      };
    });

    return apis;
  }

  /**
   * Calcula FPS aproximado
   */
  private getFPS(): number {
    // Implementação simplificada
    return 60; // TODO: Implementar cálculo real de FPS
  }

  /**
   * Configura observer para APIs
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.emit('navigationTiming', entry);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  /**
   * Monitora chamadas de rede
   */
  private setupNetworkMonitoring(): void {
    // Intercepta fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const url = args[0].toString();
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        this.trackAPICall(url, duration, response.ok);
        
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        this.trackAPICall(url, duration, false);
        throw error;
      }
    };
  }

  /**
   * Registra chamada de API
   */
  private trackAPICall(url: string, duration: number, success: boolean): void {
    if (!this.apiCallTracker.has(url)) {
      this.apiCallTracker.set(url, []);
    }
    
    const times = this.apiCallTracker.get(url)!;
    times.push(duration);
    
    // Manter apenas os últimos 100 registros
    if (times.length > 100) {
      times.shift();
    }

    this.emit('apiCall', { url, duration, success, timestamp: Date.now() });
  }

  /**
   * Verifica alertas baseados nos thresholds
   */
  private checkAlerts(metrics: PerformanceMetrics): void {
    const alerts: Array<{type: string, message: string, severity: 'low' | 'medium' | 'high'}> = [];

    // CPU
    if (metrics.cpu.usage > this.thresholds.cpu) {
      alerts.push({
        type: 'cpu',
        message: `CPU usage high: ${metrics.cpu.usage}%`,
        severity: metrics.cpu.usage > 90 ? 'high' : 'medium'
      });
    }

    // Memória
    if (metrics.memory.percentage > this.thresholds.memory) {
      alerts.push({
        type: 'memory',
        message: `Memory usage high: ${metrics.memory.percentage}%`,
        severity: metrics.memory.percentage > 95 ? 'high' : 'medium'
      });
    }

    // Latência
    if (metrics.network.avgLatency > this.thresholds.latency) {
      alerts.push({
        type: 'latency',
        message: `High latency: ${metrics.network.avgLatency}ms`,
        severity: metrics.network.avgLatency > 5000 ? 'high' : 'medium'
      });
    }

    if (alerts.length > 0) {
      this.emit('alerts', alerts);
    }
  }

  /**
   * Obtém métricas atuais
   */
  getCurrentMetrics(): Partial<PerformanceMetrics> {
    return { ...this.currentMetrics };
  }

  /**
   * Obtém histórico de métricas
   */
  getMetricsHistory(minutes: number = 1): PerformanceMetrics[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Configura thresholds de alerta
   */
  setThresholds(thresholds: Partial<AlertThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Inicia monitoramento manual
   */
  start(): void {
    if (!this.intervalId) {
      this.initializeMonitoring();
    }
  }

  /**
   * Para o monitoramento
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Limpa dados históricos
   */
  clearHistory(): void {
    this.metrics = [];
    this.apiCallTracker.clear();
  }

  /**
   * Exporta métricas para análise
   */
  exportMetrics(): {
    metrics: PerformanceMetrics[];
    apis: Map<string, number[]>;
    thresholds: AlertThresholds;
  } {
    return {
      metrics: [...this.metrics],
      apis: new Map(this.apiCallTracker),
      thresholds: { ...this.thresholds }
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Funções legacy mantidas para compatibilidade
export const prefetchCriticalRoutes = () => {
  if (typeof window !== 'undefined') {
    const routes = [
      '/dashboard',
      '/canvas-editor',
      '/timeline-editor',
      '/analytics',
    ]

    routes.forEach((route) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = route
      document.head.appendChild(link)
    })
  }
}

export const measurePerformance = (componentName: string) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          console.log(`⚡ [Performance] ${componentName}:`, entry.duration.toFixed(2), 'ms')
        }
      }
    })

    observer.observe({ entryTypes: ['measure'] })

    return {
      start: () => performance.mark(`${componentName}-start`),
      end: () => {
        performance.mark(`${componentName}-end`)
        performance.measure(
          componentName,
          `${componentName}-start`,
          `${componentName}-end`
        )
      },
    }
  }

  return {
    start: () => {},
    end: () => {},
  }
}

export const imageOptimization = {
  formats: ['avif', 'webp', 'jpg'] as const,
  
  sizes: {
    thumbnail: '(max-width: 640px) 100vw, 640px',
    card: '(max-width: 768px) 100vw, 768px',
    hero: '(max-width: 1920px) 100vw, 1920px',
  },

  quality: {
    high: 90,
    medium: 75,
    low: 60,
  },

  blurDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
}
