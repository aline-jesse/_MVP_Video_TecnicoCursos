
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * API de Presença em Colaboração
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');

    if (!project_id) {
      return NextResponse.json(
        { success: false, error: 'project_id é obrigatório' },
        { status: 400 }
      );
    }

    // Mock de usuários presentes
    const presence = {
      project_id,
      online_users: 3,
      users: [
        {
          user_id: 'user_001',
          name: 'João Silva',
          avatar: '/avatars/joao.jpg',
          role: 'editor',
          last_activity: new Date(Date.now() - 30 * 1000).toISOString(),
          cursor_position: { x: 450, y: 300 },
          editing_element: 'slide_3_text'
        },
        {
          user_id: 'user_002',
          name: 'Maria Santos',
          avatar: '/avatars/maria.jpg',
          role: 'reviewer',
          last_activity: new Date(Date.now() - 15 * 1000).toISOString(),
          cursor_position: { x: 680, y: 420 },
          editing_element: null
        },
        {
          user_id: 'user_003',
          name: 'Carlos Oliveira',
          avatar: '/avatars/carlos.jpg',
          role: 'viewer',
          last_activity: new Date(Date.now() - 5 * 1000).toISOString(),
          cursor_position: { x: 120, y: 150 },
          editing_element: null
        }
      ]
    };

    return NextResponse.json({
      success: true,
      presence
    });
  } catch (error) {
    console.error('Erro ao buscar presença:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar presença' },
      { status: 500 }
    );
  }
}
