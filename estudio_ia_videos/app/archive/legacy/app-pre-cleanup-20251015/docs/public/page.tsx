
/**
 * 📚 SPRINT 39 - Public Documentation
 * Documentação pública para novos usuários
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
  Book,
  Video,
  Zap,
  Shield,
  Users,
  FileText,
  HelpCircle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Documentação - Estúdio IA de Vídeos',
  description: 'Aprenda a criar vídeos profissionais de treinamento em segurança do trabalho',
};

export default function PublicDocsPage() {
  const sections = [
    {
      id: 'getting-started',
      title: 'Primeiros Passos',
      icon: <Book className="w-6 h-6" />,
      description: 'Comece a criar seus vídeos em minutos',
      items: [
        'Criar conta gratuita',
        'Escolher template de NR',
        'Personalizar conteúdo',
        'Exportar vídeo',
      ],
    },
    {
      id: 'templates',
      title: 'Templates de NRs',
      icon: <FileText className="w-6 h-6" />,
      description: 'Catálogo completo de Normas Regulamentadoras',
      items: [
        'NR-10: Segurança em Eletricidade',
        'NR-12: Segurança em Máquinas',
        'NR-33: Espaços Confinados',
        'NR-35: Trabalho em Altura',
        'NR-11: Empilhadeiras',
        '+ 20 templates disponíveis',
      ],
    },
    {
      id: 'features',
      title: 'Funcionalidades',
      icon: <Zap className="w-6 h-6" />,
      description: 'Recursos poderosos para criar vídeos profissionais',
      items: [
        'Avatares 3D hiper-realistas',
        'Narração TTS em português',
        'Editor de arrastar e soltar',
        'Timeline multi-track',
        'Biblioteca de assets',
        'Exportação em HD/4K',
      ],
    },
    {
      id: 'compliance',
      title: 'Conformidade NR',
      icon: <Shield className="w-6 h-6" />,
      description: 'Garanta conformidade com as normas brasileiras',
      items: [
        'Conteúdo verificado por especialistas',
        'Atualizado conforme Ministério do Trabalho',
        'Certificado de conclusão',
        'Relatórios de compliance',
      ],
    },
    {
      id: 'collaboration',
      title: 'Colaboração',
      icon: <Users className="w-6 h-6" />,
      description: 'Trabalhe em equipe de forma eficiente',
      items: [
        'Comentários e menções',
        'Aprovação de revisores',
        'Controle de versões',
        'Compartilhamento seguro',
      ],
    },
    {
      id: 'support',
      title: 'Suporte',
      icon: <HelpCircle className="w-6 h-6" />,
      description: 'Ajuda disponível quando você precisar',
      items: [
        'Chat ao vivo (Segunda a Sexta)',
        'Base de conhecimento',
        'Tutoriais em vídeo',
        'Email: suporte@treinx.app',
      ],
    },
  ];

  const quickStart = [
    {
      step: 1,
      title: 'Criar Conta',
      description: 'Cadastre-se gratuitamente em segundos',
    },
    {
      step: 2,
      title: 'Escolher Template',
      description: 'Selecione a NR que deseja criar',
    },
    {
      step: 3,
      title: 'Personalizar',
      description: 'Adicione sua marca e conteúdo',
    },
    {
      step: 4,
      title: 'Exportar',
      description: 'Baixe o vídeo em alta qualidade',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Documentação
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Aprenda a criar vídeos profissionais de treinamento em segurança do trabalho com inteligência artificial
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="shadow-lg">
                Começar Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#getting-started">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
                Ver Tutorial
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Comece em 4 Passos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quickStart.map((item) => (
            <Card key={item.step} className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sections Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Card key={section.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-blue-500">
                    {section.icon}
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-12 text-center">
            <Video className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Pronto para Começar?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Crie sua conta gratuita e comece a produzir vídeos profissionais hoje mesmo!
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="shadow-lg">
                Criar Conta Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
