
/**
 * 🤖 Serviço de LLM integrado com Abacus.AI
 */

export interface LLMRequest {
  prompt: string;
  maxTokens: number;
  temperature: number;
  model: 'gpt-4-turbo' | 'claude-3-sonnet' | 'claude-3-haiku';
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ABACUSAI_API_KEY || '';
    this.baseUrl = 'https://api.abacus.ai/v1/chat/completions';
  }

  async generateContent(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: request.maxTokens,
          temperature: request.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error('Falha na geração de conteúdo com IA');
    }
  }
}
