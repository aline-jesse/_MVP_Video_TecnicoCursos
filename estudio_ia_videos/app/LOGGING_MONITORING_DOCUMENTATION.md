# 📊 Sistema de Logging e Monitoring - Documentação Completa

## 🎯 Visão Geral

Sistema abrangente de **logging estruturado**, **error tracking** e **monitoramento de performance** para o Estúdio IA de Vídeos. Utiliza Winston para logs, Sentry para tracking de erros, e métricas customizadas armazenadas em PostgreSQL.

### 📈 Capacidades

- **Logging Estruturado**: Winston com múltiplos níveis e destinos
- **Error Tracking**: Sentry para captura e análise de erros
- **Métricas de Performance**: Coleta e análise de tempos de resposta
- **Health Monitoring**: Verificação contínua da saúde do sistema
- **Alertas Automáticos**: Notificações para situações críticas
- **Dashboard Visual**: Interface interativa com gráficos Recharts

---

## 📁 Estrutura de Arquivos

```
lib/
├── logger.ts                    # Sistema de logging (winston)
├── monitoring.ts                # Error tracking (Sentry) + health check
└── metrics.ts                   # Coleta e consulta de métricas

middleware/
└── api-logging.ts               # Middleware para logging de APIs

components/observability/
└── observability-dashboard.tsx  # Dashboard visual de métricas

app/
├── dashboard/observability/
│   └── page.tsx                 # Página do dashboard
└── api/metrics/
    └── route.ts                 # API de métricas

database/migrations/
└── create_metrics_table.sql     # Schema da tabela de métricas

sentry.client.config.ts          # Configuração Sentry (client-side)
sentry.server.config.ts          # Configuração Sentry (server-side)
sentry.edge.config.ts            # Configuração Sentry (edge runtime)
```

---

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```powershell
# Winston para logging
npm install winston winston-daily-rotate-file

# Sentry para error tracking
npm install @sentry/nextjs

# Recharts para gráficos
npm install recharts date-fns
```

### 2. Configurar Variáveis de Ambiente

```env
# .env.local

# Sentry DSN (obter em sentry.io)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Versão da aplicação (para release tracking)
NEXT_PUBLIC_APP_VERSION=1.0.0

# Ambiente
NODE_ENV=production
```

### 3. Executar Migração do Database

```powershell
# Conectar ao Supabase
npx supabase db push

# Ou executar SQL diretamente
psql -h <host> -U postgres -d <database> -f database/migrations/create_metrics_table.sql
```

### 4. Inicializar Sentry

```typescript
// app/layout.tsx ou _app.tsx
import monitoring from '@/lib/monitoring';

// Inicializar no início da aplicação
monitoring.init();
```

---

## 📝 Uso do Sistema de Logging

### Logging Básico

```typescript
import logger from '@/lib/logger';

// Log de informação
logger.info('Usuário fez login', { userId: '123', email: 'user@example.com' });

// Log de aviso
logger.warn('Tentativa de login falhou', { email: 'user@example.com', attempts: 3 });

// Log de erro
logger.error('Erro ao processar arquivo', error, { fileId: 'abc123' });

// Log de debug (apenas em desenvolvimento)
logger.debug('Valor da variável X', { x: someValue });
```

### Loggers Contextuais

#### Autenticação

```typescript
import { authLogger } from '@/lib/logger';

// Login bem-sucedido
authLogger.loginSuccess('user123', 'user@example.com');

// Login falhou
authLogger.loginFailed('user@example.com', 'Invalid password');

// Novo usuário
authLogger.signupSuccess('user456', 'newuser@example.com');

// Logout
authLogger.logout('user123');

// OAuth
authLogger.oauthSuccess('google', 'user789');
```

#### Upload de Arquivos

```typescript
import { uploadLogger } from '@/lib/logger';

// Upload iniciado
uploadLogger.uploadStarted('user123', 'presentation.pptx', 5242880); // 5 MB

// Upload concluído
uploadLogger.uploadCompleted('user123', 'presentation.pptx', 3500); // 3.5s

// Upload falhou
uploadLogger.uploadFailed('user123', 'presentation.pptx', 'Network timeout');

// Validação falhou
uploadLogger.validationError('user123', 'document.pdf', 'Invalid file type');
```

