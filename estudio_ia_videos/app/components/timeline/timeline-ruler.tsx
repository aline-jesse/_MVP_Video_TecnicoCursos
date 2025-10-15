/**
 * Timeline Ruler - Régua de tempo na timeline
 */

'use client'

import React from 'react'

interface TimelineRulerProps {
  duration: number
  currentTime: number
  zoom: number
  scrollX: number
  pixelsPerSecond: number
  onTimeClick?: (time: number) => void
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  duration,
  currentTime,
  zoom,
  scrollX,
  pixelsPerSecond,
  onTimeClick
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleClick = (event: React.MouseEvent) => {
    if (!onTimeClick) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left + scrollX
    const time = clickX / pixelsPerSecond
    onTimeClick(Math.max(0, Math.min(time, duration)))
  }

  // Calculate visible time range
  const canvasWidth = 1200
  const startTime = Math.floor(scrollX / pixelsPerSecond)
  const endTime = Math.ceil((scrollX + canvasWidth) / pixelsPerSecond)

  // Generate time markers
  const timeMarkers = []
  const majorInterval = zoom < 0.5 ? 10 : zoom < 1 ? 5 : 1 // seconds
  const minorInterval = zoom > 1 ? 0.5 : majorInterval / 5

  // Major markers
  for (let time = Math.floor(startTime / majorInterval) * majorInterval; time <= endTime; time += majorInterval) {
    const x = time * pixelsPerSecond - scrollX
    if (x >= -50 && x <= canvasWidth + 50) {
      timeMarkers.push(
        <div
          key={`major-${time}`}
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${x}px` }}
        >
          <div className="w-px h-3 bg-gray-400 dark:bg-gray-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {formatTime(time)}
          </span>
        </div>
      )
    }
  }

  // Minor markers (only show when zoomed in)
  if (zoom > 0.5) {
    for (let time = Math.floor(startTime / minorInterval) * minorInterval; time <= endTime; time += minorInterval) {
      const x = time * pixelsPerSecond - scrollX
      if (x >= -10 && x <= canvasWidth + 10 && time % majorInterval !== 0) {
        timeMarkers.push(
          <div
            key={`minor-${time}`}
            className="absolute top-0"
            style={{ left: `${x}px` }}
          >
            <div className="w-px h-2 bg-gray-300 dark:bg-gray-600" />
          </div>
        )
      }
    }
  }

  return (
    <div
      className="timeline-ruler relative h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none"
      onClick={handleClick}
    >
      {timeMarkers}
      
      {/* Current time indicator */}
      <div
        className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
        style={{ left: `${currentTime * pixelsPerSecond - scrollX}px` }}
      />
    </div>
  )
}