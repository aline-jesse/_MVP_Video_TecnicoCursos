'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User } from '@/types/collaboration';

interface UserCursorProps {
  user: User;
  position: { x: number; y: number };
  isVisible: boolean;
}

export function UserCursor({ user, position, isVisible }: UserCursorProps) {
  if (!isVisible) return null;

  const cursorColor = user.cursorColor || '#3B82F6';

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: position.x,
        y: position.y
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        duration: 0.1
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <path
          d="M2 2L18 8L8 12L2 18V2Z"
          fill={cursorColor}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* User name label */}
      <div
        className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
        style={{ backgroundColor: cursorColor }}
      >
        {user.name}
      </div>
    </motion.div>
  );
}

interface UserCursorsProps {
  users: User[];
  cursors: Record<string, { x: number; y: number; lastUpdate: Date }>;
}

export function UserCursors({ users, cursors }: UserCursorsProps) {
  const now = new Date();
  const CURSOR_TIMEOUT = 5000; // 5 seconds

  return (
    <div className="absolute inset-0 pointer-events-none">
      {users.map((user) => {
        const cursor = cursors[user.id];
        if (!cursor) return null;

        const isVisible = now.getTime() - cursor.lastUpdate.getTime() < CURSOR_TIMEOUT;

        return (
          <UserCursor
            key={user.id}
            user={user}
            position={cursor}
            isVisible={isVisible}
          />
        );
      })}
    </div>
  );
}