#### TTS

```typescript
import { ttsLogger } from '@/lib/logger';

// Geração iniciada
ttsLogger.generationStarted('user123', 'project456', 1, 'elevenlabs');

// Geração concluída
ttsLogger.generationCompleted('user123', 'project456', 1, 2500, 15.5); // 2.5s, 15.5s de áudio

// Geração falhou
ttsLogger.generationFailed('user123', 'project456', 1, 'elevenlabs', 'API rate limit');

// Fallback de provider
ttsLogger.providerFallback('project456', 'elevenlabs', 'azure');

// Cache hit
ttsLogger.cacheHit('project456', 1);

// Créditos deduzidos
ttsLogger.creditDeducted('user123', 100, 900); // Deduziu 100, restam 900
```

#### Renderização

```typescript
import { renderLogger } from '@/lib/logger';

// Job enfileirado
renderLogger.jobQueued('user123', 'project456', 'job789', {
  resolution: '1080p',
  quality: 'high',
  format: 'mp4',
});

// Renderização iniciada
renderLogger.jobStarted('job789', 'project456');

// Progresso
renderLogger.jobProgress('job789', 50, 5); // 50%, slide 5

// Renderização concluída
renderLogger.jobCompleted('job789', 'project456', 180000, 52428800); // 3 min, 50 MB

// Renderização falhou
renderLogger.jobFailed('job789', 'project456', 'FFmpeg encoding error');

// Renderização cancelada
renderLogger.jobCancelled('job789', 'user123');

// Worker iniciado/parado
renderLogger.workerStarted('worker-1');
renderLogger.workerStopped('worker-1');
```

#### API

```typescript
import { apiLogger } from '@/lib/logger';

// Requisição recebida
apiLogger.request('POST', '/api/upload', 'user123', '192.168.1.1', 'Mozilla/5.0...');

// Resposta enviada
apiLogger.response('POST', '/api/upload', 200, 1500); // 200 OK, 1.5s

// Erro na API
apiLogger.error('POST', '/api/upload', 500, 'Database connection failed', stack);

// Requisição lenta
apiLogger.slowRequest('GET', '/api/projects', 6500); // >5s
```

#### Database

```typescript
import { dbLogger } from '@/lib/logger';

// Query executada
dbLogger.queryExecuted('SELECT * FROM users WHERE id = $1', 50, 1); // 50ms, 1 row

// Erro na query
dbLogger.queryError('INSERT INTO projects...', 'Unique constraint violation');

// Query lenta
dbLogger.slowQuery('SELECT * FROM metrics...', 5500); // >5s

// Conexões
dbLogger.connectionOpened();
dbLogger.connectionClosed();
dbLogger.connectionError('Connection pool exhausted');
```

---

## 🔍 Uso do Sistema de Monitoring

### Captura de Exceções

```typescript
import monitoring from '@/lib/monitoring';

try {
  // Operação que pode falhar
  await processVideo(videoId);
} catch (error) {
  // Capturar exceção com contexto
  monitoring.captureException(error as Error, {
    level: 'error',
    tags: {
      operation: 'video_processing',
      video_id: videoId,
    },
    extra: {
      config: renderConfig,
      timestamp: new Date().toISOString(),
    },
    user: {
      id: userId,
      email: userEmail,
    },
  });

  // Re-lançar erro se necessário
  throw error;
}
```

### Captura de Mensagens

```typescript
import monitoring from '@/lib/monitoring';

// Mensagem de informação
monitoring.captureMessage('Processo iniciado com sucesso', 'info', {
  processId: '123',
  startTime: Date.now(),
});

// Mensagem de aviso
monitoring.captureMessage('Cache miss detectado', 'warning', {
  cacheKey: 'tts_slide_5',
  fallback: 'regeneration',
});

// Mensagem crítica
monitoring.captureMessage('Sistema de filas inativo', 'fatal', {
  queue: 'render_queue',
  workers: 0,
});
```

### Tracking de Usuários

```typescript
import monitoring from '@/lib/monitoring';

// Definir usuário ao fazer login
monitoring.setUser({
  id: 'user123',
  email: 'user@example.com',
  username: 'johndoe',
});

// Limpar usuário ao fazer logout
monitoring.clearUser();
```

