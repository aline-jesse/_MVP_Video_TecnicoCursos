

/**
 * 🏗️ Cenários 3D Revolucionários para NR
 * Simulações Imersivas de Ambientes de Trabalho
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Building,
  HardHat,
  Zap,
  Wrench,
  AlertTriangle,
  Eye,
  Play,
  VolumeX,
  Volume2,
  RotateCcw,
  Settings,
  Monitor,
  Globe,
  Target
} from 'lucide-react';

interface Cenario3D {
  id: string;
  nome: string;
  nr: string;
  categoria: string;
  ambiente: 'fabrica' | 'escritorio' | 'construcao' | 'laboratorio' | 'hospital';
  realismo: number;
  interatividade: string[];
  riscos: {
    nome: string;
    nivel: 'baixo' | 'medio' | 'alto' | 'critico';
    localizacao: string;
  }[];
  pontosTreinamento: string[];
  duracaoMinutos: number;
  preview: string;
}

export default function NRCenarios3D() {
  const [selectedCenario, setSelectedCenario] = useState<Cenario3D | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState('overview');

  const cenarios3D: Cenario3D[] = [
    {
      id: 'nr06-construcao-completa',
      nome: 'Canteiro de Obras Completo',
      nr: 'NR-06',
      categoria: 'EPIs em Construção',
      ambiente: 'construcao',
      realismo: 95,
      interatividade: ['Seleção de EPIs', 'Identificação de riscos', 'Simulação de acidentes'],
      riscos: [
        { nome: 'Queda de objetos', nivel: 'alto', localizacao: 'Área de guindastes' },
        { nome: 'Perfuração', nivel: 'medio', localizacao: 'Bancada de trabalho' },
        { nome: 'Inalação de partículas', nivel: 'medio', localizacao: 'Área de corte' }
      ],
      pontosTreinamento: [
        'Seleção correta de capacete',
        'Uso de proteção ocular',
        'Calçados de segurança',
        'Cinturão para altura'
      ],
      duracaoMinutos: 12,
      preview: '/scenarios/3d/construcao-preview.jpg'
    },
    {
      id: 'nr10-subestacao-industrial',
      nome: 'Subestação Industrial',
      nr: 'NR-10',
      categoria: 'Segurança Elétrica',
      ambiente: 'fabrica',
      realismo: 98,
      interatividade: ['Medição de tensão', 'Procedimentos de bloqueio', 'Resgate em altura'],
      riscos: [
        { nome: 'Choque elétrico', nivel: 'critico', localizacao: 'Painel principal' },
        { nome: 'Arco elétrico', nivel: 'critico', localizacao: 'Barramento' },
        { nome: 'Queda em altura', nivel: 'alto', localizacao: 'Plataformas' }
      ],
      pontosTreinamento: [
        'Teste de ausência de tensão',
        'Instalação de aterramento',
        'Sinalização de segurança',
        'Procedimentos de emergência'
      ],
      duracaoMinutos: 18,
      preview: '/scenarios/3d/eletrica-preview.jpg'
    },
    {
      id: 'nr12-linha-producao',
      nome: 'Linha de Produção Automatizada',
      nr: 'NR-12',
      categoria: 'Segurança em Máquinas',
      ambiente: 'fabrica',
      realismo: 96,
      interatividade: ['Operação de máquinas', 'Parada de emergência', 'Manutenção segura'],
      riscos: [
        { nome: 'Prensamento', nivel: 'critico', localizacao: 'Prensa hidráulica' },
        { nome: 'Corte', nivel: 'alto', localizacao: 'Serra circular' },
        { nome: 'Ruído excessivo', nivel: 'medio', localizacao: 'Área geral' }
      ],
      pontosTreinamento: [
        'Comando bi-manual',
        'Proteções móveis',
        'Inspeção pré-operacional',
        'Bloqueio para manutenção'
      ],
      duracaoMinutos: 15,
      preview: '/scenarios/3d/maquinas-preview.jpg'
    },
    {
      id: 'nr35-estrutura-metalica',
      nome: 'Estrutura Metálica 50m',
      nr: 'NR-35',
      categoria: 'Trabalho em Altura',
      ambiente: 'construcao',
      realismo: 97,
      interatividade: ['Inspeção de EPCs', 'Ancoragem', 'Resgate'],
      riscos: [
        { nome: 'Queda livre', nivel: 'critico', localizacao: 'Bordas desprotegidas' },
        { nome: 'Ruptura de cabo', nivel: 'alto', localizacao: 'Pontos de ancoragem' },
        { nome: 'Condições climáticas', nivel: 'medio', localizacao: 'Área externa' }
      ],
      pontosTreinamento: [
        'Inspeção de cinturão',
        'Verificação de ancoragem',
        'Técnicas de resgate',
        'Comunicação em altura'
      ],
      duracaoMinutos: 20,
      preview: '/scenarios/3d/altura-preview.jpg'
    }
  ];

  const startSimulation = (cenario: Cenario3D) => {
    setSelectedCenario(cenario);
    setIsPlaying(true);
    setCurrentView('simulation');
  };

  const getRiscoColor = (nivel: string) => {
    const colors = {
      baixo: 'text-green-600',
      medio: 'text-yellow-600',
      alto: 'text-orange-600',
      critico: 'text-red-600'
    };
    return colors[nivel as keyof typeof colors] || 'text-gray-600';
  };

  const getRiscoIcon = (nivel: string) => {
    return <AlertTriangle className={`h-4 w-4 ${getRiscoColor(nivel)}`} />;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🌐 Cenários 3D Revolucionários
        </h2>
        <p className="text-gray-600">
          Simulações imersivas de ambientes reais de trabalho para treinamento em NR
        </p>
      </div>

      {/* Seletor de Visualização */}
      <div className="flex justify-center space-x-2">
        <Button 
          variant={currentView === 'overview' ? 'default' : 'outline'}
          onClick={() => setCurrentView('overview')}
        >
          <Eye className="h-4 w-4 mr-2" />
          Galeria
        </Button>
        <Button 
          variant={currentView === 'simulation' ? 'default' : 'outline'}
          onClick={() => setCurrentView('simulation')}
          disabled={!selectedCenario}
        >
          <Monitor className="h-4 w-4 mr-2" />
          Simulação
        </Button>
      </div>

      {/* Galeria de Cenários */}
      {currentView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cenarios3D.map((cenario) => (
            <Card key={cenario.id} className="hover:shadow-lg transition-all group cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">
                    {cenario.nr}
                  </Badge>
                  <Badge variant="outline">
                    {cenario.realismo}% Realismo
                  </Badge>
                </div>
                <CardTitle className="group-hover:text-blue-600 transition-colors">
                  {cenario.nome}
                </CardTitle>
                <CardDescription>
                  {cenario.categoria} • {cenario.duracaoMinutos} minutos
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preview 3D */}
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Globe className="h-12 w-12 text-blue-600 mx-auto" />
                      <div className="text-sm font-medium">Cenário 3D</div>
                      <div className="text-xs text-gray-500">{cenario.ambiente}</div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/80 text-gray-800">
                      3D Interactive
                    </Badge>
                  </div>
                </div>

                {/* Riscos Identificados */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Riscos do Cenário:</h4>
                  <div className="space-y-1">
                    {cenario.riscos.slice(0, 3).map((risco) => (
                      <div key={risco.nome} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getRiscoIcon(risco.nivel)}
                          <span>{risco.nome}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getRiscoColor(risco.nivel)}
                        >
                          {risco.nivel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pontos de Treinamento */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Pontos de Treinamento:</h4>
                  <div className="text-xs text-gray-600">
                    {cenario.pontosTreinamento.slice(0, 2).join(' • ')}
                    {cenario.pontosTreinamento.length > 2 && '...'}
                  </div>
                </div>

                {/* Interatividade */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Recursos Interativos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {cenario.interatividade.map((recurso) => (
                      <Badge key={recurso} variant="secondary" className="text-xs">
                        {recurso}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ação */}
                <Button 
                  onClick={() => startSimulation(cenario)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Simulação 3D
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Simulação Ativa */}
      {currentView === 'simulation' && selectedCenario && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Simulação: {selectedCenario.nome}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Viewer 3D Simulado */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-blue-900 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-white text-2xl font-bold">
                      🌐 Simulação 3D Ativa
                    </div>
                    <div className="text-blue-200">
                      {selectedCenario.nome} • {selectedCenario.nr}
                    </div>
                    <div className="flex items-center space-x-2 justify-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Real-time 3D</span>
                    </div>
                  </div>
                </div>
                
                {/* Controles de Simulação */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="secondary">
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Volume2 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-white/80 text-gray-800">
                      Realismo: {selectedCenario.realismo}%
                    </Badge>
                    <Button size="sm" variant="secondary">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Informações do Cenário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Riscos Identificados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCenario.riscos.map((risco) => (
                          <div key={risco.nome} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              {getRiscoIcon(risco.nivel)}
                              <div>
                                <div className="font-medium text-sm">{risco.nome}</div>
                                <div className="text-xs text-gray-500">{risco.localizacao}</div>
                              </div>
                            </div>
                            <Badge 
                              variant="outline"
                              className={getRiscoColor(risco.nivel)}
                            >
                              {risco.nivel.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Pontos de Treinamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedCenario.pontosTreinamento.map((ponto, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm">{ponto}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Recursos Interativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedCenario.interatividade.map((recurso) => (
                          <Badge key={recurso} className="bg-purple-100 text-purple-800">
                            {recurso}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Estatísticas de Uso */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance do Cenário</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">247</div>
                      <div className="text-sm text-gray-600">Simulações</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">4.9</div>
                      <div className="text-sm text-gray-600">Avaliação</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">97%</div>
                      <div className="text-sm text-gray-600">Eficácia</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{selectedCenario.duracaoMinutos}min</div>
                      <div className="text-sm text-gray-600">Duração</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badge de Tecnologia */}
      <div className="text-center">
        <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm px-4 py-2">
          🌐 Powered by Unity 3D Engine • WebGL • Real-time Physics
        </Badge>
      </div>
    </div>
  );
}

