
'use client'

import React from 'react'
import AppShell from '@/components/layouts/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HelpCircle, ArrowLeft, Book, MessageCircle, Video } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function HelpPage() {
  const handleDocumentacao = () => {
    toast.success('Redirecionando para documentação...')
    // Futura implementação: abrir documentação
    window.open('https://docs.estudioiavideos.com', '_blank')
  }

  const handleVideos = () => {
    toast.success('Redirecionando para vídeos tutoriais...')
    // Futura implementação: abrir vídeos tutoriais
    window.open('https://youtube.com/estudioiavideos', '_blank')
  }

  const handleSuporte = () => {
    toast.success('Abrindo canal de suporte...')
    // Futura implementação: abrir chat de suporte
    window.open('mailto:suporte@estudioiavideos.com', '_blank')
  }

  const handleFAQ = () => {
    toast.success('Carregando FAQ...')
    // Futura implementação: navegar para FAQ
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AppShell 
      title="Ajuda"
      description="Central de ajuda e documentação"
    >
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Central de Ajuda</h1>
          <p className="text-muted-foreground">
            Encontre respostas para suas dúvidas sobre o Estúdio IA
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Guias e Tutoriais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Aprenda a usar todas as funcionalidades da plataforma
              </p>
              <Button onClick={handleDocumentacao}>Acessar Documentação</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Vídeos Tutoriais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Assista a demonstrações práticas das funcionalidades
              </p>
              <Button variant="outline" onClick={handleVideos}>Ver Vídeos</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Suporte Técnico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Entre em contato para suporte personalizado
              </p>
              <Button variant="outline" onClick={handleSuporte}>Contatar Suporte</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                FAQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Respostas para as perguntas mais frequentes
              </p>
              <Button variant="outline" onClick={handleFAQ}>Ver FAQ</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
