/**
 * Custom Next.js server com WebSocket
 * Usa este arquivo para desenvolvimento com `node server.js`
 */
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { initializeWebSocket } from './lib/websocket/timeline-websocket'
import { setGlobalIo } from './lib/websocket/websocket-helper'
import { startExportWorker } from './lib/export/export-worker'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Inicializar WebSocket
  const io = initializeWebSocket(httpServer)
  
  // Setar instância global para uso em API routes
  setGlobalIo(io)
  
  // Inicializar Export Worker
  startExportWorker()
  console.log('> Export Worker started')
  
  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> WebSocket on ws://${hostname}:${port}/api/socket/timeline`)
    })
})
