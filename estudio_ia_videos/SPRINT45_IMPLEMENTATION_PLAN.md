# 🚀 SPRINT 45 - PLANO DE IMPLEMENTAÇÃO
**Data Início**: 05 de Outubro de 2025  
**Objetivo**: Implementar features P0 e P1 de alto impacto  
**Duração Estimada**: 3-4 semanas  

---

## 📋 FEATURES SELECIONADAS

### 🔴 P0 - Quick Wins (Alto Impacto + Rápida Implementação)
1. ✅ **Smart TTS Automático** (2-3 dias)
2. ✅ **API Pública REST + Webhooks** (3-4 dias)
3. ✅ **Biblioteca de Efeitos Expandida** (4-5 dias)

### 🟡 P1 - High Impact (Implementação Média)
4. ✅ **Keyframes Avançados com Interpolação** (2-3 dias)
5. ✅ **Collaboration UI Real** (2-3 dias)
6. ✅ **Templates Profissionais** (3-4 dias)
7. ✅ **Smart Guides e Magnetic Snapping** (2 dias)
8. ✅ **Shortcuts de Teclado Completos** (1-2 dias)
9. ✅ **Integração ElevenLabs Completa** (1 dia)
10. ✅ **Integração Stock Media (Unsplash)** (2 dias)
11. ✅ **Auto-Save Inteligente** (2 dias)
12. ✅ **Onboarding Interativo** (2 dias)

**Total**: ~24-32 dias (3-4 semanas)

---

## 📅 CRONOGRAMA DE EXECUÇÃO

### Fase 1 (Dias 1-3): Smart TTS Automático
**Objetivo**: Narração automática ao importar PPTX

**Implementações**:
1. `lib/pptx/auto-narration-service.ts` - Serviço de narração automática
2. `api/v1/pptx/auto-narrate/route.ts` - API endpoint
3. Atualizar `api/v1/pptx/upload-production/route.ts` - Integrar auto-narração
4. Atualizar `components/pptx/production-pptx-upload.tsx` - Toggle de auto-narração
5. Database: Adicionar campo `autoNarration` em Project

**Fluxo**:
```
Upload PPTX → Extração → [Auto-Narração?] → Gerar TTS → Adicionar à Timeline → Salvar
```

---

### Fase 2 (Dias 4-7): API Pública + Webhooks
**Objetivo**: API REST completa para integrações B2B

**Implementações**:
1. `lib/api/api-key-manager.ts` - Gerenciamento de API keys
2. `lib/api/webhook-manager.ts` - Sistema de webhooks
3. `middleware/api-auth.ts` - Middleware de autenticação
4. APIs públicas:
   - `api/public/v1/projects/route.ts` (POST, GET)
   - `api/public/v1/projects/[id]/route.ts` (GET, PUT, DELETE)
   - `api/public/v1/projects/[id]/render/route.ts` (POST)
   - `api/public/v1/webhooks/route.ts` (POST, GET, DELETE)
5. Database models: `ApiKey`, `Webhook`, `WebhookDelivery`
6. Documentação: `docs/API_PUBLIC_V1.md`

---

### Fase 3 (Dias 8-12): Biblioteca de Efeitos Expandida
**Objetivo**: 50+ efeitos profissionais

**Implementações**:
1. `lib/effects/effects-library.ts` - Catálogo completo de efeitos
2. `lib/effects/webgl-effects-renderer.ts` - Renderizador WebGL
3. `lib/effects/transitions.ts` - 15+ transições
4. `lib/effects/filters.ts` - 20+ filtros
5. `lib/effects/overlays.ts` - 10+ overlays
6. `lib/effects/distortions.ts` - 8+ distorções
7. `components/editor/effects-panel.tsx` - Painel de efeitos
8. Shaders WebGL para efeitos complexos

**Categorias**:
- Transições: fade, dissolve, wipe, zoom, cube-3d, door, flip, etc.
- Filtros: blur, sharpen, color-correction, vignette, lut-cinematic, etc.
- Overlays: light-leak, film-grain, bokeh, lens-flare, etc.
- Distorções: glitch, vhs, pixelate, mirror, kaleidoscope, etc.

---

### Fase 4 (Dias 13-15): Keyframes Avançados
**Objetivo**: Animações suaves com easing

**Implementações**:
1. `lib/animation/keyframe-interpolator.ts` - Interpolação avançada
2. `lib/animation/easing-functions.ts` - Funções de easing
3. `components/editor/keyframe-editor.tsx` - Editor de curvas
4. Atualizar `components/editor/timeline-editor-real.tsx` - Integrar keyframes
5. Tipos de easing: linear, ease-in, ease-out, ease-in-out, cubic-bezier, bounce, elastic, back

---

### Fase 5 (Dias 16-18): Collaboration UI Real
**Objetivo**: Cursors, presença, seleções compartilhadas

**Implementações**:
1. `components/editor/collaboration-overlay.tsx` - Overlay de colaboração
2. `hooks/use-collaboration.ts` - Hook de colaboração
3. Atualizar Socket.IO events:
   - `cursor:move` - Movimento de cursor
   - `user:joined` - Usuário entrou
   - `user:left` - Usuário saiu
   - `element:selected` - Elemento selecionado
