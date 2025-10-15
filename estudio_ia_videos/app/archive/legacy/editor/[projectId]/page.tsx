
/**
 * Editor Page - Main video editor with PPTX slide timeline
 */

"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SlideTimeline, { TimelineSlide } from '@/components/pptx/slide-timeline';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Play,
  Save,
  Download,
  Share2,
  Settings,
  Loader2,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  totalSlides: number;
  createdAt: string;
  updatedAt: string;
}

interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  content: string;
  duration: number;
  transition: string;
  backgroundType: string;
  backgroundColor?: string;
  backgroundImage?: string;
  audioText?: string;
  elements: any;
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load project and slides
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to load project');
      }

      const data = await response.json();
      setProject(data.project);
      setSlides(data.slides || []);
      
      if (data.slides && data.slides.length > 0) {
        setCurrentSlideId(data.slides[0].id);
      }
      
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Erro ao carregar projeto', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSlideClick = (slideId: string) => {
    setCurrentSlideId(slideId);
  };

  const handleSlideReorder = async (reorderedSlides: TimelineSlide[]) => {
    // Update local state
    const updatedSlides = slides.map(slide => {
      const reordered = reorderedSlides.find(rs => rs.id === slide.id);
      return reordered ? { ...slide, slideNumber: reordered.slideNumber } : slide;
    });

    setSlides(updatedSlides);

    // Save to server
    try {
      await fetch('/api/pptx/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          action: 'update_slides',
          slides: reorderedSlides.map(s => ({
            id: s.id,
            slideNumber: s.slideNumber,
            duration: s.duration,
            transition: 'fade',
          })),
        }),
      });

      toast.success('Ordem dos slides atualizada');
    } catch (error) {
      console.error('Error reordering slides:', error);
      toast.error('Erro ao reordenar slides');
    }
  };

  const handleSlideDelete = async (slideId: string) => {
    if (!confirm('Deseja realmente excluir este slide?')) return;

    try {
      const response = await fetch(`/api/slides/${slideId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete slide');
      }

      // Update local state
      setSlides(prev => prev.filter(s => s.id !== slideId));
      
      // Select next slide
      const currentIndex = slides.findIndex(s => s.id === slideId);
      if (currentIndex > 0) {
        setCurrentSlideId(slides[currentIndex - 1].id);
      } else if (slides.length > 1) {
        setCurrentSlideId(slides[1].id);
      } else {
        setCurrentSlideId(null);
      }

      toast.success('Slide excluído');
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Erro ao excluir slide');
    }
  };

  const handleSlideDuplicate = async (slideId: string) => {
    try {
      const slideToClone = slides.find(s => s.id === slideId);
      if (!slideToClone) return;

      const response = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          ...slideToClone,
          slideNumber: slideToClone.slideNumber + 1,
          title: `${slideToClone.title} (cópia)`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate slide');
      }

      const { slide: newSlide } = await response.json();
      
      // Insert after current slide
      const currentIndex = slides.findIndex(s => s.id === slideId);
      const updatedSlides = [...slides];
      updatedSlides.splice(currentIndex + 1, 0, newSlide);
      
      setSlides(updatedSlides);
      toast.success('Slide duplicado');
    } catch (error) {
      console.error('Error duplicating slide:', error);
      toast.error('Erro ao duplicar slide');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // TODO: Implement save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Projeto salvo');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar projeto');
    } finally {
      setSaving(false);
    }
  };

  const handleRender = async () => {
    router.push(`/render/${projectId}`);
  };

  // Convert slides to timeline format
  const timelineSlides: TimelineSlide[] = slides.map(slide => ({
    id: slide.id,
    slideNumber: slide.slideNumber,
    title: slide.title,
    duration: slide.duration,
    backgroundColor: slide.backgroundColor,
    backgroundImage: slide.backgroundImage,
  }));

  // Get current slide
  const currentSlide = slides.find(s => s.id === currentSlideId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-gray-600">Carregando editor...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Projeto não encontrado</p>
          <Button onClick={() => router.push('/projects')}>
            Voltar para Projetos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/projects')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-gray-500">{project.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>

              <Button
                size="sm"
                onClick={handleRender}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Vídeo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Area */}
        <div className="flex-1 p-6">
          <Card className="h-full flex items-center justify-center bg-white">
            {currentSlide ? (
              <div className="w-full h-full p-8">
                <div
                  className="w-full h-full rounded-lg shadow-lg flex items-center justify-center"
                  style={{
                    backgroundColor: currentSlide.backgroundColor || '#f3f4f6',
                    backgroundImage: currentSlide.backgroundImage
                      ? `url(${currentSlide.backgroundImage})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="text-center space-y-4 p-8">
                    <h2 className="text-4xl font-bold text-gray-900">
                      {currentSlide.title}
                    </h2>
                    <p className="text-lg text-gray-700 max-w-2xl">
                      {currentSlide.content}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Selecione um slide para começar</p>
              </div>
            )}
          </Card>
        </div>

        {/* Timeline */}
        <SlideTimeline
          slides={timelineSlides}
          currentSlideId={currentSlideId || undefined}
          onSlideClick={handleSlideClick}
          onSlideReorder={handleSlideReorder}
          onSlideDelete={handleSlideDelete}
          onSlideDuplicate={handleSlideDuplicate}
          className="border-t"
        />
      </div>
    </div>
  );
}
