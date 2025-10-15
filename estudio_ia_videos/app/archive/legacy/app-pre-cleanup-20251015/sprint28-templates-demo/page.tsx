'use client'

/**
 * 📚 Sprint 28 Templates Demo Page
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, Shield } from 'lucide-react'
import { NR_TEMPLATES } from '@/lib/templates/nr-templates-complete'

export default function Sprint28TemplatesDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">Sprint 28</Badge>
            <h1 className="text-3xl font-bold">Templates NR Certificados</h1>
            <p className="text-muted-foreground">
              5 templates completos com certificação MTE e quiz de avaliação
            </p>
          </div>
          <Link href="/sprint28-demo">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {NR_TEMPLATES.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">{template.nr}</Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Certificado MTE
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Slides:</span>
                    <span className="font-semibold">{template.slides.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(template.duration / 60)}min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Validade:</span>
                    <span className="font-semibold">
                      {template.certification.validityMonths} meses
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Score Mínimo:</span>
                    <span className="font-semibold">
                      {template.certification.requiredScore}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Compliance:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      MTE Certified
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      v{template.compliance.version}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Rev. {template.compliance.revisionNumber}
                    </Badge>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.location.href = `/templates/${template.id}`}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Template Details */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades dos Templates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Conteúdo</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✅ Slides com conteúdo técnico certificado</li>
                <li>✅ Áudio narrado profissional</li>
                <li>✅ Imagens e diagramas explicativos</li>
                <li>✅ Exemplos práticos do dia-a-dia</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Avaliação</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✅ Quiz com questões objetivas</li>
                <li>✅ Explicação das respostas corretas</li>
                <li>✅ Score mínimo para aprovação</li>
                <li>✅ Certificado digital ao finalizar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
