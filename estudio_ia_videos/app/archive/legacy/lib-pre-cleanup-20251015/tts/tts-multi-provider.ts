
/**
 * 🗣️ TTS Multi-Provider Service with Fallback
 * Providers: ElevenLabs (primary) → Azure Speech (fallback) → Google (last resort)
 * Features: Redis Cache, SSML support, Preview, Progress tracking
 */

import { createHash } from 'crypto';
import { redisCache } from '@/lib/cache/redis-cache';

export interface TTSProviderConfig {
  provider: 'elevenlabs' | 'azure' | 'google';
  apiKey?: string;
  region?: string;
  voice: string;
  language?: string;
  speed?: number;
  pitch?: number;
  ssml?: boolean;
}

export interface TTSRequest {
  text: string;
  provider?: 'elevenlabs' | 'azure' | 'google' | 'auto';
  voice?: string;
  language?: string;
  speed?: number;
  pitch?: number;
  ssml?: boolean;
  cache?: boolean;
  preview?: boolean;
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  audioBuffer?: ArrayBuffer;
  duration?: number;
  provider: string;
  cached?: boolean;
  cacheKey?: string;
  error?: string;
}

// Fallback: In-memory cache if Redis is not available
const memoryCache = new Map<string, { audioUrl: string; duration: number; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

export class TTSMultiProvider {
  private static instance: TTSMultiProvider;
  private elevenLabsKey: string = '';
  private azureSpeechKey: string = '';
  private azureRegion: string = '';

  private constructor() {
    // Carregar credenciais das variáveis de ambiente
    this.loadCredentials();
  }

  static getInstance(): TTSMultiProvider {
    if (!TTSMultiProvider.instance) {
      TTSMultiProvider.instance = new TTSMultiProvider();
    }
    return TTSMultiProvider.instance;
  }

  private loadCredentials(): void {
    // Load credentials from environment variables
    try {
      this.elevenLabsKey = process.env.ELEVENLABS_API_KEY || '';
      this.azureSpeechKey = process.env.AZURE_SPEECH_KEY || '';
      this.azureRegion = process.env.AZURE_SPEECH_REGION || 'brazilsouth';
      
      console.log('✅ TTS credentials loaded:', {
        elevenlabs: !!this.elevenLabsKey,
        azure: !!this.azureSpeechKey,
        region: this.azureRegion
      });
    } catch (error) {
      console.warn('⚠️ Could not load TTS credentials:', error);
    }
  }

  /**
   * Generate speech with automatic provider fallback
   */
  async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
    const cacheKey = this.generateCacheKey(request);

    // Check Redis cache first
    if (request.cache !== false) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        console.log('✅ TTS: Using cached audio (Redis)');
        return {
          success: true,
          audioUrl: cached.audioUrl,
          duration: cached.duration,
          provider: 'cache',
          cached: true,
          cacheKey
        };
      }
    }

    // Determine provider order
    const providers: Array<'elevenlabs' | 'azure' | 'google'> = 
      request.provider === 'auto' || !request.provider
        ? ['elevenlabs', 'azure', 'google']
        : [request.provider];

    let lastError: string = '';

    // Try each provider in order
    for (const provider of providers) {
      try {
        console.log(`🎤 TTS: Trying ${provider}...`);
        let result: TTSResponse;

        switch (provider) {
          case 'elevenlabs':
            result = await this.generateWithElevenLabs(request);
            break;
          case 'azure':
            result = await this.generateWithAzure(request);
            break;
          case 'google':
            result = await this.generateWithGoogle(request);
            break;
        }

        if (result.success && result.audioUrl) {
          // Cache the result in Redis
          if (request.cache !== false) {
            await this.addToCache(cacheKey, result.audioUrl, result.duration || 0);
          }
          return {
            ...result,
            cacheKey
          };
        }
      } catch (error: any) {
        lastError = error.message;
        console.warn(`⚠️ TTS: ${provider} failed:`, error.message);
      }
    }

    // All providers failed
    return {
      success: false,
      provider: 'none',
      error: `All TTS providers failed. Last error: ${lastError}`,
      cacheKey
    };
  }

  /**
   * ElevenLabs TTS (Primary)
   */
  private async generateWithElevenLabs(request: TTSRequest): Promise<TTSResponse> {
    if (!this.elevenLabsKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voice = request.voice || 'Adam'; // Default voice
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.elevenLabsKey
      },
      body: JSON.stringify({
        text: request.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs error: ${error}`);
    }

    // Convert to ArrayBuffer and upload to S3
    const audioBuffer = await response.arrayBuffer();
    const audioUrl = await this.uploadAudioToS3(audioBuffer, 'elevenlabs', 'mp3');
    
    // Estimate duration (rough estimate: 150 words/min, 1 word = 0.4s)
    const wordCount = request.text.split(/\s+/).length;
    const duration = (wordCount * 0.4);

    return {
      success: true,
      audioUrl,
      audioBuffer,
      duration,
      provider: 'elevenlabs'
    };
  }

  /**
   * Azure Speech TTS (Fallback)
   */
  private async generateWithAzure(request: TTSRequest): Promise<TTSResponse> {
    if (!this.azureSpeechKey || !this.azureRegion) {
      throw new Error('Azure Speech credentials not configured');
    }

    const voice = request.voice || 'pt-BR-FranciscaNeural';
    const language = request.language || 'pt-BR';

    // Build SSML
    const ssml = request.ssml 
      ? request.text
      : `<speak version='1.0' xml:lang='${language}'>
          <voice name='${voice}'>
            <prosody rate='${request.speed || 1.0}' pitch='${request.pitch || 1.0}'>
              ${request.text}
            </prosody>
          </voice>
        </speak>`;

    const url = `https://${this.azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.azureSpeechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3'
      },
      body: ssml
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Azure Speech error: ${error}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioUrl = await this.uploadAudioToS3(audioBuffer, 'azure', 'mp3');

    // Estimate duration
    const wordCount = request.text.split(/\s+/).length;
    const duration = (wordCount * 0.4) / (request.speed || 1.0);

    return {
      success: true,
      audioUrl,
      audioBuffer,
      duration,
      provider: 'azure'
    };
  }

  /**
   * Google Cloud TTS (Second Fallback)
   */
  private async generateWithGoogle(request: TTSRequest): Promise<TTSResponse> {
    // Call existing Google TTS API
    const response = await fetch('/api/tts/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: request.text,
        language: request.language || 'pt-BR',
        voice: request.voice || 'pt-BR-Standard-A',
        speed: request.speed || 1.0,
        pitch: request.pitch || 0
      })
    });

    if (!response.ok) {
      throw new Error('Google TTS API failed');
    }

    const data = await response.json();
    return {
      success: data.success,
      audioUrl: data.audioUrl,
      duration: data.duration,
      provider: 'google'
    };
  }

  /**
   * Upload audio to S3
   */
  private async uploadAudioToS3(buffer: ArrayBuffer, provider: string, format: string): Promise<string> {
    const fileName = `tts-${provider}-${Date.now()}.${format}`;
    
    // Use existing S3 upload function
    const { uploadFile } = await import('@/lib/s3');
    const s3Key = `audio/tts/${fileName}`;
    
    return await uploadFile(Buffer.from(buffer), s3Key, `audio/${format}`);
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(request: TTSRequest): string {
    const data = JSON.stringify({
      text: request.text,
      voice: request.voice,
      language: request.language,
      speed: request.speed,
      pitch: request.pitch
    });
    return createHash('md5').update(data).digest('hex');
  }

  /**
   * Get from cache (Redis with memory fallback)
   */
  private async getFromCache(key: string): Promise<{ audioUrl: string; duration: number } | null> {
    try {
      // Try Redis first
      const cached = await redisCache.get<{ audioUrl: string; duration: number }>(
        `tts:${key}`
      );
      
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn('⚠️ Redis cache read failed, trying memory fallback');
    }

    // Fallback to memory cache
    const memoryCached = memoryCache.get(key);
    if (!memoryCached) return null;

    // Check if expired
    if (Date.now() - memoryCached.timestamp > CACHE_DURATION) {
      memoryCache.delete(key);
      return null;
    }

    return { audioUrl: memoryCached.audioUrl, duration: memoryCached.duration };
  }

  /**
   * Add to cache (Redis with memory fallback)
   */
  private async addToCache(key: string, audioUrl: string, duration: number): Promise<void> {
    try {
      // Try Redis first (7 days TTL)
      await redisCache.set(`tts:${key}`, { audioUrl, duration }, 604800);
    } catch (error) {
      console.warn('⚠️ Redis cache write failed, using memory fallback');
    }

    // Always add to memory cache as fallback
    memoryCache.set(key, {
      audioUrl,
      duration,
      timestamp: Date.now()
    });
  }

  /**
   * Get available voices for a provider
   */
  static getAvailableVoices(provider: 'elevenlabs' | 'azure' | 'google'): any[] {
    switch (provider) {
      case 'elevenlabs':
        return [
          { id: 'Adam', name: 'Adam (English)', language: 'en' },
          { id: 'Rachel', name: 'Rachel (English)', language: 'en' },
          { id: 'Domi', name: 'Domi (English)', language: 'en' },
          { id: 'Bella', name: 'Bella (English)', language: 'en' },
          { id: 'Antoni', name: 'Antoni (English)', language: 'en' },
        ];
      
      case 'azure':
        return [
          { id: 'pt-BR-FranciscaNeural', name: 'Francisca (Feminino)', language: 'pt-BR', gender: 'female' },
          { id: 'pt-BR-AntonioNeural', name: 'Antonio (Masculino)', language: 'pt-BR', gender: 'male' },
          { id: 'pt-BR-BrendaNeural', name: 'Brenda (Feminino)', language: 'pt-BR', gender: 'female' },
          { id: 'pt-BR-DonatoNeural', name: 'Donato (Masculino)', language: 'pt-BR', gender: 'male' },
          { id: 'pt-BR-ElzaNeural', name: 'Elza (Feminino)', language: 'pt-BR', gender: 'female' },
        ];
      
      case 'google':
        return [
          { id: 'pt-BR-Standard-A', name: 'Standard A (Feminino)', language: 'pt-BR', gender: 'female' },
          { id: 'pt-BR-Standard-B', name: 'Standard B (Masculino)', language: 'pt-BR', gender: 'male' },
          { id: 'pt-BR-Neural2-A', name: 'Neural2 A (Feminino)', language: 'pt-BR', gender: 'female' },
          { id: 'pt-BR-Neural2-B', name: 'Neural2 B (Masculino)', language: 'pt-BR', gender: 'male' },
        ];
    }
  }
}

// Export singleton instance
export const ttsMultiProvider = TTSMultiProvider.getInstance();
