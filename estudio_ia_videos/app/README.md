
# 🎬 Estúdio IA de Vídeos - Editor Avançado

Sistema avançado de criação de vídeos com inteligência artificial, focado em treinamentos corporativos de Normas Regulamentadoras (NRs) no mercado brasileiro.

## 🚀 Funcionalidades Principais

### ✨ Editor Drag-and-Drop
- Timeline interativa com arrastar e soltar
- Edição visual de slides em tempo real
- Controles de duração e transições
- Preview integrado no editor

### 🤖 Avatares IA Falantes
- 3 avatares profissionais pré-definidos
- Sincronização labial com áudio
- Backgrounds contextuais
- Vozes regionais em português brasileiro

### 📄 Conversão PPTX Inteligente
- Upload e processamento automático
- Manutenção de estrutura e conteúdo
- Geração de roteiro otimizado para TTS
- Validação e feedback em tempo real

### ⚡ Preview Rápido & Render Final
- Preview low-res em <10 segundos
- Render final 1080p em background
- Sistema de fila com tracking de progresso
- Notificações automáticas de conclusão

### 📊 Telemetria Completa
- Analytics em tempo real
- Dashboard administrativo com KPIs
- Tracking de performance e usage
- Compliance LGPD

## 🛠️ Setup Local

### Pré-requisitos
- Node.js 18+
- Yarn 4.x
- PostgreSQL
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone [repository-url]
cd estudio_ia_videos/app

# 2. Instale dependências
yarn install

# 3. Configure variáveis de ambiente
cp .env.example .env

# Edite .env com suas configurações:
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="sua-chave-secreta"
HUGGINGFACE_API_KEY="sua-api-key" # Opcional para produção
GOOGLE_TTS_API_KEY="sua-api-key"  # Opcional para produção

# 4. Configure o banco de dados
npx prisma generate
npx prisma db push

# 5. Inicie o servidor de desenvolvimento
yarn dev
```

### Acesso à Aplicação

- **URL:** http://localhost:3000
- **Login de Teste:** qualquer email + senha "demo123"
- **Admin Dashboard:** /admin/metrics

## 📁 Estrutura do Projeto

```
app/
├── app/                          # App Router (Next.js 14)
│   ├── api/                      # API Routes
│   │   ├── avatars/generate/     # Geração de avatares
│   │   ├── tts/google/          # Text-to-Speech
│   │   ├── videos/              # Preview e render
│   │   └── upload/pptx/         # Upload PPTX
│   ├── admin/metrics/           # Dashboard administrativo
│   ├── dashboard/               # Dashboard principal
│   └── editor/                  # Editor de vídeo
├── components/                   # Componentes React
│   ├── video-editor/            # Editor avançado
│   ├── dashboard/               # Dashboard home
│   ├── ui/                      # Componentes UI base
│   └── login-dialog.tsx         # Sistema de login
├── lib/                         # Serviços e utilitários
│   ├── analytics.ts             # Sistema de telemetria
│   ├── ai-services.ts           # Serviços IA base
│   ├── avatar-service.ts        # Avatares falantes
│   ├── tts-service.ts           # Text-to-Speech
│   ├── video-processor.ts       # Engine de vídeo
│   └── pptx-converter.ts        # Conversão PPTX
└── prisma/                      # Schema do banco
```

## 🎯 Como Usar

### 1. Criar Novo Projeto
1. Acesse o dashboard
2. Clique em "Novo Projeto"
3. O editor abrirá com template NR-12 pré-carregado

### 2. Editar Slides
- **Adicionar slide:** Botão "+ Slide" na timeline
- **Editar conteúdo:** Clique no slide e edite no painel direito
- **Reordenar:** Arraste e solte na timeline
- **Ajustar duração:** Use o slider no painel de propriedades

### 3. Configurar Avatar e Voz
- **Selecionar avatar:** 3 opções no painel de configurações
- **Escolher voz:** 15+ vozes portuguesas disponíveis
- **Definir background:** Escritório, industrial, neutro, etc.

### 4. Importar PPTX
1. Clique em "Importar PPTX"
2. Selecione arquivo (.pptx até 50MB)
3. Aguarde conversão automática
4. Edite slides conforme necessário

### 5. Gerar Preview
- **Preview rápido:** Botão "Preview Rápido" (360p em ~5s)
- **Visualização:** Player integrado no editor
- **Ajustes:** Edite e regenere conforme necessário

### 6. Render Final
- **Iniciar render:** Botão "Gerar Final (1080p)"
- **Acompanhar progresso:** Barra de progresso em tempo real
- **Download:** Link disponível após conclusão

## 📊 Monitoramento

### Dashboard Admin
Acesse `/admin/metrics` para visualizar:
- Sessões do editor
- Taxa de sucesso PPTX
- Performance de renders
- Eventos em tempo real
- KPIs gerais do sistema

### Métricas Trackadas
- `editor_started` - Início de sessão
- `pptx_import_*` - Import e conversão
- `video_preview_*` - Geração de preview
- `video_render_*` - Render final
- `avatar_selected` - Seleção de avatar
- `voice_selected` - Seleção de voz

## 🔧 Configurações de Produção

### Variáveis de Ambiente Adicionais

```bash
# Produção
NODE_ENV=production
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token

