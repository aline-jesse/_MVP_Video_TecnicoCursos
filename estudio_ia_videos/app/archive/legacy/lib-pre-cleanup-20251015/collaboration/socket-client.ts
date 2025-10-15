
/**
 * Socket.IO Client para Colaboração em Tempo Real
 * Hook React para conectar ao Socket.IO
 */

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface CollaborationUser {
  id: string
  name: string
  email: string
  color: string
  cursor?: { x: number, y: number }
}

export interface UseCollaborationOptions {
  projectId: string
  user: {
    id: string
    name: string
    email: string
  }
  onUserJoined?: (user: CollaborationUser) => void
  onUserLeft?: (userId: string) => void
  onCursorUpdate?: (data: { userId: string, cursor: { x: number, y: number }, user: { name: string, color: string } }) => void
  onCommentCreated?: (comment: any) => void
  onTimelineUpdated?: (timeline: any) => void
}

export function useCollaboration({
  projectId,
  user,
  onUserJoined,
  onUserLeft,
  onCursorUpdate,
  onCommentCreated,
  onTimelineUpdated
}: UseCollaborationOptions) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])

  useEffect(() => {
    // Conecta ao Socket.IO
    const socket = io({
      path: '/api/socketio'
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[SOCKET_CLIENT] Conectado')
      setIsConnected(true)
      
      // Entra no room do projeto
      socket.emit('join_project', {
        projectId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })
    })

    socket.on('disconnect', () => {
      console.log('[SOCKET_CLIENT] Desconectado')
      setIsConnected(false)
    })

    // Lista de usuários no room
    socket.on('room_users', ({ users }: { users: CollaborationUser[] }) => {
      setActiveUsers(users)
    })

    // Usuário entrou
    socket.on('user_joined', ({ userId, user: newUser }: { userId: string, user: CollaborationUser }) => {
      setActiveUsers(prev => [...prev, { ...newUser, id: userId }])
      onUserJoined?.(newUser)
    })

    // Usuário saiu
    socket.on('user_left', ({ userId }: { userId: string }) => {
      setActiveUsers(prev => prev.filter(u => u.id !== userId))
      onUserLeft?.(userId)
    })

    // Atualização de cursor
    if (onCursorUpdate) {
      socket.on('cursor_update', onCursorUpdate)
    }

    // Novo comentário
    socket.on('comment:created', ({ comment }: { comment: any }) => {
      onCommentCreated?.(comment)
    })

    // Timeline atualizada
    socket.on('timeline:updated', ({ timeline }: { timeline: any }) => {
      onTimelineUpdated?.(timeline)
    })

    return () => {
      socket.emit('leave_project', { projectId })
      socket.disconnect()
    }
  }, [projectId, user.id, user.name, user.email])

  // Métodos de colaboração
  const moveCursor = (x: number, y: number) => {
    socketRef.current?.emit('cursor_move', { projectId, cursor: { x, y } })
  }

  const selectSlide = (slideId: string) => {
    socketRef.current?.emit('slide_select', { projectId, slideId })
  }

  const createComment = (comment: any) => {
    socketRef.current?.emit('comment:new', { projectId, comment })
  }

  const resolveComment = (commentId: string) => {
    socketRef.current?.emit('comment:resolve', { projectId, commentId })
  }

  const updateTimeline = (timeline: any) => {
    socketRef.current?.emit('timeline:update', { projectId, timeline })
  }

  return {
    isConnected,
    activeUsers,
    moveCursor,
    selectSlide,
    createComment,
    resolveComment,
    updateTimeline
  }
}
