'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Trash2, 
  Star, 
  User, 
  Mic,
  Volume2,
  Settings,
  Filter,
  Search,
  Grid,
  List,
  Heart,
  Share2,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';

interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'child' | 'young' | 'adult' | 'senior';
  accent: string;
  language: string;
  quality: 'good' | 'excellent' | 'premium';
  rating: number;
  downloads: number;
  audioSample?: string;
  isCustom: boolean;
  isFavorite: boolean;
  tags: string[];
  creator?: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface VoiceLibraryProfessionalProps {
  onVoiceSelect?: (voice: VoiceProfile) => void;
  selectedVoiceId?: string;
  allowMultiSelect?: boolean;
  showUpload?: boolean;
  showFavorites?: boolean;
  className?: string;
}

const SAMPLE_VOICES: VoiceProfile[] = [
  {
    id: 'voice_1',
    name: 'Maria Silva',
    description: 'Voz feminina brasileira, ideal para narração educativa',
    gender: 'female',
    age: 'adult',
    accent: 'Brasileiro',
    language: 'pt-BR',
    quality: 'premium',
    rating: 4.8,
    downloads: 15420,
    isCustom: false,
    isFavorite: true,
    tags: ['educação', 'narração', 'profissional'],
    creator: {
      name: 'Studio IA',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: 'voice_2',
    name: 'Carlos Santos',
    description: 'Voz masculina grave, perfeita para documentários',
    gender: 'male',
    age: 'adult',
    accent: 'Brasileiro',
    language: 'pt-BR',
    quality: 'excellent',
    rating: 4.6,
    downloads: 8930,
    isCustom: false,
    isFavorite: false,
    tags: ['documentário', 'masculina', 'grave'],
    creator: {
      name: 'Voice Pro',
    },
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-09-15'),
  },
  {
    id: 'voice_3',
    name: 'Ana Costa',
    description: 'Voz jovem e dinâmica para conteúdo empresarial',
    gender: 'female',
    age: 'young',
    accent: 'Brasileiro',
    language: 'pt-BR',
    quality: 'premium',
    rating: 4.9,
    downloads: 23150,
    isCustom: true,
    isFavorite: true,
    tags: ['empresarial', 'jovem', 'dinâmica'],
    creator: {
      name: 'Você',
    },
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-10-10'),
  },
];

export const VoiceLibraryProfessional: React.FC<VoiceLibraryProfessionalProps> = ({
  onVoiceSelect,
  selectedVoiceId,
  allowMultiSelect = false,
  showUpload = true,
  showFavorites = true,
  className = ''
}) => {
  const [voices, setVoices] = useState<VoiceProfile[]>(SAMPLE_VOICES);
  const [selectedVoices, setSelectedVoices] = useState<string[]>(
    selectedVoiceId ? [selectedVoiceId] : []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterQuality, setFilterQuality] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Filter voices based on search and filters
  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = filterGender === 'all' || voice.gender === filterGender;
    const matchesQuality = filterQuality === 'all' || voice.quality === filterQuality;
    
    return matchesSearch && matchesGender && matchesQuality;
  });

  const handleVoiceSelect = useCallback((voice: VoiceProfile) => {
    if (allowMultiSelect) {
      setSelectedVoices(prev => {
        const isSelected = prev.includes(voice.id);
        const newSelection = isSelected 
          ? prev.filter(id => id !== voice.id)
          : [...prev, voice.id];
        return newSelection;
      });
    } else {
      setSelectedVoices([voice.id]);
      onVoiceSelect?.(voice);
    }
  }, [allowMultiSelect, onVoiceSelect]);

  const handlePlayVoice = useCallback((voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      // Stop audio playback
    } else {
      setPlayingVoice(voiceId);
      // Start audio playback
      toast.info('Reproduzindo amostra de voz...');
      
      // Simulate audio duration
      setTimeout(() => {
        setPlayingVoice(null);
      }, 3000);
    }
  }, [playingVoice]);

  const handleToggleFavorite = useCallback((voiceId: string) => {
    setVoices(prev => prev.map(voice => 
      voice.id === voiceId 
        ? { ...voice, isFavorite: !voice.isFavorite }
        : voice
    ));
    
    const voice = voices.find(v => v.id === voiceId);
    if (voice) {
      toast.success(
        voice.isFavorite 
          ? 'Removido dos favoritos' 
          : 'Adicionado aos favoritos'
      );
    }
  }, [voices]);

  const handleUploadVoice = useCallback(async () => {
    setIsUploading(true);
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newVoice: VoiceProfile = {
        id: `voice_${Date.now()}`,
        name: 'Nova Voz Personalizada',
        description: 'Voz personalizada criada pelo usuário',
        gender: 'neutral',
        age: 'adult',
        accent: 'Personalizado',
        language: 'pt-BR',
        quality: 'good',
        rating: 0,
        downloads: 0,
        isCustom: true,
        isFavorite: false,
        tags: ['personalizada'],
        creator: {
          name: 'Você',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setVoices(prev => [newVoice, ...prev]);
      toast.success('Voz personalizada adicionada com sucesso!');
      
    } catch (error) {
      toast.error('Erro ao fazer upload da voz');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const getQualityColor = (quality: VoiceProfile['quality']) => {
    switch (quality) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'excellent': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const VoiceCard: React.FC<{ voice: VoiceProfile }> = ({ voice }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedVoices.includes(voice.id) ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleVoiceSelect(voice)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm">{voice.name}</CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{voice.rating}</span>
                <span className="text-xs text-gray-400">({voice.downloads})</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(voice.id);
              }}
            >
              <Heart 
                className={`w-4 h-4 ${
                  voice.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`} 
              />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayVoice(voice.id);
              }}
            >
              {playingVoice === voice.id ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {voice.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          <Badge className={getQualityColor(voice.quality)}>
            {voice.quality}
          </Badge>
          <Badge variant="outline">
            {voice.gender}
          </Badge>
          <Badge variant="outline">
            {voice.language}
          </Badge>
          {voice.isCustom && (
            <Badge className="bg-orange-100 text-orange-800">
              Personalizada
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {voice.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        {playingVoice === voice.id && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-600">Reproduzindo...</span>
            </div>
            <Progress value={66} className="h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Biblioteca de Vozes</h2>
          <p className="text-gray-600">
            {filteredVoices.length} vozes disponíveis
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {showUpload && (
            <Button 
              onClick={handleUploadVoice}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Upload Voz'}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar vozes..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border rounded-md"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="all">Todos os gêneros</option>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
            <option value="neutral">Neutro</option>
          </select>
          
          <select
            className="px-3 py-2 border rounded-md"
            value={filterQuality}
            onChange={(e) => setFilterQuality(e.target.value)}
          >
            <option value="all">Todas qualidades</option>
            <option value="premium">Premium</option>
            <option value="excellent">Excelente</option>
            <option value="good">Boa</option>
          </select>
        </div>
      </div>

      {/* Voice Grid */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-2'
      }>
        {filteredVoices.map(voice => (
          <VoiceCard key={voice.id} voice={voice} />
        ))}
      </div>

      {/* Empty State */}
      {filteredVoices.length === 0 && (
        <div className="text-center py-12">
          <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma voz encontrada
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou termos de pesquisa
          </p>
        </div>
      )}

      {/* Selection Summary */}
      {selectedVoices.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedVoices.length} voz{selectedVoices.length > 1 ? 'es' : ''} selecionada{selectedVoices.length > 1 ? 's' : ''}
            </span>
            <Button size="sm">
              Usar Selecionadas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};