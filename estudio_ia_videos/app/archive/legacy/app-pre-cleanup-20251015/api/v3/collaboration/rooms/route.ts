
import { NextRequest, NextResponse } from 'next/server'

// Collaboration Rooms API - Sprint 13
// Simplified version for compilation
export async function GET(request: NextRequest) {
  try {
    // Simulated rooms data
    const rooms = [
      {
        id: 'room-1',
        name: 'Projeto NR-10',
        participants: 3,
        lastActivity: new Date().toISOString()
      },
      {
        id: 'room-2',
        name: 'Treinamento Segurança',
        participants: 5,
        lastActivity: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      data: rooms
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get rooms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newRoom = {
      id: 'room-' + Date.now(),
      name: body.name,
      participants: 1,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newRoom
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
