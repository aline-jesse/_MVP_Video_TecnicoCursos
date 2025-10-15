-- =====================================================
-- SISTEMA DE ANALYTICS COMPLETO
-- Migração para criar todas as tabelas necessárias
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- TABELA DE EVENTOS DE ANALYTICS
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID,
    session_id VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    label VARCHAR(255),
    value INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_analytics_events_user_id (user_id),
    INDEX idx_analytics_events_organization_id (organization_id),
    INDEX idx_analytics_events_category (category),
    INDEX idx_analytics_events_action (action),
    INDEX idx_analytics_events_created_at (created_at),
    INDEX idx_analytics_events_session_id (session_id),
    INDEX idx_analytics_events_metadata USING GIN (metadata)
);

-- =====================================================
-- TABELA DE MÉTRICAS DE PERFORMANCE
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER NOT NULL, -- em millisegundos
    request_size INTEGER DEFAULT 0,
    response_size INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address INET,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_analytics_performance_endpoint (endpoint),
    INDEX idx_analytics_performance_method (method),
    INDEX idx_analytics_performance_status_code (status_code),
    INDEX idx_analytics_performance_created_at (created_at),
    INDEX idx_analytics_performance_organization_id (organization_id),
    INDEX idx_analytics_performance_response_time (response_time)
);

-- =====================================================
-- TABELA DE COMPORTAMENTO DO USUÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_user_behavior (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID,
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'click', 'scroll', 'form_submit', etc.
    page_url TEXT NOT NULL,
    element_id VARCHAR(255),
    element_class VARCHAR(255),
    element_text TEXT,
    scroll_depth INTEGER DEFAULT 0,
    time_on_page INTEGER DEFAULT 0, -- em segundos
    referrer TEXT,
    exit_page BOOLEAN DEFAULT FALSE,
    conversion_event BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_analytics_user_behavior_user_id (user_id),
    INDEX idx_analytics_user_behavior_session_id (session_id),
    INDEX idx_analytics_user_behavior_event_type (event_type),
    INDEX idx_analytics_user_behavior_page_url (page_url),
    INDEX idx_analytics_user_behavior_created_at (created_at),
    INDEX idx_analytics_user_behavior_organization_id (organization_id)
);

-- =====================================================
-- TABELA DE RELATÓRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    format VARCHAR(20) NOT NULL, -- 'json', 'html', 'pdf'
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'running', 'completed', 'failed'
    organization_id UUID,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipients TEXT[], -- emails para envio
    schedule_cron VARCHAR(100), -- expressão cron para agendamento
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    file_path TEXT,
    file_size INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_analytics_reports_type (type),
    INDEX idx_analytics_reports_status (status),
    INDEX idx_analytics_reports_organization_id (organization_id),
    INDEX idx_analytics_reports_created_by (created_by),
    INDEX idx_analytics_reports_next_run_at (next_run_at)
);

-- =====================================================
-- TABELA DE REGRAS DE ALERTA
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'error_rate', 'response_time', 'user_activity', etc.
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    organization_id UUID,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    condition JSONB NOT NULL, -- {metric, operator, threshold, timeWindow}
    channels TEXT[] NOT NULL, -- ['email', 'webhook', 'sms']
    recipients TEXT[], -- emails, webhooks, phone numbers
    cooldown INTEGER DEFAULT 300, -- segundos entre alertas
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_analytics_alert_rules_type (type),
    INDEX idx_analytics_alert_rules_severity (severity),
    INDEX idx_analytics_alert_rules_is_active (is_active),
    INDEX idx_analytics_alert_rules_organization_id (organization_id),
    INDEX idx_analytics_alert_rules_last_triggered_at (last_triggered_at)
);

-- =====================================================
-- TABELA DE ALERTAS GERADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES analytics_alert_rules(id) ON DELETE CASCADE,
    organization_id UUID,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
    metric_value DECIMAL,
    threshold_value DECIMAL,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_analytics_alerts_rule_id (rule_id),
    INDEX idx_analytics_alerts_status (status),
    INDEX idx_analytics_alerts_severity (severity),
    INDEX idx_analytics_alerts_organization_id (organization_id),
    INDEX idx_analytics_alerts_created_at (created_at)
);

