# Canvas Editor com Fabric.js

---
llm_context: |
  Implementação completa do Canvas Editor usando Fabric.js para manipulação visual de elementos.
  Fase: 2
  Dependências: gerenciamento-estado.md, timeline-multitrack.md
  Tempo: 8-12 horas de desenvolvimento
  Complexidade: Média

llm_instructions: |
  1. Leia este documento completamente antes de começar
  2. Fabric.js já está instalado (v6.7.1 no package.json)
  3. Implemente cada componente na ordem apresentada
  4. Teste cada feature conforme implementa
  5. Valide com o checklist de conclusão ao final

llm_related_files:
  - 04_FASE_2_EDITOR/gerenciamento-estado.md
  - 04_FASE_2_EDITOR/paineis-laterais.md
  - 10_IMPLEMENTACAO/checklist-fase-2.md
---

> **Objetivo:** Criar editor visual de canvas completo com Fabric.js para manipular elementos de vídeo
> **Fase:** 2 - Editor Profissional
> **Prioridade:** 🔴 ALTA
> **Tempo estimado:** 8-12 horas
> **Dependências:** Zustand (state management), Fabric.js (já instalado)

---

## 🎯 O que Vamos Construir

Um editor de canvas profissional onde usuários podem:
- Adicionar e manipular textos, formas, imagens
- Transformar elementos (mover, escalar, rotacionar)
- Gerenciar camadas (z-index, visibilidade, lock)
- Agrupar e alinhar elementos
- Aplicar estilos (cores, bordas, sombras)
- Integrar com timeline para animações

**Referências visuais:**
- Interface similar ao Canva/Figma
- Canvas central 1920x1080
- Painéis laterais para camadas e propriedades

---

## 📋 Pré-requisitos

### Conhecimentos Necessários
- [x] React e TypeScript
- [x] Fabric.js básico
- [x] Zustand para state management
- [x] Event handling

### Verificar Instalações

```bash
# Verificar se Fabric.js está instalado
grep "fabric" estudio_ia_videos/package.json

# Deve mostrar:
# "fabric": "^6.7.1"
```

### Arquivos que Devem Existir

```
estudio_ia_videos/
├── app/stores/
│   └── editor-store.ts          # Criar na seção 1
├── app/components/video-studio/
│   └── canvas/
│       ├── CanvasEditor.tsx      # Componente principal
│       ├── Toolbar.tsx           # Ferramentas laterais
│       └── types.ts              # Tipos TypeScript
```

---

## 🔧 Implementação

### Passo 1: Criar Store do Editor (Zustand)

```typescript
// app/stores/editor-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Canvas, FabricObject } from 'fabric';

export interface EditorState {
  // Canvas
  canvas: Canvas | null;
  selectedObjects: FabricObject[];
  clipboard: FabricObject | null;

  // History (undo/redo)
  history: {
    past: string[];
    present: string | null;
    future: string[];
  };

  // UI State
  tool: 'select' | 'text' | 'rect' | 'circle' | 'line' | 'image';
  zoom: number;

  // Actions
  setCanvas: (canvas: Canvas | null) => void;
  setSelectedObjects: (objects: FabricObject[]) => void;
  setTool: (tool: EditorState['tool']) => void;
  setZoom: (zoom: number) => void;

  // History actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Clipboard actions
  copy: () => void;
  paste: () => void;
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      // Initial state
      canvas: null,
      selectedObjects: [],
      clipboard: null,
      history: {
        past: [],
        present: null,
        future: []
      },
      tool: 'select',
      zoom: 1,

      // Actions
      setCanvas: (canvas) => set({ canvas }),

      setSelectedObjects: (objects) => set({ selectedObjects: objects }),

      setTool: (tool) => set({ tool }),

      setZoom: (zoom) => {
        const { canvas } = get();
        if (canvas) {
          canvas.setZoom(zoom);
          canvas.renderAll();
        }
        set({ zoom });
      },

      pushHistory: () => {
        const { canvas, history } = get();
        if (!canvas) return;

        const state = JSON.stringify(canvas.toJSON());
        set({
          history: {
            past: [...history.past, history.present!].filter(Boolean),
            present: state,
            future: []
          }
        });
      },

      undo: () => {
        const { canvas, history } = get();
        if (!canvas || history.past.length === 0) return;

        const previous = history.past[history.past.length - 1];
        canvas.loadFromJSON(JSON.parse(previous), () => {
          canvas.renderAll();
        });

        set({
          history: {
            past: history.past.slice(0, -1),
            present: previous,
            future: [history.present!, ...history.future]
          }
        });
      },

      redo: () => {
        const { canvas, history } = get();
        if (!canvas || history.future.length === 0) return;

        const next = history.future[0];
        canvas.loadFromJSON(JSON.parse(next), () => {
          canvas.renderAll();
        });

        set({
          history: {
            past: [...history.past, history.present!],
            present: next,
            future: history.future.slice(1)
          }
        });
      },

      copy: () => {
        const { canvas } = get();
        const activeObject = canvas?.getActiveObject();
        if (activeObject) {
          activeObject.clone().then((cloned: FabricObject) => {
            set({ clipboard: cloned });
          });
        }
      },

      paste: () => {
        const { canvas, clipboard } = get();
        if (!canvas || !clipboard) return;

        clipboard.clone().then((cloned: FabricObject) => {
          cloned.set({
            left: (cloned.left || 0) + 10,
            top: (cloned.top || 0) + 10
          });

          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          canvas.renderAll();

          get().pushHistory();
        });
      }
    }),
    { name: 'EditorStore' }
  )
);
```

