# 📦 Inventário Funcional – Estúdio IA Vídeos (MVP Recovery)

> Preencher durante a Fase 0, em conjunto com `MVP_SCOPE_LOCK.md`.

## 1. Estrutura Atual x Ação Planejada

| Caminho | Tipo | Status atual | Ação decisão | Observações |
|---------|------|-------------|--------------|-------------|
| `app/upload` | Página | Skeleton MVP ativo | Manter? | Placeholder recriado; conectar Supabase |
| `app/editor` | Página | Skeleton MVP ativo |  | Recriar timeline e persistência |
| `app/dashboard` | Página | Skeleton MVP ativo |  | Ligar a `app/lib/projects` e `app/lib/render-jobs` |
| `app/analytics-*` | Página/APIs | Complexo, sem backend real | 🗂️ | Arquivar em `archive/legacy` |
| `app/avatares-*` | Página | Demonstração não priorizada | ✂️ | Remover do bundle (manter snapshot em archive) |
| `app/compliance/*` | Página | Mock/placeholder | 🗂️ | Arquivar para fase regulatória |
| `app/api/v1/pptx/*` | API | Processamento parcialmente real | ✅ | Consolidar rota `process` com parser real e testes |
| `app/api/render/*` | API | Rotas básicas criadas | ✅ | `POST /render/jobs` + `GET` list/status prontos; falta cancel/webhook |
| `app/api/analytics/*` | API | depende de `lib/analytics` | 🗂️ | Congelar até pós-MVP |
| `app/lib/projects` | Lib | Helpers MVP reestruturados | ✅ | CRUD básico + tipos compartilhados |
| `app/lib/slides` | Lib | Helpers MVP reestruturados | ✅ | Listar/criar/upsert slides com tipos |
| `app/lib/render-jobs` | Lib | Helpers MVP reestruturados | ✅ | Consulta/patch de jobs com Supabase |
| `lib/supabase/client` | Lib | Wrappers MVP recriados | ✅ | Browser/shared apontando para `app/lib/supabase` |
| `app/lib/queue/render-queue` | Lib | Skeleton BullMQ criado | ✅ | Helpers `getRenderQueue` + worker/events |
| `lib/cache/intelligent-cache` | Lib | placeholder | 🗂️ | Arquivar |
| `lib/auth` | Lib | incompleto | ✅ | Integrar NextAuth + Supabase, middleware protegido |
| `components/pptx/*` | UI | imports incorretos | ✅ | Revisar e reduzir componentes ao fluxo básico |
| `components/export/*` | UI | dependência de ícones faltantes | 🗂️ | Remover do MVP |
| `scripts/render-worker.ts` | Script | ausente | ✅ | Criar worker com Remotion/FFmpeg |
| `tests/*` | Suite | coberturas desatualizadas | ✅ | Atualizar unit + integração + Playwright essenciais |
| `remotion/` | Config | Config antiga | ✅ | Manter apenas composição MVP |
| `workers/*` | Scripts | Diversos mocks | ✂️ | Limpar mantendo somente render worker |

(Adicionar novas linhas conforme necessidade).

Legenda para "Ação decisão":
- ✅ Manter no MVP (reconstruir/hardening)
- 🗂️ Arquivar para fase futura
- ✂️ Remover definitivamente

---

## 2. Dependências Técnicas por Módulo

| Módulo | Dependências internas | Dependências externas | Notas |
|--------|-----------------------|------------------------|-------|
| Upload PPTX | `app/lib/pptx/*`, Zustand store | `jszip`, `fast-xml-parser` |  |
| Editor | `components/pptx/*`, Zustand, Supabase |  |  |
| Render | `app/lib/queue/*`, worker Node, Supabase | `bullmq`, `ioredis`, `remotion`, `ffmpeg` |  |
| Dashboard | `app/lib/projects`, `app/lib/render-jobs` | Supabase |  |
| Auth | `app/lib/auth`, NextAuth | `@next-auth/prisma-adapter`? |  |
| Analytics | `app/lib/analytics`, caching | (?) | Avaliar se entra no MVP |
| Upload PPTX | `app/lib/pptx/*`, Zustand store, Supabase storage | `jszip`, `fast-xml-parser` | Validar limite 200 MB |
| Editor | `components/pptx/*`, `app/lib/projects`, Zustand | Supabase | Persistir via RPC `slides_update_order` |
| Render | `app/lib/queue/render-queue`, worker Node, `app/lib/render-jobs` | `bullmq`, `ioredis`, `remotion`, `ffmpeg-static` | Worker rodando em PM2 ou serverless |
| Dashboard | `app/lib/projects`, `app/lib/render-jobs`, React Query | Supabase | KPIs básicos (jobs dia, falhas) |
| Auth | `app/lib/auth`, NextAuth routes | Supabase Auth | Email link + session JWT |
| Monitoring | `app/lib/logger`, Sentry SDK | Sentry | Alertas para falhas de render |

---

## 3. Recursos Humanos x Responsabilidades

| Área | Owner | Backups | Observações |
|------|-------|---------|-------------|
| Back-end APIs |  |  |  |
| Front-end UI |  |  |  |
| Infra/DevOps |  |  |  |
| QA/Testes |  |  |  |
| Documentação |  |  |  |
| Área | Owner | Backups | Observações |
|------|-------|---------|-------------|
| Back-end APIs | Bruno L. | Laura F. | Foco em Supabase clients, filas, rotas |
| Front-end UI | Ana S. | Felipe T. | Upload/editor/dashboard |
| Infra/DevOps | Diego R. | Marina P. | Supabase, Redis, deploy Vercel |
| QA/Testes | Carla M. | João V. | Suites Jest/Playwright, critérios sign-off |
| Documentação | Laura F. | Ana S. | Atualizar READMEs, runbooks |

---

## 4. Indicadores Iniciais

Para registrar antes da recuperação, permitindo comparar evolução.

| Métrica | Valor atual | Fonte |
|---------|-------------|-------|
| Build status | Falhando | `npm run build` | 
| Testes unitários |  |  |
| Testes integração |  |  |
| Testes E2E |  |  |
| Coverage (%) |  |  |
| Bugs críticos abertos |  |  |
| Métrica | Valor atual | Fonte |
|---------|-------------|-------|
| Build status | Falhando | `npm run build` (15/10) |
| Testes unitários | Não executam | `npm run test` quebra em imports |
| Testes integração | 5/19 passando | `npm run test:supabase` |
| Testes E2E | Não executado | Playwright desativado |
| Coverage (%) | n/d | Relatório desatualizado |
| Bugs críticos abertos | 8 | Lista QA 15/10 |

---

## 5. Próximas Ações

- Consolidar informações desta planilha com o `MVP_SCOPE_LOCK.md`.
- Atualizar `ROADMAP_RECUPERACAO_MVP.md` com decisões e owners confirmados.
- Submeter para aprovação (Tech Lead + Produto) antes de seguir para Fase 1 (Higiene & Setup).