-- =====================================================
-- TABELA DE HISTÓRICO DE EXPORTAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID,
    format VARCHAR(20) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    file_path TEXT,
    file_size INTEGER DEFAULT 0,
    record_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    filters JSONB DEFAULT '{}',
    error_message TEXT,
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_analytics_exports_user_id (user_id),
    INDEX idx_analytics_exports_status (status),
    INDEX idx_analytics_exports_format (format),
    INDEX idx_analytics_exports_data_type (data_type),
    INDEX idx_analytics_exports_organization_id (organization_id),
    INDEX idx_analytics_exports_created_at (created_at)
);

-- =====================================================
-- TABELA DE SESSÕES DE USUÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    landing_page TEXT,
    exit_page TEXT,
    page_views INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0, -- em segundos
    is_bounce BOOLEAN DEFAULT FALSE,
    conversion_events INTEGER DEFAULT 0,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Índices para performance
    INDEX idx_analytics_sessions_session_id (session_id),
    INDEX idx_analytics_sessions_user_id (user_id),
    INDEX idx_analytics_sessions_organization_id (organization_id),
    INDEX idx_analytics_sessions_started_at (started_at),
    INDEX idx_analytics_sessions_is_bounce (is_bounce)
);

-- =====================================================
-- VIEWS PARA RELATÓRIOS E DASHBOARDS
-- =====================================================

-- View para métricas diárias
CREATE OR REPLACE VIEW analytics_daily_metrics AS
SELECT 
    DATE(created_at) as date,
    organization_id,
    COUNT(*) as total_events,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(CASE WHEN category = 'error' THEN 1 END) as error_events,
    AVG(CASE WHEN value > 0 THEN value END) as avg_value
FROM analytics_events
GROUP BY DATE(created_at), organization_id
ORDER BY date DESC;

-- View para métricas de performance
CREATE OR REPLACE VIEW analytics_performance_summary AS
SELECT 
    DATE(created_at) as date,
    organization_id,
    endpoint,
    COUNT(*) as request_count,
    AVG(response_time) as avg_response_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
    (COUNT(CASE WHEN status_code >= 400 THEN 1 END)::FLOAT / COUNT(*) * 100) as error_rate
FROM analytics_performance
GROUP BY DATE(created_at), organization_id, endpoint
ORDER BY date DESC, request_count DESC;

-- View para análise de comportamento
CREATE OR REPLACE VIEW analytics_user_engagement AS
SELECT 
    DATE(created_at) as date,
    organization_id,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT session_id) as total_sessions,
    AVG(time_on_page) as avg_time_on_page,
    COUNT(CASE WHEN conversion_event = TRUE THEN 1 END) as conversions,
    (COUNT(CASE WHEN conversion_event = TRUE THEN 1 END)::FLOAT / COUNT(DISTINCT session_id) * 100) as conversion_rate
FROM analytics_user_behavior
GROUP BY DATE(created_at), organization_id
ORDER BY date DESC;

-- =====================================================
-- FUNÇÕES PARA LIMPEZA DE DADOS ANTIGOS
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * retention_days;
    
    -- Limpar eventos antigos
    DELETE FROM analytics_events WHERE created_at < cutoff_date;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Limpar métricas de performance antigas
    DELETE FROM analytics_performance WHERE created_at < cutoff_date;
    
    -- Limpar comportamento de usuário antigo
    DELETE FROM analytics_user_behavior WHERE created_at < cutoff_date;
    
    -- Limpar sessões antigas
    DELETE FROM analytics_sessions WHERE started_at < cutoff_date;
    
    -- Limpar exportações expiradas
    DELETE FROM analytics_exports WHERE expires_at < NOW();
    
    -- Limpar alertas resolvidos antigos (manter por 30 dias)
    DELETE FROM analytics_alerts 
    WHERE status = 'resolved' 
    AND resolved_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas que têm updated_at
CREATE TRIGGER update_analytics_reports_updated_at
    BEFORE UPDATE ON analytics_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_alert_rules_updated_at
    BEFORE UPDATE ON analytics_alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados
