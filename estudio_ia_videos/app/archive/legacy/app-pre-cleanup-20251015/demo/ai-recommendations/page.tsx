
/**
 * 🧪 Demo: AI Recommendations
 */

'use client'

import { useState } from 'react'
import { AIRecommendationsPanel } from '@/components/ai/ai-recommendations-panel'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AIRecommendationsDemo() {
  const [slides, setSlides] = useState([
    {
      title: 'Introdução à NR12',
      content: 'A Norma Regulamentadora 12 estabelece requisitos mínimos para segurança em máquinas.',
      notes: 'Incluir casos práticos'
    },
    {
      title: 'Proteções em Máquinas',
      content: 'Tipos de proteções: fixas, móveis e dispositivos de segurança.',
      notes: ''
    },
  ])
  const [targetAudience, setTargetAudience] = useState('Operadores de máquinas industriais')
  const [duration, setDuration] = useState(60)
  const [nr, setNr] = useState('NR12')

  const addSlide = () => {
    setSlides([
      ...slides,
      { title: 'Novo Slide', content: 'Conteúdo do slide', notes: '' }
    ])
  }

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setSlides(newSlides)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 AI Content Recommendations</h1>
        <p className="text-muted-foreground">
          Demonstração de recomendações inteligentes de conteúdo usando LLM
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Treinamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Norma Regulamentadora</Label>
                <Input
                  value={nr}
                  onChange={(e) => setNr(e.target.value)}
                  placeholder="Ex: NR12"
                />
              </div>
              <div>
                <Label>Público-Alvo</Label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Descreva o público-alvo"
                />
              </div>
              <div>
                <Label>Duração (minutos)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slides do Treinamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {slides.map((slide, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <Input
                    value={slide.title}
                    onChange={(e) => updateSlide(index, 'title', e.target.value)}
                    placeholder="Título do slide"
                    className="font-semibold"
                  />
                  <Textarea
                    value={slide.content}
                    onChange={(e) => updateSlide(index, 'content', e.target.value)}
                    placeholder="Conteúdo do slide"
                    rows={3}
                  />
                  <Input
                    value={slide.notes}
                    onChange={(e) => updateSlide(index, 'notes', e.target.value)}
                    placeholder="Notas (opcional)"
                  />
                </div>
              ))}
              <Button onClick={addSlide} variant="outline" className="w-full">
                + Adicionar Slide
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recomendações */}
        <div>
          <AIRecommendationsPanel
            slides={slides}
            targetAudience={targetAudience}
            duration={duration}
            nr={nr}
            onApplyRecommendation={(rec) => {
              console.log('Aplicar recomendação:', rec)
            }}
          />
        </div>
      </div>
    </div>
  )
}
