

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { 
  Mic, 
  Play, 
  Pause,
  Volume2, 
  Clock,
  DollarSign,
  CheckCircle,
  Loader2,
  Headphones,
  Users
} from 'lucide-react'
import SlideNarrationStudio from '../../components/narration/slide-narration-studio'
import TimelinePlayer from '../../components/synchronization/timeline-player'
import { SlideNarrationResult } from '../../lib/tts/slide-narration-service'
import { slideAvatarSyncController, SyncTimeline } from '../../lib/synchronization/slide-avatar-sync'
import { toast } from 'react-hot-toast'

export default function TTSTestPage() {
  const [testSlides] = useState([
    {
      id: 'slide_1',
      slideNumber: 1,
      title: 'Introdução à Segurança do Trabalho',
      content: [
        'A segurança do trabalho é fundamental para proteger os trabalhadores',
        'Reduz acidentes e doenças ocupacionais',
        'Melhora a produtividade e qualidade de vida'
      ],
      notes: 'Este é o slide introdutório do nosso treinamento de segurança',
      duration: 20
    },
    {
      id: 'slide_2', 
      slideNumber: 2,
      title: 'Norma Regulamentadora NR-12',
      content: [
        'A NR-12 estabelece requisitos mínimos para segurança de máquinas',
        'Obrigatória para equipamentos e instalações industriais',
        'Inclui medidas de proteção coletiva e individual'
      ],
      notes: 'Atenção especial para os requisitos de proteção',
      duration: 25
    },
    {
      id: 'slide_3',
      slideNumber: 3,
      title: 'Equipamentos de Proteção Individual - EPI',
      content: [
        'Capacetes, óculos de proteção e luvas são essenciais',
        'Devem ser certificados pelo Ministério do Trabalho',
        'Uso obrigatório em áreas de risco'
      ],
      notes: 'Demonstrar os diferentes tipos de EPI',
      duration: 18
    }
  ])

  const [narrationResults, setNarrationResults] = useState<SlideNarrationResult[]>([])
  const [syncTimeline, setSyncTimeline] = useState<SyncTimeline[]>([])
  const [isTestingTTS, setIsTestingTTS] = useState(false)

  // Callback quando narração é concluída
  const handleNarrationComplete = async (results: SlideNarrationResult[]) => {
    console.log('🎉 Narração concluída:', results)
    setNarrationResults(results)
    
    // Gerar timeline de sincronização automaticamente
    try {
      const response = await fetch('/api/synchronization/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: testSlides,
          narrationResults: results,
          avatarConfig: {
            enabled: true,
            gesturesEnabled: true,
            expressionsEnabled: true,
            lipSyncEnabled: true
          },
          syncConfig: {
            autoTransition: true,
            waitForNarrationComplete: true,
            avatarGesturesEnabled: true,
            lipSyncPrecision: 'high',
            transitionDelay: 1000,
            gestureIntensity: 0.7
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSyncTimeline(data.data.timeline)
        toast.success('Timeline de sincronização gerada!')
      }
      
    } catch (error) {
      console.error('Erro ao gerar timeline:', error)
      toast.error('Erro ao gerar timeline de sincronização')
    }
  }

  // Callbacks do player
  const handleSlideChange = (slideIndex: number, slide: SyncTimeline) => {
    console.log(`🎬 Mudança para slide ${slideIndex + 1}:`, slide.slideId)
  }

  const handleAvatarAction = (action: any) => {
    console.log('🤖 Ação de avatar:', action)
    // Aqui seria enviado comando para o avatar 3D
  }

  const handleNarrationSegment = (segment: any) => {
    console.log('🎤 Segmento de narração:', segment.text)
    // Aqui seria reproduzido o áudio
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Mic className="h-8 w-8 text-blue-600" />
            Sistema de Narração Automática TTS
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Teste completo do sistema de narração automática com vozes brasileiras profissionais, 
            sincronização com avatares 3D e timing inteligente
          </p>
        </div>

        {/* Slides de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Slides de Demonstração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testSlides.map((slide, index) => (
                <div key={slide.id} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{slide.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {slide.duration}s
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {slide.content.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estúdio de Narração */}
        <SlideNarrationStudio
          slides={testSlides}
          onNarrationComplete={handleNarrationComplete}
          syncWithAvatars={true}
          projectId="tts-test-project"
        />

        {/* Player de Timeline */}
        {syncTimeline.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">Player de Sincronização</h3>
              <Badge variant="default">
                <CheckCircle className="w-4 h-4 mr-1" />
                Timeline Ativa
              </Badge>
            </div>
            
            <TimelinePlayer
              timeline={syncTimeline}
              onSlideChange={handleSlideChange}
              onAvatarAction={handleAvatarAction}
              onNarrationSegment={handleNarrationSegment}
            />
          </div>
        )}

        {/* Resultados de Narração */}
        {narrationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Resultados da Narração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                {/* Resumo */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(narrationResults.reduce((sum, r) => sum + r.totalDuration, 0))}s
                    </div>
                    <div className="text-xs text-muted-foreground">Duração Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(narrationResults.reduce((sum, r) => sum + r.quality.pronunciation_score, 0) / narrationResults.length * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Qualidade Média</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {narrationResults.reduce((sum, r) => sum + r.cost, 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Custo Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600">
                      {narrationResults.filter(r => r.segments.length > 0).length}/{narrationResults.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Sucesso</div>
                  </div>
                </div>

                {/* Lista Detalhada */}
                <div className="space-y-2">
                  {narrationResults.map((result, index) => (
                    <div key={result.slideId} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Slide {result.slideNumber}</Badge>
                          <span className="text-sm font-medium">
                            {testSlides[index]?.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {Math.round(result.totalDuration)}s
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {result.segments.length} segmentos
                          </Badge>
                          {result.quality.pronunciation_score > 0.9 && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Alta Qualidade
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <strong>Qualidade:</strong> Pronúncia {(result.quality.pronunciation_score * 100).toFixed(0)}%, 
                        Clareza {(result.quality.clarity_score * 100).toFixed(0)}%, 
                        Naturalidade {(result.quality.emotion_match * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Alert>
          <Headphones className="h-4 w-4" />
          <AlertDescription>
            <strong>Como testar:</strong>
            <br />1. Selecione uma voz brasileira regional no Estúdio de Narração
            <br />2. Configure velocidade e emoção da fala
            <br />3. Clique em "Gerar Narração Automática" 
            <br />4. Use o Player de Sincronização para testar a reprodução com timing preciso
            <br />5. Observe a sincronização entre narração e movimentos de avatar
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