### Tracking de Performance

```typescript
import monitoring from '@/lib/monitoring';

// Opção 1: Usar PerformanceTracker manualmente
const tracker = new monitoring.PerformanceTracker('video_rendering', {
  projectId: 'project456',
  resolution: '1080p',
});

try {
  // Checkpoint 1
  await loadAssets();
  tracker.checkpoint('assets_loaded');

  // Checkpoint 2
  await generateFrames();
  tracker.checkpoint('frames_generated');

  // Checkpoint 3
  await encodeVideo();
  tracker.checkpoint('video_encoded');

  // Finalizar tracking
  const totalDuration = tracker.finish({
    success: true,
    outputSize: 52428800,
  });

  console.log(`Renderização concluída em ${totalDuration}ms`);
} catch (error) {
  tracker.finish({ success: false, error: (error as Error).message });
  throw error;
}

// Opção 2: Usar wrapper de performance
import { withPerformanceTracking } from '@/middleware/api-logging';

const result = await withPerformanceTracking(
  'generate_tts',
  async () => {
    return await generateTTS(slideText, voiceId);
  },
  {
    slideNumber: 5,
    textLength: slideText.length,
  }
);
```

### Health Check

```typescript
import monitoring from '@/lib/monitoring';

// Verificar saúde do sistema
const health = await monitoring.healthCheck();

console.log(`Status: ${health.status}`); // healthy, degraded, unhealthy

if (health.status !== 'healthy') {
  console.error('Serviços com problema:');
  Object.entries(health.checks).forEach(([service, ok]) => {
    if (!ok) {
      console.error(`  - ${service}: FALHOU`);
    }
  });
}
```

### Monitoramento de Recursos

```typescript
import monitoring from '@/lib/monitoring';

// Monitorar uso de memória (client-side)
monitoring.monitorResources();

// Será logado automaticamente se uso > 95%
```

### Alertas Automáticos

```typescript
import monitoring from '@/lib/monitoring';

// Configurar alertas (executar no início da aplicação)
monitoring.setupCriticalAlerts();

// Alertas são disparados automaticamente quando:
// - Taxa de erro excede 10 erros em 5 minutos
// - Uso de memória > 95%
// - Requisição API > 5 segundos
// - Tempo de fila > 5 minutos
```

---

## 📊 Uso do Sistema de Métricas

### Registro de Métricas

```typescript
import metrics from '@/lib/metrics';

// Tempo de resposta de API
await metrics.api.responseTime('POST', '/api/upload', 1500, 200);

// Duração de upload
await metrics.upload.duration('user123', 5242880, 3500);

// Tempo de geração de TTS
await metrics.tts.generationTime('elevenlabs', 250, 2500);

// Duração de renderização
await metrics.render.duration('project456', 10, '1080p', 180000);

// Tempo de fila
await metrics.queue.waitTime('render_queue', 'job789', 120000);

// Taxa de erro
await metrics.error.rate('NetworkError', 'upload');

// Uso de memória
await metrics.memory.usage(524288000, 1073741824);

// Métrica customizada
await metrics.record({
  type: 'custom_metric',
  value: 42,
  unit: 'count',
  tags: { feature: 'test' },
  metadata: { extra: 'data' },
});
```

### Consulta de Métricas

```typescript
import metrics from '@/lib/metrics';

// Resumo de uma métrica (últimas 24h)
const summary = await metrics.getSummary('api_response_time', 24);

if (summary) {
  console.log(`Média: ${summary.avg}ms`);
  console.log(`Mediana (P50): ${summary.p50}ms`);
  console.log(`P95: ${summary.p95}ms`);
  console.log(`P99: ${summary.p99}ms`);
  console.log(`Min/Max: ${summary.min}ms / ${summary.max}ms`);
  console.log(`Amostras: ${summary.count}`);
}

// Série temporal (últimas 24h, buckets de 1h)
const timeSeries = await metrics.getTimeSeries('api_response_time', 24, 60);

timeSeries.forEach((point) => {
  console.log(`${point.timestamp}: ${point.avg}ms (${point.count} requests)`);
});
```

