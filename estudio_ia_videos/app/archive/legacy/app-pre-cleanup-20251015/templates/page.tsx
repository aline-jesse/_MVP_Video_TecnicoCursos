
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import NRTemplateLibrary from '../../components/nr-template-library'
import { NRTemplate } from '../../lib/nr-templates'
import { Analytics } from '../../lib/analytics'
import { 
  ArrowLeft,
  BookOpen,
  Zap,
  Shield,
  HardHat,
  Users,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function TemplatesPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState({
    role: 'técnico',
    experience: 'intermediate' as const,
    industry: 'industrial'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated') {
      Analytics.track('templates_page_visited', {
        user_email: session?.user?.email
      })
    }
  }, [status, router, session])

  const handleTemplateSelect = (template: NRTemplate) => {
    setLoading(true)
    
    // Simular carregamento do template no editor
    setTimeout(() => {
      Analytics.track('template_selected_from_library', {
        template_id: template.id,
        template_nr: template.nr,
        template_title: template.title
      })
      
      toast.success(`Template ${template.nr} selecionado!`)
      
      // Redirecionar para o editor com o template
      router.push(`/editor?template=${template.id}`)
    }, 1500)
  }

  const updateUserProfile = (field: string, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Biblioteca de Templates</h1>
                <p className="text-sm text-gray-500">
                  Templates especializados para Normas Regulamentadoras
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {session?.user?.email && (
                <span className="text-sm text-gray-600">
                  {session.user.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Templates Especializados para NRs
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Conteúdo técnico desenvolvido por especialistas, pronto para personalização
              com avatares IA e vozes regionais do Brasil
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>NR-10 Eletricidade</span>
              </div>
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-orange-500" />
                <span>NR-35 Altura</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                <span>NR-33 Espaços Confinados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Personalizar Recomendações
            </CardTitle>
            <CardDescription>
              Configure seu perfil para receber templates personalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Função</label>
                <Select
                  value={userProfile.role}
                  onValueChange={(value) => updateUserProfile('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="técnico">Técnico</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="instrutor">Instrutor</SelectItem>
                    <SelectItem value="gestor">Gestor de Segurança</SelectItem>
                    <SelectItem value="rh">Recursos Humanos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Experiência</label>
                <Select
                  value={userProfile.experience}
                  onValueChange={(value) => updateUserProfile('experience', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Setor</label>
                <Select
                  value={userProfile.industry}
                  onValueChange={(value) => updateUserProfile('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="construcao">Construção Civil</SelectItem>
                    <SelectItem value="eletrico">Setor Elétrico</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="corporativo">Corporativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Library */}
        <Card>
          <CardContent className="p-6">
            <NRTemplateLibrary
              onTemplateSelect={handleTemplateSelect}
              userProfile={userProfile}
            />
          </CardContent>
        </Card>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Carregando template...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
