
/**
 * 🎭 Avatar 3D Engine - Sistema Completo de Controle
 * Engine principal para gerenciamento de avatares 3D hiper-realistas
 */

import { Vector3, Euler } from 'three';

export interface Avatar3DModel {
  id: string;
  name: string;
  gender: 'male' | 'female';
  ethnicity: string;
  ageRange: string;
  thumbnailUrl: string;
  modelUrl: string; // Caminho para o modelo 3D
  textureUrl: string;
  voiceId: string;
  lipSyncAccuracy: number;
  blendShapes: string[];
  defaultPose: {
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
  };
}

export interface LipSyncFrame {
  time: number; // ms
  viseme: string; // Tipo de forma da boca (A, E, I, O, U, M, F, etc)
  intensity: number; // 0-1
  blendShapes: Record<string, number>;
}

export interface AvatarAnimation {
  type: 'idle' | 'talking' | 'gesture';
  frames: LipSyncFrame[];
  duration: number;
}

export interface PhonemeMap {
  [key: string]: {
    viseme: string;
    blendShapes: Record<string, number>;
  };
}

/**
 * Mapeamento de fonemas para formas da boca (português BR)
 */
export const PHONEME_TO_VISEME: PhonemeMap = {
  // Vogais
  'a': { viseme: 'A', blendShapes: { jawOpen: 0.7, mouthOpen: 0.6 } },
  'ɐ': { viseme: 'A', blendShapes: { jawOpen: 0.5, mouthOpen: 0.4 } },
  'e': { viseme: 'E', blendShapes: { jawOpen: 0.3, mouthSmile: 0.5 } },
  'ɛ': { viseme: 'E', blendShapes: { jawOpen: 0.4, mouthSmile: 0.4 } },
  'i': { viseme: 'I', blendShapes: { jawOpen: 0.2, mouthSmile: 0.8 } },
  'o': { viseme: 'O', blendShapes: { jawOpen: 0.4, mouthPucker: 0.6 } },
  'ɔ': { viseme: 'O', blendShapes: { jawOpen: 0.5, mouthPucker: 0.5 } },
  'u': { viseme: 'U', blendShapes: { jawOpen: 0.2, mouthPucker: 0.8 } },
  
  // Consoantes
  'b': { viseme: 'B', blendShapes: { mouthClosed: 1.0, lipsTogether: 1.0 } },
  'p': { viseme: 'P', blendShapes: { mouthClosed: 1.0, lipsTogether: 1.0 } },
  'm': { viseme: 'M', blendShapes: { mouthClosed: 1.0, lipsTogether: 1.0 } },
  'f': { viseme: 'F', blendShapes: { lowerLipUp: 0.8, upperTeeth: 0.6 } },
  'v': { viseme: 'V', blendShapes: { lowerLipUp: 0.8, upperTeeth: 0.6 } },
  't': { viseme: 'T', blendShapes: { tongueUp: 0.7, jawOpen: 0.3 } },
  'd': { viseme: 'D', blendShapes: { tongueUp: 0.7, jawOpen: 0.3 } },
  's': { viseme: 'S', blendShapes: { jawOpen: 0.2, teethClose: 0.8 } },
  'z': { viseme: 'Z', blendShapes: { jawOpen: 0.2, teethClose: 0.8 } },
  'ʃ': { viseme: 'SH', blendShapes: { jawOpen: 0.3, mouthPucker: 0.5 } },
  'ʒ': { viseme: 'ZH', blendShapes: { jawOpen: 0.3, mouthPucker: 0.5 } },
  'k': { viseme: 'K', blendShapes: { jawOpen: 0.4, tongueBack: 0.8 } },
  'g': { viseme: 'G', blendShapes: { jawOpen: 0.4, tongueBack: 0.8 } },
  'l': { viseme: 'L', blendShapes: { tongueUp: 0.6, jawOpen: 0.3 } },
  'r': { viseme: 'R', blendShapes: { tongueUp: 0.5, jawOpen: 0.4 } },
  'ɾ': { viseme: 'R', blendShapes: { tongueUp: 0.4, jawOpen: 0.3 } },
  'n': { viseme: 'N', blendShapes: { tongueUp: 0.7, jawOpen: 0.3 } },
  'ɲ': { viseme: 'NH', blendShapes: { tongueUp: 0.8, jawOpen: 0.3 } },
  
  // Silêncio
  'sil': { viseme: 'REST', blendShapes: { mouthClosed: 0.9 } },
  'sp': { viseme: 'REST', blendShapes: { mouthClosed: 0.9 } }
};

export class Avatar3DEngine {
  private avatars: Map<string, Avatar3DModel> = new Map();
  private currentAvatar: Avatar3DModel | null = null;
  private animationQueue: AvatarAnimation[] = [];
  
