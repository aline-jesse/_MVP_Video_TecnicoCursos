'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useComplianceRealtime } from '@/hooks/use-compliance-realtime';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface ComplianceWidgetProps {
  projectId?: string;
  nrType?: string;
  content?: string;
  autoValidate?: boolean;
  compact?: boolean;
  className?: string;
}

export function ComplianceWidget({
  projectId,
  nrType = 'NR-12',
  content,
  autoValidate = true,
  compact = false,
  className = ''
}: ComplianceWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  const {
    isValidating,
    lastValidation,
    error,
    triggerValidation,
    triggerFullValidation,
    getComplianceStatus,
    getComplianceColor,
    getTopSuggestions,
    needsImmediateAttention,
    score,
    status,
    suggestions,
    missingTopics
  } = useComplianceRealtime({
    projectId,
    nrType,
    autoValidate
  });

  const getStatusIcon = () => {
    if (isValidating) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }

    const complianceStatus = getComplianceStatus();
    switch (complianceStatus) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fair':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (isValidating) return 'Validando...';
    if (error) return 'Erro na validação';
    
    const complianceStatus = getComplianceStatus();
    switch (complianceStatus) {
      case 'excellent': return 'Excelente conformidade';
      case 'good': return 'Boa conformidade';
      case 'fair': return 'Conformidade adequada';
      case 'poor': return 'Conformidade baixa';
      default: return 'Aguardando validação';
    }
  };

  const getBadgeVariant = () => {
    const complianceStatus = getComplianceStatus();
    switch (complianceStatus) {
      case 'excellent':
      case 'good':
        return 'default';
      case 'fair':
        return 'secondary';
      case 'poor':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (compact && !isExpanded) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">Compliance {nrType}</span>
              {lastValidation && (
                <Badge variant={getBadgeVariant()}>
                  {score}%
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          {needsImmediateAttention() && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">Atenção necessária</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-base">Compliance {nrType}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {lastValidation && (
              <Badge variant={getBadgeVariant()}>
                {score}%
              </Badge>
            )}
            {compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {getStatusText()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Progress */}
        {lastValidation && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Score de Conformidade</span>
              <span className={getComplianceColor()}>{score}%</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Immediate Attention Alert */}
        {needsImmediateAttention() && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                Atenção Imediata Necessária
              </span>
            </div>
            <p className="text-xs text-red-600">
              O score de compliance está abaixo do mínimo aceitável. 
              Revise o conteúdo urgentemente.
            </p>
          </div>
        )}

        {/* Top Suggestions */}
        {suggestions.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    Sugestões ({suggestions.length})
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {getTopSuggestions().map((suggestion, index) => (
                <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700">{suggestion}</p>
                </div>
              ))}
              {suggestions.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{suggestions.length - 3} sugestões adicionais
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Missing Topics */}
        {missingTopics.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">
                    Tópicos Ausentes ({missingTopics.length})
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {missingTopics.slice(0, 3).map((topic, index) => (
                <div key={index} className="p-2 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-xs text-orange-700">{topic}</p>
                </div>
              ))}
              {missingTopics.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{missingTopics.length - 3} tópicos adicionais
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => triggerValidation(content)}
            disabled={isValidating}
            className="flex-1"
          >
            {isValidating ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <TrendingUp className="h-3 w-3 mr-1" />
            )}
            Validação Rápida
          </Button>
          <Button
            size="sm"
            onClick={triggerFullValidation}
            disabled={isValidating || !projectId}
            className="flex-1"
          >
            <Shield className="h-3 w-3 mr-1" />
            Validação Completa
          </Button>
        </div>

        {/* Last Validation Info */}
        {lastValidation && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Última validação: {new Date().toLocaleTimeString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}