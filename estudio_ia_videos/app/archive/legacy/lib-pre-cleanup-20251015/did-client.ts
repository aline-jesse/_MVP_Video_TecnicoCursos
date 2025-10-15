
/**
 * D-ID API Client
 * Cliente para integração com D-ID API para geração de avatares hiper-realistas
 * 
 * Features:
 * - Listagem de avatares disponíveis
 * - Criação de talks (vídeos com lip-sync)
 * - Polling de status de geração
 * - Download de vídeos gerados
 * 
 * Documentação: https://docs.d-id.com/reference/api-overview
 */

import { logger } from './logger';

// ============================================================================
// TYPES
// ============================================================================

export interface DIDAvatar {
  id: string;
  name: string;
  description: string;
  preview_url: string;
  thumbnail_url: string;
  gender: 'male' | 'female';
  age_range: string;
  ethnicity: string;
  tags: string[];
}

export interface DIDTalkRequest {
  source_url: string; // URL do avatar
  script: {
    type: 'text' | 'audio';
    input: string; // Texto ou URL do áudio
    provider?: {
      type: 'microsoft' | 'amazon' | 'elevenlabs';
      voice_id: string;
      voice_config?: {
        style?: string;
        rate?: string;
        pitch?: string;
      };
    };
  };
  config?: {
    fluent?: boolean;
    pad_audio?: number;
    stitch?: boolean;
    result_format?: 'mp4' | 'gif' | 'wav';
  };
}

export interface DIDTalkResponse {
  id: string;
  status: 'created' | 'started' | 'done' | 'error';
  created_at: string;
  result_url?: string;
  error?: {
    kind: string;
    description: string;
  };
}

export interface DIDTalkStatus {
  id: string;
  status: 'created' | 'started' | 'done' | 'error';
  created_at: string;
  result_url?: string;
  duration?: number;
  error?: {
    kind: string;
    description: string;
  };
}

// ============================================================================
// D-ID CLIENT CLASS
// ============================================================================

export class DIDClient {
  private baseUrl = 'https://api.d-id.com';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DID_API_KEY || '';
    
