/**
 * Timeline Component Stubs
 * Temporary components while building the full system
 */

'use client';

import React from 'react';

// Ruler component stub
export function TimelineRuler({ duration, pixelsPerMs, zoomLevel }: {
  duration: number;
  pixelsPerMs: number;
  zoomLevel: number;
}) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const generateTimeMarkers = () => {
    const markers = [];
    const interval = 5000; // 5 seconds
    
    for (let time = 0; time <= duration; time += interval) {
      const x = time * pixelsPerMs;
      markers.push(
        <div
          key={time}
          className="absolute top-0 flex flex-col items-center"
          style={{ left: x }}
        >
          <div className="h-4 bg-gray-400 w-px" />
          <span className="text-xs text-gray-400 mt-1 font-mono">
            {formatTime(time)}
          </span>
        </div>
      );
    }
    
    return markers;
  };

  return (
    <div className="timeline-ruler relative h-8 bg-gray-850 border-b border-gray-700 overflow-hidden">
      <div className="relative h-full" style={{ width: Math.max(duration * pixelsPerMs, 300) + 'px' }}>
        {generateTimeMarkers()}
      </div>
    </div>
  );
}

// Playhead component stub
export function TimelinePlayhead({ currentTime, pixelsPerMs, height, onSeek }: {
  currentTime: number;
  pixelsPerMs: number;
  height: number;
  onSeek: (time: number) => void;
}) {
  const x = currentTime * pixelsPerMs;

  return (
    <div
      className="absolute top-0 z-10 pointer-events-auto"
      style={{ left: x, height }}
    >
      <div className="relative">
        <div className="w-0.5 h-full bg-red-500 shadow-lg" />
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full cursor-pointer shadow-lg" />
        <div className="absolute -top-8 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded font-mono whitespace-nowrap">
          {Math.floor(currentTime / 1000 / 60)}:{Math.floor((currentTime / 1000) % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}