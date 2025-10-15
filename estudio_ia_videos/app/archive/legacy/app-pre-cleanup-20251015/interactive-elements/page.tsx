
'use client'

/**
 * 🎮 Interactive Elements - Sprint 27
 * Interactive learning components
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Award,
  Target,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function InteractiveElementsPage() {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)

  const startQuiz = () => {
    // Simulate quiz
    setTimeout(() => {
      setQuizScore(85)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Elementos Interativos
            </h1>
            <p className="text-gray-400">
              Componentes interativos para engajamento em treinamentos
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="default">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        {/* Interactive Video Player */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Play className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-white">Player de Vídeo Interativo</CardTitle>
                  <CardDescription>Player com controles avançados e pontos de interação</CardDescription>
                </div>
              </div>
              <Badge>Beta</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Play className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-gray-400">Preview de vídeo com elementos interativos</p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button variant="outline" size="icon">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon">
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Quiz */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-white">Quiz Interativo</CardTitle>
                  <CardDescription>Avaliação de conhecimento em tempo real</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">Novo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!quizScore ? (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Teste seus conhecimentos
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Complete o quiz para avaliar seu aprendizado
                  </p>
                  <Button onClick={startQuiz}>
                    Iniciar Quiz
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Pontuação: {quizScore}%
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Parabéns! Você completou o quiz com sucesso.
                  </p>
                  <Button onClick={() => setQuizScore(null)} variant="outline">
                    Refazer Quiz
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Hotspots</CardTitle>
              <CardDescription>Pontos clicáveis no vídeo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Adicione áreas clicáveis no vídeo para fornecer informações adicionais ou navegar para outras seções.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Branching</CardTitle>
              <CardDescription>Caminhos de aprendizado</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Crie diferentes caminhos de aprendizado baseados nas escolhas do usuário durante o vídeo.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Gamificação</CardTitle>
              <CardDescription>Pontos e conquistas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Sistema de pontos, badges e ranking para aumentar o engajamento dos usuários.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-white">Em Desenvolvimento</CardTitle>
            <CardDescription>Próximas funcionalidades interativas</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✨ Arrastar e soltar elementos</li>
              <li>✨ Simulações 3D interativas</li>
              <li>✨ Realidade aumentada (AR)</li>
              <li>✨ Colaboração em tempo real</li>
              <li>✨ Analytics de engajamento</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
