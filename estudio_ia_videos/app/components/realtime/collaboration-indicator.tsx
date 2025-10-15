
/**
 * 🔴 Collaboration Indicator Component
 * 
 * Mostra usuários online e suas posições
 */

'use client'

import React from 'react'
import { useRealtime, OnlineUser } from '@/lib/realtime/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface CollaborationIndicatorProps {
  projectId: string
  currentUser: {
    id: string
    name: string
    email?: string
    avatar?: string
    color: string
  }
  enabled?: boolean
}

export function CollaborationIndicator({
  projectId,
  currentUser,
  enabled = true,
}: CollaborationIndicatorProps) {
  const { connected, onlineUsers } = useRealtime({
    projectId,
    user: currentUser,
    enabled,
  })
  
  // Filter out current user
  const otherUsers = onlineUsers.filter((u) => u.id !== currentUser.id)
  
  if (!enabled || !connected || otherUsers.length === 0) {
    return null
  }
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        {otherUsers.length} online
      </Badge>
      
      <TooltipProvider>
        <div className="flex -space-x-2">
          {otherUsers.slice(0, 5).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger>
                <Avatar
                  className="border-2 ring-2 ring-background"
                  style={{ borderColor: user.color }}
                >
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback style={{ backgroundColor: user.color }}>
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{user.name}</p>
                {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                {user.slideId && (
                  <p className="text-xs text-muted-foreground">
                    Viewing slide {user.slideId}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
          
          {otherUsers.length > 5 && (
            <Avatar className="border-2 ring-2 ring-background">
              <AvatarFallback>+{otherUsers.length - 5}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}

/**
 * Cursor Component - Shows remote user cursors
 */
interface RemoteCursorProps {
  user: OnlineUser
}

export function RemoteCursor({ user }: RemoteCursorProps) {
  if (!user.cursor) return null
  
  return (
    <div
      className="pointer-events-none absolute z-50 transition-transform duration-100"
      style={{
        left: `${user.cursor.x}px`,
        top: `${user.cursor.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Cursor icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673L5.65376 7.66256C5.65376 6.04072 7.42956 5.07977 8.76376 5.99999L17.7538 12.3673C19.0877 13.2875 19.0877 15.2083 17.7538 16.1285L8.76376 22.4958C7.42956 23.416 5.65376 22.4551 5.65376 20.8332L5.65376 16.1285"
          fill={user.color}
          stroke={user.color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {/* User name label */}
      <div
        className="absolute left-6 top-0 whitespace-nowrap rounded px-2 py-1 text-xs font-medium text-white shadow-lg"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </div>
  )
}