CREATE POLICY "Users can view their own analytics data" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT user_id FROM user_organizations WHERE organization_id = analytics_events.organization_id
    ));

CREATE POLICY "Users can insert their own analytics data" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IN (
        SELECT user_id FROM user_organizations WHERE organization_id = analytics_events.organization_id
    ));

-- Políticas similares para outras tabelas
CREATE POLICY "Users can view organization performance data" ON analytics_performance
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM user_organizations WHERE organization_id = analytics_performance.organization_id
    ));

CREATE POLICY "Users can view organization behavior data" ON analytics_user_behavior
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT user_id FROM user_organizations WHERE organization_id = analytics_user_behavior.organization_id
    ));

-- Políticas para relatórios (apenas criadores e membros da organização)
CREATE POLICY "Users can manage their reports" ON analytics_reports
    FOR ALL USING (auth.uid() = created_by OR auth.uid() IN (
        SELECT user_id FROM user_organizations WHERE organization_id = analytics_reports.organization_id
    ));

-- Políticas para alertas
CREATE POLICY "Users can manage organization alerts" ON analytics_alert_rules
    FOR ALL USING (auth.uid() = created_by OR auth.uid() IN (
        SELECT user_id FROM user_organizations WHERE organization_id = analytics_alert_rules.organization_id
    ));

CREATE POLICY "Users can view organization alerts" ON analytics_alerts
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM user_organizations WHERE organization_id = analytics_alerts.organization_id
    ));

-- Políticas para exportações
CREATE POLICY "Users can manage their exports" ON analytics_exports
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT user_id FROM user_organizations WHERE organization_id = analytics_exports.organization_id
    ));

-- =====================================================
-- PERMISSÕES PARA ROLES
-- =====================================================

-- Conceder permissões para role anon (para eventos públicos)
GRANT SELECT ON analytics_events TO anon;
GRANT INSERT ON analytics_events TO anon;

-- Conceder permissões para role authenticated
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- DADOS INICIAIS E CONFIGURAÇÕES
-- =====================================================

-- Inserir algumas regras de alerta padrão
INSERT INTO analytics_alert_rules (name, description, type, severity, condition, channels, recipients, is_active) VALUES
('Alta Taxa de Erro', 'Alerta quando a taxa de erro excede 5%', 'error_rate', 'high', 
 '{"metric": "error_rate", "operator": ">", "threshold": 5, "timeWindow": "5m"}', 
 ARRAY['email'], ARRAY['admin@estudioiavideos.com'], true),

('Tempo de Resposta Lento', 'Alerta quando o tempo de resposta excede 2 segundos', 'response_time', 'medium',
 '{"metric": "avg_response_time", "operator": ">", "threshold": 2000, "timeWindow": "10m"}',
 ARRAY['email'], ARRAY['admin@estudioiavideos.com'], true),

('Baixa Atividade de Usuários', 'Alerta quando há menos de 10 usuários ativos por hora', 'user_activity', 'low',
 '{"metric": "active_users", "operator": "<", "threshold": 10, "timeWindow": "1h"}',
 ARRAY['email'], ARRAY['admin@estudioiavideos.com'], true);

-- Comentários para documentação
COMMENT ON TABLE analytics_events IS 'Tabela principal para armazenar todos os eventos de analytics do sistema';
COMMENT ON TABLE analytics_performance IS 'Métricas de performance das APIs e endpoints';
COMMENT ON TABLE analytics_user_behavior IS 'Dados de comportamento e interação dos usuários';
COMMENT ON TABLE analytics_reports IS 'Configuração e histórico de relatórios automatizados';
COMMENT ON TABLE analytics_alert_rules IS 'Regras configuradas para alertas automáticos';
COMMENT ON TABLE analytics_alerts IS 'Alertas gerados pelo sistema baseados nas regras';
COMMENT ON TABLE analytics_exports IS 'Histórico de exportações de dados realizadas';
COMMENT ON TABLE analytics_sessions IS 'Sessões de usuário para análise de comportamento';

-- Finalização
SELECT 'Sistema de Analytics instalado com sucesso!' as status;