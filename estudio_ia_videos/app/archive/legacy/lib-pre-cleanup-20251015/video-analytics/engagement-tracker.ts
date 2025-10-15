
/**
 * 📊 Estúdio IA de Vídeos - Sprint 5
 * Video Analytics Avançado - Sistema de Rastreamento de Engajamento
 * 
 * Funcionalidades:
 * - Rastreamento de visualização frame-by-frame
 * - Análise de retenção de audiência  
 * - Detecção de pontos de abandono
 * - Métricas de interação e engajamento
 * - Análise de sentiment em tempo real
 */

export interface VideoEngagementEvent {
  id: string;
  videoId: string;
  userId: string;
  sessionId: string;
  eventType: 'play' | 'pause' | 'seek' | 'volume' | 'quality' | 'fullscreen' | 'exit' | 'replay' | 'interaction';
  timestamp: number;
  currentTime: number;
  duration: number;
  metadata: {
    quality?: string;
    volume?: number;
    speed?: number;
    device?: string;
    browser?: string;
    viewport?: { width: number; height: number };
    geolocation?: { country: string; region: string };
  };
}

export interface VideoEngagementMetrics {
  videoId: string;
  totalViews: number;
  uniqueViews: number;
  averageWatchTime: number;
  completionRate: number;
  retentionCurve: Array<{ time: number; retention: number }>;
  dropOffPoints: Array<{ time: number; dropRate: number }>;
  interactionHeatmap: Array<{ time: number; interactions: number }>;
  qualityMetrics: {
    averageQuality: string;
    qualityChanges: number;
    bufferingEvents: number;
  };
  deviceMetrics: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geographicDistribution: Array<{ country: string; views: number }>;
}

export interface RealtimeEngagementData {
  currentViewers: number;
  peakViewers: number;
  averageViewTime: number;
  currentRetention: number;
  activeInteractions: number;
  sentimentScore: number;
}

class VideoEngagementTracker {
  private events: VideoEngagementEvent[] = [];
  private realtime: Map<string, RealtimeEngagementData> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  /**
   * 📊 Inicia rastreamento de engajamento para um vídeo
   */
  startTracking(videoId: string, userId: string, sessionId: string): void {
    console.log(`🎯 Iniciando rastreamento de engajamento para vídeo: ${videoId}`);
    
    this.trackEvent({
      id: this.generateEventId(),
      videoId,
      userId,
      sessionId,
      eventType: 'play',
      timestamp: Date.now(),
      currentTime: 0,
      duration: 0,
      metadata: {
        device: this.detectDevice(),
        browser: this.detectBrowser(),
        viewport: this.getViewportSize(),
        geolocation: this.getGeolocation()
      }
    });

    this.startHeartbeat(videoId, userId, sessionId);
  }

  /**
   * 📈 Registra evento de engajamento
   */
  trackEvent(event: VideoEngagementEvent): void {
    this.events.push(event);
    this.updateRealtimeMetrics(event);
    this.sendToAnalytics(event);
  }

