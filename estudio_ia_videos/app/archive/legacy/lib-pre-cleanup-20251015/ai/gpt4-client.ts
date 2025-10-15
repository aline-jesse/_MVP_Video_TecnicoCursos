/**
 * GPT-4 Compliance Analyzer
 * Cliente especializado para análise de compliance com NRs usando GPT-4
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ComplianceAnalysis {
  score: number;
  semanticAnalysis: {
    clarity: number;
    completeness: number;
    technicalAccuracy: number;
  };
  suggestions: string[];
  missingTopics: string[];
  confidence: number;
}

export class GPT4ComplianceAnalyzer {
  private client: OpenAI;

  constructor() {
    this.client = openai;
  }

  async analyzeCompliance(
    content: string,
    nrType: string
  ): Promise<ComplianceAnalysis> {
    try {
      const prompt = this.buildPrompt(content, nrType);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em segurança do trabalho e normas regulamentadoras brasileiras. 
            Analise o conteúdo de treinamento fornecido em relação à ${nrType} e forneça uma análise detalhada 
            de compliance. Seja preciso, técnico e específico nas suas avaliações.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        score: Math.min(100, Math.max(0, result.score || 0)),
        semanticAnalysis: {
          clarity: Math.min(100, Math.max(0, result.semanticAnalysis?.clarity || 0)),
          completeness: Math.min(100, Math.max(0, result.semanticAnalysis?.completeness || 0)),
          technicalAccuracy: Math.min(100, Math.max(0, result.semanticAnalysis?.technicalAccuracy || 0))
        },
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        missingTopics: Array.isArray(result.missingTopics) ? result.missingTopics : [],
        confidence: Math.min(100, Math.max(0, result.confidence || 0))
      };
    } catch (error) {
      console.error('Erro na análise GPT-4:', error);
      
      // Fallback para análise básica
      return {
        score: 50,
        semanticAnalysis: {
          clarity: 50,
          completeness: 50,
          technicalAccuracy: 50
        },
        suggestions: ['Erro na análise de IA. Verifique a configuração do OpenAI.'],
        missingTopics: [],
        confidence: 0
      };
    }
  }

  private buildPrompt(content: string, nrType: string): string {
    return `
Analise o seguinte conteúdo de treinamento de segurança do trabalho em relação à ${nrType}:

CONTEÚDO DO TREINAMENTO:
${content}

Forneça uma análise detalhada em formato JSON com as seguintes propriedades:

{
  "score": <número de 0-100 representando o score geral de compliance>,
  "semanticAnalysis": {
    "clarity": <0-100: clareza e compreensibilidade do conteúdo>,
    "completeness": <0-100: completude em relação aos requisitos da NR>,
    "technicalAccuracy": <0-100: precisão técnica e conformidade regulatória>
  },
  "suggestions": [
    "<sugestão específica de melhoria 1>",
    "<sugestão específica de melhoria 2>",
    "..."
  ],
  "missingTopics": [
    "<tópico obrigatório ausente 1>",
    "<tópico obrigatório ausente 2>",
    "..."
  ],
  "confidence": <0-100: confiança na análise realizada>
}

CRITÉRIOS DE AVALIAÇÃO:
1. Cobertura dos tópicos obrigatórios da ${nrType}
2. Precisão técnica das informações
3. Clareza e didática do conteúdo
4. Conformidade com requisitos regulamentares
5. Adequação para treinamento de segurança

Seja específico e técnico na análise. Considere aspectos práticos de implementação da norma.
`;
  }

  /**
   * Análise rápida para validação em tempo real
   */
  async quickAnalysis(content: string, nrType: string): Promise<{ score: number; suggestions: string[] }> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analise rapidamente o conteúdo em relação à ${nrType}. Forneça um score (0-100) e até 3 sugestões principais.`
          },
          {
            role: 'user',
            content: `Conteúdo: ${content.substring(0, 1000)}...`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        score: Math.min(100, Math.max(0, result.score || 0)),
        suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 3) : []
      };
    } catch (error) {
      console.error('Erro na análise rápida:', error);
      return {
        score: 50,
        suggestions: ['Erro na análise rápida. Tente novamente.']
      };
    }
  }
}