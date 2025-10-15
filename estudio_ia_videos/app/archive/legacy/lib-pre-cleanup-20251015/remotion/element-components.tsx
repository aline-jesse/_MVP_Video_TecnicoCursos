/**
 * 🎬 Componentes Remotion - Templates de Renderização
 * Componentes React para renderizar elementos no Remotion
 */

import React from 'react';
import { 
  AbsoluteFill, 
  interpolate, 
  useCurrentFrame, 
  useVideoConfig,
  Img,
  Video,
  Audio
} from 'remotion';
import { RenderedElement, ElementAnimation } from '../types/remotion-types';

// Props base para todos os elementos
interface BaseElementProps {
  element: RenderedElement;
  currentFrame: number;
}

/**
 * Componente para elementos de vídeo
 */
export const VideoElementComponent: React.FC<BaseElementProps> = ({ element, currentFrame }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  
  // Verificar se está dentro do range de tempo
  if (frame < element.startFrame || frame > element.endFrame) {
    return null;
  }

  const localFrame = frame - element.startFrame;
  const animatedStyle = applyAnimations(element.animations, localFrame, element.style);

  return (
    <Video
      src={element.props.src}
      style={{
        ...animatedStyle,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
      volume={element.props.volume}
      playbackRate={element.props.playbackRate}
      muted={element.props.muted}
      startFrom={Math.floor(localFrame * (element.props.playbackRate || 1))}
    />
  );
};

/**
 * Componente para elementos de áudio
 */
export const AudioElementComponent: React.FC<BaseElementProps> = ({ element, currentFrame }) => {
  const frame = useCurrentFrame();
  
  // Verificar se está dentro do range de tempo
  if (frame < element.startFrame || frame > element.endFrame) {
    return null;
  }

  const localFrame = frame - element.startFrame;

  // Aplicar animações de volume
  const volumeAnimation = element.animations.find(a => a.property === 'volume');
  let volume = element.props.volume || 1;
  
  if (volumeAnimation && volumeAnimation.frames.length > 0) {
    volume = interpolateFrames(volumeAnimation.frames, localFrame);
  }

  return (
    <Audio
      src={element.props.src}
      volume={volume}
      playbackRate={element.props.playbackRate}
      startFrom={Math.floor(localFrame * (element.props.playbackRate || 1))}
    />
  );
};

/**
 * Componente para elementos de imagem
 */
export const ImageElementComponent: React.FC<BaseElementProps> = ({ element, currentFrame }) => {
  const frame = useCurrentFrame();
  
  // Verificar se está dentro do range de tempo
  if (frame < element.startFrame || frame > element.endFrame) {
    return null;
  }

  const localFrame = frame - element.startFrame;
  const animatedStyle = applyAnimations(element.animations, localFrame, element.style);

  return (
    <Img
      src={element.props.src}
      style={{
        ...animatedStyle,
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
      }}
    />
  );
};

/**
 * Componente para elementos de texto
 */
export const TextElementComponent: React.FC<BaseElementProps> = ({ element, currentFrame }) => {
  const frame = useCurrentFrame();
  
  // Verificar se está dentro do range de tempo
  if (frame < element.startFrame || frame > element.endFrame) {
    return null;
  }

  const localFrame = frame - element.startFrame;
  const animatedStyle = applyAnimations(element.animations, localFrame, element.style);

  // Animações específicas de texto
  const textAnimations = getTextAnimations(element.animations, localFrame);

  return (
    <div
      style={{
        ...animatedStyle,
        fontFamily: element.props.fontFamily,
        fontSize: textAnimations.fontSize,
        fontWeight: element.props.fontWeight,
        color: textAnimations.color,
        textAlign: element.props.textAlign,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      }}
    >
      {element.props.text}
    </div>
  );
};

/**
 * Componente para elementos de forma/shape
 */
export const ShapeElementComponent: React.FC<BaseElementProps> = ({ element, currentFrame }) => {
  const frame = useCurrentFrame();
  
  // Verificar se está dentro do range de tempo
  if (frame < element.startFrame || frame > element.endFrame) {
    return null;
  }

  const localFrame = frame - element.startFrame;
  const animatedStyle = applyAnimations(element.animations, localFrame, element.style);

  const shapeStyle = {
    ...animatedStyle,
    backgroundColor: element.props.fill,
    border: `${element.props.strokeWidth}px solid ${element.props.stroke}`,
    borderRadius: element.props.shape === 'circle' ? '50%' : '0',
    width: 100,
    height: 100
  };

  return <div style={shapeStyle} />;
};

/**
 * Aplica animações baseadas em keyframes
 */
function applyAnimations(
  animations: ElementAnimation[], 
  currentFrame: number, 
  baseStyle: React.CSSProperties
): React.CSSProperties {
  let animatedStyle = { ...baseStyle };

  for (const animation of animations) {
    const value = interpolateFrames(animation.frames, currentFrame);
    
    switch (animation.property) {
      case 'opacity':
        animatedStyle.opacity = value;
        break;
      case 'position':
        animatedStyle.left = value.x;
        animatedStyle.top = value.y;
        break;
      case 'scale':
        const currentTransform = animatedStyle.transform || '';
        const newTransform = currentTransform.replace(
          /scale\([^)]*\)/,
          `scale(${value.x}, ${value.y})`
        );
        animatedStyle.transform = newTransform;
        break;
      case 'rotation':
        const rotationTransform = animatedStyle.transform || '';
        const newRotationTransform = rotationTransform.replace(
          /rotate\([^)]*\)/,
          `rotate(${value}deg)`
        );
        animatedStyle.transform = newRotationTransform;
        break;
    }
  }

  return animatedStyle;
}

/**
 * Animações específicas para texto
 */
function getTextAnimations(animations: ElementAnimation[], currentFrame: number) {
  const defaults = {
    fontSize: 32,
    color: '#ffffff'
  };

  const result = { ...defaults };

  for (const animation of animations) {
    const value = interpolateFrames(animation.frames, currentFrame);
    
    switch (animation.property) {
      case 'fontSize':
        result.fontSize = value;
        break;
      case 'color':
        result.color = value;
        break;
    }
  }

  return result;
}

/**
 * Interpola valores entre frames
 */
function interpolateFrames(frames: any[], currentFrame: number): any {
  if (frames.length === 0) return null;
  if (frames.length === 1) return frames[0].value;

  // Encontrar frames antes e depois
  let beforeFrame = frames[0];
  let afterFrame = frames[frames.length - 1];

  for (let i = 0; i < frames.length - 1; i++) {
    if (frames[i].frame <= currentFrame && frames[i + 1].frame >= currentFrame) {
      beforeFrame = frames[i];
      afterFrame = frames[i + 1];
      break;
    }
  }

  // Se está exatamente no frame
  if (beforeFrame.frame === currentFrame) return beforeFrame.value;
  if (afterFrame.frame === currentFrame) return afterFrame.value;

  // Interpolação linear
  const progress = (currentFrame - beforeFrame.frame) / (afterFrame.frame - beforeFrame.frame);
  
  if (typeof beforeFrame.value === 'number') {
    return interpolate(progress, [0, 1], [beforeFrame.value, afterFrame.value]);
  }
  
  if (typeof beforeFrame.value === 'object' && beforeFrame.value.x !== undefined) {
    return {
      x: interpolate(progress, [0, 1], [beforeFrame.value.x, afterFrame.value.x]),
      y: interpolate(progress, [0, 1], [beforeFrame.value.y, afterFrame.value.y])
    };
  }

  // Para outros tipos, retorna o valor anterior
  return progress < 0.5 ? beforeFrame.value : afterFrame.value;
}