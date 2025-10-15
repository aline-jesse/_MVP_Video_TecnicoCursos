
/**
 * Mobile Analytics Events - Sprint 40
 * Rastreamento de eventos mobile avançados
 */

interface MobileGestureEvent {
  type: 'pinch' | 'pan' | 'rotate' | 'long-press' | 'swipe' | 'double-tap';
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  velocity?: { x: number; y: number };
  duration?: number;
  target?: string;
  timestamp: number;
}

interface OfflineEvent {
  type: 'edit' | 'create' | 'delete' | 'sync';
  action: string;
  resourceType: string;
  resourceId: string;
  data?: unknown;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'failed';
}

interface SyncMetrics {
  queueSize: number;
  syncedCount: number;
  failedCount: number;
  averageLatency: number;
  lastSyncTime: Date;
  retries: number;
}

interface PushMetrics {
  sent: number;
  delivered: number;
  clicked: number;
  averageLatency: number;
  errorRate: number;
}

export class MobileEventsTracker {
  private static events: (MobileGestureEvent | OfflineEvent)[] = [];
  private static maxEvents = 1000;

  // Rastrear gesture event
  static trackGesture(event: Omit<MobileGestureEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });

    this.pruneEvents();

    // Enviar para analytics backend
    this.sendToBackend('gesture', event);
  }

  // Rastrear evento offline
  static trackOfflineEvent(event: Omit<OfflineEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });

    this.pruneEvents();
    this.sendToBackend('offline', event);
  }

  // Calcular métricas de gestos
  static calculateGestureMetrics(period: '1h' | '24h' | '7d'): {
    totalGestures: number;
    byType: Record<string, number>;
    averageDuration: number;
    mostUsedGesture: string;
  } {
    const cutoff = this.getCutoffTime(period);
    const gestures = this.events.filter(
      e => 'type' in e && e.timestamp >= cutoff && 'scale' in e
    ) as MobileGestureEvent[];

    const byType: Record<string, number> = {};
    let totalDuration = 0;

    for (const gesture of gestures) {
      byType[gesture.type] = (byType[gesture.type] || 0) + 1;
      totalDuration += gesture.duration || 0;
    }

    const mostUsedGesture = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    return {
      totalGestures: gestures.length,
      byType,
      averageDuration: gestures.length > 0 ? totalDuration / gestures.length : 0,
      mostUsedGesture,
    };
  }

  // Calcular métricas de sync
  static calculateSyncMetrics(): SyncMetrics {
    const offlineEvents = this.events.filter(
      e => 'syncStatus' in e
    ) as OfflineEvent[];

    const pending = offlineEvents.filter(e => e.syncStatus === 'pending').length;
    const synced = offlineEvents.filter(e => e.syncStatus === 'synced').length;
    const failed = offlineEvents.filter(e => e.syncStatus === 'failed').length;

    // Calcular latência média (mockup - em produção, usar timestamps reais)
    const averageLatency = 250;

    return {
      queueSize: pending,
      syncedCount: synced,
      failedCount: failed,
      averageLatency,
      lastSyncTime: new Date(),
      retries: failed,
    };
  }

  // KPIs mobile
  static calculateMobileKPIs(period: '1h' | '24h' | '7d' | '30d'): {
    averageSessionDuration: number;
    syncErrorRate: number;
    pushLatency: number;
    retentionD7: number;
    retentionD30: number;
    dailyActiveUsers: number;
  } {
    const cutoff = this.getCutoffTime(period);

    // Simulação - em produção, calcular com dados reais
    return {
      averageSessionDuration: 12.5, // minutos
      syncErrorRate: 0.02, // 2%
      pushLatency: 1.2, // segundos
      retentionD7: 0.65, // 65%
      retentionD30: 0.42, // 42%
      dailyActiveUsers: 1250,
    };
  }

  // Análise de padrões de uso
  static analyzeUsagePatterns(): {
    peakHours: number[];
    mostUsedFeatures: string[];
    offlineUsagePercentage: number;
    averageOfflineEdits: number;
  } {
    // Análise baseada nos eventos
    const gestureMetrics = this.calculateGestureMetrics('7d');
    
    return {
      peakHours: [9, 10, 14, 15, 16], // Horários de pico
      mostUsedFeatures: Object.keys(gestureMetrics.byType).slice(0, 5),
      offlineUsagePercentage: 0.15, // 15% de uso offline
      averageOfflineEdits: 3.2, // Edições médias offline
    };
  }

  // Enviar para backend
  private static sendToBackend(type: string, event: unknown): void {
    // Em produção, fazer POST para /api/analytics/mobile-events
    if (typeof window !== 'undefined' && navigator.onLine) {
      fetch('/api/analytics/mobile-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, event }),
      }).catch(console.error);
    }
  }

  // Limpar eventos antigos
  private static pruneEvents(): void {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  // Obter cutoff time
  private static getCutoffTime(period: string): number {
    const now = Date.now();
    const hours = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
    return now - (hours[period as keyof typeof hours] || 24) * 3600 * 1000;
  }
}
