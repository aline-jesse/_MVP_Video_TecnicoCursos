
/**
 * 🔌 Socket.IO Endpoint - Colaboração Real
 */

import { NextRequest, NextResponse } from 'next/server'
import { initSocketServer } from '@/lib/socket-server'

export async function GET(req: NextRequest) {
  // Socket.IO setup será feito no pages/api
  return NextResponse.json({ message: 'Socket.IO endpoint - use /api/collaboration/socket' })
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'Socket.IO endpoint - use /api/collaboration/socket' })
}
