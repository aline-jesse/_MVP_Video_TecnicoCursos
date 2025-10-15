
'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProfessionalCanvasEditor from '@/components/canvas-editor/professional-canvas-editor'
import ProfessionalTimelineEditor from '@/components/timeline-editor/professional-timeline-editor'
import EnhancedAssetLibrary from '@/components/asset-library/enhanced-asset-library'
import ProfessionalExportPipeline from '@/components/export-pipeline/professional-export-pipeline'
import { 
  Play, Save, Download, Share2, Settings, 
  Layers, Clock, FolderOpen, Film, Palette,
  Wand2, Sparkles, Eye, Monitor, Smartphone
} from 'lucide-react'

const IntegratedCanvasStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState('canvas')
  const [projectName, setProjectName] = useState('NR-12 Treinamento - Segurança Elétrica')

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <div className="h-16 bg-white dark:bg-gray-800 border-b flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Canvas Studio Profissional</h1>
              <p className="text-xs text-gray-500">{projectName}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" variant="ghost">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          {/* Tab Navigation */}
          <div className="border-b bg-white dark:bg-gray-800">
            <div className="px-6 py-2">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                <TabsTrigger value="canvas" className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Canvas</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Timeline</span>
                </TabsTrigger>
                <TabsTrigger value="assets" className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4" />
                  <span>Assets</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center space-x-2">
                  <Film className="h-4 w-4" />
                  <span>Export</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          {/* Tab Content */}
          <TabsContent value="canvas" className="flex-1 m-0">
            <ProfessionalCanvasEditor />
          </TabsContent>
          
          <TabsContent value="timeline" className="flex-1 m-0">
            <ProfessionalTimelineEditor />
          </TabsContent>
          
          <TabsContent value="assets" className="flex-1 m-0">
            <EnhancedAssetLibrary />
          </TabsContent>
          
          <TabsContent value="export" className="flex-1 m-0">
            <ProfessionalExportPipeline />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Status Bar */}
      <div className="h-8 bg-gray-100 dark:bg-gray-800 border-t flex items-center justify-between px-6 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Projeto: {projectName}</span>
          <span>•</span>
          <span>Canvas: 1920×1080</span>
          <span>•</span>
          <span>30 FPS</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Zoom: 100%</span>
          <span>•</span>
          <span>Tempo: 00:05:30</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegratedCanvasStudio
