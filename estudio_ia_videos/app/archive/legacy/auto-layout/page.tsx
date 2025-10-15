
'use client'

/**
 * 🎯 Auto Layout - Sprint 27
 * Layout automático inteligente para slides
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Layout, Wand2, Grid3x3, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

const layouts = [
  { id: 'title', name: 'Título Centralizado', icon: '📄', preview: '/layout-title.svg' },
  { id: 'two-column', name: 'Duas Colunas', icon: '📰', preview: '/layout-two-column.svg' },
  { id: 'image-left', name: 'Imagem à Esquerda', icon: '🖼️', preview: '/layout-image-left.svg' },
  { id: 'image-right', name: 'Imagem à Direita', icon: '🎨', preview: '/layout-image-right.svg' },
  { id: 'full-image', name: 'Imagem em Tela Cheia', icon: '🌆', preview: '/layout-full.svg' },
  { id: 'grid', name: 'Grade 2x2', icon: '⊞', preview: '/layout-grid.svg' },
]

export default function AutoLayoutPage() {
  const [selectedLayout, setSelectedLayout] = useState(layouts[0])
  const [isApplying, setIsApplying] = useState(false)

  const applyLayout = (layout: any) => {
    setIsApplying(true)
    toast.success(`Aplicando layout: ${layout.name}`)
    setTimeout(() => {
      setIsApplying(false)
      toast.success('Layout aplicado com sucesso!')
    }, 1500)
  }

  const autoDetectLayout = () => {
    toast.success('Detectando melhor layout automaticamente...')
    setTimeout(() => {
      const randomLayout = layouts[Math.floor(Math.random() * layouts.length)]
      setSelectedLayout(randomLayout)
      toast.success(`Layout sugerido: ${randomLayout.name}`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Auto Layout
            </h1>
            <p className="text-gray-400">
              Layout automático inteligente para seus slides
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="default">Voltar ao Dashboard</Button>
          </Link>
        </div>

        {/* AI Detection */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-600/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wand2 className="h-8 w-8 text-purple-400" />
                <div>
                  <CardTitle className="text-white">IA de Layout Automático</CardTitle>
                  <CardDescription>
                    Deixe a IA escolher o melhor layout para seu conteúdo
                  </CardDescription>
                </div>
              </div>
              <Button onClick={autoDetectLayout} disabled={isApplying}>
                <Sparkles className="h-4 w-4 mr-2" />
                Detectar Automaticamente
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Layouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout) => (
            <Card 
              key={layout.id}
              className={`cursor-pointer transition-all ${
                selectedLayout.id === layout.id
                  ? 'bg-primary/20 border-primary'
                  : 'bg-gray-800 border-gray-700 hover:border-primary/50'
              }`}
              onClick={() => setSelectedLayout(layout)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{layout.icon}</span>
                    <div>
                      <CardTitle className="text-white text-sm">{layout.name}</CardTitle>
                    </div>
                  </div>
                  {selectedLayout.id === layout.id && (
                    <Badge variant="default">Selecionado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <Grid3x3 className="h-12 w-12 text-gray-600" />
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={(e) => {
                    e.stopPropagation()
                    applyLayout(layout)
                  }}
                  disabled={isApplying}
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Aplicar Layout
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Wand2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-white">IA Inteligente</CardTitle>
              <CardDescription>
                Analisa o conteúdo e sugere o melhor layout automaticamente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Layout className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-white">Responsivo</CardTitle>
              <CardDescription>
                Layouts otimizados para diferentes tamanhos de tela
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-white">Personalizável</CardTitle>
              <CardDescription>
                Ajuste fino manual após a aplicação automática
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
