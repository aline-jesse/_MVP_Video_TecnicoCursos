
/**
 * 🚀 Estúdio IA de Vídeos - Sprint 9
 * Navegação Especial Sprint 9
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Cloud,
  Smartphone,
  Shield,
  Zap,
  BarChart3,
  Settings,
  Activity,
  Cpu,
  Database,
  Network,
  Lock,
  Bell,
  TrendingUp,
  Eye,
  Mic,
  Sparkles
} from 'lucide-react';

const sprint9Features = [
  {
    id: 'multimodal',
    title: 'IA Multimodal',
    description: 'Computer Vision + Speech + NLP',
    icon: Brain,
    href: '/cloud-native',
    badge: 'NEW',
    color: 'purple'
  },
  {
    id: 'cloud-control',
    title: 'Cloud Native',
    description: 'Microserviços & Kubernetes',
    icon: Cloud,
    href: '/cloud-control',
    badge: 'BETA',
    color: 'blue'
  },
  {
    id: 'mobile-control',
    title: 'Mobile PWA',
    description: 'Offline-first & Sync',
    icon: Smartphone,
    href: '/mobile-control',
    badge: 'NEW',
    color: 'green'
  },
  {
    id: 'security',
    title: 'Zero-Trust',
    description: 'Segurança Enterprise',
    icon: Shield,
    href: '/security-dashboard',
    badge: 'ENTERPRISE',
    color: 'red'
  },
  {
    id: 'ml-ops',
    title: 'MLOps',
    description: 'Analytics Preditiva',
    icon: BarChart3,
    href: '/ml-ops',
    badge: 'AI',
    color: 'indigo'
  },
  {
    id: 'observability',
    title: 'Observabilidade',
    description: 'Monitoramento 360°',
    icon: Activity,
    href: '/observability',
    badge: 'PRO',
    color: 'orange'
  }
];

export default function Sprint9Navigation() {
  const pathname = usePathname();

  const getBadgeVariant = (color: string) => {
    const variants = {
      purple: 'bg-purple-100 text-purple-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return variants[color as keyof typeof variants] || 'default';
  };

  const getIconColor = (color: string) => {
    const colors = {
      purple: 'text-purple-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      indigo: 'text-indigo-600',
      orange: 'text-orange-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Sprint 9 Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Sprint 9 - Cloud Native & IA Multimodal
            </h2>
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Funcionalidades revolucionárias de próxima geração: IA Multimodal, 
            Arquitetura Cloud Native, Zero-Trust Security e Mobile-First Experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sprint9Features.map((feature) => {
            const Icon = feature.icon;
            const isActive = pathname === feature.href;
            
            return (
              <Link key={feature.id} href={feature.href}>
                <div className={`
                  group p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'border-purple-300 bg-white shadow-lg scale-105' 
                    : 'border-gray-200 bg-white/70 hover:border-purple-200 hover:shadow-md hover:scale-102'
                  }
                `}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      p-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-purple-100' 
                        : 'bg-gray-100 group-hover:bg-purple-50'
                      }
                    `}>
                      <Icon className={`h-6 w-6 ${isActive ? 'text-purple-600' : getIconColor(feature.color)}`} />
                    </div>
                    <Badge className={getBadgeVariant(feature.color)}>
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className={`font-semibold ${isActive ? 'text-purple-900' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>

                  {/* Progress Indicator for Active Feature */}
                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <div className="flex items-center justify-between text-xs text-purple-600">
                        <span>Status:</span>
                        <span className="font-semibold">Ativo</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/cloud-native">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Computer Vision</span>
            </Button>
          </Link>
          
          <Link href="/cloud-native">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Speech Analysis</span>
            </Button>
          </Link>
          
          <Link href="/cloud-control">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Cpu className="h-4 w-4" />
              <span>Cluster Status</span>
            </Button>
          </Link>
          
          <Link href="/security-dashboard">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Zero-Trust</span>
            </Button>
          </Link>
          
          <Link href="/mobile-control">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>PWA Sync</span>
            </Button>
          </Link>
          
          <Link href="/ml-ops">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>ML Insights</span>
            </Button>
          </Link>
        </div>

        {/* Sprint 9 Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-purple-600">6</div>
            <div className="text-xs text-gray-600">Microserviços</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-blue-600">5</div>
            <div className="text-xs text-gray-600">Modelos ML</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-green-600">3</div>
            <div className="text-xs text-gray-600">Nodes K8s</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-red-600">99.5%</div>
            <div className="text-xs text-gray-600">Uptime</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-indigo-600">87%</div>
            <div className="text-xs text-gray-600">ML Accuracy</div>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <div className="text-lg font-bold text-orange-600">45ms</div>
            <div className="text-xs text-gray-600">API Latency</div>
          </div>
        </div>
      </div>
    </div>
  );
}
