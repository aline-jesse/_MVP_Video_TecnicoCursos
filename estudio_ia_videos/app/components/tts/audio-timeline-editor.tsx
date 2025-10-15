
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  ZoomIn, 
  ZoomOut,
  Scissors,
  Copy,
  Move,
  Trash2,
  Plus,
  Music,
  Mic,
  FileText,
  Layers,
  Clock,
  Target
} from 'lucide-react'

interface TimelineTrack {
  id: string
  name: string
  type: 'audio' | 'narration' | 'music' | 'effects'
  color: string
  volume: number
  muted: boolean
  locked: boolean
  visible: boolean
  items: TimelineItem[]
}

interface TimelineItem {
  id: string
  start: number
  duration: number
  content: string
  waveform?: number[]
  selected: boolean
}

interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  duration: number
}

const TRACK_COLORS = {
  audio: '#3b82f6',     // blue
  narration: '#10b981', // emerald
  music: '#f59e0b',     // amber
  effects: '#8b5cf6'    // violet
}

const TRACK_ICONS = {
  audio: Mic,
  narration: FileText,
  music: Music,
  effects: Layers
}

export default function AudioTimelineEditor() {
  // Estados principais
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: '1',
      name: 'Narração Principal',
      type: 'narration',
      color: TRACK_COLORS.narration,
      volume: 1,
      muted: false,
      locked: false,
      visible: true,
      items: [
        {
          id: 'n1',
          start: 0,
          duration: 15,
          content: 'Introdução sobre segurança do trabalho',
          selected: false
        },
        {
          id: 'n2', 
          start: 20,
          duration: 12,
          content: 'Explicação das normas NR-12',
          selected: false
        }
      ]
    },
    {
      id: '2',
      name: 'Música de Fundo',
      type: 'music',
      color: TRACK_COLORS.music,
      volume: 0.3,
      muted: false,
      locked: false,
      visible: true,
      items: [
        {
          id: 'm1',
          start: 0,
          duration: 45,
          content: 'Background corporativo suave',
          selected: false
        }
      ]
    },
    {
      id: '3',
      name: 'Efeitos Sonoros',
      type: 'effects',
      color: TRACK_COLORS.effects,
      volume: 0.7,
      muted: false,
      locked: false,
      visible: true,
      items: [
        {
          id: 'e1',
          start: 10,
          duration: 2,
          content: 'Som de alerta',
          selected: false
        }
      ]
    }
  ])

  // Estados de reprodução
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 60
  })

  // Estados de interface
  const [zoom, setZoom] = useState(1)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [timelineWidth, setTimelineWidth] = useState(800)
  const [pixelsPerSecond, setPixelsPerSecond] = useState(20)

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)

  // Calcular largura total baseada no zoom
  useEffect(() => {
    setPixelsPerSecond(20 * zoom)
    setTimelineWidth(playbackState.duration * pixelsPerSecond)
  }, [zoom, playbackState.duration, pixelsPerSecond])

  // Controles de reprodução
  const togglePlayback = () => {
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }))
  }

  const stopPlayback = () => {
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }))
  }

  const seekTo = (time: number) => {
    setPlaybackState(prev => ({
      ...prev,
      currentTime: Math.max(0, Math.min(time, prev.duration))
    }))
  }

  // Simular reprodução
  useEffect(() => {
    if (!playbackState.isPlaying) return

    const interval = setInterval(() => {
      setPlaybackState(prev => {
        if (prev.currentTime >= prev.duration) {
          return { ...prev, isPlaying: false, currentTime: 0 }
        }
        return { ...prev, currentTime: prev.currentTime + 0.1 }
      })
    }, 100)

    return () => clearInterval(interval)
  }, [playbackState.isPlaying])

  // Controles de zoom
  const zoomIn = () => setZoom(prev => Math.min(prev * 1.5, 5))
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.25))

  // Controles de track
  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ))
  }

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ))
  }

  const toggleTrackVisibility = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, visible: !track.visible } : track
    ))
  }

  const toggleTrackLock = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, locked: !track.locked } : track
    ))
  }

  // Adicionar novo track
  const addTrack = (type: TimelineTrack['type']) => {
    const newTrack: TimelineTrack = {
      id: `${Date.now()}`,
      name: `Novo ${type}`,
      type,
      color: TRACK_COLORS[type],
      volume: type === 'music' ? 0.3 : 1,
      muted: false,
      locked: false,
      visible: true,
      items: []
    }
    setTracks(prev => [...prev, newTrack])
  }

  // Seleção de itens
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Click na timeline para posicionar playhead
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = x / pixelsPerSecond
    seekTo(time)
  }

  // Formatação de tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Audio Timeline Editor</h2>
            <Badge variant="outline">Professional</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {formatTime(playbackState.currentTime)} / {formatTime(playbackState.duration)}
            </span>
            <Badge variant="secondary">
              {tracks.filter(t => t.visible).length} tracks ativos
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Painel de Controle */}
        <Card className="w-80 m-4 flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Controles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {/* Controles de Reprodução */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Reprodução</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => seekTo(0)}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant={playbackState.isPlaying ? "default" : "outline"}
                  size="sm"
                  onClick={togglePlayback}
                >
                  {playbackState.isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopPlayback}
                >
                  <Square className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => seekTo(playbackState.duration)}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Controles de Zoom */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Visualização</h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="flex-1 px-2">
                  <div className="text-xs text-center">
                    Zoom: {(zoom * 100).toFixed(0)}%
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Lista de Tracks */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Tracks</h4>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTrack('narration')}
                    title="Adicionar Narração"
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTrack('music')}
                    title="Adicionar Música"
                  >
                    <Music className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTrack('effects')}
                    title="Adicionar Efeitos"
                  >
                    <Layers className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {tracks.map((track) => {
                    const Icon = TRACK_ICONS[track.type]
                    return (
                      <Card key={track.id} className="p-3">
                        <div className="space-y-3">
                          {/* Header do Track */}
                          <div className="flex items-center gap-2">
                            <Icon 
                              className="h-4 w-4 flex-shrink-0" 
                              style={{ color: track.color }} 
                            />
                            <span className="text-sm font-medium truncate flex-1">
                              {track.name}
                            </span>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: track.color,
                                color: track.color 
                              }}
                            >
                              {track.type}
                            </Badge>
                          </div>

                          {/* Controles do Track */}
                          <div className="space-y-2">
                            {/* Volume */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Volume</Label>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(track.volume * 100)}%
                                </span>
                              </div>
                              <Slider
                                value={[track.volume]}
                                onValueChange={([value]) => updateTrackVolume(track.id, value)}
                                max={1}
                                step={0.1}
                                disabled={track.muted || track.locked}
                                className="w-full"
                              />
                            </div>

                            {/* Botões de Controle */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTrackMute(track.id)}
                                className={`h-7 w-7 p-0 ${track.muted ? 'bg-red-100 text-red-600' : ''}`}
                              >
                                <Volume2 className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTrackVisibility(track.id)}
                                className={`h-7 w-7 p-0 ${!track.visible ? 'bg-gray-200' : ''}`}
                              >
                                <Target className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTrackLock(track.id)}
                                className={`h-7 w-7 p-0 ${track.locked ? 'bg-yellow-100 text-yellow-600' : ''}`}
                              >
                                {track.locked ? '🔒' : '🔓'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Principal */}
        <div className="flex-1 flex flex-col m-4 ml-0">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Timeline</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {selectedItems.length > 0 && (
                    <Badge variant="secondary">
                      {selectedItems.length} item(s) selecionado(s)
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Régua de Tempo */}
              <div className="border-b bg-gray-50 dark:bg-gray-800 p-2">
                <div 
                  className="relative h-6 bg-white dark:bg-gray-900 border rounded"
                  style={{ width: timelineWidth }}
                >
                  {/* Marcadores de tempo */}
                  {Array.from({ length: Math.ceil(playbackState.duration) + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 h-full border-l border-gray-300 dark:border-gray-600"
                      style={{ left: i * pixelsPerSecond }}
                    >
                      <span className="absolute top-0 left-1 text-xs text-muted-foreground">
                        {i}s
                      </span>
                    </div>
                  ))}
                  
                  {/* Playhead */}
                  <div
                    ref={playheadRef}
                    className="absolute top-0 h-full w-0.5 bg-red-500 z-10"
                    style={{ 
                      left: playbackState.currentTime * pixelsPerSecond,
                      boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
                    }}
                  />
                </div>
              </div>

              {/* Tracks Timeline */}
              <ScrollArea className="flex-1">
                <div
                  ref={timelineRef}
                  className="p-2 cursor-crosshair"
                  onClick={handleTimelineClick}
                >
                  <div className="space-y-2" style={{ width: timelineWidth }}>
                    {tracks
                      .filter(track => track.visible)
                      .map((track) => (
                        <div key={track.id} className="relative">
                          {/* Track Background */}
                          <div 
                            className="h-16 bg-gray-100 dark:bg-gray-800 border rounded relative overflow-hidden"
                            style={{ 
                              borderColor: track.color + '40',
                              backgroundColor: track.color + '10'
                            }}
                          >
                            {/* Track Items */}
                            {track.items.map((item) => (
                              <div
                                key={item.id}
                                className={`absolute top-1 bottom-1 rounded shadow-sm cursor-pointer transition-all ${
                                  selectedItems.includes(item.id)
                                    ? 'ring-2 ring-blue-500'
                                    : 'hover:shadow-md'
                                } ${track.muted ? 'opacity-50' : ''}`}
                                style={{
                                  left: item.start * pixelsPerSecond,
                                  width: item.duration * pixelsPerSecond,
                                  backgroundColor: track.color,
                                  color: 'white'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleItemSelection(item.id)
                                }}
                              >
                                <div className="p-2 text-xs font-medium truncate">
                                  {item.content}
                                </div>
                                
                                {/* Waveform simulada para áudio */}
                                {track.type === 'narration' && (
                                  <div className="absolute bottom-0 left-0 right-0 h-4 flex items-end gap-px px-1">
                                    {Array.from({ length: 20 }, (_, i) => (
                                      <div
                                        key={i}
                                        className="flex-1 bg-white/30 rounded-sm"
                                        style={{ 
                                          height: `${Math.random() * 100}%` 
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {/* Grid Lines */}
                            {Array.from({ length: Math.ceil(playbackState.duration) + 1 }, (_, i) => (
                              <div
                                key={i}
                                className="absolute top-0 bottom-0 w-px bg-black/10"
                                style={{ left: i * pixelsPerSecond }}
                              />
                            ))}
                          </div>

                          {/* Track Label */}
                          <div className="absolute top-1 left-2 text-xs font-medium text-white bg-black/50 px-1 rounded">
                            {track.name}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </ScrollArea>

              {/* Toolbar de Edição */}
              {selectedItems.length > 0 && (
                <div className="border-t p-3 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Scissors className="h-4 w-4 mr-1" />
                      Cortar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Move className="h-4 w-4 mr-1" />
                      Mover
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
