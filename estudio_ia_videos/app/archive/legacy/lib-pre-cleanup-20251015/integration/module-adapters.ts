/**
 * 🔧 MODULE ADAPTERS
 * 
 * Adaptadores de compatibilidade para integrar módulos legados
 * com a nova arquitetura unificada.
 * 
 * @version 1.0.0
 * @date 08/10/2025
 */

// ============================================================================
// PPTX PROCESSOR ADAPTER
// ============================================================================

/**
 * Adaptador para o processador PPTX legado
 * Permite usar o novo sistema batch com interface antiga
 */
export class PPTXProcessorAdapter {
  private batchProcessor: any;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Importação dinâmica do novo processador
      const { BatchPPTXProcessor } = await import('../pptx/batch-processor');
      this.batchProcessor = new BatchPPTXProcessor();
      this.isInitialized = true;
      
      console.log('[PPTX Adapter] ✅ Inicializado com sucesso');
    } catch (error) {
      console.error('[PPTX Adapter] ❌ Erro na inicialização:', error);
      throw error;
    }
  }

  /**
   * Método compatível com sistema antigo
   * Internamente usa sistema novo
   */
  async processFile(file: File | Buffer, options: any = {}): Promise<any> {
    await this.initialize();

    // Converter opções do formato antigo para novo
    const newOptions = {
      generateNarration: options.enableTTS ?? false,
      analyzeQuality: options.validateQuality ?? true,
      convertAnimations: options.preserveAnimations ?? true,
      maxConcurrent: 1, // Simula comportamento antigo (1 arquivo por vez)
      ...options
    };

    try {
      // Processar com sistema novo
      const result = await this.batchProcessor.processBatch([file], newOptions);

      // Converter resultado para formato antigo
      return this.convertToLegacyFormat(result);
    } catch (error) {
      console.error('[PPTX Adapter] Erro no processamento:', error);
      throw error;
    }
  }

  /**
   * Converte resultado do novo formato para formato legado
   */
  private convertToLegacyFormat(newResult: any): any {
    const firstResult = newResult.results?.[0] || {};

    return {
      success: newResult.batch?.status === 'completed',
      slides: firstResult.slides || [],
      metadata: {
        totalSlides: firstResult.slides?.length || 0,
        hasAnimations: firstResult.metadata?.hasAnimations || false,
        hasSpeakerNotes: firstResult.metadata?.hasSpeakerNotes || false,
        qualityScore: firstResult.qualityAnalysis?.overallScore || 0,
        ...firstResult.metadata
      },
      narration: firstResult.narration || null,
      animations: firstResult.animations || [],
      qualityAnalysis: firstResult.qualityAnalysis || null,
      processingTime: newResult.batch?.processingTime || 0
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.initialize();
      return this.isInitialized;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// AVATAR SYSTEM ADAPTER
// ============================================================================

/**
 * Adaptador para sistemas de avatar (3D, Talking Photo, Vidnoz)
 */
export class AvatarSystemAdapter {
  private engines: Map<string, any> = new Map();
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Carregar engines disponíveis
      const { HyperrealAvatarEngine } = await import('../avatars/hyperreal-engine');
      const { VidnozAvatarEngine } = await import('../vidnoz-avatar-engine-real');
      const { TalkingPhotoEngine } = await import('../avatars/talking-photo-engine');

      this.engines.set('hyperreal', new HyperrealAvatarEngine());
      this.engines.set('vidnoz', new VidnozAvatarEngine());
      this.engines.set('talking-photo', new TalkingPhotoEngine());

      this.isInitialized = true;
      console.log('[Avatar Adapter] ✅ Inicializado com 3 engines');
    } catch (error) {
      console.error('[Avatar Adapter] ❌ Erro na inicialização:', error);
      // Continuar mesmo com erro - alguns engines podem não estar disponíveis
      this.isInitialized = true;
    }
  }

  /**
   * Renderiza avatar com engine especificado
   */
  async renderAvatar(options: {
    engine: 'hyperreal' | 'vidnoz' | 'talking-photo';
    avatarId: string;
    audioUrl?: string;
    text?: string;
    settings?: any;
  }): Promise<any> {
    await this.initialize();

    const engine = this.engines.get(options.engine);
    
    if (!engine) {
      throw new Error(`Engine não disponível: ${options.engine}`);
    }

    return engine.render(options);
  }

  /**
   * Lista avatares disponíveis
   */
  async listAvatars(engine?: string): Promise<any[]> {
    await this.initialize();

    if (engine) {
      const selectedEngine = this.engines.get(engine);
      return selectedEngine ? await selectedEngine.listAvatars() : [];
    }

    // Retornar avatares de todos os engines
    const allAvatars: any[] = [];
    
    for (const [engineName, engineInstance] of this.engines) {
      try {
        const avatars = await engineInstance.listAvatars();
        allAvatars.push(...avatars.map((a: any) => ({ ...a, engine: engineName })));
      } catch (error) {
        console.error(`[Avatar Adapter] Erro ao listar avatares de ${engineName}:`, error);
      }
    }

    return allAvatars;
  }

  async healthCheck(): Promise<boolean> {
    await this.initialize();
    return this.isInitialized;
  }
}

// ============================================================================
// TTS SERVICE ADAPTER
// ============================================================================

/**
 * Adaptador unificado para serviços TTS
 */
export class TTSServiceAdapter {
  private providers: Map<string, any> = new Map();
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Carregar providers TTS
      const { ElevenLabsProvider } = await import('../elevenlabs-provider');
      const { AzureTTSProvider } = await import('../tts/azure-provider');
      const { GoogleTTSProvider } = await import('../google-tts-service');

      this.providers.set('elevenlabs', new ElevenLabsProvider());
      this.providers.set('azure', new AzureTTSProvider());
      this.providers.set('google', new GoogleTTSProvider());

