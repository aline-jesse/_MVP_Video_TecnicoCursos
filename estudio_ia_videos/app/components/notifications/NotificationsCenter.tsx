/**
 * 🔔 NOTIFICATIONS CENTER - Central de Notificações UI
 * 
 * Interface completa para gerenciar notificações do usuário.
 * 
 * Features:
 * - Lista de notificações não lidas
 * - Marcar como lida/não lida
 * - Filtros por tipo
 * - Preferências de notificação
 * - Notificações em tempo real (WebSocket)
 * - Badge com contador
 * - Som de notificação
 * - Desktop notifications
 * 
 * @version 1.0.0
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
  Settings,
  Filter,
  Trash2,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Zap,
  Video,
  Users,
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

// ============================================================================
// TIPOS
// ============================================================================

type NotificationType =
  | 'render_complete'
  | 'render_failed'
  | 'comment'
  | 'mention'
  | 'share'
  | 'system'
  | 'info'
  | 'warning'
  | 'error'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: {
    projectId?: string
    userId?: string
    url?: string
    [key: string]: any
  }
}

interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  sound: boolean
  renderComplete: boolean
  renderFailed: boolean
  comments: boolean
  mentions: boolean
  shares: boolean
  system: boolean
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const iconProps = { className: 'w-5 h-5' }

  switch (type) {
    case 'render_complete':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />
    case 'render_failed':
      return <AlertCircle {...iconProps} className="w-5 h-5 text-red-500" />
    case 'comment':
      return <MessageSquare {...iconProps} className="w-5 h-5 text-blue-500" />
    case 'mention':
      return <Users {...iconProps} className="w-5 h-5 text-purple-500" />
    case 'share':
      return <Users {...iconProps} className="w-5 h-5 text-indigo-500" />
    case 'warning':
      return <AlertCircle {...iconProps} className="w-5 h-5 text-yellow-500" />
    case 'error':
      return <AlertCircle {...iconProps} className="w-5 h-5 text-red-500" />
    default:
      return <Info {...iconProps} className="w-5 h-5 text-gray-500" />
  }
}

const NotificationItem: React.FC<{
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
  onClick: (notification: Notification) => void
}> = ({ notification, onRead, onDelete, onClick }) => {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'agora mesmo'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`
    return `${Math.floor(seconds / 86400)}d atrás`
  }

  return (
    <div
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <NotificationIcon type={notification.type} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-gray-900 text-sm">
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {timeAgo(notification.createdAt)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-2">
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRead(notification.id)
                }}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar como lida
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(notification.id)
              }}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Excluir
            </button>
          </div>
        </div>

        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [filter, setFilter] = useState<NotificationType | 'all'>('all')
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    inApp: true,
    sound: true,
    renderComplete: true,
    renderFailed: true,
    comments: true,
    mentions: true,
    shares: true,
    system: true,
  })

  const socketRef = useRef<Socket | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // ============================================================================
  // WEBSOCKET & REAL-TIME
  // ============================================================================

  useEffect(() => {
    // Conectar ao WebSocket
    socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      path: '/api/socket',
    })

    socketRef.current.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      
      // Som de notificação
      if (preferences.sound && audioRef.current) {
        audioRef.current.play().catch(() => {})
      }

      // Desktop notification
      if (preferences.push && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192.png',
        })
      }
    })

    // Carregar notificações existentes
    fetchNotifications()

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  // ============================================================================
  // API CALLS
  // ============================================================================

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Erro ao excluir notificação:', error)
    }
  }

  const savePreferences = async () => {
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })
      setShowPreferences(false)
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
    }
  }

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Navegar se houver URL
    if (notification.metadata?.url) {
      window.location.href = notification.metadata.url
    }
  }

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : n.type === filter
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Audio element para notificação */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      {/* Bell Icon com Badge */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Notificações</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">Todas</option>
                  <option value="render_complete">Renders Completos</option>
                  <option value="render_failed">Renders Falhados</option>
                  <option value="comment">Comentários</option>
                  <option value="mention">Menções</option>
                  <option value="share">Compartilhamentos</option>
                  <option value="system">Sistema</option>
                </select>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Marcar todas como lidas
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                    onDelete={deleteNotification}
                    onClick={handleNotificationClick}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t text-center">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    window.location.href = '/notifications'
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Ver todas as notificações
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Preferências de Notificações</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Canais */}
              <div>
                <h4 className="font-semibold mb-2">Canais</h4>
                <label className="flex items-center justify-between py-2">
                  <span>In-App</span>
                  <input
                    type="checkbox"
                    checked={preferences.inApp}
                    onChange={(e) =>
                      setPreferences({ ...preferences, inApp: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between py-2">
                  <span>Email</span>
                  <input
                    type="checkbox"
                    checked={preferences.email}
                    onChange={(e) =>
                      setPreferences({ ...preferences, email: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between py-2">
                  <span>Push (Desktop)</span>
                  <input
                    type="checkbox"
                    checked={preferences.push}
                    onChange={(e) => {
                      setPreferences({ ...preferences, push: e.target.checked })
                      if (e.target.checked) requestPermission()
                    }}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between py-2">
                  <span>Som</span>
                  <input
                    type="checkbox"
                    checked={preferences.sound}
                    onChange={(e) =>
                      setPreferences({ ...preferences, sound: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>
              </div>

              {/* Tipos */}
              <div>
                <h4 className="font-semibold mb-2">Tipos de Notificação</h4>
                <label className="flex items-center justify-between py-2">
                  <span>Render Completo</span>
                  <input
                    type="checkbox"
                    checked={preferences.renderComplete}
                    onChange={(e) =>
                      setPreferences({ ...preferences, renderComplete: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between py-2">
                  <span>Render Falhado</span>
                  <input
                    type="checkbox"
                    checked={preferences.renderFailed}
                    onChange={(e) =>
                      setPreferences({ ...preferences, renderFailed: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between py-2">
                  <span>Comentários</span>
                  <input
                    type="checkbox"
                    checked={preferences.comments}
                    onChange={(e) =>
                      setPreferences({ ...preferences, comments: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between py-2">
                  <span>Menções</span>
                  <input
                    type="checkbox"
                    checked={preferences.mentions}
                    onChange={(e) =>
                      setPreferences({ ...preferences, mentions: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePreferences}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
