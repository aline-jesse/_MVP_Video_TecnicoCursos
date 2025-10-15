/**
 * NOTIFICATIONS SYSTEM - Implementação Real
 * 
 * Sistema completo de notificações em tempo real
 * Suporta múltiplos canais: in-app, push, email, webhook
 * Integrado com Socket.IO e database para persistência
 * 
 * @created 2025-10-07
 * @version 2.0.0
 */

import { PrismaClient } from '@prisma/client'
import { Server as SocketServer } from 'socket.io'
import nodemailer from 'nodemailer'
import axios from 'axios'

const prisma = new PrismaClient()

// Tipos
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  readAt?: Date
  channel: NotificationChannel[]
  priority: NotificationPriority
  actionUrl?: string
  actionLabel?: string
  imageUrl?: string
  expiresAt?: Date
  createdAt: Date
}

export type NotificationType = 
  | 'project_created'
  | 'project_updated'
  | 'project_shared'
  | 'project_deleted'
  | 'render_completed'
  | 'render_failed'
  | 'comment_added'
  | 'comment_reply'
  | 'mention'
  | 'collaboration_invite'
  | 'asset_uploaded'
  | 'quota_warning'
  | 'quota_exceeded'
  | 'payment_success'
  | 'payment_failed'
  | 'system_update'
  | 'custom'

export type NotificationChannel = 'in-app' | 'push' | 'email' | 'webhook'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationPreferences {
  userId: string
  channels: {
    [key in NotificationType]?: NotificationChannel[]
  }
  doNotDisturb: boolean
  doNotDisturbStart?: string // HH:MM
  doNotDisturbEnd?: string // HH:MM
  emailDigest: boolean
  emailDigestFrequency: 'daily' | 'weekly' | 'never'
}

export interface SendNotificationOptions {
  userId: string | string[]
  type: NotificationType
  title: string
  message: string
  data?: any
  channels?: NotificationChannel[]
  priority?: NotificationPriority
  actionUrl?: string
  actionLabel?: string
  imageUrl?: string
  expiresAt?: Date
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: any[]
}

export interface WebhookPayload {
  event: NotificationType
  userId: string
  notification: Notification
  timestamp: string
}

/**
 * Classe principal do sistema de notificações
 */
class NotificationsSystemReal {
  private io: SocketServer | null = null
  private emailTransporter: nodemailer.Transporter | null = null

  /**
   * Inicializa o sistema de notificações
   */
  initialize(io?: SocketServer) {
    this.io = io || null

    // Configurar transporter de email
    this.setupEmailTransporter()

    console.log('🔔 Notifications System inicializado')
  }

