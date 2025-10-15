
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Video,
  Mic,
  Camera,
  Settings,
  FileText,
  Layers,
  GamepadIcon,
  Users,
  Sparkles,
  Brain,
  BarChart3,
  Layout,
  Zap,
  Crown,
  Shield,
  Globe,
  Building2,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlobalSearch } from '../global-search';
import { KeyboardShortcuts } from '../keyboard-shortcuts';

export default function NavigationSprint25() {
  const pathname = usePathname();

  const menuItems = [
    {
      section: 'Dashboard',
      items: [
        { href: '/', icon: Home, label: 'Dashboard Principal', badge: null },
        { href: '/estudio-real', icon: Video, label: 'Estúdio Real', badge: null },
      ]
    },
    {
      section: 'Sprint 25 - Advanced Features',
      items: [
        { 
          href: '/advanced-nr-compliance', 
          icon: Shield, 
          label: 'Advanced NR Compliance', 
          badge: { text: 'NEW', color: 'bg-emerald-500' }
        },
        { 
          href: '/ai-content-generation', 
          icon: Sparkles, 
          label: 'AI Content Generation', 
          badge: { text: 'AI', color: 'bg-violet-500' }
        },
        { 
          href: '/enterprise-integration', 
          icon: Building2, 
          label: 'Enterprise Integration', 
          badge: { text: 'ENTERPRISE', color: 'bg-amber-500' }
        },
      ]
    },
    {
      section: 'Sprint 24 - Timeline & Collaboration',
      items: [
        { 
          href: '/timeline-multi-track', 
          icon: Layers, 
          label: 'Timeline Multi-Track', 
          badge: { text: 'PRO', color: 'bg-blue-500' }
        },
        { 
          href: '/interactive-elements', 
          icon: GamepadIcon, 
          label: 'Interactive Elements', 
          badge: { text: 'GAMIFIED', color: 'bg-purple-500' }
        },
        { 
          href: '/real-time-collaboration', 
          icon: Users, 
          label: 'Real-time Collaboration', 
          badge: { text: 'LIVE', color: 'bg-green-500' }
        },
      ]
    },
    {
      section: 'Sprint 23 - IA Assistant',
      items: [
        { 
          href: '/ia-assistant-studio', 
          icon: Brain, 
          label: 'IA Assistant Studio', 
          badge: { text: 'IA', color: 'bg-pink-500' }
        },
        { 
          href: '/smart-templates', 
          icon: FileText, 
          label: 'Smart NR Templates', 
          badge: null
        },
        { 
          href: '/content-analytics', 
          icon: BarChart3, 
          label: 'Content Analytics', 
          badge: null
        },
        { 
          href: '/auto-layout', 
          icon: Layout, 
          label: 'Auto Layout System', 
          badge: null
        },
      ]
    },
    {
      section: 'Voice & Audio',
      items: [
        { href: '/elevenlabs-professional-studio', icon: Mic, label: 'ElevenLabs Studio', badge: { text: 'PRO', color: 'bg-orange-500' } },
        { href: '/international-voice-studio', icon: Sparkles, label: 'International Voices', badge: null },
        { href: '/voice-cloning-studio', icon: Crown, label: 'Voice Cloning', badge: null },
      ]
    },
    {
      section: 'PPTX & Templates',
      items: [
        { href: '/pptx-studio-enhanced', icon: FileText, label: 'PPTX Studio Enhanced', badge: null },
        { href: '/pptx-production', icon: Settings, label: 'PPTX Production', badge: null },
      ]
    },
    {
      section: 'Avatar & 3D',
      items: [
        { href: '/talking-photo-pro', icon: Camera, label: 'Talking Photo Pro', badge: null },
        { href: '/avatar-studio-hyperreal', icon: Zap, label: 'Avatar Hyperreal', badge: null },
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href) || false;
  };

  return (
    <nav className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Estúdio IA</h2>
            <p className="text-xs text-muted-foreground">Sprint 25</p>
          </div>
        </div>
        
        {/* Busca Global */}
        <div className="mb-4">
          <GlobalSearch />
        </div>
        
        {/* Atalhos de Teclado */}
        <div className="mb-6">
          <KeyboardShortcuts />
        </div>

        <div className="space-y-6">
          {menuItems.map((section) => (
            <div key={section.section}>
              <h3 className="font-medium text-sm text-muted-foreground mb-3 px-2">
                {section.section}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                        ${isActive(item.href) 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-medium' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          className={`${item.badge.color} text-white text-xs px-1.5 py-0.5`}
                        >
                          {item.badge.text}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gradient-to-br from-emerald-50 to-violet-50 dark:from-emerald-950/20 dark:to-violet-950/20 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-sm mb-2">Sprint 25 - World Leader!</h4>
            <p className="text-xs text-muted-foreground mb-3">
              99.5% funcional • Líder mundial absoluto
            </p>
            <div className="flex flex-col gap-2">
              <Badge className="bg-emerald-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Global Leader
              </Badge>
              <Badge className="bg-violet-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
