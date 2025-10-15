
/**
 * 🔧 Página de Configurações Gerais
 * Centraliza todas as credenciais e configurações do sistema
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Cloud, 
  Mic, 
  Database, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Server,
  Eye,
  EyeOff,
  TestTube,
  Save,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface ServiceConfig {
  name: string
  status: 'connected' | 'disconnected' | 'testing'
  lastTested?: Date
  error?: string
}

interface ConfigForm {
  // Google Cloud TTS
  googleTtsApiKey: string
  googleTtsProjectId: string
  
  // AWS S3
  awsAccessKeyId: string
  awsSecretAccessKey: string
  awsRegion: string
  awsBucketName: string
  awsFolderPrefix: string
  
  // ElevenLabs
  elevenlabsApiKey: string
  
  // OpenAI
  openaiApiKey: string
  
  // Azure Speech
  azureSpeechKey: string
  azureSpeechRegion: string
  
  // Database
  databaseUrl: string
  
  // General Settings
  defaultLanguage: string
  maxVideoLength: number
  enableAnalytics: boolean
  enableMetrics: boolean
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfigForm>({
    googleTtsApiKey: '',
    googleTtsProjectId: '',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
    awsRegion: 'us-west-2',
    awsBucketName: '',
    awsFolderPrefix: '',
    elevenlabsApiKey: '',
    openaiApiKey: '',
    azureSpeechKey: '',
    azureSpeechRegion: '',
    databaseUrl: '',
    defaultLanguage: 'pt-BR',
    maxVideoLength: 300,
    enableAnalytics: true,
    enableMetrics: true
  })
  
  const [services, setServices] = useState<Record<string, ServiceConfig>>({
    googleTts: { name: 'Google Cloud TTS', status: 'disconnected' },
    awsS3: { name: 'AWS S3 Storage', status: 'disconnected' },
    elevenlabs: { name: 'ElevenLabs Voice', status: 'disconnected' },
    openai: { name: 'OpenAI GPT', status: 'disconnected' },
    azureSpeech: { name: 'Azure Speech', status: 'disconnected' },
    database: { name: 'Database', status: 'disconnected' }
  })
  
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Carregar configurações atuais
  useEffect(() => {
    loadCurrentConfig()
  }, [])

  const loadCurrentConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/config/get')
      if (response.ok) {
        const data = await response.json()
        setConfig(prev => ({ ...prev, ...data.config }))
        setServices(data.services || services)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      })
      
      if (response.ok) {
        toast.success('Configurações salvas com sucesso!')
        await loadCurrentConfig() // Recarregar status
      } else {
        throw new Error('Falha ao salvar configurações')
      }
      
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const testService = async (service: string) => {
    try {
      setServices(prev => ({
        ...prev,
        [service]: { ...prev[service], status: 'testing' }
      }))

      const response = await fetch('/api/admin/config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, config })
      })

      const result = await response.json()
      
      setServices(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          status: result.success ? 'connected' : 'disconnected',
          lastTested: new Date(),
          error: result.success ? undefined : result.error
        }
      }))

      if (result.success) {
        toast.success(`${services[service].name} conectado com sucesso!`)
      } else {
        toast.error(`Falha na conexão: ${result.error}`)
      }

    } catch (error) {
      console.error('Erro no teste:', error)
      setServices(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          status: 'disconnected',
          error: 'Erro de conexão'
        }
      }))
    }
  }

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const getStatusIcon = (status: ServiceConfig['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'disconnected': return <XCircle className="w-4 h-4 text-red-500" />
      case 'testing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: ServiceConfig['status']) => {
    switch (status) {
      case 'connected': return <Badge variant="outline" className="text-green-700 border-green-300">Conectado</Badge>
      case 'disconnected': return <Badge variant="outline" className="text-red-700 border-red-300">Desconectado</Badge>
      case 'testing': return <Badge variant="outline" className="text-blue-700 border-blue-300">Testando...</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Carregando configurações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Configurações Gerais
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure todas as credenciais e integrações do sistema
              </p>
            </div>
          </div>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Status dos Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(services).map(([key, service]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className="font-medium text-sm">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(service.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testService(key)}
                        disabled={service.status === 'testing'}
                      >
                        <TestTube className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurações */}
        <Tabs defaultValue="tts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tts" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              TTS & Voz
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Armazenamento
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              IA & APIs
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Avançado
            </TabsTrigger>
          </TabsList>

          {/* TTS & Voice */}
          <TabsContent value="tts">
            <div className="space-y-6">
              
              {/* Google Cloud TTS */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <img src="https://cloud.google.com/_static/cloud/images/favicons/onecloud/super_cloud.png" 
                             className="w-5 h-5" alt="Google Cloud" />
                        Google Cloud Text-to-Speech
                      </CardTitle>
                      <CardDescription>
                        Síntese de voz de alta qualidade em português brasileiro
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(services.googleTts?.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Criar API Key
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Como obter:</strong> Acesse o Google Cloud Console → APIs & Services → Credentials → Create API Key → Enable Text-to-Speech API
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="googleTtsApiKey">API Key *</Label>
                      <div className="relative">
                        <Input
                          id="googleTtsApiKey"
                          type={showSecrets.googleTtsApiKey ? "text" : "password"}
                          placeholder="AIzaSy..."
                          value={config.googleTtsApiKey}
                          onChange={(e) => setConfig(prev => ({ ...prev, googleTtsApiKey: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleSecret('googleTtsApiKey')}
                        >
                          {showSecrets.googleTtsApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="googleTtsProjectId">Project ID</Label>
                      <Input
                        id="googleTtsProjectId"
                        placeholder="meu-projeto-123"
                        value={config.googleTtsProjectId}
                        onChange={(e) => setConfig(prev => ({ ...prev, googleTtsProjectId: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => testService('googleTts')}
                    disabled={!config.googleTtsApiKey || services.googleTts?.status === 'testing'}
                    className="w-full"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {services.googleTts?.status === 'testing' ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                  
                  {services.googleTts?.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{services.googleTts.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* ElevenLabs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">11</span>
                        </div>
                        ElevenLabs Voice Cloning
                      </CardTitle>
                      <CardDescription>
                        Clonagem de voz com IA avançada para versão PRO
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(services.elevenlabs?.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('https://elevenlabs.io/api', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Obter API Key
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Como obter:</strong> Crie conta no ElevenLabs → Profile Settings → API Keys → Create API Key
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="elevenlabsApiKey">ElevenLabs API Key</Label>
                    <div className="relative">
                      <Input
                        id="elevenlabsApiKey"
                        type={showSecrets.elevenlabsApiKey ? "text" : "password"}
                        placeholder="sk-..."
                        value={config.elevenlabsApiKey}
                        onChange={(e) => setConfig(prev => ({ ...prev, elevenlabsApiKey: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleSecret('elevenlabsApiKey')}
                      >
                        {showSecrets.elevenlabsApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => testService('elevenlabs')}
                    disabled={!config.elevenlabsApiKey || services.elevenlabs?.status === 'testing'}
                    className="w-full"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {services.elevenlabs?.status === 'testing' ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                  
                  {services.elevenlabs?.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{services.elevenlabs.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Azure Speech */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Az</span>
                        </div>
                        Azure Speech Services
                      </CardTitle>
                      <CardDescription>
                        Síntese de voz da Microsoft Azure como alternativa
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(services.azureSpeech?.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Criar Recurso
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Como obter:</strong> Azure Portal → Create Speech Service → Keys and Endpoint
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="azureSpeechKey">Subscription Key</Label>
                      <div className="relative">
                        <Input
                          id="azureSpeechKey"
                          type={showSecrets.azureSpeechKey ? "text" : "password"}
                          placeholder="your-azure-key"
                          value={config.azureSpeechKey}
                          onChange={(e) => setConfig(prev => ({ ...prev, azureSpeechKey: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleSecret('azureSpeechKey')}
                        >
                          {showSecrets.azureSpeechKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="azureSpeechRegion">Region</Label>
                      <Input
                        id="azureSpeechRegion"
                        placeholder="eastus, westeurope..."
                        value={config.azureSpeechRegion}
                        onChange={(e) => setConfig(prev => ({ ...prev, azureSpeechRegion: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => testService('azureSpeech')}
                    disabled={!config.azureSpeechKey || services.azureSpeech?.status === 'testing'}
                    className="w-full"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {services.azureSpeech?.status === 'testing' ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                  
                  {services.azureSpeech?.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{services.azureSpeech.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Storage */}
          <TabsContent value="storage">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <img src="https://aws.amazon.com/favicon.ico" 
                           className="w-5 h-5" alt="AWS" />
                      Amazon S3 Storage
                    </CardTitle>
                    <CardDescription>
                      Armazenamento em nuvem para vídeos e arquivos gerados
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(services.awsS3?.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('https://console.aws.amazon.com/iam/home#/users$new', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Criar Credenciais
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Como obter:</strong> AWS Console → IAM → Users → Create User → Attach Policy S3FullAccess → Create Access Key
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="awsAccessKeyId">Access Key ID *</Label>
                    <div className="relative">
                      <Input
                        id="awsAccessKeyId"
                        type={showSecrets.awsAccessKeyId ? "text" : "password"}
                        placeholder="AKIA..."
                        value={config.awsAccessKeyId}
                        onChange={(e) => setConfig(prev => ({ ...prev, awsAccessKeyId: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleSecret('awsAccessKeyId')}
                      >
                        {showSecrets.awsAccessKeyId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="awsSecretAccessKey">Secret Access Key *</Label>
                    <div className="relative">
                      <Input
                        id="awsSecretAccessKey"
                        type={showSecrets.awsSecretAccessKey ? "text" : "password"}
                        placeholder="wJalrXUtn..."
                        value={config.awsSecretAccessKey}
                        onChange={(e) => setConfig(prev => ({ ...prev, awsSecretAccessKey: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleSecret('awsSecretAccessKey')}
                      >
                        {showSecrets.awsSecretAccessKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="awsRegion">AWS Region</Label>
                    <Input
                      id="awsRegion"
                      placeholder="us-west-2"
                      value={config.awsRegion}
                      onChange={(e) => setConfig(prev => ({ ...prev, awsRegion: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="awsBucketName">Bucket Name *</Label>
                    <Input
                      id="awsBucketName"
                      placeholder="meu-bucket-videos"
                      value={config.awsBucketName}
                      onChange={(e) => setConfig(prev => ({ ...prev, awsBucketName: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="awsFolderPrefix">Folder Prefix</Label>
                    <Input
                      id="awsFolderPrefix"
                      placeholder="estudio-ia/"
                      value={config.awsFolderPrefix}
                      onChange={(e) => setConfig(prev => ({ ...prev, awsFolderPrefix: e.target.value }))}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => testService('awsS3')}
                  disabled={!config.awsAccessKeyId || !config.awsSecretAccessKey || !config.awsBucketName || services.awsS3?.status === 'testing'}
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {services.awsS3?.status === 'testing' ? 'Testando...' : 'Testar Conexão S3'}
                </Button>
                
                {services.awsS3?.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{services.awsS3.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI & APIs */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/800px-OpenAI_Logo.svg.png" 
                           className="w-5 h-5" alt="OpenAI" />
                      OpenAI GPT
                    </CardTitle>
                    <CardDescription>
                      IA generativa para otimização de conteúdo e scripts
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(services.openai?.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Criar API Key
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Como obter:</strong> OpenAI Platform → API Keys → Create new secret key
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <div className="relative">
                    <Input
                      id="openaiApiKey"
                      type={showSecrets.openaiApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={config.openaiApiKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecret('openaiApiKey')}
                    >
                      {showSecrets.openaiApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => testService('openai')}
                  disabled={!config.openaiApiKey || services.openai?.status === 'testing'}
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {services.openai?.status === 'testing' ? 'Testando...' : 'Testar Conexão'}
                </Button>
                
                {services.openai?.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{services.openai.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Database Connection
                    </CardTitle>
                    <CardDescription>
                      Configuração do banco de dados PostgreSQL
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(services.database?.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('https://supabase.com/dashboard/projects', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Criar Database
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recomendado:</strong> Use Supabase, Railway ou PlanetScale para PostgreSQL gerenciado
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="databaseUrl">Database URL</Label>
                  <div className="relative">
                    <Textarea
                      id="databaseUrl"
                      placeholder="postgresql://user:password@host:port/database"
                      value={config.databaseUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, databaseUrl: e.target.value }))}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => testService('database')}
                  disabled={!config.databaseUrl || services.database?.status === 'testing'}
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {services.database?.status === 'testing' ? 'Testando...' : 'Testar Conexão'}
                </Button>
                
                {services.database?.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{services.database.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* General */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configurações básicas do sistema e preferências padrão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Idioma Padrão</Label>
                    <select
                      id="defaultLanguage"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={config.defaultLanguage}
                      onChange={(e) => setConfig(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="pt-PT">Português (Portugal)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxVideoLength">Duração Máxima de Vídeo (segundos)</Label>
                    <Input
                      id="maxVideoLength"
                      type="number"
                      min="30"
                      max="1800"
                      value={config.maxVideoLength}
                      onChange={(e) => setConfig(prev => ({ ...prev, maxVideoLength: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Funcionalidades Opcionais</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableAnalytics">Analytics</Label>
                      <p className="text-sm text-gray-500">Coletar dados de uso para otimização</p>
                    </div>
                    <Switch
                      id="enableAnalytics"
                      checked={config.enableAnalytics}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableAnalytics: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableMetrics">Métricas Avançadas</Label>
                      <p className="text-sm text-gray-500">Dashboard detalhado de performance</p>
                    </div>
                    <Switch
                      id="enableMetrics"
                      checked={config.enableMetrics}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableMetrics: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced">
            <div className="space-y-6">
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Estas são configurações avançadas. Altere apenas se souber o que está fazendo.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>
                    Variáveis de ambiente e configurações técnicas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label>Variáveis de Ambiente</Label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <code className="text-sm">
                        GOOGLE_TTS_API_KEY={config.googleTtsApiKey ? '***' : 'não configurada'}<br />
                        AWS_ACCESS_KEY_ID={config.awsAccessKeyId ? '***' : 'não configurada'}<br />
                        AWS_SECRET_ACCESS_KEY={config.awsSecretAccessKey ? '***' : 'não configurada'}<br />
                        ELEVENLABS_API_KEY={config.elevenlabsApiKey ? '***' : 'não configurada'}<br />
                        OPENAI_API_KEY={config.openaiApiKey ? '***' : 'não configurada'}
                      </code>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => window.open('/api/admin/config/export', '_blank')}
                    className="w-full"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Exportar Configuração (.env)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t pt-4 mt-8">
          <Button
            onClick={saveConfig}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Todas as Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
