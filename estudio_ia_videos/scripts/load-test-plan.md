
# Load Test Plan - Sprint 40
# Estúdio IA de Vídeos - GA Launch

## Objetivos
Validar que o sistema suporta 1.000+ usuários simultâneos com performance aceitável e auto-recovery em casos de falha.

## Ferramentas
- **k6** (https://k6.io) - Load testing framework
- **Artillery** (https://artillery.io) - Alternative option
- **Prometheus + Grafana** - Monitoring

## Cenários de Teste

### Cenário 1: Normal Load (Baseline)
**Objetivo**: Estabelecer baseline de performance

**Perfil**:
- 100 usuários simultâneos
- Duração: 10 minutos
- Ramp-up: 2 minutos

**Fluxo**:
1. Login
2. Listar projetos (GET /api/projects)
3. Criar novo projeto (POST /api/projects)
4. Upload PPTX (POST /api/pptx/upload)
5. Listar templates (GET /api/templates)
6. Logout

**Métricas Esperadas**:
- API P95: < 800ms
- Taxa de erro: < 0.1%
- CPU: < 60%
- Memória: < 70%

### Cenário 2: Peak Load
**Objetivo**: Simular horário de pico

**Perfil**:
- 500 usuários simultâneos
- Duração: 15 minutos
- Ramp-up: 3 minutos
- Sustain: 10 minutos
- Ramp-down: 2 minutos

**Fluxo**:
- 40% Navegação (listar, buscar)
- 30% Edição (criar, atualizar projetos)
- 20% TTS generation
- 10% Video render

**Métricas Esperadas**:
- API P95: < 1200ms
- Taxa de erro: < 1%
- CPU: < 80%
- Memória: < 85%

### Cenário 3: Stress Test
**Objetivo**: Encontrar limite de breaking point

**Perfil**:
- Escalar progressivamente: 100 → 1000 usuários
- Incremento: +100 a cada 2 minutos
- Duração: 20 minutos

**Critérios de Aceitação**:
- Sistema deve suportar pelo menos 1.000 usuários simultâneos
- Degradação gradual (não crash súbito)
- Auto-scaling deve ativar em 2 minutos
- Taxa de erro < 5% até 1.000 usuários

### Cenário 4: Spike Test
**Objetivo**: Testar resposta a picos súbitos

**Perfil**:
- Baseline: 100 usuários
- Spike: 0 → 800 usuários em 1 minuto
- Sustain: 5 minutos
- Return: 800 → 100 em 1 minuto

**Métricas Esperadas**:
- Sistema não deve crashar
- Auto-scaling ativado em < 2 min
- P95 pode degradar temporariamente mas recupera em < 5 min
- Nenhuma perda de dados

### Cenário 5: Soak Test (Endurance)
**Objetivo**: Testar estabilidade de longo prazo

**Perfil**:
- 200 usuários constantes
- Duração: 2 horas
- Verificar memory leaks e degradação

**Métricas Esperadas**:
- Uso de memória estável (variação < 10%)
- P95 estável ao longo do tempo
- Sem crashes ou restarts
- Taxa de erro consistente

## Endpoints Críticos

### Alta Prioridade
- `POST /api/auth/signin` - Login
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `POST /api/pptx/upload` - Upload PPTX
- `POST /api/tts/generate` - Gerar TTS
- `POST /api/render/queue` - Enfileirar render

### Média Prioridade
- `GET /api/templates` - Listar templates
- `PUT /api/projects/:id` - Atualizar projeto
- `GET /api/analytics` - Analytics
- `POST /api/export` - Exportar vídeo

## Configuração k6

```javascript
// load-test-baseline.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up
    { duration: '10m', target: 100 }, // Sustain
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    errors: ['rate<0.01'],
  },
};

export default function () {
  // Login
  const loginRes = http.post('https://treinx.abacusai.app/api/auth/signin', {
    email: 'test@example.com',
    password: 'password123',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // List projects
  const projectsRes = http.get('https://treinx.abacusai.app/api/projects');
  
  check(projectsRes, {
    'projects loaded': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(2);
}
```

## Monitoramento Durante Testes

### Métricas a Observar
1. **Application Metrics**
   - Request rate (req/s)
   - Response time (P50, P95, P99)
   - Error rate
   - Active connections

2. **Infrastructure Metrics**
   - CPU utilization
   - Memory usage
   - Disk I/O
   - Network bandwidth

3. **Database Metrics**
   - Connection pool utilization
   - Query latency
   - Lock contention
   - Replication lag

4. **Queue Metrics**
   - Queue depth
   - Processing rate
   - Wait time
   - Failed jobs

## Critérios de Sucesso

### Performance
- ✅ API P95 < 800ms (baseline)
- ✅ API P95 < 1200ms (peak load)
- ✅ 1000 usuários simultâneos suportados
- ✅ Taxa de erro < 1%

### Reliability
- ✅ Zero data loss
- ✅ Auto-recovery < 2 min
- ✅ Graceful degradation
- ✅ No cascading failures

### Scalability
- ✅ Auto-scaling funciona
- ✅ Horizontal scaling suportado
- ✅ Resource cleanup automático

## Próximos Passos

1. **Setup**
   - Instalar k6
   - Configurar ambiente de staging
   - Setup monitoring (Prometheus + Grafana)

2. **Execution**
   - Executar testes na ordem acima
   - Coletar métricas
   - Documentar issues

3. **Analysis**
   - Analisar resultados
   - Identificar bottlenecks
   - Propor otimizações

4. **Iteration**
   - Implementar fixes
   - Re-testar
   - Validar melhorias
