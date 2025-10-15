/**
 * 🎨 Templates Avançados Remotion
 * Templates dinâmicos com animações e efeitos profissionais
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing
} from 'remotion';
import { RenderedElement } from '../types/remotion-types';

interface TemplateProps {
  element: RenderedElement;
  globalFrame: number;
}

/**
 * Template de entrada com fade e escala
 */
export const FadeInScaleTemplate: React.FC<TemplateProps> = ({ element, globalFrame }) => {
  const { fps } = useVideoConfig();
  const localFrame = globalFrame - element.startFrame;
  const duration = element.endFrame - element.startFrame;
  
  if (globalFrame < element.startFrame || globalFrame > element.endFrame) {
    return null;
  }

  // Animação de entrada (primeiros 30 frames)
  const fadeInDuration = Math.min(30, duration / 4);
  const opacity = interpolate(
    localFrame,
    [0, fadeInDuration],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const scale = spring({
    fps,
    frame: localFrame,
    config: {
      damping: 10,
      stiffness: 100,
      mass: 0.5
    }
  });

  return (
    <div
      style={{
        ...element.style,
        opacity: opacity * (element.style.opacity as number || 1),
        transform: `${element.style.transform || ''} scale(${scale})`,
      }}
    >
      {renderElementContent(element)}
    </div>
  );
};

/**
 * Template com animação de slide lateral
 */
export const SlideInTemplate: React.FC<TemplateProps> = ({ element, globalFrame }) => {
  const { width } = useVideoConfig();
  const localFrame = globalFrame - element.startFrame;
  const duration = element.endFrame - element.startFrame;
  
  if (globalFrame < element.startFrame || globalFrame > element.endFrame) {
    return null;
  }

  const slideInDuration = Math.min(45, duration / 3);
  const translateX = interpolate(
    localFrame,
    [0, slideInDuration],
    [-width, 0],
    { easing: Easing.out(Easing.expo) }
  );

  return (
    <div
      style={{
        ...element.style,
        transform: `${element.style.transform || ''} translateX(${translateX}px)`,
      }}
    >
      {renderElementContent(element)}
    </div>
  );
};

/**
 * Template com efeito de digitação para texto
 */
export const TypewriterTemplate: React.FC<TemplateProps> = ({ element, globalFrame }) => {
  const { fps } = useVideoConfig();
  const localFrame = globalFrame - element.startFrame;
  const duration = element.endFrame - element.startFrame;
  
  if (globalFrame < element.startFrame || globalFrame > element.endFrame) {
    return null;
  }

  const fullText = element.props.text || '';
  const typewriterDuration = Math.min(fps * 3, duration * 0.6); // Max 3 segundos
  
  const charactersToShow = Math.floor(
    interpolate(
      localFrame,
      [0, typewriterDuration],
      [0, fullText.length],
      { extrapolateRight: 'clamp' }
    )
  );

  const visibleText = fullText.substring(0, charactersToShow);
  
  // Cursor piscando
  const cursorVisible = Math.floor(localFrame / 15) % 2 === 0;
  const showCursor = localFrame < typewriterDuration && cursorVisible;

  return (
    <div
      style={{
        ...element.style,
        fontFamily: element.props.fontFamily || 'Arial',
        fontSize: element.props.fontSize || 32,
        color: element.props.color || '#ffffff',
        fontWeight: element.props.fontWeight || 'normal'
      }}
    >
      {visibleText}
      {showCursor && <span style={{ opacity: 0.8 }}>|</span>}
    </div>
  );
};

/**
 * Template com rotação e zoom para imagens
 */
export const RotateZoomTemplate: React.FC<TemplateProps> = ({ element, globalFrame }) => {
  const { fps } = useVideoConfig();
  const localFrame = globalFrame - element.startFrame;
  const duration = element.endFrame - element.startFrame;
  
  if (globalFrame < element.startFrame || globalFrame > element.endFrame) {
    return null;
  }

  // Rotação suave
  const rotation = interpolate(
    localFrame,
    [0, duration],
    [0, 360],
    { easing: Easing.linear }
  );

  // Zoom sutil
  const zoom = interpolate(
    localFrame,
    [0, duration / 2, duration],
    [1, 1.1, 1],
    { easing: Easing.inOut(Easing.sin) }
  );

  return (
    <div
      style={{
        ...element.style,
        transform: `${element.style.transform || ''} rotate(${rotation}deg) scale(${zoom})`,
      }}
    >
      {renderElementContent(element)}
    </div>
  );
};

/**
 * Template com efeito pulso para elementos de destaque
 */
export const PulseTemplate: React.FC<TemplateProps> = ({ element, globalFrame }) => {
  const localFrame = globalFrame - element.startFrame;
  
  if (globalFrame < element.startFrame || globalFrame > element.endFrame) {
    return null;
  }

  // Pulso baseado em seno
  const pulseScale = 1 + Math.sin(localFrame * 0.2) * 0.05;
  const pulseOpacity = 0.8 + Math.sin(localFrame * 0.3) * 0.2;

  return (
    <div
      style={{
        ...element.style,
        transform: `${element.style.transform || ''} scale(${pulseScale})`,
        opacity: pulseOpacity * (element.style.opacity as number || 1),
      }}
    >
      {renderElementContent(element)}
    </div>
  );
};

/**
 * Template com efeito paralaxe
 */
export const ParallaxTemplate: React.FC<TemplateProps> = ({ element, globalFrame }) => {
  const localFrame = globalFrame - element.startFrame;
  
  if (globalFrame < element.startFrame || globalFrame > element.endFrame) {
    return null;
  }

  // Movimento paralaxe baseado na posição Z (simulado)
  const parallaxSpeed = element.props.parallaxSpeed || 0.5;
  const translateY = localFrame * parallaxSpeed;

  return (
    <div
      style={{
        ...element.style,
        transform: `${element.style.transform || ''} translateY(${translateY}px)`,
      }}
    >
      {renderElementContent(element)}
    </div>
  );
};

/**
 * Template com efeito glitch digital
 */
export const GlitchTemplate: React.FC<TemplateProps> = ({ element, globalFrame }) => {
  const localFrame = globalFrame - element.startFrame;
  
  if (globalFrame < element.startFrame || globalFrame > element.endFrame) {
    return null;
  }

  // Efeito glitch ocasional
  const glitchTrigger = Math.floor(localFrame / 30) % 10 === 0;
  const glitchIntensity = glitchTrigger ? Math.random() * 10 : 0;
  
  const glitchTransformX = glitchTrigger ? (Math.random() - 0.5) * glitchIntensity : 0;
  const glitchTransformY = glitchTrigger ? (Math.random() - 0.5) * glitchIntensity : 0;
  
  const glitchFilter = glitchTrigger 
    ? `hue-rotate(${Math.random() * 360}deg) saturate(${1 + Math.random()})`
    : 'none';

  return (
    <div
      style={{
        ...element.style,
        transform: `${element.style.transform || ''} translate(${glitchTransformX}px, ${glitchTransformY}px)`,
        filter: glitchFilter,
      }}
    >
      {renderElementContent(element)}
    </div>
  );
};

/**
 * Renderiza o conteúdo baseado no tipo do elemento
 */
function renderElementContent(element: RenderedElement): React.ReactNode {
  switch (element.type) {
    case 'text':
      return element.props.text || '';
    
    case 'image':
      return (
        <img 
          src={element.props.src} 
          alt={element.props.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      );
    
    case 'video':
      return (
        <video 
          src={element.props.src}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          muted={element.props.muted}
        />
      );
    
    case 'shape':
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: element.props.fill || '#ffffff',
            borderRadius: element.props.shape === 'circle' ? '50%' : '0',
            border: `${element.props.strokeWidth || 1}px solid ${element.props.stroke || '#000000'}`
          }}
        />
      );
    
    default:
      return null;
  }
}

/**
 * Mapa de templates disponíveis
 */
export const ANIMATION_TEMPLATES = {
  fadeInScale: FadeInScaleTemplate,
  slideIn: SlideInTemplate,
  typewriter: TypewriterTemplate,
  rotateZoom: RotateZoomTemplate,
  pulse: PulseTemplate,
  parallax: ParallaxTemplate,
  glitch: GlitchTemplate
} as const;

export type AnimationTemplateName = keyof typeof ANIMATION_TEMPLATES;