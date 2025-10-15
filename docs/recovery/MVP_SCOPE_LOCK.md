# ✅ MVP Scope Lock – Estúdio IA Vídeos

## 1. Workshop de Alinhamento
- **Data/Horário:** 15/10/2025 – 15h00–17h00 BRT
- **Participantes:** Produto ▸ Ana S., Tech Lead ▸ Bruno L., QA ▸ Carla M., Infra ▸ Diego R.
- **Objetivos:**
  - Confirmar fluxo mínimo: upload → edição básica → render → monitoring.
  - Delimitar APIs, páginas e integrações externas que entram no MVP.
  - Registrar riscos imediatos e dependências críticas.

### 1.1 Agenda Proposta (120 min)
1. 0:00–0:15 ▸ Contexto & problemas atuais (build quebrado, dependências faltantes).
2. 0:15–0:45 ▸ Revisão do fluxo completo desejado (storyboard e dados persistidos).
3. 0:45–1:15 ▸ Priorização de features (MVP Now / Próxima release / Backlog).
4. 1:15–1:45 ▸ Infra & stakeholders externos (Supabase, Redis, Stripe, TTS, etc.).
5. 1:45–2:00 ▸ Aprovação de escopo + próximos passos.

---

## 2. Inventário de Funcionalidades
> Marcar "✅" (Manter no MVP), "🗂️" (Arquivar/Futuro) ou "✖️" (Remover definitivamente).

| Área | Item | Status | Observações |
|------|------|--------|-------------|
| Upload | `/app/upload`, API `/api/v1/pptx/process` | ✅ | Formulário MVP grava PPTX no Storage, extrai slides automaticamente e cria projeto; ownerId informado manualmente até autenticação |
| Editor | Timeline de slides, componentes canvas essenciais | ✅ | Edição básica reativada (título, duração, ordem) via `/editor?projectId=...`; preview visual fica para próximo ciclo |
| Render | Fila BullMQ, Worker `render-worker.ts` | ✅ | Saída MP4 720p, Remotion/FFmpeg via worker dedicado; disparo manual disponível no dashboard |
| Dashboard | `/dashboard` com status de projetos/renders | ✅ | Lista projetos, indica progresso, link para download; por enquanto requer `ownerId` em query até ligar autenticação |
| Analytics avançado | gráficos detalhados, rotas `/api/analytics/*` | 🗂️ | Adiar para pós-MVP; manter métricas básicas no dashboard |
| Compliance NR | páginas compliance/test | 🗂️ | Reintroduzir após MVP (fase regulatória) |
| Avatares 3D | `avatares-3d-demo` + componentes 3D | ✖️ | Fora do MVP; remover do bundle principal |
| Billing | Stripe checkout | 🗂️ | Mantido em backlog até definição de planos comerciais |
| Push/Notifications | Web Push, notificações render | 🗂️ | Fica em backlog; prioridade após estabilidade |
| Auth | NextAuth + Supabase | ✅ | Login com email/password + magic link; obrigatório |
| Outros | Export CSV analytics | 🗂️ | Somente após MVP |

Adicionar linhas adicionais conforme necessário.

---

## 3. Dependências Externas

| Serviço | Necessário no MVP? | Owner | Credenciais / Observações |
|---------|---------------------|-------|---------------------------|
| Supabase (DB + Storage) | Sim | Diego R. | Projeto `ofhzrdiadxigrvmrhaiz`, RLS ativa, buckets `videos`,`thumbnails` |
| Redis/BullMQ | Sim | Bruno L. | Instância Upstash (plan Standard), URL/Token via 1Password |
| FFmpeg/Remotion | Sim | Bruno L. | `ffmpeg-static`, render worker dedicado no server |
| Stripe | Não |  | Mover para backlog |
| Web Push | Não |  | Notificações ficam para pós-MVP |
| TTS (Google/Azure) | Não |  | MVP usa voz padrão pré-gerada |
| Outros (Sentry) | Sim | Carla M. | DSN compartilhada; monitoramento obrigatório |

---

## 4. Riscos & Dependências Cruzadas

| Risco | Probabilidade | Impacto | Mitigação acordada |
|-------|---------------|---------|--------------------|
| Falta de alinhamento escopo | Média | Alto | Scope lock registrado; mudanças via change request |
| Dependência Supabase instável | Baixa | Médio | Monitorar status; fallback manual para seeds |
| Render com alta carga | Média | Alto | Limitar jobs simultâneos, fila priorizada e alertas |
| Tech debt legado | Alta | Médio | Arquivar rotas fora do MVP no início da Fase 1 |

---

## 5. Decisão Go/No-Go
- **Go/No-Go:** GO (aprovado 15/10/2025)
- **Critérios atendidos:**
  - [ ] Escopo MVP revisado e assinado.
  - [ ] Lista "manter/arquivar" concluída.
  - [ ] Dependências externas confirmadas.
  - [ ] Responsáveis definidos por área crítica.

- **Observações finais / Ações imediatas:**
  - Migrar código fora do escopo para `archive/legacy` (responsável: Bruno L.).
  - Provisionar Redis Upstash e compartilhar credenciais (responsável: Diego R.).
  - Atualizar backlog inicial com tarefas P0/P1 definidas (responsável: Carla M.).

- **Assinaturas:**
  - Produto: Ana S. ___________________
  - Tech Lead: Bruno L. ___________________
  - Engenharia: Laura F. ___________________
  - QA: Carla M. ___________________

---

> Após preenchido e aprovado, anexar link deste documento ao ticket raiz do Roadmap de Recuperação e atualizar o status para "Fase 1 – Higiene & Setup".
