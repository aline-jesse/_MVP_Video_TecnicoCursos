/**
 * 🔄 Conversor Timeline → Remotion
 * Converte dados da timeline para elementos renderizáveis no Remotion
 */

import { 
  TimelineProject, 
  TimelineElement, 
  TimelineKeyframe 
} from '../types/timeline-types';
import { 
  RenderedElement, 
  ElementAnimation, 
  AnimationFrame,
  RenderConfig 
} from '../types/remotion-types';

export class TimelineToRemotionConverter {
  /**
   * Converte projeto da timeline para elementos renderizáveis
   */
  static convertProject(project: TimelineProject, config: RenderConfig): RenderedElement[] {
    const elements: RenderedElement[] = [];

    // Processar cada camada
    for (const layer of project.layers) {
      if (!layer.visible) continue;

      // Processar elementos da camada
      for (const element of layer.elements) {
        const renderedElement = this.convertElement(element, config);
        if (renderedElement) {
          elements.push(renderedElement);
        }
      }
    }

    // Ordenar por zIndex e tempo
    return elements.sort((a, b) => {
      const zIndexA = this.getZIndex(a);
      const zIndexB = this.getZIndex(b);
      
      if (zIndexA !== zIndexB) {
        return zIndexA - zIndexB;
      }
      
      return a.startFrame - b.startFrame;
    });
  }

  /**
   * Converte elemento individual da timeline
   */
  private static convertElement(element: TimelineElement, config: RenderConfig): RenderedElement | null {
    const startFrame = this.timeToFrame(element.startTime, config.fps);
    const endFrame = this.timeToFrame(element.startTime + element.duration, config.fps);

    // Elemento base
    const renderedElement: RenderedElement = {
      id: element.id,
      type: element.type,
      startFrame,
      endFrame,
      props: this.convertElementProps(element),
      style: this.convertElementStyle(element),
      animations: this.convertKeyframes(element.keyframes, config.fps)
    };

    return renderedElement;
  }

  /**
   * Converte propriedades específicas do elemento
   */
  private static convertElementProps(element: TimelineElement): any {
    const baseProps = {
      name: element.name,
      locked: this.getPropertyValue(element.properties, 'locked', false),
      visible: this.getPropertyValue(element.properties, 'visible', true)
    };

    switch (element.type) {
      case 'video':
        return {
          ...baseProps,
          src: element.src,
          volume: this.getPropertyValue(element.properties, 'volume', 1),
          playbackRate: this.getPropertyValue(element.properties, 'playbackRate', 1),
          muted: this.getPropertyValue(element.properties, 'muted', false)
        };

      case 'audio':
        return {
          ...baseProps,
          src: element.src,
          volume: this.getPropertyValue(element.properties, 'volume', 1),
          playbackRate: this.getPropertyValue(element.properties, 'playbackRate', 1)
        };

      case 'image':
        return {
          ...baseProps,
          src: element.src
        };

      case 'text':
        return {
          ...baseProps,
          text: element.text || '',
          fontSize: this.getPropertyValue(element.properties, 'fontSize', 32),
          fontFamily: this.getPropertyValue(element.properties, 'fontFamily', 'Arial'),
          fontWeight: this.getPropertyValue(element.properties, 'fontWeight', 'normal'),
          color: this.getPropertyValue(element.properties, 'color', '#ffffff'),
          textAlign: this.getPropertyValue(element.properties, 'textAlign', 'left')
        };

      case 'shape':
        return {
          ...baseProps,
          shape: this.getPropertyValue(element.properties, 'shape', 'rectangle'),
          fill: this.getPropertyValue(element.properties, 'fill', '#ffffff'),
          stroke: this.getPropertyValue(element.properties, 'stroke', '#000000'),
          strokeWidth: this.getPropertyValue(element.properties, 'strokeWidth', 1)
        };

      default:
        return baseProps;
    }
  }

  /**
   * Converte estilo CSS do elemento
   */
  private static convertElementStyle(element: TimelineElement): React.CSSProperties {
    const position = this.getPropertyValue(element.properties, 'position', { x: 0, y: 0 });
    const scale = this.getPropertyValue(element.properties, 'scale', { x: 1, y: 1 });
    const rotation = this.getPropertyValue(element.properties, 'rotation', 0);
    const opacity = this.getPropertyValue(element.properties, 'opacity', 1);
    const zIndex = this.getPropertyValue(element.properties, 'zIndex', 1);

    return {
      position: 'absolute',
      left: position.x,
      top: position.y,
      transform: `scale(${scale.x}, ${scale.y}) rotate(${rotation}deg)`,
      opacity,
      zIndex,
      pointerEvents: 'none'
    };
  }

  /**
   * Converte keyframes para animações Remotion
   */
  private static convertKeyframes(keyframes: TimelineKeyframe[], fps: number): ElementAnimation[] {
    if (!keyframes || keyframes.length === 0) return [];

    // Agrupar keyframes por propriedade
    const keyframesByProperty = new Map<string, TimelineKeyframe[]>();
    
    for (const keyframe of keyframes) {
      if (!keyframesByProperty.has(keyframe.property)) {
        keyframesByProperty.set(keyframe.property, []);
      }
      keyframesByProperty.get(keyframe.property)!.push(keyframe);
    }

    // Converter cada grupo em animação
    const animations: ElementAnimation[] = [];
    
    for (const [property, propertyKeyframes] of keyframesByProperty) {
      const frames: AnimationFrame[] = propertyKeyframes
        .sort((a, b) => a.time - b.time)
        .map(kf => ({
          frame: this.timeToFrame(kf.time, fps),
          value: kf.value
        }));

      animations.push({
        property,
        frames,
        easing: propertyKeyframes[0]?.easing || 'linear'
      });
    }

    return animations;
  }

  /**
   * Utilitários
   */
  private static timeToFrame(timeMs: number, fps: number): number {
    return Math.round((timeMs / 1000) * fps);
  }

  private static getPropertyValue(properties: any[], name: string, defaultValue: any): any {
    const property = properties?.find(p => p.name === name);
    return property ? property.value : defaultValue;
  }

  private static getZIndex(element: RenderedElement): number {
    return element.style.zIndex as number || 1;
  }

  /**
   * Cria configuração de render baseada no projeto
   */
  static createRenderConfig(
    project: TimelineProject,
    width: number = 1920,
    height: number = 1080,
    fps: number = 30
  ): RenderConfig {
    const durationInFrames = Math.ceil((project.duration / 1000) * fps);

    return {
      width,
      height,
      fps,
      durationInFrames,
      composition: 'VideoComposition'
    };
  }

  /**
   * Valida se o projeto pode ser renderizado
   */
  static validateProject(project: TimelineProject): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar duração
    if (project.duration <= 0) {
      errors.push('Duração do projeto deve ser maior que zero');
    }

    // Verificar se há elementos
    const hasElements = project.layers.some(layer => layer.elements.length > 0);
    if (!hasElements) {
      errors.push('Projeto deve conter pelo menos um elemento');
    }

    // Verificar elementos com src (video, audio, image)
    for (const layer of project.layers) {
      for (const element of layer.elements) {
        if (['video', 'audio', 'image'].includes(element.type) && !element.src) {
          errors.push(`Elemento ${element.name} do tipo ${element.type} precisa de um arquivo de origem`);
        }
        
        if (element.type === 'text' && !element.text) {
          errors.push(`Elemento de texto ${element.name} não possui conteúdo`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}