# Visão geral da Timeline do Estúdio

Este documento explica por que existem “várias pastas de timeline” no projeto e quando usar cada uma. Em resumo, há separação por camadas (UI, serviços, pipeline de export) e por evolução de versões/arquiteturas do editor.

## Camadas e Pastas

- UI principal (moderna e modular)
  - `app/components/timeline/*`
    - Módulos do estúdio integrado (ex.: `IntegratedTimelineStudio`, `MultiTrackManager`, `AudioVideoSyncEngine`, `TimelineExportEngine`, etc.).
    - Objetivo: experiência completa de edição com múltiplas trilhas, sync, preview e export.

- UI alternativas/legadas (evolução do editor)
  - `app/components/editor/timeline-*.tsx`
    - Exemplos: `timeline-editor.tsx`, `timeline-editor-v2.tsx`, `timeline-editor-real.tsx`, `timeline-editor-pro.tsx`, `timeline-advanced.tsx`.
    - Objetivo: versões anteriores ou focadas em um aspecto específico da timeline (provas de conceito, variações de UX). Mantidas como referência/compatibilidade.

- Modelo e serviços de timeline
  - `app/lib/timeline/*`
    - `types/timeline.ts`: tipos (Timeline, Track, Clip, etc.).
    - `timeline-service.ts`: operações/serviços relacionados ao modelo.

- Pipeline de export (render)
  - `app/lib/ffmpeg/timeline-composer.ts`
    - Integra FFmpeg a partir do modelo de timeline (gera filter_complex, monta comando, controla progresso). Separado da UI.

- Páginas (rotas) de entrada do editor
  - `app/timeline-professional-studio/page.tsx`
    - Rota: `/timeline-professional-studio`
    - Renderiza `IntegratedTimelineStudio` (estúdio completo com módulos).
  - `app/timeline-multi-track/page.tsx`
    - Rota: `/timeline-multi-track`
    - Renderiza `TimelineMultiTrackEditor` (foco em edição de múltiplas trilhas, mais leve).

## Quando usar cada rota

- Use `/timeline-professional-studio` quando precisar do fluxo completo: múltiplas trilhas, sync A/V, módulos de keyframes, efeitos, export e recursos avançados.
- Use `/timeline-multi-track` para edições rápidas/organização de faixas, quando não precisa de todos os módulos do estúdio integrado.

## Por que há várias pastas “timeline”?

1. Separação de responsabilidades
   - UI (componentes de edição), serviços (modelo/negócio) e pipeline (FFmpeg/Remotion) ficam em lugares distintos para facilitar manutenção e testes.

2. Evolução do editor
   - As variantes em `components/editor/timeline-*.tsx` são iterações/POCs e versões anteriores do editor. Muitas partes foram consolidadas em `components/timeline/*`.

3. Especialização por módulos
   - O estúdio integrado é modular (sync, export, keyframes, efeitos). A organização reflete esses domínios.

## Recomendação atual

- Preferir as rotas:
  - `/timeline-professional-studio` (padrão para edição completa)
  - `/timeline-multi-track` (rápido e direto para trilhas)

- Considerar os arquivos em `components/editor/` como legados/alternativos. Úteis para consulta, mas a base moderna está em `components/timeline/`.

## Links rápidos

- Estúdio Integrado: `app/components/timeline/integrated-timeline-studio.tsx`
- Editor Multi‑track: `app/components/timeline/timeline-multi-track-editor.tsx`
- Serviço/Tipos: `app/lib/timeline/timeline-service.ts`, `app/lib/types/timeline.ts`
- Composer FFmpeg: `app/lib/ffmpeg/timeline-composer.ts`
- Rotas: `app/timeline-professional-studio/page.tsx`, `app/timeline-multi-track/page.tsx`
