
# Service Level Objectives & Error Budgets
# Estúdio IA de Vídeos - Sprint 40

## Overview
Este documento define os SLOs (Service Level Objectives) e Error Budgets para o sistema em produção.

---

## 1. SLO Definitions

### 1.1 API Response Time (P95)

**Definition**: 95% das requisições de API devem responder em menos de 800ms

**Measurement Window**: 24 horas

**Target**: 800ms

**Current**: 650ms ✅

**Calculation**:
```
P95_latency = percentile(response_times, 95)
SLO_met = P95_latency < 800ms
```

**Error Budget**:
- Budget: 800ms + 20% = 960ms máximo
- Consumed: 650ms
- Remaining: 310ms

**Status**: ✅ Healthy (budget 67% remaining)

---

### 1.2 Render Queue Wait Time

**Definition**: Tempo médio de espera na fila de renderização

**Measurement Window**: 24 horas

**Target**: < 120 segundos (2 minutos)

**Current**: 85s ✅

**Calculation**:
```
wait_time = queue_entry_time - job_start_time
avg_wait = mean(wait_times)
SLO_met = avg_wait < 120s
```

**Error Budget**:
- Budget: 120s + 20% = 144s máximo
- Consumed: 85s
- Remaining: 59s

**Status**: ✅ Healthy (budget 41% remaining)

---

### 1.3 TTS Generation Time

**Definition**: Tempo de geração de TTS por minuto de áudio

**Measurement Window**: 24 horas

**Target**: < 12 segundos por minuto de áudio

**Current**: 9.5s ✅

**Calculation**:
```
generation_time = end_time - start_time
time_per_minute = generation_time / audio_duration_minutes
SLO_met = time_per_minute < 12s
```

**Error Budget**:
- Budget: 12s + 20% = 14.4s máximo
- Consumed: 9.5s
- Remaining: 4.9s

**Status**: ✅ Healthy (budget 34% remaining)

---

### 1.4 API Availability

**Definition**: Disponibilidade geral da API

**Measurement Window**: 30 dias

**Target**: 99.9% (43.2 minutos de downtime permitido por mês)

**Current**: 99.95% ✅

**Calculation**:
```
uptime = (total_time - downtime) / total_time
SLO_met = uptime >= 0.999
```

**Error Budget**:
- Budget: 43.2 minutos de downtime/mês
- Consumed: 21.6 minutos
- Remaining: 21.6 minutos

**Status**: ✅ Healthy (budget 50% remaining)

---

### 1.5 Video Render Success Rate

**Definition**: Taxa de sucesso de renderização de vídeos

**Measurement Window**: 7 dias

**Target**: 98.0%

**Current**: 98.5% ✅

**Calculation**:
```
success_rate = successful_renders / total_renders
SLO_met = success_rate >= 0.98
```

**Error Budget**:
- Budget: 2% de falhas permitidas
- Consumed: 1.5%
- Remaining: 0.5%

**Status**: ⚠️ Warning (budget 25% remaining)

---

### 1.6 TTS Success Rate

**Definition**: Taxa de sucesso de geração de TTS

**Measurement Window**: 7 dias

**Target**: 99.5%

**Current**: 99.7% ✅

**Calculation**:
```
success_rate = successful_tts / total_tts
SLO_met = success_rate >= 0.995
```

**Error Budget**:
- Budget: 0.5% de falhas permitidas
- Consumed: 0.3%
- Remaining: 0.2%

**Status**: ⚠️ Warning (budget 40% remaining)

---

## 2. Error Budget Policy

### 2.1 Budget Consumption Thresholds

| Threshold | Status | Actions |
|-----------|--------|---------|
| 0-60% | ✅ Healthy | Continue desenvolvimento normal |
| 60-80% | ⚠️ Warning | Revisar causas, considerar pausar deploys de risco |
| 80-100% | 🔴 Critical | Pausar novos features, focar em reliability |
| 100%+ | ⛔ Exhausted | FREEZE deploys, incident response, rollback |

### 2.2 Automatic Actions

**When budget reaches 80%**:
1. Alert on-call engineer
2. Create incident ticket
3. Escalate to engineering lead
4. Consider pausing deployments

**When budget exhausted**:
1. Automatic deployment freeze
2. Page on-call team
3. Trigger incident response
4. Evaluate rollback to last known good state

### 2.3 Rollback Triggers

Rollback automático é acionado quando:
- 2 ou mais SLOs com budget exhausted
- Critical security vulnerability
- Data loss detected
- Cascading failures observed