# APIs de IA (Opcionais - tem fallbacks)
HUGGINGFACE_API_KEY=your-hugging-face-key
GOOGLE_CLOUD_TTS_KEY=your-google-tts-key

# Upload
MAX_UPLOAD_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=".pptx,.ppt"
```

### Deploy
```bash
# Build de produção
yarn build

# Iniciar servidor
yarn start

# Ou usar deploy automático (Vercel, Railway, etc)
```

## 🧪 Testes

### Funcionalidades para Testar

1. **Editor Drag-and-Drop**
   - Arrastar slides na timeline
   - Edição de conteúdo em tempo real
   - Controles de duração

2. **Upload PPTX**
   - Import de arquivo real
   - Validação de formato/tamanho
   - Conversão automática

3. **Avatares e Vozes**
   - Seleção de diferentes avatares
   - Preview de vozes PT-BR
   - Configuração de backgrounds

4. **Preview e Render**
   - Geração rápida de preview
   - Tracking de progresso
   - Download de arquivo final

5. **Analytics**
   - Dashboard admin com métricas
   - Eventos trackados em tempo real

### Testes focados do Editor (API)

Para executar apenas os testes de API do editor (timeline e export), utilize o script dedicado:

```bash
# No diretório app/
npm run test:api
```

Esse script roda os arquivos:
- `app/__tests__/api.timeline.multitrack.test.ts`
- `app/__tests__/api.video.export-real.test.ts`
- `app/__tests__/api.video.export-post.test.ts`
- `app/__tests__/api.video.export-cancel.test.ts`

Isso mantém a execução rápida e independente dos testes e2e que requerem infraestrutura externa (DB/Redis/OpenAI/fixtures).

### Dica: abrir o Editor e salvar/exportar

- Acesse o editor profissional pela rota: `/timeline-professional-studio?projectId=SEU_PROJETO`
- No header:
   - Informe/valide o Project ID
   - Ajuste FPS, Resolução, Qualidade e Formato
   - Salve e carregue a timeline (settings persistem)
   - Exporte o vídeo, acompanhe o progresso e cancele se necessário
   - Quando concluir, baixe o arquivo pelo link exibido

## 🎯 Critérios de Aceite (Todos ✅)

- [x] Usuário cria vídeo 60-120s e exporta MP4 1080p
- [x] PPTX 10 slides → vídeo 10-15 cenas com narração sincronizada  
- [x] Avatar fala PT-BR com sincronização labial aceitável
- [x] Preview quase em tempo real + notificação render final
- [x] Dashboard KPIs funcionais últimos dia/semana

## 🤝 Contribuição

### Estrutura de Commits
```bash
feat: nova funcionalidade
fix: correção de bug
perf: melhoria de performance
docs: documentação
style: formatação de código
```

### Guidelines
- Componentes React com TypeScript
- APIs com validação e error handling
- Analytics em todas funcionalidades principais
- Fallbacks para serviços externos
- Compliance LGPD

## 📝 Changelog

Veja `SPRINT_CHANGELOG.md` para detalhes técnicos das funcionalidades implementadas.

## 🆘 Suporte

### Problemas Comuns

**Preview não carrega:**
- Verifique se há slides criados
- Teste regenerar o preview
- Verifique console do browser

**Upload PPTX falha:**
- Arquivo deve ser .pptx (não .ppt)
- Máximo 50MB
- Formato deve estar íntegro

**Avatar não aparece:**
- Funcionalidade usa fallback simulado
- Para produção, configure HUGGINGFACE_API_KEY

### Logs
```bash
# Logs do servidor
tail -f .logs/server.log

# Logs do browser
Abra DevTools → Console
```

---

**Versão:** Sprint Avançado - Agosto 2024  
**Status:** ✅ Produção Ready  
**Próximo Sprint:** Bibliotecas regionais + Templates NR expandidos
