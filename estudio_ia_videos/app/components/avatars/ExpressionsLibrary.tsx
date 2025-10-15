/**
 * 😊 Expressions Library - Biblioteca de Expressões Faciais e Gestos
 * Mais de 100 expressões faciais e gestos corporais para avatares expressivos
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smile, 
  Frown, 
  Heart, 
  Zap,
  Eye,
  Hand,
  User,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Bookmark,
  Settings,
  Shuffle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Expression {
  id: string;
  name: string;
  category: 'facial' | 'gesture' | 'posture' | 'combined';
  emotion: string;
  intensity: number;
  duration: number;
  description: string;
  icon: string;
  keyframes: ExpressionKeyframe[];
  tags: string[];
  popularity: number;
  isFavorite?: boolean;
}

interface ExpressionKeyframe {
  timestamp: number;
  facial: FacialParameters;
  gesture: GestureParameters;
  posture: PostureParameters;
}

interface FacialParameters {
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
  noseFlare: number;
  foreheadWrinkle: number;
}

interface GestureParameters {
  leftHandPosition: { x: number; y: number; z: number };
  rightHandPosition: { x: number; y: number; z: number };
  leftHandRotation: { x: number; y: number; z: number };
  rightHandRotation: { x: number; y: number; z: number };
  fingerPositions: number[];
}

interface PostureParameters {
  headTilt: number;
  headRotation: number;
  shoulderLeft: number;
  shoulderRight: number;
  spineRotation: number;
  hipPosition: number;
}

interface ExpressionsLibraryProps {
  avatarId: string;
  onExpressionSelected?: (expression: Expression) => void;
}

export default function ExpressionsLibrary({ avatarId, onExpressionSelected }: ExpressionsLibraryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedExpression, setSelectedExpression] = useState<Expression | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [intensityFilter, setIntensityFilter] = useState([0, 100]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [customExpressions, setCustomExpressions] = useState<Expression[]>([]);

  // Biblioteca de expressões pré-definidas
  const expressionLibrary: Expression[] = [
    // Expressões Faciais Básicas
    {
      id: 'happy_smile',
      name: 'Sorriso Feliz',
      category: 'facial',
      emotion: 'happiness',
      intensity: 80,
      duration: 2,
      description: 'Sorriso genuíno e caloroso',
      icon: '😊',
      tags: ['sorriso', 'feliz', 'positivo', 'caloroso'],
      popularity: 95,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 60, eyebrowRight: 60, eyeLeft: 75, eyeRight: 75,
            cheekLeft: 80, cheekRight: 80, mouthCornerLeft: 85, mouthCornerRight: 85,
            mouthOpen: 30, jawOpen: 15, noseFlare: 20, foreheadWrinkle: 10
          },
          gesture: { leftHandPosition: {x: 0, y: 0, z: 0}, rightHandPosition: {x: 0, y: 0, z: 0}, 
                    leftHandRotation: {x: 0, y: 0, z: 0}, rightHandRotation: {x: 0, y: 0, z: 0}, fingerPositions: [] },
          posture: { headTilt: 2, headRotation: 0, shoulderLeft: 0, shoulderRight: 0, spineRotation: 0, hipPosition: 0 }
        }
      ]
    },
    {
      id: 'sad_frown',
      name: 'Tristeza Profunda',
      category: 'facial',
      emotion: 'sadness',
      intensity: 75,
      duration: 3,
      description: 'Expressão de tristeza e melancolia',
      icon: '😢',
      tags: ['triste', 'melancolia', 'choro', 'emocionado'],
      popularity: 70,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 25, eyebrowRight: 25, eyeLeft: 60, eyeRight: 60,
            cheekLeft: 20, cheekRight: 20, mouthCornerLeft: 25, mouthCornerRight: 25,
            mouthOpen: 15, jawOpen: 5, noseFlare: 10, foreheadWrinkle: 60
          },
          gesture: { leftHandPosition: {x: 0, y: 0, z: 0}, rightHandPosition: {x: 0, y: 0, z: 0}, 
                    leftHandRotation: {x: 0, y: 0, z: 0}, rightHandRotation: {x: 0, y: 0, z: 0}, fingerPositions: [] },
          posture: { headTilt: -5, headRotation: 0, shoulderLeft: -10, shoulderRight: -10, spineRotation: 0, hipPosition: 0 }
        }
      ]
    },
    {
      id: 'angry_furious',
      name: 'Raiva Intensa',
      category: 'facial',
      emotion: 'anger',
      intensity: 90,
      duration: 2.5,
      description: 'Expressão de raiva e irritação',
      icon: '😠',
      tags: ['raiva', 'irritado', 'bravo', 'furioso'],
      popularity: 65,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 15, eyebrowRight: 15, eyeLeft: 95, eyeRight: 95,
            cheekLeft: 60, cheekRight: 60, mouthCornerLeft: 30, mouthCornerRight: 30,
            mouthOpen: 40, jawOpen: 25, noseFlare: 80, foreheadWrinkle: 90
          },
          gesture: { leftHandPosition: {x: 0, y: 0, z: 0}, rightHandPosition: {x: 0, y: 0, z: 0}, 
                    leftHandRotation: {x: 0, y: 0, z: 0}, rightHandRotation: {x: 0, y: 0, z: 0}, fingerPositions: [] },
          posture: { headTilt: 0, headRotation: 0, shoulderLeft: 15, shoulderRight: 15, spineRotation: 0, hipPosition: 0 }
        }
      ]
    },
    {
      id: 'surprised_wow',
      name: 'Surpresa Total',
      category: 'facial',
      emotion: 'surprise',
      intensity: 85,
      duration: 1.5,
      description: 'Expressão de espanto e surpresa',
      icon: '😲',
      tags: ['surpreso', 'espanto', 'chocado', 'impressionado'],
      popularity: 80,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 90, eyebrowRight: 90, eyeLeft: 100, eyeRight: 100,
            cheekLeft: 40, cheekRight: 40, mouthCornerLeft: 50, mouthCornerRight: 50,
            mouthOpen: 80, jawOpen: 60, noseFlare: 30, foreheadWrinkle: 70
          },
          gesture: { leftHandPosition: {x: 0, y: 0, z: 0}, rightHandPosition: {x: 0, y: 0, z: 0}, 
                    leftHandRotation: {x: 0, y: 0, z: 0}, rightHandRotation: {x: 0, y: 0, z: 0}, fingerPositions: [] },
          posture: { headTilt: 0, headRotation: 0, shoulderLeft: 0, shoulderRight: 0, spineRotation: 0, hipPosition: 0 }
        }
      ]
    },

    // Gestos Corporais
    {
      id: 'wave_hello',
      name: 'Aceno de Cumprimento',
      category: 'gesture',
      emotion: 'friendly',
      intensity: 70,
      duration: 2,
      description: 'Aceno amigável com a mão direita',
      icon: '👋',
      tags: ['aceno', 'cumprimento', 'oi', 'tchau'],
      popularity: 90,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 55, eyebrowRight: 55, eyeLeft: 80, eyeRight: 80,
            cheekLeft: 60, cheekRight: 60, mouthCornerLeft: 70, mouthCornerRight: 70,
            mouthOpen: 25, jawOpen: 10, noseFlare: 15, foreheadWrinkle: 5
          },
          gesture: { 
            leftHandPosition: {x: 0, y: 0, z: 0}, 
            rightHandPosition: {x: 30, y: 50, z: 10}, 
            leftHandRotation: {x: 0, y: 0, z: 0}, 
            rightHandRotation: {x: 0, y: 15, z: 20}, 
            fingerPositions: [80, 80, 80, 80, 80] 
          },
          posture: { headTilt: 3, headRotation: 5, shoulderLeft: 0, shoulderRight: 10, spineRotation: 5, hipPosition: 0 }
        }
      ]
    },
    {
      id: 'thumbs_up',
      name: 'Polegar para Cima',
      category: 'gesture',
      emotion: 'approval',
      intensity: 75,
      duration: 1.5,
      description: 'Gesto de aprovação e positividade',
      icon: '👍',
      tags: ['aprovação', 'positivo', 'legal', 'concordo'],
      popularity: 85,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 65, eyebrowRight: 65, eyeLeft: 85, eyeRight: 85,
            cheekLeft: 70, cheekRight: 70, mouthCornerLeft: 75, mouthCornerRight: 75,
            mouthOpen: 20, jawOpen: 8, noseFlare: 10, foreheadWrinkle: 0
          },
          gesture: { 
            leftHandPosition: {x: 0, y: 0, z: 0}, 
            rightHandPosition: {x: 20, y: 30, z: 15}, 
            leftHandRotation: {x: 0, y: 0, z: 0}, 
            rightHandRotation: {x: -10, y: 0, z: 0}, 
            fingerPositions: [100, 0, 0, 0, 0] 
          },
          posture: { headTilt: 2, headRotation: 0, shoulderLeft: 0, shoulderRight: 5, spineRotation: 0, hipPosition: 0 }
        }
      ]
    },
    {
      id: 'thinking_pose',
      name: 'Pose Pensativa',
      category: 'combined',
      emotion: 'contemplative',
      intensity: 60,
      duration: 3,
      description: 'Expressão pensativa com mão no queixo',
      icon: '🤔',
      tags: ['pensativo', 'reflexivo', 'concentrado', 'analisando'],
      popularity: 75,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 45, eyebrowRight: 50, eyeLeft: 70, eyeRight: 75,
            cheekLeft: 30, cheekRight: 30, mouthCornerLeft: 45, mouthCornerRight: 45,
            mouthOpen: 10, jawOpen: 5, noseFlare: 5, foreheadWrinkle: 30
          },
          gesture: { 
            leftHandPosition: {x: 0, y: 0, z: 0}, 
            rightHandPosition: {x: 15, y: 20, z: 25}, 
            leftHandRotation: {x: 0, y: 0, z: 0}, 
            rightHandRotation: {x: 45, y: -10, z: 0}, 
            fingerPositions: [60, 80, 70, 60, 50] 
          },
          posture: { headTilt: -3, headRotation: 8, shoulderLeft: 0, shoulderRight: 8, spineRotation: 3, hipPosition: 0 }
        }
      ]
    },
    {
      id: 'confident_stance',
      name: 'Postura Confiante',
      category: 'posture',
      emotion: 'confidence',
      intensity: 80,
      duration: 2.5,
      description: 'Postura ereta e confiante',
      icon: '😎',
      tags: ['confiante', 'seguro', 'determinado', 'líder'],
      popularity: 70,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 55, eyebrowRight: 55, eyeLeft: 85, eyeRight: 85,
            cheekLeft: 50, cheekRight: 50, mouthCornerLeft: 60, mouthCornerRight: 60,
            mouthOpen: 15, jawOpen: 5, noseFlare: 10, foreheadWrinkle: 0
          },
          gesture: { 
            leftHandPosition: {x: -15, y: 10, z: 0}, 
            rightHandPosition: {x: 15, y: 10, z: 0}, 
            leftHandRotation: {x: 0, y: 0, z: 0}, 
            rightHandRotation: {x: 0, y: 0, z: 0}, 
            fingerPositions: [50, 50, 50, 50, 50] 
          },
          posture: { headTilt: 0, headRotation: 0, shoulderLeft: 5, shoulderRight: 5, spineRotation: 0, hipPosition: 0 }
        }
      ]
    },

    // Expressões Profissionais
    {
      id: 'professional_smile',
      name: 'Sorriso Profissional',
      category: 'facial',
      emotion: 'professional',
      intensity: 65,
      duration: 2,
      description: 'Sorriso controlado e profissional',
      icon: '😊',
      tags: ['profissional', 'educado', 'cortês', 'negócios'],
      popularity: 88,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 50, eyebrowRight: 50, eyeLeft: 80, eyeRight: 80,
            cheekLeft: 55, cheekRight: 55, mouthCornerLeft: 65, mouthCornerRight: 65,
            mouthOpen: 20, jawOpen: 8, noseFlare: 5, foreheadWrinkle: 0
          },
          gesture: { leftHandPosition: {x: 0, y: 0, z: 0}, rightHandPosition: {x: 0, y: 0, z: 0}, 
                    leftHandRotation: {x: 0, y: 0, z: 0}, rightHandRotation: {x: 0, y: 0, z: 0}, fingerPositions: [] },
          posture: { headTilt: 0, headRotation: 0, shoulderLeft: 0, shoulderRight: 0, spineRotation: 0, hipPosition: 0 }
        }
      ]
    },
    {
      id: 'explaining_gesture',
      name: 'Gesto Explicativo',
      category: 'gesture',
      emotion: 'educational',
      intensity: 70,
      duration: 3,
      description: 'Gesto de explicação com as mãos',
      icon: '🤲',
      tags: ['explicando', 'ensinando', 'apresentando', 'demonstrando'],
      popularity: 82,
      keyframes: [
        {
          timestamp: 0,
          facial: {
            eyebrowLeft: 60, eyebrowRight: 60, eyeLeft: 85, eyeRight: 85,
            cheekLeft: 45, cheekRight: 45, mouthCornerLeft: 55, mouthCornerRight: 55,
            mouthOpen: 30, jawOpen: 15, noseFlare: 10, foreheadWrinkle: 10
          },
          gesture: { 
            leftHandPosition: {x: -25, y: 25, z: 10}, 
            rightHandPosition: {x: 25, y: 25, z: 10}, 
            leftHandRotation: {x: 0, y: 15, z: -10}, 
            rightHandRotation: {x: 0, y: -15, z: 10}, 
            fingerPositions: [70, 70, 70, 70, 70] 
          },
          posture: { headTilt: 1, headRotation: 0, shoulderLeft: 0, shoulderRight: 0, spineRotation: 0, hipPosition: 0 }
        }
      ]
    }
  ];

  // Categorias e emoções para filtros
  const categories = [
    { id: 'all', name: 'Todas', icon: '🎭' },
    { id: 'facial', name: 'Faciais', icon: '😊' },
    { id: 'gesture', name: 'Gestos', icon: '👋' },
    { id: 'posture', name: 'Postura', icon: '🧍' },
    { id: 'combined', name: 'Combinadas', icon: '🎪' }
  ];

  const emotions = [
    { id: 'all', name: 'Todas', color: 'gray' },
    { id: 'happiness', name: 'Felicidade', color: 'yellow' },
    { id: 'sadness', name: 'Tristeza', color: 'blue' },
    { id: 'anger', name: 'Raiva', color: 'red' },
    { id: 'surprise', name: 'Surpresa', color: 'purple' },
    { id: 'professional', name: 'Profissional', color: 'indigo' },
    { id: 'friendly', name: 'Amigável', color: 'green' },
    { id: 'confidence', name: 'Confiança', color: 'orange' }
  ];

  // Filtrar expressões
  const filteredExpressions = expressionLibrary.filter(expression => {
    const matchesSearch = expression.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expression.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || expression.category === selectedCategory;
    const matchesEmotion = selectedEmotion === 'all' || expression.emotion === selectedEmotion;
    const matchesIntensity = expression.intensity >= intensityFilter[0] && expression.intensity <= intensityFilter[1];
    
    return matchesSearch && matchesCategory && matchesEmotion && matchesIntensity;
  });

  // Reproduzir expressão
  const playExpression = (expression: Expression) => {
    setSelectedExpression(expression);
    setIsPlaying(true);
    setPlaybackProgress(0);
    
    const startTime = Date.now();
    const duration = expression.duration * 1000;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setPlaybackProgress(progress * 100);
      renderExpressionFrame(expression, progress);
      
      if (progress < 1 && isPlaying) {
        requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setPlaybackProgress(0);
      }
    };
    
    animate();
    
    if (onExpressionSelected) {
      onExpressionSelected(expression);
    }
    
    toast.success(`Expressão "${expression.name}" aplicada!`);
  };

  // Renderizar frame da expressão
  const renderExpressionFrame = (expression: Expression, progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo gradiente baseado na emoção
    const emotionColors = {
      happiness: ['#fef3c7', '#fde68a'],
      sadness: ['#dbeafe', '#bfdbfe'],
      anger: ['#fee2e2', '#fecaca'],
      surprise: ['#f3e8ff', '#e9d5ff'],
      professional: ['#e0e7ff', '#c7d2fe'],
      friendly: ['#d1fae5', '#a7f3d0'],
      confidence: ['#fed7aa', '#fdba74']
    };
    
    const colors = emotionColors[expression.emotion as keyof typeof emotionColors] || ['#f8fafc', '#e2e8f0'];
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Obter keyframe atual
    const keyframe = expression.keyframes[0]; // Simplificado para o primeiro keyframe
    if (!keyframe) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Aplicar postura
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((keyframe.posture.headRotation * Math.PI) / 180);
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
    
    const eyebrowLeftY = centerY - 60 - (keyframe.facial.eyebrowLeft - 50) * 0.5;
    const eyebrowRightY = centerY - 60 - (keyframe.facial.eyebrowRight - 50) * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(centerX - 40, eyebrowLeftY);
    ctx.lineTo(centerX - 10, eyebrowLeftY - 5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX + 10, eyebrowRightY - 5);
    ctx.lineTo(centerX + 40, eyebrowRightY);
    ctx.stroke();

    // Olhos
    const eyeOpenness = keyframe.facial.eyeLeft / 100;
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

    // Bochechas (blush)
    if (keyframe.facial.cheekLeft > 50) {
      ctx.fillStyle = `rgba(255, 182, 193, ${(keyframe.facial.cheekLeft - 50) / 50 * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(centerX - 50, centerY - 10, 15, 10, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX + 50, centerY - 10, 15, 10, 0, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Boca
    const mouthY = centerY + 20;
    const mouthWidth = 20 + keyframe.facial.mouthOpen * 0.3;
    const mouthHeight = 5 + keyframe.facial.mouthOpen * 0.2;
    const mouthCurve = (keyframe.facial.mouthCornerLeft + keyframe.facial.mouthCornerRight) / 2 - 50;
    
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.ellipse(centerX, mouthY + mouthCurve * 0.2, mouthWidth, mouthHeight, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Gestos das mãos (simplificado)
    if (expression.category === 'gesture' || expression.category === 'combined') {
      ctx.fillStyle = '#fdbcb4';
      
      // Mão direita
      const rightHandX = centerX + keyframe.gesture.rightHandPosition.x * 2;
      const rightHandY = centerY + keyframe.gesture.rightHandPosition.y * 2;
      ctx.beginPath();
      ctx.ellipse(rightHandX, rightHandY, 12, 8, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Mão esquerda
      const leftHandX = centerX + keyframe.gesture.leftHandPosition.x * 2;
      const leftHandY = centerY + keyframe.gesture.leftHandPosition.y * 2;
      ctx.beginPath();
      ctx.ellipse(leftHandX, leftHandY, 12, 8, 0, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();

    // Indicador de progresso
    const emotionColor = emotions.find(e => e.id === expression.emotion)?.color || 'blue';
    ctx.fillStyle = emotionColor === 'yellow' ? '#eab308' : 
                   emotionColor === 'blue' ? '#3b82f6' :
                   emotionColor === 'red' ? '#ef4444' :
                   emotionColor === 'purple' ? '#8b5cf6' :
                   emotionColor === 'green' ? '#10b981' :
                   emotionColor === 'orange' ? '#f97316' :
                   emotionColor === 'indigo' ? '#6366f1' : '#6b7280';
    ctx.fillRect(0, canvas.height - 4, canvas.width * progress, 4);

    // Informações da expressão
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${expression.name} - ${Math.round(progress * 100)}%`, centerX, 15);
  };

  // Adicionar aos favoritos
  const toggleFavorite = (expressionId: string) => {
    setFavorites(prev => 
      prev.includes(expressionId) 
        ? prev.filter(id => id !== expressionId)
        : [...prev, expressionId]
    );
  };

  // Expressão aleatória
  const playRandomExpression = () => {
    const randomExpression = filteredExpressions[Math.floor(Math.random() * filteredExpressions.length)];
    if (randomExpression) {
      playExpression(randomExpression);
    }
  };

  useEffect(() => {
    // Renderizar estado inicial
    if (canvasRef.current && expressionLibrary.length > 0) {
      renderExpressionFrame(expressionLibrary[0], 0);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Preview Canvas */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5" />
            Preview de Expressões
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
            
            {isPlaying && selectedExpression && (
              <div className="w-full space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-orange-600 h-3 rounded-full transition-all duration-100"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Reproduzindo: {selectedExpression.name} - {Math.round(playbackProgress)}%
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => selectedExpression && playExpression(selectedExpression)}
                disabled={!selectedExpression || isPlaying}
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
                onClick={playRandomExpression}
                variant="outline"
                size="sm"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Aleatória
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Buscar Expressões</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para buscar..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Intensidade: {intensityFilter[0]}% - {intensityFilter[1]}%</Label>
              <Slider
                value={intensityFilter}
                onValueChange={setIntensityFilter}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label>Categoria</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Emoção</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {emotions.map((emotion) => (
                <Button
                  key={emotion.id}
                  variant={selectedEmotion === emotion.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEmotion(emotion.id)}
                >
                  {emotion.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biblioteca de Expressões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Biblioteca de Expressões
            </div>
            <Badge variant="secondary">
              {filteredExpressions.length} expressões
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExpressions.map((expression) => (
              <Card
                key={expression.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedExpression?.id === expression.id
                    ? 'ring-2 ring-orange-500 bg-orange-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => playExpression(expression)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl">{expression.icon}</div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(expression.id);
                          }}
                        >
                          {favorites.includes(expression.id) ? (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                        <Badge variant="outline" className="text-xs">
                          {expression.category}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm">{expression.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {expression.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Intensidade: {expression.intensity}%</span>
                      <span>{expression.duration}s</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {expression.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span className="text-xs">{expression.popularity}%</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="w-3 h-3 mr-1" />
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExpressions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Nenhuma expressão encontrada com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expressão Selecionada */}
      {selectedExpression && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {selectedExpression.icon} {selectedExpression.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedExpression.description}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Categoria: {selectedExpression.category}</span>
                  <span>Emoção: {selectedExpression.emotion}</span>
                  <span>Intensidade: {selectedExpression.intensity}%</span>
                  <span>Duração: {selectedExpression.duration}s</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFavorite(selectedExpression.id)}
                >
                  {favorites.includes(selectedExpression.id) ? (
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}