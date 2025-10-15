
'use client'

/**
 * 🎙️ VOICE WIZARD - Sprint 44
 * Fluxo guiado para criação de vozes customizadas
 */

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { 
  Mic, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Play,
  Volume2,
  Download,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'

type WizardStep = 'upload' | 'processing' | 'preview' | 'complete'

interface AudioSample {
  file: File
  url: string
  duration: number
  status: 'pending' | 'valid' | 'invalid'
}

export default function VoiceWizard({ onComplete }: { onComplete?: (voiceId: string) => void }) {
  const [step, setStep] = useState<WizardStep>('upload')
  const [voiceName, setVoiceName] = useState('')
  const [samples, setSamples] = useState<AudioSample[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [voiceId, setVoiceId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFiles = acceptedFiles.filter(f => f.type.startsWith('audio/'))
    
    if (audioFiles.length + samples.length > 5) {
      toast.error('Máximo de 5 amostras permitidas')
      return
    }

    const newSamples = audioFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      duration: 0,
      status: 'pending' as const
    }))

    setSamples(prev => [...prev, ...newSamples])
    toast.success(`${audioFiles.length} arquivo(s) adicionado(s)`)
  }, [samples])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'] },
    maxFiles: 5
  })

  const removeSample = (index: number) => {
    setSamples(prev => prev.filter((_, i) => i !== index))
  }

  const startTraining = async () => {
    if (samples.length < 3) {
      toast.error('Mínimo de 3 amostras necessárias')
      return
    }

    if (!voiceName.trim()) {
      toast.error('Por favor, dê um nome para a voz')
      return
    }

    setStep('processing')

    const formData = new FormData()
    formData.append('name', voiceName)
    samples.forEach((sample, i) => {
      formData.append(`sample${i}`, sample.file)
    })

    try {
      const response = await fetch('/api/voice/create', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setJobId(data.jobId)
        pollTrainingStatus(data.jobId)
      } else {
        throw new Error('Falha ao iniciar treinamento')
      }
    } catch (error) {
      toast.error('Erro ao criar voz')
      setStep('upload')
    }
  }

  const pollTrainingStatus = async (jId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/voice/status?jobId=${jId}`)
        const data = await response.json()

        setTrainingProgress(data.progress)

        if (data.status === 'completed') {
          clearInterval(interval)
          setVoiceId(data.voiceId)
          setStep('preview')
          toast.success('✓ Voz treinada com sucesso!')
        } else if (data.status === 'failed') {
          clearInterval(interval)
          toast.error('Falha no treinamento')
          setStep('upload')
        }
      } catch (error) {
        clearInterval(interval)
        toast.error('Erro ao verificar status')
      }
    }, 2000)
  }

  const generatePreview = async () => {
    if (!voiceId) return

    try {
      const response = await fetch('/api/voice/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId,
          text: 'Olá, esta é uma prévia da sua voz customizada. Você pode usar esta voz em seus projetos.'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      }
    } catch (error) {
      toast.error('Erro ao gerar prévia')
    }
  }

  const finishWizard = () => {
    if (voiceId) {
      setStep('complete')
      onComplete?.(voiceId)
      toast.success('✓ Voz customizada pronta para uso!')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className={step === 'upload' ? 'font-semibold' : 'text-muted-foreground'}>
            1. Upload
          </span>
          <span className={step === 'processing' ? 'font-semibold' : 'text-muted-foreground'}>
            2. Processamento
          </span>
          <span className={step === 'preview' ? 'font-semibold' : 'text-muted-foreground'}>
            3. Prévia
          </span>
          <span className={step === 'complete' ? 'font-semibold' : 'text-muted-foreground'}>
            4. Concluído
          </span>
        </div>
        <Progress value={
          step === 'upload' ? 25 :
          step === 'processing' ? 50 :
          step === 'preview' ? 75 : 100
        } />
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Upload de Amostras de Voz
            </CardTitle>
            <CardDescription>
              Envie 3-5 amostras de áudio de alta qualidade (mínimo 30 segundos cada)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Nome da Voz</Label>
              <Input
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="Ex: Voz do Instrutor João"
                className="mt-2"
              />
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos de áudio ou clique para selecionar'}
              </p>
              <p className="text-sm text-muted-foreground">
                MP3, WAV, M4A, OGG (máximo 5 arquivos)
              </p>
            </div>

            {samples.length > 0 && (
              <div className="space-y-2">
                <Label>Amostras ({samples.length}/5)</Label>
                {samples.map((sample, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm">{sample.file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSample(i)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                onClick={startTraining}
                disabled={samples.length < 3 || !voiceName.trim()}
                className="w-full"
              >
                Iniciar Treinamento
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Treinando Voz Customizada</h3>
            <p className="text-muted-foreground mb-6">
              Isso pode levar alguns minutos. Não feche esta janela.
            </p>
            <Progress value={trainingProgress} className="max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">{trainingProgress}% concluído</p>
          </CardContent>
        </Card>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Voz Treinada com Sucesso!
            </CardTitle>
            <CardDescription>
              Ouça uma prévia antes de usar em seus projetos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Badge className="mb-4">{voiceName}</Badge>
              <p className="text-sm text-muted-foreground mb-4">Voice ID: {voiceId}</p>
              
              {!previewUrl && (
                <Button onClick={generatePreview}>
                  <Play className="h-4 w-4 mr-2" />
                  Gerar Prévia
                </Button>
              )}

              {previewUrl && (
                <audio controls src={previewUrl} className="w-full mt-4" />
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('upload')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={finishWizard} className="flex-1">
                Usar Esta Voz
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Voz Customizada Criada!</h3>
            <p className="text-muted-foreground mb-6">
              Sua voz "{voiceName}" está pronta para ser usada em qualquer projeto
            </p>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Voice ID: {voiceId}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
