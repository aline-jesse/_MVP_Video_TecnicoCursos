
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  ArrowLeft,
  Book,
  Video,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Bot,
} from 'lucide-react'
import { HelpCenterAI } from '@/lib/support/help-center-ai'

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [chatOpen, setChatOpen] = useState(false)

  const categories = [
    {
      name: 'Primeiros Passos',
      icon: Book,
      articles: 12,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Funcionalidades',
      icon: TrendingUp,
      articles: 28,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'Resolução de Problemas',
      icon: HelpCircle,
      articles: 15,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      name: 'Faturamento',
      icon: MessageCircle,
      articles: 8,
      color: 'bg-green-100 text-green-600',
    },
  ]

  const popularArticles = HelpCenterAI.searchArticles('', 4)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = HelpCenterAI.searchArticles(searchQuery)
      console.log('Search results:', results)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>

          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Como podemos ajudar?
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Encontre respostas, tutoriais e suporte especializado
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar na central de ajuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card
                key={category.name}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div className={`h-12 w-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.articles} artigos</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Artigos Populares</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold flex-1">{article.title}</h3>
                    <Badge variant="secondary" className="ml-2">
                      {article.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {article.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {article.helpful}
                      </span>
                      <span>{article.views} visualizações</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6 text-center">
              <Book className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Documentação</h3>
              <p className="text-sm text-gray-600 mb-4">
                Guias técnicos completos
              </p>
              <Button variant="outline" size="sm">
                Acessar Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6 text-center">
              <Video className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Vídeo Tutoriais</h3>
              <p className="text-sm text-gray-600 mb-4">
                Aprenda assistindo
              </p>
              <Button variant="outline" size="sm">
                Ver Vídeos
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Suporte Técnico</h3>
              <p className="text-sm text-gray-600 mb-4">
                Fale com especialistas
              </p>
              <Button variant="outline" size="sm">
                Abrir Ticket
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Chatbot CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="pt-6 text-center">
            <Bot className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Converse com nosso Assistente IA
            </h2>
            <p className="text-blue-100 mb-6">
              Obtenha respostas instantâneas treinadas em toda nossa documentação
            </p>
            <Button
              onClick={() => setChatOpen(true)}
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 p-0"
          title="Chat com IA"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm">Assistente IA</CardTitle>
                  <p className="text-xs text-gray-500">Online agora</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatOpen(false)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm">
                      Olá! 👋 Sou o Assistente IA do Estúdio. Como posso ajudá-lo hoje?
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input placeholder="Digite sua dúvida..." />
                <Button size="sm">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
