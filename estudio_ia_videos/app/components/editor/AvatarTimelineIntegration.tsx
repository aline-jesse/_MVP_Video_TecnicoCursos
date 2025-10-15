
/**
 * 🎬 Avatar Timeline Integration
 * Integração do Avatar 3D com o Timeline do Editor
 * FASE 3: Integração completa com Timeline
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mic, 
  Clock, 
  Plus, 
  Trash2,
  Play,
  Save
} from 'lucide-react';
import Avatar3DRenderer from '../avatars/Avatar3DRenderer';
import { avatarEngine } from '@/lib/avatar-engine';
import avatarsData from '@/data/avatars.json';

export interface AvatarTimelineClip {
  id: string;
  avatarId: string;
  text: string;
  voiceId: string;
  startTime: number; // ms
  duration: number; // ms
  audioUrl: string;
  position: {
    x: number;
    y: number;
    scale: number;
  };
}

interface AvatarTimelineIntegrationProps {
  onClipAdded?: (clip: AvatarTimelineClip) => void;
  onClipRemoved?: (clipId: string) => void;
  onClipUpdated?: (clip: AvatarTimelineClip) => void;
  existingClips?: AvatarTimelineClip[];
}

export default function AvatarTimelineIntegration({
  onClipAdded,
  onClipRemoved,
  onClipUpdated,
  existingClips = []
}: AvatarTimelineIntegrationProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState('sarah_executive');
  const [text, setText] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('pt-BR-Neural2-A');
  const [startTime, setStartTime] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState('');
  const [clips, setClips] = useState<AvatarTimelineClip[]>(existingClips);

  /**
   * Gera áudio TTS e adiciona clip ao timeline
   */
  const handleGenerateClip = useCallback(async () => {
    if (!text.trim()) {
      toast.error('Digite um texto para o avatar falar');
      return;
    }

    setIsGenerating(true);

    try {
      // Chama API para gerar TTS
      const response = await fetch('/api/avatars/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: selectedVoiceId,
          avatarId: selectedAvatarId
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar áudio');
      }

      const data = await response.json();

      // Cria novo clip
      const newClip: AvatarTimelineClip = {
        id: `avatar_clip_${Date.now()}`,
        avatarId: selectedAvatarId,
        text,
        voiceId: selectedVoiceId,
        startTime,
        duration: data.duration || 5000,
        audioUrl: data.audioUrl,
        position: {
          x: 0,
          y: 0,
          scale: 1
        }
      };

      // Adiciona ao estado local
      setClips(prev => [...prev, newClip]);

      // Notifica componente pai
      onClipAdded?.(newClip);

      // Preview
      setPreviewAudioUrl(data.audioUrl);

      toast.success('Clip de avatar adicionado ao timeline!');
      setText('');
    } catch (error) {
      console.error('Erro ao gerar clip:', error);
      toast.error('Erro ao gerar clip de avatar');
    } finally {
      setIsGenerating(false);
    }
  }, [text, selectedVoiceId, selectedAvatarId, startTime, onClipAdded]);

  /**
   * Remove clip do timeline
   */
  const handleRemoveClip = useCallback((clipId: string) => {
    setClips(prev => prev.filter(c => c.id !== clipId));
    onClipRemoved?.(clipId);
    toast.success('Clip removido do timeline');
  }, [onClipRemoved]);

  /**
   * Atualiza posição/timing de clip
   */
  const handleUpdateClip = useCallback((clipId: string, updates: Partial<AvatarTimelineClip>) => {
    setClips(prev => prev.map(clip => 
      clip.id === clipId ? { ...clip, ...updates } : clip
    ));

    const updatedClip = clips.find(c => c.id === clipId);
    if (updatedClip) {
      onClipUpdated?.({ ...updatedClip, ...updates });
    }
  }, [clips, onClipUpdated]);

  const selectedAvatar = avatarEngine.getAvatar(selectedAvatarId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Avatar 3D no Timeline
          </h3>
          <p className="text-sm text-gray-600">
            Adicione avatares falantes sincronizados à sua linha do tempo
          </p>
        </div>
        <Badge variant="secondary">
          {clips.length} {clips.length === 1 ? 'clip' : 'clips'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de configuração */}
        <Card className="p-6 space-y-6">
          <Tabs defaultValue="avatar">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="avatar">
                <User className="w-4 h-4 mr-2" />
                Avatar
              </TabsTrigger>
              <TabsTrigger value="voice">
                <Mic className="w-4 h-4 mr-2" />
                Voz
              </TabsTrigger>
              <TabsTrigger value="timing">
                <Clock className="w-4 h-4 mr-2" />
                Timing
              </TabsTrigger>
            </TabsList>

            {/* Tab: Seleção de Avatar */}
            <TabsContent value="avatar" className="space-y-4">
              <div>
                <Label>Selecione o Avatar</Label>
                <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {avatarsData.avatars.map(avatar => (
                      <SelectItem key={avatar.id} value={avatar.id}>
                        {avatar.name} - {avatar.style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAvatar && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">{selectedAvatar.name}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedAvatar.gender}</Badge>
                    <Badge variant="outline">{selectedAvatar.ageRange}</Badge>
                    <Badge variant="secondary">
                      Lip Sync: {selectedAvatar.lipSyncAccuracy}%
                    </Badge>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab: Configuração de Voz */}
            <TabsContent value="voice" className="space-y-4">
              <div>
                <Label>Voz TTS</Label>
                <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR-Neural2-A">Ana Clara (Feminina)</SelectItem>
                    <SelectItem value="pt-BR-Neural2-B">João Pedro (Masculino)</SelectItem>
                    <SelectItem value="pt-BR-Neural2-C">Camila (Feminina)</SelectItem>
                    <SelectItem value="pt-BR-Wavenet-A">Ricardo (Masculino)</SelectItem>
                    <SelectItem value="pt-BR-Wavenet-B">Mariana (Feminina)</SelectItem>
                    <SelectItem value="pt-BR-Standard-A">Carlos (Masculino)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Texto para Falar</Label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Digite o texto que o avatar irá falar..."
                  rows={6}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {text.length}/500 caracteres • ~{Math.ceil(text.split(' ').length / 2)}s de duração
                </p>
              </div>
            </TabsContent>

            {/* Tab: Timing no Timeline */}
            <TabsContent value="timing" className="space-y-4">
              <div>
                <Label>Tempo de Início (segundos)</Label>
                <Input
                  type="number"
                  value={startTime / 1000}
                  onChange={(e) => setStartTime(parseFloat(e.target.value) * 1000)}
                  min={0}
                  step={0.1}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 O clip será posicionado automaticamente no timeline no tempo especificado.
                  A duração é calculada com base no texto e velocidade da fala.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Botão de adicionar ao timeline */}
          <Button
            onClick={handleGenerateClip}
            disabled={isGenerating || !text.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>Gerando...</>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ao Timeline
              </>
            )}
          </Button>
        </Card>

        {/* Preview 3D */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold mb-4">Preview 3D</h4>
          <div className="h-[500px] bg-gray-50 rounded-lg overflow-hidden">
            {selectedAvatarId && (
              <Avatar3DRenderer
                avatarId={selectedAvatarId}
                text={text}
                audioUrl={previewAudioUrl}
                showControls={!!previewAudioUrl}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Lista de clips no timeline */}
      {clips.length > 0 && (
        <Card className="p-6">
          <h4 className="text-sm font-semibold mb-4">Clips no Timeline</h4>
          <div className="space-y-3">
            {clips.map(clip => {
              const avatar = avatarEngine.getAvatar(clip.avatarId);
              return (
                <div
                  key={clip.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {avatar?.name || 'Avatar'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {clip.text.substring(0, 50)}...
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {(clip.startTime / 1000).toFixed(1)}s
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {(clip.duration / 1000).toFixed(1)}s
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewAudioUrl(clip.audioUrl)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveClip(clip.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
