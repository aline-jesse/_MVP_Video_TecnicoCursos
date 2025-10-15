

import { NextRequest, NextResponse } from 'next/server'
import { RealTimeCollaboration } from '../../../../../lib/collaboration/real-time-collaboration'

export async function POST(request: NextRequest) {
  try {
    const { project_id, owner_id, permissions } = await request.json()

    const session = await RealTimeCollaboration.createCollaborationSession(
      project_id,
      owner_id,
      permissions || {
        is_public: false,
        require_approval: false,
        max_participants: 10,
        allowed_roles: ['editor', 'viewer'],
        password_required: false
      }
    )

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        project_id: session.project_id,
        owner_id: session.owner_id,
        status: session.status,
        created_at: session.created_at,
        collaboration_url: `https://estudio-ia.com/collaboration/${session.id}`,
        participants_count: session.participants.length
      }
    })

  } catch (error) {
    console.error('Erro ao criar sessão de colaboração:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao criar sessão' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const session_id = searchParams.get('session_id')

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID obrigatório' },
        { status: 400 }
      )
    }

    // Simular dados da sessão
    const session_data = {
      id: session_id,
      project_id: 'demo-project',
      status: 'active',
      participants: [
        {
          user_id: 'user-1',
          name: 'Ana Silva',
          role: 'owner',
          status: 'online',
          last_seen: new Date().toISOString()
        },
        {
          user_id: 'user-2',
          name: 'Carlos Santos',
          role: 'editor',
          status: 'online',
          last_seen: new Date(Date.now() - 300000).toISOString()
        }
      ],
      activity_feed: [
        {
          timestamp: new Date().toISOString(),
          user_name: 'Ana Silva',
          action: 'modificou avatar da cena 2',
          type: 'edit'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      session: session_data
    })

  } catch (error) {
    console.error('Erro ao buscar sessão:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar sessão' },
      { status: 500 }
    )
  }
}

