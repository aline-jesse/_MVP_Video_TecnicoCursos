
/**
 * 🎭 Avatar 3D Studio - Página Principal
 * Interface completa para criação de vídeos com avatares 3D hiper-realistas
 */

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  User, 
  Sparkles, 
  FileVideo,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Importação dinâmica para evitar erros de SSR com Three.js
const Avatar3DRenderer = dynamic(() => import('@/components/avatars/Avatar3DRenderer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
});

const AvatarTimelineIntegration = dynamic(() => import('@/components/editor/AvatarTimelineIntegration'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
});

export default function Avatar3DStudioPage() {
  const [activeTab, setActiveTab] = useState('demo');
  const [selectedAvatarId, setSelectedAvatarId] = useState('sarah_executive');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Avatar 3D Studio
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crie vídeos profissionais com avatares 3D hiper-realistas e sincronização labial perfeita
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Lip Sync 95-99%
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              6 Avatares Premium
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <FileVideo className="w-4 h-4 mr-2" />
              Export 4K/8K
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="demo">
                  <User className="w-4 h-4 mr-2" />
                  Demo Interativo
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <Video className="w-4 h-4 mr-2" />
                  Integração Timeline
                </TabsTrigger>
                <TabsTrigger value="gallery">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Galeria de Avatares
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab}>
              {/* Tab: Demo Interativo */}
              <TabsContent value="demo" className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🎭 Demo ao Vivo
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Interaja com o avatar 3D usando os controles abaixo. Rotacione com botão direito, zoom com scroll.
                  </p>
                </div>

                <div className="h-[600px]">
                  <Avatar3DRenderer
                    avatarId={selectedAvatarId}
                    text="Olá! Eu sou um avatar 3D hiper-realista. Posso falar qualquer texto em português com sincronização labial perfeita."
                    showControls={true}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: 'sarah_executive', name: 'Sarah - Executiva' },
                    { id: 'carlos_instructor', name: 'Carlos - Instrutor' },
                    { id: 'ana_medical', name: 'Ana - Médica' },
                    { id: 'ricardo_engineer', name: 'Ricardo - Engenheiro' },
                    { id: 'julia_hr', name: 'Julia - RH' },
                    { id: 'diego_safety', name: 'Diego - Segurança' }
                  ].map(avatar => (
                    <Button
                      key={avatar.id}
                      variant={selectedAvatarId === avatar.id ? "default" : "outline"}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className="w-full"
                    >
                      {avatar.name}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Tab: Integração Timeline */}
              <TabsContent value="timeline" className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🎬 Editor de Timeline
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Adicione avatares ao seu projeto. Eles serão sincronizados perfeitamente com a linha do tempo.
                  </p>
                </div>

                <AvatarTimelineIntegration
                  onClipAdded={(clip) => {
                    console.log('Clip adicionado:', clip);
                    toast.success('Avatar adicionado ao projeto!');
                  }}
                  onClipRemoved={(clipId) => {
                    console.log('Clip removido:', clipId);
                  }}
                />
              </TabsContent>

              {/* Tab: Galeria */}
              <TabsContent value="gallery" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: 'sarah_executive',
                      name: 'Sarah - Executiva',
                      description: 'Profissional corporativa, ideal para apresentações empresariais',
                      accuracy: 98,
                      expressions: 47,
                      image: 'https://cdn.abacus.ai/images/dd359ad5-040c-486a-8059-9ff2df7c493b.png'
                    },
                    {
                      id: 'carlos_instructor',
                      name: 'Carlos - Instrutor',
                      description: 'Educador experiente, perfeito para treinamentos',
                      accuracy: 96,
                      expressions: 52,
                      image: 'https://trainingfortime.com/wp-content/uploads/2021/06/Carlos.jpg.webp'
                    },
                    {
                      id: 'ana_medical',
                      name: 'Ana - Médica',
                      description: 'Profissional de saúde, ideal para conteúdo médico',
                      accuracy: 97,
                      expressions: 43,
                      image: 'https://i.pinimg.com/474x/ac/a4/90/aca4904e992fe9349cb4c4a9441a5f18.jpg'
                    },
                    {
                      id: 'ricardo_engineer',
                      name: 'Ricardo - Engenheiro',
                      description: 'Especialista técnico em segurança do trabalho',
                      accuracy: 95,
                      expressions: 38,
                      image: 'https://images.pexels.com/photos/13801505/pexels-photo-13801505.jpeg'
                    },
                    {
                      id: 'julia_hr',
                      name: 'Julia - RH',
                      description: 'Acolhedora e profissional, ideal para onboarding',
                      accuracy: 99,
                      expressions: 56,
                      image: 'https://i.pinimg.com/736x/f9/dc/00/f9dc0000af3b4d64fbd3ee6d66f4fe4b.jpg'
                    },
                    {
                      id: 'diego_safety',
                      name: 'Diego - Segurança',
                      description: 'Especialista em NRs e procedimentos de segurança',
                      accuracy: 94,
                      expressions: 34,
                      image: 'https://i.pinimg.com/736x/44/d3/f8/44d3f8e71210c526e01f14ec840e8516.jpg'
                    }
                  ].map(avatar => (
                    <Card key={avatar.id} className="overflow-hidden hover:shadow-lg transition">
                      <div className="aspect-square bg-gray-200 relative">
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{avatar.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{avatar.description}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Lip Sync: {avatar.accuracy}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {avatar.expressions} expressões
                          </Badge>
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedAvatarId(avatar.id);
                            setActiveTab('demo');
                          }}
                          className="w-full"
                          size="sm"
                        >
                          Ver Demo
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Renderização 3D Real</h3>
              <p className="text-sm text-gray-600">
                Three.js + React Three Fiber para renderização de alta qualidade com iluminação profissional
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Sincronização Labial IA</h3>
              <p className="text-sm text-gray-600">
                Análise de fonemas português BR com precisão de 95-99% e blend shapes naturais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Export Profissional</h3>
              <p className="text-sm text-gray-600">
                Exportação em HD, 4K e 8K com controle total de FPS, resolução e qualidade
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
