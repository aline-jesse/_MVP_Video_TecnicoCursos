
'use client'

import { useState } from 'react'
import AppShell from '../../components/layouts/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Separator } from '../../components/ui/separator'
import { Badge } from '../../components/ui/badge'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Monitor,
  Volume2,
  Database,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Notificações
    emailNotifications: true,
    pushNotifications: false,
    projectUpdates: true,
    marketingEmails: false,
    
    // Aparência
    theme: 'system',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    
    // Vídeo/Audio
    defaultQuality: 'hd',
    autoSave: true,
    backupFrequency: 'daily',
    
    // Privacidade
    publicProfile: false,
    analyticsTracking: true,
    cookiePreferences: 'essential'
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    console.log('Configurações salvas:', settings)
    // Aqui implementaria a lógica de salvamento
  }

  const handleExportData = () => {
    console.log('Exportando dados do usuário...')
    // Implementar exportação de dados
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) {
      console.log('Iniciando processo de exclusão de conta...')
      // Implementar exclusão de conta
    }
  }

  return (
    <AppShell
      title="Configurações"
      description="Personalize sua experiência na plataforma"
      showBreadcrumbs={true}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber atualizações importantes por email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações em tempo real no navegador
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Atualizações de Projetos</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar sobre mudanças nos seus projetos
                </p>
              </div>
              <Switch
                checked={settings.projectUpdates}
                onCheckedChange={(checked) => handleSettingChange('projectUpdates', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Emails de Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Receber dicas, novidades e promoções
                </p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência e Idioma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español (España)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-4)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Vídeo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Vídeo e Audio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Qualidade Padrão de Export</Label>
                <Select value={settings.defaultQuality} onValueChange={(value) => handleSettingChange('defaultQuality', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4k">4K (3840x2160)</SelectItem>
                    <SelectItem value="hd">HD (1920x1080)</SelectItem>
                    <SelectItem value="720p">HD (1280x720)</SelectItem>
                    <SelectItem value="480p">SD (854x480)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Frequência de Backup</Label>
                <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Tempo Real</SelectItem>
                    <SelectItem value="hourly">A cada Hora</SelectItem>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Salvar automaticamente mudanças nos projetos
                </p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacidade e Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacidade e Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Perfil Público</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que outros usuários vejam seu perfil
                </p>
              </div>
              <Switch
                checked={settings.publicProfile}
                onCheckedChange={(checked) => handleSettingChange('publicProfile', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Analytics e Telemetria</Label>
                <p className="text-sm text-muted-foreground">
                  Ajudar a melhorar o produto compartilhando dados de uso
                </p>
              </div>
              <Switch
                checked={settings.analyticsTracking}
                onCheckedChange={(checked) => handleSettingChange('analyticsTracking', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exportar Meus Dados</Label>
                  <p className="text-sm text-muted-foreground">
                    Baixar uma cópia de todos os seus dados
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zona de Perigo */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Label className="text-destructive font-medium">Excluir Conta</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanentemente excluir sua conta e todos os dados associados. 
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="flex-shrink-0 ml-4"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Conta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSaveSettings}>
            <SettingsIcon className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
