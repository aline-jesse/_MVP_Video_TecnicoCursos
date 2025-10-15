
/**
 * ✅ ANALYTICS TRACKER REAL - Sprint 43
 * Cliente para tracking de eventos com persistência DB
 */

export class AnalyticsTracker {
  
  /**
   * Registrar evento de analytics
   */
  static async trackEvent(params: {
    category: string;
    action: string;
    label?: string;
    metadata?: any;
    projectId?: string;
    duration?: number;
    fileSize?: number;
    errorCode?: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
    } catch (error) {
      console.error('❌ Erro ao registrar evento:', error);
    }
  }

  /**
   * Track PPTX upload
   */
  static async trackPPTXUpload(projectId: string, fileSize: number, duration: number) {
    await this.trackEvent({
      category: 'pptx',
      action: 'upload',
      projectId,
      fileSize,
      duration
    });
  }

  /**
   * Track TTS generation
   */
  static async trackTTSGeneration(provider: string, duration: number, characters: number) {
    await this.trackEvent({
      category: 'tts',
      action: 'generate',
      label: provider,
      duration,
      metadata: { characters }
    });
  }

  /**
   * Track video render
   */
  static async trackVideoRender(projectId: string, duration: number, format: string) {
    await this.trackEvent({
      category: 'render',
      action: 'complete',
      projectId,
      duration,
      metadata: { format }
    });
  }

  /**
   * Track error
   */
  static async trackError(category: string, action: string, errorCode: string, errorMessage: string) {
    await this.trackEvent({
      category,
      action,
      errorCode,
      errorMessage
    });
  }

  /**
   * Track timeline edit
   */
  static async trackTimelineEdit(projectId: string, action: string) {
    await this.trackEvent({
      category: 'timeline',
      action,
      projectId
    });
  }

  /**
   * Track collaboration action
   */
  static async trackCollaboration(action: string, projectId: string) {
    await this.trackEvent({
      category: 'collaboration',
      action,
      projectId
    });
  }

  /**
   * Track NR compliance validation
   */
  static async trackNRCompliance(nr: string, score: number, projectId: string) {
    await this.trackEvent({
      category: 'nr_compliance',
      action: 'validate',
      label: nr,
      projectId,
      metadata: { score }
    });
  }
}
