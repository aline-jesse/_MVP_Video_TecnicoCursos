
# 📊 PRODUCTION MONITORING DASHBOARD

## 🎯 Visão Geral

Este documento centraliza todos os pontos de monitoramento do **Estúdio IA de Vídeos** em produção.

**URL Produção**: https://treinx.abacusai.app/  
**Última Atualização**: 03/10/2025

---

## 🏥 HEALTH CHECKS AUTOMÁTICOS

### Scripts Disponíveis

#### 1. Health Check Único
```bash
cd /home/ubuntu/estudio_ia_videos/scripts
chmod +x production-health-check.sh
./production-health-check.sh https://treinx.abacusai.app
```

**O que testa**:
- ✅ Endpoints críticos (homepage, login, API)
- ✅ APIs funcionais (TTS, avatares, templates)
- ✅ Assets estáticos (favicon, manifest, service worker)
- ✅ Performance (tempo de resposta)
- ✅ SSL/TLS (certificado válido)

**Output**: Relatório em `/qa/health-check-[timestamp].log`

**Frequência Recomendada**: A cada deploy

---

#### 2. Monitoramento Contínuo
```bash
cd /home/ubuntu/estudio_ia_videos/scripts
chmod +x monitor-production.sh

# Monitorar a cada 60 segundos (padrão)
./monitor-production.sh

# Ou definir intervalo customizado (ex: 30s)
./monitor-production.sh 30
```

**O que faz**:
- 🔄 Loop infinito verificando saúde do sistema
- 📊 Estatísticas em tempo real (success/fail count)
- 📝 Log persistente em `/qa/monitoring-[date].log`
- 🚨 Alerta após 3+ falhas consecutivas

**Uso**: Deixar rodando em tmux/screen durante primeiros dias

---

#### 3. Validador de Ambiente
```bash
cd /home/ubuntu/estudio_ia_videos/scripts
chmod +x validate-env.sh
./validate-env.sh
```

**O que valida**:
- ✅ Variáveis críticas (DATABASE_URL, NEXTAUTH_SECRET)
- ✅ AWS S3 configurado
- ⚠️ TTS providers (opcional, mas recomendado)
- ⚠️ Redis/Stripe/Sentry (opcional)

**Uso**: Rodar ANTES de cada deploy

---

## 📈 MÉTRICAS DE PRODUÇÃO

### 1. Uptime & Disponibilidade

#### UptimeRobot (Recomendado)
- **URL**: https://uptimerobot.com/
- **Setup**: 5 minutos (gratuito)
- **Monitor**:
  - Endpoint: `https://treinx.abacusai.app/api/health`
  - Interval: 5 minutos
  - Alert: Email + SMS
- **Dashboard**: https://stats.uptimerobot.com/[seu-id]

**KPI Target**: 99.5% uptime (máximo 3.6h downtime/mês)

---

### 2. Performance & Velocidade

#### Ferramentas de Teste

**Google PageSpeed Insights**
```bash
https://pagespeed.web.dev/analysis?url=https://treinx.abacusai.app/
```

**Métricas Target**:
- **LCP** (Largest Contentful Paint): < 2.5s ✅
- **FID** (First Input Delay): < 100ms ✅
- **CLS** (Cumulative Layout Shift): < 0.1 ✅
- **Performance Score**: > 90/100 🎯

**WebPageTest**
```bash
https://www.webpagetest.org/
```

**Teste**:
- Location: São Paulo, Brazil
- Browser: Chrome
- Connection: 4G
- **Target**: Load time < 3s

---

### 3. Error Tracking (Sentry)

**Se configurado**:
- **Dashboard**: https://sentry.io/organizations/[org]/issues/
- **Alertas**: Email para P0/P1 errors
- **Release Tracking**: Tag cada deploy (`estudio-ia-videos@1.0.x`)

**Métricas Target**:
- Error Rate: < 1% das requisições
- Crash-free sessions: > 99.9%
- Resolved issues: < 24h para P1

**Quick Check**:
```bash
curl https://treinx.abacusai.app/api/test-sentry-error
# Deve criar issue no Sentry dashboard
```

---

### 4. Analytics (Google Analytics 4)

**Dashboard**: https://analytics.google.com/

#### Métricas Chave (30 primeiros dias)

**Adoção**:
- 🎯 Total Users: 100+
- 🎯 New Signups/day: 3-5
- 🎯 Projects Created: 50+
- 🎯 Videos Rendered: 20+

**Engajamento**:
- 🎯 DAU (Daily Active Users): 30+
- 🎯 Average Session Duration: 15min+
- 🎯 Sessions per User: 5+/week
- 🎯 Bounce Rate: < 40%

