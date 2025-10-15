'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Volume2,
  Layers,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Move,
  Image,
  FileText,
  Mic,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types para Timeline
interface TimelineElement {
  id: string;
  type: 'image' | 'text' | 'audio' | 'video' | 'avatar';
  name: string;
  duration: number;
  startTime: number;
  layer: number;
  visible: boolean;
  locked: boolean;
  properties: {
    opacity?: number;
    volume?: number;
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    color?: string;
    fontSize?: number;
    content?: string;
    src?: string;
  };
}

interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'overlay';
  visible: boolean;
  locked: boolean;
  elements: TimelineElement[];
}

interface TimelineProject {
  id: string;
  name: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  tracks: TimelineTrack[];
  currentTime: number;
  isPlaying: boolean;
  zoom: number;
}

// Sample data
const createSampleProject = (): TimelineProject => ({
  id: 'project-1',
  name: 'Meu Projeto PPTX',
  duration: 120, // 2 minutes
  fps: 30,
  width: 1920,
  height: 1080,
  currentTime: 0,
  isPlaying: false,
  zoom: 1,
  tracks: [
    {
      id: 'track-video',
      name: 'Vídeo Principal',
      type: 'video',
      visible: true,
      locked: false,
      elements: [
        {
          id: 'slide-1',
          type: 'image',
          name: 'Slide 1 - Introdução',
          duration: 30,
          startTime: 0,
          layer: 0,
          visible: true,
          locked: false,
          properties: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            src: '/slides/slide1.png'
          }
        },
        {
          id: 'slide-2',
          type: 'image',
          name: 'Slide 2 - Conteúdo',
          duration: 45,
          startTime: 30,
          layer: 0,
          visible: true,
          locked: false,
          properties: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            src: '/slides/slide2.png'
          }
        },
        {
          id: 'slide-3',
          type: 'image',
          name: 'Slide 3 - Conclusão',
          duration: 45,
          startTime: 75,
          layer: 0,
          visible: true,
          locked: false,
          properties: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            src: '/slides/slide3.png'
          }
        }
      ]
    },
    {
      id: 'track-audio',
      name: 'Narração',
      type: 'audio',
      visible: true,
      locked: false,
      elements: [
        {
          id: 'narration-1',
          type: 'audio',
          name: 'Narração Slide 1',
          duration: 28,
          startTime: 1,
          layer: 0,
          visible: true,
          locked: false,
          properties: {
            volume: 0.8,
            src: '/audio/narration1.mp3'
          }
        },
        {
          id: 'narration-2',
          type: 'audio',
          name: 'Narração Slide 2',
          duration: 42,
          startTime: 32,
          layer: 0,
          visible: true,
          locked: false,
          properties: {
            volume: 0.85,
            src: '/audio/narration2.mp3'
          }
        }
      ]
    },
    {
      id: 'track-overlay',
      name: 'Avatares & Overlays',
      type: 'overlay',
      visible: true,
      locked: false,
      elements: [
        {
          id: 'avatar-1',
          type: 'avatar',
          name: 'Avatar Instrutor',
          duration: 120,
          startTime: 0,
          layer: 1,
          visible: true,
          locked: false,
          properties: {
            opacity: 0.9,
            x: 1600,
            y: 800,
            scale: 0.3
          }
        }
      ]
    }
  ]
});

