
/**
 * 🌍 International Voice Studio
 * 
 * Estúdio de vozes internacionais
 */

'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, Mic, Languages, Sparkles } from 'lucide-react'

export default function InternationalVoiceStudio() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-500" />
          International Voice Studio
        </h1>
        <p className="text-muted-foreground">
          Estúdio de vozes internacionais com suporte a múltiplos idiomas e sotaques
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-purple-500" />
              Múltiplos Idiomas
            </CardTitle>
            <CardDescription>
              Suporte para mais de 40 idiomas e 100+ vozes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Português, Inglês, Espanhol, Francês, Alemão, Italiano, Chinês, Japonês e muito mais
            </p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => window.location.href = '/tts-premium'}
            >
              Explorar Idiomas
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-green-500" />
              Vozes Premium
            </CardTitle>
            <CardDescription>
              Vozes hiper-realistas e naturais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Seleção de vozes masculinas e femininas com diferentes timbres e personalidades
            </p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => window.location.href = '/tts-premium'}
            >
              Testar Vozes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Clonagem de Voz
            </CardTitle>
            <CardDescription>
              Clone sua própria voz em qualquer idioma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tecnologia de clonagem de voz para criar narrações personalizadas
            </p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => window.location.href = '/voice-cloning'}
            >
              Começar Clonagem
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>🚧 Em Desenvolvimento</CardTitle>
            <CardDescription>
              Este módulo está sendo desenvolvido e estará disponível em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Funcionalidades previstas:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Biblioteca completa de vozes internacionais</li>
              <li>Preview de vozes em tempo real</li>
              <li>Ajuste de emoção e estilo de fala</li>
              <li>Clonagem de voz com 30 segundos de áudio</li>
              <li>Tradução automática de scripts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
