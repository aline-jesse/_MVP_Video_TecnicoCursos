'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  User,
  Shirt,
  Palette,
  Lightbulb,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Upload,
  Eye,
  Camera,
  Video,
  Mic,
  RefreshCw,
  Maximize,
  Minimize,
  Grid,
  Sun,
  Moon,
  CloudRain,
  Zap
} from 'lucide-react';

interface AvatarPreviewProps {
  avatarId?: string;
  pose?: string;
  expression?: string;
  clothing?: string;
  background?: string;
  lighting?: string;
  animation?: string;
  onAvatarChange?: (updates: any) => void;
}

export function AvatarPreview({
  avatarId = 'default',
  pose = 'standing',
  expression = 'neutral',
  clothing = 'casual',
  background = 'transparent',
  lighting = 'natural',
  animation = 'idle',
  onAvatarChange
}: AvatarPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [showGrid, setShowGrid] = useState(false);
  const [showBones, setShowBones] = useState(false);

  // Avatar presets
  const avatarPresets = [
    { id: 'instructor-male', name: 'Instructor (Male)', gender: 'male', role: 'instructor' },
    { id: 'instructor-female', name: 'Instructor (Female)', gender: 'female', role: 'instructor' },
    { id: 'worker-male', name: 'Worker (Male)', gender: 'male', role: 'worker' },
    { id: 'worker-female', name: 'Worker (Female)', gender: 'female', role: 'worker' },
    { id: 'business-male', name: 'Business (Male)', gender: 'male', role: 'business' },
    { id: 'business-female', name: 'Business (Female)', gender: 'female', role: 'business' },
  ];

  const poses = [
    { id: 'standing', name: 'Standing', description: 'Natural standing pose' },
    { id: 'sitting', name: 'Sitting', description: 'Sitting at desk' },
    { id: 'presenting', name: 'Presenting', description: 'Presentation gesture' },
    { id: 'pointing', name: 'Pointing', description: 'Pointing gesture' },
    { id: 'explaining', name: 'Explaining', description: 'Explanatory gesture' },
    { id: 'thinking', name: 'Thinking', description: 'Thoughtful pose' },
    { id: 'welcoming', name: 'Welcoming', description: 'Open arms gesture' },
    { id: 'demonstrating', name: 'Demonstrating', description: 'Demonstration pose' },
  ];

  const expressions = [
    { id: 'neutral', name: 'Neutral', emoji: '😐' },
    { id: 'happy', name: 'Happy', emoji: '😊' },
    { id: 'serious', name: 'Serious', emoji: '😤' },
    { id: 'concerned', name: 'Concerned', emoji: '😟' },
    { id: 'excited', name: 'Excited', emoji: '😃' },
    { id: 'focused', name: 'Focused', emoji: '🤔' },
    { id: 'surprised', name: 'Surprised', emoji: '😲' },
    { id: 'confident', name: 'Confident', emoji: '😎' },
  ];

  const clothingOptions = [
    { id: 'casual', name: 'Casual', description: 'Casual wear' },
    { id: 'business', name: 'Business', description: 'Business attire' },
    { id: 'safety', name: 'Safety', description: 'Safety equipment' },
    { id: 'medical', name: 'Medical', description: 'Medical uniform' },
    { id: 'construction', name: 'Construction', description: 'Construction gear' },
    { id: 'lab', name: 'Lab Coat', description: 'Laboratory coat' },
  ];

  const backgrounds = [
    { id: 'transparent', name: 'Transparent', color: 'transparent' },
    { id: 'white', name: 'White', color: '#ffffff' },
    { id: 'office', name: 'Office', color: '#f8fafc' },
    { id: 'factory', name: 'Factory', color: '#374151' },
    { id: 'classroom', name: 'Classroom', color: '#fef3c7' },
    { id: 'laboratory', name: 'Laboratory', color: '#ecfdf5' },
    { id: 'construction', name: 'Construction', color: '#fef2f2' },
    { id: 'gradient', name: 'Gradient', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  ];

  const lightingOptions = [
    { id: 'natural', name: 'Natural', icon: Sun },
    { id: 'studio', name: 'Studio', icon: Lightbulb },
    { id: 'dramatic', name: 'Dramatic', icon: Zap },
    { id: 'soft', name: 'Soft', icon: Moon },
    { id: 'outdoor', name: 'Outdoor', icon: CloudRain },
  ];

  const animations = [
    { id: 'idle', name: 'Idle', description: 'Subtle breathing animation' },
    { id: 'talking', name: 'Talking', description: 'Speaking animation' },
    { id: 'gesturing', name: 'Gesturing', description: 'Hand gestures' },
    { id: 'nodding', name: 'Nodding', description: 'Head nodding' },
    { id: 'walking', name: 'Walking', description: 'Walking in place' },
    { id: 'typing', name: 'Typing', description: 'Typing motion' },
    { id: 'pointing', name: 'Pointing', description: 'Pointing animation' },
    { id: 'waving', name: 'Waving', description: 'Waving gesture' },
  ];

  // Initialize 3D canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (background !== 'transparent') {
      const bgOption = backgrounds.find(bg => bg.id === background);
      if (bgOption) {
        ctx.fillStyle = bgOption.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Draw 3D avatar placeholder
    drawAvatarPlaceholder(ctx, canvas.width, canvas.height);

  }, [background, showGrid, rotation, zoom, position, avatarId, pose, expression, clothing, lighting, animation]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawAvatarPlaceholder = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2 + position.x;
    const centerY = height / 2 + position.y;
    const scale = zoom;

    // Avatar body (simplified 3D representation)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.rotate((rotation.y * Math.PI) / 180);

    // Body
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-30, -60, 60, 120);

    // Head
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -80, 25, 0, 2 * Math.PI);
    ctx.fill();

    // Arms
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-50, -40, 20, 80);
    ctx.fillRect(30, -40, 20, 80);

    // Legs
    ctx.fillRect(-25, 60, 20, 60);
    ctx.fillRect(5, 60, 20, 60);

    // Face expression
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-8, -85, 2, 0, 2 * Math.PI);
    ctx.arc(8, -85, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Mouth based on expression
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    switch (expression) {
      case 'happy':
        ctx.arc(0, -75, 8, 0, Math.PI);
        break;
      case 'serious':
        ctx.moveTo(-8, -70);
        ctx.lineTo(8, -70);
        break;
      case 'concerned':
        ctx.arc(0, -65, 8, Math.PI, 2 * Math.PI);
        break;
      default:
        ctx.moveTo(-6, -70);
        ctx.lineTo(6, -70);
    }
    ctx.stroke();

    // Clothing indicator
    const clothingColor = clothing === 'safety' ? '#f59e0b' : clothing === 'business' ? '#1f2937' : '#6b7280';
    ctx.fillStyle = clothingColor;
    ctx.fillRect(-25, -50, 50, 30);

    // Animation indicator
    if (isPlaying && animation !== 'idle') {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(-35, -90, 70, 180);
      ctx.setLineDash([]);
    }

    ctx.restore();

    // Info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`Avatar: ${avatarId}`, 20, 30);
    ctx.fillText(`Pose: ${pose}`, 20, 50);
    ctx.fillText(`Expression: ${expression}`, 20, 70);
    ctx.fillText(`Animation: ${animation}`, 20, 90);
  };

  const handleAvatarUpdate = (updates: any) => {
    if (onAvatarChange) {
      onAvatarChange(updates);
    }
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const exportAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `avatar-${avatarId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center">
            <User className="w-5 h-5 mr-2" />
            Avatar Preview
          </h2>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetView}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportAvatar}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 3D Viewport */}
        <div className="flex-1 relative bg-gray-100">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-full object-contain"
          />
          
          {/* Viewport Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Card className="p-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant={showGrid ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={showBones ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowBones(!showBones)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </Card>
            
            <Card className="p-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <Slider
                    value={[rotation.y]}
                    onValueChange={([value]) => setRotation(prev => ({ ...prev, y: value }))}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <ZoomOut className="w-4 h-4" />
                  <Slider
                    value={[zoom]}
                    onValueChange={([value]) => setZoom(value)}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-20"
                  />
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm">Loading avatar...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="w-80 border-l border-gray-200 bg-white">
          <Tabs defaultValue="avatar" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
              <TabsTrigger value="pose">Pose</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="scene">Scene</TabsTrigger>
            </TabsList>

            <div className="p-4 h-full overflow-auto">
              <TabsContent value="avatar" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Avatar Preset</label>
                  <Select value={avatarId} onValueChange={(value) => handleAvatarUpdate({ avatarId: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarPresets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Expression</label>
                  <div className="grid grid-cols-2 gap-2">
                    {expressions.map((expr) => (
                      <Button
                        key={expr.id}
                        variant={expression === expr.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAvatarUpdate({ expression: expr.id })}
                        className="justify-start"
                      >
                        <span className="mr-2">{expr.emoji}</span>
                        {expr.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pose" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Pose</label>
                  <div className="space-y-2">
                    {poses.map((p) => (
                      <Button
                        key={p.id}
                        variant={pose === p.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAvatarUpdate({ pose: p.id })}
                        className="w-full justify-start"
                      >
                        <div className="text-left">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Animation</label>
                  <Select value={animation} onValueChange={(value) => handleAvatarUpdate({ animation: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animations.map((anim) => (
                        <SelectItem key={anim.id} value={anim.id}>
                          <div>
                            <div className="font-medium">{anim.name}</div>
                            <div className="text-xs text-gray-500">{anim.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Clothing</label>
                  <div className="space-y-2">
                    {clothingOptions.map((cloth) => (
                      <Button
                        key={cloth.id}
                        variant={clothing === cloth.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAvatarUpdate({ clothing: cloth.id })}
                        className="w-full justify-start"
                      >
                        <Shirt className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">{cloth.name}</div>
                          <div className="text-xs text-gray-500">{cloth.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Quality</label>
                  <Select value={quality} onValueChange={(value: 'low' | 'medium' | 'high') => setQuality(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Fast)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Slow)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="scene" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Background</label>
                  <div className="grid grid-cols-2 gap-2">
                    {backgrounds.map((bg) => (
                      <Button
                        key={bg.id}
                        variant={background === bg.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAvatarUpdate({ background: bg.id })}
                        className="h-12"
                      >
                        <div className="text-center">
                          <div
                            className="w-6 h-6 rounded mx-auto mb-1 border"
                            style={{ background: bg.color }}
                          />
                          <div className="text-xs">{bg.name}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Lighting</label>
                  <div className="space-y-2">
                    {lightingOptions.map((light) => {
                      const IconComponent = light.icon;
                      return (
                        <Button
                          key={light.id}
                          variant={lighting === light.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAvatarUpdate({ lighting: light.id })}
                          className="w-full justify-start"
                        >
                          <IconComponent className="w-4 h-4 mr-2" />
                          {light.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Avatar: {avatarId}</span>
          <span>Quality: {quality}</span>
          <span>Animation: {isPlaying ? 'Playing' : 'Paused'}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>Rotation: {Math.round(rotation.y)}°</span>
          {isLoading && <span>Loading...</span>}
        </div>
      </div>
    </div>
  );
}