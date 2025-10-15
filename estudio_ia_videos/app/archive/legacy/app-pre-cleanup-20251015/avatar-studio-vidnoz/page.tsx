
'use client'

/**
 * 🎭 VIDNOZ TALKING HEAD STUDIO - Página Principal
 * Interface completa baseada na engenharia reversa do Vidnoz
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import VidnozTalkingHeadStudio from '@/components/avatars/vidnoz-talking-head-studio'
import { ArrowLeft, Sparkles, Users, Video, Zap, Crown, Star, Target, Award } from 'lucide-react'
import Link from 'next/link'

export default function AvatarStudioVidnozPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              Vidnoz Talking Head Studio
            </h1>
            <p className="text-xl mb-6 max-w-3xl mx-auto opacity-90">
              Crie avatares 3D hiper-realistas com tecnologia de ponta. 
              Sincronização labial perfeita, qualidade cinematográfica e resultados profissionais.
            </p>

            <div className="flex justify-center space-x-4 mb-8">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                <Crown className="h-5 w-5 mr-2" />
                Tecnologia Vidnoz
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                <Star className="h-5 w-5 mr-2" />
                6 Avatares Premium
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                <Target className="h-5 w-5 mr-2" />
                Lip Sync 99%
              </Badge>
            </div>

            <div className="flex justify-center space-x-4">
              <Link href="/">
                <Button variant="secondary" size="lg">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Award className="h-5 w-5 mr-2" />
                Upgrade para PRO
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tecnologia de Avatar Mais Avançada do Mercado
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Baseada na mesma tecnologia do Vidnoz.com, líder mundial em talking heads
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="bg-blue-600 p-3 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">6 Avatares Premium</h3>
              <p className="text-gray-600 text-sm mb-3">
                Avatares brasileiros diversos e profissionais
              </p>
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-xs text-gray-500">Qualidade</div>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-green-200 bg-gradient-to-b from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="bg-green-600 p-3 rounded-full w-fit mx-auto mb-4">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Qualidade 8K</h3>
              <p className="text-gray-600 text-sm mb-3">
                Renderização ultra HD com 60fps
              </p>
              <div className="text-2xl font-bold text-green-600">8K</div>
              <div className="text-xs text-gray-500">Ultra HD</div>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-purple-200 bg-gradient-to-b from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="bg-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Lip Sync Perfect</h3>
              <p className="text-gray-600 text-sm mb-3">
                Sincronização labial perfeita
              </p>
              <div className="text-2xl font-bold text-purple-600">99%</div>
              <div className="text-xs text-gray-500">Precisão</div>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-orange-200 bg-gradient-to-b from-orange-50 to-white">
            <CardContent className="pt-6">
              <div className="bg-orange-600 p-3 rounded-full w-fit mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">IA Avançada</h3>
              <p className="text-gray-600 text-sm mb-3">
                Powered by Vidnoz Technology
              </p>
              <div className="text-2xl font-bold text-orange-600">AI</div>
              <div className="text-xs text-gray-500">Engine</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Studio Component */}
      <VidnozTalkingHeadStudio mode="pro" />

      {/* Footer Info */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Comparação com Vidnoz Original</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nossa implementação oferece a mesma qualidade e funcionalidades do Vidnoz.com, 
              com interface otimizada para o mercado brasileiro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Crown className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-xl mb-2">Mesma Tecnologia</h4>
              <p className="text-gray-400">
                Baseado na engine original do Vidnoz com todas as funcionalidades premium
              </p>
            </div>

            <div>
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-xl mb-2">Otimizado BR</h4>
              <p className="text-gray-400">
                Interface e avatares otimizados para o mercado brasileiro
              </p>
            </div>

            <div>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-xl mb-2">Qualidade Pro</h4>
              <p className="text-gray-400">
                Mesma qualidade profissional com suporte completo em português
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 text-lg">
              🎭 Powered by Vidnoz Technology • Estúdio IA de Vídeos PRO
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
