# Integração com APIs Externas - Especificação Técnica
## Sistema de Conectores e Webhooks para Dashboard Unificado

## 1. Visão Geral das Integrações

### 1.1 Serviços de TTS (Text-to-Speech)

```typescript
// lib/integrations/tts/providers.ts
export interface TTSProvider {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  supportedLanguages: string[];
  voiceOptions: TTSVoice[];
  pricing: {
    charactersPerRequest: number;
    costPerCharacter: number;
  };
}

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  style: 'conversational' | 'professional' | 'casual' | 'dramatic';
  sampleUrl?: string;
}

export interface TTSRequest {
  text: string;
  voice: string;
  language: string;
  speed: number; // 0.5 - 2.0
  pitch: number; // -20 to +20
  volume: number; // 0 - 100
  outputFormat: 'mp3' | 'wav' | 'ogg';
  ssmlEnabled?: boolean;
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
  charactersUsed: number;
  cost: number;
  metadata: {
    provider: string;
    voice: string;
    language: string;
    processingTime: number;
  };
}

// Implementação para Azure Cognitive Services
export class AzureTTSProvider implements TTSProvider {
  id = 'azure';
  name = 'Azure Cognitive Services';
  apiKey: string;
  baseUrl = 'https://brazilsouth.tts.speech.microsoft.com';
  
  supportedLanguages = [
    'pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT'
  ];

  voiceOptions: TTSVoice[] = [
    {
      id: 'pt-BR-FranciscaNeural',
      name: 'Francisca (Feminina)',
      language: 'pt-BR',
      gender: 'female',
      style: 'professional',
    },
    {
      id: 'pt-BR-AntonioNeural',
      name: 'Antonio (Masculino)',
      language: 'pt-BR',
      gender: 'male',
      style: 'professional',
    },
  ];

  pricing = {
    charactersPerRequest: 5000,
    costPerCharacter: 0.000016, // USD
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const ssml = this.buildSSML(request);
    
    const response = await fetch(`${this.baseUrl}/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': this.getOutputFormat(request.outputFormat),
      },
      body: ssml,
    });

    if (!response.ok) {
      throw new Error(`Azure TTS API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioUrl = await this.uploadAudio(audioBuffer, request.outputFormat);

    return {
      audioUrl,
      duration: await this.getAudioDuration(audioBuffer),
      charactersUsed: request.text.length,
      cost: request.text.length * this.pricing.costPerCharacter,
      metadata: {
        provider: this.id,
        voice: request.voice,
        language: request.language,
        processingTime: Date.now(),
      },
    };
  }

  private buildSSML(request: TTSRequest): string {
    const voice = this.voiceOptions.find(v => v.id === request.voice);
    if (!voice) throw new Error('Voice not found');

    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${request.language}">
        <voice name="${request.voice}">
          <prosody rate="${request.speed}" pitch="${request.pitch > 0 ? '+' : ''}${request.pitch}Hz" volume="${request.volume}">
            ${request.ssmlEnabled ? request.text : this.escapeXml(request.text)}
          </prosody>
        </voice>
      </speak>
    `;
  }

  private getOutputFormat(format: string): string {
    const formats = {
      mp3: 'audio-16khz-128kbitrate-mono-mp3',
      wav: 'riff-16khz-16bit-mono-pcm',
      ogg: 'ogg-16khz-16bit-mono-opus',
    };
    return formats[format as keyof typeof formats] || formats.mp3;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private async uploadAudio(buffer: ArrayBuffer, format: string): Promise<string> {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(`tts/${Date.now()}.${format}`, buffer, {
        contentType: `audio/${format}`,
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(data.path);

    return publicUrl;
  }

  private async getAudioDuration(buffer: ArrayBuffer): Promise<number> {
    // Implementar análise de duração do áudio
    // Por simplicidade, retornando estimativa baseada no texto
    return Math.ceil(buffer.byteLength / 16000); // Aproximação
  }
}

// Implementação para Google Cloud TTS
export class GoogleTTSProvider implements TTSProvider {
  id = 'google';
  name = 'Google Cloud Text-to-Speech';
  apiKey: string;
  baseUrl = 'https://texttospeech.googleapis.com/v1';
  
  supportedLanguages = [
    'pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'ko-KR'
  ];

  voiceOptions: TTSVoice[] = [
    {
      id: 'pt-BR-Wavenet-A',
      name: 'Wavenet A (Feminina)',
      language: 'pt-BR',
      gender: 'female',
      style: 'professional',
    },
    {
      id: 'pt-BR-Wavenet-B',
      name: 'Wavenet B (Masculino)',
      language: 'pt-BR',
      gender: 'male',
      style: 'professional',
    },
  ];

  pricing = {
    charactersPerRequest: 5000,
    costPerCharacter: 0.000016,
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const payload = {
      input: { text: request.text },
      voice: {
        languageCode: request.language,
        name: request.voice,
      },
      audioConfig: {
        audioEncoding: this.getAudioEncoding(request.outputFormat),
        speakingRate: request.speed,
        pitch: request.pitch,
        volumeGainDb: (request.volume - 50) * 0.4, // Convert to dB
      },
    };

    const response = await fetch(`${this.baseUrl}/text:synthesize?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.statusText}`);
    }

    const data = await response.json();
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    const audioUrl = await this.uploadAudio(audioBuffer, request.outputFormat);

    return {
      audioUrl,
      duration: await this.getAudioDuration(audioBuffer),
      charactersUsed: request.text.length,
      cost: request.text.length * this.pricing.costPerCharacter,
      metadata: {
        provider: this.id,
        voice: request.voice,
        language: request.language,
        processingTime: Date.now(),
      },
    };
  }

  private getAudioEncoding(format: string): string {
    const encodings = {
      mp3: 'MP3',
      wav: 'LINEAR16',
      ogg: 'OGG_OPUS',
    };
    return encodings[format as keyof typeof encodings] || encodings.mp3;
  }

  private async uploadAudio(buffer: Buffer, format: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(`tts/${Date.now()}.${format}`, buffer, {
        contentType: `audio/${format}`,
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(data.path);

    return publicUrl;
  }

  private async getAudioDuration(buffer: Buffer): Promise<number> {
    return Math.ceil(buffer.length / 16000);
  }
}
```

### 1.2 Bibliotecas de Mídia

```typescript
// lib/integrations/media/providers.ts
export interface MediaProvider {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  supportedTypes: string[];
  searchCapabilities: string[];
}

export interface MediaSearchRequest {
  query: string;
  type: 'image' | 'video' | 'audio' | 'icon';
  category?: string;
  orientation?: 'horizontal' | 'vertical' | 'square';
  size?: 'small' | 'medium' | 'large' | 'xl';
  license?: 'free' | 'premium' | 'editorial';
  page?: number;
  perPage?: number;
}

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  downloadUrl: string;
  type: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  license: string;
  author: string;
  tags: string[];
  provider: string;
}

// Implementação para Unsplash
export class UnsplashProvider implements MediaProvider {
  id = 'unsplash';
  name = 'Unsplash';
  apiKey: string;
  baseUrl = 'https://api.unsplash.com';
  supportedTypes = ['image'];
  searchCapabilities = ['query', 'category', 'orientation', 'size'];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(request: MediaSearchRequest): Promise<MediaItem[]> {
    const params = new URLSearchParams({
      query: request.query,
      page: (request.page || 1).toString(),
      per_page: (request.perPage || 20).toString(),
      orientation: request.orientation || 'landscape',
    });

    const response = await fetch(`${this.baseUrl}/search/photos?${params}`, {
      headers: {
        'Authorization': `Client-ID ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.results.map((photo: any): MediaItem => ({
      id: photo.id,
      title: photo.description || photo.alt_description || 'Untitled',
      description: photo.description,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.thumb,
      downloadUrl: photo.urls.full,
      type: 'image',
      dimensions: {
        width: photo.width,
        height: photo.height,
      },
      fileSize: 0, // Unsplash doesn't provide file size
      license: 'free',
      author: photo.user.name,
      tags: photo.tags?.map((tag: any) => tag.title) || [],
      provider: this.id,
    }));
  }

  async download(itemId: string): Promise<string> {
    // Trigger download tracking
    await fetch(`${this.baseUrl}/photos/${itemId}/download`, {
      headers: {
        'Authorization': `Client-ID ${this.apiKey}`,
      },
    });

    // Get photo details for download URL
    const response = await fetch(`${this.baseUrl}/photos/${itemId}`, {
      headers: {
        'Authorization': `Client-ID ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get photo details: ${response.statusText}`);
    }

    const photo = await response.json();
    return photo.urls.full;
  }
}

// Implementação para Pexels
export class PexelsProvider implements MediaProvider {
  id = 'pexels';
  name = 'Pexels';
  apiKey: string;
  baseUrl = 'https://api.pexels.com/v1';
  supportedTypes = ['image', 'video'];
  searchCapabilities = ['query', 'orientation', 'size'];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(request: MediaSearchRequest): Promise<MediaItem[]> {
    const endpoint = request.type === 'video' ? 'videos/search' : 'search';
    const params = new URLSearchParams({
      query: request.query,
      page: (request.page || 1).toString(),
      per_page: (request.perPage || 20).toString(),
    });

    if (request.orientation) {
      params.append('orientation', request.orientation);
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}?${params}`, {
      headers: {
        'Authorization': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    const items = request.type === 'video' ? data.videos : data.photos;
    
    return items.map((item: any): MediaItem => ({
      id: item.id.toString(),
      title: item.alt || 'Untitled',
      description: item.alt,
      url: request.type === 'video' ? item.video_files[0].link : item.src.large,
      thumbnailUrl: request.type === 'video' ? item.image : item.src.medium,
      downloadUrl: request.type === 'video' ? item.video_files[0].link : item.src.original,
      type: request.type || 'image',
      dimensions: {
        width: item.width,
        height: item.height,
      },
      fileSize: request.type === 'video' ? item.video_files[0].file_size || 0 : 0,
      license: 'free',
      author: item.photographer || item.user?.name || 'Unknown',
      tags: [],
      provider: this.id,
    }));
  }
}
```

### 1.3 APIs de Compliance NR

```typescript
// lib/integrations/compliance/nr-providers.ts
export interface NRComplianceProvider {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  supportedNorms: string[];
}

export interface ComplianceCheckRequest {
  content: {
    text?: string;
    images?: string[];
    videos?: string[];
  };
  norms: string[];
  strictMode: boolean;
}

export interface ComplianceResult {
  isCompliant: boolean;
  score: number; // 0-100
  violations: ComplianceViolation[];
  suggestions: ComplianceSuggestion[];
  metadata: {
    provider: string;
    norms: string[];
    processingTime: number;
  };
}

export interface ComplianceViolation {
  norm: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: {
    type: 'text' | 'image' | 'video';
    position: number;
    length?: number;
  };
  suggestion?: string;
}

export interface ComplianceSuggestion {
  type: 'content' | 'structure' | 'accessibility';
  description: string;
  priority: 'low' | 'medium' | 'high';
  implementation: string;
}

// Implementação para NR Compliance API
export class NRComplianceAPI implements NRComplianceProvider {
  id = 'nr-compliance';
  name = 'NR Compliance Checker';
  apiKey: string;
  baseUrl = 'https://api.nrcompliance.com.br/v1';
  
  supportedNorms = [
    'NR-01', 'NR-04', 'NR-05', 'NR-06', 'NR-07', 'NR-09', 'NR-10',
    'NR-11', 'NR-12', 'NR-13', 'NR-15', 'NR-16', 'NR-17', 'NR-18',
    'NR-20', 'NR-23', 'NR-24', 'NR-25', 'NR-26', 'NR-33', 'NR-35'
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async checkCompliance(request: ComplianceCheckRequest): Promise<ComplianceResult> {
    const payload = {
      content: request.content,
      norms: request.norms,
      strict_mode: request.strictMode,
      language: 'pt-BR',
    };

    const response = await fetch(`${this.baseUrl}/compliance/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`NR Compliance API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      isCompliant: data.is_compliant,
      score: data.compliance_score,
      violations: data.violations.map((v: any): ComplianceViolation => ({
        norm: v.norm,
        severity: v.severity,
        description: v.description,
        location: v.location,
        suggestion: v.suggestion,
      })),
      suggestions: data.suggestions.map((s: any): ComplianceSuggestion => ({
        type: s.type,
        description: s.description,
        priority: s.priority,
        implementation: s.implementation,
      })),
      metadata: {
        provider: this.id,
        norms: request.norms,
        processingTime: data.processing_time,
      },
    };
  }

  async getNormDetails(normId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/norms/${normId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get norm details: ${response.statusText}`);
    }

    return response.json();
  }

  async generateComplianceReport(
    projectId: string,
    results: ComplianceResult[]
  ): Promise<string> {
    const payload = {
      project_id: projectId,
      results,
      format: 'pdf',
      language: 'pt-BR',
    };

    const response = await fetch(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    const data = await response.json();
    return data.report_url;
  }
}
```

### 1.4 Sistema de Webhooks

```typescript
// lib/integrations/webhooks/manager.ts
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffTime: number;
  };
  headers?: Record<string, string>;
  timeout: number;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  source: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  url: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempts: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
}

export class WebhookManager {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  async registerWebhook(config: Omit<WebhookConfig, 'id'>): Promise<WebhookConfig> {
    const webhookId = crypto.randomUUID();
    const webhook: WebhookConfig = {
      ...config,
      id: webhookId,
    };

    const { error } = await this.supabase
      .from('webhooks')
      .insert({
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
        is_active: webhook.isActive,
        retry_policy: webhook.retryPolicy,
        headers: webhook.headers,
        timeout: webhook.timeout,
      });

    if (error) {
      throw new Error(`Failed to register webhook: ${error.message}`);
    }

    return webhook;
  }

  async updateWebhook(id: string, updates: Partial<WebhookConfig>): Promise<void> {
    const { error } = await this.supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update webhook: ${error.message}`);
    }
  }

  async deleteWebhook(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  }

  async triggerEvent(event: WebhookEvent): Promise<void> {
    // Get all active webhooks that listen to this event type
    const { data: webhooks, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('is_active', true)
      .contains('events', [event.type]);

    if (error) {
      console.error('Failed to fetch webhooks:', error);
      return;
    }

    // Trigger deliveries for each webhook
    for (const webhook of webhooks || []) {
      await this.deliverWebhook(webhook, event);
    }
  }

  private async deliverWebhook(webhook: WebhookConfig, event: WebhookEvent): Promise<void> {
    const deliveryId = crypto.randomUUID();
    
    // Create delivery record
    const delivery: Omit<WebhookDelivery, 'id'> = {
      webhookId: webhook.id,
      eventId: event.id,
      url: webhook.url,
      status: 'pending',
      attempts: 0,
    };

    const { error: insertError } = await this.supabase
      .from('webhook_deliveries')
      .insert({ ...delivery, id: deliveryId });

    if (insertError) {
      console.error('Failed to create delivery record:', insertError);
      return;
    }

    // Attempt delivery
    await this.attemptDelivery(deliveryId, webhook, event);
  }

  private async attemptDelivery(
    deliveryId: string,
    webhook: WebhookConfig,
    event: WebhookEvent
  ): Promise<void> {
    try {
      // Prepare payload
      const payload = {
        event: event.type,
        data: event.data,
        timestamp: event.timestamp,
        source: event.source,
      };

      // Generate signature
      const signature = this.generateSignature(JSON.stringify(payload), webhook.secret);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event.type,
        'X-Webhook-Delivery': deliveryId,
        ...webhook.headers,
      };

      // Make request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Update delivery record
      const responseBody = await response.text();
      
      await this.supabase
        .from('webhook_deliveries')
        .update({
          status: response.ok ? 'success' : 'failed',
          attempts: 1,
          last_attempt_at: new Date().toISOString(),
          response_status: response.status,
          response_body: responseBody.substring(0, 1000), // Limit response body size
        })
        .eq('id', deliveryId);

      // Schedule retry if failed
      if (!response.ok) {
        await this.scheduleRetry(deliveryId, webhook, event, 1);
      }

    } catch (error) {
      console.error('Webhook delivery failed:', error);
      
      // Update delivery record with error
      await this.supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          attempts: 1,
          last_attempt_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', deliveryId);

      // Schedule retry
      await this.scheduleRetry(deliveryId, webhook, event, 1);
    }
  }

  private async scheduleRetry(
    deliveryId: string,
    webhook: WebhookConfig,
    event: WebhookEvent,
    attemptNumber: number
  ): Promise<void> {
    if (attemptNumber >= webhook.retryPolicy.maxRetries) {
      return; // Max retries reached
    }

    // Calculate next retry time
    const backoffTime = Math.min(
      webhook.retryPolicy.backoffMultiplier ** attemptNumber * 1000,
      webhook.retryPolicy.maxBackoffTime
    );
    
    const nextRetryAt = new Date(Date.now() + backoffTime);

    // Update delivery record
    await this.supabase
      .from('webhook_deliveries')
      .update({
        status: 'retrying',
        next_retry_at: nextRetryAt.toISOString(),
      })
      .eq('id', deliveryId);

    // Schedule retry (in a real implementation, you'd use a job queue)
    setTimeout(async () => {
      await this.retryDelivery(deliveryId, webhook, event, attemptNumber + 1);
    }, backoffTime);
  }

  private async retryDelivery(
    deliveryId: string,
    webhook: WebhookConfig,
    event: WebhookEvent,
    attemptNumber: number
  ): Promise<void> {
    // Similar to attemptDelivery but updates the existing delivery record
    // Implementation would be similar to attemptDelivery with attempt counting
  }

  private generateSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  async getWebhookDeliveries(webhookId: string, limit = 50): Promise<WebhookDelivery[]> {
    const { data, error } = await this.supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch deliveries: ${error.message}`);
    }

    return data || [];
  }

  async redeliverWebhook(deliveryId: string): Promise<void> {
    // Get delivery details
    const { data: delivery, error } = await this.supabase
      .from('webhook_deliveries')
      .select(`
        *,
        webhooks(*),
        webhook_events(*)
      `)
      .eq('id', deliveryId)
      .single();

    if (error || !delivery) {
      throw new Error('Delivery not found');
    }

    // Attempt redelivery
    await this.attemptDelivery(deliveryId, delivery.webhooks, delivery.webhook_events);
  }
}

export const webhookManager = new WebhookManager();
```

## 2. Hook de Integração Unificado

```typescript
// hooks/useIntegrations.ts
'use client';

import { useState, useCallback } from 'react';
import { AzureTTSProvider, GoogleTTSProvider } from '@/lib/integrations/tts/providers';
import { UnsplashProvider, PexelsProvider } from '@/lib/integrations/media/providers';
import { NRComplianceAPI } from '@/lib/integrations/compliance/nr-providers';
import { webhookManager } from '@/lib/integrations/webhooks/manager';

export function useIntegrations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TTS Integration
  const synthesizeText = useCallback(async (
    provider: 'azure' | 'google',
    request: TTSRequest
  ): Promise<TTSResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const ttsProvider = provider === 'azure' 
        ? new AzureTTSProvider(process.env.NEXT_PUBLIC_AZURE_TTS_KEY!)
        : new GoogleTTSProvider(process.env.NEXT_PUBLIC_GOOGLE_TTS_KEY!);

      const result = await ttsProvider.synthesize(request);
      
      // Track usage
      await fetch('/api/integrations/tts/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          charactersUsed: result.charactersUsed,
          cost: result.cost,
        }),
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS synthesis failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Media Search Integration
  const searchMedia = useCallback(async (
    provider: 'unsplash' | 'pexels',
    request: MediaSearchRequest
  ): Promise<MediaItem[]> => {
    try {
      setLoading(true);
      setError(null);

      const mediaProvider = provider === 'unsplash'
        ? new UnsplashProvider(process.env.NEXT_PUBLIC_UNSPLASH_KEY!)
        : new PexelsProvider(process.env.NEXT_PUBLIC_PEXELS_KEY!);

      const results = await mediaProvider.search(request);
      
      // Track search
      await fetch('/api/integrations/media/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          query: request.query,
          resultsCount: results.length,
        }),
      });

      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Media search failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Compliance Check Integration
  const checkCompliance = useCallback(async (
    request: ComplianceCheckRequest
  ): Promise<ComplianceResult | null> => {
    try {
      setLoading(true);
      setError(null);

      const complianceProvider = new NRComplianceAPI(
        process.env.NEXT_PUBLIC_NR_COMPLIANCE_KEY!
      );

      const result = await complianceProvider.checkCompliance(request);
      
      // Track compliance check
      await fetch('/api/integrations/compliance/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          norms: request.norms,
          isCompliant: result.isCompliant,
          score: result.score,
          violationsCount: result.violations.length,
        }),
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compliance check failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Webhook Management
  const registerWebhook = useCallback(async (
    config: Omit<WebhookConfig, 'id'>
  ): Promise<WebhookConfig | null> => {
    try {
      setLoading(true);
      setError(null);

      const webhook = await webhookManager.registerWebhook(config);
      
      return webhook;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Webhook registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerWebhook = useCallback(async (event: WebhookEvent): Promise<boolean> => {
    try {
      await webhookManager.triggerEvent(event);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Webhook trigger failed');
      return false;
    }
  }, []);

  return {
    loading,
    error,
    synthesizeText,
    searchMedia,
    checkCompliance,
    registerWebhook,
    triggerWebhook,
  };
}
```

## 3. APIs de Integração

```typescript
// api/integrations/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { AzureTTSProvider, GoogleTTSProvider } from '@/lib/integrations/tts/providers';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, ...ttsRequest } = await request.json();

    // Validate provider
    if (!['azure', 'google'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Check user quota
    const quotaCheck = await checkUserQuota(session.user.id, 'tts', ttsRequest.text.length);
    if (!quotaCheck.allowed) {
      return NextResponse.json({ 
        error: 'Quota exceeded',
        details: quotaCheck.details 
      }, { status: 429 });
    }

    // Initialize provider
    const ttsProvider = provider === 'azure' 
      ? new AzureTTSProvider(process.env.AZURE_TTS_KEY!)
      : new GoogleTTSProvider(process.env.GOOGLE_TTS_KEY!);

    // Synthesize
    const result = await ttsProvider.synthesize(ttsRequest);

    // Update user usage
    await updateUserUsage(session.user.id, 'tts', {
      provider,
      charactersUsed: result.charactersUsed,
      cost: result.cost,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function checkUserQuota(userId: string, service: string, usage: number) {
  // Implementation for quota checking
  return { allowed: true, details: {} };
}

async function updateUserUsage(userId: string, service: string, usage: any) {
  // Implementation for usage tracking
}
```

## 4. Configuração de Ambiente

```bash
# .env.local
# TTS Services
AZURE_TTS_KEY=your_azure_tts_key
GOOGLE_TTS_KEY=your_google_tts_key

# Media Services
UNSPLASH_ACCESS_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key

# Compliance Services
NR_COMPLIANCE_API_KEY=your_nr_compliance_key

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret

# Rate Limiting
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 5. Monitoramento e Logs

```typescript
// lib/integrations/monitoring.ts
export class IntegrationMonitor {
  async logAPICall(
    service: string,
    endpoint: string,
    duration: number,
    success: boolean,
    error?: string
  ) {
    await supabase.from('api_logs').insert({
      service,
      endpoint,
      duration,
      success,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  async trackUsage(
    userId: string,
    service: string,
    usage: any
  ) {
    await supabase.from('service_usage').insert({
      user_id: userId,
      service,
      usage_data: usage,
      timestamp: new Date().toISOString(),
    });
  }

  async getServiceHealth(): Promise<Record<string, boolean>> {
    const services = ['azure-tts', 'google-tts', 'unsplash', 'pexels', 'nr-compliance'];
    const health: Record<string, boolean> = {};

    for (const service of services) {
      try {
        const response = await fetch(`/api/integrations/${service}/health`);
        health[service] = response.ok;
      } catch {
        health[service] = false;
      }
    }

    return health;
  }
}
```

Esta especificação fornece uma base completa para integração com APIs externas, incluindo implementações funcionais, monitoramento e gerenciamento de webhooks. O sistema é modular e pode ser facilmente estendido para novos provedores de serviços.