**Conversão** (se billing ativo):
- 🎯 Trial → Pro conversion: 10%+
- 🎯 MRR (Monthly Recurring Revenue): R$ 1.000+
- 🎯 Churn Rate: < 5%/mês

---

### 5. Banco de Dados (PostgreSQL)

**Monitoramento Nativo** (se usando Heroku/Render/Railway):
- CPU Usage: < 70%
- Memory: < 80%
- Connections: < 80% do limite
- Query Time (p95): < 100ms

**Queries Lentas**:
```sql
-- Rodar via psql para identificar gargalos
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC
LIMIT 10;
```

**Backup**:
- ✅ Automated daily backups habilitados
- ✅ Retention: 7 dias mínimo
- 🧪 Testar restore a cada 15 dias

---

### 6. AWS S3 (Storage)

**CloudWatch Metrics** (se disponível):
- Upload Success Rate: > 99%
- Average Latency: < 200ms
- 4xx Errors: < 0.5%
- 5xx Errors: < 0.1%

**Manual Check**:
```bash
# Testar upload via API
curl -X POST https://treinx.abacusai.app/api/upload \
  -F "file=@test.png" \
  -H "Authorization: Bearer [token]"

# Deve retornar 200 OK com URL do S3
```

---

## 🚨 ALERTAS & INCIDENTES

### Protocolo de Resposta

#### P0 - CRÍTICO (Resposta Imediata)
**Sintomas**:
- Site completamente fora do ar
- Login não funciona (100% falhas)
- Upload/Render quebrado

**Ações**:
1. Verificar status no UptimeRobot
2. Rodar health check: `./production-health-check.sh`
3. Checar logs Sentry (se configurado)
4. Rollback para última versão estável se necessário
5. Comunicar usuários afetados

**SLA**: Resolver em < 1 hora

---

#### P1 - ALTO (Resposta em 24h)
**Sintomas**:
- Performance degradada (>5s load time)
- TTS falhando intermitentemente
- Editor salvando incorretamente
- Colaboração offline

**Ações**:
1. Documentar em `HOTFIX_PROD.md`
2. Reproduzir localmente
3. Criar branch `hotfix/[issue]`
4. Testar fix em staging (se disponível)
5. Deploy urgente após validação

**SLA**: Resolver em < 24 horas

---

#### P2 - MÉDIO (Resposta em 1 semana)
**Sintomas**:
- UX confusa
- Mobile bugs
- Analytics não registrando corretamente

**Ações**:
1. Adicionar ao backlog do próximo sprint
2. Priorizar baseado em impacto de usuários

**SLA**: Resolver em próximo sprint

---

### Canais de Comunicação

**Status Page** (Recomendado):
- Criar página pública em: https://statuspage.io/
- URL: https://status.estudio-ia.com.br
- Atualizar em tempo real durante incidentes

**Email de Incidentes**:
- Template: "🚨 Estamos cientes de [problema] e trabalhando na solução..."
- Enviar para: Todos usuários ativos (via SendGrid/Resend)

**Twitter/X** (Opcional):
- Postar updates em @estudioiavideos
- Marcar horários de manutenção

---

## 📊 DASHBOARDS CONSOLIDADOS

### Dashboard 1: Saúde do Sistema (Tempo Real)

**URL**: `/admin/system` (no app)

**Widgets**:
- 🟢/🔴 Health status
- 📊 Uptime % (últimas 24h)
- 🚀 Average response time
- 💾 Database connections
- 🗄️ Redis status
- 📁 S3 upload success rate

**Acesso**: Admin only

---

### Dashboard 2: Usuários & Engajamento (Google Analytics)

**URL**: https://analytics.google.com/

**Reports Importantes**:
1. **Realtime**:
   - Active users now
   - Top pages
   - Traffic sources

2. **Acquisition**:
   - User acquisition
   - Traffic acquisition
   - Campaign performance

3. **Engagement**:
   - Pages and screens
   - Events (video_rendered, project_created)
   - Conversions

4. **Monetization** (se billing ativo):
   - Purchase revenue
   - Subscription revenue
   - LTV (Lifetime Value)

---

### Dashboard 3: Erros & Performance (Sentry)

**URL**: https://sentry.io/

**Views Críticas**:
1. **Issues**:
   - Unresolved issues
   - Issues by severity
   - Issues by release

2. **Performance**:
   - Transaction summary
   - Web Vitals
   - Slow queries

3. **Releases**:
   - Deploy tracking
   - Crash rate por versão

---

### Dashboard 4: Billing (Stripe)

**URL**: https://dashboard.stripe.com/

**Métricas**:
- 💰 MRR (Monthly Recurring Revenue)
- 📈 New subscriptions
- 📉 Churn rate
- 💳 Failed payments
- 🔄 Upcoming renewals