### Verificação de Limites

```typescript
import metrics from '@/lib/metrics';

// Verificar se métricas excedem limites (executar periodicamente)
await metrics.checkThresholds();

// Alertas são gerados automaticamente se:
// - Tempo de resposta da API (P95) > 5s
// - Duração de renderização (P95) > 10 minutos
// - Tempo de fila (P95) > 5 minutos
```

### Limpeza de Métricas Antigas

```typescript
import metrics from '@/lib/metrics';

// Remover métricas > 30 dias (executar via cron job)
await metrics.cleanup(30);
```

---

## 🛠️ Middleware de Logging para APIs

### Uso Automático

```typescript
// app/api/minha-rota/route.ts
import { withApiLogging } from '@/middleware/api-logging';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withApiLogging(async (request: NextRequest) => {
  // Seu código aqui
  const body = await request.json();

  // Processar request

  return NextResponse.json({ success: true });
});

// Logs automáticos:
// - API Request: POST /api/minha-rota
// - API Response: POST /api/minha-rota - 200 (150ms)
// - Métrica de tempo de resposta registrada
// - Headers X-Response-Time e X-Request-ID adicionados
```

### Rate Limiting com Logging

```typescript
import { checkRateLimit } from '@/middleware/api-logging';

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);

  // Verificar rate limit
  const rateLimit = checkRateLimit(userId, '/api/upload');

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        remaining: rateLimit.remaining,
        resetIn: 60, // segundos
      },
      { status: 429 }
    );
  }

  // Processar request normalmente
  // ...
}

// Log automático se rate limit excedido:
// WARN: Rate limit excedido: user123 em /api/upload
```

---

## 📈 Dashboard de Observabilidade

### Acessar Dashboard

```
http://localhost:3000/dashboard/observability
```

### Recursos do Dashboard

#### 1. Seletor de Período
- **1 hora**: Monitoramento em tempo quase real
- **6 horas**: Últimas horas de atividade
- **12 horas**: Meio dia
- **24 horas** (padrão): Último dia completo
- **48 horas**: Últimos 2 dias
- **7 dias**: Última semana

#### 2. Status de Saúde
- **Healthy** (Verde): Todos os serviços funcionando
- **Degraded** (Amarelo): 1 serviço com problema
- **Unhealthy** (Vermelho): 2+ serviços com problema

Checks incluídos:
- Database (PostgreSQL/Supabase)
- Storage (Supabase Storage)
- Queue (BullMQ)
- TTS (Providers externos)

#### 3. Cards de Métricas

Para cada tipo de métrica:
- **Média**: Tempo médio de execução
- **P50 (Mediana)**: 50% das operações abaixo deste valor
- **P95**: 95% das operações abaixo deste valor (SLA comum)
- **P99**: 99% das operações abaixo deste valor
- **Min/Max**: Valores extremos
- **Amostras**: Quantidade de medições

Métricas disponíveis:
- Tempo de Resposta da API
- Duração de Upload
- Tempo de Geração TTS
- Duração de Renderização
- Tempo de Fila
- Taxa de Erro

#### 4. Gráfico de Série Temporal

- Linha temporal mostrando evolução da métrica
- Eixo X: Tempo (formato HH:mm)
- Eixo Y: Valor da métrica (formatado)
- Hover para detalhes

#### 5. Gráfico de Volume

- Barras mostrando quantidade de operações
- Útil para identificar picos de uso
- Correlacionar com lentidão do sistema

#### 6. Atualização Automática

- Dashboard atualiza a cada 1 minuto
- Indicador visual de última atualização
- Período selecionado persistido

---

## 🔧 Configuração Avançada

### Customizar Níveis de Log

```typescript
// lib/logger.ts

const levels = {
  error: 0,    // Erros críticos
  warn: 1,     // Avisos
  info: 2,     // Informações gerais
  http: 3,     // Requisições HTTP
  debug: 4,    // Debug (apenas dev)
  verbose: 5,  // Logs verbosos (adicional)
};
```

### Customizar Transports

