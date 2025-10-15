
/**
 * 🔌 Socket.IO Client - Hook para Colaboração
 * Hook React para usar colaboração em tempo real
 */

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'react-hot-toast'

interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  cursor?: { x: number; y: number }
}

interface Comment {
  id: string
  content: string
  timestamp: number
  position?: { x: number; y: number }
  userId: string
  userName: string
}

interface ProjectVersion {
  id: string
  name: string
  data: any
  timestamp: number
  userId: string
  userName: string
}

export const useCollaboration = (projectId: string, userId: string, userName: string) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [users, setUsers] = useState<CollaborationUser[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [versions, setVersions] = useState<ProjectVersion[]>([])

  useEffect(() => {
    if (!projectId || !userId || !userName) return

    // Inicializar Socket.IO
    const socketInstance = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/collaboration/socketio',
    })

    socketInstance.on('connect', () => {
      console.log('✅ Conectado ao Socket.IO')
      setIsConnected(true)
      toast.success('Colaboração ativada!')

      // Join project room
      socketInstance.emit('join-project', { projectId, userId, userName })
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Desconectado do Socket.IO')
      setIsConnected(false)
      toast.error('Colaboração desconectada')
    })

    // User management
    socketInstance.on('user-joined', (data: { userId: string; userName: string }) => {
      toast.success(`${data.userName} entrou no projeto`)
    })

    socketInstance.on('user-left', (data: { userId: string; userName: string }) => {
      toast(`${data.userName} saiu do projeto`, { icon: '👋' })
    })

    socketInstance.on('room-users', (roomUsers: CollaborationUser[]) => {
      setUsers(roomUsers.filter(user => user.id !== userId)) // Exclude self
    })

    // Canvas updates
    socketInstance.on('canvas-updated', (data: {
      userId: string
      userName: string
      canvasData: any
      timestamp: number
    }) => {
      // Handle canvas update from other users
      console.log(`🎨 Canvas atualizado por ${data.userName}`)
      // This will be handled by the canvas component
    })

    // Comments
    socketInstance.on('comment-added', (data: {
      userId: string
      userName: string
      comment: Comment
    }) => {
      if (data.userId !== userId) {
        setComments(prev => [...prev, { ...data.comment, userId: data.userId, userName: data.userName }])
        toast.success(`💬 Novo comentário de ${data.userName}`)
      }
    })

    // Cursor tracking
    socketInstance.on('cursor-moved', (data: {
      userId: string
      userName: string
      position: { x: number; y: number }
    }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, cursor: data.position }
          : user
      ))
    })

    // Versions
    socketInstance.on('version-saved', (data: {
      userId: string
      userName: string
      version: ProjectVersion
    }) => {
      if (data.userId !== userId) {
        setVersions(prev => [...prev, { ...data.version, userId: data.userId, userName: data.userName }])
        toast.success(`💾 Nova versão: ${data.version.name}`)
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [projectId, userId, userName])

  // Methods
  const updateCanvas = (canvasData: any) => {
    if (socket && isConnected) {
      socket.emit('canvas-update', {
        projectId,
        userId,
        userName,
        canvasData,
        timestamp: Date.now()
      })
    }
  }

  const addComment = (content: string, position?: { x: number; y: number }) => {
    if (socket && isConnected) {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        content,
        timestamp: Date.now(),
        position,
        userId,
        userName
      }

      socket.emit('add-comment', {
        projectId,
        userId,
        userName,
        comment
      })

      // Add to local state
      setComments(prev => [...prev, comment])
    }
  }

  const moveCursor = (position: { x: number; y: number }) => {
    if (socket && isConnected) {
      socket.emit('cursor-move', {
        projectId,
        userId,
        userName,
        position
      })
    }
  }

  const saveVersion = (versionName: string, data: any) => {
    if (socket && isConnected) {
      const version: ProjectVersion = {
        id: `version-${Date.now()}`,
        name: versionName,
        data,
        timestamp: Date.now(),
        userId,
        userName
      }

      socket.emit('save-version', {
        projectId,
        userId,
        userName,
        version
      })

      // Add to local state
      setVersions(prev => [...prev, version])
    }
  }

  return {
    isConnected,
    users,
    comments,
    versions,
    updateCanvas,
    addComment,
    moveCursor,
    saveVersion
  }
}
