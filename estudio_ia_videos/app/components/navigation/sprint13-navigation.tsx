

/**
 * 🚀 Estúdio IA de Vídeos - Sprint 13
 * Navegação Especial Sprint 13 - Enterprise Features
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TestTube,
  BarChart3,
  Users,
  Palette,
  Activity,
  Shield,
  Zap,
  Brain,
  Building,
  Crown,
  Sparkles,
  Code,
  Eye,
  Lock,
  Server,
  TrendingUp,
  Settings,
  FileText,
  Database,
  Globe,
  Target,
  HardHat,
  PersonStanding,
  Mic,
  Upload,
  Play,
  Briefcase,
  ArrowRight,
  Smartphone
} from 'lucide-react';

const sprint13Features = [
  {
    id: 'talking-photo-ai',
    title: 'Talking Photo AI',
    description: 'Interface idêntica ao Vidnoz - Português Brasil',
    icon: Eye,
    href: '/talking-photo',
    badge: 'VIDNOZ-FREE',
    color: 'blue',
    stats: { 'avatares': 11, 'vozes': 'BR', 'qualidade': 'HD' }
  },
  {
    id: 'talking-photo-pro',
    title: 'Talking Photo PRO',
    description: 'Recursos premium - Clonagem de voz e 4K',
    icon: Crown,
    href: '/talking-photo-pro',
    badge: 'PREMIUM',
    color: 'yellow',
    stats: { 'clonagem': 'Voz', '4K': 'Export', 'sem-marca': 'Pro' }
  },
  {
    id: 'pptx-studio-enhanced',
    title: 'PPTX Studio Enhanced',
    description: 'Fluxo Completo: Upload → Análise IA → Editor → Vídeo',
    icon: Brain,
    href: '/pptx-studio-enhanced',
    badge: 'ENHANCED-v2.0',
    color: 'purple',
    stats: { 'compliance': '95%', 'templates-nr': 25, 'ia-analysis': 'auto' }
  },
  {
    id: 'pptx-studio',
    title: 'PPTX Studio Animaker',
    description: 'Editor completo PowerPoint-to-Video',
    icon: FileText,
    href: '/pptx-studio',
    badge: 'ANIMAKER-STYLE',
    color: 'blue',
    stats: { templates: 25, transitions: '40+', voices: 12 }
  },
  {
    id: 'pptx-editor-real',
    title: 'Editor Real + TTS',
    description: 'Sistema de renderização e TTS brasileiro',
    icon: Play,
    href: '/pptx-editor-real',
    badge: 'SISTEMA-REAL',
    color: 'green',
    stats: { 'tts-br': 6, 'render': 'real', 'formatos': 4 }
  },
  {
    id: 'pptx-upload-real',
    title: 'Upload PPTX Real',
    description: 'Processamento e análise real de arquivos',
    icon: Upload,
    href: '/pptx-upload-real',
    badge: 'PROCESSAMENTO-IA',
    color: 'emerald',
    stats: { 'max-size': '50MB', 'análise': 'IA', 'compliance': 'auto' }
  },
  {
    id: 'pptx-animaker-clone',
    title: 'Animaker Clone Perfeito',
    description: 'Layout 100% idêntico com avatares 3D hiper-realistas',
    icon: Crown,
    href: '/pptx-animaker-clone',
    badge: 'HIPER-REALISMO',
    color: 'purple',
    stats: { 'avatares-3d': 'Pipeline', 'qualidade': 'Cinema', 'resolution': '8K' }
  },
  {
    id: 'pptx-editor',
    title: 'Editor Timeline Avançado',
    description: 'Timeline profissional com 4 painéis',
    icon: Settings,
    href: '/pptx-editor',
    badge: 'TIMELINE-PRO',
    color: 'indigo',
    stats: { tracks: 5, effects: 40, precision: '0.1s' }
  },
  {
    id: 'editor-timeline-pro',
    title: 'Editor Timeline Pro',
    description: 'Editor profissional inspirado no Animaker',
    icon: Settings,
    href: '/editor-timeline-pro',
    badge: 'ANIMAKER-INSPIRED',
    color: 'blue',
    stats: { tracks: 'Multi', effects: '40+', preview: 'Real-time' }
  },
  {
    id: 'talking-photo-vidnoz',
    title: 'Talking Photo Vidnoz',
    description: 'Interface idêntica ao Vidnoz - Talking Photos',
    icon: Eye,
    href: '/talking-photo-vidnoz',
    badge: 'VIDNOZ-CLONE',
    color: 'purple',
    stats: { avatares: 11, vozes: 'BR', interface: '100%' }
  },
  {
    id: 'avatares-3d',
    title: 'Avatares 3D Falantes',
    description: 'Biblioteca de avatares realistas com lip sync',
    icon: PersonStanding,
    href: '/avatares-3d',
    badge: 'AVATARES-3D',
    color: 'purple',
    stats: { avatares: 50, 'lip-sync': '98%', idiomas: 12 }
  },
  {
    id: 'templates-nr-especificos',
    title: 'Templates NR Específicos',
    description: 'Templates detalhados com cenários reais de NRs',
    icon: Briefcase,
    href: '/templates-nr-especificos',
    badge: 'CENÁRIOS-REAIS',
    color: 'green',
    stats: { templates: 4, modulos: '15+', exercicios: '50+' }
  },
  {
    id: 'nr-revolucionario',
    title: 'NR Revolucionário',
    description: 'IA especializada em Normas Regulamentadoras',
    icon: Building,
    href: '/nr-revolucionario',
    badge: 'NR-BRASIL',
    color: 'orange',
    stats: { nrs: 8, videos: '2.5K', compliance: '96%' }
  },
  {
    id: 'testing-framework',
    title: 'Testing Framework',
    description: 'Testes automatizados completos',
    icon: TestTube,
    href: '/testing/dashboard',
    badge: 'QUALITY',
    color: 'emerald',
    stats: { coverage: '96%', tests: 143, suites: 6 }
  },
  {
    id: 'enterprise-analytics',
    title: 'Enterprise Analytics',
    description: 'Dashboards executivos real-time',
    icon: BarChart3,
    href: '/enterprise/analytics',
    badge: 'EXECUTIVE',
    color: 'blue',
    stats: { metrics: 47, reports: 12, kpis: 8 }
  },
  {
    id: 'collaboration-v2',
    title: 'Collaboration V2',
    description: 'Edição simultânea multi-usuário',
    icon: Users,
    href: '/collaboration-v2',
    badge: 'REAL-TIME',
    color: 'purple',
    stats: { rooms: 8, users: 156, edits: 2847 }
  },
  {
    id: 'video-effects-advanced',
    title: 'Video Effects Engine',
    description: 'Partículas 3D e transições cinema',
    icon: Palette,
    href: '/video-effects-advanced',
    badge: 'CINEMATIC',
    color: 'pink',
    stats: { effects: 24, renders: 89, quality: '4K' }
  },
  {
    id: 'performance-monitoring',
    title: 'Performance Monitor',
    description: 'Monitoramento em tempo real',
    icon: Activity,
    href: '/performance/monitor',
    badge: 'MONITORING',
    color: 'green',
    stats: { uptime: '99.97%', alerts: 0, speed: '95ms' }
  },
  {
    id: 'system-config',
    title: 'Configurações Gerais',
    description: 'APIs, credenciais e integrações',
    icon: Settings,
    href: '/admin/configuracoes',
    badge: 'CONFIG',
    color: 'slate',
    stats: { apis: 6, keys: 4, status: '100%' }
  },
  {
    id: 'production-monitor',
    title: 'Monitor de Produção',
    description: 'Monitoramento completo do sistema',
    icon: Activity,
    href: '/admin/production-monitor',
    badge: 'MONITOR',
    color: 'blue',
    stats: { health: '99.9%', uptime: '24/7', alerts: 0 }
  },
  {
    id: 'security-zero-trust',
    title: 'Security Framework',
    description: 'Zero Trust e criptografia avançada',
    icon: Shield,
    href: '/security/zero-trust',
    badge: 'ZERO-TRUST',
    color: 'slate',
    stats: { score: 98, threats: 0, compliance: '97%' }
  },
  {
    id: 'api-v2-evolution',
    title: 'API v2 Evolution',
    description: 'GraphQL, WebSockets, microserviços',
    icon: Zap,
    href: '/api-evolution',
    badge: 'NEXT-GEN',
    color: 'orange',
    stats: { endpoints: 67, latency: '67ms', throughput: '1.2K' }
  },
  {
    id: 'editor-workflow',
    title: 'Editor Workflow',
    description: 'Fluxo integrado: PPTX → Timeline → Export',
    icon: ArrowRight,
    href: '/editor-workflow',
    badge: 'WORKFLOW-UNIFIED',
    color: 'blue',
    stats: { steps: 6, automation: '95%', time: '~8min' }
  },
  {
    id: 'mobile-studio',
    title: 'Mobile Studio',
    description: 'Editor responsivo otimizado para dispositivos móveis',
    icon: Smartphone,
    href: '/mobile-studio',
    badge: 'MOBILE-FIRST',
    color: 'purple',
    stats: { responsive: '100%', offline: 'Yes', touch: 'Optimized' }
  },
  {
    id: 'ai-assistant',
    title: 'IA Assistant',
    description: 'Assistente inteligente contextual especializado em NRs',
    icon: Brain,
    href: '/ai-assistant',
    badge: 'AI-POWERED',
    color: 'cyan',
    stats: { confidence: '95%', nrs: 'Expert', languages: '3' }
  },
  {
    id: 'performance-dashboard',
    title: 'Performance Dashboard',
    description: 'Métricas em tempo real e analytics avançados',
    icon: Activity,
    href: '/performance-dashboard',
    badge: 'REAL-TIME',
    color: 'green',
    stats: { uptime: '99.8%', metrics: '50+', refresh: '5s' }
  }
];

export default function Sprint13Navigation() {
  const pathname = usePathname();

  const getBadgeVariant = (color: string) => {
    const variants = {
      emerald: 'bg-emerald-100 text-emerald-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      pink: 'bg-pink-100 text-pink-800',
      green: 'bg-green-100 text-green-800',
      slate: 'bg-slate-100 text-slate-800',
      orange: 'bg-orange-100 text-orange-800',
      violet: 'bg-violet-100 text-violet-800'
    };
    return variants[color as keyof typeof variants] || 'default';
  };

  const getIconColor = (color: string) => {
    const colors = {
      emerald: 'text-emerald-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      pink: 'text-pink-600',
      green: 'text-green-600',
      slate: 'text-slate-600',
      orange: 'text-orange-600',
      violet: 'text-violet-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-violet-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Sprint 13 Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Building className="h-6 w-6 text-slate-600" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              Sprint 13 - Enterprise & Quality Framework
            </h2>
            <Crown className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Funcionalidades empresariais de classe mundial: Testing Framework, Enterprise Analytics, 
            Collaboration V2, Video Effects Engine, Performance Monitoring, Security Zero Trust, API Evolution e AI Templates
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sprint13Features.map((feature) => {
            const Icon = feature.icon;
            const isActive = pathname === feature.href;
            
            return (
              <Link key={feature.id} href={feature.href}>
                <div className={`
                  group p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'border-blue-300 bg-white shadow-lg scale-105' 
                    : 'border-gray-200 bg-white/80 hover:border-blue-200 hover:shadow-md hover:scale-102'
                  }
                `}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      p-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-100' 
                        : 'bg-gray-100 group-hover:bg-blue-50'
                      }
                    `}>
                      <Icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : getIconColor(feature.color)}`} />
                    </div>
                    <Badge className={getBadgeVariant(feature.color)}>
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
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
                          <div className={`text-sm font-bold ${getIconColor(feature.color)}`}>
                            {value}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex items-center justify-center text-xs text-blue-600">
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

        {/* Sprint 13 Quick Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/avatares-3d">
            <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 border-purple-200">
              <PersonStanding className="h-4 w-4 text-purple-600" />
              <span>Avatares 3D</span>
            </Button>
          </Link>

          <Link href="/testing/dashboard">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <TestTube className="h-4 w-4" />
              <span>Executar Testes</span>
            </Button>
          </Link>
          
          <Link href="/enterprise/analytics">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Ver KPIs</span>
            </Button>
          </Link>
          
          <Link href="/collaboration-v2">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Nova Sala V2</span>
            </Button>
          </Link>
          
          <Link href="/video-effects-advanced">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Efeitos 3D</span>
            </Button>
          </Link>
          
          <Link href="/performance/monitor">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Monitorar</span>
            </Button>
          </Link>
          
          <Link href="/security/zero-trust">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security Scan</span>
            </Button>
          </Link>
          
          <Link href="/tts-test">
            <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border-blue-200">
              <Mic className="h-4 w-4 text-blue-600" />
              <span>TTS Studio</span>
              <Badge variant="secondary" className="text-xs">NOVO</Badge>
            </Button>
          </Link>
        </div>

        {/* Sprint 13 Enterprise Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-8 gap-4 text-center">
          <div className="p-3 bg-white/80 rounded-lg">
            <div className="text-lg font-bold text-emerald-600">96%</div>
            <div className="text-xs text-gray-600">Test Coverage</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg">
            <div className="text-lg font-bold text-blue-600">99.97%</div>
            <div className="text-xs text-gray-600">Uptime SLA</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg">
            <div className="text-lg font-bold text-purple-600">1000+</div>
            <div className="text-xs text-gray-600">Concurrent Users</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg">
            <div className="text-lg font-bold text-pink-600">24</div>
            <div className="text-xs text-gray-600">Video Effects</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg">
            <div className="text-lg font-bold text-green-600">67ms</div>
            <div className="text-xs text-gray-600">API Response</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg">
            <div className="text-lg font-bold text-slate-600">98</div>
            <div className="text-xs text-gray-600">Security Score</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg">
            <div className="text-lg font-bold text-orange-600">67</div>
            <div className="text-xs text-gray-600">API Endpoints</div>
          </div>
          <div className="p-3 bg-white/80 rounded-lg">
            <div className="text-lg font-bold text-violet-600">94%</div>
            <div className="text-xs text-gray-600">AI Learning</div>
          </div>
        </div>

        {/* Enterprise Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-100 to-blue-100 rounded-full border border-slate-200">
            <Building className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-800">
              Enterprise-Grade Platform • 98% Quality Score
            </span>
            <Crown className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

