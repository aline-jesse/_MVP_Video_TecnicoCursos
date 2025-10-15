/**
 * 👥 COLLABORATION SYSTEM - Sistema de Colaboração em Tempo Real
 * 
 * Features:
 * - WebSocket real-time com Socket.IO
 * - Comentários em tempo real
 * - Cursores de múltiplos usuários
 * - Versionamento de projetos
 * - Presença de usuários (quem está online)
 * - Notificações push
 * - Edição colaborativa
 */

import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Comment {
  id: string
  projectId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
  slideNumber?: number
  position?: { x: number; y: number }
  resolved: boolean
  replies?: Comment[]
}

export interface UserPresence {
  userId: string
  userName: string
  userAvatar?: string
  projectId: string
  cursor?: { x: number; y: number }
  activeSlide?: number
  lastSeen: Date
}

export interface ProjectVersion {
  id: string
  projectId: string
  version: number
  name: string
  description?: string
  userId: string
  userName: string
  createdAt: Date
  snapshot: any // Snapshot completo do projeto
}

export interface CollaborationEvent {
  type: 'comment' | 'cursor' | 'edit' | 'presence' | 'notification'
  projectId: string
  userId: string
  data: any
  timestamp: Date
}

/**
 * Sistema de Colaboração Real-Time
 */
export class CollaborationSystem {
  private io: SocketIOServer | null = null
  private userPresence = new Map<string, UserPresence>()
  private projectRooms = new Map<string, Set<string>>() // projectId -> Set<socketId>

  constructor() {}

