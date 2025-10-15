

/**
 * 🤝 Real-time Collaboration API - Rooms Management
 */

import { NextRequest, NextResponse } from 'next/server';

interface CollaborationRoom {
  id: string;
  projectId: string;
  name: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'owner' | 'editor' | 'viewer';
    status: 'online' | 'offline';
    joinedAt: string;
  }>;
  activities: Array<{
    id: string;
    userId: string;
    userName: string;
    type: 'joined' | 'left' | 'edited' | 'commented';
    description: string;
    timestamp: string;
  }>;
  version: number;
  isLive: boolean;
  createdAt: string;
  lastActivity: string;
}


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    // Simular salas colaborativas
    const rooms: CollaborationRoom[] = [
      {
        id: 'room_1',
        projectId: projectId || 'project_1',
        name: 'Treinamento NR-12 - Revisão Final',
        participants: [
          {
            id: 'user_1',
            name: 'Ana Silva',
            avatar: '/avatars/ana.jpg',
            role: 'owner',
            status: 'online',
            joinedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'user_2', 
            name: 'Carlos Santos',
            role: 'editor',
            status: 'online',
            joinedAt: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: 'user_3',
            name: 'Maria Oliveira',
            role: 'viewer',
            status: 'offline',
            joinedAt: new Date(Date.now() - 7200000).toISOString()
          }
        ],
        activities: [
          {
            id: 'activity_1',
            userId: 'user_2',
            userName: 'Carlos Santos',
            type: 'edited',
            description: 'Editou slide 3 - Procedimentos de Segurança',
            timestamp: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: 'activity_2',
            userId: 'user_1',
            userName: 'Ana Silva',
            type: 'commented',
            description: 'Adicionou comentário no slide 5',
            timestamp: new Date(Date.now() - 600000).toISOString()
          }
        ],
        version: 12,
        isLive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lastActivity: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 'room_2',
        projectId: 'project_2',
        name: 'Curso EPI - Desenvolvimento',
        participants: [
          {
            id: 'user_4',
            name: 'João Costa',
            role: 'owner',
            status: 'online',
            joinedAt: new Date(Date.now() - 1200000).toISOString()
          }
        ],
        activities: [],
        version: 5,
        isLive: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        lastActivity: new Date(Date.now() - 1200000).toISOString()
      }
    ];

    const filteredRooms = projectId 
      ? rooms.filter(room => room.projectId === projectId)
      : rooms;

    return NextResponse.json({
      success: true,
      rooms: filteredRooms,
      stats: {
        totalRooms: filteredRooms.length,
        activeRooms: filteredRooms.filter(r => r.isLive).length,
        totalParticipants: filteredRooms.reduce((sum, room) => sum + room.participants.length, 0),
        onlineParticipants: filteredRooms.reduce((sum, room) => 
          sum + room.participants.filter(p => p.status === 'online').length, 0
        )
      }
    });

  } catch (error) {
    console.error('Collaboration rooms error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, name, participants } = await request.json();
    
    if (!projectId || !name) {
      return NextResponse.json(
        { success: false, error: 'Project ID and name are required' },
        { status: 400 }
      );
    }

    const newRoom: CollaborationRoom = {
      id: `room_${Date.now()}`,
      projectId,
      name,
      participants: participants || [],
      activities: [{
        id: `activity_${Date.now()}`,
        userId: 'system',
        userName: 'Sistema',
        type: 'joined',
        description: 'Sala de colaboração criada',
        timestamp: new Date().toISOString()
      }],
      version: 1,
      isLive: true,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      room: newRoom,
      message: 'Collaboration room created successfully'
    });

  } catch (error) {
    console.error('Room creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create collaboration room' },
      { status: 500 }
    );
  }
}

