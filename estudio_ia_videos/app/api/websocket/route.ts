/**
 * API Route para WebSocket Server
 */

import { NextRequest } from 'next/server';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { createWebSocketServer } from '@/lib/notifications/websocket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Cache do servidor para evitar múltiplas instâncias
let server: any = null;
let wsServer: any = null;

export async function GET(request: NextRequest) {
  try {
    // Verificar se o servidor WebSocket já está rodando
    if (server && wsServer) {
      return Response.json({
        success: true,
        message: 'WebSocket server already running',
        port,
        stats: wsServer.getServerStats()
      });
    }

    // Criar servidor HTTP
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    await app.prepare();

    server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url!, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal server error');
      }
    });

    // Criar servidor WebSocket
    wsServer = createWebSocketServer(server);

    // Iniciar servidor
    server.listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> WebSocket server initialized');
    });

    return Response.json({
      success: true,
      message: 'WebSocket server started successfully',
      port,
      hostname
    });

  } catch (error) {
    console.error('Error starting WebSocket server:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!wsServer) {
      return Response.json({
        success: false,
        error: 'WebSocket server not initialized'
      }, { status: 400 });
    }

    switch (action) {
      case 'broadcast_alert':
        wsServer.broadcastSystemAlert(data.message, data.priority || 'medium');
        return Response.json({ success: true, message: 'Alert broadcasted' });

      case 'kick_user':
        const kicked = wsServer.kickUser(data.userId, data.reason);
        return Response.json({ 
          success: kicked, 
          message: kicked ? 'User kicked' : 'User not found' 
        });

      case 'get_stats':
        const stats = wsServer.getServerStats();
        return Response.json({ success: true, stats });

      case 'get_users':
        const users = wsServer.getConnectedUsers();
        return Response.json({ success: true, users });

      case 'get_room_users':
        const roomUsers = wsServer.getRoomUsers(data.roomId);
        return Response.json({ success: true, users: roomUsers });

      default:
        return Response.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error handling WebSocket API request:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!server || !wsServer) {
      return Response.json({
        success: false,
        error: 'WebSocket server not running'
      }, { status: 400 });
    }

    // Destruir servidor WebSocket
    wsServer.destroy();
    wsServer = null;

    // Fechar servidor HTTP
    server.close(() => {
      console.log('WebSocket server stopped');
    });
    server = null;

    return Response.json({
      success: true,
      message: 'WebSocket server stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping WebSocket server:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}