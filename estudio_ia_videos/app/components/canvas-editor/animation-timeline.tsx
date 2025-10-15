
'use client'

/**
 * 🎬 ANIMATION TIMELINE - Sprint 18
 * Timeline profissional para animações com keyframes
 */

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'react-hot-toast'
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Plus,
  Trash2,
  Edit,
  Copy,
  Scissors,
  Move3D,
  RotateCw,
  Maximize,
  Eye,
  Layers
} from 'lucide-react'

interface AnimationKeyframe {
  id: string
  time: number
  objectId: string
  properties: {
    x?: number
    y?: number
    scaleX?: number
    scaleY?: number
    rotation?: number
    opacity?: number
    visible?: boolean
  }
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce'
}

interface AnimationTrack {
  id: string
  objectId: string
  objectName: string
  type: 'text' | 'image' | 'shape' | 'video'
  keyframes: AnimationKeyframe[]
  color: string
  visible: boolean
  locked: boolean
}

interface TimelineProps {
  duration: number
  currentTime: number
  onTimeChange: (time: number) => void
  tracks: AnimationTrack[]
  onTracksChange: (tracks: AnimationTrack[]) => void
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
}

export default function AnimationTimeline({
  duration = 10,
  currentTime = 0,
  onTimeChange,
  tracks = [],
  onTracksChange,
  isPlaying = false,
  onPlay,
  onPause,
  onStop
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [selectedKeyframes, setSelectedKeyframes] = useState<string[]>([])
  const [timelineZoom, setTimelineZoom] = useState(100)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [volume, setVolume] = useState(75)

  // Calcular escala da timeline
  const timelineWidth = duration * (timelineZoom / 100) * 50 // 50px por segundo na escala 100%
  const pixelsPerSecond = timelineWidth / duration

  const handleTimelineClick = useCallback((event: React.MouseEvent) => {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const time = Math.max(0, Math.min(duration, clickX / pixelsPerSecond))
    
    onTimeChange(time)
  }, [duration, pixelsPerSecond, onTimeChange])

  const addKeyframe = (trackId: string, time: number) => {
    const newKeyframe: AnimationKeyframe = {
      id: `keyframe-${Date.now()}`,
      time,
      objectId: trackId,
      properties: {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        visible: true
      },
      easing: 'easeInOut'
    }

    onTracksChange(tracks.map(track => 
      track.id === trackId 
        ? { ...track, keyframes: [...track.keyframes, newKeyframe] }
        : track
    ))

    toast.success('Keyframe adicionado')
  }

  const deleteKeyframe = (keyframeId: string) => {
    onTracksChange(tracks.map(track => ({
      ...track,
      keyframes: track.keyframes.filter(kf => kf.id !== keyframeId)
    })))

    setSelectedKeyframes(prev => prev.filter(id => id !== keyframeId))
    toast.success('Keyframe removido')
  }

  const duplicateKeyframe = (keyframeId: string) => {
    const track = tracks.find(t => t.keyframes.some(kf => kf.id === keyframeId))
    const keyframe = track?.keyframes.find(kf => kf.id === keyframeId)
    
    if (!keyframe || !track) return

    const newKeyframe: AnimationKeyframe = {
      ...keyframe,
      id: `keyframe-${Date.now()}`,
      time: keyframe.time + 0.5
    }

    onTracksChange(tracks.map(t => 
      t.id === track.id 
        ? { ...t, keyframes: [...t.keyframes, newKeyframe] }
        : t
    ))

    toast.success('Keyframe duplicado')
  }

  const getKeyframePosition = (time: number) => {
    return (time / duration) * timelineWidth
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * 30)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }

  const getEasingIcon = (easing: string) => {
    switch (easing) {
      case 'linear': return '━'
      case 'easeIn': return '╱'
      case 'easeOut': return '╲'
      case 'easeInOut': return '◊'
      case 'bounce': return '◉'
      default: return '━'
    }
  }

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="secondary" onClick={onStop}>
            <Square className="h-4 w-4" />
          </Button>
          
          <div className="mx-4 text-sm text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <Button size="sm" variant="secondary">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <Slider
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              max={100}
              step={1}
              className="w-20"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Zoom:</span>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => setTimelineZoom(Math.max(25, timelineZoom - 25))}
            >
              -
            </Button>
            <span className="text-sm w-12 text-center">{timelineZoom}%</span>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => setTimelineZoom(Math.min(400, timelineZoom + 25))}
            >
              +
            </Button>
          </div>

          <Button 
            size="sm" 
            variant={snapToGrid ? "default" : "secondary"}
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            Snap
          </Button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex">
        {/* Track Headers */}
        <div className="w-48 bg-gray-800 border-r border-gray-700">
          <div className="h-12 border-b border-gray-700 flex items-center px-4">
            <span className="text-sm font-medium">Objetos</span>
          </div>
          
          <ScrollArea className="h-full">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 border-b border-gray-700 flex items-center px-4 hover:bg-gray-750"
              >
                <div 
                  className="w-4 h-4 rounded mr-3"
                  style={{ backgroundColor: track.color }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{track.objectName}</div>
                  <Badge variant="secondary" className="text-xs">
                    {track.type}
                  </Badge>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0"
                    onClick={() => {
                      const updatedTracks = tracks.map(t => 
                        t.id === track.id ? { ...t, visible: !t.visible } : t
                      )
                      onTracksChange(updatedTracks)
                    }}
                  >
                    <Eye className={`h-3 w-3 ${track.visible ? 'text-white' : 'text-gray-500'}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0"
                    onClick={() => {
                      const updatedTracks = tracks.map(t => 
                        t.id === track.id ? { ...t, locked: !t.locked } : t
                      )
                      onTracksChange(updatedTracks)
                    }}
                  >
                    <Layers className={`h-3 w-3 ${track.locked ? 'text-red-400' : 'text-gray-400'}`} />
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Timeline Area */}
        <div className="flex-1 flex flex-col">
          {/* Timeline Ruler */}
          <div className="h-12 bg-gray-800 border-b border-gray-700 relative overflow-x-auto">
            <div 
              className="flex h-full relative"
              style={{ width: timelineWidth }}
            >
              {/* Time markers */}
              {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute h-full border-l border-gray-600 flex items-center pl-2"
                  style={{ left: i * pixelsPerSecond }}
                >
                  <span className="text-xs text-gray-400">{i}s</span>
                </div>
              ))}

              {/* Playhead */}
              <div 
                className="absolute top-0 w-0.5 h-full bg-red-500 z-10 pointer-events-none"
                style={{ left: getKeyframePosition(currentTime) }}
              />
            </div>
          </div>

          {/* Timeline Tracks */}
          <div 
            ref={timelineRef}
            className="flex-1 overflow-x-auto overflow-y-auto cursor-pointer"
            onClick={handleTimelineClick}
          >
            <div 
              className="relative"
              style={{ width: timelineWidth, minHeight: tracks.length * 64 }}
            >
              {/* Grid lines */}
              {snapToGrid && Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute top-0 h-full border-l border-gray-700 opacity-30"
                  style={{ left: i * pixelsPerSecond }}
                />
              ))}

              {/* Track lanes */}
              {tracks.map((track, trackIndex) => (
                <div
                  key={track.id}
                  className="absolute h-16 w-full border-b border-gray-700"
                  style={{ top: trackIndex * 64 }}
                >
                  {/* Keyframes */}
                  {track.keyframes.map((keyframe) => (
                    <div
                      key={keyframe.id}
                      className={`absolute top-2 w-3 h-12 rounded cursor-pointer group ${
                        selectedKeyframes.includes(keyframe.id)
                          ? 'ring-2 ring-blue-400'
                          : ''
                      }`}
                      style={{
                        left: getKeyframePosition(keyframe.time) - 6,
                        backgroundColor: track.color
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedKeyframes(prev => 
                          prev.includes(keyframe.id)
                            ? prev.filter(id => id !== keyframe.id)
                            : [...prev, keyframe.id]
                        )
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        // Context menu para keyframe
                      }}
                    >
                      <div className="absolute top-1 left-1 text-xs">
                        {getEasingIcon(keyframe.easing)}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          {formatTime(keyframe.time)}
                          <br />
                          {keyframe.easing}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Connection lines between keyframes */}
                  {track.keyframes.slice(0, -1).map((keyframe, index) => {
                    const nextKeyframe = track.keyframes[index + 1]
                    const startX = getKeyframePosition(keyframe.time)
                    const endX = getKeyframePosition(nextKeyframe.time)
                    
                    return (
                      <div
                        key={`line-${keyframe.id}`}
                        className="absolute top-8 h-0.5 opacity-60"
                        style={{
                          left: startX,
                          width: endX - startX,
                          backgroundColor: track.color
                        }}
                      />
                    )
                  })}

                  {/* Add keyframe button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      addKeyframe(track.id, currentTime)
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe Properties Panel */}
      {selectedKeyframes.length > 0 && (
        <div className="h-48 bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Propriedades do Keyframe</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => selectedKeyframes.forEach(duplicateKeyframe)}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => selectedKeyframes.forEach(deleteKeyframe)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Deletar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div>
              <label className="text-sm text-gray-300">Tempo</label>
              <Input
                type="number"
                step="0.1"
                className="mt-1"
                placeholder="0.0"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-300">X</label>
              <Input
                type="number"
                className="mt-1"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-300">Y</label>
              <Input
                type="number"
                className="mt-1"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-300">Escala</label>
              <Input
                type="number"
                step="0.1"
                className="mt-1"
                placeholder="1.0"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-300">Rotação</label>
              <Input
                type="number"
                className="mt-1"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-300">Opacidade</label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                className="mt-1"
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm text-gray-300">Easing</label>
            <select className="mt-1 w-32 p-2 bg-gray-700 border border-gray-600 rounded text-white">
              <option value="linear">Linear</option>
              <option value="easeIn">Ease In</option>
              <option value="easeOut">Ease Out</option>
              <option value="easeInOut">Ease In Out</option>
              <option value="bounce">Bounce</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
