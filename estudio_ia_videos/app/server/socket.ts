
/**
 * Socket.IO Server Setup
 * This file should be imported in custom server or middleware
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export function setupSocketIO(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  const projectRooms = new Map<string, Set<string>>()

  io.on('connection', (socket) => {
    console.log('✓ Socket conectado:', socket.id)

    socket.on('join-project', ({ projectId, user }) => {
      const room = `project:${projectId}`
      socket.join(room)

      if (!projectRooms.has(projectId)) {
        projectRooms.set(projectId, new Set())
      }
      projectRooms.get(projectId)!.add(socket.id)

      // Notify others
      socket.to(room).emit('user-joined', user)

      // Send current users list
      const userCount = projectRooms.get(projectId)!.size
      io.to(room).emit('room-users-count', userCount)
    })

    socket.on('leave-project', (projectId) => {
      const room = `project:${projectId}`
      socket.leave(room)

      if (projectRooms.has(projectId)) {
        projectRooms.get(projectId)!.delete(socket.id)
      }

      socket.to(room).emit('user-left', socket.id)
    })

    socket.on('cursor-move', (data) => {
      const room = `project:${data.projectId}`
      socket.to(room).emit('cursor-move', {
        ...data,
        socketId: socket.id
      })
    })

    socket.on('selection-change', (data) => {
      const room = `project:${data.projectId}`
      socket.to(room).emit('selection-change', data)
    })

    socket.on('comment', (data) => {
      const room = `project:${data.projectId}`
      io.to(room).emit('new-comment', data.comment)
    })

    socket.on('timeline-update', (data) => {
      const room = `project:${data.projectId}`
      socket.to(room).emit('timeline-updated', data.timeline)
    })

    socket.on('disconnect', () => {
      console.log('Socket desconectado:', socket.id)
      
      // Remove from all rooms
      projectRooms.forEach((sockets, projectId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id)
          io.to(`project:${projectId}`).emit('user-left', socket.id)
        }
      })
    })
  })

  console.log('✓ Socket.IO server configurado')
  return io
}
