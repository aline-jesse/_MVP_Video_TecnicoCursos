
/**
 * 🔴 Real-time Collaboration System
 * 
 * Sistema de colaboração em tempo real usando WebSocket
 * - User presence (quem está online)
 * - Slide selection (qual slide cada usuário está vendo)
 * - Cursor tracking (posição do cursor de cada usuário)
 * - Real-time updates
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { log } from '@/lib/monitoring/logger'

// Types
export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  color: string
}

export interface UserPresence {
  user: User
  projectId: string
  slideId?: string
  cursor?: {
    x: number
    y: number
  }
  lastSeen: number
}

export interface CollaborationEvent {
  type: 'presence' | 'slide_select' | 'cursor_move' | 'edit' | 'comment'
  user: User
  projectId: string
  data: any
  timestamp: number
}

/**
 * Real-time Collaboration Manager
 */
export class RealtimeCollaborationManager {
  private io?: SocketIOServer
  private presenceByProject: Map<string, Map<string, UserPresence>> = new Map()
  private heartbeatInterval?: NodeJS.Timeout
  
  /**
   * Initialize with HTTP server
   */
  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/api/socket.io',
      transports: ['websocket', 'polling'],
    })
    
    this.setupEventHandlers()
    this.startHeartbeat()
    
    log.info('Real-time collaboration initialized')
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers() {
    if (!this.io) return
    
    this.io.on('connection', (socket) => {
      log.info('Client connected', { socketId: socket.id })
      
      // Join project room
      socket.on('join_project', (data: { projectId: string; user: User }) => {
        const { projectId, user } = data
        
        // Join room
        socket.join(`project:${projectId}`)
        
        // Register presence
        this.addPresence(projectId, {
          user,
          projectId,
          lastSeen: Date.now(),
        })
        
        // Broadcast to others
        socket.to(`project:${projectId}`).emit('user_joined', {
          user,
          projectId,
          timestamp: Date.now(),
        })
        
        // Send current presence to new user
        const presence = this.getProjectPresence(projectId)
        socket.emit('presence_update', {
          users: Array.from(presence.values()),
        })
        
        log.info('User joined project', { projectId, userId: user.id })
      })
      
      // Leave project room
      socket.on('leave_project', (data: { projectId: string; userId: string }) => {
        const { projectId, userId } = data
        
        socket.leave(`project:${projectId}`)
        this.removePresence(projectId, userId)
        
        socket.to(`project:${projectId}`).emit('user_left', {
          userId,
          projectId,
          timestamp: Date.now(),
        })
        
        log.info('User left project', { projectId, userId })
      })
      
      // Slide selection
      socket.on('select_slide', (data: { projectId: string; user: User; slideId: string }) => {
        const { projectId, user, slideId } = data
        
        this.updatePresence(projectId, user.id, { slideId })
        
        socket.to(`project:${projectId}`).emit('slide_selected', {
          user,
          slideId,
          timestamp: Date.now(),
        })
      })
      
      // Cursor movement
      socket.on('cursor_move', (data: { projectId: string; user: User; cursor: { x: number; y: number } }) => {
        const { projectId, user, cursor } = data
        
        this.updatePresence(projectId, user.id, { cursor })
        
        // Broadcast cursor position (throttled by client)
        socket.to(`project:${projectId}`).emit('cursor_moved', {
          user,
          cursor,
          timestamp: Date.now(),
        })
      })
      
      // Disconnect
      socket.on('disconnect', () => {
        log.info('Client disconnected', { socketId: socket.id })
        
        // Clean up presence (implementation depends on tracking socket-user mapping)
      })
    })
  }
  
  /**
   * Add user presence
   */
  private addPresence(projectId: string, presence: UserPresence) {
    if (!this.presenceByProject.has(projectId)) {
      this.presenceByProject.set(projectId, new Map())
    }
    
    const projectPresence = this.presenceByProject.get(projectId)!
    projectPresence.set(presence.user.id, presence)
  }
  
  /**
   * Update user presence
   */
  private updatePresence(projectId: string, userId: string, updates: Partial<UserPresence>) {
    const projectPresence = this.presenceByProject.get(projectId)
    if (!projectPresence) return
    
    const presence = projectPresence.get(userId)
    if (!presence) return
    
    Object.assign(presence, updates, { lastSeen: Date.now() })
  }
  
  /**
   * Remove user presence
   */
  private removePresence(projectId: string, userId: string) {
    const projectPresence = this.presenceByProject.get(projectId)
    if (!projectPresence) return
    
    projectPresence.delete(userId)
    
    if (projectPresence.size === 0) {
      this.presenceByProject.delete(projectId)
    }
  }
  
  /**
   * Get project presence
   */
  private getProjectPresence(projectId: string): Map<string, UserPresence> {
    return this.presenceByProject.get(projectId) || new Map()
  }
  
  /**
   * Start heartbeat to clean stale presence
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now()
      const timeout = 30000 // 30 seconds
      
      for (const [projectId, projectPresence] of this.presenceByProject.entries()) {
        for (const [userId, presence] of projectPresence.entries()) {
          if (now - presence.lastSeen > timeout) {
            this.removePresence(projectId, userId)
            
            // Notify others
            if (this.io) {
              this.io.to(`project:${projectId}`).emit('user_left', {
                userId,
                projectId,
                timestamp: now,
                reason: 'timeout',
              })
            }
          }
        }
      }
    }, 10000) // Check every 10 seconds
  }
  
  /**
   * Broadcast event to project
   */
  broadcastToProject(projectId: string, event: string, data: any) {
    if (!this.io) return
    
    this.io.to(`project:${projectId}`).emit(event, {
      ...data,
      timestamp: Date.now(),
    })
  }
  
  /**
   * Get online users for project
   */
  getOnlineUsers(projectId: string): User[] {
    const projectPresence = this.presenceByProject.get(projectId)
    if (!projectPresence) return []
    
    return Array.from(projectPresence.values()).map((p) => p.user)
  }
  
  /**
   * Shutdown
   */
  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    if (this.io) {
      this.io.close()
    }
  }
}

// Singleton instance
export const realtimeManager = new RealtimeCollaborationManager()

/**
 * Client-side hook (React)
 */
export function useRealtime(projectId: string, user: User) {
  // Implementation in client components
}

export default realtimeManager
