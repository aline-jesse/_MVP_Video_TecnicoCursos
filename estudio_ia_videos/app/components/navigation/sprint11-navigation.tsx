
/**
 * 🚀 Estúdio IA de Vídeos - Sprint 11
 * Navegação para funcionalidades de nova geração
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Mic,
  Globe,
  Smartphone,
  Shield,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';

const sprint11Features = [
  {
    id: 'ai-advanced',
    name: 'IA Generativa Avançada',
    description: 'GPT-4o, Claude, Llama para criação de conteúdo',
    href: '/ai-advanced',
    icon: Brain,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'from-purple-50 to-indigo-50',
    status: 'new'
  },
  {
    id: 'voice-cloning',
    name: 'Voice Cloning',
    description: 'Clone sua voz com IA para narrações personalizadas',
    href: '/voice-cloning',
    icon: Mic,
    color: 'from-pink-500 to-purple-500',
    bgColor: 'from-pink-50 to-purple-50',
    status: 'new'
  },
  {
    id: '3d-environments-advanced',
    name: '3D Environments Imersivos',
    description: 'Cenários virtuais interativos e realistas',
    href: '/3d-environments-advanced',
    icon: Globe,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'from-indigo-50 to-blue-50',
    status: 'new'
  },
  {
    id: 'mobile-native',
    name: 'App Mobile Nativo',
    description: 'PWA+ com funcionalidades offline completas',
    href: '/mobile-native',
    icon: Smartphone,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    status: 'new'
  }
];

export default function Sprint11Navigation() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3">
          <Sparkles className="h-7 w-7 text-purple-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Sprint 11 - Nova Geração
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Funcionalidades revolucionárias com IA de última geração, voice cloning e ambientes 3D
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sprint11Features.map((feature) => {
          const IconComponent = feature.icon;
          const isActive = pathname === feature.href;
          
          return (
            <Link key={feature.id} href={feature.href}>
              <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                isActive ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-lg'
              }`}>
                <CardContent className="p-0">
                  {/* Background Gradient */}
                  <div className={`h-24 bg-gradient-to-br ${feature.bgColor} relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <div className="absolute top-3 right-3">
                      {feature.status === 'new' && (
                        <Badge className="bg-yellow-500 text-yellow-900 text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          NOVO
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <div className={`p-2 rounded-lg bg-white/90 shadow-sm`}>
                        <IconComponent className={`h-6 w-6 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className={`font-semibold mb-2 ${
                      isActive ? 'text-purple-700' : 'text-gray-900 group-hover:text-purple-600'
                    } transition-colors`}>
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">🚀 Sprint 11 Ativo</h3>
              <p className="text-purple-100">
                Explore as funcionalidades mais avançadas do Estúdio IA
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge className="bg-white/20 text-white">
                <Zap className="h-3 w-3 mr-1" />
                5 Features
              </Badge>
              <Badge className="bg-white/20 text-white">
                <Star className="h-3 w-3 mr-1" />
                Novidade
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
