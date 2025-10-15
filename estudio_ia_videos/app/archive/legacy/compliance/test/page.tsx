'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplianceEditorIntegration } from '@/components/compliance/compliance-editor-integration';
import { ComplianceDashboard } from '@/components/compliance/compliance-dashboard';
import { ComplianceAlerts } from '@/components/compliance/compliance-alerts';
import { ComplianceWidget } from '@/components/compliance/compliance-widget';
import { toast } from 'sonner';
import { 
  TestTube, 
  FileText, 
  BarChart3, 
  Bell, 
  Widget,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const SAMPLE_CONTENT = {
  'NR-12': `# Treinamento NR-12 - Segurança em Máquinas e Equipamentos

## 1. Introdução
Este treinamento aborda os principais aspectos da NR-12, focando na segurança no trabalho com máquinas e equipamentos.

## 2. Objetivos
- Compreender os princípios de segurança em máquinas
- Identificar riscos e medidas preventivas
- Conhecer dispositivos de segurança

## 3. Conceitos Básicos
### 3.1 Definições
- Máquina: conjunto de partes móveis e fixas
- Equipamento: dispositivo usado no trabalho
- Zona perigosa: área de risco ao trabalhador

### 3.2 Princípios de Segurança
- Projeto seguro
- Medidas de proteção coletiva
- Medidas de proteção individual

## 4. Dispositivos de Segurança
### 4.1 Proteções Fixas
- Grades e anteparos
- Enclausuramentos

### 4.2 Proteções Móveis
- Portas com intertravamento
- Cortinas de luz

## 5. Procedimentos de Trabalho
- Análise de risco
- Permissão de trabalho
- Bloqueio e etiquetagem

## 6. Manutenção Segura
- Planejamento da manutenção
- Isolamento de energia
- Procedimentos de emergência`,

  'NR-11': `# Treinamento NR-11 - Transporte e Movimentação de Materiais

## 1. Introdução
A NR-11 estabelece os requisitos de segurança para transporte, movimentação, armazenagem e manuseio de materiais.

## 2. Equipamentos de Transporte
### 2.1 Empilhadeiras
- Inspeção diária obrigatória
- Operador qualificado e habilitado
- Limite de peso respeitado

### 2.2 Guindastes e Talhas
- Certificação obrigatória
- Inspeção periódica
- Operação por profissional habilitado

## 3. Armazenagem
- Estabilidade das pilhas
- Altura máxima permitida
- Corredores de circulação

## 4. Movimentação Manual
- Limite de peso: 23kg para homens
- Técnicas corretas de levantamento
- Uso de EPIs adequados`,

  'NR-33': `# Treinamento NR-33 - Espaços Confinados

## 1. Definição
Espaço confinado é qualquer área não projetada para ocupação humana contínua.

## 2. Características
- Meios limitados de entrada e saída
- Ventilação insuficiente
- Atmosfera perigosa

## 3. Riscos
### 3.1 Atmosféricos
- Deficiência de oxigênio
- Gases tóxicos
- Gases inflamáveis

### 3.2 Físicos
- Soterramento
- Afogamento
- Choque elétrico

## 4. Medidas de Controle
- Permissão de entrada e trabalho
- Monitoramento contínuo da atmosfera
- Ventilação forçada
- Equipamentos de comunicação`
};

export default function ComplianceTestPage() {
  const [selectedNR, setSelectedNR] = useState<string>('NR-12');
  const [testContent, setTestContent] = useState<string>(SAMPLE_CONTENT['NR-12']);
  const [activeTab, setActiveTab] = useState('editor');

  // Mock project ID for testing
  const mockProjectId = 'test-project-123';

  const handleContentChange = (content: string) => {
    setTestContent(content);
  };

  const handleSave = async (content: string, nrType: string) => {
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Conteúdo ${nrType} salvo com sucesso!`);
  };

  const loadSampleContent = (nrType: string) => {
    setSelectedNR(nrType);
    setTestContent(SAMPLE_CONTENT[nrType as keyof typeof SAMPLE_CONTENT] || '');
    toast.info(`Conteúdo de exemplo ${nrType} carregado`);
  };

  const runComplianceTest = async () => {
    toast.info('Executando teste de compliance...');
    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Teste de compliance concluído!');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <TestTube className="h-8 w-8 text-blue-600" />
          <span>Teste de Compliance NR Inteligente</span>
        </h1>
        <p className="text-muted-foreground">
          Ambiente de teste para validação do sistema de compliance em tempo real
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Ações Rápidas</span>
          </CardTitle>
          <CardDescription>
            Carregue conteúdo de exemplo ou execute testes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.keys(SAMPLE_CONTENT).map((nrType) => (
              <Button
                key={nrType}
                variant="outline"
                size="sm"
                onClick={() => loadSampleContent(nrType)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Carregar {nrType}
              </Button>
            ))}
            <Button
              variant="default"
              size="sm"
              onClick={runComplianceTest}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Executar Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor">
            <FileText className="h-4 w-4 mr-1" />
            Editor Integrado
          </TabsTrigger>
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-1" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-1" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="widget">
            <Widget className="h-4 w-4 mr-1" />
            Widget
          </TabsTrigger>
        </TabsList>

        {/* Editor Integration Tab */}
        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Editor de Conteúdo com Compliance em Tempo Real</CardTitle>
              <CardDescription>
                Teste a integração completa do sistema de compliance no fluxo de criação de conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceEditorIntegration
                projectId={mockProjectId}
                initialContent={testContent}
                initialNrType={selectedNR}
                onContentChange={handleContentChange}
                onSave={handleSave}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Compliance</CardTitle>
              <CardDescription>
                Visualize métricas e tendências de compliance em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Alertas</CardTitle>
              <CardDescription>
                Monitore alertas de compliance críticos e avisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceAlerts />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Widget Tab */}
        <TabsContent value="widget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Widget Expandido</CardTitle>
                <CardDescription>
                  Widget de compliance em modo completo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComplianceWidget
                  projectId={mockProjectId}
                  nrType={selectedNR}
                  content={testContent}
                  autoValidate={true}
                  compact={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Widget Compacto</CardTitle>
                <CardDescription>
                  Widget de compliance em modo compacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComplianceWidget
                  projectId={mockProjectId}
                  nrType={selectedNR}
                  content={testContent}
                  autoValidate={true}
                  compact={true}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Status Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Sistema Ativo</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Modo de Teste</span>
              </div>
            </div>
            <span>Projeto: {mockProjectId}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}