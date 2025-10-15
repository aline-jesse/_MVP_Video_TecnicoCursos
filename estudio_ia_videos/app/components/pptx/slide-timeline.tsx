
/**
 * Slide Timeline Component
 * Displays slides in a horizontal timeline with drag-and-drop
 */

"use client"

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Trash2, Copy, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineSlide {
  id: string;
  slideNumber: number;
  title: string;
  duration: number;
  thumbnailUrl?: string;
  backgroundImage?: string;
  backgroundColor?: string;
}

interface SlideTimelineProps {
  slides: TimelineSlide[];
  currentSlideId?: string;
  onSlideClick: (slideId: string) => void;
  onSlideReorder: (slides: TimelineSlide[]) => void;
  onSlideDelete?: (slideId: string) => void;
  onSlideDuplicate?: (slideId: string) => void;
  className?: string;
}

export function SlideTimeline({
  slides,
  currentSlideId,
  onSlideClick,
  onSlideReorder,
  onSlideDelete,
  onSlideDuplicate,
  className,
}: SlideTimelineProps) {
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update slide numbers
    const reorderedSlides = items.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1,
    }));

    onSlideReorder(reorderedSlides);
  };

  const getTotalDuration = () => {
    const total = slides.reduce((sum, slide) => sum + slide.duration, 0);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('bg-white border-t', className)}>
      <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-gray-700">Timeline</h3>
          <span className="text-xs text-gray-500">
            {slides.length} {slides.length === 1 ? 'slide' : 'slides'} • {getTotalDuration()}
          </span>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides-timeline" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'flex gap-2 p-4 overflow-x-auto',
                snapshot.isDraggingOver && 'bg-blue-50/50'
              )}
              style={{
                minHeight: '200px',
              }}
            >
              {slides.map((slide, index) => (
                <Draggable
                  key={slide.id}
                  draggableId={slide.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        'flex-shrink-0',
                        snapshot.isDragging && 'opacity-50'
                      )}
                    >
                      <Card
                        className={cn(
                          'w-48 cursor-pointer transition-all duration-200 hover:shadow-lg',
                          currentSlideId === slide.id && 'ring-2 ring-primary shadow-lg',
                          snapshot.isDragging && 'rotate-3'
                        )}
                        onClick={() => onSlideClick(slide.id)}
                      >
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-2 right-2 z-10 p-1 bg-white/80 rounded cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-4 h-4 text-gray-600" />
                        </div>

                        {/* Thumbnail */}
                        <div
                          className="relative h-32 rounded-t-lg overflow-hidden"
                          style={{
                            backgroundColor: slide.backgroundColor || '#f3f4f6',
                            backgroundImage: slide.backgroundImage
                              ? `url(${slide.backgroundImage})`
                              : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {slide.thumbnailUrl && (
                            <img
                              src={slide.thumbnailUrl}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          
                          {/* Slide Number Badge */}
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                            #{slide.slideNumber}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {slide.title || `Slide ${slide.slideNumber}`}
                          </h4>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              {slide.duration}s
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 pt-2 border-t">
                            {onSlideDuplicate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSlideDuplicate(slide.id);
                                }}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Duplicar
                              </Button>
                            )}
                            {onSlideDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSlideDelete(slide.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Excluir
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