4. `components/editor/user-avatar-list.tsx` - Lista de usuários online
5. CSS: Cores únicas por usuário, animações suaves

---

### Fase 6 (Dias 19-22): Templates Profissionais
**Objetivo**: 15-20 templates prontos

**Implementações**:
1. `lib/templates/template-library.ts` - Biblioteca de templates
2. Templates por categoria:
   - **Corporate** (5): Intro, Sobre Nós, Valores, Equipe, Testemunho
   - **Educational** (5): Aula, Tutorial, Explicativo, Quiz, Certificado
   - **Marketing** (5): Produto, Promo, Lançamento, Evento, Depoimento
   - **Social Media** (5): Story, Reel, Post, Anúncio, Meme
3. `components/templates/template-gallery.tsx` - Galeria de templates
4. `components/templates/template-customizer.tsx` - Customizador
5. Database: `Template` model
6. Assets: Thumbnails dos templates

---

### Fase 7 (Dias 23-24): Smart Guides + Snapping
**Objetivo**: Alinhamento magnético inteligente

**Implementações**:
1. `lib/canvas/smart-guides-service.ts` - Serviço de guias
2. `lib/canvas/magnetic-snapping.ts` - Snap magnético
3. Atualizar `components/editor/canvas-editor-v2.tsx` - Integrar guias
4. Visual: Linhas pontilhadas, indicadores de distância

---

### Fase 8 (Dias 25-26): Shortcuts Completos
**Objetivo**: 30+ atalhos de teclado

**Implementações**:
1. `lib/keyboard/shortcut-manager.ts` - Gerenciador de shortcuts
2. `lib/keyboard/default-shortcuts.ts` - Shortcuts padrão
3. `components/editor/shortcuts-cheatsheet.tsx` - Cheat sheet
4. `hooks/use-shortcuts.ts` - Hook de shortcuts
5. Customização: Salvar preferências em localStorage

---

### Fase 9 (Dia 27): Integração ElevenLabs
**Objetivo**: Voice cloning funcional

**Implementações**:
1. Atualizar `lib/tts/elevenlabs-service.ts` - Implementar métodos reais
2. `api/voice/clone/route.ts` - API de clonagem
3. Configurar variáveis de ambiente
4. Testes de integração

---

### Fase 10 (Dias 28-29): Stock Media (Unsplash)
**Objetivo**: Busca integrada de imagens

**Implementações**:
1. `lib/stock/unsplash-service.ts` - Serviço Unsplash
2. `components/editor/stock-media-panel.tsx` - Painel de busca
3. `api/stock/search/route.ts` - API de busca
4. Configurar API key

---

### Fase 11 (Dias 30-31): Auto-Save Inteligente
**Objetivo**: Salvar sem perder dados

**Implementações**:
1. `lib/editor/auto-save-service.ts` - Auto-save com merge
2. `lib/editor/conflict-resolver.ts` - Resolução de conflitos
3. Algoritmo 3-way merge
4. IndexedDB para cache local

---

### Fase 12 (Dias 32): Onboarding Interativo
**Objetivo**: Tour guiado para novos usuários

**Implementações**:
1. `components/onboarding/tour-guide.tsx` - Tour interativo
2. Usar `react-joyride`
3. Steps: Criar projeto → Adicionar elementos → Timeline → Export
4. Projeto demo pré-carregado

---

## 🗄️ DATABASE MIGRATIONS

```prisma
// prisma/schema.prisma (ADICIONAR)

model ApiKey {
  id          String   @id @default(uuid())
  key         String   @unique
  name        String
  userId      String
  scopes      String[]
  isActive    Boolean  @default(true)
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  @@index([userId])
  @@index([key])
}

model Webhook {
  id          String   @id @default(uuid())
  userId      String
  url         String
  events      String[]
  secret      String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  deliveries  WebhookDelivery[]
  @@index([userId])
}

model WebhookDelivery {
  id          String   @id @default(uuid())
  webhookId   String
  event       String
  payload     Json
  status      Int
  response    String?
  attempt     Int      @default(1)
  deliveredAt DateTime @default(now())
  
  webhook     Webhook  @relation(fields: [webhookId], references: [id])
  @@index([webhookId])
}

model Template {
  id          String   @id @default(uuid())
  name        String
  description String
  category    String
  thumbnail   String
  complexity  String   @default("basic")
  tags        String[]
  timeline    Json
  elements    Json
  placeholders Json
  isPublic    Boolean  @default(true)
  userId      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User?    @relation(fields: [userId], references: [id])
  @@index([category])
  @@index([userId])
}

// Atualizar Project model
model Project {
  // ... campos existentes ...
  autoNarration Boolean @default(false)
  templateId    String?
  template      Template? @relation(fields: [templateId], references: [id])
}
```

---

## 📦 DEPENDÊNCIAS A ADICIONAR

