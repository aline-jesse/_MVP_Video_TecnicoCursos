
#!/bin/bash

# 🚀 Script de Deploy Production-Ready
# Deploy automatizado com health checks e rollback

set -e  # Sair em caso de erro

# Configurações
PROJECT_NAME="estudio-ia-videos"
DOCKER_COMPOSE_FILE="docker-compose.yml"
HEALTH_CHECK_ENDPOINT="/api/health"
MAX_HEALTH_CHECKS=30
HEALTH_CHECK_INTERVAL=10

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções utilitárias
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar dependências
check_dependencies() {
    log_info "Verificando dependências..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker não encontrado. Instale o Docker primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose não encontrado. Instale o Docker Compose primeiro."
        exit 1
    fi
    
    log_success "Dependências verificadas"
}

# Backup antes do deploy
create_backup() {
    log_info "Criando backup antes do deploy..."
    
    # Backup do banco de dados se estiver rodando
    if docker ps | grep -q "${PROJECT_NAME}-db"; then
        BACKUP_FILE="backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql"
        docker exec "${PROJECT_NAME}-db" pg_dump -U postgres estudio_ia_videos > "$BACKUP_FILE"
        log_success "Backup do banco criado: $BACKUP_FILE"
    fi
    
    # Backup de volumes importantes
    if docker volume ls | grep -q "${PROJECT_NAME}"; then
        log_info "Fazendo backup dos volumes..."
        # Implementar backup de volumes se necessário
    fi
}

# Health check
health_check() {
    local url=$1
    local max_attempts=$2
    local interval=$3
    
    log_info "Executando health check em $url"
    
    for i in $(seq 1 $max_attempts); do
        log_info "Health check attempt $i/$max_attempts"
        
        if curl -f -s "$url" > /dev/null; then
            log_success "Health check passou!"
            return 0
        fi
        
        if [ $i -lt $max_attempts ]; then
            log_info "Health check falhou, tentando novamente em ${interval}s..."
            sleep $interval
        fi
    done
    
    log_error "Health check falhou após $max_attempts tentativas"
    return 1
}

# Rollback
rollback() {
    log_warning "Iniciando rollback..."
    
    # Parar serviços atuais
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    # Restaurar backup se existir
    LATEST_BACKUP=$(ls -t backup_pre_deploy_*.sql 2>/dev/null | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Restaurando backup: $LATEST_BACKUP"
        # Implementar restauração do backup
    fi
    
    # Subir versão anterior (implementar se necessário)
    log_warning "Rollback manual necessário - restaurar versão anterior"
    
    exit 1
}

# Deploy principal
main_deploy() {
    log_info "Iniciando deploy do $PROJECT_NAME"
    
    # 1. Verificar dependências
    check_dependencies
    
    # 2. Criar backup
    create_backup
    
    # 3. Atualizar código (se usando Git)
    if [ -d ".git" ]; then
        log_info "Atualizando código do Git..."
        git pull origin main
        log_success "Código atualizado"
    fi
    
    # 4. Construir imagens
    log_info "Construindo imagens Docker..."
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    log_success "Imagens construídas"
    
    # 5. Parar serviços antigos (com graceful shutdown)
    log_info "Parando serviços antigos..."
    docker-compose -f $DOCKER_COMPOSE_FILE down --timeout 30
    
    # 6. Subir novos serviços
    log_info "Subindo novos serviços..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    # 7. Aguardar inicialização
    log_info "Aguardando inicialização dos serviços..."
    sleep 30
    
    # 8. Health check
    if ! health_check "http://localhost:3000$HEALTH_CHECK_ENDPOINT" $MAX_HEALTH_CHECKS $HEALTH_CHECK_INTERVAL; then
        log_error "Deploy falhou no health check"
        rollback
    fi
    
    # 9. Testes de fumaça (smoke tests)
    log_info "Executando testes de fumaça..."
    if curl -f -s "http://localhost:3000/api/health" | grep -q "healthy"; then
        log_success "Testes de fumaça passaram"
    else
        log_error "Testes de fumaça falharam"
        rollback
    fi
    
    # 10. Limpeza
    log_info "Limpando recursos antigos..."
    docker system prune -f
    
    log_success "Deploy concluído com sucesso!"
    
    # 11. Mostrar status
    echo ""
    log_info "Status dos serviços:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    echo ""
    log_info "Logs recentes:"
    docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=10
}

# Verificar argumentos
case "${1:-deploy}" in
    "deploy")
        main_deploy
        ;;
    "rollback")
        rollback
        ;;
    "health-check")
        health_check "http://localhost:3000$HEALTH_CHECK_ENDPOINT" 1 0
        ;;
    "status")
        docker-compose -f $DOCKER_COMPOSE_FILE ps
        ;;
    "logs")
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f "${2:-app}"
        ;;
    *)
        echo "Uso: $0 [deploy|rollback|health-check|status|logs]"
        echo ""
        echo "Comandos:"
        echo "  deploy      - Deploy da aplicação (padrão)"
        echo "  rollback    - Rollback para versão anterior"
        echo "  health-check- Verificar saúde da aplicação"
        echo "  status      - Status dos containers"
        echo "  logs        - Ver logs (logs <service_name>)"
        exit 1
        ;;
esac
