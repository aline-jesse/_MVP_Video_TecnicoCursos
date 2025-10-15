
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Rocket, 
  Upload, 
  Palette, 
  Mic, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Zap,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface SprintFeature {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'planned'
  progress: number
  icon: React.ReactNode
  daysEstimate: number
  priority: 'critical' | 'high' | 'medium'
  link?: string
}

export default function NextFeaturesPanel() {
  const sprints: SprintFeature[] = [
    {
      id: 'sprint-1',
      title: 'PPTX Upload Production',
      description: 'Sistema real de upload S3 + processamento PptxGenJS',
      status: 'completed',
      progress: 100,
      icon: <Upload className="w-5 h-5" />,
      daysEstimate: 3,
      priority: 'critical',
      link: '/pptx-upload-production'
    },
    {
      id: 'sprint-2',
      title: 'Canvas Editor Profissional',
      description: 'Fabric.js + Timeline com 200+ efeitos',
      status: 'planned',
      progress: 0,
      icon: <Palette className="w-5 h-5" />,
      daysEstimate: 4,
      priority: 'critical'
    },
    {
      id: 'sprint-3',
      title: 'ElevenLabs TTS Premium',
      description: '29 vozes + Voice cloning + Multi-language',
      status: 'planned',
      progress: 0,
      icon: <Mic className="w-5 h-5" />,
      daysEstimate: 3,
      priority: 'critical'
    },
    {
      id: 'sprint-4',
      title: 'Effects Library Hollywood',
      description: 'GSAP + Three.js + Particle Systems',
      status: 'planned',
      progress: 0,
      icon: <Sparkles className="w-5 h-5" />,
      daysEstimate: 4,
      priority: 'high'
    }
  ]

  const getStatusColor = (status: SprintFeature['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: SprintFeature['priority']) => {
    switch (priority) {
      case 'critical': return 'border-red-200 bg-red-50'
      case 'high': return 'border-orange-200 bg-orange-50'
      case 'medium': return 'border-blue-200 bg-blue-50'
    }
  }

  const getStatusIcon = (status: SprintFeature['status']) => {
    switch (status) {
      case 'completed': 
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in-progress': 
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
      case 'planned': 
        return <Target className="w-4 h-4 text-gray-600" />
    }
  }

  const completedSprints = sprints.filter(s => s.status === 'completed').length
  const totalSprints = sprints.length
  const overallProgress = (completedSprints / totalSprints) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Próximas Funcionalidades
          <Badge variant="secondary" className="ml-2">
            Sprint {completedSprints + 1}/{totalSprints}
          </Badge>
        </CardTitle>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Geral do Roadmap</span>
            <span>{completedSprints}/{totalSprints} concluídos</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {sprints.map((sprint) => (
          <div
            key={sprint.id}
            className={`border rounded-lg p-4 ${getPriorityColor(sprint.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-md border">
                  {sprint.icon}
                </div>
                
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {sprint.title}
                    {getStatusIcon(sprint.status)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {sprint.description}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <Badge className={getStatusColor(sprint.status)}>
                  {sprint.status === 'completed' ? 'Concluído' :
                   sprint.status === 'in-progress' ? 'Em Andamento' : 'Planejado'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {sprint.daysEstimate} dias
                </p>
              </div>
            </div>

            {sprint.progress > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progresso</span>
                  <span>{sprint.progress}%</span>
                </div>
                <Progress value={sprint.progress} className="h-1" />
              </div>
            )}

            {sprint.link ? (
              <Link href={sprint.link}>
                <Button variant="outline" size="sm" className="w-full">
                  {sprint.status === 'completed' ? 'Visualizar' : 'Começar Sprint'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="w-full" disabled>
                Em Breve
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        ))}

        {/* Next Action */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Próxima Ação Recomendada
          </h5>
          <p className="text-sm mb-3">
            <strong>Sprint 2: Canvas Editor Profissional</strong> - Implementar 
            Fabric.js com timeline profissional e 200+ efeitos de transição.
          </p>
          
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <Rocket className="w-4 h-4 mr-2" />
              Começar Sprint 2
            </Button>
            <Button variant="outline" size="sm">
              Ver Roadmap Detalhado
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
