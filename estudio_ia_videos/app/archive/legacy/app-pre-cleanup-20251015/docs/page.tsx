
'use client'

import React from 'react'
import AppShell from '@/components/layouts/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Book, ArrowLeft, FileText, Video, Code, Users } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function DocsPage() {
  const handleGuia = () => {
    toast.success('Abrindo guia do usuário...')
    // Futura implementação: abrir guia
    window.open('/docs/user-guide', '_blank')
  }

  const handleVideos = () => {
    toast.success('Redirecionando para tutoriais...')
    // Futura implementação: abrir vídeos
    window.open('/docs/videos', '_blank')
  }

  const handleAPI = () => {
    toast.success('Abrindo documentação da API...')
    // Futura implementação: abrir API docs
    window.open('/docs/api', '_blank')
  }

  const handleCasos = () => {
    toast.success('Carregando casos de uso...')
    // Futura implementação: navegar para casos
    window.open('/docs/cases', '_blank')
  }

  return (
    <AppShell 
      title="Documentação"
      description="Documentação completa da plataforma"
    >
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Documentação</h1>
          <p className="text-muted-foreground">
            Guias completos para usar o Estúdio IA de Vídeos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Guia do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Aprenda a usar todas as funcionalidades da plataforma
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Criação de projetos</li>
                <li>• Upload de arquivos PPTX</li>
                <li>• Uso do editor visual</li>
                <li>• Exportação de vídeos</li>
              </ul>
              <Button className="mt-4" onClick={handleGuia}>Ler Guia</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Tutoriais em Vídeo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Vídeos passo a passo das principais funcionalidades
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Introdução à plataforma</li>
                <li>• Canvas Editor avançado</li>
                <li>• Templates NR</li>
                <li>• Talking Photo</li>
              </ul>
              <Button variant="outline" className="mt-4" onClick={handleVideos}>Ver Vídeos</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Documentação técnica para desenvolvedores
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Endpoints disponíveis</li>
                <li>• Autenticação</li>
                <li>• Exemplos de código</li>
                <li>• Rate limits</li>
              </ul>
              <Button variant="outline" className="mt-4" onClick={handleAPI}>Ver API</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Casos de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Exemplos práticos de uso da plataforma
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Treinamentos corporativos</li>
                <li>• Compliance NR</li>
                <li>• Onboarding de funcionários</li>
                <li>• Comunicação interna</li>
              </ul>
              <Button variant="outline" className="mt-4" onClick={handleCasos}>Ver Casos</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