  /**
   * ⏱️ Rastreamento em tempo real com heartbeat
   */
  private startHeartbeat(videoId: string, userId: string, sessionId: string): void {
    this.heartbeatInterval = setInterval(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      if (!video) return;

      this.trackEvent({
        id: this.generateEventId(),
        videoId,
        userId,
        sessionId,
        eventType: 'interaction',
        timestamp: Date.now(),
        currentTime: video.currentTime,
        duration: video.duration,
        metadata: {
          volume: video.volume,
          speed: video.playbackRate,
          quality: this.getCurrentQuality()
        }
      });
    }, 5000); // Heartbeat a cada 5 segundos
  }

  /**
   * 🔥 Calcula métricas de engajamento em tempo real
   */
  private updateRealtimeMetrics(event: VideoEngagementEvent): void {
    const current = this.realtime.get(event.videoId) || {
      currentViewers: 0,
      peakViewers: 0,
      averageViewTime: 0,
      currentRetention: 0,
      activeInteractions: 0,
      sentimentScore: 0.5
    };

    switch (event.eventType) {
      case 'play':
        current.currentViewers++;
        current.peakViewers = Math.max(current.peakViewers, current.currentViewers);
        break;
      case 'exit':
        current.currentViewers = Math.max(0, current.currentViewers - 1);
        break;
      case 'interaction':
        current.activeInteractions++;
        break;
    }

    this.realtime.set(event.videoId, current);
  }

  /**
   * 📊 Calcula métricas completas de engajamento
   */
  calculateEngagementMetrics(videoId: string): VideoEngagementMetrics {
    const videoEvents = this.events.filter(e => e.videoId === videoId);
    const sessions = this.groupEventsBySessions(videoEvents);

    return {
      videoId,
      totalViews: sessions.length,
      uniqueViews: new Set(videoEvents.map(e => e.userId)).size,
      averageWatchTime: this.calculateAverageWatchTime(sessions),
      completionRate: this.calculateCompletionRate(sessions),
      retentionCurve: this.calculateRetentionCurve(sessions),
      dropOffPoints: this.detectDropOffPoints(sessions),
      interactionHeatmap: this.generateInteractionHeatmap(videoEvents),
      qualityMetrics: this.calculateQualityMetrics(videoEvents),
      deviceMetrics: this.calculateDeviceMetrics(videoEvents),
      geographicDistribution: this.calculateGeographicDistribution(videoEvents)
    };
  }

  /**
   * 🔥 Detecta pontos críticos de abandono
   */
  private detectDropOffPoints(sessions: any[]): Array<{ time: number; dropRate: number }> {
    const dropOffPoints: Array<{ time: number; dropRate: number }> = [];
    const timeIntervals = 30; // Intervalos de 30 segundos
    
    for (let time = 0; time <= 3600; time += timeIntervals) {
      const viewersAtTime = sessions.filter(s => s.maxTime >= time).length;
      const viewersAtNextInterval = sessions.filter(s => s.maxTime >= time + timeIntervals).length;
      
      if (viewersAtTime > 0) {
        const dropRate = 1 - (viewersAtNextInterval / viewersAtTime);
        if (dropRate > 0.1) { // Drop significativo (>10%)
          dropOffPoints.push({ time, dropRate });
        }
      }
    }

    return dropOffPoints.sort((a, b) => b.dropRate - a.dropRate).slice(0, 10);
  }

  /**
   * 📈 Gera curva de retenção detalhada
   */
  private calculateRetentionCurve(sessions: any[]): Array<{ time: number; retention: number }> {
    const curve: Array<{ time: number; retention: number }> = [];
    const totalSessions = sessions.length;
    
    if (totalSessions === 0) return curve;

    for (let time = 0; time <= 3600; time += 15) { // A cada 15 segundos
      const remainingSessions = sessions.filter(s => s.maxTime >= time).length;
      const retention = remainingSessions / totalSessions;
      curve.push({ time, retention });
    }

    return curve;
  }

  /**
   * 🎯 Gera heatmap de interações
   */
  private generateInteractionHeatmap(events: VideoEngagementEvent[]): Array<{ time: number; interactions: number }> {
    const heatmap: Array<{ time: number; interactions: number }> = [];
    const interactionEvents = events.filter(e => 
      ['pause', 'seek', 'volume', 'quality', 'fullscreen', 'replay'].includes(e.eventType)
    );

    for (let time = 0; time <= 3600; time += 30) {
      const interactions = interactionEvents.filter(e => 
        e.currentTime >= time && e.currentTime < time + 30
      ).length;
      
      heatmap.push({ time, interactions });
    }

    return heatmap;
  }

  /**
   * 📱 Detecta dispositivo do usuário
   */
  private detectDevice(): string {
    if (typeof window === 'undefined') return 'server';
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad/.test(userAgent)) {
      return /ipad/.test(userAgent) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  /**
   * 🌐 Detecta navegador
   */
  private detectBrowser(): string {
    if (typeof window === 'undefined') return 'server';
    
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * 📏 Obtém dimensões da viewport
   */
  private getViewportSize(): { width: number; height: number } {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * 🌍 Obtém localização geográfica (simulada)
   */
  private getGeolocation(): { country: string; region: string } {
    // Em produção, isso seria obtido via IP geolocation service
    return {
      country: 'BR',
      region: 'SP'
    };
  }

  /**
   * 🎬 Obtém qualidade atual do vídeo
   */
  private getCurrentQuality(): string {
    // Lógica para detectar qualidade atual do vídeo
    return 'HD'; // Simplificado
  }

  /**
   * 🆔 Gera ID único para evento
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 📊 Agrupa eventos por sessões
   */
  private groupEventsBySessions(events: VideoEngagementEvent[]): any[] {
    const sessions = new Map();
    
    events.forEach(event => {
      if (!sessions.has(event.sessionId)) {
        sessions.set(event.sessionId, {
          sessionId: event.sessionId,
          userId: event.userId,
          events: [],
          startTime: event.timestamp,
          endTime: event.timestamp,
          maxTime: 0,
          totalInteractions: 0
        });
      }

      const session = sessions.get(event.sessionId);
      session.events.push(event);
      session.endTime = event.timestamp;
      session.maxTime = Math.max(session.maxTime, event.currentTime);
      
      if (['pause', 'seek', 'volume', 'quality'].includes(event.eventType)) {
        session.totalInteractions++;
      }
    });

    return Array.from(sessions.values());
  }

  /**
   * ⏱️ Calcula tempo médio de visualização
   */
  private calculateAverageWatchTime(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const totalTime = sessions.reduce((sum, session) => sum + session.maxTime, 0);
    return totalTime / sessions.length;
  }

  /**
   * 🎯 Calcula taxa de conclusão
   */
  private calculateCompletionRate(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const completedSessions = sessions.filter(session => {
      const duration = Math.max(...session.events.map((e: any) => e.duration));
      return session.maxTime >= duration * 0.95; // 95% considerado completo
    }).length;
    return completedSessions / sessions.length;
  }

  /**
   * 📊 Calcula métricas de qualidade
   */
  private calculateQualityMetrics(events: VideoEngagementEvent[]): any {
    const qualityEvents = events.filter(e => e.eventType === 'quality');
    return {
      averageQuality: 'HD',
      qualityChanges: qualityEvents.length,
      bufferingEvents: events.filter(e => e.metadata.quality === 'buffering').length
    };
  }

  /**
   * 📱 Calcula distribuição por dispositivo
   */
  private calculateDeviceMetrics(events: VideoEngagementEvent[]): any {
    const deviceCounts = events.reduce((acc, event) => {
      const device = event.metadata.device || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as any);

    return {
      desktop: deviceCounts.desktop || 0,
      mobile: deviceCounts.mobile || 0,
      tablet: deviceCounts.tablet || 0
    };
  }

  /**
   * 🌍 Calcula distribuição geográfica
   */
  private calculateGeographicDistribution(events: VideoEngagementEvent[]): any[] {
    const geoCounts = events.reduce((acc, event) => {
      const country = event.metadata.geolocation?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as any);

    return Object.entries(geoCounts).map(([country, views]) => ({
      country,
      views: views as number
    }));
  }

  /**
   * 📤 Envia dados para sistema de analytics
   */
  private async sendToAnalytics(event: VideoEngagementEvent): Promise<void> {
    try {
      // Implementação real enviaria para serviço de analytics
      console.log('📊 Enviando evento para analytics:', event.eventType);
    } catch (error) {
      console.error('❌ Erro ao enviar analytics:', error);
    }
  }

  /**
   * 🧹 Limpa recursos
   */
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Instância singleton
export const engagementTracker = new VideoEngagementTracker();

// Auto-inicialização
if (typeof window !== 'undefined') {
  // Escuta eventos do DOM para rastreamento automático
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Sistema de Video Analytics inicializado');
  });
}
