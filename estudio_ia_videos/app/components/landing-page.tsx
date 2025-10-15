
'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import LoginDialog from './login-dialog'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Play, 
  Zap, 
  Mic, 
  FileVideo, 
  Users, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'

export default function LandingPage() {
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleLogin = () => {
    setShowLoginDialog(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Estúdio IA</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleLogin}>
                Entrar
              </Button>
              <Button onClick={handleLogin}>
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Revolucionando Treinamentos NRs no Brasil
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Crie Vídeos de<br />Treinamento com IA
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transforme suas apresentações PowerPoint em vídeos profissionais com avatares 3D falantes, 
            narração automática e editor drag-and-drop. Especialmente criado para treinamentos de 
            Normas Regulamentadoras no mercado brasileiro.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" onClick={handleLogin} className="px-8 py-6 text-lg">
              <Play className="w-5 h-5 mr-2" />
              Criar Vídeo Grátis
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg" onClick={handleLogin}>
              <FileVideo className="w-5 h-5 mr-2" />
              Ver Demonstração
            </Button>
          </div>

          {/* Video Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-20 h-20 text-white/80 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">Preview do Vídeo NR-12</p>
                  <p className="text-white/50">Avatar 3D explicando segurança em máquinas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Funcionalidades Revolucionárias</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia de ponta para criar vídeos de treinamento que engajam e educam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Avatares 3D Falantes</CardTitle>
                <CardDescription>
                  Avatares hiper-realistas com vozes em português brasileiro e sotaques regionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Modelos masculinos e femininos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Sincronização labial perfeita
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Gestos naturais automáticos
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileVideo className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Conversão PPTX Automática</CardTitle>
                <CardDescription>
                  Transforme suas apresentações PowerPoint em vídeos profissionais automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Upload direto de PPTX
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Extração automática de conteúdo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Narração automática
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Editor Drag-and-Drop</CardTitle>
                <CardDescription>
                  Interface intuitiva para editar, organizar e personalizar seus vídeos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Timeline visual interativa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Reordenação de slides
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Preview em tempo real
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Vozes Regionais PT-BR</CardTitle>
                <CardDescription>
                  Narração profissional com sotaques e entonações regionais brasileiras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Sotaques regionais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Velocidade ajustável
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Entonação natural
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Templates NRs</CardTitle>
                <CardDescription>
                  Templates pré-configurados para todas as Normas Regulamentadoras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    NR-12, NR-35, NR-33 e mais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Conteúdo pré-aprovado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Atualizações automáticas
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-indigo-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Geração Rápida</CardTitle>
                <CardDescription>
                  Crie vídeos profissionais em minutos, não horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Processamento em nuvem
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Renderização otimizada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Export HD automático
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">O que dizem nossos usuários</h2>
            <p className="text-xl text-gray-600">
              Empresas brasileiras já transformaram seus treinamentos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4">
                  "Reduziu em 80% o tempo de criação dos nossos treinamentos de segurança. 
                  Os avatares são incrivelmente realistas!"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    MR
                  </div>
                  <div>
                    <p className="font-semibold">Maria Rosa</p>
                    <p className="text-sm text-gray-500">Gerente de SST, Petrobras</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4">
                  "Interface super intuitiva. Em 30 minutos já estava criando vídeos 
                  profissionais para nossas NRs."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    JS
                  </div>
                  <div>
                    <p className="font-semibold">João Silva</p>
                    <p className="text-sm text-gray-500">Instrutor, Vale S.A.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4">
                  "Nossos colaboradores ficaram impressionados com a qualidade dos vídeos. 
                  Engajamento aumentou 300%!"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    AC
                  </div>
                  <div>
                    <p className="font-semibold">Ana Costa</p>
                    <p className="text-sm text-gray-500">RH, Ambev</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para revolucionar seus treinamentos?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Junte-se a centenas de empresas brasileiras que já transformaram 
            seus programas de capacitação com IA
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleLogin}
              className="px-8 py-6 text-lg"
            >
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Link href="/test-pptx">
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg border-white text-white hover:bg-white hover:text-blue-600"
              >
                🧪 Testar PPTX
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-blue-200 mt-6">
            Sem cartão de crédito • Setup em 2 minutos • Suporte em português
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Estúdio IA</span>
            </div>
            
            <p className="text-gray-400">
              © 2024 Estúdio IA de Vídeos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  )
}