// Timeline Element Component
const TimelineElementComponent: React.FC<{
  element: TimelineElement;
  trackDuration: number;
  onSelect: (id: string) => void;
  isSelected: boolean;
}> = ({ element, trackDuration, onSelect, isSelected }) => {
  const widthPercent = (element.duration / trackDuration) * 100;
  const leftPercent = (element.startTime / trackDuration) * 100;

  const getElementIcon = () => {
    switch (element.type) {
      case 'image': return <Image className="w-3 h-3" />;
      case 'text': return <FileText className="w-3 h-3" />;
      case 'audio': return <Mic className="w-3 h-3" />;
      case 'avatar': return <User className="w-3 h-3" />;
      default: return <Image className="w-3 h-3" />;
    }
  };

  const getElementColor = () => {
    switch (element.type) {
      case 'image': return 'bg-blue-500';
      case 'text': return 'bg-green-500';
      case 'audio': return 'bg-purple-500';
      case 'avatar': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      className={`
        absolute h-8 rounded cursor-pointer border-2 flex items-center px-2 text-xs text-white font-medium
        ${getElementColor()}
        ${isSelected ? 'border-yellow-300 ring-2 ring-yellow-300/50' : 'border-white/20'}
        ${!element.visible ? 'opacity-50' : ''}
        ${element.locked ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        width: `${Math.max(widthPercent, 2)}%`,
        left: `${leftPercent}%`,
      }}
      onClick={() => onSelect(element.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-1 truncate">
        {getElementIcon()}
        <span className="truncate">{element.name}</span>
        {element.locked && <Lock className="w-3 h-3 ml-auto" />}
        {!element.visible && <EyeOff className="w-3 h-3 ml-auto" />}
      </div>
    </motion.div>
  );
};

// Timeline Track Component
const TimelineTrack: React.FC<{
  track: TimelineTrack;
  projectDuration: number;
  onElementSelect: (id: string) => void;
  selectedElementId?: string;
}> = ({ track, projectDuration, onElementSelect, selectedElementId }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex">
        {/* Track Header */}
        <div className="w-48 p-3 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm">{track.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0"
                onClick={() => {/* Toggle visibility */}}
              >
                {track.visible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3 text-gray-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0"
                onClick={() => {/* Toggle lock */}}
              >
                {track.locked ? (
                  <Lock className="w-3 h-3 text-red-500" />
                ) : (
                  <Unlock className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
          <Badge variant="outline" className="text-xs mt-1">
            {track.type}
          </Badge>
        </div>

        {/* Track Timeline */}
        <div className="flex-1 relative bg-white dark:bg-gray-900 min-h-[60px] p-2">
          {track.elements.map((element) => (
            <TimelineElementComponent
              key={element.id}
              element={element}
              trackDuration={projectDuration}
              onSelect={onElementSelect}
              isSelected={selectedElementId === element.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Timeline Editor Component
export default function TimelineEditor() {
  const [project, setProject] = useState<TimelineProject>(createSampleProject());
  const [selectedElementId, setSelectedElementId] = useState<string>();
  const [playheadPosition, setPlayheadPosition] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Playback Controls
  const handlePlay = useCallback(() => {
    setProject(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const handleStop = useCallback(() => {
    setProject(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    setPlayheadPosition(0);
  }, []);

  const handleTimeChange = useCallback((time: number) => {
    setProject(prev => ({ ...prev, currentTime: time }));
    setPlayheadPosition((time / project.duration) * 100);
  }, [project.duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    for (const track of project.tracks) {
      const element = track.elements.find(el => el.id === selectedElementId);
      if (element) return element;
    }
    return null;
  }, [selectedElementId, project.tracks]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        {/* Header */}
        <div className="border-b bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.width}x{project.height} • {project.fps}fps • {formatTime(project.duration)}
              </p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleTimeChange(Math.max(0, project.currentTime - 10))}>
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button onClick={handlePlay} size="sm">
                {project.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleStop}>
                <Square className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => handleTimeChange(Math.min(project.duration, project.currentTime + 10))}>
                <SkipForward className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 ml-4">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-mono">
                  {formatTime(project.currentTime)} / {formatTime(project.duration)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Timeline */}
          <div className="flex-1">
            {/* Timeline Header */}
            <div className="bg-gray-100 dark:bg-gray-800 border-b">
              <div className="flex">
                <div className="w-48 p-2 border-r border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium">Tracks</span>
                </div>
                <div className="flex-1 relative">
                  {/* Time Ruler */}
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                    {Array.from({ length: Math.ceil(project.duration / 10) }, (_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-gray-400 dark:border-gray-500"
                        style={{ left: `${(i * 10) / project.duration * 100}%` }}
                      >
                        <span className="absolute top-1 left-1 text-xs text-gray-600 dark:text-gray-400">
                          {formatTime(i * 10)}
                        </span>
                      </div>
                    ))}
                    
                    {/* Playhead */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: `${playheadPosition}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Tracks */}
            <div className="flex-1">
              {project.tracks.map((track) => (
                <TimelineTrack
                  key={track.id}
                  track={track}
                  projectDuration={project.duration}
                  onElementSelect={setSelectedElementId}
                  selectedElementId={selectedElementId}
                />
              ))}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedElement ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs font-medium">Name</label>
                        <Input
                          value={selectedElement.name}
                          className="mt-1"
                          readOnly
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium">Start Time</label>
                          <Input
                            value={formatTime(selectedElement.startTime)}
                            className="mt-1"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Duration</label>
                          <Input
                            value={formatTime(selectedElement.duration)}
                            className="mt-1"
                            readOnly
                          />
                        </div>
                      </div>

                      {selectedElement.properties.opacity !== undefined && (
                        <div>
                          <label className="text-xs font-medium">Opacity</label>
                          <Slider
                            value={[selectedElement.properties.opacity * 100]}
                            max={100}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      )}

                      {selectedElement.properties.volume !== undefined && (
                        <div>
                          <label className="text-xs font-medium flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            Volume
                          </label>
                          <Slider
                            value={[selectedElement.properties.volume * 100]}
                            max={100}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Copy className="w-3 h-3 mr-1" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-red-600">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select an element to edit properties</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DndContext>
    </div>
  );
}