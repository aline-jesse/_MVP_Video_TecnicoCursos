/**
 * 🎬 Composição Principal Remotion
 * Componente principal que renderiza todos os elementos da timeline
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { VideoCompositionProps, RenderedElement } from '../types/remotion-types';
import {
  VideoElementComponent,
  AudioElementComponent,
  ImageElementComponent,
  TextElementComponent,
  ShapeElementComponent
} from './element-components';
import { 
  ANIMATION_TEMPLATES, 
  AnimationTemplateName 
} from './animation-templates';
import { 
  TRANSITION_TEMPLATES, 
  TransitionTemplateName 
} from './transition-templates';

/**
 * Composição principal que renderiza o projeto da timeline
 */
export const VideoComposition: React.FC<VideoCompositionProps> = ({ project, config }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Converter projeto para elementos renderizáveis
  const elements = React.useMemo(() => {
    // Aqui usaríamos o TimelineToRemotionConverter
    // Por simplicidade, vou fazer uma conversão básica
    const renderedElements: RenderedElement[] = [];
    
    for (const layer of project.layers) {
      if (!layer.visible) continue;
      
      for (const element of layer.elements) {
        const startFrame = Math.round((element.startTime / 1000) * fps);
        const endFrame = Math.round(((element.startTime + element.duration) / 1000) * fps);
        
        const renderedElement: RenderedElement = {
          id: element.id,
          type: element.type,
          startFrame,
          endFrame,
          props: {
            name: element.name,
            src: element.src,
            text: element.text,
            // Converter propriedades
            ...element.properties.reduce((acc, prop) => {
              acc[prop.name] = prop.value;
              return acc;
            }, {} as any)
          },
          style: {
            position: 'absolute' as const,
            left: element.properties.find(p => p.name === 'position')?.value?.x || 0,
            top: element.properties.find(p => p.name === 'position')?.value?.y || 0,
            opacity: element.properties.find(p => p.name === 'opacity')?.value || 1,
            zIndex: element.properties.find(p => p.name === 'zIndex')?.value || 1,
          },
          animations: element.keyframes.map(kf => ({
            property: kf.property,
            frames: [{ frame: Math.round((kf.time / 1000) * fps), value: kf.value }],
            easing: kf.easing
          }))
        };
        
        renderedElements.push(renderedElement);
      }
    }
    
    return renderedElements;
  }, [project, fps]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: project.backgroundColor || '#000000',
        width,
        height
      }}
    >
      {elements.map((element) => {
        return (
          <ElementRenderer
            key={element.id}
            element={element}
            currentFrame={frame}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Renderizador de elemento individual
 */
const ElementRenderer: React.FC<{
  element: RenderedElement;
  currentFrame: number;
}> = ({ element, currentFrame }) => {
  // Verificar se está dentro do range de tempo
  if (currentFrame < element.startFrame || currentFrame > element.endFrame) {
    return null;
  }

  const commonProps = {
    element,
    currentFrame
  };

  switch (element.type) {
    case 'video':
      return <VideoElementComponent {...commonProps} />;
    
    case 'audio':
      return <AudioElementComponent {...commonProps} />;
    
    case 'image':
      return <ImageElementComponent {...commonProps} />;
    
    case 'text':
      return <TextElementComponent {...commonProps} />;
      
    case 'shape':
      return <ShapeElementComponent {...commonProps} />;
    
    default:
      return null;
  }
};

/**
 * Composição simples para preview
 */
export const PreviewComposition: React.FC<VideoCompositionProps> = ({ project }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: project.backgroundColor || '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 48,
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div>
        Preview - Frame {frame}
        <br />
        <small style={{ fontSize: 24 }}>
          Projeto: {project.name}
        </small>
      </div>
    </AbsoluteFill>
  );
};