/**
 * 🔄 WEBSOCKET SERVER
 * Real-time WebSocket server for render progress and system notifications
 */

import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { URL } from 'url'

interface WebSocketClient {
  ws: WebSocket
  userId: string
  subscriptions: Set<string>
  lastPing: Date
}

interface WebSocketMessage {
  type: string
  data: any
  timestamp: Date
  userId?: string
}

class UnifiedWebSocketServer {
  private wss: WebSocketServer | null = null
  private clients: Map<string, WebSocketClient> = new Map()
  private pingInterval: NodeJS.Timeout | null = null

  constructor(private port: number = 8080) {}

  start() {
    if (this.wss) {
      console.log('WebSocket server already running')
      return
    }

    this.wss = new WebSocketServer({ 
      port: this.port,
      perMessageDeflate: false
    })

    console.log(`🔄 WebSocket server started on port ${this.port}`)

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request)
    })

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error)
    })

    // Start ping/pong to keep connections alive
    this.startPingInterval()
  }

  stop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }

    if (this.wss) {
      this.wss.close()
      this.wss = null
    }

    this.clients.clear()
    console.log('🔄 WebSocket server stopped')
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url || '', `http://${request.headers.host}`)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      console.log('WebSocket connection rejected: no userId')
      ws.close(1008, 'User ID required')
      return
    }

    const clientId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const client: WebSocketClient = {
      ws,
      userId,
      subscriptions: new Set(),
      lastPing: new Date()
    }

    this.clients.set(clientId, client)
    console.log(`✅ WebSocket client connected: ${clientId} (user: ${userId})`)

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connected',
      data: { clientId, userId },
      timestamp: new Date()
    })

    // Handle messages from client
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        this.handleClientMessage(clientId, message)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })

    // Handle client disconnect
    ws.on('close', () => {
      this.clients.delete(clientId)
      console.log(`❌ WebSocket client disconnected: ${clientId}`)
    })

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket client error (${clientId}):`, error)
      this.clients.delete(clientId)
    })
  }

  private handleClientMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client) return

    switch (message.type) {
      case 'ping':
        client.lastPing = new Date()
        this.sendToClient(clientId, {
          type: 'pong',
          data: {},
          timestamp: new Date()
        })
        break

      case 'subscribe':
        if (message.data?.events && Array.isArray(message.data.events)) {
          message.data.events.forEach((event: string) => {
            client.subscriptions.add(event)
          })
          console.log(`Client ${clientId} subscribed to:`, message.data.events)
        }
        break

      case 'unsubscribe':
        if (message.data?.events && Array.isArray(message.data.events)) {
          message.data.events.forEach((event: string) => {
            client.subscriptions.delete(event)
          })
          console.log(`Client ${clientId} unsubscribed from:`, message.data.events)
        }
        break

      default:
        console.log(`Unknown message type from ${clientId}:`, message.type)
    }
  }

  private sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId)
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      client.ws.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error(`Error sending message to client ${clientId}:`, error)
      this.clients.delete(clientId)
      return false
    }
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      const now = new Date()
      const staleThreshold = 60000 // 1 minute

      for (const [clientId, client] of this.clients.entries()) {
        const timeSinceLastPing = now.getTime() - client.lastPing.getTime()
        
        if (timeSinceLastPing > staleThreshold) {
          console.log(`Removing stale client: ${clientId}`)
          client.ws.close()
          this.clients.delete(clientId)
        }
      }
    }, 30000) // Check every 30 seconds
  }

  // Public methods for broadcasting messages
  broadcastRenderProgress(jobId: string, progress: number, stage: string) {
    const message: WebSocketMessage = {
      type: 'render_progress',
      data: { jobId, progress, stage },
      timestamp: new Date()
    }

    this.broadcast(message, 'render_progress')
  }

  broadcastRenderComplete(jobId: string, downloadUrl: string, userId?: string) {
    const message: WebSocketMessage = {
      type: 'render_complete',
      data: { jobId, downloadUrl },
      timestamp: new Date(),
      userId
    }

    if (userId) {
      this.broadcastToUser(userId, message)
    } else {
      this.broadcast(message, 'render_complete')
    }
  }

  broadcastRenderError(jobId: string, error: string, userId?: string) {
    const message: WebSocketMessage = {
      type: 'render_error',
      data: { jobId, error },
      timestamp: new Date(),
      userId
    }

    if (userId) {
      this.broadcastToUser(userId, message)
    } else {
      this.broadcast(message, 'render_error')
    }
  }

  broadcastSystemNotification(title: string, message: string, notificationType: string = 'info') {
    const wsMessage: WebSocketMessage = {
      type: 'notification',
      data: { title, message, notificationType },
      timestamp: new Date()
    }

    this.broadcast(wsMessage, 'notification')
  }

  broadcastSystemUpdate(updateType: string, data: any) {
    const message: WebSocketMessage = {
      type: 'system_update',
      data: { updateType, ...data },
      timestamp: new Date()
    }

    this.broadcast(message, 'system_update')
  }

  private broadcast(message: WebSocketMessage, eventType?: string) {
    let sentCount = 0

    for (const [clientId, client] of this.clients.entries()) {
      // Check if client is subscribed to this event type
      if (eventType && !client.subscriptions.has(eventType)) {
        continue
      }

      if (this.sendToClient(clientId, message)) {
        sentCount++
      }
    }

    console.log(`📡 Broadcasted ${message.type} to ${sentCount} clients`)
  }

  private broadcastToUser(userId: string, message: WebSocketMessage) {
    let sentCount = 0

    for (const [clientId, client] of this.clients.entries()) {
      if (client.userId === userId) {
        if (this.sendToClient(clientId, message)) {
          sentCount++
        }
      }
    }

    console.log(`📡 Sent ${message.type} to user ${userId} (${sentCount} clients)`)
  }

  // Getters for monitoring
  getConnectedClients() {
    return Array.from(this.clients.values()).map(client => ({
      userId: client.userId,
      subscriptions: Array.from(client.subscriptions),
      lastPing: client.lastPing
    }))
  }

  getClientCount() {
    return this.clients.size
  }

  getUserCount() {
    const uniqueUsers = new Set(Array.from(this.clients.values()).map(c => c.userId))
    return uniqueUsers.size
  }
}

// Singleton instance
let wsServer: UnifiedWebSocketServer | null = null

export function getWebSocketServer(): UnifiedWebSocketServer {
  if (!wsServer) {
    wsServer = new UnifiedWebSocketServer(8080)
  }
  return wsServer
}

export function startWebSocketServer() {
  const server = getWebSocketServer()
  server.start()
  return server
}

export function stopWebSocketServer() {
  if (wsServer) {
    wsServer.stop()
    wsServer = null
  }
}

export default UnifiedWebSocketServer