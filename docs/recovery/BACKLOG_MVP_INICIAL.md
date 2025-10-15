# 🗂️ Backlog Inicial – MVP Estúdio IA Vídeos

> Utilizar após a conclusão do workshop (Fase 0). Atualizar status diariamente.

## 1. Níveis de Prioridade
- **P0 – Bloqueante:** impede build/test/deploy.
- **P1 – Essencial:** necessário para concluir o fluxo MVP.
- **P2 – Complementar:** melhoria que só entra após MVP estabilizado.

## 2. Tabela de Itens

| ID | Prioridade | Área | Descrição | Responsável | Status | Observações |
|----|------------|------|-----------|-------------|--------|-------------|
| MVP-001 | P0 | Infra | Provisionar Supabase (schema, RLS, seeds) e Redis Upstash | Diego R. | In Progress | Supabase ok, faltando Redis |
| MVP-002 | P0 | Build | Corrigir imports/exports quebrados em `app/*` | Ana S. | Todo | Iniciar após limpeza archive |
| MVP-003 | P0 | Backend | Reescrever `lib/supabase/client` e `lib/supabase/server` | Bruno L. | Todo | Definir tipos compartilhados |
| MVP-004 | P0 | Backend | Implementar `lib/queue/render-queue` (BullMQ) + worker | Bruno L. | In Progress | Skeleton de queue/worker criado; falta worker real |
| MVP-005 | P0 | Cleanup | Arquivar rotas fora do MVP em `archive/legacy` | Ana S. | In Progress | `app/app` e `app/lib` migrados para `archive/legacy/app-pre-cleanup-20251015` |
| MVP-006 | P1 | Front | Reconstruir fluxo upload → slides → salvar (Zustand + Supabase) | Ana S. | Todo | Requer `lib/supabase` novo |
| MVP-007 | P1 | Backend | API `/api/render/jobs` + `/api/render/status` com testes | Bruno L. | In Progress | Rotas `POST/GET` implementadas; falta testes |
| MVP-008 | P1 | Front | Página `/dashboard` mostrando jobs e status | Felipe T. | Todo | Usa React Query |
| MVP-009 | P1 | QA | Atualizar suíte `npm run test` + Playwright básico | Carla M. | Todo | Casos: upload, render, dashboard |
| MVP-010 | P1 | Observabilidade | Configurar Sentry + logging estruturado | Carla M. | Todo | DSN já disponível |
| MVP-011 | P2 | Front | Ajustar UI de analytics avançado (post-MVP) | - | Backlog | Fica para fase 2 |
| MVP-012 | P2 | Backend | Reintroduzir compliance NR com regras reais | - | Backlog | Pós-MVP |
| MVP-013 | P2 | Growth | Stripe checkout para planos premium | - | Backlog | Depende de estratégia comercial |

Adicionar/editar linhas conforme decisões. Usar os campos de Status: `Todo`, `In Progress`, `Review`, `Done`, `Blocked`.

---

## 3. Checklist de Atualização
- [x] Revisado em `data` 15/10/2025
- [x] Itens P0 possuem owner e prazo definidos
- [ ] Itens concluídos movidos para seção "Done"
- [x] Novas demandas P2 adicionadas ao backlog futuro

---

## 4. Itens Concluídos

| ID | Data conclusão | Responsável | Observações |
|----|-----------------|-------------|-------------|
|  |  |  |  |

---

## 5. Pendências Gerais / Notas
- 
