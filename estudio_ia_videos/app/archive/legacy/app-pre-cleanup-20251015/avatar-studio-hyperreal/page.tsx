
'use client'

/**
 * 🎭 Avatar Studio Hiper-realista - Página Principal
 * Sistema completo baseado em tecnologia Vidnoz
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import HyperRealAvatarStudio from '@/components/avatars/hyperreal-avatar-studio'
import { ArrowLeft, Sparkles, Users, Video, Zap } from 'lucide-react'
import Link from 'next/link'

export default function AvatarStudioHyperrealPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Avatar Studio Hiper-realista
                </h1>
                <p className="text-gray-600">Powered by Vidnoz Technology</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-purple-700 bg-purple-100">
                🎭 6 Avatares Premium
              </Badge>
              <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                ⚡ Renderização 4K
              </Badge>
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                🚀 Lip Sync 99%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Crie Avatares 3D Hiper-realistas
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Tecnologia avançada de avatar falante com sincronização labial perfeita, 
            expressões faciais realistas e qualidade até 8K para vídeos profissionais.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="text-center border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-bold text-lg mb-2">6 Avatares Premium</h3>
                <p className="text-gray-600 text-sm">
                  Avatares brasileiros diversos, profissionais e hiper-realistas
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <Video className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-bold text-lg mb-2">Qualidade 8K</h3>
                <p className="text-gray-600 text-sm">
                  Renderização ultra HD com 60fps para máxima qualidade
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-bold text-lg mb-2">Lip Sync 99%</h3>
                <p className="text-gray-600 text-sm">
                  Sincronização labial perfeita com 47-56 expressões faciais
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Studio */}
        <HyperRealAvatarStudio />
      </div>

      {/* Tech Specs Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Especificações Técnicas</h3>
            <p className="text-gray-400">
              Tecnologia de ponta para resultados profissionais
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">95-99%</div>
              <div className="text-gray-300">Precisão Lip Sync</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">34-56</div>
              <div className="text-gray-300">Expressões Faciais</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">8K</div>
              <div className="text-gray-300">Resolução Máxima</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">60FPS</div>
              <div className="text-gray-300">Taxa de Quadros</div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Badge variant="outline" className="text-white border-white/50">
              🎭 Powered by Vidnoz Technology • Estúdio IA de Vídeos
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
