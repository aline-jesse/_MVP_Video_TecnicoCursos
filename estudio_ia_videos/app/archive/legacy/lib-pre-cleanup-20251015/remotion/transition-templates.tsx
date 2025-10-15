/**
 * 🎬 Sistema de Transições Remotion
 * Efeitos de transição profissionais entre elementos
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing
} from 'remotion';
import { RenderedElement } from '../types/remotion-types';

interface TransitionProps {
  fromElement: RenderedElement | null;
  toElement: RenderedElement;
  transitionStart: number;
  transitionDuration: number;
  globalFrame: number;
}

/**
 * Transição de fade cruzado
 */
export const CrossFadeTransition: React.FC<TransitionProps> = ({
  fromElement,
  toElement,
  transitionStart,
  transitionDuration,
  globalFrame
}) => {
  const transitionProgress = interpolate(
    globalFrame,
    [transitionStart, transitionStart + transitionDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill>
      {/* Elemento saindo */}
      {fromElement && (
        <div
          style={{
            ...fromElement.style,
            opacity: (1 - transitionProgress) * (fromElement.style.opacity as number || 1)
          }}
        >
          {renderElementContent(fromElement)}
        </div>
      )}

      {/* Elemento entrando */}
      <div
        style={{
          ...toElement.style,
          opacity: transitionProgress * (toElement.style.opacity as number || 1)
        }}
      >
        {renderElementContent(toElement)}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Transição de slide horizontal
 */
export const SlideTransition: React.FC<TransitionProps> = ({
  fromElement,
  toElement,
  transitionStart,
  transitionDuration,
  globalFrame
}) => {
  const { width } = useVideoConfig();
  
  const slideProgress = interpolate(
    globalFrame,
    [transitionStart, transitionStart + transitionDuration],
    [0, 1],
    { 
      extrapolateLeft: 'clamp', 
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic)
    }
  );

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Elemento saindo (slide para esquerda) */}
      {fromElement && (
        <div
          style={{
            ...fromElement.style,
            transform: `translateX(${-slideProgress * width}px)`
          }}
        >
          {renderElementContent(fromElement)}
        </div>
      )}

      {/* Elemento entrando (slide da direita) */}
      <div
        style={{
          ...toElement.style,
          transform: `translateX(${(1 - slideProgress) * width}px)`
        }}
      >
        {renderElementContent(toElement)}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Transição de zoom
 */
export const ZoomTransition: React.FC<TransitionProps> = ({
  fromElement,
  toElement,
  transitionStart,
  transitionDuration,
  globalFrame
}) => {
  const zoomProgress = interpolate(
    globalFrame,
    [transitionStart, transitionStart + transitionDuration],
    [0, 1],
    { 
      extrapolateLeft: 'clamp', 
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic)
    }
  );

  // Elemento saindo diminui
  const fromScale = interpolate(zoomProgress, [0, 1], [1, 0.5]);
  const fromOpacity = interpolate(zoomProgress, [0, 0.5, 1], [1, 0.7, 0]);

  // Elemento entrando aumenta
  const toScale = interpolate(zoomProgress, [0, 1], [1.5, 1]);
  const toOpacity = interpolate(zoomProgress, [0, 0.5, 1], [0, 0.7, 1]);

  return (
    <AbsoluteFill>
      {/* Elemento saindo */}
      {fromElement && (
        <div
          style={{
            ...fromElement.style,
            transform: `${fromElement.style.transform || ''} scale(${fromScale})`,
            opacity: fromOpacity * (fromElement.style.opacity as number || 1)
          }}
        >
          {renderElementContent(fromElement)}
        </div>
      )}

      {/* Elemento entrando */}
      <div
        style={{
          ...toElement.style,
          transform: `${toElement.style.transform || ''} scale(${toScale})`,
          opacity: toOpacity * (toElement.style.opacity as number || 1)
        }}
      >
        {renderElementContent(toElement)}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Transição de rotação
 */
export const RotateTransition: React.FC<TransitionProps> = ({
  fromElement,
  toElement,
  transitionStart,
  transitionDuration,
  globalFrame
}) => {
  const rotateProgress = interpolate(
    globalFrame,
    [transitionStart, transitionStart + transitionDuration],
    [0, 1],
    { 
      extrapolateLeft: 'clamp', 
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.back(1.5))
    }
  );

  const fromRotation = interpolate(rotateProgress, [0, 1], [0, -180]);
  const fromOpacity = interpolate(rotateProgress, [0, 0.5, 1], [1, 0.3, 0]);

  const toRotation = interpolate(rotateProgress, [0, 1], [180, 0]);
  const toOpacity = interpolate(rotateProgress, [0, 0.5, 1], [0, 0.3, 1]);

  return (
    <AbsoluteFill>
      {/* Elemento saindo */}
      {fromElement && (
        <div
          style={{
            ...fromElement.style,
            transform: `${fromElement.style.transform || ''} rotateY(${fromRotation}deg)`,
            opacity: fromOpacity * (fromElement.style.opacity as number || 1)
          }}
        >
          {renderElementContent(fromElement)}
        </div>
      )}

      {/* Elemento entrando */}
      <div
        style={{
          ...toElement.style,
          transform: `${toElement.style.transform || ''} rotateY(${toRotation}deg)`,
          opacity: toOpacity * (toElement.style.opacity as number || 1)
        }}
      >
        {renderElementContent(toElement)}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Transição de dissolve pixelizada
 */
export const PixelDissolveTransition: React.FC<TransitionProps> = ({
  fromElement,
  toElement,
  transitionStart,
  transitionDuration,
  globalFrame
}) => {
  const dissolveProgress = interpolate(
    globalFrame,
    [transitionStart, transitionStart + transitionDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Criar efeito pixelizado
  const pixelSize = Math.floor(interpolate(dissolveProgress, [0, 0.5, 1], [0, 8, 0]));
  const pixelFilter = pixelSize > 0 
    ? `blur(${pixelSize / 2}px) contrast(${1 + pixelSize / 10})`
    : 'none';

  return (
    <AbsoluteFill>
      {/* Elemento saindo */}
      {fromElement && (
        <div
          style={{
            ...fromElement.style,
            opacity: (1 - dissolveProgress) * (fromElement.style.opacity as number || 1),
            filter: pixelFilter
          }}
        >
          {renderElementContent(fromElement)}
        </div>
      )}

      {/* Elemento entrando */}
      <div
        style={{
          ...toElement.style,
          opacity: dissolveProgress * (toElement.style.opacity as number || 1),
          filter: pixelFilter
        }}
      >
        {renderElementContent(toElement)}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Transição de cortina
 */
export const CurtainTransition: React.FC<TransitionProps> = ({
  fromElement,
  toElement,
  transitionStart,
  transitionDuration,
  globalFrame
}) => {
  const { width, height } = useVideoConfig();
  
  const curtainProgress = interpolate(
    globalFrame,
    [transitionStart, transitionStart + transitionDuration],
    [0, 1],
    { 
      extrapolateLeft: 'clamp', 
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic)
    }
  );

  const curtainHeight = curtainProgress * height;

  return (
    <AbsoluteFill>
      {/* Elemento de fundo (saindo) */}
      {fromElement && (
        <div style={fromElement.style}>
          {renderElementContent(fromElement)}
        </div>
      )}

      {/* Cortina que revela o novo elemento */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: width,
          height: curtainHeight,
          overflow: 'hidden'
        }}
      >
        <div style={toElement.style}>
          {renderElementContent(toElement)}
        </div>
      </div>

      {/* Borda da cortina */}
      <div
        style={{
          position: 'absolute',
          top: curtainHeight - 2,
          left: 0,
          width: width,
          height: 4,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0))',
          pointerEvents: 'none'
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Renderiza conteúdo do elemento (compartilhado)
 */
function renderElementContent(element: RenderedElement): React.ReactNode {
  switch (element.type) {
    case 'text':
      return (
        <span
          style={{
            fontFamily: element.props.fontFamily || 'Arial',
            fontSize: element.props.fontSize || 32,
            color: element.props.color || '#ffffff',
            fontWeight: element.props.fontWeight || 'normal'
          }}
        >
          {element.props.text || ''}
        </span>
      );
    
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
 * Mapa de transições disponíveis
 */
export const TRANSITION_TEMPLATES = {
  crossFade: CrossFadeTransition,
  slide: SlideTransition,
  zoom: ZoomTransition,
  rotate: RotateTransition,
  pixelDissolve: PixelDissolveTransition,
  curtain: CurtainTransition
} as const;

export type TransitionTemplateName = keyof typeof TRANSITION_TEMPLATES;