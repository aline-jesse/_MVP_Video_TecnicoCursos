
/**
 * Socket.IO Server for Real-Time Collaboration
 */

import { NextRequest } from 'next/server'

export function GET(req: NextRequest) {
  // Socket.IO initialization happens at server level
  // See server.ts or custom server setup
  return new Response('Socket.IO server is running', { status: 200 })
}
