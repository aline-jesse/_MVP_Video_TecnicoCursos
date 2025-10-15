/**
 * WebSocket Server para Timeline Multi-Track
 * Comunicação em tempo real para colaboração
 */
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'

export interface TimelineWebSocketServer extends HTTPServer {
  io?: SocketIOServer
}

// Tipos de eventos
export enum TimelineEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  
  // Room management
  JOIN_PROJECT = 'timeline:join_project',
  LEAVE_PROJECT = 'timeline:leave_project',
  
  // Collaboration
  TRACK_LOCKED = 'timeline:track_locked',
  TRACK_UNLOCKED = 'timeline:track_unlocked',
  USER_JOINED = 'timeline:user_joined',
  USER_LEFT = 'timeline:user_left',
  
  // Presence
  CURSOR_MOVE = 'timeline:cursor_move',
  PRESENCE_UPDATE = 'timeline:presence_update',
  ACTIVE_USERS = 'timeline:active_users',
  
  // Timeline updates
  TIMELINE_UPDATED = 'timeline:updated',
  CLIP_ADDED = 'timeline:clip_added',
  CLIP_REMOVED = 'timeline:clip_removed',
  CLIP_MOVED = 'timeline:clip_moved',
  
  // Bulk operations
  BULK_START = 'timeline:bulk_start',
  BULK_COMPLETE = 'timeline:bulk_complete',
  
  // Notifications
  NOTIFICATION = 'timeline:notification',
  CONFLICT = 'timeline:conflict',
  
  // Export events
  EXPORT_PROGRESS = 'export:progress',
  EXPORT_COMPLETE = 'export:complete',
  EXPORT_FAILED = 'export:failed',
  EXPORT_CANCELLED = 'export:cancelled',
}

// Payloads de eventos
export interface JoinProjectPayload {
  projectId: string
  userId: string
  userName: string
  userImage?: string
}

export interface TrackLockedPayload {
  projectId: string
  trackId: string
  userId: string
  userName: string
  timestamp: string
}

export interface CursorMovePayload {
  projectId: string
  userId: string
  trackId?: string
  position: { x: number; y: number; time: number }
}

export interface TimelineUpdatePayload {
  projectId: string
  userId: string
  version: number
  changes: {
    type: 'add' | 'update' | 'delete'
    target: 'track' | 'clip' | 'settings'
    data: any
  }
}

export interface NotificationPayload {
  projectId: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  userId?: string // Se null, broadcast para todos
}

