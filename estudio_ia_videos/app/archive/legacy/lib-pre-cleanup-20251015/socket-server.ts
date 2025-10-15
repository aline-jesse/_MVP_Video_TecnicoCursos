
/**
 * 🔌 SOCKET.IO SERVER - Colaboração em Tempo Real
 * Sistema real de WebSocket para colaboração simultânea
 */

import { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'
import { NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

// Tipos para colaboração
interface CollaborationUpdate {
  projectId: string
  userId: string
  userName: string
  type: 'canvas' | 'timeline' | 'comment' | 'cursor'
  data: any
  timestamp: number
}

interface ProjectRoom {
  id: string
  users: Array<{
    id: string
    name: string
    avatar?: string
    cursor?: { x: number; y: number }
  }>
  lastUpdate: number
}

// Rooms ativas
const activeRooms = new Map<string, ProjectRoom>()

export const config = {
  api: {
    bodyParser: false,
  },
}

export const initSocketServer = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('🔌 Iniciando Socket.IO Server para Colaboração Real...')
    
    const io = new IOServer(res.socket.server, {
      path: '/api/collaboration/socketio',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    // Connection handler
    io.on('connection', (socket) => {
      console.log(`✅ Usuário conectado: ${socket.id}`)

      // Join project room
      socket.on('join-project', async (data: { 
        projectId: string, 
        userId: string, 
        userName: string 
      }) => {
        const { projectId, userId, userName } = data
        console.log(`👥 ${userName} entrou no projeto: ${projectId}`)

        // Leave previous rooms
        const rooms = Array.from(socket.rooms)
        rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room)
          }
        })

        // Join new room
        socket.join(projectId)

        // Update room info
        if (!activeRooms.has(projectId)) {
          activeRooms.set(projectId, {
            id: projectId,
            users: [],
            lastUpdate: Date.now()
          })
        }

        const room = activeRooms.get(projectId)!
        const existingUserIndex = room.users.findIndex(u => u.id === userId)
        
        if (existingUserIndex >= 0) {
          room.users[existingUserIndex].name = userName
        } else {
          room.users.push({ id: userId, name: userName })
        }

        // Notify others
        socket.to(projectId).emit('user-joined', { userId, userName })
        
        // Send current users list
        socket.emit('room-users', room.users)
        socket.to(projectId).emit('room-users', room.users)
      })

      // Canvas updates
      socket.on('canvas-update', (data: {
        projectId: string
        userId: string
        userName: string
        canvasData: any
        timestamp: number
      }) => {
        console.log(`🎨 Canvas update from ${data.userName} in ${data.projectId}`)
        
        // Broadcast to all users in the same project except sender
        socket.to(data.projectId).emit('canvas-updated', {
          userId: data.userId,
          userName: data.userName,
          canvasData: data.canvasData,
          timestamp: data.timestamp
        })
      })

      // Comments
      socket.on('add-comment', (data: {
        projectId: string
        userId: string
        userName: string
        comment: {
          id: string
          content: string
          timestamp: number
          position?: { x: number; y: number }
        }
      }) => {
        console.log(`💬 Comentário de ${data.userName}: ${data.comment.content}`)

        // Broadcast comment to all users in project
        io.to(data.projectId).emit('comment-added', {
          userId: data.userId,
          userName: data.userName,
          comment: data.comment
        })
      })

      // Cursor tracking
      socket.on('cursor-move', (data: {
        projectId: string
        userId: string
        userName: string
        position: { x: number; y: number }
      }) => {
        // Update room cursor info
        const room = activeRooms.get(data.projectId)
        if (room) {
          const user = room.users.find(u => u.id === data.userId)
          if (user) {
            user.cursor = data.position
          }
        }

        // Broadcast cursor position (throttled)
        socket.to(data.projectId).emit('cursor-moved', {
          userId: data.userId,
          userName: data.userName,
          position: data.position
        })
      })

      // Versioning
      socket.on('save-version', async (data: {
        projectId: string
        userId: string
        userName: string
        version: {
          id: string
          name: string
          data: any
          timestamp: number
        }
      }) => {
        console.log(`💾 Nova versão salva: ${data.version.name}`)
        
        // Broadcast new version
        io.to(data.projectId).emit('version-saved', {
          userId: data.userId,
          userName: data.userName,
          version: data.version
        })
      })

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`❌ Usuário desconectado: ${socket.id}`)
        
        // Remove from rooms
        activeRooms.forEach((room, projectId) => {
          const userIndex = room.users.findIndex(u => u.id === socket.id)
          if (userIndex >= 0) {
            const user = room.users[userIndex]
            room.users.splice(userIndex, 1)
            
            // Notify others
            socket.to(projectId).emit('user-left', { userId: user.id, userName: user.name })
            socket.to(projectId).emit('room-users', room.users)
            
            // Clean empty rooms
            if (room.users.length === 0) {
              activeRooms.delete(projectId)
            }
          }
        })
      })
    })

    res.socket.server.io = io
    console.log('✅ Socket.IO Server inicializado com sucesso!')
  }
  
  return res.socket.server.io
}

// Helper functions
export const getRoomUsers = (projectId: string) => {
  const room = activeRooms.get(projectId)
  return room ? room.users : []
}

export const getRoomCount = () => {
  return activeRooms.size
}

export const getActiveRooms = () => {
  return Array.from(activeRooms.values())
}
