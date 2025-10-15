
'use client'

/**
 * 📱 PWA APRIMORADO - Sprint 17
 * Melhorias na experiência móvel e PWA
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Share2,
  Bell,
  X,
  Check,
  AlertCircle,
  Zap,
  Moon,
  Sun,
  Settings,
  Maximize,
  Minimize
} from 'lucide-react'

interface PWACapabilities {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  batteryLevel?: number
  isCharging?: boolean
  supportsPush: boolean
  supportsBackground: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

interface OfflineTask {
  id: string
  type: 'render' | 'upload' | 'sync'
  title: string
  progress: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  size?: string
  createdAt: string
}

export default function PWAEnhanced() {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    supportsPush: false,
    supportsBackground: false,
    deviceType: 'desktop'
  })

  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showOfflineManager, setShowOfflineManager] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [networkSpeed, setNetworkSpeed] = useState<string>('fast')

  const [offlineTasks, setOfflineTasks] = useState<OfflineTask[]>([
    {
      id: '1',
      type: 'render',
      title: 'Renderizando: NR-12 Segurança',
      progress: 65,
      status: 'processing',
      size: '45MB',
      createdAt: '2024-09-24T18:30:00Z'
    },
    {
      id: '2',
      type: 'sync',
      title: 'Sincronizando comentários',
      progress: 100,
      status: 'completed',
      createdAt: '2024-09-24T18:00:00Z'
    }
  ])

  useEffect(() => {
    // Inicializar capacidades do PWA no lado do cliente
    setCapabilities({
      isInstallable: false,
      isInstalled: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      supportsPush: typeof window !== 'undefined' && 'Notification' in window && 'PushManager' in window,
      supportsBackground: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      deviceType: 'desktop'
    })

    // Detectar tipo de dispositivo
    const detectDevice = () => {
      if (typeof window === 'undefined') return 'desktop'
      const width = window.innerWidth
      if (width < 768) return 'mobile'
      if (width < 1024) return 'tablet'
      return 'desktop'
    }

    // Detectar se é instalável
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCapabilities(prev => ({ ...prev, isInstallable: true }))
      
      // Mostrar prompt de instalação apenas em mobile
      if (detectDevice() === 'mobile') {
        setTimeout(() => setShowInstallPrompt(true), 3000)
      }
    }

    // Detectar se já está instalado
    const handleAppInstalled = () => {
      setCapabilities(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false 
      }))
      setShowInstallPrompt(false)
    }

    // Monitor de conectividade
    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => {
      setCapabilities(prev => ({ ...prev, isOnline: false }))
      setShowOfflineManager(true)
    }

    // Monitor de bateria (se disponível)
    const updateBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery()
          setCapabilities(prev => ({
            ...prev,
            batteryLevel: Math.floor(battery.level * 100),
            isCharging: battery.charging
          }))
        } catch (error) {
          console.log('Battery API não disponível')
        }
      }
    }

    // Monitor de velocidade de rede
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        const effectiveType = connection.effectiveType
        setNetworkSpeed(effectiveType)
      }
    }

    // Detectar fullscreen
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    // Event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.addEventListener('appinstalled', handleAppInstalled)
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // Inicialização
    setCapabilities(prev => ({ ...prev, deviceType: detectDevice() }))
    updateBatteryInfo()
    updateNetworkInfo()

    // Verificar se já está em modo standalone (instalado)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCapabilities(prev => ({ ...prev, isInstalled: true }))
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setCapabilities(prev => ({ ...prev, isInstalled: true, isInstallable: false }))
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) return

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification('Estúdio IA de Vídeos', {
        body: 'Notificações ativadas! Você será notificado sobre atualizações dos seus projetos.',
        icon: '/icon-192.png'
      })
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  const getStatusColor = (status: OfflineTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getNetworkIcon = () => {
    if (!capabilities.isOnline) return <WifiOff className="h-4 w-4 text-red-500" />
    
    switch (networkSpeed) {
      case 'slow-2g':
      case '2g': return <Wifi className="h-4 w-4 text-red-500" />
      case '3g': return <Wifi className="h-4 w-4 text-yellow-500" />
      default: return <Wifi className="h-4 w-4 text-green-500" />
    }
  }

  const getBatteryIcon = () => {
    if (capabilities.batteryLevel === undefined) return null
    
    if (capabilities.batteryLevel < 20) {
      return <BatteryLow className="h-4 w-4 text-red-500" />
    }
    return <Battery className="h-4 w-4 text-green-500" />
  }

  // Status bar para dispositivos móveis
  const MobileStatusBar = () => {
    if (capabilities.deviceType !== 'mobile' && capabilities.deviceType !== 'tablet') return null

    return (
      <div className="fixed top-0 left-0 right-0 h-6 bg-black/80 text-white text-xs flex items-center justify-between px-4 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {getNetworkIcon()}
        </div>
        
        <div className="flex items-center gap-2">
          {getBatteryIcon()}
          {capabilities.batteryLevel !== undefined && (
            <span>{capabilities.batteryLevel}%</span>
          )}
          {capabilities.isCharging && <Zap className="h-3 w-3 text-yellow-500" />}
        </div>
      </div>
    )
  }

  // Quick Actions para PWA
  const PWAQuickActions = () => (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
      {!capabilities.isOnline && (
        <Button
          size="sm"
          variant="outline"
          className="h-10 w-10 p-0 bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
          onClick={() => setShowOfflineManager(true)}
        >
          <WifiOff className="h-4 w-4" />
        </Button>
      )}
      
      {capabilities.deviceType !== 'desktop' && (
        <Button
          size="sm"
          variant="outline"
          className="h-10 w-10 p-0"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      )}
      
      {capabilities.supportsPush && Notification.permission !== 'granted' && (
        <Button
          size="sm"
          variant="outline"
          className="h-10 w-10 p-0"
          onClick={handleRequestNotificationPermission}
        >
          <Bell className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  return (
    <>
      <MobileStatusBar />
      <PWAQuickActions />

      {/* Install Prompt */}
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Instalar Aplicativo
            </DialogTitle>
            <DialogDescription>
              Instale o Estúdio IA de Vídeos para uma melhor experiência móvel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Acesso offline aos seus projetos</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Notificações em tempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Interface otimizada para mobile</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Economia de dados</span>
            </div>
          </div>
          
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowInstallPrompt(false)} className="w-full sm:w-auto">
              Agora Não
            </Button>
            <Button onClick={handleInstallApp} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Instalar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offline Manager */}
      <Dialog open={showOfflineManager} onOpenChange={setShowOfflineManager}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-orange-500" />
              Modo Offline
            </DialogTitle>
            <DialogDescription>
              Você está offline. Suas alterações serão sincronizadas quando a conexão for restaurada.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Conectividade limitada detectada
              </span>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Tarefas em Segundo Plano</h4>
              {offlineTasks.map((task) => (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{task.title}</span>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status === 'processing' && 'Processando'}
                      {task.status === 'completed' && 'Concluído'}
                      {task.status === 'pending' && 'Pendente'}
                      {task.status === 'failed' && 'Erro'}
                    </Badge>
                  </div>
                  {task.status === 'processing' && (
                    <Progress value={task.progress} className="h-2" />
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{task.size}</span>
                    <span>{task.progress}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Recursos Disponíveis Offline</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Editar projetos salvos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Visualizar templates NR</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Acessar biblioteca de mídia</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-3 w-3 text-red-500" />
                  <span>Upload de novos arquivos</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowOfflineManager(false)} className="w-full">
              Continuar Offline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PWA Info Card - apenas para debug em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="fixed bottom-4 left-4 w-64 z-30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">PWA Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Instalável:</span>
              <Badge variant={capabilities.isInstallable ? 'default' : 'secondary'}>
                {capabilities.isInstallable ? 'Sim' : 'Não'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Instalado:</span>
              <Badge variant={capabilities.isInstalled ? 'default' : 'secondary'}>
                {capabilities.isInstalled ? 'Sim' : 'Não'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Online:</span>
              <Badge variant={capabilities.isOnline ? 'default' : 'destructive'}>
                {capabilities.isOnline ? 'Sim' : 'Não'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Dispositivo:</span>
              <Badge variant="outline">{capabilities.deviceType}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Rede:</span>
              <Badge variant="outline">{networkSpeed}</Badge>
            </div>
            {capabilities.batteryLevel !== undefined && (
              <div className="flex justify-between">
                <span>Bateria:</span>
                <Badge variant="outline">
                  {capabilities.batteryLevel}% {capabilities.isCharging && '⚡'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
