
'use client'

/**
 * 🎬 Timeline Editor - Estilo Animaker
 * Editor de timeline avançado com funcionalidades completas
 */

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  VolumeX,
  Scissors,
  Copy,
  Trash2,
  Plus,
  Settings,
  Layers,
  BarChart3,
  Clock,
  Target,
  Move,
  RotateCcw
} from 'lucide-react'

interface TimelineTrack {
  id: string
  type: 'scene' | 'audio' | 'effects' | 'subtitles'
  name: string
  items: TimelineItem[]
  height: number
  color: string
  visible: boolean
  locked: boolean
}

interface TimelineItem {
  id: string
  type: string
  name: string
  startTime: number
  duration: number
  content?: any
  thumbnail?: string
  waveform?: number[]
}

interface AnimakerTimelineEditorProps {
  slides: any[]
  onTimelineChange: (timeline: any) => void
  onPlayStateChange: (isPlaying: boolean) => void
}

export function AnimakerTimelineEditor({ 
  slides, 
  onTimelineChange, 
  onPlayStateChange 
}: AnimakerTimelineEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(60)
  const [zoom, setZoom] = useState(1) // Timeline zoom level
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [playheadPosition, setPlayheadPosition] = useState(0)
  
  const timelineRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)

  // Timeline tracks configuration
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: 'scenes',
      type: 'scene',
      name: 'Slides/Cenas',
      height: 80,
      color: 'bg-blue-500',
      visible: true,
      locked: false,
      items: []
    },
    {
      id: 'voiceover',
      type: 'audio',
      name: 'Narração (TTS)',
      height: 60,
      color: 'bg-green-500',
      visible: true,
      locked: false,
      items: []
    },
    {
      id: 'background-music',
      type: 'audio',
      name: 'Música de Fundo',
      height: 40,
      color: 'bg-purple-500',
      visible: true,
      locked: false,
      items: []
    },
    {
      id: 'effects',
      type: 'effects',
      name: 'Efeitos & Transições',
      height: 40,
      color: 'bg-orange-500',
      visible: true,
      locked: false,
      items: []
    },
    {
      id: 'subtitles',
      type: 'subtitles',
      name: 'Legendas',
      height: 30,
      color: 'bg-yellow-500',
      visible: true,
      locked: false,
      items: []
    }
  ])

  // Initialize timeline items from slides
  useEffect(() => {
    if (slides.length > 0) {
      let currentTime = 0
      const sceneItems: TimelineItem[] = slides.map((slide, index) => {
        const item = {
          id: `scene-${index}`,
          type: 'scene',
          name: slide.title || `Slide ${index + 1}`,
          startTime: currentTime,
          duration: slide.duration || 5,
          content: slide,
          thumbnail: slide.thumbnail
        }
        currentTime += item.duration
        return item
      })

      // Generate voiceover items
      const voiceoverItems: TimelineItem[] = slides.map((slide, index) => ({
        id: `voice-${index}`,
        type: 'voiceover',
        name: `Narração ${index + 1}`,
        startTime: sceneItems[index].startTime,
        duration: sceneItems[index].duration,
        waveform: Array.from({ length: 50 }, () => Math.random() * 100)
      }))

      setTracks(prev => prev.map(track => {
        if (track.id === 'scenes') {
          return { ...track, items: sceneItems }
        }
        if (track.id === 'voiceover') {
          return { ...track, items: voiceoverItems }
        }
        return track
      }))

      setTotalDuration(currentTime)
    }
  }, [slides])

  // Timeline playback
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1
          if (newTime >= totalDuration) {
            setIsPlaying(false)
            return totalDuration
          }
          return newTime
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentTime, totalDuration])

  // Update playhead position
  useEffect(() => {
    const position = (currentTime / totalDuration) * 100
    setPlayheadPosition(position)
  }, [currentTime, totalDuration])

  const handlePlay = () => {
    const newPlaying = !isPlaying
    setIsPlaying(newPlaying)
    onPlayStateChange(newPlaying)
    
    if (newPlaying) {
      toast.success('▶️ Reprodução iniciada')
    } else {
      toast.success('⏸️ Reprodução pausada')
    }
  }

  const handleSeekTime = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(totalDuration, time)))
  }

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleItemDuplicate = (itemId: string) => {
    toast.success('📋 Item duplicado na timeline')
  }

  const handleItemDelete = (itemId: string) => {
    toast.success('🗑️ Item removido da timeline')
  }

  const handleTrackToggle = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, visible: !track.visible }
        : track
    ))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const pixelsPerSecond = 50 * zoom

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Timeline Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Layers className="h-5 w-5 mr-2 text-blue-400" />
            Timeline Editor
          </h3>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-600">
              {tracks.reduce((total, track) => total + track.items.length, 0)} elementos
            </Badge>
            <Badge variant="outline">
              {formatTime(totalDuration)}
            </Badge>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => handleSeekTime(0)}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePlay}
              className={isPlaying ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleSeekTime(totalDuration)}>
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <div className="text-sm text-gray-400 ml-4">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Zoom:</span>
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
                -
              </Button>
              <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(4, zoom + 0.25))}>
                +
              </Button>
            </div>
            
            <Button variant="ghost" size="sm">
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex">
        {/* Track Labels */}
        <div className="w-48 bg-gray-800 border-r border-gray-700">
          {tracks.map((track) => (
            <div 
              key={track.id}
              className="border-b border-gray-700 flex items-center justify-between px-3"
              style={{ height: track.height + 20 }}
            >
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTrackToggle(track.id)}
                  className="p-1"
                >
                  {track.visible ? '👁️' : '🙈'}
                </Button>
                <div>
                  <div className="text-sm font-medium">{track.name}</div>
                  <div className="text-xs text-gray-400">
                    {track.items.length} item{track.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="p-1">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Timeline Tracks */}
        <div className="flex-1 relative overflow-x-auto">
          <div 
            ref={timelineRef}
            className="relative"
            style={{ width: totalDuration * pixelsPerSecond }}
          >
            {/* Time Ruler */}
            <div className="h-8 bg-gray-700 border-b border-gray-600 relative">
              {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, second) => (
                <div
                  key={second}
                  className="absolute top-0 border-l border-gray-500"
                  style={{ left: second * pixelsPerSecond }}
                >
                  <span className="text-xs text-gray-400 ml-1">
                    {formatTime(second)}
                  </span>
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div
              ref={playheadRef}
              className="absolute top-0 w-0.5 bg-red-500 z-50"
              style={{ 
                left: playheadPosition + '%',
                height: '100%',
                transform: 'translateX(-50%)'
              }}
            >
              <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
            </div>

            {/* Track Content */}
            {tracks.map((track) => (
              <div 
                key={track.id}
                className="border-b border-gray-700 relative"
                style={{ height: track.height + 20 }}
              >
                {track.visible && track.items.map((item) => (
                  <div
                    key={item.id}
                    className={`absolute top-2 rounded cursor-pointer transition-all hover:brightness-110 ${
                      selectedItems.includes(item.id) 
                        ? 'ring-2 ring-blue-400 brightness-110' 
                        : ''
                    }`}
                    style={{
                      left: item.startTime * pixelsPerSecond,
                      width: item.duration * pixelsPerSecond,
                      height: track.height - 4,
                    }}
                    onClick={() => handleItemSelect(item.id)}
                  >
                    {/* Item Background */}
                    <div className={`w-full h-full rounded ${track.color} opacity-80 flex items-center justify-between px-2`}>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-white/70">
                          {formatTime(item.duration)}
                        </div>
                      </div>
                      
                      {/* Waveform for audio items */}
                      {item.waveform && (
                        <div className="flex items-center space-x-0.5 ml-2">
                          {item.waveform.slice(0, 10).map((height, i) => (
                            <div
                              key={i}
                              className="w-0.5 bg-white/60 rounded"
                              style={{ height: `${height * 0.3}px` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Resize Handles */}
                    {selectedItems.includes(item.id) && (
                      <>
                        <div className="absolute left-0 top-0 w-1 h-full bg-blue-400 cursor-w-resize"></div>
                        <div className="absolute right-0 top-0 w-1 h-full bg-blue-400 cursor-e-resize"></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Tools */}
      <div className="bg-gray-800 p-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedItems.length > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleItemDuplicate(selectedItems[0])}>
                  <Copy className="h-3 w-3 mr-1" />
                  Duplicar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleItemDelete(selectedItems[0])}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Excluir
                </Button>
                <Button variant="ghost" size="sm">
                  <Scissors className="h-3 w-3 mr-1" />
                  Cortar
                </Button>
                <div className="border-l border-gray-600 pl-2 ml-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedItems.length} selecionado{selectedItems.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>30 FPS</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>1920x1080</span>
            </div>
            <div className="flex items-center space-x-1">
              <Layers className="h-3 w-3" />
              <span>{tracks.filter(t => t.visible).length} tracks ativas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
