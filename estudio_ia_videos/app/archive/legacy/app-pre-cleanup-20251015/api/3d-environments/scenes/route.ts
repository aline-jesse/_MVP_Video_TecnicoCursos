
/**
 * 🏗️ API de Gerenciamento de Cenas 3D
 */


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { environmentId, avatars, props, cameras } = await request.json();

    if (!environmentId) {
      return NextResponse.json(
        { error: 'environmentId é obrigatório' },
        { status: 400 }
      );
    }

    // Cria nova cena
    const scene = {
      id: `scene_${Date.now()}`,
      environmentId,
      avatars: avatars || [],
      props: props || [],
      cameras: cameras || [
        {
          id: 'main',
          position: { x: 0, y: 5, z: 10 },
          target: { x: 0, y: 2, z: 0 },
          duration: 5,
          transition: 'fade'
        }
      ],
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`🏗️ Nova cena 3D criada: ${scene.id}`);
    return NextResponse.json(scene);

  } catch (error) {
    console.error('Erro ao criar cena:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const environmentId = searchParams.get('environmentId');

    // Mock data de cenas
    const mockScenes = [
      {
        id: 'scene-1',
        environmentId: 'industrial-factory',
        name: 'Treinamento NR-12 - Parte 1',
        avatars: [
          {
            id: 'instructor-1',
            position: { x: 2, y: 0, z: 3 },
            rotation: { x: 0, y: 0, z: 0 },
            animation: 'talking'
          }
        ],
        props: [
          {
            id: 'safety-sign',
            modelPath: '/props/safety-sign.glb',
            position: { x: -3, y: 2, z: 1 }
          }
        ],
        createdAt: '2025-08-29T10:30:00Z'
      }
    ];

    let filteredScenes = mockScenes;
    if (environmentId) {
      filteredScenes = mockScenes.filter(scene => scene.environmentId === environmentId);
    }

    return NextResponse.json(filteredScenes);

  } catch (error) {
    console.error('Erro ao listar cenas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
