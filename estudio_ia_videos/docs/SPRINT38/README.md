
# 🤝 SPRINT 38: Collaboration Advanced + Review Workflow

## 📋 Visão Geral

O Sprint 38 adiciona funcionalidades avançadas de colaboração em tempo real e workflow completo de revisão/aprovação de projetos, elevando o Estúdio IA de Vídeos para um nível enterprise de colaboração em equipe.

## 🎯 Objetivos Alcançados

### 1. ✅ Sistema de Comentários Avançados
- **Threads por elemento**: Comentários organizados em threads hierárquicas
- **Menções @usuário**: Autocomplete inteligente ao digitar @
- **Emojis e reações**: Sistema de reações rápidas (👍, ❤️, etc.)
- **Filtros inteligentes**: Todos, Pendentes, Resolvidos
- **Busca em tempo real**: Buscar por conteúdo ou autor
- **Estatísticas**: Total, resolvidos, pendentes, top comentadores

### 2. ✅ Workflow de Revisão/Aprovação
- **Estados do projeto**: Draft → In Review → Approved → Published
- **Solicitação de revisão**: Selecionar múltiplos revisores
- **Aprovação/Rejeição**: Decisões com feedback detalhado
- **Solicitação de alterações**: Opção intermediária com sugestões
- **Bloqueio de edição**: Projetos em revisão/aprovados ficam bloqueados
- **Histórico completo**: Todas as aprovações registradas

### 3. ✅ Real-Time UX
- **Indicadores de presença**: Avatares de usuários ativos
- **Notificações instantâneas**: Novos comentários, menções, aprovações
- **Histórico de versões**: Save vs Approve diferenciados
- **Controle de conflitos**: Merge automático quando possível

### 4. ✅ Integração com Alertas
- **E-mail**: Notificações por e-mail via SendGrid
- **Push notifications**: Alertas em tempo real no browser
- **Webhooks**: Slack, MS Teams, Custom webhooks
- **Eventos suportados**:
  - Novo comentário
  - Menção em comentário
  - Solicitação de revisão
  - Aprovação/Rejeição
  - Publicação de projeto

### 5. ✅ Relatórios e Analytics
- **Métricas de comentários**: Total, resolvidos, pendentes
- **Top comentadores**: Ranking por atividade
- **Métricas de revisão**: Aprovações, rejeições, tempo médio
- **Top revisores**: Mais ativos e eficientes
- **Exportação**: PDF/CSV com dados completos

## 📁 Arquitetura

### Backend (lib/)
```
lib/
├── collab/
│   ├── comments-service.ts        # Serviço de comentários
│   └── review-workflow.ts         # Workflow de revisão
└── alerts/
    └── alert-manager.ts           # Sistema de alertas (Sprint 37)
```

### API Routes (api/)
```
api/
├── comments/
│   ├── route.ts                   # GET/POST comentários
│   ├── [commentId]/
│   │   ├── route.ts              # DELETE comentário
│   │   ├── resolve/route.ts      # POST resolver/reabrir
│   │   ├── reaction/route.ts     # POST adicionar reação
│   │   └── reply/route.ts        # POST responder
│   ├── stats/route.ts            # GET estatísticas
│   └── mention-search/route.ts   # GET buscar usuários
└── review/
    ├── route.ts                   # POST criar revisão
    ├── [reviewId]/
    │   ├── submit/route.ts        # POST submeter decisão
    │   ├── reopen/route.ts        # POST reabrir
    │   └── publish/route.ts       # POST publicar
    ├── status/route.ts            # GET status do projeto
    └── stats/route.ts             # GET estatísticas
```

### Frontend (components/)
```
components/
└── editor-collab/
    ├── CommentsPanel.tsx          # Painel de comentários
    └── ReviewPanel.tsx            # Painel de revisão
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Alert Manager (já configurado no Sprint 37)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SENDGRID_API_KEY=your_sendgrid_api_key
ALERT_FROM_EMAIL=alertas@treinx.com.br

# Slack Integration (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# MS Teams Integration (opcional)
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
```

### Banco de Dados

O modelo `ProjectComment` já existe no schema Prisma:
```prisma
model ProjectComment {
  id          String    @id @default(cuid())
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  content     String    @db.Text
  position    String?   // JSON: coordenadas x,y se aplicável
  
  parentId    String?
  parent      ProjectComment? @relation("CommentThread", fields: [parentId], references: [id])
  replies     ProjectComment[] @relation("CommentThread")
  
  isResolved  Boolean   @default(false)
  resolvedBy  String?
  resolvedAt  DateTime?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## 🚀 Como Usar

### 1. Comentários

#### Criar comentário
```typescript
import { commentsService } from '@/lib/collab/comments-service';

await commentsService.createComment({
  projectId: 'project-123',
  userId: 'user-456',
  content: 'Ótimo trabalho! @[Ana Silva](user-789)',
  mentions: ['user-789'],
});
```

#### Listar comentários
```typescript
const comments = await commentsService.listComments({
  projectId: 'project-123',
  isResolved: false, // apenas pendentes
});
```

#### Resolver comentário
```typescript
await commentsService.resolveComment({
  commentId: 'comment-123',
  userId: 'user-456',
  resolutionNote: 'Corrigido!',
});
```

### 2. Revisão/Aprovação

#### Solicitar revisão
```typescript
import { reviewWorkflowService } from '@/lib/collab/review-workflow';