**Alertas**:
- Email quando: Failed payment, churn >10%, MRR milestone

---

## 🔔 NOTIFICAÇÕES RECOMENDADAS

### Slack/Discord (Setup)

**Webhooks**:
1. **Sentry** → #alerts-production
2. **UptimeRobot** → #status-page
3. **Stripe** → #billing-events
4. **GitHub Actions** → #deployments

**Exemplo Sentry → Slack**:
```bash
# Em Sentry > Settings > Integrations > Slack
# Adicionar webhook: https://hooks.slack.com/services/...
# Ativar: New issues, Resolved issues
```

---

### Email (Critical Alerts)

**Configurar em**:
- UptimeRobot: [seu-email]
- Sentry: [seu-email] (P0/P1 only)
- Stripe: [seu-email] (Failed payments)

---

## 📅 ROTINA DE MONITORAMENTO

### Diária (5 minutos)
- [ ] Verificar UptimeRobot (uptime %)
- [ ] Checar Sentry (0 unresolved P0/P1)
- [ ] Ver Google Analytics realtime (usuários ativos)

### Semanal (30 minutos)
- [ ] Rodar health check completo
- [ ] Revisar Google Analytics (engagement metrics)
- [ ] Analisar Stripe dashboard (MRR, churn)
- [ ] Verificar S3 usage & costs
- [ ] Revisar issues P2/P3 (priorizar backlog)

### Mensal (2 horas)
- [ ] Performance audit (PageSpeed, WebPageTest)
- [ ] Security audit (dependências outdated)
- [ ] Backup restore test
- [ ] Review KPIs vs. targets
- [ ] Planejar melhorias para próximo sprint

---

## 🛠️ TROUBLESHOOTING RÁPIDO

### Site Lento (>3s load time)
```bash
# 1. Verificar CDN cache (se tiver)
# 2. Checar database slow queries
# 3. Ver se S3 está lento (CloudWatch)
# 4. Testar de diferentes locais (WebPageTest)
# 5. Considerar add CDN (Cloudflare)
```

### Upload Falhando
```bash
# 1. Testar manualmente:
curl -X POST https://treinx.abacusai.app/api/upload/pptx \
  -F "file=@test.pptx"

# 2. Checar AWS S3 status:
https://health.aws.amazon.com/

# 3. Verificar limites de bucket (quota)
# 4. Ver logs Sentry (erros de S3)
```

### TTS Não Gerando Áudio
```bash
# 1. Testar providers individualmente:
curl -X POST https://treinx.abacusai.app/api/tts/generate \
  -d '{"text":"teste","provider":"elevenlabs"}' \
  -H "Content-Type: application/json"

# 2. Verificar quotas:
# - ElevenLabs: https://elevenlabs.io/app/usage
# - Azure: Portal Azure > Speech Services > Quotas

# 3. Checar API keys válidas (validate-env.sh)
```

### Render Travando
```bash
# 1. Ver fila de renders:
curl https://treinx.abacusai.app/api/render/queue

# 2. Checar FFmpeg logs no Sentry
# 3. Testar render de vídeo curto (1 slide)
# 4. Verificar se worker está vivo
```

---

## 📞 CONTATOS & RECURSOS

### Suporte Técnico
- **Email**: suporte@estudio-ia.com.br
- **Slack**: #tech-support
- **On-call**: [número de plantão]

### Documentação Completa
- `/home/ubuntu/estudio_ia_videos/docs/`
- `GO_LIVE_READOUT_FINAL.md`
- `DEVELOPER_GUIDE.md`
- `USER_GUIDE.md`

### Repositório
- **GitHub**: https://github.com/[org]/estudio-ia-videos
- **Issues**: Para reportar bugs
- **Discussions**: Para sugestões

---

## ✅ CHECKLIST DE MONITORAMENTO

### Setup Inicial (Fazer UMA VEZ)
- [ ] Configurar UptimeRobot
- [ ] Ativar Sentry (se optou por usar)
- [ ] Configurar Google Analytics 4
- [ ] Adicionar Stripe webhooks
- [ ] Criar alertas de email
- [ ] Configurar Slack notifications (opcional)
- [ ] Bookmark dashboards principais

### Manutenção Contínua
- [ ] Diária: Quick check (5min)
- [ ] Semanal: Review completo (30min)
- [ ] Mensal: Audit profundo (2h)
- [ ] Atualizar este documento conforme evolução

---

**Dashboard mantido por**: [Seu Nome]  
**Última revisão**: 03/10/2025  
**Próxima revisão**: ___/___/2025

---

🎯 **Lembre-se**: O melhor monitoramento é aquele que você realmente usa. Comece simples (UptimeRobot + Google Analytics) e expanda conforme necessidade.
