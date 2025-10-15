'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Mic, 
  Settings, 
  Sliders,
  Zap,
  Brain,
  Waves,
  Target
} from 'lucide-react';

interface VoiceParameters {
  pitch: number;
  speed: number;
  tone: number;
  emotion: number;
  emphasis: number;
  breathing: number;
  clarity: number;
  resonance: number;
}

interface VoiceControlsAdvancedProps {
  onParametersChange?: (parameters: VoiceParameters) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  isPlaying?: boolean;
  className?: string;
}

const DEFAULT_PARAMETERS: VoiceParameters = {
  pitch: 50,
  speed: 50,
  tone: 50,
  emotion: 50,
  emphasis: 50,
  breathing: 50,
  clarity: 80,
  resonance: 60,
};

export const VoiceControlsAdvanced: React.FC<VoiceControlsAdvancedProps> = ({
  onParametersChange,
  onPlay,
  onPause,
  onStop,
  isPlaying = false,
  className = ''
}) => {
  const [parameters, setParameters] = useState<VoiceParameters>(DEFAULT_PARAMETERS);
  const [isRecording, setIsRecording] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const presets = [
    {
      id: 'natural',
      name: 'Natural',
      description: 'Configuração balanceada e natural',
      icon: <Target className="w-4 h-4" />,
      params: { ...DEFAULT_PARAMETERS }
    },
    {
      id: 'dynamic',
      name: 'Dinâmico',
      description: 'Mais expressivo e energético',
      icon: <Zap className="w-4 h-4" />,
      params: { 
        ...DEFAULT_PARAMETERS, 
        emotion: 75, 
        emphasis: 70, 
        speed: 55 
      }
    },
    {
      id: 'professional',
      name: 'Profissional',
      description: 'Ideal para narração corporativa',
      icon: <Brain className="w-4 h-4" />,
      params: { 
        ...DEFAULT_PARAMETERS, 
        tone: 40, 
        clarity: 90, 
        speed: 45 
      }
    },
    {
      id: 'emotional',
      name: 'Emocional',
      description: 'Máxima expressividade emocional',
      icon: <Waves className="w-4 h-4" />,
      params: { 
        ...DEFAULT_PARAMETERS, 
        emotion: 85, 
        emphasis: 80, 
        breathing: 70 
      }
    }
  ];

  const handleParameterChange = useCallback((
    param: keyof VoiceParameters, 
    value: number[]
  ) => {
    const newParameters = {
      ...parameters,
      [param]: value[0]
    };
    
    setParameters(newParameters);
    setActivePreset(null); // Clear preset when manually adjusting
    onParametersChange?.(newParameters);
  }, [parameters, onParametersChange]);

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setParameters(preset.params);
      setActivePreset(presetId);
      onParametersChange?.(preset.params);
    }
  }, [onParametersChange]);

  const handleResetParameters = useCallback(() => {
    setParameters(DEFAULT_PARAMETERS);
    setActivePreset(null);
    onParametersChange?.(DEFAULT_PARAMETERS);
  }, [onParametersChange]);

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    // Start voice recording logic
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    // Stop voice recording logic
  }, []);

  const ParameterControl: React.FC<{
    label: string;
    value: number;
    onChange: (value: number[]) => void;
    icon?: React.ReactNode;
    min?: number;
    max?: number;
  }> = ({ label, value, onChange, icon, min = 0, max = 100 }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <label className="text-sm font-medium">{label}</label>
        </div>
        <span className="text-sm text-gray-600">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={onChange}
        min={min}
        max={max}
        step={1}
        className="w-full"
      />
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Playback Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Controles de Reprodução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button
              onClick={isPlaying ? onPause : onPlay}
              size="lg"
              className="flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={onStop}
              variant="outline"
              size="lg"
              disabled={!isPlaying}
            >
              <Square className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-blue-500 transition-all duration-300 ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                  style={{ width: isPlaying ? '45%' : '0%' }}
                />
              </div>
            </div>
            
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Presets de Voz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {presets.map(preset => (
              <Button
                key={preset.id}
                variant={activePreset === preset.id ? "default" : "outline"}
                className="h-auto p-3 justify-start"
                onClick={() => handlePresetSelect(preset.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {preset.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {preset.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Parameters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Parâmetros Avançados
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetParameters}
            >
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 border-b pb-2">
                Características Básicas
              </h4>
              
              <ParameterControl
                label="Tom (Pitch)"
                value={parameters.pitch}
                onChange={(value) => handleParameterChange('pitch', value)}
                icon={<Volume2 className="w-4 h-4 text-blue-500" />}
              />
              
              <ParameterControl
                label="Velocidade"
                value={parameters.speed}
                onChange={(value) => handleParameterChange('speed', value)}
                icon={<Zap className="w-4 h-4 text-green-500" />}
              />
              
              <ParameterControl
                label="Tonalidade"
                value={parameters.tone}
                onChange={(value) => handleParameterChange('tone', value)}
                icon={<Waves className="w-4 h-4 text-purple-500" />}
              />
              
              <ParameterControl
                label="Clareza"
                value={parameters.clarity}
                onChange={(value) => handleParameterChange('clarity', value)}
                icon={<Target className="w-4 h-4 text-orange-500" />}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 border-b pb-2">
                Expressividade
              </h4>
              
              <ParameterControl
                label="Emoção"
                value={parameters.emotion}
                onChange={(value) => handleParameterChange('emotion', value)}
                icon={<Brain className="w-4 h-4 text-red-500" />}
              />
              
              <ParameterControl
                label="Ênfase"
                value={parameters.emphasis}
                onChange={(value) => handleParameterChange('emphasis', value)}
                icon={<Sliders className="w-4 h-4 text-yellow-500" />}
              />
              
              <ParameterControl
                label="Respiração"
                value={parameters.breathing}
                onChange={(value) => handleParameterChange('breathing', value)}
                icon={<Waves className="w-4 h-4 text-cyan-500" />}
              />
              
              <ParameterControl
                label="Ressonância"
                value={parameters.resonance}
                onChange={(value) => handleParameterChange('resonance', value)}
                icon={<Volume2 className="w-4 h-4 text-indigo-500" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {(isPlaying || isRecording) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {isPlaying && (
                <Badge className="bg-green-100 text-green-800">
                  Reproduzindo
                </Badge>
              )}
              {isRecording && (
                <Badge className="bg-red-100 text-red-800 animate-pulse">
                  Gravando
                </Badge>
              )}
              {activePreset && (
                <Badge variant="outline">
                  Preset: {presets.find(p => p.id === activePreset)?.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};