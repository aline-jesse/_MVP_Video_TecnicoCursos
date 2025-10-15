# Sistema de Analytics Completo - Estúdio IA Vídeos

## 📊 Visão Geral

Este documento descreve o sistema completo de analytics implementado na FASE 4 do projeto Estúdio IA Vídeos. O sistema oferece coleta de métricas em tempo real, dashboards avançados, relatórios automatizados, alertas inteligentes e exportação de dados.

## 🚀 Funcionalidades Principais

### 1. Dashboard Analytics
- **Localização**: `/dashboard/analytics`
- **Métricas em tempo real**: Eventos totais, taxa de erro, usuários ativos, taxa de conversão
- **Visualizações**: Gráficos de linha, pizza e barras
- **Filtros**: Períodos de 7, 30 e 90 dias
- **Exportação rápida**: CSV, JSON, PDF

### 2. Sistema de Coleta de Métricas
- **Middleware**: `withAnalytics` para tracking automático
- **Eventos personalizados**: API para registro de eventos específicos
- **Métricas de performance**: Tempo de resposta, throughput, erros
- **Comportamento do usuário**: Sessões, navegação, conversões

### 3. APIs de Analytics

#### 3.1 Eventos (`/api/analytics/events`)
- **GET**: Lista eventos com filtros avançados
- **POST**: Registra novos eventos
- **Filtros**: Período, categoria, usuário, organização

#### 3.2 Performance (`/api/analytics/performance`)
- **GET**: Métricas de performance do sistema
- **POST**: Registra métricas customizadas
- **Métricas**: Tempo de resposta, throughput, taxa de erro

#### 3.3 Comportamento do Usuário (`/api/analytics/user-behavior`)
- **GET**: Analytics de comportamento
- **POST**: Registra eventos de comportamento
- **Dados**: Engajamento, navegação, conversões, retenção

#### 3.4 Tempo Real (`/api/analytics/realtime`)
- **GET**: Métricas em tempo real
- **POST**: Recebe eventos via webhook
- **Janelas**: 5m, 15m, 1h

### 4. Sistema de Relatórios

#### 4.1 Geração de Relatórios (`/api/analytics/reports`)
- **Tipos**: Diário, semanal, mensal
- **Formatos**: JSON, HTML, PDF
- **Cache**: Sistema de cache inteligente
- **Agendamento**: Relatórios automáticos

#### 4.2 Agendador (`/api/analytics/reports/scheduler`)
- **Gestão**: Lista, ativa/desativa, remove relatórios
- **Execução**: Manual ou via cron job
- **Estatísticas**: Métricas do agendador

### 5. Sistema de Alertas

#### 5.1 Alertas Inteligentes (`/api/analytics/alerts`)
- **Tipos**: Taxa de erro, tempo de resposta, usuários ativos
- **Severidade**: Baixa, média, alta, crítica
- **Canais**: Email, webhook, SMS
- **Cooldown**: Prevenção de spam

#### 5.2 Avaliação (`/api/analytics/alerts/evaluate`)
- **Execução**: Manual ou via cron job
- **Filtros**: Organização, tipos de regra
- **Dry run**: Teste sem envio

### 6. Exportação de Dados

#### 6.1 API de Exportação (`/api/analytics/export`)
- **Formatos**: CSV, JSON, XLSX, PDF, XML
- **Tipos de dados**: Eventos, performance, usuários, projetos
- **Filtros**: Período, metadados, compressão
- **Histórico**: Rastreamento de exportações

#### 6.2 Interface de Exportação (`/dashboard/analytics/export`)
- **Exportação rápida**: Formatos predefinidos
- **Exportação customizada**: Configurações avançadas
- **Histórico**: Visualização de exportações anteriores
- **Batch export**: Exportações em lote

## 🛠️ Estrutura Técnica

### Arquivos Principais

