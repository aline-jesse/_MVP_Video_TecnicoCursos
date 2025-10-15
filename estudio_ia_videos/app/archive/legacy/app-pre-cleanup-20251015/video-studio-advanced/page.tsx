/**
 * Advanced Video Studio - Editor de vídeo profissional com timeline
 * Integra PPTX, Avatar 3D, TTS e colaboração em tempo real
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  VideoIcon, 
  Upload, 
  Folder, 
  Settings, 
  Users, 
  Download,
  FileText,
  User,
  Mic,
  Image,
  Music,
  Zap,
  PlusCircle,
  Library,
  Monitor,
  Play
} from 'lucide-react'

// Components
import { AdvancedTimelineEditor } from '@/components/timeline/advanced-timeline-editor'
import { useTimelineStore } from '@/lib/stores/timeline-store'
import { TimelineElement, TimelineTrack, TimelineLayer } from '@/lib/types/timeline-types'

interface AdvancedVideoStudioProps {
  className?: string
}

export default function AdvancedVideoStudio({ className = '' }: AdvancedVideoStudioProps) {
  // ==================== STATE & STORE ====================
  const {
    project,
    isProjectLoaded,
    selection,
    createNewProject,
    loadProject,
    addTrack,
    addLayer,
    addElement,
    saveProject,
  } = useTimelineStore()

  const [showAssetLibrary, setShowAssetLibrary] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [activeTab, setActiveTab] = useState<'assets' | 'pptx' | 'avatar' | 'effects'>('assets')
  const [projectName, setProjectName] = useState('')
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)

  // ==================== EFFECTS ====================

  // Initialize with demo project if none loaded
  useEffect(() => {
    if (!isProjectLoaded) {
      const demoProject = {
        id: 'demo_project',
        name: 'Advanced Video Project',
        duration: 180,
        fps: 30,
        framerate: 30,
        resolution: { width: 1920, height: 1080 },
        currentTime: 0,
        zoomLevel: 1,
        selectedElementIds: [],
        clipboardElements: [],
        layers: [],
        tracks: [
          {
            id: 'main_track',
            name: 'Main Video',
            type: 'main' as const,
            locked: false,
            layers: [
              {
                id: 'video_layer',
                name: 'Video Layer',
                type: 'video' as const,
                elements: [],
                locked: false,
                visible: true,
                height: 80,
                color: '#3b82f6',
                order: 0
              }
            ]
          },
          {
            id: 'audio_track',
            name: 'Audio',
            type: 'audio' as const,
            locked: false,
            layers: [
              {
                id: 'audio_layer',
                name: 'Audio Layer',
                type: 'audio' as const,
                elements: [],
                locked: false,
                visible: true,
                height: 60,
                color: '#059669',
                order: 0
              }
            ]
          },
          {
            id: 'effect_track',
            name: 'Effects',
            type: 'effect' as const,
            locked: false,
            layers: [
              {
                id: 'text_layer',
                name: 'Text Layer',
                type: 'overlay' as const,
                elements: [],
                locked: false,
                visible: true,
                height: 50,
                color: '#eab308',
                order: 0
              }
            ]
          }
        ],
        markers: [],
        isPlaying: false,
        loop: false,
        volume: 1,
        zoom: 1,
        scrollX: 0,
        previewQuality: 'preview' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
      
      loadProject(demoProject)
    }
  }, [isProjectLoaded, loadProject])

  // ==================== HANDLERS ====================

  const handleCreateProject = useCallback(() => {
    if (projectName.trim()) {
      createNewProject(projectName.trim(), 120)
      setProjectName('')
      setShowNewProjectDialog(false)
    }
  }, [projectName, createNewProject])

  const handleAddElement = useCallback((type: string, duration: number = 5) => {
    if (!project) return

    // Find appropriate layer based on element type
    let targetLayerId = ''
    
    if (type === 'video' || type === 'image') {
      targetLayerId = project.tracks.find(t => t.type === 'main')?.layers[0]?.id || ''
    } else if (type === 'audio') {
      targetLayerId = project.tracks.find(t => t.type === 'audio')?.layers[0]?.id || ''
    } else {
      targetLayerId = project.tracks.find(t => t.type === 'effect')?.layers[0]?.id || ''
    }

    if (targetLayerId) {
      addElement({
        type: type as any,
        name: `New ${type}`,
        layerId: targetLayerId,
        startTime: 0,
        duration,
        endTime: duration,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        properties: [],
        locked: false,
        visible: true
      }, targetLayerId)
    }
  }, [project, addElement])

  const handleUploadPPTX = useCallback(() => {
    // Open file dialog for PPTX upload
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pptx'
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        // TODO: Process PPTX file and convert to timeline elements
        console.log('Processing PPTX:', file.name)
        
        // Mock PPTX processing - create slide elements
        for (let i = 0; i < 5; i++) {
          handleAddElement('pptx-slide', 8)
        }
      }
    }
    input.click()
  }, [handleAddElement])

  // ==================== ASSET LIBRARY ====================
  const renderAssetLibrary = () => (
    <div className="asset-library w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Asset Library Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Asset Library
          </h3>
          <button
            onClick={() => setShowAssetLibrary(false)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {[
            { id: 'assets', label: 'Media', icon: Library },
            { id: 'pptx', label: 'PPTX', icon: FileText },
            { id: 'avatar', label: '3D Avatar', icon: User },
            { id: 'effects', label: 'Effects', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Asset Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Add</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'video', icon: VideoIcon, label: 'Video', color: 'bg-blue-500' },
                  { type: 'audio', icon: Music, label: 'Audio', color: 'bg-green-500' },
                  { type: 'image', icon: Image, label: 'Image', color: 'bg-purple-500' },
                  { type: 'text', icon: FileText, label: 'Text', color: 'bg-yellow-500' }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleAddElement(item.type)}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col items-center space-y-2"
                  >
                    <div className={`p-2 ${item.color} text-white rounded`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Media</h4>
              <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Video, Audio, Images supported
                </p>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pptx' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PPTX Integration</h4>
              <p className="text-xs text-gray-500 mb-4">
                Convert PowerPoint slides to video sequences with automated narration
              </p>
              
              <button
                onClick={handleUploadPPTX}
                className="w-full p-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800/30 transition-colors"
              >
                <FileText size={24} className="mx-auto text-orange-600 mb-2" />
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  Upload PPTX File
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Auto-convert slides to timeline
                </p>
              </button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PPTX Templates</h4>
              <div className="space-y-2">
                {['Corporate Presentation', 'Educational Content', 'Marketing Slides'].map((template) => (
                  <button
                    key={template}
                    className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">{template}</p>
                    <p className="text-xs text-gray-500">Ready-to-use template</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'avatar' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">3D Avatars</h4>
              <p className="text-xs text-gray-500 mb-4">
                Hyper-realistic avatars with lip-sync and emotion control
              </p>
              
              <button className="w-full p-4 bg-pink-100 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-800/30 transition-colors">
                <User size={24} className="mx-auto text-pink-600 mb-2" />
                <p className="text-sm text-pink-700 dark:text-pink-300 font-medium">
                  Create Avatar
                </p>
                <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                  Ready Player Me integration
                </p>
              </button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Voice & TTS</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Mic size={16} />
                  <div className="text-left">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Neural TTS</p>
                    <p className="text-xs text-gray-500">Portuguese voices</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visual Effects</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Blur', 'Color Grade', 'Chromakey', 'Particles'].map((effect) => (
                  <button
                    key={effect}
                    onClick={() => handleAddElement('effect')}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
                  >
                    <Zap size={16} className="mx-auto mb-1 text-purple-500" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">{effect}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ==================== PREVIEW PANEL ====================
  const renderPreview = () => (
    <div className="preview-panel w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Preview
          </h3>
          <button
            onClick={() => setShowPreview(false)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
          <Play size={48} className="text-white opacity-50" />
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Info</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>Resolution: {project?.resolution.width}×{project?.resolution.height}</p>
              <p>Duration: {Math.floor((project?.duration || 0) / 60)}:{((project?.duration || 0) % 60).toFixed(0).padStart(2, '0')}</p>
              <p>Framerate: {project?.framerate} fps</p>
            </div>
          </div>

          {selection.elements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selection</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selection.elements.length} element(s) selected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ==================== MAIN RENDER ====================
  return (
    <div className={`advanced-video-studio h-screen flex flex-col bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <VideoIcon size={24} className="text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Advanced Video Studio
              </h1>
            </div>
            
            {project && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {project.name}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCollaboration(!showCollaboration)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
            >
              <Users size={16} />
              <span>Collaborate</span>
            </button>

            <button
              onClick={() => setShowAssetLibrary(!showAssetLibrary)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              title="Toggle asset library"
            >
              <Folder size={16} />
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              title="Toggle preview"
            >
              <Monitor size={16} />
            </button>

            <button
              onClick={() => setShowNewProjectDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <PlusCircle size={16} />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Asset Library */}
        <AnimatePresence>
          {showAssetLibrary && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderAssetLibrary()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdvancedTimelineEditor
            projectId={project?.id}
            showPropertyPanel={false}
            showCollaboration={showCollaboration}
            onElementSelect={(elementId) => {
              console.log('Selected element:', elementId)
            }}
            onTimeChange={(time) => {
              console.log('Time changed:', time)
            }}
          />
        </div>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ x: 384, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 384, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderPreview()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Project Dialog */}
      <AnimatePresence>
        {showNewProjectDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowNewProjectDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Create New Project
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter project name..."
                    autoFocus
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNewProjectDialog(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!projectName.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}