/**
 * 🏠 Dashboard Layout Component
 * Main layout wrapper for the unified dashboard with navigation and content areas
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Bell,
  Play,
  Zap,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Search,
  Plus,
  HelpCircle,
  Moon,
  Sun,
  Monitor,
  FileTemplate,
  Edit3,
  Film
} from 'lucide-react'
import { ProjectManagement } from './project-management'
import { AnalyticsDashboard } from './analytics-dashboard'
import { NotificationCenter } from './notification-center'
import { RenderPipeline } from './render-pipeline'
import { ExternalAPIs } from './external-apis'
import { TemplateSystem } from '@/components/templates/template-system'
import { WYSIWYGEditor } from '@/components/editor/wysiwyg-editor'
import PPTXTimelineIntegration from '@/components/timeline/PPTXTimelineIntegration'
import MotionityIntegration from '@/components/timeline/MotionityIntegration'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Dashboard overview and quick stats'
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    description: 'Manage your video projects'
  },
  { id: 'templates', label: 'Templates', icon: FileTemplate, description: 'Browse and manage video templates' },
    { id: 'editor', label: 'Editor', icon: Edit3, description: 'WYSIWYG content editor with timeline and 3D preview' },
  {
    id: 'timeline',
    label: 'Timeline Editor',
    icon: Film,
    description: 'Professional timeline editor for video production'
  },
  {
    id: 'motionity',
    label: 'Motionity PoC',
    icon: Zap,
    description: 'Advanced Motionity integration with keyframes and animations'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'System and user analytics'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Alerts and notification center'
  },
  {
    id: 'render',
    label: 'Render Pipeline',
    icon: Play,
    description: 'Render queue and monitoring'
  },
  {
    id: 'apis',
    label: 'External APIs',
    icon: Zap,
    description: 'TTS, media, and compliance integrations'
  }
]

interface DashboardLayoutProps {
  children?: React.ReactNode
  defaultTab?: string
}

export function DashboardLayout({ children, defaultTab = 'overview' }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [theme, setTheme] = useState('system')

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun
      case 'dark':
        return Moon
      default:
        return Monitor
    }
  }

  const ThemeIcon = getThemeIcon()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Video Studio</h1>
                <p className="text-xs text-muted-foreground">AI Dashboard</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    !isSidebarOpen && "px-2"
                  )}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className={cn("h-4 w-4", isSidebarOpen && "mr-2")} />
                  {isSidebarOpen && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Name</p>
                <p className="text-xs text-muted-foreground truncate">user@example.com</p>
              </div>
            )}
          </div>
          
          {isSidebarOpen && (
            <div className="flex items-center justify-between mt-3">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                <ThemeIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-lg font-semibold">
                {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {navigationItems.find(item => item.id === activeTab)?.description || 'Welcome to your dashboard'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
            <Button variant="outline" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">+3 from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Renders</CardTitle>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground">2 in queue</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">3 unread</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Your latest video projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                            <FolderOpen className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Project {i}</p>
                            <p className="text-xs text-muted-foreground">Updated 2 hours ago</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current system health and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Render Queue</span>
                        <Badge className="bg-green-500">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Services</span>
                        <Badge className="bg-green-500">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        <Badge className="bg-green-500">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Storage</span>
                        <Badge className="bg-yellow-500">75% Used</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {activeTab === 'projects' && <ProjectManagement />}
          {activeTab === 'templates' && <TemplateSystem />}
          {activeTab === 'editor' && <WYSIWYGEditor />}
          {activeTab === 'timeline' && <PPTXTimelineIntegration />}
          {activeTab === 'motionity' && <MotionityIntegration />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'notifications' && <NotificationCenter />}
          {activeTab === 'render' && <RenderPipeline />}
          {activeTab === 'apis' && <ExternalAPIs />}
          
          {children}
        </ScrollArea>
      </div>
    </div>
  )
}