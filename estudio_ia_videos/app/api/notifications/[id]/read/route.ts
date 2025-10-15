/**
 * 🔔 Mark Notification as Read API
 * Marks a specific notification as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const notificationId = params.id

    // Mark notification as read
    const { data: updatedNotification, error } = await supabaseAdmin
      .from('notifications')
      .update({
        status: 'read',
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Log the action for analytics
    try {
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          user_id: session.user.id,
          category: 'notifications',
          action: 'notification_read',
          metadata: {
            notification_id: notificationId,
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        })
    } catch (analyticsError) {
      console.warn('Failed to log notification read action:', analyticsError)
    }

    // Send WebSocket update
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/websocket/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBSOCKET_SECRET}`
        },
        body: JSON.stringify({
          type: 'notification_updated',
          channel: 'notifications',
          userId: session.user.id,
          data: updatedNotification
        })
      })
    } catch (wsError) {
      console.warn('Failed to send WebSocket update:', wsError)
    }

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: 'Notification marked as read'
    })

  } catch (error) {
    console.error('Mark notification as read API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to mark notification as read',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}