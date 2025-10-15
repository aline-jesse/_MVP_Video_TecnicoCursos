
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimelineReal } from '@/components/timeline/timeline-real';
import { useTimelineReal } from '@/hooks/use-timeline-real';
import { ArrowLeft, Film } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TimelineEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('projectId');

  const [projectName, setProjectName] = useState<string>('Projeto');
  const [isSaving, setIsSaving] = useState(false);

  const timelineHook = useTimelineReal({ projectId: projectId || '' });

  // Carregar projeto
  useEffect(() => {
    if (projectId) {
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          if (data.name) setProjectName(data.name);
        })
        .catch(console.error);
    }
  }, [projectId]);

  // Salvar timeline
  const handleSave = async () => {
    if (!projectId) return;
    
    setIsSaving(true);
    try {
      // Salvar via API
      const res = await fetch(`/api/timeline/${projectId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeline: timelineHook.timeline }),
      });
      
      if (res.ok) {
        toast.success('Timeline salva com sucesso!');
      } else {
        toast.error('Erro ao salvar timeline');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar timeline');
    } finally {
      setIsSaving(false);
    }
  };

  // Renderizar
  const handleRender = async () => {
    await handleSave(); // Salva antes de renderizar
    router.push(`/studio?projectId=${projectId}&step=render`);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/studio')}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-xl font-bold">{projectName}</h1>
            <p className="text-sm text-gray-400">Editor de Timeline</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            onClick={handleRender}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Film className="w-4 h-4 mr-2" />
            Renderizar Vídeo
          </Button>
        </div>
      </div>

      {/* Timeline Component */}
      <div className="flex-1 overflow-hidden">
        <TimelineReal projectId={projectId || ''} {...timelineHook} />
      </div>
    </div>
  );
}
