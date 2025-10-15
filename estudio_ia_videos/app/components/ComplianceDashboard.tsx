'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Download,
  TrendingUp,
  Clock,
  Users,
  FileText,
  Zap,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';
import { useComplianceAnalyzer, ComplianceAnalysisResult, ComplianceIssue } from '@/hooks/useComplianceAnalyzer';
import { Template } from '@/types/templates';

interface ComplianceDashboardProps {
  template?: Template;
  showRealTime?: boolean;
  className?: string;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  template,
  showRealTime = false,
  className = ''
}) => {
  const {
    isAnalyzing,
    analysisResult,
    error,
    analyzeTemplate,
    reanalyze,
    getIssuesByType,
    resolveIssue,
    autoFixIssue,
    applySuggestion,
    dismissSuggestion,
    startRealTimeAnalysis,
    stopRealTimeAnalysis,
    generateComplianceReport
  } = useComplianceAnalyzer();

  const [activeTab, setActiveTab] = useState('overview');
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [autoFixing, setAutoFixing] = useState<string | null>(null);
  const [applyingSuggestion, setApplyingSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (template && !analysisResult) {
      analyzeTemplate(template);
    }
  }, [template, analyzeTemplate, analysisResult]);

  useEffect(() => {
    if (showRealTime && template && isRealTimeActive) {
      startRealTimeAnalysis(template);
    } else {
      stopRealTimeAnalysis();
    }

    return () => stopRealTimeAnalysis();
  }, [showRealTime, template, isRealTimeActive, startRealTimeAnalysis, stopRealTimeAnalysis]);

  const handleAutoFix = async (issueId: string) => {
    setAutoFixing(issueId);
    try {
      await autoFixIssue(issueId);
    } finally {
      setAutoFixing(null);
    }
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    setApplyingSuggestion(suggestionId);
    try {
      await applySuggestion(suggestionId);
    } finally {
      setApplyingSuggestion(null);
    }
  };

  const handleDownloadReport = async () => {
    if (template) {
      const blob = await generateComplianceReport(template);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${template.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'non-compliant': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'non-compliant': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const criticalIssues = getIssuesByType('critical');
  const warningIssues = getIssuesByType('warning');
  const infoIssues = getIssuesByType('info');

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Erro na Análise de Compliance</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Compliance</h2>
          <p className="text-gray-600">
            Análise automática de conformidade NR em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showRealTime && (
            <Button
              variant={isRealTimeActive ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
            >
              <Activity className="h-4 w-4 mr-2" />
              {isRealTimeActive ? 'Parar Monitoramento' : 'Monitoramento em Tempo Real'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={reanalyze}
            disabled={isAnalyzing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Reanalizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            disabled={!analysisResult}
          >
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && !analysisResult && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Analisando compliance...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`border-2 ${getStatusColor(analysisResult.status)}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Score de Compliance</p>
                    <p className="text-3xl font-bold">{Math.round(analysisResult.score)}%</p>
                  </div>
                  {getStatusIcon(analysisResult.status)}
                </div>
                <Progress value={analysisResult.score} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Problemas Críticos</p>
                    <p className="text-3xl font-bold text-red-600">{criticalIssues.length}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avisos</p>
                    <p className="text-3xl font-bold text-yellow-600">{warningIssues.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Requisitos Atendidos</p>
                    <p className="text-3xl font-bold text-green-600">
                      {analysisResult.requirements.filter(r => r.status === 'met').length}/
                      {analysisResult.requirements.length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="issues">Problemas</TabsTrigger>
              <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
              <TabsTrigger value="requirements">Requisitos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Distribuição de Problemas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Críticos</span>
                        <Badge variant="destructive">{criticalIssues.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avisos</span>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {warningIssues.length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Informativos</span>
                        <Badge variant="outline">{infoIssues.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Última Análise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {analysisResult.lastAnalyzed.toLocaleString('pt-BR')}
                    </p>
                    {isRealTimeActive && (
                      <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                        <Activity className="h-3 w-3 mr-1" />
                        Monitoramento Ativo
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              {analysisResult.issues.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum problema encontrado!
                    </h3>
                    <p className="text-gray-600">
                      O template está em conformidade com todas as regras NR.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {analysisResult.issues.map((issue) => (
                    <Card key={issue.id} className={`border-l-4 ${
                      issue.type === 'critical' ? 'border-l-red-500' :
                      issue.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                issue.type === 'critical' ? 'destructive' :
                                issue.type === 'warning' ? 'secondary' : 'outline'
                              }>
                                {issue.type === 'critical' ? 'Crítico' :
                                 issue.type === 'warning' ? 'Aviso' : 'Info'}
                              </Badge>
                              <Badge variant="outline">{issue.category}</Badge>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
                            <p className="text-gray-600 text-sm">{issue.description}</p>
                            {issue.element && (
                              <p className="text-xs text-gray-500 mt-2">
                                Elemento: {issue.element}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {issue.autoFixAvailable && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAutoFix(issue.id)}
                                disabled={autoFixing === issue.id}
                              >
                                {autoFixing === issue.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Zap className="h-4 w-4" />
                                )}
                                Corrigir
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => resolveIssue(issue.id)}
                            >
                              Resolver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              {analysisResult.suggestions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma sugestão no momento
                    </h3>
                    <p className="text-gray-600">
                      O template está otimizado conforme as melhores práticas.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {analysisResult.suggestions.map((suggestion) => (
                    <Card key={suggestion.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{suggestion.type}</Badge>
                              <Badge variant={
                                suggestion.impact === 'high' ? 'destructive' :
                                suggestion.impact === 'medium' ? 'secondary' : 'outline'
                              }>
                                Impacto: {suggestion.impact === 'high' ? 'Alto' :
                                         suggestion.impact === 'medium' ? 'Médio' : 'Baixo'}
                              </Badge>
                              <Badge variant="outline">
                                Esforço: {suggestion.effort === 'high' ? 'Alto' :
                                         suggestion.effort === 'medium' ? 'Médio' : 'Baixo'}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
                            <p className="text-gray-600 text-sm">{suggestion.description}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {suggestion.autoApplyAvailable && (
                              <Button
                                size="sm"
                                onClick={() => handleApplySuggestion(suggestion.id)}
                                disabled={applyingSuggestion === suggestion.id}
                              >
                                {applyingSuggestion === suggestion.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Zap className="h-4 w-4" />
                                )}
                                Aplicar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissSuggestion(suggestion.id)}
                            >
                              Dispensar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              <div className="space-y-4">
                {analysisResult.requirements.map((reqStatus) => (
                  <Card key={reqStatus.requirement.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              reqStatus.status === 'met' ? 'default' :
                              reqStatus.status === 'partial' ? 'secondary' : 'destructive'
                            }>
                              {reqStatus.status === 'met' ? 'Atendido' :
                               reqStatus.status === 'partial' ? 'Parcial' : 'Não Atendido'}
                            </Badge>
                            {reqStatus.requirement.mandatory && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {reqStatus.requirement.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">
                            {reqStatus.requirement.description}
                          </p>
                          <Progress value={reqStatus.progress} className="mb-2" />
                          <p className="text-xs text-gray-500">
                            Progresso: {reqStatus.progress}%
                          </p>
                        </div>
                      </div>
                      {reqStatus.issues.length > 0 && (
                        <div className="border-t pt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Problemas:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {reqStatus.issues.map((issue, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};