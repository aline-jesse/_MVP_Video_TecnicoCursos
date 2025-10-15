-- Migration: Criar tabela de métricas
-- Armazena métricas de performance e uso da aplicação

-- Criar tipo ENUM para tipos de métricas
CREATE TYPE metric_type AS ENUM (
  'api_response_time',
  'upload_duration',
  'tts_generation_time',
  'render_duration',
  'queue_wait_time',
  'error_rate',
  'memory_usage',
  'cpu_usage'
);

-- Criar tabela de métricas
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type metric_type NOT NULL,
  value NUMERIC NOT NULL,
  unit VARCHAR(20) NOT NULL,
  metadata JSONB DEFAULT '{}',
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para consultas rápidas
  INDEX idx_metrics_type (type),
  INDEX idx_metrics_created_at (created_at DESC),
  INDEX idx_metrics_type_created_at (type, created_at DESC),
  INDEX idx_metrics_tags USING GIN (tags)
);

-- Habilitar RLS
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Política: Admin pode ler todas as métricas
CREATE POLICY "Admin pode ler métricas"
  ON metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Política: Sistema pode inserir métricas
CREATE POLICY "Sistema pode inserir métricas"
  ON metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Criar função para cleanup automático de métricas antigas
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM metrics
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Criar índice parcial para métricas recentes (últimos 7 dias)
CREATE INDEX idx_metrics_recent
  ON metrics (type, created_at DESC)
  WHERE created_at > NOW() - INTERVAL '7 days';

-- Comentários
COMMENT ON TABLE metrics IS 'Armazena métricas de performance e uso da aplicação';
COMMENT ON COLUMN metrics.type IS 'Tipo de métrica (enum)';
COMMENT ON COLUMN metrics.value IS 'Valor numérico da métrica';
COMMENT ON COLUMN metrics.unit IS 'Unidade de medida (ms, bytes, count, etc)';
COMMENT ON COLUMN metrics.metadata IS 'Metadados adicionais em formato JSON';
COMMENT ON COLUMN metrics.tags IS 'Tags para filtragem e agregação';