await reviewWorkflowService.createReviewRequest({
  projectId: 'project-123',
  requesterId: 'user-456',
  reviewerIds: ['user-789', 'user-101'],
  message: 'Por favor, revisar antes de publicar',
  dueDate: new Date('2025-10-10'),
});
```

#### Aprovar projeto
```typescript
await reviewWorkflowService.submitReview({
  reviewRequestId: 'review-123',
  reviewerId: 'user-789',
  decision: 'APPROVED',
  feedback: 'Aprovado! Excelente trabalho.',
});
```

#### Publicar projeto
```typescript
await reviewWorkflowService.publishProject({
  projectId: 'project-123',
  userId: 'user-456',
});
```

### 3. Componentes UI

#### Painel de Comentários
```tsx
import CommentsPanel from '@/components/editor-collab/CommentsPanel';

<CommentsPanel
  projectId="project-123"
  userId="user-456"
  userName="João Silva"
  onClose={() => setShowComments(false)}
/>
```

#### Painel de Revisão
```tsx
import ReviewPanel from '@/components/editor-collab/ReviewPanel';

<ReviewPanel
  projectId="project-123"
  userId="user-456"
  userName="João Silva"
  onClose={() => setShowReview(false)}
/>
```

## 📊 Relatórios

### Estatísticas de Comentários
```typescript
const stats = await commentsService.getCommentStats('project-123');

// Resultado:
{
  total: 42,
  resolved: 35,
  pending: 7,
  byType: {
    general: 20,
    suggestion: 10,
    issue: 8,
    question: 4
  },
  topCommentors: [
    { userId: 'user-1', userName: 'Ana Silva', count: 12 },
    { userId: 'user-2', userName: 'Carlos Santos', count: 10 },
  ]
}
```

### Estatísticas de Revisão
```typescript
const stats = await reviewWorkflowService.getReviewStats({
  organizationId: 'org-123',
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-31'),
});

// Resultado:
{
  totalReviews: 42,
  approved: 28,
  rejected: 8,
  pending: 6,
  averageReviewTime: 4.5, // horas
  topReviewers: [
    { userId: 'user-1', userName: 'Ana Silva', count: 12 },
  ]
}
```

## 🔔 Notificações

### Eventos de Comentários
- **Novo comentário**: Notifica participantes do projeto
- **Menção @usuário**: Notifica usuário mencionado (high priority)
- **Resposta**: Notifica autor do comentário original
- **Reação**: Notifica autor do comentário
- **Resolução**: Notifica participantes da thread

### Eventos de Revisão
- **Solicitação de revisão**: Notifica revisores selecionados
- **Aprovação**: Notifica solicitante e equipe
- **Rejeição**: Notifica solicitante com feedback
- **Alterações solicitadas**: Notifica solicitante
- **Publicação**: Notifica toda a equipe

## 🎨 UX Guidelines

### Comentários
- **Threads visuais**: Indentação e linhas verticais
- **Avatares**: Identificação visual dos autores
- **Timestamps relativos**: "há 2 minutos", "há 1 hora"
- **Status visual**: Badges de resolvido/pendente
- **Autocomplete**: Dropdown ao digitar @
- **Atalhos**: Ctrl+Enter para enviar

### Revisão
- **Status prominente**: Badge grande com ícone
- **Timeline de aprovações**: Histórico cronológico
- **Bloqueio visual**: Indicador claro quando edição está bloqueada
- **Ações contextuais**: Botões adaptativos por estado
- **Feedback obrigatório**: Textarea para rejeições

## 🧪 Testes

### Testes E2E (Playwright)
```bash
# Comentários
npm run test:e2e -- comments

# Revisão
npm run test:e2e -- review

# Colaboração completa
npm run test:e2e -- collaboration
```

### Testes de Stress
```bash
# 50+ usuários simultâneos
npm run test:stress -- collaboration
```

### Cenários de Teste
1. **Thread de comentários**: Criar, responder, resolver
2. **Menções múltiplas**: @mencionar 3+ usuários
3. **Workflow completo**: Draft → Review → Approved → Published
4. **Rejeição e reabrir**: Rejeitar e solicitar nova revisão
5. **Conflitos**: Múltiplos revisores aprovando/rejeitando

## 📈 Métricas de Sucesso

### KPIs
- ✅ **Tempo médio de revisão**: < 6 horas
- ✅ **Taxa de aprovação**: > 80%
- ✅ **Comentários resolvidos**: > 90%
- ✅ **Tempo de resposta**: < 2 horas
- ✅ **Engajamento**: > 70% dos membros comentando

### Analytics
- Dashboard de atividade colaborativa
- Heatmap de comentários por projeto
- Timeline de aprovações
- Top colaboradores (comentários + revisões)

## 🔐 Segurança

### Permissões
- **Comentar**: Todos os membros do projeto
- **Resolver comentários**: Autor do comentário ou admin
- **Deletar comentários**: Apenas autor
- **Solicitar revisão**: Owner ou Editor do projeto
- **Aprovar/Rejeitar**: Apenas revisores designados
- **Publicar**: Owner ou Admin após aprovação

### Validações
- Verificar membership do projeto
- Validar estado do projeto antes de aprovar
- Prevenir auto-aprovação (se configurado)
- Ratelimiting em comentários (max 100/hora)

## 🚧 Próximos Passos (Sprint 39)

1. **Versionamento visual**: Diff visual entre versões
2. **Colaboração em tempo real no canvas**: Cursores e seleções
3. **Voice comments**: Comentários por áudio
4. **Integração com IA**: Sugestões automáticas de melhorias
5. **Templates de revisão**: Checklists personalizados
6. **SLA de revisão**: Alertas automáticos se ultrapassar prazo

## 📞 Suporte

- Documentação completa: `/docs/SPRINT38/`
- Issues: GitHub Issues
- Slack: #collab-support
- E-mail: support@treinx.com.br

---

**Sprint 38 - Collaboration Advanced + Review Workflow**  
Desenvolvido por: Equipe Estúdio IA de Vídeos  
Data: Outubro 2025