---

### Passo 2: Componente Principal do Canvas

```typescript
// app/components/video-studio/canvas/CanvasEditor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, IText, Rect, Circle, FabricImage } from 'fabric';
import { useEditorStore } from '@/app/stores/editor-store';

export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    canvas,
    setCanvas,
    setSelectedObjects,
    tool,
    pushHistory
  } = useEditorStore();

  // Inicializar canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 1920,
      height: 1080,
      backgroundColor: '#1a1a1a',
      preserveObjectStacking: true
    });

    setCanvas(fabricCanvas);

    // Event listeners
    fabricCanvas.on('selection:created', (e) => {
      setSelectedObjects(e.selected || []);
    });

    fabricCanvas.on('selection:updated', (e) => {
      setSelectedObjects(e.selected || []);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObjects([]);
    });

    fabricCanvas.on('object:modified', () => {
      pushHistory();
    });

    fabricCanvas.on('object:added', () => {
      pushHistory();
    });

    fabricCanvas.on('object:removed', () => {
      pushHistory();
    });

    // Cleanup
    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [setCanvas, setSelectedObjects, pushHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObjects = canvas.getActiveObjects();
        activeObjects.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.renderAll();
      }

      // Copy (Ctrl/Cmd + C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        useEditorStore.getState().copy();
      }

      // Paste (Ctrl/Cmd + V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        useEditorStore.getState().paste();
      }

      // Undo (Ctrl/Cmd + Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().undo();
      }

      // Redo (Ctrl/Cmd + Shift + Z)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas]);

  // Auto-resize canvas
  useEffect(() => {
    if (!containerRef.current || !canvas) return;

    const resizeCanvas = () => {
      const container = containerRef.current!;
      const rect = container.getBoundingClientRect();

      // Manter aspect ratio 16:9
      const scale = Math.min(
        rect.width / 1920,
        rect.height / 1080
      );

      canvas.setDimensions({
        width: 1920 * scale,
        height: 1080 * scale
      });

      canvas.setZoom(scale);
      canvas.renderAll();
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(containerRef.current);

    resizeCanvas();

    return () => observer.disconnect();
  }, [canvas]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-gray-900 overflow-hidden"
    >
      <canvas ref={canvasRef} className="shadow-2xl" />
    </div>
  );
}
```

---

### Passo 3: Toolbar de Ferramentas

