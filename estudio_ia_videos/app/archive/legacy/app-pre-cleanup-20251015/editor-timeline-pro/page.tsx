

/**
 * 🎬 Editor Timeline Pro - Página Principal
 * Editor Profissional inspirado no Animaker
 */

'use client';

import React from 'react';
import TimelineEditorPro from '@/components/editor/timeline-editor-pro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Sparkles, Crown } from 'lucide-react';

export default function EditorTimelineProPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Editor Timeline Pro</h1>
            </div>
            <div className="flex space-x-2">
              <Badge className="bg-blue-100 text-blue-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Animaker Style
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                <Crown className="h-3 w-3 mr-1" />
                Professional
              </Badge>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Editor profissional com múltiplos tracks, efeitos avançados e preview real-time
          </div>
        </div>
      </div>

      {/* Editor */}
      <TimelineEditorPro 
        onSave={(data) => {
          console.log('Projeto salvo:', data);
        }}
        onExport={(format) => {
          console.log('Exportando para:', format);
        }}
      />
    </div>
  );
}

