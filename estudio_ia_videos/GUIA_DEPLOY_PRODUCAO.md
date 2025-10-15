# 🚀 GUIA COMPLETO DE DEPLOY PARA PRODUÇÃO

## Estúdio IA Vídeos - Fase 5: Otimização e Deploy

---

## 📋 PRÉ-REQUISITOS

### Infraestrutura Necessária
- **Docker** 20.10+ e Docker Compose 2.0+
- **Servidor** com mínimo 8GB RAM, 4 CPU cores, 100GB storage
- **Domínio** configurado com DNS
- **Certificados SSL** (Let's Encrypt recomendado)

### Variáveis de Ambiente Críticas
```bash
# Copiar .env.production e configurar:
cp .env.example .env.production

# Configurar obrigatoriamente:
NEXTAUTH_SECRET=your-super-secure-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://:password@host:6379
MINIO_ACCESS_KEY=your-minio-access-key
MINIO_SECRET_KEY=your-minio-secret-key
```

---

## 🚀 PROCESSO DE DEPLOY

### 1. Preparação do Ambiente

```bash
# Clone do repositório
git clone <repository-url>
cd estudio_ia_videos

# Configurar variáveis de ambiente
cp .env.example .env.production
# Editar .env.production com valores reais

# Verificar arquivos necessários
ls -la docker-compose.production.yml
ls -la config/nginx.conf
ls -la config/prometheus.yml
```

### 2. Build e Deploy

```bash
# Parar serviços existentes (se houver)
docker-compose -f docker-compose.production.yml down

# Build da aplicação
cd app
docker build -t estudio-ia-app:latest .
cd ..

# Deploy completo
docker-compose -f docker-compose.production.yml up -d

# Verificar status
docker-compose -f docker-compose.production.yml ps
```

### 3. Verificação de Saúde

```bash
# Verificar logs
docker-compose -f docker-compose.production.yml logs -f app

# Testar endpoints
curl http://localhost:3000/api/health
curl http://localhost/health

# Verificar bancos de dados
docker-compose -f docker-compose.production.yml exec redis redis-cli ping
docker-compose -f docker-compose.production.yml exec postgres pg_isready
```

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### SSL/HTTPS
```bash
# Gerar certificados Let's Encrypt
certbot certonly --webroot -w /var/www/html -d your-domain.com

# Copiar certificados para nginx
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem config/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem config/ssl/key.pem
```

### Backup Automático
```bash
# Configurar cron para backup diário
0 2 * * * /path/to/backup-script.sh
```

### Monitoramento
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Logs**: `docker-compose logs -f`

---

## 🛠️ TROUBLESHOOTING

### Problemas Comuns

#### 1. Redis Connection Refused
```bash
# Verificar se Redis está rodando
docker-compose exec redis redis-cli ping

# Verificar logs
docker-compose logs redis

# Reiniciar se necessário
docker-compose restart redis
```

#### 2. PostgreSQL Connection Issues
```bash
# Verificar conexão
docker-compose exec postgres pg_isready

# Verificar logs
docker-compose logs postgres

# Verificar variáveis de ambiente
docker-compose exec app env | grep DATABASE
```

#### 3. Aplicação Não Responde
```bash
# Verificar logs da aplicação
docker-compose logs app

# Verificar recursos do sistema
docker stats

# Reiniciar aplicação
docker-compose restart app
```

#### 4. Nginx 502 Bad Gateway
```bash
# Verificar se app está rodando
curl http://app:3000/api/health

# Verificar configuração nginx
docker-compose exec nginx nginx -t

# Recarregar configuração
docker-compose exec nginx nginx -s reload
```

---

## 📊 MONITORAMENTO E ALERTAS

### Métricas Importantes
- **CPU Usage**: < 80%
- **Memory Usage**: < 85%
- **Disk Usage**: < 90%
- **Response Time**: < 2s
- **Error Rate**: < 1%

### Configurar Alertas
```yaml
# Adicionar ao prometheus.yml
rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

---

## 🔒 SEGURANÇA

### Checklist de Segurança
- [ ] Certificados SSL configurados
- [ ] Rate limiting ativo
- [ ] CORS configurado corretamente
- [ ] Secrets não expostos em logs
- [ ] Firewall configurado
- [ ] Backup criptografado
- [ ] Monitoramento de segurança ativo

### Hardening
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Configurar firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Configurar fail2ban
apt install fail2ban
systemctl enable fail2ban
```

---

## 📈 PERFORMANCE

### Otimizações Aplicadas
- **Compressão Gzip** no Nginx
- **Cache Redis** para sessões
- **CDN** para assets estáticos
- **Image optimization** no Next.js
- **Bundle splitting** automático

### Tuning de Performance
```bash
# Ajustar limites do sistema
echo "fs.file-max = 65536" >> /etc/sysctl.conf
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
sysctl -p
```

---

## 🔄 BACKUP E RECOVERY

### Backup Automático
```bash
#!/bin/bash
# backup-script.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/$DATE"

mkdir -p $BACKUP_DIR

# Backup Redis
docker run --rm -v estudio_ia_videos_redis_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/redis.tar.gz -C /data .

# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres estudio_ia > $BACKUP_DIR/postgres.sql

# Backup uploads
docker run --rm -v estudio_ia_videos_app_uploads:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/uploads.tar.gz -C /data .
```

### Recovery
```bash
# Restaurar Redis
docker run --rm -v estudio_ia_videos_redis_data:/data -v $BACKUP_DIR:/backup alpine tar xzf /backup/redis.tar.gz -C /data

# Restaurar PostgreSQL
docker-compose exec postgres psql -U postgres -d estudio_ia < $BACKUP_DIR/postgres.sql

# Restaurar uploads
docker run --rm -v estudio_ia_videos_app_uploads:/data -v $BACKUP_DIR:/backup alpine tar xzf /backup/uploads.tar.gz -C /data
```

---

## 📞 SUPORTE

### Logs Importantes
```bash
# Logs da aplicação
docker-compose logs -f app

# Logs do Nginx
docker-compose logs -f nginx

# Logs do sistema
journalctl -f

# Métricas do sistema
htop
iotop
```

### Contatos de Emergência
- **DevOps**: devops@empresa.com
- **Suporte**: suporte@empresa.com
- **Slack**: #estudio-ia-alerts

---

## ✅ CHECKLIST PÓS-DEPLOY

- [ ] Todos os serviços estão rodando
- [ ] Health checks passando
- [ ] SSL configurado e funcionando
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Alertas configurados
- [ ] DNS apontando corretamente
- [ ] Performance dentro dos SLAs
- [ ] Logs sendo coletados
- [ ] Documentação atualizada

---

**🎉 Deploy concluído com sucesso!**

Para suporte adicional, consulte a documentação técnica ou entre em contato com a equipe de DevOps.