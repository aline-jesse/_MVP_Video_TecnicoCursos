'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Wand2, 
  User, 
  Volume2, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Sparkles,
  FileAudio,
  Trash2,
  Star,
  RefreshCw,
  Save,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface VoiceProfile {
  id: string
  name: string
  description: string
  status: 'training' | 'ready' | 'error'
  quality_score: number
  similarity_score: number
  created_at: string
  sample_count: number
  duration: number
}

interface VoiceCloningIntegrationProps {
  onVoiceSelected?: (voiceId: string, voiceName: string) => void
  selectedVoiceId?: string
  avatarId?: string
}

export default function VoiceCloningIntegration({ 
  onVoiceSelected, 
  selectedVoiceId,
  avatarId 
}: VoiceCloningIntegrationProps) {
  const [activeTab, setActiveTab] = useState('existing')
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<string>(selectedVoiceId || '')
  
  // Estados para criação de nova voz
  const [newVoiceName, setNewVoiceName] = useState('')
  const [newVoiceDescription, setNewVoiceDescription] = useState('')
  const [audioFiles, setAudioFiles] = useState<File[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [creationProgress, setCreationProgress] = useState(0)
  
  // Estados para teste de voz
  const [testText, setTestText] = useState('Olá! Esta é uma demonstração da voz clonada para o avatar.')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Estados para configurações de voz
  const [voiceSettings, setVoiceSettings] = useState({
    emotion: 'neutral',
    speed: 1.0,
    pitch: 0,
    volume: 0.8
  })

  // Carregar perfis de voz existentes
  useEffect(() => {
    loadVoiceProfiles()
  }, [])

  const loadVoiceProfiles = async () => {
    setIsLoading(true)
    try {
      // Simular carregamento de perfis existentes
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProfiles: VoiceProfile[] = [
        {
          id: 'voice-1',
          name: 'João - Narrador Corporativo',
          description: 'Voz masculina profissional para treinamentos corporativos',
          status: 'ready',
          quality_score: 92,
          similarity_score: 88,
          created_at: '2024-01-15',
          sample_count: 8,
          duration: 240
        },
        {
          id: 'voice-2',
          name: 'Maria - Educadora Amigável',
          description: 'Voz feminina calorosa para conteúdo educativo',
          status: 'ready',
          quality_score: 95,
          similarity_score: 91,
          created_at: '2024-01-10',
          sample_count: 12,
          duration: 360
        },
        {
          id: 'voice-3',
          name: 'Carlos - Técnico Especialista',
          description: 'Voz masculina clara para tutoriais técnicos',
          status: 'training',
          quality_score: 0,
          similarity_score: 0,
          created_at: '2024-01-20',
          sample_count: 6,
          duration: 180
        }
      ]
      
      setVoiceProfiles(mockProfiles)
    } catch (error) {
      console.error('Erro ao carregar perfis de voz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAudioFiles(prev => [...prev, ...files])
  }

  const removeAudioFile = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index))
  }

  const createNewVoice = async () => {
    if (!newVoiceName.trim() || audioFiles.length < 3) return
    
    setIsCreating(true)
    setCreationProgress(0)
    
    try {
      // Simular processo de criação
      const progressInterval = setInterval(() => {
        setCreationProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 1000)
      
      // Aguardar conclusão
      await new Promise(resolve => setTimeout(resolve, 8000))
      
      // Adicionar nova voz à lista
      const newVoice: VoiceProfile = {
        id: `voice-${Date.now()}`,
        name: newVoiceName,
        description: newVoiceDescription,
        status: 'ready',
        quality_score: Math.floor(Math.random() * 10 + 85),
        similarity_score: Math.floor(Math.random() * 10 + 80),
        created_at: new Date().toISOString().split('T')[0],
        sample_count: audioFiles.length,
        duration: audioFiles.length * 30
      }
      
      setVoiceProfiles(prev => [newVoice, ...prev])
      setSelectedProfile(newVoice.id)
      
      // Limpar formulário
      setNewVoiceName('')
      setNewVoiceDescription('')
      setAudioFiles([])
      setActiveTab('existing')
      
    } catch (error) {
      console.error('Erro ao criar voz:', error)
    } finally {
      setIsCreating(false)
      setCreationProgress(0)
    }
  }

  const generateTestAudio = async () => {
    if (!selectedProfile || !testText.trim()) return
    
    setIsGenerating(true)
    try {
      // Simular geração de áudio
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simular URL de áudio gerado
      setGeneratedAudio(`/api/voice/generate/${selectedProfile}/${Date.now()}`)
    } catch (error) {
      console.error('Erro ao gerar áudio:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const playTestAudio = () => {
    if (!generatedAudio) return
    
    setIsPlaying(true)
    // Simular reprodução
    setTimeout(() => setIsPlaying(false), 3000)
  }

  const selectVoice = (voiceId: string) => {
    setSelectedProfile(voiceId)
    const voice = voiceProfiles.find(v => v.id === voiceId)
    if (voice && onVoiceSelected) {
      onVoiceSelected(voiceId, voice.name)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Mic className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Integração de Voice Cloning</h2>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Avatar Studio
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Conecte vozes clonadas ao seu avatar para criar experiências mais realistas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="existing">Vozes Existentes</TabsTrigger>
          <TabsTrigger value="create">Criar Nova Voz</TabsTrigger>
          <TabsTrigger value="test">Testar & Configurar</TabsTrigger>
        </TabsList>

        {/* Tab: Vozes Existentes */}
        <TabsContent value="existing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Biblioteca de Vozes
              </CardTitle>
              <CardDescription>
                Selecione uma voz clonada para usar com seu avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Carregando vozes...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {voiceProfiles.map((voice) => (
                    <Card 
                      key={voice.id} 
                      className={`cursor-pointer transition-all ${
                        selectedProfile === voice.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => selectVoice(voice.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{voice.name}</h3>
                              {voice.status === 'ready' && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {voice.status === 'training' && (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                              {voice.status === 'error' && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {voice.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{voice.sample_count} amostras</span>
                              <span>{formatDuration(voice.duration)}</span>
                              <span>Criado em {voice.created_at}</span>
                            </div>
                          </div>
                          
                          {voice.status === 'ready' && (
                            <div className="text-right space-y-1">
                              <div className="flex items-center gap-2">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-sm font-medium">
                                  {voice.quality_score}%
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Similaridade: {voice.similarity_score}%
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Criar Nova Voz */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Criar Nova Voz Clonada
              </CardTitle>
              <CardDescription>
                Carregue amostras de áudio para criar uma nova voz personalizada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCreating ? (
                <>
                  {/* Informações da Voz */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da Voz</Label>
                      <Input
                        placeholder="Ex: Ana - Instrutora Técnica"
                        value={newVoiceName}
                        onChange={(e) => setNewVoiceName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        placeholder="Breve descrição do uso da voz"
                        value={newVoiceDescription}
                        onChange={(e) => setNewVoiceDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Upload de Arquivos */}
                  <div className="space-y-2">
                    <Label>Amostras de Áudio (mínimo 3 arquivos)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileAudio className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Arraste arquivos de áudio ou clique para selecionar
                      </p>
                      <Input
                        type="file"
                        multiple
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="audio-upload"
                      />
                      <Label htmlFor="audio-upload">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Arquivos
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>

                  {/* Lista de Arquivos */}
                  {audioFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Arquivos Carregados ({audioFiles.length})</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {audioFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <FileAudio className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAudioFile(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requisitos */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Requisitos:</strong> Mínimo 3 arquivos, áudio claro, 
                      30s-5min cada, mesma pessoa falando, formato MP3/WAV
                    </AlertDescription>
                  </Alert>

                  {/* Botão de Criação */}
                  <Button
                    onClick={createNewVoice}
                    disabled={!newVoiceName.trim() || audioFiles.length < 3}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Criar Voz Clonada
                  </Button>
                </>
              ) : (
                /* Progresso de Criação */
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <h3 className="text-lg font-medium">Criando Voz Clonada...</h3>
                  <p className="text-muted-foreground">
                    Processando {audioFiles.length} amostras de áudio
                  </p>
                  <div className="space-y-2">
                    <Progress value={creationProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      {creationProgress.toFixed(0)}% concluído
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Testar & Configurar */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Teste de Voz
              </CardTitle>
              <CardDescription>
                Teste a voz selecionada e ajuste as configurações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProfile ? (
                <>
                  {/* Voz Selecionada */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {voiceProfiles.find(v => v.id === selectedProfile)?.name}
                      </span>
                    </div>
                  </div>

                  {/* Texto de Teste */}
                  <div className="space-y-2">
                    <Label>Texto para Teste</Label>
                    <Textarea
                      placeholder="Digite o texto que deseja testar com a voz clonada..."
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      className="h-24"
                    />
                  </div>

                  {/* Configurações de Voz */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Emoção</Label>
                      <Select 
                        value={voiceSettings.emotion} 
                        onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, emotion: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">Neutro</SelectItem>
                          <SelectItem value="happy">Feliz</SelectItem>
                          <SelectItem value="serious">Sério</SelectItem>
                          <SelectItem value="excited">Animado</SelectItem>
                          <SelectItem value="calm">Calmo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Velocidade: {voiceSettings.speed}x</Label>
                      <Slider
                        value={[voiceSettings.speed]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, speed: value }))}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tom: {voiceSettings.pitch > 0 ? '+' : ''}{voiceSettings.pitch}</Label>
                      <Slider
                        value={[voiceSettings.pitch]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, pitch: value }))}
                        min={-50}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Volume: {Math.round(voiceSettings.volume * 100)}%</Label>
                      <Slider
                        value={[voiceSettings.volume]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, volume: value }))}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <Button
                      onClick={generateTestAudio}
                      disabled={!testText.trim() || isGenerating}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Gerar Áudio
                    </Button>

                    {generatedAudio && (
                      <Button
                        onClick={playTestAudio}
                        disabled={isPlaying}
                        variant="outline"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Status do Áudio Gerado */}
                  {generatedAudio && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Áudio gerado com sucesso! Use os controles acima para reproduzir.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selecione uma voz na aba "Vozes Existentes" para testar e configurar.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações Finais */}
      {selectedProfile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Voz Configurada para o Avatar</h3>
                <p className="text-sm text-muted-foreground">
                  {voiceProfiles.find(v => v.id === selectedProfile)?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </Button>
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aplicar ao Avatar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}