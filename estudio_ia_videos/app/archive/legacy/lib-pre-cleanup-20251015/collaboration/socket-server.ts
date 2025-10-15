

/**
 * Socket.IO Server for Real-Time Collaboration
 * Sprint 44 - Collaborative Editing
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

let io: SocketIOServer | null = null

export function initSocketIO(server: HTTPServer): SocketIOServer {
  if (io) return io

  io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('✓ Cliente conectado:', socket.id)

    // Join project room
    socket.on('join-project', ({ projectId, user }) => {
      socket.join(`project:${projectId}`)
      socket.to(`project:${projectId}`).emit('user-joined', user)
      console.log(`User ${user.name} joined project ${projectId}`)
    })

    // Leave project room
    socket.on('leave-project', (projectId) => {
      socket.leave(`project:${projectId}`)
      socket.to(`project:${projectId}`).emit('user-left', socket.id)
    })

    // Cursor movement
    socket.on('cursor-move', ({ projectId, x, y, userId }) => {
      socket.to(`project:${projectId}`).emit('cursor-move', {
        userId,
        x,
        y,
        socketId: socket.id
      })
    })

    // Selection change
    socket.on('selection-change', ({ projectId, slideId, elementId, user }) => {
      socket.to(`project:${projectId}`).emit('selection-change', {
        userId: user.id,
        user,
        slideId,
        elementId
      })
    })

    // Comment
    socket.on('comment', ({ projectId, comment }) => {
      io?.to(`project:${projectId}`).emit('new-comment', comment)
    })

    // Timeline update
    socket.on('timeline-update', ({ projectId, timeline }) => {
      socket.to(`project:${projectId}`).emit('timeline-updated', timeline)
    })

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id)
    })
  })

  return io
}

export function getSocketIO(): SocketIOServer | null {
  return io
}