    if (!this.apiKey) {
      logger.warn('D-ID API Key não configurada. Usando modo demo.');
    }
  }

  // ==========================================================================
  // AVATARS
  // ==========================================================================

  /**
   * Lista todos os avatares disponíveis na biblioteca D-ID
   */
  async listAvatars(): Promise<DIDAvatar[]> {
    if (!this.apiKey) {
      return this.getMockAvatars();
    }

    try {
      const response = await fetch(`${this.baseUrl}/avatars`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.avatars || [];
    } catch (error) {
      logger.error('Erro ao buscar avatares D-ID:', error);
      return this.getMockAvatars();
    }
  }

  /**
   * Busca um avatar específico por ID
   */
  async getAvatar(avatarId: string): Promise<DIDAvatar | null> {
    const avatars = await this.listAvatars();
    return avatars.find(a => a.id === avatarId) || null;
  }

  // ==========================================================================
  // TALKS (VIDEO GENERATION)
  // ==========================================================================

  /**
   * Cria um novo talk (vídeo com avatar falando)
   */
  async createTalk(request: DIDTalkRequest): Promise<DIDTalkResponse> {
    if (!this.apiKey) {
      return this.getMockTalk();
    }

    try {
      logger.info('Criando talk D-ID...', { avatar: request.source_url });

      const response = await fetch(`${this.baseUrl}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`D-ID API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data: DIDTalkResponse = await response.json();
      logger.info('Talk D-ID criado:', { id: data.id, status: data.status });
      
      return data;
    } catch (error) {
      logger.error('Erro ao criar talk D-ID:', error);
      throw error;
    }
  }

  /**
   * Verifica o status de um talk em processamento
   */
  async getTalkStatus(talkId: string): Promise<DIDTalkStatus> {
    if (!this.apiKey) {
      return this.getMockTalkStatus(talkId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/talks/${talkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.status} ${response.statusText}`);
      }

      const data: DIDTalkStatus = await response.json();
      return data;
    } catch (error) {
      logger.error('Erro ao verificar status do talk:', error);
      throw error;
    }
  }

  /**
   * Aguarda até que o talk seja concluído (polling)
   */
  async waitForTalkCompletion(
    talkId: string,
    options: {
      maxAttempts?: number;
      intervalMs?: number;
      onProgress?: (status: DIDTalkStatus) => void;
    } = {}
  ): Promise<DIDTalkStatus> {
    const {
      maxAttempts = 60, // 60 tentativas = 5 minutos
      intervalMs = 5000, // 5 segundos
      onProgress,
    } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const status = await this.getTalkStatus(talkId);

      logger.info(`Talk ${talkId} status: ${status.status} (tentativa ${attempt}/${maxAttempts})`);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'done') {
        logger.info(`Talk ${talkId} concluído! URL: ${status.result_url}`);
        return status;
      }

      if (status.status === 'error') {
        throw new Error(`Talk ${talkId} falhou: ${status.error?.description || 'Erro desconhecido'}`);
      }

      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Timeout: Talk ${talkId} não concluído após ${maxAttempts} tentativas`);
  }

  /**
   * Deleta um talk
   */
  async deleteTalk(talkId: string): Promise<void> {
    if (!this.apiKey) {
      return;
    }

    try {
      await fetch(`${this.baseUrl}/talks/${talkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info(`Talk ${talkId} deletado`);
    } catch (error) {
      logger.error('Erro ao deletar talk:', error);
      throw error;
    }
  }

  // ==========================================================================
  // MOCK DATA (para desenvolvimento sem API key)
  // ==========================================================================

  private getMockAvatars(): DIDAvatar[] {
    return [
      {
        id: 'amy-Aq6OmGZnMt',
        name: 'Amy',
        description: 'Executiva corporativa profissional',
        preview_url: 'https://www.shutterstock.com/image-photo/happy-cheerful-45-year-old-260nw-2353012797.jpg',
        thumbnail_url: 'https://i.pinimg.com/736x/dd/02/33/dd0233bb32ca50f97c2ff424a922219a.jpg',
        gender: 'female',
        age_range: '30-40',
        ethnicity: 'caucasian',
        tags: ['corporate', 'professional', 'friendly'],
      },
      {
        id: 'michael-5tIi0Z2cO1',
        name: 'Michael',
        description: 'Instrutor de treinamento corporativo',
        preview_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Ethan_Hawke_at_Berlinale_2025.jpg/250px-Ethan_Hawke_at_Berlinale_2025.jpg',
        thumbnail_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Stevan_Kragujevic%2C_Gamal_Abdel_Naser_u_Beogradu%2C_1962.jpg/960px-Stevan_Kragujevic%2C_Gamal_Abdel_Naser_u_Beogradu%2C_1962.jpg',
        gender: 'male',
        age_range: '35-45',
        ethnicity: 'caucasian',
        tags: ['instructor', 'professional', 'authoritative'],
      },
      {
        id: 'sophia-9rQXqNm2Jp',
        name: 'Sophia',
        description: 'Especialista em segurança do trabalho',
        preview_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/ConstanceWu-byPhilipRomano.jpg/250px-ConstanceWu-byPhilipRomano.jpg',
        thumbnail_url: 'https://www.shutterstock.com/image-photo/asian-woman-35-years-old-600nw-2581983911.jpg',
        gender: 'female',
        age_range: '28-35',
        ethnicity: 'asian',
        tags: ['safety', 'expert', 'professional'],
      },
    ];
  }

  private getMockTalk(): DIDTalkResponse {
    return {
      id: `mock-talk-${Date.now()}`,
      status: 'created',
      created_at: new Date().toISOString(),
    };
  }

  private getMockTalkStatus(talkId: string): DIDTalkStatus {
    // Simula progressão de status ao longo do tempo
    const elapsed = Date.now() - parseInt(talkId.split('-').pop() || '0');
    
    if (elapsed < 5000) {
      return {
        id: talkId,
        status: 'started',
        created_at: new Date(Date.now() - elapsed).toISOString(),
      };
    }

    return {
      id: talkId,
      status: 'done',
      created_at: new Date(Date.now() - elapsed).toISOString(),
      result_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/demo_video.mp4',
      duration: 30,
    };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Valida se a API key está configurada
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Retorna informações da configuração
   */
  getConfig() {
    return {
      configured: this.isConfigured(),
      baseUrl: this.baseUrl,
      mode: this.isConfigured() ? 'production' : 'demo',
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let didClientInstance: DIDClient | null = null;

export function getDIDClient(): DIDClient {
  if (!didClientInstance) {
    didClientInstance = new DIDClient();
  }
  return didClientInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default DIDClient;