**Rollback Procedure**:
```bash
# 1. Confirm rollback decision
./scripts/confirm-rollback.sh

# 2. Execute rollback
kubectl rollout undo deployment/app-api
kubectl rollout undo deployment/app-workers

# 3. Verify rollback
./scripts/verify-rollback.sh

# 4. Monitor recovery
./scripts/monitor-recovery.sh
```

---

## 3. Monitoring & Alerts

### 3.1 Prometheus Queries

**API P95 Latency**:
```promql
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket[5m])
) * 1000
```

**Error Budget Consumption**:
```promql
(
  sum(rate(http_requests_total{status=~"5.."}[24h])) 
  / 
  sum(rate(http_requests_total[24h]))
) * 100
```

**Render Success Rate**:
```promql
sum(rate(render_jobs_success_total[7d])) 
/ 
sum(rate(render_jobs_total[7d]))
```

### 3.2 Alert Rules

```yaml
# SLO Violation Alert
- alert: SLOViolation
  expr: slo_compliance < 0.995
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "SLO {{ $labels.slo_name }} violated"
    description: "SLO {{ $labels.slo_name }} is at {{ $value }}%"

# Error Budget Warning
- alert: ErrorBudgetWarning
  expr: error_budget_remaining < 0.2
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Error budget {{ $labels.service }} below 20%"
    description: "Only {{ $value }}% error budget remaining"

# Error Budget Critical
- alert: ErrorBudgetCritical
  expr: error_budget_remaining < 0.1
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Error budget {{ $labels.service }} critically low"
    description: "Only {{ $value }}% error budget remaining. Consider deployment freeze."
```

---

## 4. Reporting

### 4.1 Daily SLO Report

Relatório automático enviado diariamente para equipe de engenharia:

```
Subject: Daily SLO Report - [Date]

Overall Health: ✅ Healthy

SLOs Status:
- API P95 Latency: ✅ 650ms (target: 800ms)
- Render Queue Wait: ✅ 85s (target: 120s)
- TTS Generation: ✅ 9.5s (target: 12s)
- API Availability: ✅ 99.95% (target: 99.9%)
- Render Success: ⚠️ 98.5% (target: 98%)
- TTS Success: ⚠️ 99.7% (target: 99.5%)

Error Budgets:
- API Latency: 67% remaining
- Render Queue: 41% remaining
- TTS Time: 34% remaining
- Availability: 50% remaining
- Render Success: 25% remaining ⚠️
- TTS Success: 40% remaining ⚠️

Actions Needed:
- Monitor render success rate (budget low)
- Investigate TTS failures
```

### 4.2 Weekly SLO Review

Reunião semanal para revisar SLOs com stakeholders:
- Review de violações da semana
- Análise de root cause
- Action items para melhorar reliability
- Ajustes de targets se necessário

---

## 5. SLO Evolution

### 5.1 Historical Trends

| Period | API P95 | Availability | Render Success |
|--------|---------|--------------|----------------|
| Week 1 | 720ms | 99.93% | 97.8% |
| Week 2 | 680ms | 99.95% | 98.2% |
| Week 3 | 650ms | 99.96% | 98.5% |
| Week 4 | 650ms | 99.95% | 98.5% |

**Trend**: ✅ Improving

### 5.2 Target Adjustments

Após 3 meses de operação estável, considerar apertar targets:
- API P95: 800ms → 600ms
- Availability: 99.9% → 99.95%
- Render Success: 98% → 98.5%

---

## 6. Best Practices

### 6.1 Development Guidelines

**Before deploying**:
- [ ] Run load tests
- [ ] Check current error budget status
- [ ] Have rollback plan ready
- [ ] Deploy during low-traffic window
- [ ] Monitor closely for 1 hour post-deploy

**If SLO is at risk**:
- [ ] Pause feature development
- [ ] Focus on reliability improvements
- [ ] Conduct chaos engineering tests
- [ ] Review and optimize critical paths

### 6.2 Incident Response

**When SLO violated**:
1. Assess impact and severity
2. Create incident ticket
3. Form incident team
4. Investigate root cause
5. Implement fix or rollback
6. Validate recovery
7. Post-mortem within 24h
8. Update runbooks

---

## 7. Glossary

**SLO (Service Level Objective)**: Target for service performance/reliability

**SLI (Service Level Indicator)**: Actual measurement of service performance

**Error Budget**: Allowed amount of downtime/errors before SLO is violated

**P95 (95th Percentile)**: 95% of requests are faster than this value

**Availability**: Percentage of time service is operational

**Success Rate**: Percentage of requests/jobs that complete successfully

---

Last Updated: 03/10/2025
Next Review: 10/10/2025
