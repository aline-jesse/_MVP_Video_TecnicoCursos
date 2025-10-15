
/**
 * 🔴 Real-time Collaboration - Client Side
 * 
 * Hook React para colaboração em tempo real
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  color: string
}

export interface OnlineUser extends User {
  slideId?: string
  cursor?: { x: number; y: number }
  lastSeen: number
}

export interface UseRealtimeOptions {
  projectId: string
  user: User
  enabled?: boolean
}

export interface UseRealtimeReturn {
  socket: Socket | null
  connected: boolean
  onlineUsers: OnlineUser[]
  selectSlide: (slideId: string) => void
  moveCursor: (x: number, y: number) => void
  error: Error | null
}

/**
 * Hook para colaboração em tempo real
 */
export function useRealtime({
  projectId,
  user,
  enabled = true,
}: UseRealtimeOptions): UseRealtimeReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [error, setError] = useState<Error | null>(null)
  const cursorThrottleRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize socket connection
  useEffect(() => {
    if (!enabled || !projectId || !user) return
    
    try {
      const socketUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin
      const newSocket = io(socketUrl, {
        path: '/api/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      })
      
      setSocket(newSocket)
      
      // Connection events
      newSocket.on('connect', () => {
        console.log('🔴 Connected to real-time server')
        setConnected(true)
        setError(null)
        
        // Join project room
        newSocket.emit('join_project', { projectId, user })
      })
      
      newSocket.on('disconnect', () => {
        console.log('🔴 Disconnected from real-time server')
        setConnected(false)
      })
      
      newSocket.on('connect_error', (err) => {
        console.error('🔴 Connection error:', err)
        setError(err)
        setConnected(false)
      })
      
      // Presence events
      newSocket.on('presence_update', (data: { users: OnlineUser[] }) => {
        setOnlineUsers(data.users)
      })
      
      newSocket.on('user_joined', (data: { user: User }) => {
        setOnlineUsers((prev) => {
          const exists = prev.find((u) => u.id === data.user.id)
          if (exists) return prev
          return [...prev, { ...data.user, lastSeen: Date.now() }]
        })
      })
      
      newSocket.on('user_left', (data: { userId: string }) => {
        setOnlineUsers((prev) => prev.filter((u) => u.id !== data.userId))
      })
      
      // Slide selection
      newSocket.on('slide_selected', (data: { user: User; slideId: string }) => {
        setOnlineUsers((prev) =>
          prev.map((u) =>
            u.id === data.user.id
              ? { ...u, slideId: data.slideId, lastSeen: Date.now() }
              : u
          )
        )
      })
      
      // Cursor movement
      newSocket.on('cursor_moved', (data: { user: User; cursor: { x: number; y: number } }) => {
        setOnlineUsers((prev) =>
          prev.map((u) =>
            u.id === data.user.id
              ? { ...u, cursor: data.cursor, lastSeen: Date.now() }
              : u
          )
        )
      })
      
      // Cleanup
      return () => {
        newSocket.emit('leave_project', { projectId, userId: user.id })
        newSocket.disconnect()
      }
    } catch (err) {
      console.error('Failed to initialize real-time connection:', err)
      setError(err as Error)
    }
  }, [enabled, projectId, user])
  
  /**
   * Select slide
   */
  const selectSlide = useCallback(
    (slideId: string) => {
      if (!socket || !connected) return
      
      socket.emit('select_slide', {
        projectId,
        user,
        slideId,
      })
    },
    [socket, connected, projectId, user]
  )
  
  /**
   * Move cursor (throttled)
   */
  const moveCursor = useCallback(
    (x: number, y: number) => {
      if (!socket || !connected) return
      
      // Throttle cursor updates to 100ms
      if (cursorThrottleRef.current) return
      
      cursorThrottleRef.current = setTimeout(() => {
        cursorThrottleRef.current = null
      }, 100)
      
      socket.emit('cursor_move', {
        projectId,
        user,
        cursor: { x, y },
      })
    },
    [socket, connected, projectId, user]
  )
  
  return {
    socket,
    connected,
    onlineUsers,
    selectSlide,
    moveCursor,
    error,
  }
}

/**
 * Generate random user color
 */
export function generateUserColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  ]
  
  return colors[Math.floor(Math.random() * colors.length)]
}