      this.isInitialized = true;
      console.log('[TTS Adapter] ✅ Inicializado com 3 providers');
    } catch (error) {
      console.error('[TTS Adapter] ❌ Erro na inicialização:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Sintetiza voz com provider especificado
   */
  async synthesize(options: {
    text: string;
    provider?: 'elevenlabs' | 'azure' | 'google';
    voiceId?: string;
    language?: string;
    settings?: any;
  }): Promise<Buffer | Blob> {
    await this.initialize();

    const provider = options.provider || 'azure'; // Default
    const ttsProvider = this.providers.get(provider);

    if (!ttsProvider) {
      throw new Error(`Provider TTS não disponível: ${provider}`);
    }

    return ttsProvider.synthesize({
      text: options.text,
      voiceId: options.voiceId,
      language: options.language || 'pt-BR',
      ...options.settings
    });
  }

  /**
   * Lista vozes disponíveis
   */
  async listVoices(provider?: string): Promise<any[]> {
    await this.initialize();

    if (provider) {
      const ttsProvider = this.providers.get(provider);
      return ttsProvider ? await ttsProvider.listVoices() : [];
    }

    // Retornar vozes de todos os providers
    const allVoices: any[] = [];
    
    for (const [providerName, providerInstance] of this.providers) {
      try {
        const voices = await providerInstance.listVoices();
        allVoices.push(...voices.map((v: any) => ({ ...v, provider: providerName })));
      } catch (error) {
        console.error(`[TTS Adapter] Erro ao listar vozes de ${providerName}:`, error);
      }
    }

    return allVoices;
  }

  async healthCheck(): Promise<boolean> {
    await this.initialize();
    return this.isInitialized;
  }
}

// ============================================================================
// RENDER ENGINE ADAPTER
// ============================================================================

/**
 * Adaptador para sistema de renderização
 */
export class RenderEngineAdapter {
  private renderEngine: any;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const { VideoRenderEngine } = await import('../video-render-engine');
      this.renderEngine = new VideoRenderEngine();
      this.isInitialized = true;
      
      console.log('[Render Adapter] ✅ Inicializado');
    } catch (error) {
      console.error('[Render Adapter] ❌ Erro na inicialização:', error);
      throw error;
    }
  }

  /**
   * Adiciona job de renderização à fila
   */
  async queueRender(options: {
    projectId: string;
    timeline: any;
    settings?: any;
  }): Promise<string> {
    await this.initialize();
    
    return this.renderEngine.queueRender(options);
  }

  /**
   * Obtém status de renderização
   */
  async getRenderStatus(jobId: string): Promise<any> {
    await this.initialize();
    
    return this.renderEngine.getStatus(jobId);
  }

  /**
   * Cancela renderização
   */
  async cancelRender(jobId: string): Promise<void> {
    await this.initialize();
    
    return this.renderEngine.cancel(jobId);
  }

  async healthCheck(): Promise<boolean> {
    await this.initialize();
    return this.isInitialized && this.renderEngine !== null;
  }
}

// ============================================================================
// ANALYTICS ADAPTER
// ============================================================================

/**
 * Adaptador para sistema de analytics
 */
export class AnalyticsAdapter {
  private analyticsService: any;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const { AnalyticsSystem } = await import('../analytics-system-real');
      this.analyticsService = new AnalyticsSystem();
      await this.analyticsService.initialize();
      
      this.isInitialized = true;
      console.log('[Analytics Adapter] ✅ Inicializado');
    } catch (error) {
      console.error('[Analytics Adapter] ❌ Erro na inicialização:', error);
      this.isInitialized = true; // Continuar sem analytics
    }
  }

  /**
   * Rastreia evento
   */
  async track(event: string, properties?: any): Promise<void> {
    await this.initialize();
    
    if (this.analyticsService) {
      await this.analyticsService.track(event, properties);
    }
  }

  /**
   * Obtém métricas
   */
  async getMetrics(options: any): Promise<any> {
    await this.initialize();
    
    if (this.analyticsService) {
      return this.analyticsService.getMetrics(options);
    }
    
    return null;
  }

  async healthCheck(): Promise<boolean> {
    await this.initialize();
    return this.isInitialized;
  }
}

// ============================================================================
// STORAGE ADAPTER
// ============================================================================

/**
 * Adaptador para sistema de storage (S3)
 */
export class StorageAdapter {
  private storageService: any;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const { S3StorageService } = await import('../aws/s3-storage');
      this.storageService = new S3StorageService();
      
      this.isInitialized = true;
      console.log('[Storage Adapter] ✅ Inicializado');
    } catch (error) {
      console.error('[Storage Adapter] ❌ Erro na inicialização:', error);
      throw error;
    }
  }

  /**
   * Upload de arquivo
   */
  async upload(file: Buffer | Blob, options: {
    bucket?: string;
    key: string;
    contentType?: string;
  }): Promise<string> {
    await this.initialize();
    
    return this.storageService.upload(file, options);
  }

  /**
   * Download de arquivo
   */
  async download(key: string, bucket?: string): Promise<Buffer> {
    await this.initialize();
    
    return this.storageService.download(key, bucket);
  }

  /**
   * Gera URL assinada
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    await this.initialize();
    
    return this.storageService.getSignedUrl(key, expiresIn);
  }

  async healthCheck(): Promise<boolean> {
    await this.initialize();
    return this.isInitialized;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const adapters = {
  pptx: new PPTXProcessorAdapter(),
  avatar: new AvatarSystemAdapter(),
  tts: new TTSServiceAdapter(),
  render: new RenderEngineAdapter(),
  analytics: new AnalyticsAdapter(),
  storage: new StorageAdapter()
};

export default adapters;
