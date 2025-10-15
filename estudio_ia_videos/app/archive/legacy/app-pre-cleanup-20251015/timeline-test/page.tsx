
/**
 * 🎬 Timeline Test Page
 * Página de teste da timeline real
 */

'use client';

import { TimelineReal } from '@/components/timeline/timeline-real';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TimelineTestPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Criar projeto de teste ao montar
  useEffect(() => {
    const createTestProject = async () => {
      try {
        const response = await fetch('/api/projects/create-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Timeline Test Project',
            description: 'Projeto de teste para timeline',
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setProjectId(data.id);
        } else {
          // Se falhar, usar ID de fallback
          setProjectId('test-project-id');
        }
      } catch (error) {
        console.error('Error creating test project:', error);
        setProjectId('test-project-id');
      } finally {
        setLoading(false);
      }
    };
    
    createTestProject();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando timeline...</p>
        </div>
      </div>
    );
  }
  
  if (!projectId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro ao criar projeto de teste</p>
          <Button onClick={() => router.push('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold">Timeline Editor (REAL)</h1>
            <p className="text-sm text-muted-foreground">
              Editor multi-track com preview sincronizado
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
            ✅ REAL (não mock)
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <TimelineReal
        projectId={projectId}
        onSave={() => {
          console.log('Timeline saved!');
        }}
      />
    </div>
  );
}
