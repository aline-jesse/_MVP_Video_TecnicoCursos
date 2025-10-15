

/**
 * 🔗 Editor Workflow - Página Principal
 * Sistema integrado de workflow: PPTX → Timeline → Export
 */

'use client';

import React from 'react';
import EditorWorkflow from '@/components/integration/editor-workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Crown } from 'lucide-react';

export default function EditorWorkflowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ArrowRight className="h-12 w-12" />
                  <div>
                    <h1 className="text-3xl font-bold">Editor Workflow</h1>
                    <p className="text-blue-100 mt-2">
                      Fluxo integrado: Upload PPTX → Análise IA → Timeline → Vídeo Final
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Fluxo Unificado
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Crown className="h-4 w-4 mr-1" />
                    Professional
                  </Badge>
                </div>
              </div>

              {/* Process Steps */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
                {[
                  { step: 1, name: 'Upload', desc: 'PPTX', icon: '📤' },
                  { step: 2, name: 'Análise', desc: 'IA', icon: '🧠' },
                  { step: 3, name: 'Timeline', desc: 'Setup', icon: '⏱️' },
                  { step: 4, name: 'Avatar', desc: 'Sync', icon: '👤' },
                  { step: 5, name: 'Áudio', desc: 'TTS', icon: '🎤' },
                  { step: 6, name: 'Render', desc: 'Final', icon: '🎬' }
                ].map((item, index) => (
                  <div key={item.step} className="text-center">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-blue-200">{item.desc}</div>
                    </div>
                    {index < 5 && (
                      <ArrowRight className="h-4 w-4 mx-auto mt-2 text-blue-200" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Component */}
        <EditorWorkflow />
      </div>
    </div>
  );
}

