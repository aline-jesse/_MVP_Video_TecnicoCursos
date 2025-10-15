'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Mic, 
  Play, 
  Pause, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  FileAudio,
  Waves,
  Clock,
  Brain,
  Target,
  Download,
  RefreshCw
} from 'lucide-react'

interface AudioAnalysis {
  duration: number
  sampleRate: number
  bitRate: number
  channels: number
  format: string
  quality: number
  noiseLevel: number
  clarity: number
  consistency: number
  voiceCharacteristics: {
    pitch: number
    tone: string
    accent: string
    gender: 'male' | 'female' | 'neutral'
    age: string
    emotion: string
  }
  recommendations: string[]
}

interface UploadedFile {
  id: string
  file: File
  url: string
  analysis?: AudioAnalysis
  isAnalyzing: boolean
  isPlaying: boolean
}

export default function VoiceUploadAnalyzer() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = (files: File[]) => {
    const audioFiles = files.filter(file => file.type.startsWith('audio/'))
    
    audioFiles.forEach(file => {
      const id = Math.random().toString(36).substr(2, 9)
      const url = URL.createObjectURL(file)
      
      const newFile: UploadedFile = {
        id,
        file,
        url,
        isAnalyzing: true,
        isPlaying: false
      }
      
      setUploadedFiles(prev => [...prev, newFile])
      
      // Simular análise de áudio
      setTimeout(() => {
        analyzeAudio(id, file)
      }, 1000)
    })
  }

  const analyzeAudio = async (fileId: string, file: File) => {
    // Simular análise de IA
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const mockAnalysis: AudioAnalysis = {
      duration: Math.random() * 300 + 30,
      sampleRate: 44100,
      bitRate: 320,
      channels: 1,
      format: file.type.split('/')[1].toUpperCase(),
      quality: Math.random() * 0.3 + 0.7,
      noiseLevel: Math.random() * 0.3,
      clarity: Math.random() * 0.3 + 0.7,
      consistency: Math.random() * 0.3 + 0.7,
      voiceCharacteristics: {
        pitch: Math.random() * 200 + 100,
        tone: ['grave', 'médio', 'agudo'][Math.floor(Math.random() * 3)],
        accent: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Nordeste'][Math.floor(Math.random() * 4)],
        gender: ['male', 'female', 'neutral'][Math.floor(Math.random() * 3)] as 'male' | 'female' | 'neutral',
        age: ['18-25', '26-35', '36-45', '46-55', '55+'][Math.floor(Math.random() * 5)],
        emotion: ['neutro', 'alegre', 'calmo', 'sério'][Math.floor(Math.random() * 4)]
      },
      recommendations: [
        'Qualidade de áudio excelente para treinamento',
        'Recomendado reduzir ruído de fundo',
        'Duração ideal para modelo personalizado',
        'Consistência vocal muito boa'
      ].slice(0, Math.floor(Math.random() * 4) + 1)
    }
    
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, analysis: mockAnalysis, isAnalyzing: false }
        : f
    ))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const file = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' })
        handleFiles([file])
        
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const togglePlayback = (fileId: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, isPlaying: !f.isPlaying }
        : { ...f, isPlaying: false }
    ))
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file) {
        URL.revokeObjectURL(file.url)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 0.9) return 'text-green-600'
    if (quality >= 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityBadge = (quality: number) => {
    if (quality >= 0.9) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>
    if (quality >= 0.8) return <Badge className="bg-yellow-100 text-yellow-800">Boa</Badge>
    return <Badge className="bg-red-100 text-red-800">Baixa</Badge>
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload e Análise de Voz
          </CardTitle>
          <CardDescription>
            Faça upload de amostras de voz ou grave diretamente para análise com IA
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileAudio className="w-5 h-5" />
              Upload de Arquivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                Arraste arquivos de áudio aqui
              </p>
              <p className="text-gray-500 mb-4">
                ou clique para selecionar
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Selecionar Arquivos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*"
                onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-4">
                Formatos suportados: MP3, WAV, M4A, FLAC
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Gravação Direta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                isRecording 
                  ? 'bg-red-100 animate-pulse' 
                  : 'bg-gray-100'
              }`}>
                <Mic className={`w-12 h-12 ${
                  isRecording ? 'text-red-600' : 'text-gray-400'
                }`} />
              </div>
              
              {isRecording && (
                <div className="mb-4">
                  <div className="text-2xl font-mono font-bold text-red-600">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-sm text-gray-500">Gravando...</div>
                </div>
              )}
              
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
                }
              >
                {isRecording ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Parar Gravação
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Iniciar Gravação
                  </>
                )}
              </Button>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Para melhor qualidade, grave em ambiente silencioso por pelo menos 30 segundos.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves className="w-5 h-5" />
              Arquivos Analisados
            </CardTitle>
            <CardDescription>
              Resultados da análise de IA para cada arquivo de voz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileAudio className="w-8 h-8 text-purple-600" />
                      <div>
                        <h4 className="font-semibold">{file.file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePlayback(file.id)}
                      >
                        {file.isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {file.isAnalyzing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Analisando com IA...</span>
                      </div>
                      <Progress value={66} className="h-2" />
                    </div>
                  ) : file.analysis ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {file.analysis.duration.toFixed(0)}s
                          </div>
                          <div className="text-sm text-gray-500">Duração</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getQualityColor(file.analysis.quality)}`}>
                            {(file.analysis.quality * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-500">Qualidade</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {(file.analysis.clarity * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-500">Clareza</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {(file.analysis.consistency * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-500">Consistência</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Características da Voz
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Gênero:</span>
                            <span className="ml-2 font-medium">
                              {file.analysis.voiceCharacteristics.gender === 'male' ? 'Masculino' :
                               file.analysis.voiceCharacteristics.gender === 'female' ? 'Feminino' : 'Neutro'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Idade:</span>
                            <span className="ml-2 font-medium">{file.analysis.voiceCharacteristics.age}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sotaque:</span>
                            <span className="ml-2 font-medium">{file.analysis.voiceCharacteristics.accent}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Tom:</span>
                            <span className="ml-2 font-medium">{file.analysis.voiceCharacteristics.tone}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Pitch:</span>
                            <span className="ml-2 font-medium">{file.analysis.voiceCharacteristics.pitch.toFixed(0)} Hz</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Emoção:</span>
                            <span className="ml-2 font-medium">{file.analysis.voiceCharacteristics.emotion}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Recomendações
                        </h5>
                        <div className="space-y-1">
                          {file.analysis.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        {getQualityBadge(file.analysis.quality)}
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Usar para Treinamento
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}