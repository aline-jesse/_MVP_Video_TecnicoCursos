
'use client'

/**
 * 🎯 HEADER - Cabeçalho Principal do Dashboard
 * Navegação global, busca, notificações, perfil
 */

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { RenderNotifications } from '@/src/components/RenderNotifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Menu,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Command,
  Zap,
  Crown,
  Heart,
  HelpCircle,
  Keyboard,
  Palette,
  Shield
} from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  onSearchClick: () => void
  sidebarCollapsed?: boolean
  showMobileMenu?: boolean
}

export default function Header({
  onMenuClick,
  onSearchClick,
  sidebarCollapsed = false,
  showMobileMenu = false
}: HeaderProps) {
  const { data: session } = useSession() || {}
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  
  // Handlers reais para navegação e ações

  const handleProfileClick = () => {
    toast.success('Redirecionando para perfil...')
    router.push('/profile')
  }

  const handleSettingsClick = () => {
    toast.success('Redirecionando para configurações...')
    router.push('/settings')
  }

  const handleHelpClick = () => {
    toast.success('Redirecionando para ajuda...')
    router.push('/help')
  }

  const handleSignOut = async () => {
    try {
      toast.success('Fazendo logout...')
      await signOut({ redirect: true, callbackUrl: '/' })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  const userInitials = session?.user?.name
    ?.split(' ')
    ?.map(n => n[0])
    ?.join('')
    ?.toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-fixed bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {showMobileMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo / Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-primary-glow">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {(!sidebarCollapsed || showMobileMenu) && (
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-gradient">
                  Estúdio IA
                </h1>
                <p className="text-xs text-text-muted -mt-1">
                  Vídeos Profissionais
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <Button
            variant="outline"
            onClick={onSearchClick}
            className={cn(
              "w-full justify-start text-text-muted hover:text-text",
              "bg-bg-secondary/50 hover:bg-bg-secondary border-border hover:border-border-hover",
              "transition-all duration-200"
            )}
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Buscar funcionalidades...</span>
            <span className="sm:hidden">Buscar...</span>
            <div className="ml-auto flex items-center gap-1">
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-bg px-1.5 font-mono text-xs text-text-muted">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Alterar tema">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm font-semibold">Tema</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4 mr-2" />
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4 mr-2" />
                Escuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="h-4 w-4 mr-2" />
                Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Render Notifications */}
          <RenderNotifications 
            userId={session?.user?.id || null} 
            className="flex-shrink-0"
          />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="text-xs bg-gradient-primary text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-text-muted">
                    {session?.user?.email || 'usuario@exemplo.com'}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Crown className="h-3 w-3 text-warning" />
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      Pro
                    </Badge>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Administração
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onSearchClick}>
                <Keyboard className="h-4 w-4 mr-2" />
                Atalhos
                <kbd className="ml-auto text-xs">⌘K</kbd>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/help" className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Ajuda
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut} className="text-danger">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

// Component para mostrar status de conexão
export function ConnectionStatus() {
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="bg-warning text-warning-dark px-4 py-2 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
        Sem conexão com a internet
      </div>
    </div>
  )
}
