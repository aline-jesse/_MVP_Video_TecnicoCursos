
/**
 * 🤖 API IA Avançada - Models
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const models = [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Modelo mais avançado para geração de conteúdo e análise',
        capabilities: ['Texto', 'Imagem', 'Code', 'Análise'],
        maxTokens: 128000,
        costPerToken: 0.00003,
        responseTime: 2.3,
        accuracy: 96,
        status: 'active'
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        description: 'Excelente para tarefas complexas e análise profunda',
        capabilities: ['Texto', 'Análise', 'Código', 'Raciocínio'],
        maxTokens: 200000,
        costPerToken: 0.000015,
        responseTime: 3.1,
        accuracy: 94,
        status: 'active'
      },
      {
        id: 'llama-3-70b',
        name: 'Llama 3 70B',
        provider: 'Meta',
        description: 'Modelo open-source para geração rápida e eficiente',
        capabilities: ['Texto', 'Code', 'Multilingual'],
        maxTokens: 8192,
        costPerToken: 0.000005,
        responseTime: 1.8,
        accuracy: 89,
        status: 'beta'
      }
    ];

    return NextResponse.json({
      success: true,
      models,
      total: models.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar modelos de IA' },
      { status: 500 }
    );
  }
}
