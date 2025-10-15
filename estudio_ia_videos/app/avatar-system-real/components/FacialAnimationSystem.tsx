'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Upload,
  Download,
  Smile,
  Frown,
  Meh,
  Eye,
  Volume2
} from 'lucide-react';

interface BlendShape {
  name: string;
  value: number;
  category: 'mouth' | 'eyes' | 'brows' | 'cheeks' | 'nose';
}

interface AnimationKeyframe {
  time: number;
  blendShapes: Record<string, number>;
  emotion: string;
}

interface FacialAnimationSystemProps {
  avatar?: any;
  onAnimationGenerated?: (animation: any) => void;
}

export default function FacialAnimationSystem({ avatar, onAnimationGenerated }: FacialAnimationSystemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('neutral');
  const [animationIntensity, setAnimationIntensity] = useState(0.8);
  const [lipSyncAccuracy, setLipSyncAccuracy] = useState(0.9);
  
  const [blendShapes, setBlendShapes] = useState<BlendShape[]>([
    { name: 'jawOpen', value: 0, category: 'mouth' },
    { name: 'mouthSmile', value: 0, category: 'mouth' },
    { name: 'mouthFrown', value: 0, category: 'mouth' },
    { name: 'mouthPucker', value: 0, category: 'mouth' },
    { name: 'eyeBlinkLeft', value: 0, category: 'eyes' },
    { name: 'eyeBlinkRight', value: 0, category: 'eyes' },
    { name: 'eyeLookUp', value: 0, category: 'eyes' },
    { name: 'eyeLookDown', value: 0, category: 'eyes' },
    { name: 'browInnerUp', value: 0, category: 'brows' },
    { name: 'browOuterUp', value: 0, category: 'brows' },
    { name: 'cheekPuff', value: 0, category: 'cheeks' },
    { name: 'noseSneer', value: 0, category: 'nose' }
  ]);

  const [keyframes, setKeyframes] = useState<AnimationKeyframe[]>([]);
  const [generatedAnimation, setGeneratedAnimation] = useState<any>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const emotions = [
    { value: 'neutral', label: 'Neutro', icon: Meh },
    { value: 'happy', label: 'Feliz', icon: Smile },
    { value: 'sad', label: 'Triste', icon: Frown },
    { value: 'angry', label: 'Raiva', icon: Frown },
    { value: 'surprised', label: 'Surpreso', icon: Eye },
    { value: 'fear', label: 'Medo', icon: Eye },
    { value: 'disgust', label: 'Nojo', icon: Frown }
  ];

  const updateBlendShape = (name: string, value: number) => {
    setBlendShapes(prev => 
      prev.map(bs => bs.name === name ? { ...bs, value } : bs)
    );
  };

  const generateFacialAnimation = async () => {
    if (!textInput && !audioFile) {
      alert('Por favor, forneça texto ou arquivo de áudio');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const steps = [
        'Analisando entrada de áudio/texto...',
        'Processando fonemas...',
        'Gerando movimentos labiais...',
        'Aplicando emoções...',
        'Calculando blend shapes...',
        'Criando keyframes...',
        'Otimizando animação...',
        'Finalizando...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setGenerationProgress(((i + 1) / steps.length) * 100);
      }

      // Simular geração de animação
      const newKeyframes: AnimationKeyframe[] = [];
      const animationDuration = audioFile ? 10 : textInput.length * 0.1;
      
      for (let t = 0; t <= animationDuration; t += 0.1) {
        const keyframe: AnimationKeyframe = {
          time: t,
          emotion: selectedEmotion,
          blendShapes: {}
        };

        // Simular valores de blend shapes baseados no tempo e emoção
        blendShapes.forEach(bs => {
          let value = 0;
          
          // Animação de fala (movimento da boca)
          if (bs.category === 'mouth') {
            value = Math.sin(t * 10) * 0.3 + Math.random() * 0.2;
          }
          
          // Piscar dos olhos
          if (bs.name.includes('Blink')) {
            value = Math.random() < 0.05 ? 1 : 0;
          }
          
          // Aplicar emoção
          if (selectedEmotion === 'happy' && bs.name === 'mouthSmile') {
            value += 0.6;
          } else if (selectedEmotion === 'sad' && bs.name === 'mouthFrown') {
            value += 0.5;
          }
          
          keyframe.blendShapes[bs.name] = Math.max(0, Math.min(1, value * animationIntensity));
        });

        newKeyframes.push(keyframe);
      }

      const animation = {
        id: `animation_${Date.now()}`,
        duration: animationDuration,
        keyframes: newKeyframes,
        metadata: {
          emotion: selectedEmotion,
          intensity: animationIntensity,
          lipSyncAccuracy,
          frameRate: 30,
          blendShapeCount: blendShapes.length
        }
      };

      setKeyframes(newKeyframes);
      setGeneratedAnimation(animation);
      setDuration(animationDuration);
      onAnimationGenerated?.(animation);

    } catch (error) {
      console.error('Erro ao gerar animação facial:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAnimation = () => {
    if (!generatedAnimation) return;
    
    setIsPlaying(true);
    setCurrentTime(0);
    
    // Simular reprodução da animação
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 0.1;
        if (newTime >= duration) {
          setIsPlaying(false);
          clearInterval(interval);
          return 0;
        }
        
        // Aplicar blend shapes do keyframe atual
        const currentKeyframe = keyframes.find(kf => Math.abs(kf.time - newTime) < 0.05);
        if (currentKeyframe) {
          setBlendShapes(prev => 
            prev.map(bs => ({
              ...bs,
              value: currentKeyframe.blendShapes[bs.name] || 0
            }))
          );
        }
        
        return newTime;
      });
    }, 100);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // Reset blend shapes
    setBlendShapes(prev => prev.map(bs => ({ ...bs, value: 0 })));
  };

  const exportAnimation = (format: 'fbx' | 'bvh' | 'json') => {
    if (!generatedAnimation) return;
    
    const data = JSON.stringify(generatedAnimation, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `facial_animation.${format}`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setTextInput(''); // Clear text input when audio is uploaded
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Sistema de Animação Facial com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controles */}
            <div className="space-y-4">
              <Tabs defaultValue="input" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="input">Entrada</TabsTrigger>
                  <TabsTrigger value="emotion">Emoção</TabsTrigger>
                  <TabsTrigger value="advanced">Avançado</TabsTrigger>
                </TabsList>

                <TabsContent value="input" className="space-y-4">
                  <div>
                    <Label>Texto para Animação</Label>
                    <Textarea
                      placeholder="Digite o texto que o avatar deve falar..."
                      value={textInput}
                      onChange={(e) => {
                        setTextInput(e.target.value);
                        if (e.target.value) setAudioFile(null);
                      }}
                      rows={4}
                    />
                  </div>

                  <div className="text-center text-gray-500">ou</div>

                  <div>
                    <Label>Upload de Áudio</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                        id="audio-upload"
                      />
                      <label
                        htmlFor="audio-upload"
                        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {audioFile ? audioFile.name : 'Clique para fazer upload de áudio'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {audioFile && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">Áudio carregado: {audioFile.name}</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="emotion" className="space-y-4">
                  <div>
                    <Label>Emoção Principal</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {emotions.map((emotion) => {
                        const IconComponent = emotion.icon;
                        return (
                          <Button
                            key={emotion.value}
                            variant={selectedEmotion === emotion.value ? "default" : "outline"}
                            onClick={() => setSelectedEmotion(emotion.value)}
                            className="flex items-center gap-2"
                          >
                            <IconComponent className="h-4 w-4" />
                            {emotion.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Intensidade da Emoção: {Math.round(animationIntensity * 100)}%</Label>
                    <Slider
                      value={[animationIntensity]}
                      onValueChange={(value) => setAnimationIntensity(value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div>
                    <Label>Precisão do Lip-Sync: {Math.round(lipSyncAccuracy * 100)}%</Label>
                    <Slider
                      value={[lipSyncAccuracy]}
                      onValueChange={(value) => setLipSyncAccuracy(value[0])}
                      min={0.5}
                      max={1}
                      step={0.05}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Blend Shapes Manuais</Label>
                    <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                      {blendShapes.map((bs) => (
                        <div key={bs.name} className="flex items-center gap-2">
                          <span className="text-xs w-20 truncate">{bs.name}</span>
                          <Slider
                            value={[bs.value]}
                            onValueChange={(value) => updateBlendShape(bs.name, value[0])}
                            min={0}
                            max={1}
                            step={0.01}
                            className="flex-1"
                          />
                          <span className="text-xs w-8">{Math.round(bs.value * 100)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button 
                  onClick={generateFacialAnimation} 
                  disabled={isGenerating || (!textInput && !audioFile)}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Gerar Animação
                    </>
                  )}
                </Button>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={generationProgress} />
                  <p className="text-xs text-gray-500 text-center">
                    {Math.round(generationProgress)}% - Processando animação facial...
                  </p>
                </div>
              )}
            </div>

            {/* Preview e Controles de Reprodução */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {avatar ? (
                  <div className="w-full h-full relative">
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/50 rounded-lg p-2 text-white text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span>Emoção: {selectedEmotion}</span>
                          <span>{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-100"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Selecione um avatar para preview</p>
                  </div>
                )}
              </div>

              {generatedAnimation && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      onClick={playAnimation} 
                      disabled={isPlaying}
                      variant="outline"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                    <Button 
                      onClick={stopAnimation}
                      variant="outline"
                      size="sm"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                    <Button 
                      onClick={() => setCurrentTime(0)}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Duração:</span> {duration.toFixed(1)}s
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Keyframes:</span> {keyframes.length}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Emoção:</span> {selectedEmotion}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Intensidade:</span> {Math.round(animationIntensity * 100)}%
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => exportAnimation('fbx')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      FBX
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => exportAnimation('bvh')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      BVH
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => exportAnimation('json')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      JSON
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}