
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  AlertCircle,
  FileText,
  Scale,
  Award,
  Download,
  RefreshCw,
  Eye,
  BookOpen
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ComplianceCheck {
  id: string
  category: string
  requirement: string
  status: 'compliant' | 'warning' | 'violation'
  description: string
  recommendation?: string
}

interface CompliancePrototypeProps {
  projectContent?: string
  onUpdate?: (report: any) => void
}

export function CompliancePrototype({ projectContent, onUpdate }: CompliancePrototypeProps) {
  const [activeNR, setActiveNR] = useState('NR-12')
  const [complianceScore, setComplianceScore] = useState(85)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const mockComplianceChecks: ComplianceCheck[] = [
    {
      id: 'nr12-1',
      category: 'Equipamentos de Proteção',
      requirement: 'Uso obrigatório de EPI',
      status: 'compliant',
      description: 'Vídeo demonstra corretamente o uso de equipamentos de proteção individual'
    },
    {
      id: 'nr12-2',
      category: 'Procedimentos de Segurança',
      requirement: 'Bloqueio e etiquetagem',
      status: 'compliant',
      description: 'Procedimentos LOTO são abordados adequadamente'
    },
    {
      id: 'nr12-3',
      category: 'Treinamento',
      requirement: 'Certificação obrigatória',
      status: 'warning',
      description: 'Mencionar necessidade de certificação específica',
      recommendation: 'Adicionar slide sobre certificação NR-12'
    },
    {
      id: 'nr12-4',
      category: 'Documentação',
      requirement: 'Manual de instruções',
      status: 'violation',
      description: 'Ausência de referência ao manual técnico',
      recommendation: 'Incluir seção sobre documentação obrigatória'
    },
    {
      id: 'nr12-5',
      category: 'Inspeção',
      requirement: 'Inspeções periódicas',
      status: 'compliant',
      description: 'Cronograma de inspeções está adequadamente apresentado'
    }
  ]

  const nrOptions = [
    { id: 'NR-12', name: 'NR-12 - Máquinas e Equipamentos', compliance: 85 },
    { id: 'NR-10', name: 'NR-10 - Instalações Elétricas', compliance: 92 },
    { id: 'NR-35', name: 'NR-35 - Trabalho em Altura', compliance: 78 },
    { id: 'NR-33', name: 'NR-33 - Espaços Confinados', compliance: 88 }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'violation':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      compliant: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      violation: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const analyzeCompliance = () => {
    setIsAnalyzing(true)
    toast.success('Iniciando análise de compliance...')
    
    setTimeout(() => {
      setIsAnalyzing(false)
      setComplianceScore(Math.floor(Math.random() * 20) + 80) // 80-100%
      toast.success('Análise de compliance concluída!')
      
      const report = {
        nr: activeNR,
        score: complianceScore,
        checks: mockComplianceChecks,
        timestamp: new Date().toISOString()
      }
      
      onUpdate?.(report)
    }, 3000)
  }

  const generateReport = () => {
    toast.success('Relatório de compliance gerado!')
    // Mock download
    const blob = new Blob(['Relatório de Compliance Mock'], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compliance-report-${activeNR.toLowerCase()}.pdf`
    a.click()
  }

  const compliantCount = mockComplianceChecks.filter(c => c.status === 'compliant').length
  const warningCount = mockComplianceChecks.filter(c => c.status === 'warning').length
  const violationCount = mockComplianceChecks.filter(c => c.status === 'violation').length

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-green-600" />
          Sistema de Compliance NR
        </h2>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Protótipo com Análise Automática
        </Badge>
      </div>

      {/* NR Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Norma Regulamentadora</span>
            <Button onClick={analyzeCompliance} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analisando...' : 'Analisar Compliance'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nrOptions.map((nr) => (
              <Card 
                key={nr.id}
                className={`cursor-pointer transition-all ${
                  activeNR === nr.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveNR(nr.id)}
              >
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-sm mb-2">{nr.id}</h4>
                  <p className="text-xs text-gray-600 mb-3">{nr.name}</p>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {nr.compliance}%
                  </div>
                  <Progress value={nr.compliance} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-green-600 mb-1">
              {complianceScore}%
            </div>
            <p className="text-sm text-gray-600">Compliance Geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-green-600 mb-1">
              {compliantCount}
            </div>
            <p className="text-sm text-gray-600">Itens Conformes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {warningCount}
            </div>
            <p className="text-sm text-gray-600">Avisos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-red-600 mb-1">
              {violationCount}
            </div>
            <p className="text-sm text-gray-600">Violações</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checks">Verificações</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="report">Relatório</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          {mockComplianceChecks.map((check) => (
            <Card key={check.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <h4 className="font-semibold">{check.requirement}</h4>
                      <p className="text-sm text-gray-600">{check.category}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(check.status)}>
                    {check.status === 'compliant' && 'Conforme'}
                    {check.status === 'warning' && 'Aviso'}
                    {check.status === 'violation' && 'Violação'}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{check.description}</p>
                
                {check.recommendation && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Recomendação:</span>
                    </div>
                    <p className="text-sm text-blue-700">{check.recommendation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                Recomendações de Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Certificação NR-12</h4>
                  <p className="text-sm text-yellow-700">
                    Adicione uma seção específica sobre a obrigatoriedade da certificação NR-12
                    para operadores de máquinas.
                  </p>
                  <Button size="sm" className="mt-3 bg-yellow-600 hover:bg-yellow-700">
                    Adicionar ao Editor
                  </Button>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Documentação Técnica</h4>
                  <p className="text-sm text-red-700">
                    Inclua referências aos manuais técnicos e documentação obrigatória
                    para máquinas e equipamentos.
                  </p>
                  <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700">
                    Adicionar ao Editor
                  </Button>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Pontos Fortes</h4>
                  <p className="text-sm text-green-700">
                    Excelente cobertura dos procedimentos de segurança e uso de EPIs.
                    Continue mantendo este nível de qualidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Relatório de Compliance
                </span>
                <Button onClick={generateReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Report Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Scale className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{activeNR}</div>
                    <div className="text-sm text-gray-600">Norma Analisada</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{complianceScore}%</div>
                    <div className="text-sm text-gray-600">Score Final</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{mockComplianceChecks.length}</div>
                    <div className="text-sm text-gray-600">Itens Verificados</div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold">Resumo Executivo</h3>
                  <p className="text-gray-700">
                    O conteúdo do vídeo de treinamento foi analisado em conformidade com a {activeNR} 
                    e apresenta um índice de compliance de {complianceScore}%. A análise identificou 
                    {compliantCount} itens conformes, {warningCount} avisos e {violationCount} violações 
                    que requerem atenção.
                  </p>

                  <h3 className="text-lg font-semibold mt-6">Principais Descobertas</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Excelente cobertura dos procedimentos de segurança básicos</li>
                    <li>Demonstração adequada do uso de EPIs</li>
                    <li>Necessidade de incluir informações sobre certificação</li>
                    <li>Ausência de referências à documentação técnica</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6">Certificação</h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Este relatório foi gerado automaticamente pelo sistema de IA de compliance 
                      do Estúdio IA de Vídeos em {new Date().toLocaleDateString('pt-BR')} e 
                      está em conformidade com as diretrizes técnicas vigentes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