// Mapa de usuários ativos por projeto
const projectUsers = new Map<string, Set<string>>()
const userSockets = new Map<string, string>() // userId -> socketId

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    path: '/api/socket/timeline',
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      // Em produção, validar token JWT do handshake
      const token = socket.handshake.auth.token
      
      if (!token) {
        return next(new Error('Authentication required'))
      }

      // Validar sessão (simplificado para dev)
      // Em produção, decodificar JWT e validar
      socket.data.userId = socket.handshake.auth.userId
      socket.data.userName = socket.handshake.auth.userName
      
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.data.userId
    const userName = socket.data.userName

    console.log(`[WebSocket] User connected: ${userName} (${userId})`)
    
    // Armazenar socket do usuário
    userSockets.set(userId, socket.id)

    // JOIN PROJECT
    socket.on(TimelineEvent.JOIN_PROJECT, ({ projectId, userName, userImage }: JoinProjectPayload) => {
      console.log(`[WebSocket] ${userName} joining project ${projectId}`)
      
      // Entrar na room do projeto
      socket.join(`project:${projectId}`)
      
      // Adicionar usuário ao mapa
      if (!projectUsers.has(projectId)) {
        projectUsers.set(projectId, new Set())
      }
      projectUsers.get(projectId)!.add(userId)
      
      // Emitir USER_JOINED para o próprio usuário também
      socket.emit(TimelineEvent.USER_JOINED, {
        userId: socket.data.userId,
        userName: socket.data.userName,
        userImage,
        projectId,
        timestamp: new Date().toISOString()
      })
      
      // Notificar outros usuários
      socket.to(`project:${projectId}`).emit(TimelineEvent.USER_JOINED, {
        userId: socket.data.userId,
        userName: socket.data.userName,
        userImage,
        projectId,
        timestamp: new Date().toISOString()
      })
      
      // Enviar lista de usuários ativos para o novo usuário
      const activeUsers = Array.from(projectUsers.get(projectId) || [])
      socket.emit(TimelineEvent.ACTIVE_USERS, {
        projectId,
        users: activeUsers,
        count: activeUsers.length
      })
    })

    // LEAVE PROJECT
    socket.on(TimelineEvent.LEAVE_PROJECT, ({ projectId }: { projectId: string }) => {
      console.log(`[WebSocket] ${userName} leaving project ${projectId}`)
      
      socket.leave(`project:${projectId}`)
      
      // Remover usuário do mapa
      if (projectUsers.has(projectId)) {
        projectUsers.get(projectId)!.delete(userId)
        
        // Limpar se vazio
        if (projectUsers.get(projectId)!.size === 0) {
          projectUsers.delete(projectId)
        }
      }
      
      // Emitir USER_LEFT para o próprio usuário também
      socket.emit(TimelineEvent.USER_LEFT, {
        userId,
        userName,
        projectId,
        timestamp: new Date().toISOString()
      })
      
      // Notificar outros usuários
      socket.to(`project:${projectId}`).emit(TimelineEvent.USER_LEFT, {
        userId,
        userName,
        projectId,
        timestamp: new Date().toISOString()
      })
    })

    // TRACK LOCKED
    socket.on(TimelineEvent.TRACK_LOCKED, (payload: TrackLockedPayload) => {
      console.log(`[WebSocket] Track locked: ${payload.trackId} by ${payload.userName}`)
      
      // Broadcast para outros usuários no projeto
      socket.to(`project:${payload.projectId}`).emit(TimelineEvent.TRACK_LOCKED, {
        ...payload,
        timestamp: new Date().toISOString()
      })
    })

    // TRACK UNLOCKED
    socket.on(TimelineEvent.TRACK_UNLOCKED, (payload: Omit<TrackLockedPayload, 'userName'>) => {
      console.log(`[WebSocket] Track unlocked: ${payload.trackId}`)
      
      socket.to(`project:${payload.projectId}`).emit(TimelineEvent.TRACK_UNLOCKED, {
        ...payload,
        timestamp: new Date().toISOString()
      })
    })

    // CURSOR MOVE (throttled no cliente)
    socket.on(TimelineEvent.CURSOR_MOVE, (payload: CursorMovePayload) => {
      // Broadcast posição do cursor para outros usuários
      socket.to(`project:${payload.projectId}`).emit(TimelineEvent.CURSOR_MOVE, payload)
    })

    // PRESENCE UPDATE
    socket.on(TimelineEvent.PRESENCE_UPDATE, ({ projectId, currentTrackId }: { projectId: string; currentTrackId?: string }) => {
      socket.to(`project:${projectId}`).emit(TimelineEvent.PRESENCE_UPDATE, {
        userId,
        userName,
        currentTrackId,
        timestamp: new Date().toISOString()
      })
    })

    // TIMELINE UPDATED
    socket.on(TimelineEvent.TIMELINE_UPDATED, (payload: TimelineUpdatePayload) => {
      console.log(`[WebSocket] Timeline updated by ${userId} in project ${payload.projectId}`)
      
      // Broadcast mudanças para outros usuários
      socket.to(`project:${payload.projectId}`).emit(TimelineEvent.TIMELINE_UPDATED, {
        ...payload,
        timestamp: new Date().toISOString()
      })
    })

    // BULK OPERATION
    socket.on(TimelineEvent.BULK_START, ({ projectId, operation, itemCount }: any) => {
      socket.to(`project:${projectId}`).emit(TimelineEvent.BULK_START, {
        userId,
        userName,
        operation,
        itemCount,
        timestamp: new Date().toISOString()
      })
    })

    socket.on(TimelineEvent.BULK_COMPLETE, ({ projectId, operation, result }: any) => {
      socket.to(`project:${projectId}`).emit(TimelineEvent.BULK_COMPLETE, {
        userId,
        userName,
        operation,
        result,
        timestamp: new Date().toISOString()
      })
    })

    // NOTIFICATION
    socket.on(TimelineEvent.NOTIFICATION, (payload: any) => {
      const { projectId, message, type } = payload
      
      // Broadcast para todos no projeto
      socket.to(`project:${projectId}`).emit(TimelineEvent.NOTIFICATION, {
        userId,
        userName,
        message,
        type,
        projectId,
        timestamp: new Date().toISOString()
      })
    })

    // CONFLICT
    socket.on(TimelineEvent.CONFLICT, (payload: any) => {
      const { projectId, conflictType, trackId, lockedBy } = payload
      
      // Broadcast para todos no projeto
      socket.to(`project:${projectId}`).emit(TimelineEvent.CONFLICT, {
        userId,
        userName,
        conflictType,
        trackId,
        lockedBy,
        projectId,
        timestamp: new Date().toISOString()
      })
    })

    // CLIP ADDED
    socket.on(TimelineEvent.CLIP_ADDED, (payload: any) => {
      const { projectId, clipId, trackId } = payload
      
      // Broadcast para todos no projeto
      socket.to(`project:${projectId}`).emit(TimelineEvent.CLIP_ADDED, {
        userId,
        userName,
        clipId,
        trackId,
        projectId,
        timestamp: new Date().toISOString()
      })
    })

    // GET ACTIVE USERS (query evento)
    socket.on('timeline:get_active_users', ({ projectId }: { projectId: string }) => {
      const activeUsers = Array.from(projectUsers.get(projectId) || [])
      socket.emit(TimelineEvent.ACTIVE_USERS, {
        projectId,
        users: activeUsers,
        count: activeUsers.length
      })
    })

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`[WebSocket] User disconnected: ${userName} (${userId})`)
      
      // Remover de todos os projetos
      projectUsers.forEach((users, projectId) => {
        if (users.has(userId)) {
          users.delete(userId)
          
          // Notificar outros usuários
          socket.to(`project:${projectId}`).emit(TimelineEvent.USER_LEFT, {
            userId,
            userName,
            projectId,
            timestamp: new Date().toISOString()
          })
          
          // Limpar projeto vazio
          if (users.size === 0) {
            projectUsers.delete(projectId)
          }
        }
      })
      
      // Remover socket do usuário
      userSockets.delete(userId)
    })
  })

  // Adicionar helper para enviar notificações do servidor
  ;(httpServer as TimelineWebSocketServer).io = io

  console.log('[WebSocket] Server initialized on /api/socket/timeline')
  
  return io
}

// Helper para enviar eventos do servidor
export function emitToProject(
  io: SocketIOServer,
  projectId: string,
  event: TimelineEvent,
  payload: any
) {
  io.to(`project:${projectId}`).emit(event, {
    ...payload,
    timestamp: new Date().toISOString()
  })
}

// Helper para obter usuários ativos de um projeto
export function getProjectUsers(projectId: string): string[] {
  return Array.from(projectUsers.get(projectId) || [])
}

// Helper para verificar se usuário está online
export function isUserOnline(userId: string): boolean {
  return userSockets.has(userId)
}