```typescript
// lib/logger.ts

// Adicionar transport para serviço externo (ex: Loggly, Papertrail)
import { Loggly } from 'winston-loggly-bulk';

const logglyTransport = new Loggly({
  token: process.env.LOGGLY_TOKEN,
  subdomain: process.env.LOGGLY_SUBDOMAIN,
  tags: ['nodejs', 'estudio-ia'],
  json: true,
});

logger.add(logglyTransport);
```

### Customizar Filtros de Sentry

```typescript
// sentry.client.config.ts

Sentry.init({
  // ...configurações existentes

  beforeSend(event, hint) {
    const error = hint.originalException as Error;

    // Ignorar erros de terceiros
    if (error?.stack?.includes('google-analytics')) {
      return null;
    }

    // Reduzir nível de gravidade para erros conhecidos
    if (error?.message?.includes('AbortError')) {
      event.level = 'info';
    }

    // Adicionar contexto customizado
    event.extra = {
      ...event.extra,
      custom_field: 'custom_value',
    };

    return event;
  },
});
```

### Customizar Limites de Alertas

```typescript
// lib/metrics.ts

export async function checkMetricThresholds() {
  const checks = [
    {
      type: 'api_response_time' as MetricType,
      threshold: 3000, // Reduzir para 3s
      message: 'API com tempo de resposta elevado',
    },
    {
      type: 'upload_duration' as MetricType,
      threshold: 30000, // Adicionar check de upload
      message: 'Upload muito lento',
    },
    // Adicionar mais checks conforme necessário
  ];

  // ...resto do código
}
```

---

## 🧪 Testes

### Executar Testes

```powershell
# Todos os testes
npm test

# Apenas testes de logging/monitoring
npm test -- logging-monitoring.test.ts

# Com cobertura
npm test -- --coverage
```

### Casos de Teste Incluídos

#### Logging (10 testes)
- ✅ Log de info funciona
- ✅ Log de warn funciona
- ✅ Log de erro funciona
- ✅ Debug apenas em desenvolvimento
- ✅ Loggers contextuais registram corretamente
- ✅ Metadados são incluídos nos logs
- ✅ Formatação de logs está correta
- ✅ Rotação de arquivos funciona
- ✅ Logs são persistidos em disco
- ✅ Performance não é impactada

#### Monitoring (12 testes)
- ✅ Captura de exceção funciona
- ✅ Contexto é incluído em exceções
- ✅ Captura de mensagem funciona
- ✅ Definir usuário funciona
- ✅ Limpar usuário funciona
- ✅ PerformanceTracker mede duração
- ✅ Checkpoints funcionam
- ✅ Healthcheck retorna status
- ✅ Healthcheck inclui todos os checks
- ✅ Alertas são disparados corretamente
- ✅ Monitoramento de recursos funciona
- ✅ Integração com Sentry funciona

#### Métricas (8 testes)
- ✅ Registro de métrica funciona
- ✅ Consulta de resumo funciona
- ✅ Série temporal é gerada
- ✅ Percentis são calculados corretamente
- ✅ Limites são verificados
- ✅ Alertas são gerados
- ✅ Limpeza de métricas antigas funciona
- ✅ Performance de registro é aceitável

---

## 📊 Métricas e KPIs

### Métricas de Performance

| Métrica | Target (P95) | Ação se Exceder |
|---------|--------------|-----------------|
| Tempo de Resposta da API | <2s | Otimizar queries/código |
| Duração de Upload | <30s (por 100 MB) | Melhorar infraestrutura |
| Tempo de Geração TTS | <10s (por slide) | Verificar providers |
| Duração de Renderização | <5min (10 slides, 1080p) | Otimizar FFmpeg |
| Tempo de Fila | <2min | Adicionar workers |

### Métricas de Saúde

| Check | Healthy Threshold | Unhealthy Threshold |
|-------|-------------------|---------------------|
| Database Latency | <50ms | >500ms |
| Storage Availability | 100% | <95% |
| Queue Workers | ≥1 | 0 |
| TTS Provider Uptime | >99% | <90% |

### Métricas de Negócio

| Métrica | Descrição | Fonte |
|---------|-----------|-------|
| Taxa de Conversão | Uploads → Vídeos Completos | Analytics |
| Tempo Médio de Projeto | Upload → Download | Métricas |
| Taxa de Erro | Erros / Total de Operações | Error Rate |
| Satisfação do Usuário | Feedback / Avaliações | Manual |

