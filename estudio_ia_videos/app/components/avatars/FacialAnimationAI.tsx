/**
 * 🤖 Facial Animation AI - Sistema de Animação Facial com IA
 * Animações faciais realistas baseadas em IA com reconhecimento de emoções
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Sparkles, 
  Play, 
  Pause,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Smile,
  Frown,
  Meh,
  Heart,
  Zap,
  Settings,
  Camera,
  Mic,
  Volume2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmotionData {
  id: string;
  name: string;
  intensity: number;
  duration: number;
  keyframes: FacialKeyframe[];
}

interface FacialKeyframe {
  timestamp: number;
  eyebrowLeft: number;
  eyebrowRight: number;
  eyeLeft: number;
  eyeRight: number;
  cheekLeft: number;
  cheekRight: number;
  mouthCornerLeft: number;
  mouthCornerRight: number;
  mouthOpen: number;
  jawOpen: number;
  headTilt: number;
  headRotation: number;
}

interface FacialAnimationAIProps {
  avatarId: string;
  onAnimationGenerated?: (animation: EmotionData) => void;
}

export default function FacialAnimationAI({ avatarId, onAnimationGenerated }: FacialAnimationAIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [emotionText, setEmotionText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('neutral');
  const [intensity, setIntensity] = useState([70]);
  const [duration, setDuration] = useState([3]);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Emoções pré-definidas
  const emotionPresets = [
    { 
      id: 'happy', 
      name: 'Feliz', 
      icon: '😊', 
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Expressão alegre e positiva'
    },
    { 
      id: 'sad', 
      name: 'Triste', 
      icon: '😢', 
      color: 'bg-blue-100 text-blue-800',
      description: 'Expressão melancólica'
    },
    { 
      id: 'angry', 
      name: 'Raiva', 
      icon: '😠', 
      color: 'bg-red-100 text-red-800',
      description: 'Expressão de irritação'
    },
    { 
      id: 'surprised', 
      name: 'Surpreso', 
      icon: '😲', 
      color: 'bg-purple-100 text-purple-800',
      description: 'Expressão de espanto'
    },
    { 
      id: 'neutral', 
      name: 'Neutro', 
      icon: '😐', 
      color: 'bg-gray-100 text-gray-800',
      description: 'Expressão neutra e calma'
    },
    { 
      id: 'excited', 
      name: 'Animado', 
      icon: '🤩', 
      color: 'bg-green-100 text-green-800',
      description: 'Expressão entusiasmada'
    },
    { 
      id: 'confused', 
      name: 'Confuso', 
      icon: '😕', 
      color: 'bg-orange-100 text-orange-800',
      description: 'Expressão de dúvida'
    },
    { 
      id: 'confident', 
      name: 'Confiante', 
      icon: '😎', 
      color: 'bg-indigo-100 text-indigo-800',
      description: 'Expressão segura e determinada'
    }
  ];

  // Parâmetros faciais avançados
  const [facialParams, setFacialParams] = useState({
    eyebrowHeight: 50,
    eyeOpenness: 80,
    cheekRaise: 30,
    mouthCurvature: 50,
    jawPosition: 40,
    headTilt: 0,
    blinkRate: 3,
    microExpressions: true,
    naturalMovement: true
  });

  // Gerar animação facial com IA
  const generateFacialAnimation = async () => {
    setIsGenerating(true);
    
    try {
      toast.loading('Analisando emoção com IA...', { id: 'ai-analysis' });
      
      // Simular análise de IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.loading('Gerando keyframes faciais...', { id: 'ai-analysis' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('Otimizando movimentos naturais...', { id: 'ai-analysis' });
      await new Promise(resolve => setTimeout(resolve, 800));

      // Gerar keyframes baseados na emoção
      const keyframes = generateEmotionKeyframes(selectedEmotion, intensity[0], duration[0]);
      
      const newAnimation: EmotionData = {
        id: `emotion_${Date.now()}`,
        name: emotionPresets.find(e => e.id === selectedEmotion)?.name || 'Personalizada',
        intensity: intensity[0],
        duration: duration[0],
        keyframes
      };

      setCurrentEmotion(newAnimation);
      
      toast.success('Animação facial gerada com sucesso!', { id: 'ai-analysis' });
      
      if (onAnimationGenerated) {
        onAnimationGenerated(newAnimation);
      }

      // Iniciar preview da animação
      playAnimation(newAnimation);
      
    } catch (error) {
      toast.error('Erro ao gerar animação facial', { id: 'ai-analysis' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar keyframes para uma emoção específica
  const generateEmotionKeyframes = (emotion: string, intensity: number, duration: number): FacialKeyframe[] => {
    const keyframes: FacialKeyframe[] = [];
    const steps = Math.max(10, duration * 5); // 5 keyframes por segundo
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const timestamp = progress * duration;
      
      // Aplicar curva de animação (ease-in-out)
      const easeProgress = 0.5 * (1 - Math.cos(Math.PI * progress));
      const intensityFactor = (intensity / 100) * easeProgress;
      
      const keyframe: FacialKeyframe = {
        timestamp,
        ...getEmotionParameters(emotion, intensityFactor, progress)
      };
      
      keyframes.push(keyframe);
    }
    
    return keyframes;
  };

  // Obter parâmetros faciais para uma emoção
  const getEmotionParameters = (emotion: string, intensity: number, progress: number): Omit<FacialKeyframe, 'timestamp'> => {
    const baseParams = {
      eyebrowLeft: 50,
      eyebrowRight: 50,
      eyeLeft: 80,
      eyeRight: 80,
      cheekLeft: 30,
      cheekRight: 30,
      mouthCornerLeft: 50,
      mouthCornerRight: 50,
      mouthOpen: 20,
      jawOpen: 10,
      headTilt: 0,
      headRotation: 0
    };

    // Adicionar variação natural
    const naturalVariation = Math.sin(progress * Math.PI * 4) * 2;

    switch (emotion) {
      case 'happy':
        return {
          ...baseParams,
          eyebrowLeft: 60 + intensity * 20,
          eyebrowRight: 60 + intensity * 20,
          eyeLeft: 70 + intensity * 10,
          eyeRight: 70 + intensity * 10,
          cheekLeft: 50 + intensity * 30,
          cheekRight: 50 + intensity * 30,
          mouthCornerLeft: 70 + intensity * 25,
          mouthCornerRight: 70 + intensity * 25,
          mouthOpen: 30 + intensity * 20,
          headTilt: naturalVariation
        };
        
      case 'sad':
        return {
          ...baseParams,
          eyebrowLeft: 30 - intensity * 20,
          eyebrowRight: 30 - intensity * 20,
          eyeLeft: 60 - intensity * 20,
          eyeRight: 60 - intensity * 20,
          cheekLeft: 20 - intensity * 10,
          cheekRight: 20 - intensity * 10,
          mouthCornerLeft: 30 - intensity * 20,
          mouthCornerRight: 30 - intensity * 20,
          headTilt: -5 + naturalVariation
        };
        
      case 'angry':
        return {
          ...baseParams,
          eyebrowLeft: 20 - intensity * 15,
          eyebrowRight: 20 - intensity * 15,
          eyeLeft: 90 + intensity * 10,
          eyeRight: 90 + intensity * 10,
          cheekLeft: 40 + intensity * 20,
          cheekRight: 40 + intensity * 20,
          mouthCornerLeft: 40 - intensity * 15,
          mouthCornerRight: 40 - intensity * 15,
          jawOpen: 20 + intensity * 15,
          headTilt: naturalVariation * 2
        };
        
      case 'surprised':
        return {
          ...baseParams,
          eyebrowLeft: 80 + intensity * 20,
          eyebrowRight: 80 + intensity * 20,
          eyeLeft: 100,
          eyeRight: 100,
          mouthOpen: 60 + intensity * 30,
          jawOpen: 40 + intensity * 20,
          headTilt: naturalVariation
        };
        
      default:
        return {
          ...baseParams,
          headTilt: naturalVariation * 0.5
        };
    }
  };

  // Reproduzir animação
  const playAnimation = (animation: EmotionData) => {
    if (!animation) return;
    
    setIsPlaying(true);
    setAnimationProgress(0);
    
    const startTime = Date.now();
    const duration = animation.duration * 1000; // converter para ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setAnimationProgress(progress * 100);
      renderAnimationFrame(animation, progress);
      
      if (progress < 1 && isPlaying) {
        requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setAnimationProgress(0);
      }
    };
    
    animate();
  };

  // Renderizar frame da animação
  const renderAnimationFrame = (animation: EmotionData, progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Encontrar keyframe atual
    const currentTime = progress * animation.duration;
    const keyframe = interpolateKeyframes(animation.keyframes, currentTime);
    
    if (keyframe) {
      renderFace(ctx, keyframe);
    }

    // Indicador de progresso
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, canvas.height - 4, canvas.width * progress, 4);
  };

  // Interpolar entre keyframes
  const interpolateKeyframes = (keyframes: FacialKeyframe[], time: number): FacialKeyframe | null => {
    if (keyframes.length === 0) return null;
    
    // Encontrar keyframes adjacentes
    let prevFrame = keyframes[0];
    let nextFrame = keyframes[keyframes.length - 1];
    
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i].timestamp && time <= keyframes[i + 1].timestamp) {
        prevFrame = keyframes[i];
        nextFrame = keyframes[i + 1];
        break;
      }
    }
    
    // Interpolar valores
    const timeDiff = nextFrame.timestamp - prevFrame.timestamp;
    const factor = timeDiff > 0 ? (time - prevFrame.timestamp) / timeDiff : 0;
    
    return {
      timestamp: time,
      eyebrowLeft: lerp(prevFrame.eyebrowLeft, nextFrame.eyebrowLeft, factor),
      eyebrowRight: lerp(prevFrame.eyebrowRight, nextFrame.eyebrowRight, factor),
      eyeLeft: lerp(prevFrame.eyeLeft, nextFrame.eyeLeft, factor),
      eyeRight: lerp(prevFrame.eyeRight, nextFrame.eyeRight, factor),
      cheekLeft: lerp(prevFrame.cheekLeft, nextFrame.cheekLeft, factor),
      cheekRight: lerp(prevFrame.cheekRight, nextFrame.cheekRight, factor),
      mouthCornerLeft: lerp(prevFrame.mouthCornerLeft, nextFrame.mouthCornerLeft, factor),
      mouthCornerRight: lerp(prevFrame.mouthCornerRight, nextFrame.mouthCornerRight, factor),
      mouthOpen: lerp(prevFrame.mouthOpen, nextFrame.mouthOpen, factor),
      jawOpen: lerp(prevFrame.jawOpen, nextFrame.jawOpen, factor),
      headTilt: lerp(prevFrame.headTilt, nextFrame.headTilt, factor),
      headRotation: lerp(prevFrame.headRotation, nextFrame.headRotation, factor)
    };
  };

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Renderizar rosto com parâmetros
  const renderFace = (ctx: CanvasRenderingContext2D, keyframe: FacialKeyframe) => {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    
    ctx.save();
    
    // Aplicar rotação da cabeça
    ctx.translate(centerX, centerY);
    ctx.rotate((keyframe.headTilt * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Cabeça
    ctx.fillStyle = '#fdbcb4';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 20, 80, 100, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Sobrancelhas
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Sobrancelha esquerda
    const eyebrowLeftY = centerY - 60 - (keyframe.eyebrowLeft - 50) * 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, eyebrowLeftY);
    ctx.lineTo(centerX - 10, eyebrowLeftY - 5);
    ctx.stroke();
    
    // Sobrancelha direita
    const eyebrowRightY = centerY - 60 - (keyframe.eyebrowRight - 50) * 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX + 10, eyebrowRightY - 5);
    ctx.lineTo(centerX + 40, eyebrowRightY);
    ctx.stroke();

    // Olhos
    const eyeOpenness = keyframe.eyeLeft / 100;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(centerX - 25, centerY - 40, 15, 10 * eyeOpenness, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 25, centerY - 40, 15, 10 * eyeOpenness, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Pupilas
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.ellipse(centerX - 25, centerY - 40, 6, 6 * eyeOpenness, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 25, centerY - 40, 6, 6 * eyeOpenness, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Bochechas (blush para emoções positivas)
    if (keyframe.cheekLeft > 40) {
      ctx.fillStyle = `rgba(255, 182, 193, ${(keyframe.cheekLeft - 40) / 60})`;
      ctx.beginPath();
      ctx.ellipse(centerX - 50, centerY - 10, 15, 10, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX + 50, centerY - 10, 15, 10, 0, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Boca
    const mouthY = centerY + 20;
    const mouthWidth = 30 + keyframe.mouthOpen * 0.5;
    const mouthHeight = 5 + keyframe.mouthOpen * 0.3;
    const mouthCurve = (keyframe.mouthCornerLeft + keyframe.mouthCornerRight) / 2 - 50;
    
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.ellipse(centerX, mouthY + mouthCurve * 0.2, mouthWidth, mouthHeight, 0, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  };

  // Analisar texto para detectar emoção
  const analyzeEmotionFromText = () => {
    if (!emotionText.trim()) {
      toast.error('Digite um texto para análise');
      return;
    }

    // Simular análise de sentimento
    const positiveWords = ['feliz', 'alegre', 'ótimo', 'excelente', 'maravilhoso', 'amor', 'sucesso'];
    const negativeWords = ['triste', 'ruim', 'terrível', 'ódio', 'problema', 'erro', 'falha'];
    const surpriseWords = ['incrível', 'uau', 'nossa', 'caramba', 'impressionante'];
    
    const text = emotionText.toLowerCase();
    
    let detectedEmotion = 'neutral';
    if (positiveWords.some(word => text.includes(word))) {
      detectedEmotion = 'happy';
    } else if (negativeWords.some(word => text.includes(word))) {
      detectedEmotion = 'sad';
    } else if (surpriseWords.some(word => text.includes(word))) {
      detectedEmotion = 'surprised';
    }
    
    setSelectedEmotion(detectedEmotion);
    toast.success(`Emoção detectada: ${emotionPresets.find(e => e.id === detectedEmotion)?.name}`);
  };

  useEffect(() => {
    // Renderizar estado inicial
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        renderAnimationFrame({
          id: 'initial',
          name: 'Inicial',
          intensity: 50,
          duration: 1,
          keyframes: [{
            timestamp: 0,
            eyebrowLeft: 50,
            eyebrowRight: 50,
            eyeLeft: 80,
            eyeRight: 80,
            cheekLeft: 30,
            cheekRight: 30,
            mouthCornerLeft: 50,
            mouthCornerRight: 50,
            mouthOpen: 20,
            jawOpen: 10,
            headTilt: 0,
            headRotation: 0
          }]
        }, 0);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Preview Canvas */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Preview Animação Facial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="border-2 border-gray-200 rounded-lg shadow-lg bg-white"
            />
            
            {isPlaying && (
              <div className="w-full space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${animationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Reproduzindo... {Math.round(animationProgress)}%
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => currentEmotion && playAnimation(currentEmotion)}
                disabled={!currentEmotion || isPlaying}
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Reproduzir
              </Button>
              <Button
                onClick={() => setIsPlaying(false)}
                disabled={!isPlaying}
                variant="outline"
                size="sm"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </Button>
              <Button
                onClick={() => {
                  setIsPlaying(false);
                  setAnimationProgress(0);
                }}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise de Texto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Análise de Emoção por IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="emotion-text">Texto para Análise</Label>
              <Textarea
                id="emotion-text"
                value={emotionText}
                onChange={(e) => setEmotionText(e.target.value)}
                placeholder="Digite um texto para detectar a emoção automaticamente..."
                rows={3}
              />
            </div>
            
            <Button
              onClick={analyzeEmotionFromText}
              variant="outline"
              className="w-full"
            >
              <Brain className="w-4 h-4 mr-2" />
              Analisar Emoção
            </Button>
          </CardContent>
        </Card>

        {/* Seleção de Emoção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Emoções Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {emotionPresets.map((emotion) => (
                <div
                  key={emotion.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedEmotion === emotion.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEmotion(emotion.id)}
                >
                  <div className="text-center space-y-1">
                    <div className="text-2xl">{emotion.icon}</div>
                    <h4 className="font-medium text-sm">{emotion.name}</h4>
                    <p className="text-xs text-gray-600">{emotion.description}</p>
                    {selectedEmotion === emotion.id && (
                      <Badge variant="default" className="text-xs">Selecionado</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Parâmetros de Animação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Parâmetros de Animação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Intensidade: {intensity[0]}%</Label>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                min={10}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Duração: {duration[0]}s</Label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                min={1}
                max={10}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div className="space-y-3">
              <Label>Parâmetros Faciais Avançados</Label>
              
              <div>
                <Label className="text-sm">Altura das Sobrancelhas: {facialParams.eyebrowHeight}%</Label>
                <Slider
                  value={[facialParams.eyebrowHeight]}
                  onValueChange={([value]) => setFacialParams({...facialParams, eyebrowHeight: value})}
                  min={0}
                  max={100}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Abertura dos Olhos: {facialParams.eyeOpenness}%</Label>
                <Slider
                  value={[facialParams.eyeOpenness]}
                  onValueChange={([value]) => setFacialParams({...facialParams, eyeOpenness: value})}
                  min={0}
                  max={100}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Curvatura da Boca: {facialParams.mouthCurvature}%</Label>
                <Slider
                  value={[facialParams.mouthCurvature]}
                  onValueChange={([value]) => setFacialParams({...facialParams, mouthCurvature: value})}
                  min={0}
                  max={100}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={generateFacialAnimation}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  Gerando IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Animação Facial
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </div>

            <Button variant="outline" className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Capturar Frame
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status da Animação */}
      {currentEmotion && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Animação: {currentEmotion.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Intensidade: {currentEmotion.intensity}% | Duração: {currentEmotion.duration}s | 
                  Keyframes: {currentEmotion.keyframes.length}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Brain className="w-4 h-4 mr-2" />
                IA Pronta
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}