/**
 * 🔌 WebSocket Server - Render Progress
 * Servidor WebSocket para tracking de progresso em tempo real
 */

import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { parse } from 'url'
import { createRenderWorker, createQueueEvents } from './lib/queue/render-queue'
import { RenderProgress } from './lib/video/renderer'

const PORT = parseInt(process.env.WS_PORT || '3001')

// Mapa de conexões por jobId
const connections = new Map<string, Set<WebSocket>>()

/**
 * Broadcast para todos os clientes de um job
 */
function broadcastToJob(jobId: string, data: any) {
  const clients = connections.get(jobId)
  if (!clients) return

  const message = JSON.stringify(data)
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

/**
 * Iniciar servidor WebSocket
 */
export function startWebSocketServer() {
  const server = createServer()
  const wss = new WebSocketServer({ server })

  // Iniciar worker de renderização
  const worker = createRenderWorker((jobId: string, progress: RenderProgress) => {
    broadcastToJob(jobId, {
      type: 'progress',
      jobId,
      progress,
    })
  })

  // Eventos da fila
  const queueEvents = createQueueEvents()

  queueEvents.on('completed', ({ jobId }) => {
    broadcastToJob(jobId, {
      type: 'completed',
      jobId,
    })
  })

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    broadcastToJob(jobId, {
      type: 'failed',
      jobId,
      error: failedReason,
    })
  })

  // Conexões WebSocket
  wss.on('connection', (ws: WebSocket, request) => {
    const { query } = parse(request.url || '', true)
    const jobId = query.jobId as string

    if (!jobId) {
      ws.close(1008, 'Job ID required')
      return
    }

    console.log(`WebSocket connected for job: ${jobId}`)

    // Adicionar cliente ao mapa
    if (!connections.has(jobId)) {
      connections.set(jobId, new Set())
    }
    connections.get(jobId)!.add(ws)

    // Enviar mensagem de boas-vindas
    ws.send(JSON.stringify({
      type: 'connected',
      jobId,
      message: 'Connected to render progress tracker',
    }))

    // Ping/Pong para manter conexão viva
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping()
      }
    }, 30000)

    // Disconnect
    ws.on('close', () => {
      console.log(`WebSocket disconnected for job: ${jobId}`)
      connections.get(jobId)?.delete(ws)
      
      // Limpar set vazio
      if (connections.get(jobId)?.size === 0) {
        connections.delete(jobId)
      }
      
      clearInterval(pingInterval)
    })

    ws.on('error', (error) => {
      console.error(`WebSocket error for job ${jobId}:`, error)
    })
  })

  server.listen(PORT, () => {
    console.log(`✅ WebSocket server running on port ${PORT}`)
  })

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down WebSocket server...')
    
    wss.clients.forEach((client) => {
      client.close()
    })

    await worker.close()
    await queueEvents.close()
    
    server.close(() => {
      console.log('WebSocket server closed')
      process.exit(0)
    })
  })

  return { wss, worker, queueEvents }
}

// Iniciar se executado diretamente
if (require.main === module) {
  startWebSocketServer()
}
