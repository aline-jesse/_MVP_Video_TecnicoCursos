
/**
 * ⚖️ NR COMPLIANCE AUTOMÁTICO - PÁGINA DEMO
 * Demonstração do sistema real de validação NR
 */

'use client'

import React, { useState, useRef } from 'react'
import AppShell from '@/components/layouts/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Clock,
  Award,
  Zap,
  AlertCircle,
  Target,
  BookOpen
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function NRComplianceAutomaticoPage() {
  const [projectData, setProjectData] = useState({
    title: 'Treinamento NR-12: Segurança em Máquinas',
    description: 'Curso abrangente sobre segurança em operação de máquinas e equipamentos industriais.',
    script: 'Este treinamento aborda os principais aspectos de segurança conforme NR-12. Dispositivos de proteção, procedimentos operacionais seguros, e manutenção preventiva são temas centrais para garantir a segurança dos trabalhadores.',
    duration: 900, // 15 minutos
    nrType: 'NR-12'
  })

  const [complianceResult, setComplianceResult] = useState<any>(null)
  const [certificate, setCertificate] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingCert, setIsGeneratingCert] = useState(false)

  const analyzeCompliance = async () => {
    setIsAnalyzing(true)
    setComplianceResult(null)
    
    try {
      const response = await fetch('/api/nr/validate-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'demo-nr-compliance',
          userId: 'demo-user',
          userName: 'Usuário Demo',
          ...projectData,
          slides: [
            { text: 'Introdução à segurança em máquinas', notes: 'Conceitos básicos NR-12' },
            { text: 'Dispositivos de proteção coletiva e individual', notes: 'EPIs e EPCs obrigatórios' },
            { text: 'Procedimentos de operação segura', notes: 'Check-lists e protocolos' },
            { text: 'Manutenção preventiva e corretiva', notes: 'Cronogramas e responsabilidades' }
          ]
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setComplianceResult(result.compliance)
        toast.success('Análise de compliance concluída!')
        
        if (result.certificate) {
          setCertificate(result.certificate)
        }
      } else {
        throw new Error(result.error || 'Erro na análise')
      }
      
    } catch (error) {
      console.error('❌ Erro na análise:', error)
      toast.error('Erro na análise de compliance')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateCertificate = async () => {
    if (!complianceResult?.certificateEligible) {
      toast.error('Projeto não elegível para certificação')
      return
    }

    setIsGeneratingCert(true)
    
    try {
      const response = await fetch('/api/nr/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complianceResult,
          projectData: {
            title: projectData.title,
            userName: 'Usuário Demo',
            userId: 'demo-user',
            completedAt: new Date()
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setCertificate(result.certificate)
        toast.success('Certificado gerado com sucesso!')
      } else {
        throw new Error(result.error || 'Erro na geração')
      }
      
    } catch (error) {
      console.error('❌ Erro na geração de certificado:', error)
      toast.error('Erro ao gerar certificado')
    } finally {
      setIsGeneratingCert(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <AppShell
      title="NR Compliance Automático"
      description="Sistema real de validação automática de Normas Regulamentadoras"
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              Sistema de Compliance NR Automático
              <Badge variant="outline" className="border-green-500 text-green-600">
                ⚡ REAL
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">6</div>
                <div className="text-sm text-muted-foreground">NRs Suportadas</div>
              </div>
              
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm text-muted-foreground">Critérios de Validação</div>
              </div>
              
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">Auto</div>
                <div className="text-sm text-muted-foreground">Certificação</div>
              </div>
              
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">&lt;5s</div>
                <div className="text-sm text-muted-foreground">Tempo Análise</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Formulário de Entrada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo de NR</label>
                <Select
                  value={projectData.nrType}
                  onValueChange={(value) => setProjectData({ ...projectData, nrType: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NR-1">NR-1: Disposições Gerais</SelectItem>
                    <SelectItem value="NR-6">NR-6: Equipamento de Proteção Individual</SelectItem>
                    <SelectItem value="NR-10">NR-10: Segurança em Eletricidade</SelectItem>
                    <SelectItem value="NR-12">NR-12: Máquinas e Equipamentos</SelectItem>
                    <SelectItem value="NR-33">NR-33: Espaços Confinados</SelectItem>
                    <SelectItem value="NR-35">NR-35: Trabalho em Altura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Título do Projeto</label>
                <Input
                  value={projectData.title}
                  onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                  placeholder="Ex: Treinamento NR-12..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  placeholder="Descreva o conteúdo do treinamento..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Script/Roteiro</label>
                <Textarea
                  value={projectData.script}
                  onChange={(e) => setProjectData({ ...projectData, script: e.target.value })}
                  placeholder="Cole aqui o roteiro do treinamento..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Duração (segundos)</label>
                <Input
                  type="number"
                  value={projectData.duration}
                  onChange={(e) => setProjectData({ ...projectData, duration: parseInt(e.target.value) || 0 })}
                  placeholder="900"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.ceil(projectData.duration / 60)} minutos
                </p>
              </div>

              <Button 
                onClick={analyzeCompliance}
                disabled={isAnalyzing || !projectData.title.trim()}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analisando Compliance...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Analisar Compliance NR
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados da Análise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Resultado da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!complianceResult ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Execute a análise para ver os resultados</p>
                  <p className="text-sm">Sistema validará automaticamente conformidade com NRs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Score Geral */}
                  <div className="text-center p-4 border rounded-lg">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(complianceResult.score)}`}>
                      {complianceResult.score}%
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {complianceResult.isCompliant ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={complianceResult.isCompliant ? 'text-green-600' : 'text-red-600'}>
                        {complianceResult.isCompliant ? 'CONFORME' : 'NÃO CONFORME'}
                      </span>
                    </div>
                    <Progress value={complianceResult.score} className="w-full" />
                    <p className="text-sm text-gray-600 mt-2">
                      Análise para {complianceResult.nrType}
                    </p>
                  </div>

                  {/* Violações */}
                  {complianceResult.violations && complianceResult.violations.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Problemas Encontrados ({complianceResult.violations.length})
                      </h3>
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {complianceResult.violations.map((violation: any, index: number) => (
                            <div 
                              key={index}
                              className={`p-3 border rounded text-sm ${getSeverityColor(violation.severity)}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium">{violation.description}</div>
                                  <div className="text-xs mt-1">{violation.suggestion}</div>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`ml-2 ${getSeverityColor(violation.severity)}`}
                                >
                                  {violation.severity}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Recomendações */}
                  {complianceResult.recommendations && complianceResult.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Recomendações
                      </h3>
                      <div className="space-y-1">
                        {complianceResult.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificação */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Certificação Automática
                        </h3>
                        <p className="text-sm text-gray-600">
                          {complianceResult.certificateEligible 
                            ? 'Projeto elegível para certificação' 
                            : 'Corrija os problemas para certificação'
                          }
                        </p>
                      </div>
                      
                      {complianceResult.certificateEligible && !certificate && (
                        <Button 
                          onClick={generateCertificate}
                          disabled={isGeneratingCert}
                          size="sm"
                        >
                          {isGeneratingCert ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Award className="h-3 w-3 mr-2" />
                              Gerar Certificado
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Certificado Gerado */}
        {certificate && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Award className="h-5 w-5" />
                Certificado de Compliance Gerado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-green-700">Número do Certificado:</span>
                    <div className="font-mono text-sm">{certificate.certificateNumber}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Projeto:</span>
                    <div className="text-sm">{certificate.projectTitle}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Score:</span>
                    <div className="text-sm font-bold text-green-600">{certificate.score}%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-green-700">Emitido em:</span>
                    <div className="text-sm">{new Date(certificate.issuedAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Válido até:</span>
                    <div className="text-sm">{new Date(certificate.validUntil).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700">Assinatura Digital:</span>
                    <div className="font-mono text-xs">{certificate.digitalSignature}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do Sistema */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-medium mb-1">Validação Automática</h3>
                <p className="text-gray-600">
                  Sistema analisa conteúdo automaticamente contra base oficial das NRs
                </p>
              </div>
              
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-medium mb-1">Certificação Digital</h3>
                <p className="text-gray-600">
                  Certificados gerados automaticamente com assinatura digital
                </p>
              </div>
              
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-medium mb-1">Resultado Instantâneo</h3>
                <p className="text-gray-600">
                  Análise completa em menos de 5 segundos com relatório detalhado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
