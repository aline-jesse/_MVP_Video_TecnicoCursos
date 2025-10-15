
# ELK STACK SETUP GUIDE
## Sprint 34 - Enterprise Readiness

### Visão Geral
O ELK Stack (Elasticsearch, Logstash, Kibana) fornece agregação de logs em nível enterprise, permitindo monitoramento centralizado, análise de performance e auditoria completa.

### Arquitetura

```
Aplicação Next.js
    ↓
Logstash Client (lib/elk/logstash-config.ts)
    ↓
Elasticsearch (Indexação e Armazenamento)
    ↓
Kibana (Visualização e Dashboards)
```

### Instalação

#### 1. Elasticsearch

**Docker:**
```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.10.0
```

**Verificação:**
```bash
curl http://localhost:9200
```

#### 2. Kibana

**Docker:**
```bash
docker run -d \
  --name kibana \
  --link elasticsearch:elasticsearch \
  -p 5601:5601 \
  docker.elastic.co/kibana/kibana:8.10.0
```

**Acesso:**
- URL: http://localhost:5601
- Usuário: elastic
- Senha: (gerada no primeiro boot)

#### 3. Logstash (Opcional)

**Docker:**
```bash
docker run -d \
  --name logstash \
  --link elasticsearch:elasticsearch \
  -p 5044:5044 \
  -v $(pwd)/logstash.conf:/usr/share/logstash/pipeline/logstash.conf \
  docker.elastic.co/logstash/logstash:8.10.0
```

**logstash.conf:**
```
input {
  tcp {
    port => 5044
    codec => json
  }
}

filter {
  if [level] == "error" or [level] == "fatal" {
    mutate {
      add_tag => ["critical"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{environment}-%{+YYYY.MM.dd}"
  }
}
```

### Configuração da Aplicação

#### 1. Variáveis de Ambiente

Adicione ao `.env`:
```bash
# ELK Stack
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password

LOGSTASH_HOST=localhost
LOGSTASH_PORT=5044
LOGSTASH_PROTOCOL=tcp

# Kibana
KIBANA_URL=http://localhost:5601
```

#### 2. Integração no Código

```typescript
import { logger } from '@/lib/elk/logstash-config';

// Log de informação
await logger.info('User logged in', {
  userId: user.id,
  email: user.email,
});

// Log de erro
await logger.error('Payment failed', error, {
  userId: user.id,
  amount: transaction.amount,
});
```

#### 3. Middleware de Request Logging

Crie `middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/elk/logstash-config';

export async function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  const duration = Date.now() - start;
  
  await logger.info('HTTP Request', {
    method: request.method,
    url: request.url,
    statusCode: response.status,
    responseTime: duration,
    userAgent: request.headers.get('user-agent'),
  });
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### Kibana Dashboards

#### Importação de Dashboards

1. Acesse Kibana: http://localhost:5601
2. Vá para **Stack Management > Saved Objects**
3. Clique em **Import**
4. Use o arquivo gerado:

```typescript
import { exportKibanaDashboard } from '@/lib/elk/kibana-dashboards';

// Exportar dashboard de performance
const dashboardJSON = exportKibanaDashboard('performance-monitoring');
console.log(dashboardJSON); // Copie e importe no Kibana
```

#### Dashboards Pré-configurados

1. **Performance Monitoring**
   - Tempo médio de resposta
   - Taxa de erro
   - Requisições por endpoint
   - Status codes HTTP

2. **AI Operations**
   - Uso de providers TTS
   - Tempo de geração AI
   - Tamanho da fila de processamento

3. **User Activity**
   - Usuários ativos
   - Projetos criados
   - Ações de usuário

4. **Security & Audit**
   - Tentativas de login falhas
   - Mudanças de permissão
   - Acesso a API por usuário

### Consultas Úteis

#### Elasticsearch Query DSL

**Buscar erros das últimas 24 horas:**
```json
POST /logs-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "error" } },
        {
          "range": {
            "timestamp": {
              "gte": "now-24h",
              "lte": "now"
            }
          }
        }
      ]
    }
  },
  "sort": [{ "timestamp": { "order": "desc" } }],
  "size": 100
}
```

**Agregação de erros por serviço:**
```json
POST /logs-*/_search
{
  "size": 0,
  "query": {
    "match": { "level": "error" }
  },
  "aggs": {
    "errors_by_service": {
      "terms": {
        "field": "service.keyword",
        "size": 10
      }
    }
  }
}
```

### Performance Tips

1. **Index Lifecycle Management (ILM)**
   - Configure rotação automática de índices
   - Delete logs antigos (>90 dias)
   - Comprima índices cold

2. **Sharding**
   - Use 1 shard para logs diários pequenos (<10GB)
   - Use múltiplos shards para alta volumetria

3. **Retention**
   - Development: 7 dias
   - Staging: 30 dias
   - Production: 90 dias (ou conforme compliance)

### Troubleshooting

#### Elasticsearch não inicia
```bash
# Verificar logs
docker logs elasticsearch

# Aumentar memória
docker update --memory=2g --memory-swap=2g elasticsearch
```

#### Logs não aparecem no Kibana
1. Verificar index pattern: `logs-*`
2. Verificar timestamp field: `timestamp`
3. Refresh index: **Management > Index Patterns > Refresh**

#### Performance lenta
```bash
# Verificar health do cluster
curl http://localhost:9200/_cluster/health?pretty

# Verificar stats de índices
curl http://localhost:9200/_cat/indices?v
```

### Alertas

Configure alertas no Kibana para eventos críticos:

1. **Error Rate Alto**
   - Threshold: >10 erros/minuto
   - Action: Email + Slack

2. **Response Time Lento**
   - Threshold: >2000ms (p95)
   - Action: Email

3. **Failed Logins**
   - Threshold: >5 tentativas/minuto
   - Action: Email + Block IP

### Backup e Restore

#### Snapshot Repository
```bash
# Criar repository
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/backups/elasticsearch"
  }
}

# Criar snapshot
PUT /_snapshot/my_backup/snapshot_1?wait_for_completion=true
{
  "indices": "logs-*",
  "ignore_unavailable": true,
  "include_global_state": false
}

# Restore
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "logs-production-*"
}
```

### Integração com SIEM

Para compliance e segurança avançada, integre com:
- Elastic Security (built-in)
- Splunk
- AWS Security Hub
- Azure Sentinel

### Custos Estimados

**Self-hosted (AWS EC2):**
- t3.large (Elasticsearch): $60/mês
- t3.medium (Kibana): $30/mês
- Total: ~$90/mês

**Elastic Cloud:**
- Standard tier: $95/mês (14GB RAM)
- Enterprise: $300+/mês

### Links Úteis

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Kibana Guide](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Logstash Documentation](https://www.elastic.co/guide/en/logstash/current/index.html)
