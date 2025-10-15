
/**
 * 🌐 API 3D Environments Advanced
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const environments = [
      {
        id: 'env-1',
        name: 'Fábrica Industrial',
        category: 'Industrial',
        description: 'Ambiente fabril completo com máquinas, esteiras e áreas de produção',
        previewUrl: '/3d/factory-preview.jpg',
        complexity: 'high',
        renderTime: 45,
        popularity: 94,
        tags: ['NR-12', 'Máquinas', 'Produção', 'Segurança'],
        isCustom: false,
        createdAt: new Date('2024-08-01')
      },
      {
        id: 'env-2',
        name: 'Canteiro de Obras',
        category: 'Construção',
        description: 'Obra em construção com andaimes, guindastes e áreas de trabalho em altura',
        previewUrl: '/3d/construction-preview.jpg',
        complexity: 'high',
        renderTime: 38,
        popularity: 89,
        tags: ['NR-35', 'Altura', 'Andaimes', 'Guindastes'],
        isCustom: false,
        createdAt: new Date('2024-08-05')
      }
    ];

    return NextResponse.json({
      success: true,
      environments,
      total: environments.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar ambientes 3D' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, category, description, sceneConfig } = await request.json();

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Nome e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    // Simular criação de ambiente personalizado
    const newEnvironment = {
      id: `env-${Date.now()}`,
      name,
      category,
      description: description || 'Ambiente personalizado',
      previewUrl: '/3d/custom-preview.jpg',
      complexity: 'medium',
      renderTime: Math.floor(Math.random() * 30) + 20,
      popularity: 0,
      tags: ['Custom', 'Personalizado'],
      isCustom: true,
      createdAt: new Date(),
      sceneConfig
    };

    return NextResponse.json({
      success: true,
      environment: newEnvironment,
      message: 'Ambiente 3D personalizado criado'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar ambiente 3D' },
      { status: 500 }
    );
  }
}