  constructor() {
    this.initializeAvatars();
  }

  /**
   * Inicializa galeria de avatares disponíveis
   */
  private initializeAvatars() {
    const defaultAvatars: Avatar3DModel[] = [
      {
        id: 'sarah_executive',
        name: 'Sarah - Executiva',
        gender: 'female',
        ethnicity: 'caucasian',
        ageRange: '25-35',
        thumbnailUrl: 'https://cdn.abacus.ai/images/dd359ad5-040c-486a-8059-9ff2df7c493b.png',
        modelUrl: '/models/avatars/sarah.glb',
        textureUrl: '/models/avatars/sarah_texture.png',
        voiceId: 'pt-BR-Neural2-A',
        lipSyncAccuracy: 98,
        blendShapes: ['jawOpen', 'mouthSmile', 'mouthPucker', 'tongueUp', 'eyeBlinkLeft', 'eyeBlinkRight'],
        defaultPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Euler(0, 0, 0),
          scale: new Vector3(1, 1, 1)
        }
      },
      {
        id: 'carlos_instructor',
        name: 'Carlos - Instrutor',
        gender: 'male',
        ethnicity: 'latino',
        ageRange: '35-45',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Carlos_Alcaraz_2025_FO.jpg',
        modelUrl: '/models/avatars/carlos.glb',
        textureUrl: '/models/avatars/carlos_texture.png',
        voiceId: 'pt-BR-Neural2-B',
        lipSyncAccuracy: 96,
        blendShapes: ['jawOpen', 'mouthSmile', 'mouthPucker', 'tongueUp', 'eyeBlinkLeft', 'eyeBlinkRight'],
        defaultPose: {
          position: new Vector3(0, 0, 0),
          rotation: new Euler(0, 0, 0),
          scale: new Vector3(1, 1, 1)
        }
      }
    ];

