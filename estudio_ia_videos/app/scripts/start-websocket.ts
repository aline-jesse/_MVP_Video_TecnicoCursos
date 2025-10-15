#!/usr/bin/env node

/**
 * 🚀 WEBSOCKET SERVER STARTER
 * Standalone script to start the WebSocket server
 */

import { startWebSocketServer, getWebSocketServer } from '../lib/websocket-server'

console.log('🔄 Starting WebSocket Server...')

// Start the WebSocket server
const server = startWebSocketServer()

// Simulate some test notifications for development
setTimeout(() => {
  console.log('📡 Sending test notifications...')
  
  // Test system notification
  server.broadcastSystemNotification(
    'Sistema Iniciado',
    'WebSocket server está funcionando corretamente',
    'success'
  )

  // Test render progress
  let progress = 0
  const testJobId = 'test_job_' + Date.now()
  
  const progressInterval = setInterval(() => {
    progress += 10
    server.broadcastRenderProgress(testJobId, progress, `Processando etapa ${progress/10}`)
    
    if (progress >= 100) {
      clearInterval(progressInterval)
      server.broadcastRenderComplete(testJobId, '/downloads/test-video.mp4')
      
      setTimeout(() => {
        server.broadcastSystemNotification(
          'Render Concluído',
          'Seu vídeo foi processado com sucesso!',
          'success'
        )
      }, 1000)
    }
  }, 2000)

}, 5000)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...')
  server.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down WebSocket server...')
  server.stop()
  process.exit(0)
})

// Log server status every 30 seconds
setInterval(() => {
  const clientCount = server.getClientCount()
  const userCount = server.getUserCount()
  console.log(`📊 WebSocket Status: ${clientCount} clients, ${userCount} unique users`)
}, 30000)

console.log('✅ WebSocket server is running on port 8080')
console.log('📡 Ready to accept connections...')
console.log('🛑 Press Ctrl+C to stop')