  /**
   * Inicializa o servidor Socket.IO
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    this.setupEventHandlers()

    console.log('[Collaboration] Sistema WebSocket inicializado')
  }

  /**
   * Configura handlers de eventos
   */
  private setupEventHandlers(): void {
    if (!this.io) return

    this.io.on('connection', (socket: Socket) => {
      console.log(`[Collaboration] Cliente conectado: ${socket.id}`)

      // Join project room
      socket.on('join-project', async (data: { projectId: string; userId: string; userName: string }) => {
        await this.handleJoinProject(socket, data)
      })

      // Leave project room
      socket.on('leave-project', async (data: { projectId: string; userId: string }) => {
        await this.handleLeaveProject(socket, data)
      })

      // New comment
      socket.on('new-comment', async (comment: Omit<Comment, 'id' | 'timestamp'>) => {
        await this.handleNewComment(socket, comment)
      })

      // Update comment
      socket.on('update-comment', async (comment: Comment) => {
        await this.handleUpdateComment(socket, comment)
      })

      // Delete comment
      socket.on('delete-comment', async (data: { commentId: string; projectId: string }) => {
        await this.handleDeleteComment(socket, data)
      })

      // Cursor movement
      socket.on('cursor-move', (data: { projectId: string; userId: string; position: { x: number; y: number } }) => {
        this.handleCursorMove(socket, data)
      })

      // Edit event
      socket.on('edit', async (data: { projectId: string; userId: string; changes: any }) => {
        await this.handleEdit(socket, data)
      })

      // Create version
      socket.on('create-version', async (version: Omit<ProjectVersion, 'id' | 'createdAt'>) => {
        await this.handleCreateVersion(socket, version)
      })

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })
    })
  }

  /**
   * Usuário entra em um projeto
   */
  private async handleJoinProject(
    socket: Socket,
    data: { projectId: string; userId: string; userName: string }
  ): Promise<void> {
    try {
      const { projectId, userId, userName } = data

      // Adicionar à sala do projeto
      socket.join(projectId)

      // Registrar no mapa de salas
      if (!this.projectRooms.has(projectId)) {
        this.projectRooms.set(projectId, new Set())
      }
      this.projectRooms.get(projectId)!.add(socket.id)

      // Registrar presença
      const presence: UserPresence = {
        userId,
        userName,
        projectId,
        lastSeen: new Date(),
      }
      this.userPresence.set(socket.id, presence)

      // Buscar comentários existentes
      const comments = await this.getProjectComments(projectId)

      // Buscar usuários online
      const onlineUsers = this.getOnlineUsers(projectId)

      // Enviar dados iniciais para o usuário
      socket.emit('project-joined', {
        projectId,
        comments,
        onlineUsers,
      })

      // Notificar outros usuários
      socket.to(projectId).emit('user-joined', {
        userId,
        userName,
        timestamp: new Date(),
      })

      console.log(`[Collaboration] Usuário ${userName} entrou no projeto ${projectId}`)
    } catch (error) {
      console.error('[Collaboration] Erro ao entrar no projeto:', error)
      socket.emit('error', { message: 'Erro ao entrar no projeto' })
    }
  }

  /**
   * Usuário sai de um projeto
   */
  private async handleLeaveProject(
    socket: Socket,
    data: { projectId: string; userId: string }
  ): Promise<void> {
    try {
      const { projectId, userId } = data

      // Remover da sala
      socket.leave(projectId)

      // Remover do mapa
      this.projectRooms.get(projectId)?.delete(socket.id)
      this.userPresence.delete(socket.id)

      // Notificar outros usuários
      socket.to(projectId).emit('user-left', {
        userId,
        timestamp: new Date(),
      })

      console.log(`[Collaboration] Usuário ${userId} saiu do projeto ${projectId}`)
    } catch (error) {
      console.error('[Collaboration] Erro ao sair do projeto:', error)
    }
  }

  /**
   * Novo comentário
   */
  private async handleNewComment(
    socket: Socket,
    comment: Omit<Comment, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      // Salvar no database
      const dbComment = await prisma.projectComment.create({
        data: {
          projectId: comment.projectId,
          userId: comment.userId,
          content: comment.content,
          slideNumber: comment.slideNumber,
          position: comment.position as any,
          resolved: comment.resolved || false,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      })

      const newComment: Comment = {
        id: dbComment.id,
        projectId: dbComment.projectId,
        userId: dbComment.userId,
        userName: dbComment.user.name || 'Usuário',
        userAvatar: dbComment.user.image || undefined,
        content: dbComment.content,
        timestamp: dbComment.createdAt,
        slideNumber: dbComment.slideNumber || undefined,
        position: dbComment.position as any,
        resolved: dbComment.resolved,
      }

      // Broadcast para todos na sala
      this.io!.to(comment.projectId).emit('comment-added', newComment)

      console.log(`[Collaboration] Novo comentário no projeto ${comment.projectId}`)
    } catch (error) {
      console.error('[Collaboration] Erro ao criar comentário:', error)
      socket.emit('error', { message: 'Erro ao criar comentário' })
    }
  }

  /**
   * Atualizar comentário
   */
  private async handleUpdateComment(socket: Socket, comment: Comment): Promise<void> {
    try {
      // Atualizar no database
      await prisma.projectComment.update({
        where: { id: comment.id },
        data: {
          content: comment.content,
          resolved: comment.resolved,
        },
      })

      // Broadcast para todos na sala
      this.io!.to(comment.projectId).emit('comment-updated', comment)

      console.log(`[Collaboration] Comentário ${comment.id} atualizado`)
    } catch (error) {
      console.error('[Collaboration] Erro ao atualizar comentário:', error)
      socket.emit('error', { message: 'Erro ao atualizar comentário' })
    }
  }

  /**
   * Deletar comentário
   */
  private async handleDeleteComment(
    socket: Socket,
    data: { commentId: string; projectId: string }
  ): Promise<void> {
    try {
      // Deletar do database
      await prisma.projectComment.delete({
        where: { id: data.commentId },
      })

      // Broadcast para todos na sala
      this.io!.to(data.projectId).emit('comment-deleted', {
        commentId: data.commentId,
      })

      console.log(`[Collaboration] Comentário ${data.commentId} deletado`)
    } catch (error) {
      console.error('[Collaboration] Erro ao deletar comentário:', error)
      socket.emit('error', { message: 'Erro ao deletar comentário' })
    }
  }

  /**
   * Movimento de cursor
   */
  private handleCursorMove(
    socket: Socket,
    data: { projectId: string; userId: string; position: { x: number; y: number } }
  ): void {
    // Atualizar presença
    const presence = this.userPresence.get(socket.id)
    if (presence) {
      presence.cursor = data.position
      presence.lastSeen = new Date()
    }

    // Broadcast para outros usuários (exceto sender)
    socket.to(data.projectId).emit('cursor-moved', {
      userId: data.userId,
      position: data.position,
    })
  }

  /**
   * Edição no projeto
   */
  private async handleEdit(
    socket: Socket,
    data: { projectId: string; userId: string; changes: any }
  ): Promise<void> {
    try {
      // Broadcast para outros usuários
      socket.to(data.projectId).emit('project-edited', {
        userId: data.userId,
        changes: data.changes,
        timestamp: new Date(),
      })

      console.log(`[Collaboration] Edição no projeto ${data.projectId}`)
    } catch (error) {
      console.error('[Collaboration] Erro ao processar edição:', error)
    }
  }

  /**
   * Criar versão do projeto
   */
  private async handleCreateVersion(
    socket: Socket,
    version: Omit<ProjectVersion, 'id' | 'createdAt'>
  ): Promise<void> {
    try {
      // Salvar no database
      const dbVersion = await prisma.projectVersion.create({
        data: {
          projectId: version.projectId,
          userId: version.userId,
          version: version.version,
          name: version.name,
          description: version.description,
          snapshot: version.snapshot as any,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      })

      const newVersion: ProjectVersion = {
        id: dbVersion.id,
        projectId: dbVersion.projectId,
        version: dbVersion.version,
        name: dbVersion.name,
        description: dbVersion.description || undefined,
        userId: dbVersion.userId,
        userName: dbVersion.user.name || 'Usuário',
        createdAt: dbVersion.createdAt,
        snapshot: dbVersion.snapshot,
      }

      // Broadcast para todos na sala
      this.io!.to(version.projectId).emit('version-created', newVersion)

      console.log(`[Collaboration] Versão ${version.version} criada para projeto ${version.projectId}`)
    } catch (error) {
      console.error('[Collaboration] Erro ao criar versão:', error)
      socket.emit('error', { message: 'Erro ao criar versão' })
    }
  }

  /**
   * Cliente desconectado
   */
  private handleDisconnect(socket: Socket): void {
    const presence = this.userPresence.get(socket.id)

    if (presence) {
      // Notificar outros usuários
      socket.to(presence.projectId).emit('user-left', {
        userId: presence.userId,
        timestamp: new Date(),
      })

      // Remover presença
      this.userPresence.delete(socket.id)

      // Remover do mapa de salas
      this.projectRooms.get(presence.projectId)?.delete(socket.id)
    }

    console.log(`[Collaboration] Cliente desconectado: ${socket.id}`)
  }

  /**
   * Busca comentários do projeto
   */
  private async getProjectComments(projectId: string): Promise<Comment[]> {
    try {
      const comments = await prisma.projectComment.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      return comments.map((c) => ({
        id: c.id,
        projectId: c.projectId,
        userId: c.userId,
        userName: c.user.name || 'Usuário',
        userAvatar: c.user.image || undefined,
        content: c.content,
        timestamp: c.createdAt,
        slideNumber: c.slideNumber || undefined,
        position: c.position as any,
        resolved: c.resolved,
      }))
    } catch (error) {
      console.error('[Collaboration] Erro ao buscar comentários:', error)
      return []
    }
  }

  /**
   * Obtém usuários online em um projeto
   */
  private getOnlineUsers(projectId: string): UserPresence[] {
    const users: UserPresence[] = []

    this.userPresence.forEach((presence) => {
      if (presence.projectId === projectId) {
        users.push(presence)
      }
    })

    return users
  }

  /**
   * Envia notificação para usuário específico
   */
  async sendNotification(
    userId: string,
    notification: {
      type: string
      title: string
      message: string
      data?: any
    }
  ): Promise<void> {
    try {
      // Salvar no database
      await prisma.notification.create({
        data: {
          userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data as any,
          read: false,
        },
      })

      // Enviar via WebSocket se o usuário estiver online
      if (this.io) {
        this.io.emit(`notification:${userId}`, notification)
      }
    } catch (error) {
      console.error('[Collaboration] Erro ao enviar notificação:', error)
    }
  }

  /**
   * Fecha o servidor Socket.IO
   */
  close(): void {
    if (this.io) {
      this.io.close()
      console.log('[Collaboration] Servidor Socket.IO fechado')
    }
  }
}

// Instância singleton
export const collaborationSystem = new CollaborationSystem()
