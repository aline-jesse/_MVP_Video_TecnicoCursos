/**
 * 🧪 Componente de Teste para Notificações de Render
 * Permite testar o sistema de notificações manualmente
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Play, Square, AlertCircle, CheckCircle } from 'lucide-react';

interface RenderNotificationTestProps {
  userId: string;
}

export function RenderNotificationTest({ userId }: RenderNotificationTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState('Teste de Render');
  const [jobType, setJobType] = useState('video');
  const [priority, setPriority] = useState('normal');

  const createTestJob = async () => {
    if (!userId) {
      toast.error('ID do usuário é necessário');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/render/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: `test-${Date.now()}`,
          userId,
          status: 'queued',
          progress: 0,
          metadata: {
            type: jobType,
            priority,
            title: jobTitle
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar job de teste');
      }

      toast.success('Job de teste criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar job de teste:', error);
      toast.error('Erro ao criar job de teste');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateProgress = async () => {
    if (!userId) {
      toast.error('ID do usuário é necessário');
      return;
    }

    const jobId = `progress-test-${Date.now()}`;
    
    try {
      // Criar job
      await fetch('/api/render/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          userId,
          status: 'queued',
          progress: 0,
          metadata: {
            type: jobType,
            priority,
            title: `${jobTitle} - Progresso`
          }
        }),
      });

      // Simular progresso
      for (let progress = 10; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const status = progress === 100 ? 'completed' : 'processing';
        
        await fetch('/api/render/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            userId,
            status,
            progress,
            ...(progress === 100 && {
              output_video_url: 'https://example.com/video.mp4'
            })
          }),
        });
      }

      toast.success('Simulação de progresso concluída!');
    } catch (error) {
      console.error('Erro na simulação:', error);
      toast.error('Erro na simulação de progresso');
    }
  };

  const simulateError = async () => {
    if (!userId) {
      toast.error('ID do usuário é necessário');
      return;
    }

    const jobId = `error-test-${Date.now()}`;
    
    try {
      // Criar job
      await fetch('/api/render/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          userId,
          status: 'queued',
          progress: 0,
          metadata: {
            type: jobType,
            priority,
            title: `${jobTitle} - Erro`
          }
        }),
      });

      // Simular erro após 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await fetch('/api/render/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          userId,
          status: 'failed',
          progress: 30,
          error_message: 'Erro simulado: Falha no processamento do vídeo'
        }),
      });

      toast.success('Simulação de erro concluída!');
    } catch (error) {
      console.error('Erro na simulação:', error);
      toast.error('Erro na simulação de erro');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Teste de Notificações
        </CardTitle>
        <CardDescription>
          Teste o sistema de notificações de render em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Título do Job</Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Nome do job de teste"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobType">Tipo</Label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Vídeo</SelectItem>
              <SelectItem value="tts">TTS</SelectItem>
              <SelectItem value="avatar">Avatar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={createTestJob} 
            disabled={isLoading}
            className="w-full"
          >
            <Square className="w-4 h-4 mr-2" />
            Criar Job Simples
          </Button>

          <Button 
            onClick={simulateProgress} 
            variant="outline"
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Simular Progresso
          </Button>

          <Button 
            onClick={simulateError} 
            variant="destructive"
            className="w-full"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Simular Erro
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>User ID:</strong> {userId || 'Não definido'}</p>
        </div>
      </CardContent>
    </Card>
  );
}