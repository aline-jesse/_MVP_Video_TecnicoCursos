
'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Settings, Download } from 'lucide-react'
import Link from 'next/link'

export default function Avatares3DPage() {
  const [selectedAvatar, setSelectedAvatar] = React.useState('Executivo')
  const [selectedEnvironment, setSelectedEnvironment] = React.useState('Escritório')

  const handleDemoStart = () => {
    alert('Demonstração iniciada! Avatar 3D carregando...')
  }

  const handleAvatarSelect = (avatarType: string) => {
    setSelectedAvatar(avatarType)
    console.log(`Avatar selecionado: ${avatarType}`)
  }

  const handleEnvironmentSelect = (environment: string) => {
    setSelectedEnvironment(environment)
    console.log(`Ambiente selecionado: ${environment}`)
  }

  const handleStartCreation = () => {
    alert(`Iniciando criação com ${selectedAvatar} no ambiente ${selectedEnvironment}`)
  }

  const handleViewExamples = () => {
    window.open('https://www.youtube.com/watch?v=demo-avatar-3d', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Avatares 3D</h1>
                <p className="text-gray-600 mt-2">
                  Crie apresentações imersivas com avatares 3D realistas
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Em Desenvolvimento
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2 text-purple-600" />
                Preview do Avatar 3D
              </CardTitle>
              <CardDescription>
                Visualize como seu avatar 3D irá aparecer no vídeo final
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Avatar 3D Interativo
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tecnologia avançada de renderização em tempo real
                  </p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleDemoStart}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Demonstração
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                Configurações do Avatar
              </CardTitle>
              <CardDescription>
                Personalize a aparência e comportamento do seu avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Modelo do Avatar
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Executivo', 'Engenheira', 'Técnico', 'Professora'].map((type) => (
                    <Button 
                      key={type}
                      variant={selectedAvatar === type ? "default" : "outline"}
                      className="h-20 flex-col"
                      onClick={() => handleAvatarSelect(type)}
                    >
                      <span className="text-2xl mb-1">
                        {type.includes('a') ? '👩‍💼' : '👨‍💼'}
                      </span>
                      <span className="text-xs">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Voice Settings */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Voz e Narração
                </label>
                <div className="space-y-3">
                  <select className="w-full p-2 border rounded-md">
                    <option>Voz Feminina - Clara (São Paulo)</option>
                    <option>Voz Masculina - Ricardo (Rio de Janeiro)</option>
                    <option>Voz Feminina - Ana (Brasília)</option>
                  </select>
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600">Velocidade</label>
                      <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-600">Tom</label>
                      <input type="range" min="0.5" max="1.5" step="0.1" defaultValue="1" className="w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Ambiente 3D
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Escritório', 'Fábrica', 'Laboratório', 'Auditório'].map((env) => (
                    <Button 
                      key={env} 
                      variant={selectedEnvironment === env ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleEnvironmentSelect(env)}
                    >
                      {env}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎭 Expressões Naturais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Avatares com expressões faciais realistas e sincronização labial perfeita
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🌟 Ambientes Imersivos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Cenários 3D profissionais para diferentes contextos de treinamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Renderização Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Processamento otimizado com qualidade cinema em minutos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <div className="space-x-4">
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleStartCreation}
            >
              <Play className="h-5 w-5 mr-2" />
              Começar Criação
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleViewExamples}
            >
              <Download className="h-5 w-5 mr-2" />
              Ver Exemplos
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Funcionalidade em desenvolvimento - Preview disponível em breve
          </p>
        </div>
      </div>
    </div>
  )
}
