/**
 * Timeline Store - Estado global do editor de vídeo avançado
 * Sistema inspirado no Motionity com extensões para PPTX e Avatar 3D
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { 
  TimelineProject, 
  TimelineElement, 
  TimelineLayer, 
  TimelineTrack,
  TimelineMarker,
  TimelineKeyframe,
  TimelineSelection,
  TimelineHistory,
  DragData,
  RenderJob,
  TimelineCollaborator
} from '@/lib/types/timeline-types'

interface TimelineState {
  // ==================== PROJECT STATE ====================
  project: TimelineProject | null
  isProjectLoaded: boolean
  
  // ==================== PLAYBACK CONTROL ====================
  currentTime: number
  isPlaying: boolean
  duration: number
  loop: boolean
  volume: number
  
  // ==================== TIMELINE VIEW ====================
  zoom: number
  scrollX: number
  timelineHeight: number
  pixelsPerSecond: number
  
  // ==================== SELECTION & EDITING ====================
  selection: TimelineSelection
  clipboard: TimelineElement[]
  dragData: DragData | null
  isDragging: boolean
  
  // ==================== HISTORY & UNDO ====================
  history: TimelineHistory[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  
  // ==================== COLLABORATION ====================
  collaborators: TimelineCollaborator[]
  isCollaborationEnabled: boolean
  
  // ==================== RENDER ====================
  renderQueue: RenderJob[]
  currentRenderJob: RenderJob | null
}

interface TimelineActions {
  // ==================== PROJECT MANAGEMENT ====================
  loadProject: (project: TimelineProject) => void
  saveProject: () => Promise<void>
  createNewProject: (name: string, duration: number) => void
  duplicateProject: () => void
  
  // ==================== PLAYBACK CONTROL ====================
  play: () => void
  pause: () => void
  stop: () => void
  seekTo: (time: number) => void
  setLoop: (loop: boolean) => void
  setVolume: (volume: number) => void
  
  // ==================== TIMELINE VIEW ====================
  setZoom: (zoom: number) => void
  setScrollX: (scrollX: number) => void
  zoomToFit: () => void
  zoomToSelection: () => void
  
  // ==================== ELEMENT MANAGEMENT ====================
  addElement: (element: Omit<TimelineElement, 'id'>, layerId: string) => string
  updateElement: (id: string, updates: Partial<TimelineElement> | ((element: TimelineElement) => TimelineElement)) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => string
  moveElement: (id: string, newLayerId: string, newTime: number) => void
  
  // ==================== LAYER MANAGEMENT ====================
  addLayer: (layer: Omit<TimelineLayer, 'id'>, trackId: string) => string
  updateLayer: (id: string, updates: Partial<TimelineLayer>) => void
  deleteLayer: (id: string) => void
  duplicateLayer: (id: string) => string
  reorderLayer: (id: string, newOrder: number) => void
  
  // ==================== TRACK MANAGEMENT ====================
  addTrack: (track: Omit<TimelineTrack, 'id'>) => string
  updateTrack: (id: string, updates: Partial<TimelineTrack>) => void
  deleteTrack: (id: string) => void
  reorderTrack: (id: string, newIndex: number) => void
  
  // ==================== KEYFRAME MANAGEMENT ====================
  addKeyframe: (elementId: string, propertyName: string, keyframe: Omit<TimelineKeyframe, 'id'>) => string
  updateKeyframe: (elementId: string, propertyName: string, keyframeId: string, updates: Partial<TimelineKeyframe>) => void
  deleteKeyframe: (elementId: string, propertyName: string, keyframeId: string) => void
  
  // ==================== MARKER MANAGEMENT ====================
  addMarker: (marker: Omit<TimelineMarker, 'id'>) => string
  updateMarker: (id: string, updates: Partial<TimelineMarker>) => void
  deleteMarker: (id: string) => void
  
  // ==================== SELECTION & CLIPBOARD ====================
  selectElement: (id: string, addToSelection?: boolean) => void
  selectLayer: (id: string, addToSelection?: boolean) => void
  selectAll: () => void
  clearSelection: () => void
  copySelection: () => void
  cutSelection: () => void
  paste: (layerId: string, time: number) => void
  
  // ==================== DRAG & DROP ====================
  startDrag: (data: DragData) => void
  endDrag: () => void
  
  // ==================== HISTORY & UNDO ====================
  addToHistory: (action: string, description: string, data: any) => void
  undo: () => void
  redo: () => void
  clearHistory: () => void
  
  // ==================== COLLABORATION ====================
  addCollaborator: (collaborator: TimelineCollaborator) => void
  removeCollaborator: (id: string) => void
  updateCollaboratorCursor: (id: string, time: number, layerId?: string, elementId?: string) => void
  
  // ==================== RENDER ====================
  addRenderJob: (job: Omit<RenderJob, 'id'>) => string
  updateRenderJob: (id: string, updates: Partial<RenderJob>) => void
  cancelRenderJob: (id: string) => void
  clearRenderQueue: () => void
}

export const useTimelineStore = create<TimelineState & TimelineActions>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ==================== INITIAL STATE ====================
      project: null,
      isProjectLoaded: false,
      currentTime: 0,
      isPlaying: false,
      duration: 60,
      loop: false,
      volume: 1,
      zoom: 1,
      scrollX: 0,
      timelineHeight: 400,
      pixelsPerSecond: 100,
      selection: {
        elements: [],
        layers: [],
        keyframes: []
      },
      clipboard: [],
      dragData: null,
      isDragging: false,
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
      collaborators: [],
      isCollaborationEnabled: false,
      renderQueue: [],
      currentRenderJob: null,

      // ==================== PROJECT MANAGEMENT ====================
      loadProject: (project) => {
        set({
          project,
          isProjectLoaded: true,
          currentTime: project.currentTime,
          duration: project.duration,
          zoom: project.zoom,
          scrollX: project.scrollX,
          volume: project.volume,
          loop: project.loop
        })
      },

      saveProject: async () => {
        const { project } = get()
        if (!project) return

        try {
          // Update project with current state
          const updatedProject = {
            ...project,
            currentTime: get().currentTime,
            zoom: get().zoom,
            scrollX: get().scrollX,
            volume: get().volume,
            loop: get().loop,
            updatedAt: new Date()
          }

          // Save to backend/localStorage
          const response = await fetch('/api/v1/timeline/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProject)
          })

          if (response.ok) {
            set({ project: updatedProject })
          }
        } catch (error) {
          console.error('Failed to save project:', error)
        }
      },

      createNewProject: (name, duration) => {
        const newProject: TimelineProject = {
          id: `project_${Date.now()}`,
          name,
          duration,
          fps: 30,
          framerate: 30,
          resolution: { width: 1920, height: 1080 },
          currentTime: 0,
          zoomLevel: 1,
          selectedElementIds: [],
          clipboardElements: [],
          layers: [],
          tracks: [],
          markers: [],
          isPlaying: false,
          loop: false,
          volume: 1,
          zoom: 1,
          scrollX: 0,
          previewQuality: 'preview',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0'
        }

        set({
          project: newProject,
          isProjectLoaded: true,
          currentTime: 0,
          duration,
          zoom: 1,
          scrollX: 0
        })
      },

      duplicateProject: () => {
        const { project } = get()
        if (!project) return

        const duplicatedProject = {
          ...project,
          id: `project_${Date.now()}`,
          name: `${project.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set({ project: duplicatedProject })
      },

      // ==================== PLAYBACK CONTROL ====================
      play: () => {
        set({ isPlaying: true })
        get().addToHistory('play', 'Started playback', { time: get().currentTime })
      },

      pause: () => {
        set({ isPlaying: false })
        get().addToHistory('pause', 'Paused playback', { time: get().currentTime })
      },

      stop: () => {
        set({ isPlaying: false, currentTime: 0 })
        get().addToHistory('stop', 'Stopped playback', {})
      },

      seekTo: (time) => {
        const { duration } = get()
        const clampedTime = Math.max(0, Math.min(time, duration))
        set({ currentTime: clampedTime })
      },

      setLoop: (loop) => {
        set({ loop })
      },

      setVolume: (volume) => {
        const clampedVolume = Math.max(0, Math.min(volume, 1))
        set({ volume: clampedVolume })
      },

      // ==================== TIMELINE VIEW ====================
      setZoom: (zoom) => {
        const clampedZoom = Math.max(0.1, Math.min(zoom, 10))
        set({ 
          zoom: clampedZoom,
          pixelsPerSecond: 100 * clampedZoom
        })
      },

      setScrollX: (scrollX) => {
        set({ scrollX: Math.max(0, scrollX) })
      },

      zoomToFit: () => {
        const { duration } = get()
        const timelineWidth = 1200 // Assumindo largura da timeline
        const newZoom = timelineWidth / (duration * 100)
        get().setZoom(newZoom)
        set({ scrollX: 0 })
      },

      zoomToSelection: () => {
        const { selection, project } = get()
        if (!project || selection.elements.length === 0) return

        // Encontrar o range dos elementos selecionados
        let minTime = Infinity
        let maxTime = -Infinity

        project.tracks.forEach(track => {
          track.layers.forEach(layer => {
            layer.elements.forEach(element => {
              if (selection.elements.includes(element.id)) {
                minTime = Math.min(minTime, element.startTime)
                maxTime = Math.max(maxTime, element.endTime)
              }
            })
          })
        })

        if (minTime !== Infinity && maxTime !== -Infinity) {
          const duration = maxTime - minTime
          const timelineWidth = 1200
          const newZoom = timelineWidth / (duration * 100)
          get().setZoom(newZoom)
          set({ scrollX: minTime * get().pixelsPerSecond })
        }
      },

      // ==================== ELEMENT MANAGEMENT ====================
      addElement: (elementData, layerId) => {
        const { project } = get()
        if (!project) return ''

        const elementId = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newElement: TimelineElement = {
          ...elementData,
          id: elementId,
          layerId,
          properties: elementData.properties || [],
          locked: false,
          visible: true,
          x: elementData.x || 0,
          y: elementData.y || 0,
          width: elementData.width || 100,
          height: elementData.height || 100,
          rotation: elementData.rotation || 0,
          scaleX: elementData.scaleX || 1,
          scaleY: elementData.scaleY || 1,
          opacity: elementData.opacity || 1,
          endTime: elementData.startTime + elementData.duration
        }

        const updatedProject = { ...project }
        updatedProject.tracks.forEach(track => {
          track.layers.forEach(layer => {
            if (layer.id === layerId) {
              layer.elements.push(newElement)
            }
          })
        })

        set({ project: updatedProject })
        get().addToHistory('add_element', `Added ${newElement.type} element`, { elementId, layerId })
        
        return elementId
      },

      updateElement: (id, updates) => {
        const { project } = get()
        if (!project) return

        const updatedProject = { ...project }
        let elementFound = false

        updatedProject.tracks.forEach(track => {
          track.layers.forEach(layer => {
            layer.elements.forEach((element, index) => {
              if (element.id === id) {
                if (typeof updates === 'function') {
                  // Se é uma função, chama ela com o elemento atual
                  layer.elements[index] = updates(element)
                } else {
                  // Se é um objeto parcial, faz merge
                  Object.assign(element, updates)
                  if (updates.startTime !== undefined || updates.duration !== undefined) {
                    element.endTime = element.startTime + element.duration
                  }
                }
                elementFound = true
              }
            })
          })
        })

        if (elementFound) {
          set({ project: updatedProject })
          get().addToHistory('update_element', `Updated element ${id}`, { elementId: id, updates })
        }
      },

      deleteElement: (id) => {
        const { project } = get()
        if (!project) return

        const updatedProject = { ...project }
        let elementFound = false

        updatedProject.tracks.forEach(track => {
          track.layers.forEach(layer => {
            const elementIndex = layer.elements.findIndex(el => el.id === id)
            if (elementIndex !== -1) {
              layer.elements.splice(elementIndex, 1)
              elementFound = true
            }
          })
        })

        if (elementFound) {
          set({ project: updatedProject })
          
          // Remove from selection if selected
          const { selection } = get()
          const newSelection = {
            ...selection,
            elements: selection.elements.filter(elId => elId !== id)
          }
          set({ selection: newSelection })
          
          get().addToHistory('delete_element', `Deleted element ${id}`, { elementId: id })
        }
      },

      duplicateElement: (id) => {
        const { project } = get()
        if (!project) return ''

        let elementToDuplicate: TimelineElement | null = null
        let layerId = ''

        // Find element to duplicate
        project.tracks.forEach(track => {
          track.layers.forEach(layer => {
            const element = layer.elements.find(el => el.id === id)
            if (element) {
              elementToDuplicate = element
              layerId = layer.id
            }
          })
        })

        if (!elementToDuplicate) return ''

        // Create duplicated element
        const newElementId = get().addElement({
          ...elementToDuplicate,
          startTime: elementToDuplicate.endTime + 0.1, // Place after original
          name: `${elementToDuplicate.name} (Copy)`
        }, layerId)

        return newElementId
      },

      moveElement: (id, newLayerId, newTime) => {
        const { project } = get()
        if (!project) return

        let elementToMove: TimelineElement | null = null
        const updatedProject = { ...project }

        // Remove element from current layer
        updatedProject.tracks.forEach(track => {
          track.layers.forEach(layer => {
            const elementIndex = layer.elements.findIndex(el => el.id === id)
            if (elementIndex !== -1) {
              elementToMove = layer.elements.splice(elementIndex, 1)[0]
            }
          })
        })

        // Add element to new layer with new time
        if (elementToMove) {
          elementToMove.startTime = newTime
          elementToMove.endTime = newTime + elementToMove.duration
          elementToMove.layerId = newLayerId

          updatedProject.tracks.forEach(track => {
            track.layers.forEach(layer => {
              if (layer.id === newLayerId) {
                layer.elements.push(elementToMove!)
              }
            })
          })

          set({ project: updatedProject })
          get().addToHistory('move_element', `Moved element ${id}`, { 
            elementId: id, 
            newLayerId, 
            newTime 
          })
        }
      },

      // ==================== SELECTION & CLIPBOARD ====================
      selectElement: (id, addToSelection = false) => {
        const { selection } = get()
        
        if (addToSelection) {
          const newElements = selection.elements.includes(id)
            ? selection.elements.filter(elId => elId !== id)
            : [...selection.elements, id]
          
          set({
            selection: {
              ...selection,
              elements: newElements
            }
          })
        } else {
          set({
            selection: {
              elements: [id],
              layers: [],
              keyframes: []
            }
          })
        }
      },

      selectLayer: (id, addToSelection = false) => {
        const { selection } = get()
        
        if (addToSelection) {
          const newLayers = selection.layers.includes(id)
            ? selection.layers.filter(layerId => layerId !== id)
            : [...selection.layers, id]
          
          set({
            selection: {
              ...selection,
              layers: newLayers
            }
          })
        } else {
          set({
            selection: {
              elements: [],
              layers: [id],
              keyframes: []
            }
          })
        }
      },

      selectAll: () => {
        const { project } = get()
        if (!project) return

        const allElements: string[] = []
        const allLayers: string[] = []

        project.tracks.forEach(track => {
          track.layers.forEach(layer => {
            allLayers.push(layer.id)
            layer.elements.forEach(element => {
              allElements.push(element.id)
            })
          })
        })

        set({
          selection: {
            elements: allElements,
            layers: allLayers,
            keyframes: []
          }
        })
      },

      clearSelection: () => {
        set({
          selection: {
            elements: [],
            layers: [],
            keyframes: []
          }
        })
      },

      copySelection: () => {
        const { project, selection } = get()
        if (!project) return

        const elementsToCopy: TimelineElement[] = []

        project.tracks.forEach(track => {
          track.layers.forEach(layer => {
            layer.elements.forEach(element => {
              if (selection.elements.includes(element.id)) {
                elementsToCopy.push({ ...element })
              }
            })
          })
        })

        set({ clipboard: elementsToCopy })
        get().addToHistory('copy', `Copied ${elementsToCopy.length} elements`, { count: elementsToCopy.length })
      },

      cutSelection: () => {
        get().copySelection()
        
        const { selection } = get()
        selection.elements.forEach(id => {
          get().deleteElement(id)
        })
        
        get().clearSelection()
        get().addToHistory('cut', `Cut ${selection.elements.length} elements`, { count: selection.elements.length })
      },

      paste: (layerId, time) => {
        const { clipboard } = get()
        if (clipboard.length === 0) return

        const pastedIds: string[] = []

        clipboard.forEach(element => {
          const newId = get().addElement({
            ...element,
            startTime: time,
            name: `${element.name} (Pasted)`
          }, layerId)
          pastedIds.push(newId)
        })

        // Select pasted elements
        set({
          selection: {
            elements: pastedIds,
            layers: [],
            keyframes: []
          }
        })

        get().addToHistory('paste', `Pasted ${pastedIds.length} elements`, { elementIds: pastedIds, layerId, time })
      },

      // ==================== DRAG & DROP ====================
      startDrag: (data) => {
        set({ dragData: data, isDragging: true })
      },

      endDrag: () => {
        set({ dragData: null, isDragging: false })
      },

      // ==================== HISTORY & UNDO ====================
      addToHistory: (action, description, data) => {
        const { history, historyIndex } = get()
        
        const newHistoryItem: TimelineHistory = {
          id: `history_${Date.now()}`,
          action,
          description,
          timestamp: new Date(),
          userId: 'current-user', // TODO: get from auth
          data,
          canUndo: true,
          canRedo: false
        }

        // Remove any history items after current index (for redo functionality)
        const newHistory = [...history.slice(0, historyIndex + 1), newHistoryItem]
        
        // Limit history size
        const maxHistorySize = 50
        if (newHistory.length > maxHistorySize) {
          newHistory.shift()
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
          canUndo: true,
          canRedo: false
        })
      },

      undo: () => {
        const { historyIndex, canUndo } = get()
        if (!canUndo || historyIndex < 0) return

        // TODO: Implement actual undo logic based on action type
        set({
          historyIndex: historyIndex - 1,
          canUndo: historyIndex > 0,
          canRedo: true
        })
      },

      redo: () => {
        const { history, historyIndex, canRedo } = get()
        if (!canRedo || historyIndex >= history.length - 1) return

        // TODO: Implement actual redo logic based on action type
        set({
          historyIndex: historyIndex + 1,
          canUndo: true,
          canRedo: historyIndex < history.length - 2
        })
      },

      clearHistory: () => {
        set({
          history: [],
          historyIndex: -1,
          canUndo: false,
          canRedo: false
        })
      },

      // ==================== LAYER MANAGEMENT ====================
      addLayer: (layerData, trackId) => {
        const { project } = get()
        if (!project) return ''

        const layerId = `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newLayer: TimelineLayer = {
          ...layerData,
          id: layerId,
          elements: layerData.elements || [],
          locked: false,
          visible: true,
          height: layerData.height || 60,
          order: layerData.order || 0
        }

        const updatedProject = { ...project }
        const track = updatedProject.tracks.find(t => t.id === trackId)
        if (track) {
          track.layers.push(newLayer)
          set({ project: updatedProject })
          get().addToHistory('add_layer', `Added layer ${newLayer.name}`, { layerId, trackId })
        }

        return layerId
      },

      updateLayer: (id, updates) => {
        const { project } = get()
        if (!project) return

        const updatedProject = { ...project }
        let layerFound = false

        updatedProject.tracks.forEach(track => {
          const layer = track.layers.find(l => l.id === id)
          if (layer) {
            Object.assign(layer, updates)
            layerFound = true
          }
        })

        if (layerFound) {
          set({ project: updatedProject })
          get().addToHistory('update_layer', `Updated layer ${id}`, { layerId: id, updates })
        }
      },

      deleteLayer: (id) => {
        const { project } = get()
        if (!project) return

        const updatedProject = { ...project }
        let layerFound = false

        updatedProject.tracks.forEach(track => {
          const layerIndex = track.layers.findIndex(l => l.id === id)
          if (layerIndex !== -1) {
            track.layers.splice(layerIndex, 1)
            layerFound = true
          }
        })

        if (layerFound) {
          set({ project: updatedProject })
          get().addToHistory('delete_layer', `Deleted layer ${id}`, { layerId: id })
        }
      },

      duplicateLayer: (id) => {
        const { project } = get()
        if (!project) return ''

        let layerToDuplicate: TimelineLayer | null = null
        let trackId = ''

        project.tracks.forEach(track => {
          const layer = track.layers.find(l => l.id === id)
          if (layer) {
            layerToDuplicate = layer
            trackId = track.id
          }
        })

        if (!layerToDuplicate) return ''

        const newLayerId = get().addLayer({
          ...layerToDuplicate,
          name: `${layerToDuplicate.name} (Copy)`,
          elements: layerToDuplicate.elements.map(el => ({
            ...el,
            id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }))
        }, trackId)

        return newLayerId
      },

      reorderLayer: (id, newOrder) => {
        get().updateLayer(id, { order: newOrder })
      },

      // ==================== TRACK MANAGEMENT ====================
      addTrack: (trackData) => {
        const { project } = get()
        if (!project) return ''

        const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newTrack: TimelineTrack = {
          ...trackData,
          id: trackId,
          layers: trackData.layers || [],
          locked: false
        }

        const updatedProject = {
          ...project,
          tracks: [...project.tracks, newTrack]
        }

        set({ project: updatedProject })
        get().addToHistory('add_track', `Added track ${newTrack.name}`, { trackId })

        return trackId
      },

      updateTrack: (id, updates) => {
        const { project } = get()
        if (!project) return

        const updatedProject = { ...project }
        const track = updatedProject.tracks.find(t => t.id === id)
        if (track) {
          Object.assign(track, updates)
          set({ project: updatedProject })
          get().addToHistory('update_track', `Updated track ${id}`, { trackId: id, updates })
        }
      },

      deleteTrack: (id) => {
        const { project } = get()
        if (!project) return

        const updatedProject = {
          ...project,
          tracks: project.tracks.filter(t => t.id !== id)
        }

        set({ project: updatedProject })
        get().addToHistory('delete_track', `Deleted track ${id}`, { trackId: id })
      },

      reorderTrack: (id, newIndex) => {
        const { project } = get()
        if (!project) return

        const updatedProject = { ...project }
        const trackIndex = updatedProject.tracks.findIndex(t => t.id === id)
        
        if (trackIndex !== -1) {
          const [track] = updatedProject.tracks.splice(trackIndex, 1)
          updatedProject.tracks.splice(newIndex, 0, track)
          
          set({ project: updatedProject })
          get().addToHistory('reorder_track', `Reordered track ${id}`, { trackId: id, newIndex })
        }
      },

      // ==================== KEYFRAME MANAGEMENT ====================
      addKeyframe: (elementId, propertyName, keyframeData) => {
        const keyframeId = `keyframe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newKeyframe: TimelineKeyframe = {
          ...keyframeData,
          id: keyframeId,
          easing: keyframeData.easing || 'linear',
          interpolation: keyframeData.interpolation || 'linear'
        }

        get().updateElement(elementId, (element: TimelineElement) => {
          const property = element.properties.find(p => p.name === propertyName)
          if (property) {
            property.keyframes.push(newKeyframe)
            // Sort keyframes by time
            property.keyframes.sort((a, b) => a.time - b.time)
          }
          return element
        })

        get().addToHistory('add_keyframe', `Added keyframe for ${propertyName}`, { 
          elementId, 
          propertyName, 
          keyframeId 
        })

        return keyframeId
      },

      updateKeyframe: (elementId, propertyName, keyframeId, updates) => {
        get().updateElement(elementId, (element: TimelineElement) => {
          const property = element.properties.find(p => p.name === propertyName)
          if (property) {
            const keyframe = property.keyframes.find(k => k.id === keyframeId)
            if (keyframe) {
              Object.assign(keyframe, updates)
              // Re-sort keyframes by time if time was updated
              if (updates.time !== undefined) {
                property.keyframes.sort((a, b) => a.time - b.time)
              }
            }
          }
          return element
        })

        get().addToHistory('update_keyframe', `Updated keyframe ${keyframeId}`, { 
          elementId, 
          propertyName, 
          keyframeId, 
          updates 
        })
      },

      deleteKeyframe: (elementId, propertyName, keyframeId) => {
        get().updateElement(elementId, (element: TimelineElement) => {
          const property = element.properties.find(p => p.name === propertyName)
          if (property) {
            property.keyframes = property.keyframes.filter(k => k.id !== keyframeId)
          }
          return element
        })

        get().addToHistory('delete_keyframe', `Deleted keyframe ${keyframeId}`, { 
          elementId, 
          propertyName, 
          keyframeId 
        })
      },

      // ==================== MARKER MANAGEMENT ====================
      addMarker: (markerData) => {
        const { project } = get()
        if (!project) return ''

        const markerId = `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newMarker: TimelineMarker = {
          ...markerData,
          id: markerId
        }

        const updatedProject = {
          ...project,
          markers: [...project.markers, newMarker].sort((a, b) => a.time - b.time)
        }

        set({ project: updatedProject })
        get().addToHistory('add_marker', `Added marker ${newMarker.name}`, { markerId })

        return markerId
      },

      updateMarker: (id, updates) => {
        const { project } = get()
        if (!project) return

        const updatedProject = { ...project }
        const marker = updatedProject.markers.find(m => m.id === id)
        
        if (marker) {
          Object.assign(marker, updates)
          
          // Re-sort markers if time was updated
          if (updates.time !== undefined) {
            updatedProject.markers.sort((a, b) => a.time - b.time)
          }
          
          set({ project: updatedProject })
          get().addToHistory('update_marker', `Updated marker ${id}`, { markerId: id, updates })
        }
      },

      deleteMarker: (id) => {
        const { project } = get()
        if (!project) return

        const updatedProject = {
          ...project,
          markers: project.markers.filter(m => m.id !== id)
        }

        set({ project: updatedProject })
        get().addToHistory('delete_marker', `Deleted marker ${id}`, { markerId: id })
      },

      // ==================== COLLABORATION ====================
      addCollaborator: (collaborator) => {
        const { collaborators } = get()
        set({
          collaborators: [...collaborators, collaborator]
        })
      },

      removeCollaborator: (id) => {
        const { collaborators } = get()
        set({
          collaborators: collaborators.filter(c => c.id !== id)
        })
      },

      updateCollaboratorCursor: (id, time, layerId, elementId) => {
        const { collaborators } = get()
        const updatedCollaborators = collaborators.map(c => 
          c.id === id 
            ? { 
                ...c, 
                cursor: { time, layerId, elementId },
                lastActivity: new Date()
              }
            : c
        )
        set({ collaborators: updatedCollaborators })
      },

      // ==================== RENDER ====================
      addRenderJob: (jobData) => {
        const jobId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newJob: RenderJob = {
          ...jobData,
          id: jobId,
          status: 'queued',
          progress: 0
        }

        const { renderQueue } = get()
        set({ 
          renderQueue: [...renderQueue, newJob],
          currentRenderJob: renderQueue.length === 0 ? newJob : get().currentRenderJob
        })

        get().addToHistory('add_render_job', `Added render job`, { jobId })

        return jobId
      },

      updateRenderJob: (id, updates) => {
        const { renderQueue, currentRenderJob } = get()
        
        const updatedQueue = renderQueue.map(job => 
          job.id === id ? { ...job, ...updates } : job
        )
        
        const updatedCurrentJob = currentRenderJob?.id === id 
          ? { ...currentRenderJob, ...updates }
          : currentRenderJob

        set({ 
          renderQueue: updatedQueue,
          currentRenderJob: updatedCurrentJob
        })
      },

      cancelRenderJob: (id) => {
        get().updateRenderJob(id, { status: 'cancelled' })
        get().addToHistory('cancel_render_job', `Cancelled render job ${id}`, { jobId: id })
      },

      clearRenderQueue: () => {
        set({ 
          renderQueue: [],
          currentRenderJob: null
        })
      }
    })),
    {
      name: 'timeline-store'
    }
  )
)

// Selector hooks for performance optimization
export const useTimelineProject = () => useTimelineStore(state => state.project)
export const useTimelinePlayback = () => useTimelineStore(state => ({
  currentTime: state.currentTime,
  isPlaying: state.isPlaying,
  duration: state.duration,
  volume: state.volume,
  loop: state.loop
}))
export const useTimelineView = () => useTimelineStore(state => ({
  zoom: state.zoom,
  scrollX: state.scrollX,
  pixelsPerSecond: state.pixelsPerSecond
}))
export const useTimelineSelection = () => useTimelineStore(state => state.selection)
export const useTimelineHistory = () => useTimelineStore(state => ({
  canUndo: state.canUndo,
  canRedo: state.canRedo,
  history: state.history
}))
export const useTimelineCollaboration = () => useTimelineStore(state => ({
  collaborators: state.collaborators,
  isCollaborationEnabled: state.isCollaborationEnabled
}))