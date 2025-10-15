

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Separator } from '../ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { 
  Palette, 
  Upload, 
  Globe, 
  Settings, 
  Eye, 
  Save,
  Download,
  Building,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface BrandingConfig {
  companyName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  customDomain: string
  favicon: string
}

interface ContactInfo {
  email: string
  phone: string
  address: string
  website: string
}

interface FeatureToggles {
  aiFeatures: boolean
  collaboration: boolean
  analytics: boolean
  cloudSync: boolean
  exportFormats: string[]
  watermarkRemoval: boolean
}

export default function WhiteLabelConfig() {
  const [branding, setBranding] = useState<BrandingConfig>({
    companyName: 'Sua Empresa',
    logo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    customDomain: '',
    favicon: ''
  })

  const [contact, setContact] = useState<ContactInfo>({
    email: '',
    phone: '',
    address: '',
    website: ''
  })

  const [features, setFeatures] = useState<FeatureToggles>({
    aiFeatures: true,
    collaboration: true,
    analytics: true,
    cloudSync: true,
    exportFormats: ['MP4', 'WebM'],
    watermarkRemoval: false
  })

  const [activeTab, setActiveTab] = useState('branding')

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!')
  }

  const handlePreview = () => {
    toast('Abrindo preview da interface personalizada...')
  }

  const handleExport = () => {
    const config = {
      branding,
      contact,
      features,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'whitelabel-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const colorPresets = [
    { name: 'Azul Corporativo', primary: '#1E40AF', secondary: '#1F2937', accent: '#3B82F6' },
    { name: 'Verde Sustentável', primary: '#059669', secondary: '#1F2937', accent: '#10B981' },
    { name: 'Roxo Inovação', primary: '#7C3AED', secondary: '#1F2937', accent: '#A855F7' },
    { name: 'Laranja Energia', primary: '#EA580C', secondary: '#1F2937', accent: '#F97316' },
  ]

  const exportFormatOptions = ['MP4', 'WebM', 'MOV', 'AVI', 'GIF']

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Configuração White Label
          </CardTitle>
          <CardDescription>
            Personalize a plataforma com a identidade da sua empresa
          </CardDescription>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Config
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">Visual & Branding</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
          <TabsTrigger value="contact">Informações</TabsTrigger>
          <TabsTrigger value="domain">Domínio</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Identidade Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input 
                  id="companyName"
                  value={branding.companyName}
                  onChange={(e) => setBranding({...branding, companyName: e.target.value})}
                  placeholder="Nome da sua empresa"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo da Empresa</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Clique para fazer upload do logo
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos: PNG, JPG, SVG (máx. 2MB)
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="space-y-4">
                <Label>Esquema de Cores</Label>
                
                {/* Quick Presets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {colorPresets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="p-2 h-auto"
                      onClick={() => setBranding({
                        ...branding, 
                        primaryColor: preset.primary,
                        secondaryColor: preset.secondary,
                        accentColor: preset.accent
                      })}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: preset.primary}} />
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: preset.accent}} />
                        </div>
                        <span className="text-xs">{preset.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Custom Colors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        id="primaryColor"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                        className="w-12 h-10 rounded border"
                      />
                      <Input 
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        id="secondaryColor"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                        className="w-12 h-10 rounded border"
                      />
                      <Input 
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                        placeholder="#1F2937"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        id="accentColor"
                        value={branding.accentColor}
                        onChange={(e) => setBranding({...branding, accentColor: e.target.value})}
                        className="w-12 h-10 rounded border"
                      />
                      <Input 
                        value={branding.accentColor}
                        onChange={(e) => setBranding({...branding, accentColor: e.target.value})}
                        placeholder="#F59E0B"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Selection */}
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Família de Fonte</Label>
                <select 
                  id="fontFamily"
                  value={branding.fontFamily}
                  onChange={(e) => setBranding({...branding, fontFamily: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Inter">Inter (Padrão)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview da Interface</Label>
                <div 
                  className="border rounded-lg p-4"
                  style={{
                    backgroundColor: branding.primaryColor,
                    color: 'white',
                    fontFamily: branding.fontFamily
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{branding.companyName}</h3>
                    <div 
                      className="px-3 py-1 rounded-full text-sm"
                      style={{backgroundColor: branding.accentColor}}
                    >
                      Estúdio de Vídeos
                    </div>
                  </div>
                  <p className="text-sm opacity-90">
                    Esta é uma prévia de como sua plataforma personalizada ficará.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades Disponíveis</CardTitle>
              <CardDescription>
                Configure quais recursos estarão disponíveis para seus usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Core Features */}
              <div className="space-y-4">
                <h4 className="font-semibold">Recursos Principais</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Funcionalidades de IA Avançada</p>
                      <p className="text-sm text-gray-600">Geração de roteiros, otimização de conteúdo</p>
                    </div>
                    <Switch 
                      checked={features.aiFeatures}
                      onCheckedChange={(checked) => setFeatures({...features, aiFeatures: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Colaboração em Tempo Real</p>
                      <p className="text-sm text-gray-600">Chat, edição simultânea, comentários</p>
                    </div>
                    <Switch 
                      checked={features.collaboration}
                      onCheckedChange={(checked) => setFeatures({...features, collaboration: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Analytics Avançados</p>
                      <p className="text-sm text-gray-600">Métricas detalhadas e relatórios</p>
                    </div>
                    <Switch 
                      checked={features.analytics}
                      onCheckedChange={(checked) => setFeatures({...features, analytics: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Sincronização na Nuvem</p>
                      <p className="text-sm text-gray-600">Google Drive, Dropbox, OneDrive</p>
                    </div>
                    <Switch 
                      checked={features.cloudSync}
                      onCheckedChange={(checked) => setFeatures({...features, cloudSync: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Remoção de Marca D'água</p>
                      <p className="text-sm text-gray-600">Remover watermarks dos vídeos exportados</p>
                    </div>
                    <Switch 
                      checked={features.watermarkRemoval}
                      onCheckedChange={(checked) => setFeatures({...features, watermarkRemoval: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Export Formats */}
              <div className="space-y-4">
                <h4 className="font-semibold">Formatos de Exportação</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {exportFormatOptions.map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={format}
                        checked={features.exportFormats.includes(format)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFeatures({
                              ...features, 
                              exportFormats: [...features.exportFormats, format]
                            })
                          } else {
                            setFeatures({
                              ...features, 
                              exportFormats: features.exportFormats.filter(f => f !== format)
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={format} className="text-sm">{format}</label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>
                Dados que aparecerão na interface personalizada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de Suporte</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="suporte@suaempresa.com"
                    className="pl-10"
                    value={contact.email}
                    onChange={(e) => setContact({...contact, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="phone"
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                    value={contact.phone}
                    onChange={(e) => setContact({...contact, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="website"
                    type="url"
                    placeholder="https://www.suaempresa.com"
                    className="pl-10"
                    value={contact.website}
                    onChange={(e) => setContact({...contact, website: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea 
                    id="address"
                    placeholder="Rua exemplo, 123 - São Paulo, SP"
                    className="pl-10"
                    value={contact.address}
                    onChange={(e) => setContact({...contact, address: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Tab */}
        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Domínio Personalizado
              </CardTitle>
              <CardDescription>
                Configure um domínio próprio para sua plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Domínio Personalizado</Label>
                <Input 
                  id="customDomain"
                  placeholder="videos.suaempresa.com"
                  value={branding.customDomain}
                  onChange={(e) => setBranding({...branding, customDomain: e.target.value})}
                />
                <p className="text-xs text-gray-500">
                  Configure o DNS do seu domínio para apontar para nossos servidores
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Configuração DNS</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Tipo:</strong> CNAME</p>
                  <p><strong>Nome:</strong> videos (ou subdomínio desejado)</p>
                  <p><strong>Valor:</strong> platform.estudio-ia.com</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status do Domínio</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                    Aguardando Configuração
                  </Badge>
                  <Button variant="outline" size="sm">
                    Verificar DNS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