    defaultAvatars.forEach(avatar => {
      this.avatars.set(avatar.id, avatar);
    });
  }

  /**
   * Obtém avatar por ID
   */
  getAvatar(id: string): Avatar3DModel | undefined {
    return this.avatars.get(id);
  }

  /**
   * Lista todos os avatares disponíveis
   */
  getAllAvatars(): Avatar3DModel[] {
    return Array.from(this.avatars.values());
  }

  /**
   * Define avatar atual
   */
  setCurrentAvatar(id: string): boolean {
    const avatar = this.avatars.get(id);
    if (avatar) {
      this.currentAvatar = avatar;
      return true;
    }
    return false;
  }

  /**
   * Analisa texto e gera frames de sincronização labial
   */
  generateLipSyncFrames(text: string, audioUrl: string, duration: number): LipSyncFrame[] {
    const frames: LipSyncFrame[] = [];
    const words = text.toLowerCase().split(/\s+/);
    const timePerWord = duration / words.length;
    
    let currentTime = 0;
    
    for (const word of words) {
      const phonemes = this.textToPhonemes(word);
      const timePerPhoneme = timePerWord / phonemes.length;
      
      for (const phoneme of phonemes) {
        const visemeData = PHONEME_TO_VISEME[phoneme] || PHONEME_TO_VISEME['sil'];
        
        frames.push({
          time: currentTime,
          viseme: visemeData.viseme,
          intensity: 0.8 + Math.random() * 0.2, // Variação natural
          blendShapes: visemeData.blendShapes
        });
        
        currentTime += timePerPhoneme * 1000; // Converter para ms
      }
      
      // Adicionar pausa entre palavras
      frames.push({
        time: currentTime,
        viseme: 'REST',
        intensity: 0,
        blendShapes: { mouthClosed: 0.9 }
      });
      currentTime += 50; // Pausa de 50ms
    }
    
    return frames;
  }

  /**
   * Converte texto em fonemas (simplificado para português BR)
   */
  private textToPhonemes(word: string): string[] {
    const phonemes: string[] = [];
    const chars = word.split('');
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const nextChar = chars[i + 1] || '';
      
      // Mapeamento simplificado de grafemas para fonemas
      switch (char) {
        case 'a': phonemes.push('a'); break;
        case 'á': case 'à': case 'â': case 'ã': phonemes.push('a'); break;
        case 'e': phonemes.push('e'); break;
        case 'é': case 'ê': phonemes.push('ɛ'); break;
        case 'i': case 'í': phonemes.push('i'); break;
        case 'o': phonemes.push('o'); break;
        case 'ó': case 'ô': case 'õ': phonemes.push('ɔ'); break;
        case 'u': case 'ú': phonemes.push('u'); break;
        case 'b': phonemes.push('b'); break;
        case 'p': phonemes.push('p'); break;
        case 'm': phonemes.push('m'); break;
        case 'f': phonemes.push('f'); break;
        case 'v': phonemes.push('v'); break;
        case 't': phonemes.push('t'); break;
        case 'd': phonemes.push('d'); break;
        case 's': 
          if (nextChar === 'h') {
            phonemes.push('ʃ');
            i++; // Skip next char
          } else {
            phonemes.push('s');
          }
          break;
        case 'z': phonemes.push('z'); break;
        case 'x': phonemes.push('ʃ'); break;
        case 'c':
          if (nextChar === 'h') {
            phonemes.push('ʃ');
            i++;
          } else if (['e', 'i'].includes(nextChar)) {
            phonemes.push('s');
          } else {
            phonemes.push('k');
          }
          break;
        case 'g':
          if (['e', 'i'].includes(nextChar)) {
            phonemes.push('ʒ');
          } else {
            phonemes.push('g');
          }
          break;
        case 'l': phonemes.push('l'); break;
        case 'r':
          if (i === 0 || chars[i - 1] === 'n' || chars[i - 1] === 's') {
            phonemes.push('r'); // R forte
          } else {
            phonemes.push('ɾ'); // R fraco
          }
          break;
        case 'n':
          if (nextChar === 'h') {
            phonemes.push('ɲ');
            i++;
          } else {
            phonemes.push('n');
          }
          break;
        case 'k': phonemes.push('k'); break;
        case 'q': phonemes.push('k'); break;
        case 'j': phonemes.push('ʒ'); break;
        default:
          // Ignora caracteres não mapeados
          break;
      }
    }
    
    return phonemes;
  }

  /**
   * Gera animação idle (respiração e piscadas)
   */
  generateIdleAnimation(duration: number): AvatarAnimation {
    const frames: LipSyncFrame[] = [];
    const fps = 30;
    const totalFrames = (duration * fps) / 1000;
    
    for (let i = 0; i < totalFrames; i++) {
      const time = (i / fps) * 1000;
      
      // Respiração suave (chest movement)
      const breathCycle = Math.sin((time / 4000) * Math.PI * 2) * 0.05;
      
      // Piscadas aleatórias (a cada 3-5 segundos em média)
      const shouldBlink = Math.random() < 0.01;
      const blinkIntensity = shouldBlink ? 1.0 : 0.0;
      
      frames.push({
        time,
        viseme: 'REST',
        intensity: 0,
        blendShapes: {
          mouthClosed: 0.95,
          eyeBlinkLeft: blinkIntensity,
          eyeBlinkRight: blinkIntensity,
          chestExpand: breathCycle
        }
      });
    }
    
    return {
      type: 'idle',
      frames,
      duration
    };
  }

  /**
   * Aplica blend shapes no frame atual
   */
  applyBlendShapes(mesh: any, blendShapes: Record<string, number>) {
    if (!mesh || !mesh.morphTargetInfluences || !mesh.morphTargetDictionary) {
      return;
    }
    
    for (const [shapeName, value] of Object.entries(blendShapes)) {
      const index = mesh.morphTargetDictionary[shapeName];
      if (index !== undefined) {
        mesh.morphTargetInfluences[index] = value;
      }
    }
  }

  /**
   * Obtém frame de lip sync para um tempo específico
   */
  getLipSyncFrameAtTime(frames: LipSyncFrame[], time: number): LipSyncFrame | null {
    if (frames.length === 0) return null;
    
    // Encontra o frame mais próximo
    let closestFrame = frames[0];
    let minDiff = Math.abs(frames[0].time - time);
    
    for (const frame of frames) {
      const diff = Math.abs(frame.time - time);
      if (diff < minDiff) {
        minDiff = diff;
        closestFrame = frame;
      }
    }
    
    return closestFrame;
  }

  /**
   * Interpola entre dois frames para suavizar transições
   */
  interpolateFrames(frame1: LipSyncFrame, frame2: LipSyncFrame, t: number): LipSyncFrame {
    const interpolatedBlendShapes: Record<string, number> = {};
    
    // Pega todas as chaves de blend shapes
    const allKeys = new Set([
      ...Object.keys(frame1.blendShapes),
      ...Object.keys(frame2.blendShapes)
    ]);
    
    for (const key of allKeys) {
      const value1 = frame1.blendShapes[key] || 0;
      const value2 = frame2.blendShapes[key] || 0;
      interpolatedBlendShapes[key] = value1 + (value2 - value1) * t;
    }
    
    return {
      time: frame1.time + (frame2.time - frame1.time) * t,
      viseme: t < 0.5 ? frame1.viseme : frame2.viseme,
      intensity: frame1.intensity + (frame2.intensity - frame1.intensity) * t,
      blendShapes: interpolatedBlendShapes
    };
  }
}

// Singleton instance
export const avatarEngine = new Avatar3DEngine();
