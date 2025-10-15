/**
 * 🎬 Página do Editor de Timeline Profissional
 * 
 * Interface completa para edição de timeline com:
 * - Drag-and-drop avançado
 * - Múltiplas tracks de vídeo e áudio
 * - Propriedades editáveis em tempo real
 * - Controles de reprodução profissionais
 * - Keyframes e animações
 * - Sistema de snap e zoom
 * - Exportação de projetos
 */

import { Metadata } from 'next';
import { ProfessionalTimelineEditor } from '@/components/timeline/ProfessionalTimelineEditor';

export const metadata: Metadata = {
  title: '🎬 Timeline Profissional | Estúdio IA Videos',
  description: 'Editor de timeline profissional com recursos avançados de edição de vídeo, múltiplas tracks, drag-and-drop, keyframes e exportação.',
  keywords: ['timeline', 'editor', 'video', 'profissional', 'tracks', 'keyframes', 'drag-drop'],
};

export default function TimelineProPage() {
  return (
    <div className="min-h-screen">
      <ProfessionalTimelineEditor />
    </div>
  );
}