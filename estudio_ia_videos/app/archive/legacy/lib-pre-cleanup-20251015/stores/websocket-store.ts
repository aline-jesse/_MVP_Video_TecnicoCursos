/**
 * 🔄 WEBSOCKET STORE - Real-time Updates
 * Sistema de WebSocket para atualizações em tempo real
 * Implementação baseada no PRD e Arquitetura Técnica
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useUnifiedProjectStore } from './unified-project-store'

// Types para WebSocket
export interface WebSocketMessage {
  type: 'progress' | 'status' | 'error' | 'complete' | 'notification'
  projectId: string
  step?: string
  data: any
  timestamp: Date
}

export interface RenderProgress {
  projectId: string
  step: 'import' | 'edit' | 'avatar' | 'tts' | 'render' | 'export'
  progress: number
  status: 'processing' | 'completed' | 'error'
  message?: string
  estimatedTime?: number
  currentFrame?: number
  totalFrames?: number
  renderSpeed?: number
}

export interface SystemNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  projectId?: string
  action?: {
    label: string
    url: string
  }
}

export interface WebSocketState {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null
  reconnectAttempts: number
  lastHeartbeat: Date | null
  
  // Real-time data
  renderProgress: Record<string, RenderProgress>
  notifications: SystemNotification[]
  activeUsers: string[]
  systemStatus: {
    cpu: number
    memory: number
    renderQueue: number
    activeRenders: number
  }
  
  // WebSocket instance
  socket: WebSocket | null
  
  // Actions
  connect: () => void
  disconnect: () => void
  sendMessage: (message: Omit<WebSocketMessage, 'timestamp'>) => void
  markNotificationRead: (notificationId: string) => void
  clearNotifications: () => void
  
  // Internal handlers
  handleMessage: (message: WebSocketMessage) => void
  handleProgress: (progress: RenderProgress) => void
  handleNotification: (notification: SystemNotification) => void
  handleSystemStatus: (status: any) => void
}

// WebSocket URL configuration
const getWebSocketUrl = () => {
  if (typeof window === 'undefined') return ''
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}/api/ws`
}

export const useWebSocketStore = create<WebSocketState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      reconnectAttempts: 0,
      lastHeartbeat: null,
      renderProgress: {},
      notifications: [],
      activeUsers: [],
      systemStatus: {
        cpu: 0,
        memory: 0,
        renderQueue: 0,
        activeRenders: 0
      },
      socket: null,

      // Connection management
      connect: () => {
        const state = get()
        
        if (state.isConnected || state.isConnecting) {
          return
        }

        set((draft) => {
          draft.isConnecting = true
          draft.connectionError = null
        })

        try {
          const wsUrl = getWebSocketUrl()
          if (!wsUrl) {
            throw new Error('WebSocket URL not available')
          }

          const socket = new WebSocket(wsUrl)

          socket.onopen = () => {
            console.log('🔄 WebSocket connected')
            set((draft) => {
              draft.isConnected = true
              draft.isConnecting = false
              draft.connectionError = null
              draft.reconnectAttempts = 0
              draft.socket = socket
              draft.lastHeartbeat = new Date()
            })

            // Send authentication if needed
            const authToken = localStorage.getItem('auth-token')
            if (authToken) {
              socket.send(JSON.stringify({
                type: 'auth',
                token: authToken,
                timestamp: new Date()
              }))
            }

            // Start heartbeat
            const heartbeatInterval = setInterval(() => {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: 'heartbeat',
                  timestamp: new Date()
                }))
                set((draft) => {
                  draft.lastHeartbeat = new Date()
                })
              } else {
                clearInterval(heartbeatInterval)
              }
            }, 30000) // 30 seconds
          }

          socket.onmessage = (event) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data)
              message.timestamp = new Date(message.timestamp)
              get().handleMessage(message)
            } catch (error) {
              console.error('❌ Failed to parse WebSocket message:', error)
            }
          }

          socket.onclose = (event) => {
            console.log('🔄 WebSocket disconnected:', event.code, event.reason)
            set((draft) => {
              draft.isConnected = false
              draft.isConnecting = false
              draft.socket = null
            })

            // Auto-reconnect with exponential backoff
            const state = get()
            if (state.reconnectAttempts < 5) {
              const delay = Math.pow(2, state.reconnectAttempts) * 1000
              setTimeout(() => {
                set((draft) => {
                  draft.reconnectAttempts += 1
                })
                get().connect()
              }, delay)
            }
          }

          socket.onerror = (error) => {
            console.error('❌ WebSocket error:', error)
            set((draft) => {
              draft.connectionError = 'Connection failed'
              draft.isConnecting = false
            })
          }

        } catch (error: any) {
          console.error('❌ Failed to create WebSocket:', error)
          set((draft) => {
            draft.connectionError = error.message
            draft.isConnecting = false
          })
        }
      },

      disconnect: () => {
        const state = get()
        if (state.socket) {
          state.socket.close()
        }
        
        set((draft) => {
          draft.isConnected = false
          draft.isConnecting = false
          draft.socket = null
          draft.connectionError = null
        })
      },

      sendMessage: (message) => {
        const state = get()
        if (!state.socket || state.socket.readyState !== WebSocket.OPEN) {
          console.warn('⚠️ WebSocket not connected, cannot send message')
          return
        }

        const fullMessage: WebSocketMessage = {
          ...message,
          timestamp: new Date()
        }

        try {
          state.socket.send(JSON.stringify(fullMessage))
        } catch (error) {
          console.error('❌ Failed to send WebSocket message:', error)
        }
      },

      // Message handlers
      handleMessage: (message) => {
        console.log('📨 WebSocket message received:', message.type, message)

        switch (message.type) {
          case 'progress':
            get().handleProgress(message.data)
            break
            
          case 'status':
            // Update project status
            if (message.projectId && message.step) {
              useUnifiedProjectStore.getState().updateProcessingStatus(
                message.projectId,
                message.step as any,
                message.data
              )
            }
            break
            
          case 'notification':
            get().handleNotification(message.data)
            break
            
          case 'complete':
            // Handle workflow completion
            if (message.projectId) {
              useUnifiedProjectStore.getState().updateProcessingStatus(
                message.projectId,
                'export',
                {
                  status: 'completed',
                  progress: 100,
                  endTime: new Date()
                }
              )
            }
            break
            
          case 'error':
            // Handle errors
            if (message.projectId && message.step) {
              useUnifiedProjectStore.getState().updateProcessingStatus(
                message.projectId,
                message.step as any,
                {
                  status: 'error',
                  error: message.data.error || 'Unknown error',
                  endTime: new Date()
                }
              )
            }
            break
            
          default:
            console.log('🔄 Unknown message type:', message.type)
        }
      },

      handleProgress: (progress) => {
        set((draft) => {
          draft.renderProgress[progress.projectId] = progress
        })

        // Update project store
        if (progress.projectId && progress.step) {
          useUnifiedProjectStore.getState().updateProcessingStatus(
            progress.projectId,
            progress.step,
            {
              status: progress.status,
              progress: progress.progress,
              message: progress.message
            }
          )
        }
      },

      handleNotification: (notification) => {
        set((draft) => {
          // Add notification to the beginning of the array
          draft.notifications.unshift(notification)
          
          // Keep only last 50 notifications
          if (draft.notifications.length > 50) {
            draft.notifications = draft.notifications.slice(0, 50)
          }
        })

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id
          })
        }
      },

      handleSystemStatus: (status) => {
        set((draft) => {
          draft.systemStatus = status
        })
      },

      // Notification management
      markNotificationRead: (notificationId) => {
        set((draft) => {
          const notification = draft.notifications.find(n => n.id === notificationId)
          if (notification) {
            notification.read = true
          }
        })
      },

      clearNotifications: () => {
        set((draft) => {
          draft.notifications = []
        })
      }
    })),
    {
      name: 'websocket-store'
    }
  )
)

// Selectors
export const useWebSocketConnection = () => useWebSocketStore(state => ({
  isConnected: state.isConnected,
  isConnecting: state.isConnecting,
  connectionError: state.connectionError,
  connect: state.connect,
  disconnect: state.disconnect
}))

export const useRenderProgress = (projectId?: string) => useWebSocketStore(state => 
  projectId ? state.renderProgress[projectId] : state.renderProgress
)

export const useNotifications = () => useWebSocketStore(state => ({
  notifications: state.notifications,
  unreadCount: state.notifications.filter(n => !n.read).length,
  markRead: state.markNotificationRead,
  clear: state.clearNotifications
}))

export const useSystemStatus = () => useWebSocketStore(state => state.systemStatus)

// Hook for auto-connecting WebSocket
export const useWebSocketAutoConnect = () => {
  const { isConnected, isConnecting, connect } = useWebSocketConnection()

  React.useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect()
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      // Cleanup handled by the store
    }
  }, [isConnected, isConnecting, connect])

  return { isConnected, isConnecting }
}

// React import for useEffect
import React from 'react'