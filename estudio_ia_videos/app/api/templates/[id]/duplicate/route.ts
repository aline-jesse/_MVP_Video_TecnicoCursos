import { NextRequest, NextResponse } from 'next/server';

// Mock database - em produção, usar banco de dados real
let templates: any[] = [];

// POST - Duplicar template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name } = await request.json();

    const originalTemplate = templates.find(t => t.id === id);

    if (!originalTemplate) {
      return NextResponse.json(
        { error: 'Template não encontrado', success: false },
        { status: 404 }
      );
    }

    const duplicatedTemplate = {
      ...originalTemplate,
      id: `template-${Date.now()}`,
      name: name || `${originalTemplate.name} (Cópia)`,
      isCustom: true,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      downloads: 0,
      rating: 0,
      metadata: {
        ...originalTemplate.metadata,
        usage: {
          views: 0,
          downloads: 0,
          likes: 0,
          shares: 0,
          lastUsed: new Date(),
        },
      },
    };

    templates.push(duplicatedTemplate);

    return NextResponse.json({
      template: duplicatedTemplate,
      success: true,
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao duplicar template:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    );
  }
}