```bash
# Fase 2: API Pública
yarn add jsonwebtoken bcrypt uuid

# Fase 3: Efeitos WebGL
yarn add three @react-three/fiber @react-three/drei

# Fase 5: Collaboration
# (Socket.IO já instalado)

# Fase 9: ElevenLabs
# (axios já instalado)

# Fase 10: Unsplash
yarn add unsplash-js

# Fase 11: Auto-save
yarn add diff-match-patch idb

# Fase 12: Onboarding
yarn add react-joyride
```

---

## ✅ CRITÉRIOS DE SUCESSO

### Fase 1: Smart TTS
- [ ] Upload PPTX com toggle "Gerar narração automática"
- [ ] Extrai texto das notas ou slides
- [ ] Gera TTS com provider configurado
- [ ] Adiciona áudio na timeline automaticamente
- [ ] Tempo de importação < 2min para 10 slides

### Fase 2: API Pública
- [ ] Endpoint `POST /api/public/v1/projects` cria projeto
- [ ] Endpoint `GET /api/public/v1/projects/:id` retorna projeto
- [ ] Endpoint `POST /api/public/v1/projects/:id/render` inicia render
- [ ] Webhooks disparam em eventos (project.created, render.completed)
- [ ] Autenticação com API key funciona
- [ ] Documentação completa em `/docs/api`

### Fase 3: Efeitos
- [ ] 50+ efeitos disponíveis no painel
- [ ] Preview funciona ao hover
- [ ] Aplicar efeito atualiza elemento
- [ ] Efeitos com parâmetros (duração, intensidade)
- [ ] WebGL shaders funcionam

### Fase 4: Keyframes
- [ ] Editor de curvas visual
- [ ] 8+ tipos de easing disponíveis
- [ ] Interpolação suave entre keyframes
- [ ] Preview de animação funciona

### Fase 5: Collaboration
- [ ] Cursors de outros usuários visíveis
- [ ] Cores únicas por usuário
- [ ] Seleções compartilhadas destacadas
- [ ] Lista de usuários online atualiza em real-time

### Fase 6: Templates
- [ ] 15-20 templates disponíveis
- [ ] Galeria com preview
- [ ] Customizar placeholders
- [ ] Criar projeto a partir de template

### Fase 7: Smart Guides
- [ ] Guias aparecem ao arrastar elementos
- [ ] Snap magnético funciona
- [ ] Indicadores de distância visíveis
- [ ] Alinhamento automático (center, edges)

### Fase 8: Shortcuts
- [ ] 30+ shortcuts funcionam
- [ ] Cheat sheet acessível (? ou Ctrl+/)
- [ ] Customização de shortcuts
- [ ] Persistência em localStorage

### Fase 9: ElevenLabs
- [ ] Clone de voz funciona
- [ ] TTS com voz clonada
- [ ] Listagem de vozes disponíveis

### Fase 10: Unsplash
- [ ] Busca de imagens integrada
- [ ] Preview de imagens
- [ ] Adicionar imagem ao canvas
- [ ] Atribuição de autor visível

### Fase 11: Auto-Save
- [ ] Salva a cada 30s
- [ ] Detecta conflitos
- [ ] Merge automático quando possível
- [ ] Modal de conflito quando necessário

### Fase 12: Onboarding
- [ ] Tour inicia para novos usuários
- [ ] 5-7 steps claros
- [ ] Projeto demo funcional
- [ ] Pode pular ou fechar tour

---

## 🧪 ESTRATÉGIA DE TESTES

1. **Testes Unitários**: Serviços críticos (auto-save, keyframes, API auth)
2. **Testes de Integração**: APIs públicas, webhooks
3. **Testes E2E**: Fluxo completo (upload PPTX → editar → export)
4. **Testes de Performance**: Timeline com 100+ elementos
5. **Testes de Usabilidade**: Onboarding com 5 usuários novos

---

## 📊 MÉTRICAS DE ACOMPANHAMENTO

| Fase | Feature | Status | Dias | % Completo |
|------|---------|--------|------|------------|
| 1 | Smart TTS | 🔄 | 0/3 | 0% |
| 2 | API Pública | ⏳ | 0/4 | 0% |
| 3 | Efeitos | ⏳ | 0/5 | 0% |
| 4 | Keyframes | ⏳ | 0/3 | 0% |
| 5 | Collaboration | ⏳ | 0/3 | 0% |
| 6 | Templates | ⏳ | 0/4 | 0% |
| 7 | Smart Guides | ⏳ | 0/2 | 0% |
| 8 | Shortcuts | ⏳ | 0/2 | 0% |
| 9 | ElevenLabs | ⏳ | 0/1 | 0% |
| 10 | Unsplash | ⏳ | 0/2 | 0% |
| 11 | Auto-Save | ⏳ | 0/2 | 0% |
| 12 | Onboarding | ⏳ | 0/1 | 0% |

---

## 🚀 INÍCIO DA EXECUÇÃO

**Status**: ✅ PLANO APROVADO  
**Próximo Passo**: Fase 1 - Smart TTS Automático

---

**Criado por**: DeepAgent AI  
**Data**: 05 de Outubro de 2025
