## 🤖 Instruções Rápidas para Agentes (20–50 linhas)
Foque somente no que já existe; não antecipe features não implementadas.

### Visão & Núcleo
Next.js 14 (app dir) gera vídeos técnicos a partir de PPTX → slides normalizados (Zustand) → composição Remotion → FFmpeg export. Infra pendente: DB + Storage + TTS (necessário configurar antes de render real persistente).

### Diretórios Chave
`estudio_ia_videos/app/` UI + estados; `scripts/` automação (setup, health, tests, deploy, logging); raiz: `database-schema.sql`, `database-rls-policies.sql`.

### Fluxo Essencial
Upload PPTX → parse (JSZip + fast-xml-parser) → estado slides (ordem via @dnd-kit) → (futuro) persistir em `slides` → iniciar render (criar linha em `render_jobs`) → Remotion monta cenas → FFmpeg une mídia → salvar em bucket `videos`.

### Banco & RLS
Tabelas principais: users, projects, slides, render_jobs, analytics_events, nr_courses, nr_modules. Isolamento por `auth.uid()`. Cursos/módulos são públicos (SELECT true). Função `is_admin()` habilita mutações em conteúdo público.

Provisionar: `node execute-supabase-sql.js` (usa `DIRECT_DATABASE_URL`). Arquivos idempotentes (ignore erros "already exists").

### Ambiente
Gerar `.env.local`: `create-env.ps1`. Mínimo: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY. Adicione TTS/Storage só se usado.

### Scripts (dentro de `scripts/`)
`npm run setup:supabase` cria schema+RLS+seed+buckets (~15s). `npm run validate:env`, `npm run health`, `npm run test:supabase` (19 testes), `npm run logs:test`, `npm run secrets:generate`, `npm run deploy`.

### App Dev / Testes UI
Dentro de `estudio_ia_videos/app`: `npm run dev`; build `npm run build`; lint `npm run lint`; testes (Jest) se definidos por config (ver dependências `@testing-library/*`).

### Convenções
SQL: CREATE IF NOT EXISTS. Estado editorial: Zustand + React Query (fetch remoto). UI: Radix + Tailwind + `cva`. Ordenação: persistir `order_index`. Logger em JSON lines (rotação 10MB) em `scripts/logger.ts`.

### Exemplos
Atualizar progresso: `UPDATE render_jobs SET status='processing', progress=40 WHERE id=...;`
Evento: `INSERT INTO analytics_events (user_id,event_type,event_data) VALUES (...,'slide_reordered','{"count":10}');`

### Checklist Render
DB + RLS aplicados; buckets (`videos`,`avatars`,`thumbnails`,`assets`); env ok; slides ordenados; (opcional) áudio TTS gerado antes de FFmpeg.

### Anti‑Padrões
Não criar tabela sem ajustar schema + RLS. Não usar service role no front. Evitar lógica de negócio espalhada em componentes (preferir helpers/stores). Não commitar segredos.

Se algo faltar: pedir "Detalhar <tópico>" e reportar discrepâncias (schema, políticas, buckets ausentes).

## 🔎 Atualização (Analytics Render)
- Lógica de métricas de render extraída para `app/lib/analytics/render-core.ts` (funções puras: computeBasicStats, computePerformanceMetrics, computeErrorAnalysis, computeQueueStats).
- Rota `api/analytics/render-stats` agora delega ao core → facilite manutenção e testes.
- Novos testes unitários em `app/__tests__/lib/analytics/render-core.test.ts` asseguram cálculo de tempos, filas e erros.
- Padrão: adicionar novas métricas primeiro no core (puro), depois consumir na rota.
 - Percentis (p50/p90/p95) incluídos em `computePerformanceMetrics`.
 - Cache in-memory (TTL 30s) na rota (`X-Cache: HIT|MISS`).
 - Limite de linhas (MAX_ROWS=5000) com flag `metadata.truncated` quando truncado.
 - Normalização semântica de erros (categorias: timeout, ffmpeg, network, storage, auth, resource, validation, unknown) via `normalizeErrorMessage` + `computeErrorCategories`.
 - Resposta da rota inclui `error_analysis` (bruto agrupado por prefixo) e `error_categories` (normalizado semântico) quando `includeErrors=true`.
 - Testes ampliados para cobrir categorias de erros e percentis.
 - Dívida técnica: remover `// @ts-nocheck` da rota após estabilizar tipagem com enums compartilhados de status.
