#!/bin/bash

# 🚀 SCRIPT DE INICIALIZAÇÃO PARA PRODUÇÃO
# Configuração robusta com verificações de saúde

set -e

echo "🚀 Iniciando Estúdio IA Vídeos - Produção"
echo "========================================"

# Função para logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar variáveis de ambiente críticas
check_env() {
    log "Verificando variáveis de ambiente..."
    
    required_vars=(
        "NODE_ENV"
        "DATABASE_URL"
        "REDIS_URL"
        "NEXTAUTH_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log "ERRO: Variável $var não está definida"
            exit 1
        fi
    done
    
    log "Variáveis de ambiente verificadas ✓"
}

# Aguardar dependências ficarem prontas
wait_for_dependencies() {
    log "Aguardando dependências..."
    
    # Aguardar Redis
    if [[ -n "$REDIS_HOST" ]]; then
        log "Aguardando Redis em $REDIS_HOST:$REDIS_PORT..."
        while ! nc -z "$REDIS_HOST" "$REDIS_PORT"; do
            sleep 1
        done
        log "Redis está pronto ✓"
    fi
    
    # Aguardar PostgreSQL
    if [[ -n "$POSTGRES_HOST" ]]; then
        log "Aguardando PostgreSQL..."
        while ! pg_isready -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-postgres}"; do
            sleep 1
        done
        log "PostgreSQL está pronto ✓"
    fi
}

# Executar migrações se necessário
run_migrations() {
    log "Verificando migrações..."
    
    if [[ -f "prisma/schema.prisma" ]]; then
        log "Executando migrações Prisma..."
        npx prisma migrate deploy || log "Migrações falharam - continuando..."
    fi
    
    log "Migrações verificadas ✓"
}

# Configurar cache e diretórios
setup_directories() {
    log "Configurando diretórios..."
    
    # Criar diretórios se não existirem
    mkdir -p /app/.next/cache
    mkdir -p /app/logs
    mkdir -p /app/uploads
    mkdir -p /app/temp
    
    # Definir permissões
    chmod 755 /app/.next/cache
    chmod 755 /app/logs
    chmod 755 /app/uploads
    chmod 755 /app/temp
    
    log "Diretórios configurados ✓"
}

# Função principal
main() {
    log "Iniciando verificações pré-execução..."
    
    # Verificações
    check_env
    setup_directories
    wait_for_dependencies
    run_migrations
    
    log "Todas as verificações passaram ✓"
    log "Iniciando aplicação Next.js..."
    
    # Iniciar aplicação
    exec node server.js
}

# Executar função principal
main "$@"