---

## 🚨 Troubleshooting

### Problema: Logs Não Aparecem

**Solução:**
```powershell
# Verificar se pasta logs/ existe
mkdir logs

# Verificar permissões
icacls logs /grant Everyone:F

# Verificar configuração do Winston
# Logs em produção vão para arquivos, não console
```

### Problema: Sentry Não Captura Erros

**Solução:**
```typescript
// Verificar se DSN está configurado
console.log('Sentry DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN);

// Forçar envio de erro de teste
monitoring.captureMessage('Teste de Sentry', 'info');

// Verificar em sentry.io se erro apareceu
```

### Problema: Métricas Não São Salvas

**Solução:**
```sql
-- Verificar se tabela existe
SELECT * FROM metrics LIMIT 1;

-- Verificar permissões RLS
SELECT * FROM pg_policies WHERE tablename = 'metrics';

-- Verificar logs de erro
SELECT * FROM logs WHERE context = 'database';
```

### Problema: Dashboard Vazio

**Solução:**
```typescript
// Verificar API de métricas
fetch('/api/metrics?action=health')
  .then(res => res.json())
  .then(console.log);

// Gerar métricas de teste
await metrics.api.responseTime('GET', '/test', 100, 200);
await metrics.upload.duration('test', 1000000, 2000);
```

---

## 🎯 Melhores Práticas

### 1. Logging
- ✅ Use níveis apropriados (error > warn > info > debug)
- ✅ Inclua contexto relevante (userId, projectId, etc)
- ✅ Evite logs excessivos em loops
- ✅ Sanitize dados sensíveis (passwords, tokens)
- ✅ Use loggers contextuais para organização

### 2. Monitoring
- ✅ Capture exceções com contexto completo
- ✅ Defina usuário no início da sessão
- ✅ Use PerformanceTracker para operações longas
- ✅ Configure filtros para reduzir ruído
- ✅ Monitore healthcheck continuamente

### 3. Métricas
- ✅ Registre métricas para operações importantes
- ✅ Use tags para facilitar agregação
- ✅ Consulte métricas periodicamente
- ✅ Configure alertas para limites críticos
- ✅ Limpe métricas antigas regularmente

### 4. Dashboard
- ✅ Monitore diariamente para identificar tendências
- ✅ Investigue picos e anomalias
- ✅ Correlacione métricas com eventos (deploys, etc)
- ✅ Compartilhe dashboards com equipe
- ✅ Configure alertas baseados em percentis (P95, P99)

---

## 🚀 Integração CI/CD

### Verificar Logs em CI

```yaml
# .github/workflows/test.yml
- name: Check logs for errors
  run: |
    if grep -q "ERROR" logs/application-*.log; then
      echo "Errors found in logs"
      exit 1
    fi
```

### Enviar Release para Sentry

```yaml
# .github/workflows/deploy.yml
- name: Create Sentry release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: estudio-ia
  run: |
    npx sentry-cli releases new ${{ github.sha }}
    npx sentry-cli releases set-commits ${{ github.sha }} --auto
    npx sentry-cli releases finalize ${{ github.sha }}
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Winston Docs](https://github.com/winstonjs/winston)
- [Sentry Docs](https://docs.sentry.io/)
- [Recharts Docs](https://recharts.org/)

### Tutoriais
- [Logging Best Practices](https://betterstack.com/community/guides/logging/nodejs-logging-best-practices/)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

## 🏆 Conclusão

✅ **Sistema Completo** de logging, monitoring e métricas  
✅ **Winston** para logs estruturados com rotação automática  
✅ **Sentry** para error tracking e performance monitoring  
✅ **Métricas** customizadas armazenadas em PostgreSQL  
✅ **Dashboard** visual interativo com Recharts  
✅ **Alertas** automáticos para situações críticas  
✅ **Healthcheck** contínuo da infraestrutura  

**Total**: 7 arquivos core + dashboard + testes + documentação

---

**Última Atualização**: 2024  
**Versão**: 1.0.0  
**Mantido por**: Equipe de Desenvolvimento