```typescript
// app/components/video-studio/canvas/Toolbar.tsx
'use client';

import { useEditorStore } from '@/app/stores/editor-store';
import { IText, Rect, Circle, Line } from 'fabric';

export function Toolbar() {
  const { canvas, tool, setTool } = useEditorStore();

  const addText = () => {
    if (!canvas) return;

    const text = new IText('Digite aqui...', {
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2 - 25,
      fontFamily: 'Inter, sans-serif',
      fontSize: 48,
      fill: '#ffffff',
      fontWeight: 'bold'
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();

    // Focus no texto para edição imediata
    text.enterEditing();
  };

  const addRectangle = () => {
    if (!canvas) return;

    const rect = new Rect({
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2 - 75,
      width: 200,
      height: 150,
      fill: '#3b82f6',
      stroke: '#2563eb',
      strokeWidth: 2,
      rx: 8,
      ry: 8
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas) return;

    const circle = new Circle({
      left: canvas.width! / 2 - 75,
      top: canvas.height! / 2 - 75,
      radius: 75,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const addLine = () => {
    if (!canvas) return;

    const line = new Line([50, 50, 250, 50], {
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2,
      stroke: '#f59e0b',
      strokeWidth: 4,
      strokeLineCap: 'round'
    });

    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  };

  const addImage = async () => {
    if (!canvas) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const fabricImg = new FabricImage(img, {
            left: canvas.width! / 2 - img.width / 2,
            top: canvas.height! / 2 - img.height / 2,
            scaleX: Math.min(1, 400 / img.width),
            scaleY: Math.min(1, 400 / img.height)
          });

          canvas.add(fabricImg);
          canvas.setActiveObject(fabricImg);
          canvas.renderAll();
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const deleteSelected = () => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach(obj => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const tools = [
    { icon: '↖', label: 'Selecionar', value: 'select' as const, action: () => setTool('select') },
    { icon: 'T', label: 'Texto', value: 'text' as const, action: addText },
    { icon: '□', label: 'Retângulo', value: 'rect' as const, action: addRectangle },
    { icon: '○', label: 'Círculo', value: 'circle' as const, action: addCircle },
    { icon: '/', label: 'Linha', value: 'line' as const, action: addLine },
    { icon: '🖼', label: 'Imagem', value: 'image' as const, action: addImage },
    { icon: '🗑', label: 'Deletar', value: 'delete' as const, action: deleteSelected }
  ];

  return (
    <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center gap-1 p-2">
      {tools.map((t) => (
        <button
          key={t.value}
          onClick={t.action}
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            text-lg font-bold transition-colors
            ${tool === t.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}

      <div className="flex-1" />

      {/* Undo/Redo */}
      <button
        onClick={() => useEditorStore.getState().undo()}
        className="w-12 h-12 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center justify-center"
        title="Desfazer (Ctrl+Z)"
      >
        ↶
      </button>
      <button
        onClick={() => useEditorStore.getState().redo()}
        className="w-12 h-12 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center justify-center"
        title="Refazer (Ctrl+Shift+Z)"
      >
        ↷
      </button>
    </div>
  );
}
```

---

### Passo 4: Painel de Propriedades

