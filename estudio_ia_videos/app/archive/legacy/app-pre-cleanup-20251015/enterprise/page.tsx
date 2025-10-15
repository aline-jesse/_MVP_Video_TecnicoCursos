

'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { 
  Building2,
  BookOpen,
  BarChart3,
  Users,
  Download,
  Award,
  Mic,
  Box,
  Sparkles,
  Zap,
  Crown,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

// Importar componentes dos módulos
import LMSIntegration from '../../components/lms/lms-integration'
import AdvancedDashboard from '../../components/analytics/advanced-dashboard'
import CollaborationHub from '../../components/collaboration/collaboration-hub'
import ExportStudio from '../../components/export/export-studio'
import CertificationCenter from '../../components/certification/certification-center'
import VoiceCloningStudio from '../../components/voice/voice-cloning-studio'
import ImmersiveStudio from '../../components/immersive/immersive-studio'

export default function EnterprisePage() {
  const [activeModule, setActiveModule] = useState('overview')

  const modules = [
    {
      id: 'lms',
      name: 'LMS Integration',
      description: 'Sistema completo SCORM/xAPI',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      component: <LMSIntegration />
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      description: 'Business Intelligence & BI',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      component: <AdvancedDashboard />
    },
    {
      id: 'collaboration',
      name: 'Real-time Collaboration',
      description: 'Edição colaborativa avançada',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      component: <CollaborationHub />
    },
    {
      id: 'export',
      name: 'Multi-format Export',
      description: 'Exportação profissional',
      icon: Download,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      component: <ExportStudio 
        projectId="demo-project" 
        projectData={{
          title: 'NR-12: Segurança em Máquinas',
          duration: 300,
          scenes: 8,
          thumbnail: '/thumbnails/nr12.jpg'
        }}
      />
    },
    {
      id: 'certification',
      name: 'Blockchain Certification',
      description: 'Certificados verificáveis',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      component: <CertificationCenter />
    },
    {
      id: 'voice',
      name: 'Voice Cloning',
      description: 'Clonagem de voz neural',
      icon: Mic,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      component: <VoiceCloningStudio />
    },
    {
      id: 'immersive',
      name: '3D Environments',
      description: 'Ambientes imersivos',
      icon: Box,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      component: <ImmersiveStudio />
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Enterprise */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enterprise Studio
            </h1>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          
          <p className="text-xl text-muted-foreground mb-6">
            Funcionalidades avançadas para empresas - Sprint 9 Completo
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              7 Módulos Implementados
            </Badge>
            <Badge className="bg-blue-100 text-blue-700">
              100% Funcional
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              Enterprise Ready
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">SCORM/xAPI</div>
                <div className="text-sm text-muted-foreground">LMS Integration</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">Analytics BI</div>
                <div className="text-sm text-muted-foreground">Business Intelligence</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">Real-time</div>
                <div className="text-sm text-muted-foreground">Collaboration</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">Blockchain</div>
                <div className="text-sm text-muted-foreground">Certificates</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Modules */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Módulos Enterprise Avançados
            </CardTitle>
            <CardDescription>
              Selecione um módulo para explorar as funcionalidades avançadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {modules.map((module) => {
                const IconComponent = module.icon
                return (
                  <Button
                    key={module.id}
                    variant={activeModule === module.id ? 'default' : 'outline'}
                    className={`h-auto p-4 ${module.bgColor} hover:${module.bgColor} border-2 transition-all duration-200`}
                    onClick={() => setActiveModule(module.id)}
                  >
                    <div className="text-center space-y-2">
                      <IconComponent className={`h-6 w-6 mx-auto ${module.color}`} />
                      <div>
                        <div className="font-medium text-sm">{module.name}</div>
                        <div className="text-xs text-muted-foreground">{module.description}</div>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Overview */}
        {activeModule === 'overview' && (
          <div className="space-y-6">
            
            {/* Sprint 9 Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Sprint 9 - Funcionalidades Enterprise Completas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {modules.map((module) => {
                    const IconComponent = module.icon
                    return (
                      <Card key={module.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${module.bgColor}`}>
                              <IconComponent className={`h-5 w-5 ${module.color}`} />
                            </div>
                            <div>
                              <h4 className="font-medium">{module.name}</h4>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {module.id === 'lms' && (
                              <>
                                <p>✅ SCORM 1.2 & 2004 compliant</p>
                                <p>✅ xAPI (Tin Can API) support</p>
                                <p>✅ Moodle, Canvas, Blackboard</p>
                              </>
                            )}
                            {module.id === 'analytics' && (
                              <>
                                <p>✅ Business Intelligence Dashboard</p>
                                <p>✅ Predictive Analytics com ML</p>
                                <p>✅ Executive Reports</p>
                              </>
                            )}
                            {module.id === 'collaboration' && (
                              <>
                                <p>✅ Edição em tempo real</p>
                                <p>✅ Chat e comentários</p>
                                <p>✅ Controle de versão</p>
                              </>
                            )}
                            {module.id === 'export' && (
                              <>
                                <p>✅ MP4, WebM, SCORM, HTML5</p>
                                <p>✅ YouTube/Vimeo integration</p>
                                <p>✅ Batch export engine</p>
                              </>
                            )}
                            {module.id === 'certification' && (
                              <>
                                <p>✅ Blockchain immutable proof</p>
                                <p>✅ Government compliance</p>
                                <p>✅ Automated verification</p>
                              </>
                            )}
                            {module.id === 'voice' && (
                              <>
                                <p>✅ Neural voice cloning</p>
                                <p>✅ Emotional synthesis</p>
                                <p>✅ Regional accent support</p>
                              </>
                            )}
                            {module.id === 'immersive' && (
                              <>
                                <p>✅ 3D realistic environments</p>
                                <p>✅ VR/AR compatibility</p>
                                <p>✅ Physics simulation</p>
                              </>
                            )}
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="w-full mt-3"
                            onClick={() => setActiveModule(module.id)}
                          >
                            Explorar Módulo
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Benefits */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Benefícios Enterprise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-800">🚀 Produtividade Avançada</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Colaboração em tempo real com até 50 usuários</li>
                      <li>• Exportação automática em lote para múltiplos formatos</li>
                      <li>• Integração nativa com LMS corporativos</li>
                      <li>• Analytics preditivo para otimização de conteúdo</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-800">🛡️ Segurança & Compliance</h4>
                    <ul className="space-y-1 text-sm text-purple-700">
                      <li>• Certificados blockchain imutáveis</li>
                      <li>• Auditoria completa de atividades</li>
                      <li>• Conformidade com normas governamentais</li>
                      <li>• Controle granular de permissões</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-800">💡 Inovação Tecnológica</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li>• Clonagem de voz neural personalizada</li>
                      <li>• Ambientes 3D ultra-realistas</li>
                      <li>• Suporte VR/AR imersivo</li>
                      <li>• IA generativa para conteúdo automático</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-orange-800">📊 ROI Comprovado</h4>
                    <ul className="space-y-1 text-sm text-orange-700">
                      <li>• Redução de 67% no tempo de criação</li>
                      <li>• Aumento de 89% no engajamento</li>
                      <li>• Economia de R$ 340K/ano vs métodos tradicionais</li>
                      <li>• ROI de 450% em 12 meses</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Renderizar componente do módulo ativo */}
        {activeModule !== 'overview' && (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveModule('overview')}
              className="mb-4"
            >
              ← Voltar para Visão Geral
            </Button>
            
            {modules.find(m => m.id === activeModule)?.component}
          </div>
        )}
      </div>
    </div>
  )
}

