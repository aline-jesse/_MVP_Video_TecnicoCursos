
import { NextRequest, NextResponse } from 'next/server';

/**
 * API de Validação de Compliance NR
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, nr_standard } = body;

    if (!project_id || !nr_standard) {
      return NextResponse.json(
        { success: false, error: 'project_id e nr_standard são obrigatórios' },
        { status: 400 }
      );
    }

    // Mock de validação de compliance
    const validation = {
      project_id,
      nr_standard,
      compliant: true,
      score: 95,
      checks: [
        {
          item: 'Conteúdo obrigatório presente',
          status: 'passed',
          details: 'Todos os tópicos obrigatórios da NR estão presentes'
        },
        {
          item: 'Duração mínima respeitada',
          status: 'passed',
          details: 'Duração de 15min atende requisito mínimo de 12min'
        },
        {
          item: 'Vocabulário técnico adequado',
          status: 'passed',
          details: 'Terminologia técnica está correta'
        },
        {
          item: 'Exemplos práticos incluídos',
          status: 'warning',
          details: 'Recomendado adicionar mais 2 exemplos práticos'
        }
      ],
      warnings: 1,
      errors: 0,
      validated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Erro ao validar compliance NR:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao validar compliance NR' },
      { status: 500 }
    );
  }
}
