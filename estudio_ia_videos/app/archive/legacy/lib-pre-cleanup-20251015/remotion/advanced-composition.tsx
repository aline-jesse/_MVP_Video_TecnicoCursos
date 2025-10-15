/**
 * 🎬 Composição Avançada Remotion
 * Sistema completo de renderização com templates, transições e efeitos
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { VideoCompositionProps } from '../types/remotion-types';
import { TimelineToRemotionConverter } from './timeline-converter';
import { 
  AdvancedElementRenderer, 
  ElementLayer, 
  BackgroundRenderer 
} from './advanced-renderer';

/**
 * Composição avançada principal
 */
export const AdvancedVideoComposition: React.FC<VideoCompositionProps> = ({ 
  project, 
  config 
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Converter projeto da timeline para elementos renderizáveis
  const elements = React.useMemo(() => {
    return TimelineToRemotionConverter.convertProject(project, config);
  }, [project, config]);

  // Agrupar elementos por camada
  const elementsByLayer = React.useMemo(() => {
    const layers = new Map();
    
    for (const element of elements) {
      const layerId = element.props.layerId || 'default';
      if (!layers.has(layerId)) {
        layers.set(layerId, []);
      }
      layers.get(layerId).push(element);
    }
    
    return layers;
  }, [elements]);

  // Configurações de background do projeto
  const backgroundConfig = {
    backgroundColor: project.backgroundColor || '#000000',
    backgroundImage: project.backgroundImage,
    effects: {
      particles: project.effects?.particles || false,
      gradient: project.effects?.gradient,
      noise: project.effects?.noise || 0
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Layer */}
      <BackgroundRenderer {...backgroundConfig} />

      {/* Element Layers */}
      {Array.from(elementsByLayer.entries())
        .sort(([layerIdA], [layerIdB]) => {
          // Ordenar camadas por índice (video < audio < text < overlay)
          const layerOrder = { video: 0, audio: 1, text: 2, overlay: 3 };
          const orderA = layerOrder[layerIdA as keyof typeof layerOrder] ?? 999;
          const orderB = layerOrder[layerIdB as keyof typeof layerOrder] ?? 999;
          return orderA - orderB;
        })
        .map(([layerId, layerElements]) => {
          // Obter configurações da camada do projeto
          const layerConfig = project.layers.find(l => l.id === layerId);
          const layerEffects = layerConfig?.effects || {};

          return (
            <ElementLayer
              key={layerId}
              elements={layerElements}
              layerEffects={layerEffects}
            />
          );
        })}

      {/* Overlay Effects (vinhetas, etc.) */}
      <OverlayEffects 
        frame={frame} 
        width={width} 
        height={height}
        effects={project.overlayEffects}
      />

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugOverlay 
          frame={frame}
          totalFrames={config.durationInFrames}
          elementsCount={elements.length}
        />
      )}
    </div>
  );
};

/**
 * Composição otimizada para preview
 */
export const PreviewComposition: React.FC<VideoCompositionProps> = ({ 
  project, 
  config 
}) => {
  const frame = useCurrentFrame();

  // Versão simplificada para preview rápido
  const elementsAtCurrentTime = React.useMemo(() => {
    const currentTime = (frame / 30) * 1000; // Assumindo 30 fps
    
    return project.layers.flatMap(layer => 
      layer.elements.filter(element => 
        currentTime >= element.startTime && 
        currentTime <= element.startTime + element.duration
      )
    );
  }, [project, frame]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: project.backgroundColor || '#000000',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
        padding: 20
      }}
    >
      {/* Header */}
      <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        {project.name} - Preview
      </div>

      {/* Info */}
      <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 20 }}>
        Frame: {frame} | Elementos ativos: {elementsAtCurrentTime.length}
      </div>

      {/* Elementos (versão simplificada) */}
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {elementsAtCurrentTime.map(element => (
          <div
            key={element.id}
            style={{
              padding: 10,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{element.name}</div>
            <div style={{ opacity: 0.7 }}>{element.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Efeitos de overlay (vinhetas, filtros globais)
 */
interface OverlayEffectsProps {
  frame: number;
  width: number;
  height: number;
  effects?: {
    vignette?: { intensity: number; color: string };
    filmGrain?: { intensity: number };
    colorGrade?: { temperature: number; tint: number };
  };
}

const OverlayEffects: React.FC<OverlayEffectsProps> = ({
  frame,
  width,
  height,
  effects = {}
}) => {
  if (!effects || Object.keys(effects).length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    >
      {/* Vinheta */}
      {effects.vignette && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle, transparent 30%, ${effects.vignette.color || 'rgba(0,0,0,0.5)'} 70%)`,
            opacity: effects.vignette.intensity || 0.3
          }}
        />
      )}

      {/* Film Grain */}
      {effects.filmGrain && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: (effects.filmGrain.intensity || 0.1) * (0.5 + Math.random() * 0.5),
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.1 + frame * 0.001}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay'
          }}
        />
      )}
    </div>
  );
};

/**
 * Overlay de debug (desenvolvimento)
 */
interface DebugOverlayProps {
  frame: number;
  totalFrames: number;
  elementsCount: number;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({
  frame,
  totalFrames,
  elementsCount
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: 8,
        borderRadius: 4,
        fontSize: 10,
        fontFamily: 'monospace',
        pointerEvents: 'none'
      }}
    >
      <div>Frame: {frame}/{totalFrames}</div>
      <div>Progress: {Math.round((frame / totalFrames) * 100)}%</div>
      <div>Elements: {elementsCount}</div>
      <div>FPS: {Math.round((1000 / 33.33) * 10) / 10}</div>
    </div>
  );
};