```typescript
// app/components/video-studio/canvas/PropertiesPanel.tsx
'use client';

import { useEditorStore } from '@/app/stores/editor-store';
import { useEffect, useState } from 'react';
import type { FabricObject } from 'fabric';

export function PropertiesPanel() {
  const { canvas, selectedObjects } = useEditorStore();
  const [properties, setProperties] = useState<Record<string, any>>({});

  const selectedObject = selectedObjects[0];

  useEffect(() => {
    if (!selectedObject) {
      setProperties({});
      return;
    }

    setProperties({
      left: Math.round(selectedObject.left || 0),
      top: Math.round(selectedObject.top || 0),
      width: Math.round(selectedObject.width || 0),
      height: Math.round(selectedObject.height || 0),
      scaleX: selectedObject.scaleX || 1,
      scaleY: selectedObject.scaleY || 1,
      angle: Math.round(selectedObject.angle || 0),
      opacity: selectedObject.opacity || 1,
      fill: selectedObject.fill as string || '#000000'
    });
  }, [selectedObject]);

  if (!selectedObject) {
    return (
      <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
        <p className="text-gray-400 text-sm">
          Selecione um elemento para editar
        </p>
      </div>
    );
  }

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject || !canvas) return;

    selectedObject.set(key as keyof FabricObject, value);
    canvas.renderAll();
    useEditorStore.getState().pushHistory();

    setProperties(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <h3 className="text-white font-semibold mb-4">Propriedades</h3>

      {/* Position */}
      <div className="mb-4">
        <label className="text-gray-400 text-xs mb-1 block">Posição</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={properties.left}
            onChange={(e) => updateProperty('left', Number(e.target.value))}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            placeholder="X"
          />
          <input
            type="number"
            value={properties.top}
            onChange={(e) => updateProperty('top', Number(e.target.value))}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            placeholder="Y"
          />
        </div>
      </div>

      {/* Size */}
      <div className="mb-4">
        <label className="text-gray-400 text-xs mb-1 block">Tamanho</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={Math.round(properties.width * properties.scaleX)}
            onChange={(e) => updateProperty('scaleX', Number(e.target.value) / properties.width)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            placeholder="W"
          />
          <input
            type="number"
            value={Math.round(properties.height * properties.scaleY)}
            onChange={(e) => updateProperty('scaleY', Number(e.target.value) / properties.height)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            placeholder="H"
          />
        </div>
      </div>

      {/* Rotation */}
      <div className="mb-4">
        <label className="text-gray-400 text-xs mb-1 block">Rotação</label>
        <input
          type="range"
          min="0"
          max="360"
          value={properties.angle}
          onChange={(e) => updateProperty('angle', Number(e.target.value))}
          className="w-full"
        />
        <span className="text-white text-sm">{properties.angle}°</span>
      </div>

      {/* Opacity */}
      <div className="mb-4">
        <label className="text-gray-400 text-xs mb-1 block">Opacidade</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={properties.opacity}
          onChange={(e) => updateProperty('opacity', Number(e.target.value))}
          className="w-full"
        />
        <span className="text-white text-sm">{Math.round(properties.opacity * 100)}%</span>
      </div>

      {/* Fill Color */}
      {selectedObject.fill && (
        <div className="mb-4">
          <label className="text-gray-400 text-xs mb-1 block">Cor de Preenchimento</label>
          <input
            type="color"
            value={properties.fill}
            onChange={(e) => updateProperty('fill', e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 space-y-2">
        <button
          onClick={() => selectedObject.bringToFront()}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm"
        >
          Trazer para Frente
        </button>
        <button
          onClick={() => selectedObject.sendToBack()}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm"
        >
          Enviar para Trás
        </button>
        <button
          onClick={() => {
            selectedObject.clone().then((cloned: FabricObject) => {
              cloned.set({ left: (cloned.left || 0) + 10, top: (cloned.top || 0) + 10 });
              canvas?.add(cloned);
              canvas?.setActiveObject(cloned);
              canvas?.renderAll();
            });
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm"
        >
          Duplicar
        </button>
      </div>
    </div>
  );
}
```

---

### Passo 5: Integração Completa

```typescript
// app/components/video-studio/VideoStudio.tsx
'use client';

import { CanvasEditor } from './canvas/CanvasEditor';
import { Toolbar } from './canvas/Toolbar';
import { PropertiesPanel } from './canvas/PropertiesPanel';
import { LayersPanel } from './canvas/LayersPanel'; // Criar depois

export function VideoStudio() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Toolbar esquerda */}
      <Toolbar />

      {/* Canvas central */}
      <CanvasEditor />

      {/* Painéis direita */}
      <div className="flex">
        <PropertiesPanel />
      </div>
    </div>
  );
}
```

---

## 🧪 Testes