```
app/
├── api/analytics/
│   ├── events/route.ts
│   ├── performance/route.ts
│   ├── user-behavior/route.ts
│   ├── realtime/route.ts
│   ├── reports/
│   │   ├── route.ts
│   │   └── scheduler/route.ts
│   ├── alerts/
│   │   ├── route.ts
│   │   └── evaluate/route.ts
│   └── export/route.ts
├── components/analytics/
│   └── data-export.tsx
├── dashboard/analytics/
│   ├── page.tsx
│   └── export/page.tsx
├── hooks/
│   └── use-data-export.ts
├── lib/analytics/
│   ├── middleware.ts
│   ├── report-generator.ts
│   ├── report-scheduler.ts
│   ├── alert-system.ts
│   └── data-exporter.ts
└── types/analytics.ts
```

### Middleware de Analytics

O middleware `withAnalytics` é aplicado automaticamente em todas as rotas da API para coletar:
- Tempo de resposta
- Status HTTP
- Método da requisição
- User-Agent
- IP do cliente
- Dados de performance

### Banco de Dados

#### Tabelas Principais:
- `analytics_events`: Eventos do sistema
- `analytics_performance`: Métricas de performance
- `analytics_user_behavior`: Comportamento do usuário
- `analytics_reports`: Relatórios gerados
- `analytics_alerts`: Alertas do sistema
- `analytics_alert_rules`: Regras de alerta
- `analytics_exports`: Histórico de exportações

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=90

# Alertas
ALERT_EMAIL_FROM=alerts@estudioiavideos.com
ALERT_WEBHOOK_URL=https://hooks.slack.com/...

# Relatórios
REPORTS_STORAGE_PATH=/tmp/reports
REPORTS_EMAIL_FROM=reports@estudioiavideos.com
```

### Cron Jobs Recomendados
```bash
# Avaliação de alertas (a cada 5 minutos)
*/5 * * * * curl -X POST http://localhost:3000/api/analytics/alerts/evaluate

# Relatórios diários (todo dia às 6h)
0 6 * * * curl -X GET http://localhost:3000/api/analytics/reports/scheduler

# Limpeza de dados antigos (toda semana)
0 2 * * 0 curl -X POST http://localhost:3000/api/analytics/cleanup
```

## 📈 Uso e Exemplos

### Registrar Evento Personalizado
```javascript
// Frontend
await fetch('/api/analytics/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'video',
    action: 'play',
    label: 'tutorial-intro',
    value: 1,
    metadata: { duration: 120, quality: 'HD' }
  })
});
```

### Criar Regra de Alerta
```javascript
await fetch('/api/analytics/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Alta Taxa de Erro',
    type: 'error_rate',
    severity: 'high',
    condition: {
      metric: 'error_rate',
      operator: '>',
      threshold: 5,
      timeWindow: '5m'
    },
    channels: ['email', 'webhook'],
    cooldown: 300
  })
});
```

### Exportar Dados
```javascript
// Exportação simples
const response = await fetch('/api/analytics/export?format=csv&period=7d');
const blob = await response.blob();

// Exportação customizada
const response = await fetch('/api/analytics/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    format: 'xlsx',
    dataType: 'events',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    filters: { category: 'video' },
    includeMetadata: true
  })
});
```

## 🔍 Monitoramento e Debugging

### Logs de Sistema
- Todos os eventos são logados com timestamps
- Erros são capturados e alertas são enviados
- Performance é monitorada continuamente

### Métricas de Saúde
- CPU e memória do sistema
- Tempo de resposta das APIs
- Taxa de erro por endpoint
- Usuários ativos em tempo real

### Debugging
- Console logs no frontend para desenvolvimento
- Logs estruturados no backend
- Rastreamento de erros com stack traces

## 🚀 Próximos Passos

1. **Integração com BI**: Conectar com ferramentas como Power BI ou Tableau
2. **Machine Learning**: Implementar predições baseadas em dados históricos
3. **Segmentação Avançada**: Análise de coortes mais detalhada
4. **A/B Testing**: Framework para testes A/B automatizados
5. **Geolocalização**: Analytics baseados em localização

## 📞 Suporte

Para dúvidas ou problemas com o sistema de analytics:
1. Verifique os logs do sistema
2. Consulte a documentação da API
3. Execute os testes de diagnóstico
4. Entre em contato com a equipe de desenvolvimento

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2024  
**Desenvolvido por**: Equipe Estúdio IA Vídeos