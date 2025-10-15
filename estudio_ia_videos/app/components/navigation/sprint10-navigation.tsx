
/**
 * 🚀 Estúdio IA de Vídeos - Sprint 10
 * Navegação Especial Sprint 10
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Trophy,
  Sparkles,
  Link as LinkIcon,
  BarChart3,
  Zap,
  Rocket,
  Crown,
  Heart,
  Brain,
  Palette,
  MessageSquare,
  Bot,
  Calendar,
  Target,
  Eye,
  Activity,
  Settings2
} from 'lucide-react';

const sprint10Features = [
  {
    id: 'collaboration',
    title: 'Colaboração Real-Time',
    description: 'Salas colaborativas, chat e reviews',
    icon: Users,
    href: '/collaboration',
    badge: 'REAL-TIME',
    color: 'blue',
    stats: { rooms: 12, users: 89, messages: 2847 }
  },
  {
    id: 'gamification',
    title: 'Gamificação',
    description: 'Badges, rankings e desafios',
    icon: Trophy,
    href: '/gamification',
    badge: 'ENGAGING',
    color: 'yellow',
    stats: { players: 245, challenges: 15, badges: 67 }
  },
  {
    id: 'ai-generative',
    title: 'IA Generativa',
    description: 'Avatares, cenários e scripts IA',
    icon: Sparkles,
    href: '/ai-generative',
    badge: 'AI-POWERED',
    color: 'purple',
    stats: { avatars: 156, scenarios: 89, scripts: 234 }
  },
  {
    id: 'integrations',
    title: 'Integrações Enterprise',
    description: 'LMS, RH, BI e Webhooks',
    icon: LinkIcon,
    href: '/integrations',
    badge: 'ENTERPRISE',
    color: 'cyan',
    stats: { integrations: 6, webhooks: 12, apis: 8 }
  },
  {
    id: 'behavioral-analytics',
    title: 'Analytics Comportamental',
    description: 'Heatmaps e predições de risco',
    icon: BarChart3,
    href: '/behavioral-analytics',
    badge: 'INSIGHTS',
    color: 'green',
    stats: { insights: 47, predictions: 23, accuracy: '94%' }
  },
  {
    id: 'intelligent-automation',
    title: 'Automação Inteligente',
    description: 'Workflows e agendamento IA',
    icon: Zap,
    href: '/intelligent-automation',
    badge: 'AUTOMATED',
    color: 'violet',
    stats: { automations: 34, tasks: 156, efficiency: '87%' }
  }
];

export default function Sprint10Navigation() {
  const pathname = usePathname();

  const getBadgeVariant = (color: string) => {
    const variants = {
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800',
      cyan: 'bg-cyan-100 text-cyan-800',
      green: 'bg-green-100 text-green-800',
      violet: 'bg-violet-100 text-violet-800'
    };
    return variants[color as keyof typeof variants] || 'default';
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      cyan: 'text-cyan-600',
      green: 'text-green-600',
      violet: 'text-violet-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Sprint 10 Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Rocket className="h-6 w-6 text-violet-600" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Sprint 10 - Colaboração & IA Generativa
            </h2>
            <Crown className="h-6 w-6 text-pink-600" />
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Funcionalidades revolucionárias de próxima geração: Colaboração em tempo real, 
            Gamificação avançada, IA Generativa, Integrações Enterprise, Analytics Comportamental e Automação Inteligente
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprint10Features.map((feature) => {
            const Icon = feature.icon;
            const isActive = pathname === feature.href;
            
            return (
              <Link key={feature.id} href={feature.href}>
                <div className={`
                  group p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'border-violet-300 bg-white shadow-lg scale-105' 
                    : 'border-gray-200 bg-white/70 hover:border-violet-200 hover:shadow-md hover:scale-102'
                  }
                `}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      p-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-violet-100' 
                        : 'bg-gray-100 group-hover:bg-violet-50'
                      }
                    `}>
                      <Icon className={`h-6 w-6 ${isActive ? 'text-violet-600' : getIconColor(feature.color)}`} />
                    </div>
                    <Badge className={getBadgeVariant(feature.color)}>
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className={`font-semibold ${isActive ? 'text-violet-900' : 'text-gray-900'}`}>
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>

                    {/* Feature Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                      {Object.entries(feature.stats).map(([key, value], index) => (
                        <div key={index} className="text-center">
                          <div className={`text-lg font-bold ${getIconColor(feature.color)}`}>
                            {value}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-violet-200">
                      <div className="flex items-center justify-center text-xs text-violet-600">
                        <Activity className="h-3 w-3 mr-1" />
                        <span className="font-semibold">Página Ativa</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/collaboration">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Nova Sala</span>
            </Button>
          </Link>
          
          <Link href="/gamification">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Ver Ranking</span>
            </Button>
          </Link>
          
          <Link href="/ai-generative">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Gerar Avatar</span>
            </Button>
          </Link>
          
          <Link href="/integrations">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4" />
              <span>Conectar API</span>
            </Button>
          </Link>
          
          <Link href="/behavioral-analytics">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Ver Heatmap</span>
            </Button>
          </Link>
          
          <Link href="/intelligent-automation">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>Nova Automação</span>
            </Button>
          </Link>
        </div>

        {/* Sprint 10 Advanced Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-violet-600">6</div>
            <div className="text-xs text-gray-600">Novas Funcionalidades</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-blue-600">89</div>
            <div className="text-xs text-gray-600">Colaboradores Online</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">245</div>
            <div className="text-xs text-gray-600">Participantes Ativos</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-green-600">94.2%</div>
            <div className="text-xs text-gray-600">Precisão IA</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-cyan-600">12</div>
            <div className="text-xs text-gray-600">Integrações</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-purple-600">87%</div>
            <div className="text-xs text-gray-600">Automação</div>
          </div>
        </div>

        {/* Innovation Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-pink-100 rounded-full">
            <Brain className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-800">
              Powered by Advanced AI & Real-time Technologies
            </span>
            <Heart className="h-4 w-4 text-pink-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
