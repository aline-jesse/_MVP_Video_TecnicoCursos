/**
 * 🔗 API Webhooks - Management
 * 
 * Endpoints para gerenciar webhooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { webhookManager } from '@/app/lib/webhooks-system-real'

/**
 * GET /api/webhooks
 * Lista webhooks do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const webhooks = await webhookManager.listWebhooks(session.user.id)
    return NextResponse.json(webhooks)
  } catch (error) {
    console.error('List webhooks error:', error)
    return NextResponse.json({ error: 'Failed to list webhooks' }, { status: 500 })
  }
}

/**
 * POST /api/webhooks
 * Cria um novo webhook
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const webhook = await webhookManager.registerWebhook({
      userId: session.user.id,
      url: data.url,
      events: data.events,
      description: data.description,
      headers: data.headers,
    })

    return NextResponse.json(webhook, { status: 201 })
  } catch (error) {
    console.error('Create webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create webhook' },
      { status: 500 }
    )
  }
}