```typescript
// __tests__/components/canvas/CanvasEditor.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { CanvasEditor } from '@/app/components/video-studio/canvas/CanvasEditor';
import { useEditorStore } from '@/app/stores/editor-store';

describe('CanvasEditor', () => {
  beforeEach(() => {
    useEditorStore.setState({
      canvas: null,
      selectedObjects: [],
      tool: 'select',
      zoom: 1
    });
  });

  it('should initialize canvas on mount', async () => {
    render(<CanvasEditor />);

    await waitFor(() => {
      const state = useEditorStore.getState();
      expect(state.canvas).not.toBeNull();
      expect(state.canvas?.width).toBe(1920);
      expect(state.canvas?.height).toBe(1080);
    });
  });

  it('should cleanup canvas on unmount', async () => {
    const { unmount } = render(<CanvasEditor />);

    await waitFor(() => {
      expect(useEditorStore.getState().canvas).not.toBeNull();
    });

    unmount();

    expect(useEditorStore.getState().canvas).toBeNull();
  });

  it('should handle keyboard shortcuts', async () => {
    render(<CanvasEditor />);

    await waitFor(() => {
      expect(useEditorStore.getState().canvas).not.toBeNull();
    });

    // Simular Ctrl+Z (undo)
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true
    });

    window.dispatchEvent(event);

    // Verificar que undo foi chamado
    // (precisa de mock ou spy)
  });
});

// __tests__/stores/editor-store.test.ts
import { useEditorStore } from '@/app/stores/editor-store';
import { Canvas, Rect } from 'fabric';

describe('EditorStore', () => {
  let canvas: Canvas;

  beforeEach(() => {
    canvas = new Canvas(document.createElement('canvas'));
    useEditorStore.setState({ canvas });
  });

  it('should push to history on pushHistory', () => {
    const initialHistory = useEditorStore.getState().history;

    useEditorStore.getState().pushHistory();

    const newHistory = useEditorStore.getState().history;
    expect(newHistory.past.length).toBe(initialHistory.past.length + 1);
  });

  it('should undo correctly', () => {
    // Adicionar elemento
    const rect = new Rect({ width: 100, height: 100 });
    canvas.add(rect);

    useEditorStore.getState().pushHistory();

    // Modificar elemento
    rect.set({ width: 200 });
    useEditorStore.getState().pushHistory();

    // Undo
    useEditorStore.getState().undo();

    const objects = canvas.getObjects();
    expect(objects[0].width).toBe(100);
  });
});
```

---

## ✅ Checklist de Conclusão

- [ ] Store do editor criado (editor-store.ts)
- [ ] Componente CanvasEditor funcional
- [ ] Toolbar com todas as ferramentas
- [ ] Painel de propriedades atualiza ao selecionar
- [ ] Keyboard shortcuts funcionando:
  - [ ] Delete/Backspace deleta elemento
  - [ ] Ctrl/Cmd+C copia
  - [ ] Ctrl/Cmd+V cola
  - [ ] Ctrl/Cmd+Z desfaz
  - [ ] Ctrl/Cmd+Shift+Z refaz
- [ ] Canvas redimensiona responsivamente
- [ ] Elementos podem ser:
  - [ ] Adicionados (texto, forma, imagem)
  - [ ] Selecionados
  - [ ] Movidos
  - [ ] Escalados
  - [ ] Rotacionados
  - [ ] Deletados
- [ ] Undo/Redo funcionando
- [ ] Testes unitários passando (> 70% cobertura)
- [ ] Performance: canvas roda a 60 FPS com 50+ elementos

---

## 🔗 Próximos Passos

Após completar o Canvas Editor:

1. **Integrar com Timeline:** [timeline-multitrack.md](timeline-multitrack.md)
2. **Adicionar Keyframes:** [keyframes-system.md](keyframes-system.md)
3. **Criar Layers Panel:** [paineis-laterais.md](paineis-laterais.md)
4. **Preview em Tempo Real:** [preview-realtime.md](preview-realtime.md)

---

## 📚 Referências

### Documentação Oficial
- [Fabric.js Docs](http://fabricjs.com/docs/)
- [Fabric.js Examples](http://fabricjs.com/demos/)
- [Zustand Docs](https://github.com/pmndrs/zustand)

### Tutoriais
- [Building a Canvas Editor](http://fabricjs.com/fabric-intro-part-1)
- [Fabric.js Advanced](http://fabricjs.com/fabric-intro-part-4)

### Troubleshooting
Ver [11_REFERENCIA/troubleshooting.md](../../11_REFERENCIA/troubleshooting.md) para problemas comuns.

---

**Última atualização:** 15 Out 2025
**Autor:** Tech Lead - Bruno L.
**Reviewers:** Laura F., Carla M.
