
// Real-time Collaboration Server - Sprint 13
// Simplified version for compilation

interface CollaborationRoom {
  id: string
  name: string
  participants: string[]
  createdAt: Date
}

interface CollaborationMessage {
  id: string
  roomId: string
  userId: string
  content: string
  timestamp: Date
}

export class CollaborationServer {
  private rooms: Map<string, CollaborationRoom> = new Map()
  private messages: Map<string, CollaborationMessage[]> = new Map()

  async createRoom(name: string): Promise<CollaborationRoom> {
    const room: CollaborationRoom = {
      id: 'room-' + Date.now(),
      name,
      participants: [],
      createdAt: new Date()
    }
    this.rooms.set(room.id, room)
    this.messages.set(room.id, [])
    return room
  }

  async getRooms(): Promise<CollaborationRoom[]> {
    return Array.from(this.rooms.values())
  }

  async sendMessage(roomId: string, userId: string, content: string) {
    const message: CollaborationMessage = {
      id: 'msg-' + Date.now(),
      roomId,
      userId,
      content,
      timestamp: new Date()
    }
    
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, [])
    }
    
    this.messages.get(roomId)?.push(message)
    return message
  }
}

export const collaborationServer = new CollaborationServer()
