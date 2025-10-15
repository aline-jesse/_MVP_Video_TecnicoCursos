/**
 * Timeline Playhead - Indicador de tempo atual na timeline
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface TimelinePlayheadProps {
  currentTime: number
  scrollX: number
  pixelsPerSecond: number
  height: number
  onSeek?: (time: number) => void
  readOnly?: boolean
}

export const TimelinePlayhead: React.FC<TimelinePlayheadProps> = ({
  currentTime,
  scrollX,
  pixelsPerSecond,
  height,
  onSeek,
  readOnly = false
}) => {
  const playheadX = currentTime * pixelsPerSecond - scrollX

  const handleClick = (event: React.MouseEvent) => {
    if (readOnly || !onSeek) return
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const clickX = event.clientX - rect.left + scrollX
    const newTime = clickX / pixelsPerSecond
    onSeek(Math.max(0, newTime))
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ height: `${height}px` }}
    >
      {/* Playhead Line */}
      <motion.div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-auto cursor-ew-resize z-20"
        style={{ left: `${playheadX}px` }}
        initial={false}
        animate={{ x: 0 }}
        transition={{ duration: 0.1 }}
        onClick={!readOnly ? handleClick : undefined}
      >
        {/* Playhead Handle */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-sm shadow-lg" />
        
        {/* Time Display */}
        <div className="absolute -top-8 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg">
          {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}
        </div>
      </motion.div>
    </div>
  )
}