  /**
   * Configura o transporter de email
   */
  private setupEmailTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }

    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.emailTransporter = nodemailer.createTransport(emailConfig)
    }
  }

  /**
   * Envia uma notificação
   */
  async send(options: SendNotificationOptions) {
    const {
      userId,
      type,
      title,
      message,
      data,
      channels,
      priority = 'normal',
      actionUrl,
      actionLabel,
      imageUrl,
      expiresAt
    } = options

    // Normalizar userId para array
    const userIds = Array.isArray(userId) ? userId : [userId]

    const results = await Promise.all(
      userIds.map(async (uid) => {
        try {
          // Obter preferências do usuário
          const preferences = await this.getUserPreferences(uid)

          // Determinar canais baseado em preferências
          const activeChannels = channels || this.determineChannels(type, preferences)

          // Verificar Do Not Disturb
          if (preferences.doNotDisturb && this.isInDoNotDisturbPeriod(preferences)) {
            // Apenas salvar in-app, não enviar push/email
            activeChannels.splice(activeChannels.indexOf('push'), 1)
            activeChannels.splice(activeChannels.indexOf('email'), 1)
          }

          // Criar notificação no database
          const notification = await prisma.notification.create({
            data: {
              userId: uid,
              type,
              title,
              message,
              data: data as any,
              read: false,
              channel: activeChannels,
              priority,
              actionUrl,
              actionLabel,
              imageUrl,
              expiresAt
            }
          })

          // Enviar por cada canal
          await Promise.all([
            activeChannels.includes('in-app') && this.sendInApp(uid, notification),
            activeChannels.includes('push') && this.sendPush(uid, notification),
            activeChannels.includes('email') && this.sendEmail(uid, notification),
            activeChannels.includes('webhook') && this.sendWebhook(uid, notification)
          ])

          return { success: true, notificationId: notification.id }

        } catch (error: any) {
          console.error(`Erro ao enviar notificação para ${uid}:`, error)
          return { success: false, error: error.message }
        }
      })
    )

    return results
  }

  /**
   * Envia notificação in-app via WebSocket
   */
  private async sendInApp(userId: string, notification: Notification) {
    if (!this.io) {
      console.warn('Socket.IO não configurado, notificação in-app não enviada')
      return
    }

    // Enviar para o room do usuário
    this.io.to(`user:${userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      imageUrl: notification.imageUrl,
      createdAt: notification.createdAt
    })
  }

  /**
   * Envia push notification
   */
  private async sendPush(userId: string, notification: Notification) {
    // Obter dispositivos do usuário
    const devices = await prisma.userDevice.findMany({
      where: { 
        userId,
        pushToken: { not: null }
      }
    })

    if (devices.length === 0) {
      return
    }

    // Enviar para cada dispositivo
    for (const device of devices) {
      try {
        // TODO: Integrar com serviço de push (Firebase, OneSignal, etc.)
        // Por enquanto, apenas log
        console.log(`📱 Push para ${device.pushToken}:`, notification.title)

        // Exemplo com Firebase (quando integrado):
        // await admin.messaging().send({
        //   token: device.pushToken,
        //   notification: {
        //     title: notification.title,
        //     body: notification.message,
        //     imageUrl: notification.imageUrl
        //   },
        //   data: notification.data
        // })

      } catch (error) {
        console.error(`Erro ao enviar push para dispositivo ${device.id}:`, error)
      }
    }
  }

  /**
   * Envia notificação por email
   */
  private async sendEmail(userId: string, notification: Notification) {
    if (!this.emailTransporter) {
      console.warn('Email transporter não configurado')
      return
    }

    // Obter email do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (!user?.email) {
      return
    }

    // Construir HTML do email
    const html = this.buildEmailHTML(notification, user.name || 'Usuário')

    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@estudioiavideos.com',
        to: user.email,
        subject: notification.title,
        html,
        text: notification.message
      })

      console.log(`📧 Email enviado para ${user.email}`)

    } catch (error) {
      console.error(`Erro ao enviar email para ${user.email}:`, error)
    }
  }

  /**
   * Envia webhook
   */
  private async sendWebhook(userId: string, notification: Notification) {
    // Obter webhooks configurados do usuário
    const webhooks = await prisma.webhook.findMany({
      where: {
        userId,
        active: true,
        events: { has: notification.type }
      }
    })

    for (const webhook of webhooks) {
      try {
        const payload: WebhookPayload = {
          event: notification.type,
          userId,
          notification,
          timestamp: new Date().toISOString()
        }

        await axios.post(webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': this.generateWebhookSignature(payload, webhook.secret)
          },
          timeout: 5000
        })

        console.log(`🔗 Webhook enviado para ${webhook.url}`)

      } catch (error) {
        console.error(`Erro ao enviar webhook para ${webhook.url}:`, error)
      }
    }
  }

  /**
   * Constrói HTML do email
   */
  private buildEmailHTML(notification: Notification, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #0066cc;
          }
          .notification {
            background: #f5f5f5;
            border-left: 4px solid ${this.getPriorityColor(notification.priority)};
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .notification h2 {
            margin: 0 0 10px 0;
            color: #333;
          }
          .notification p {
            margin: 0;
            color: #666;
          }
          .action-button {
            display: inline-block;
            background: #0066cc;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎬 Estúdio IA Videos</div>
          </div>
          
          <p>Olá, ${userName}!</p>
          
          <div class="notification">
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
          </div>
          
          ${notification.actionUrl ? `
            <a href="${notification.actionUrl}" class="action-button">
              ${notification.actionLabel || 'Ver detalhes'}
            </a>
          ` : ''}
          
          <div class="footer">
            <p>Você recebeu este email porque está cadastrado no Estúdio IA Videos.</p>
            <p>Para gerenciar suas preferências de notificação, acesse Configurações.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Obtém cor baseada na prioridade
   */
  private getPriorityColor(priority: NotificationPriority): string {
    const colors = {
      low: '#4CAF50',
      normal: '#2196F3',
      high: '#FF9800',
      urgent: '#F44336'
    }
    return colors[priority]
  }

  /**
   * Gera assinatura para webhook
   */
  private generateWebhookSignature(payload: any, secret: string): string {
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(JSON.stringify(payload))
    return hmac.digest('hex')
  }

  /**
   * Determina canais baseado em preferências
   */
  private determineChannels(
    type: NotificationType,
    preferences: NotificationPreferences
  ): NotificationChannel[] {
    if (preferences.channels[type]) {
      return preferences.channels[type]!
    }

    // Padrões
    const defaults: { [key in NotificationType]: NotificationChannel[] } = {
      project_created: ['in-app'],
      project_updated: ['in-app'],
      project_shared: ['in-app', 'push', 'email'],
      project_deleted: ['in-app'],
      render_completed: ['in-app', 'push'],
      render_failed: ['in-app', 'push', 'email'],
      comment_added: ['in-app', 'push'],
      comment_reply: ['in-app', 'push'],
      mention: ['in-app', 'push', 'email'],
      collaboration_invite: ['in-app', 'push', 'email'],
      asset_uploaded: ['in-app'],
      quota_warning: ['in-app', 'email'],
      quota_exceeded: ['in-app', 'push', 'email'],
      payment_success: ['in-app', 'email'],
      payment_failed: ['in-app', 'push', 'email'],
      system_update: ['in-app'],
      custom: ['in-app']
    }

    return defaults[type] || ['in-app']
  }

  /**
   * Verifica se está em período Do Not Disturb
   */
  private isInDoNotDisturbPeriod(preferences: NotificationPreferences): boolean {
    if (!preferences.doNotDisturbStart || !preferences.doNotDisturbEnd) {
      return false
    }

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    return currentTime >= preferences.doNotDisturbStart && 
           currentTime <= preferences.doNotDisturbEnd
  }

  /**
   * Obtém preferências do usuário
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId }
    })

    if (prefs) {
      return prefs as NotificationPreferences
    }

    // Criar preferências padrão
    const defaultPrefs = await prisma.notificationPreferences.create({
      data: {
        userId,
        channels: {},
        doNotDisturb: false,
        emailDigest: false,
        emailDigestFrequency: 'never'
      }
    })

    return defaultPrefs as NotificationPreferences
  }

  /**
   * Atualiza preferências do usuário
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ) {
    const updated = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: preferences as any,
      create: {
        userId,
        ...preferences as any
      }
    })

    return updated
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    return notification
  }

  /**
   * Marca todas como lidas
   */
  async markAllAsRead(userId: string) {
    const notifications = await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    return notifications
  }

  /**
   * Obtém notificações do usuário
   */
  async getUserNotifications(
    userId: string,
    options: {
      read?: boolean
      type?: NotificationType
      limit?: number
      offset?: number
    } = {}
  ) {
    const where: any = { userId }

    if (options.read !== undefined) {
      where.read = options.read
    }

    if (options.type) {
      where.type = options.type
    }

    // Remover expiradas
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ]

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0
    })

    return notifications
  }

  /**
   * Conta notificações não lidas
   */
  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

    return count
  }

  /**
   * Deleta notificação
   */
  async deleteNotification(notificationId: string, userId: string) {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    })

    return { success: true }
  }

  /**
   * Deleta todas as notificações
   */
  async deleteAllNotifications(userId: string) {
    await prisma.notification.deleteMany({
      where: { userId }
    })

    return { success: true }
  }

  /**
   * Limpa notificações expiradas (executar periodicamente)
   */
  async cleanupExpired() {
    const deleted = await prisma.notification.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    })

    console.log(`🗑️ ${deleted.count} notificações expiradas removidas`)

    return deleted
  }
}

// Instância singleton
export const notificationsSystem = new NotificationsSystemReal()

export default NotificationsSystemReal
