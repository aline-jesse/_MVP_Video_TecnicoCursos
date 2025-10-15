-- ==========================================
-- 🔌 External APIs Schema Migration
-- ==========================================
-- Creates tables and policies for external API integrations
-- Supports TTS providers, media libraries, and compliance services

-- Create enum types for external APIs
CREATE TYPE external_api_type AS ENUM ('tts', 'media', 'compliance');
CREATE TYPE external_provider_type AS ENUM (
  'azure', 'google', 'openai', 'elevenlabs',
  'unsplash', 'pexels', 'pixabay', 'shutterstock',
  'accessibility', 'content_rating', 'copyright', 'privacy'
);

-- ==========================================
-- 📋 User External API Configurations Table
-- ==========================================
CREATE TABLE user_external_api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_type external_api_type NOT NULL,
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  provider_type external_provider_type NOT NULL,
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, api_type, provider_id)
);

-- ==========================================
-- 📊 External API Usage Tracking Table
-- ==========================================
CREATE TABLE external_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_type external_api_type NOT NULL,
  provider_id TEXT NOT NULL,
  requests_made INTEGER DEFAULT 0,
  characters_used INTEGER DEFAULT 0,
  downloads_made INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 🎵 TTS Generation History Table
-- ==========================================
CREATE TABLE tts_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  text_content TEXT NOT NULL,
  voice_model TEXT NOT NULL,
  language TEXT DEFAULT 'en-US',
  audio_url TEXT,
  duration INTEGER, -- in seconds
  file_size INTEGER, -- in bytes
  cost DECIMAL(10,4) DEFAULT 0,
  status TEXT DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 🖼️ Media Download History Table
-- ==========================================
CREATE TABLE media_download_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  media_type TEXT NOT NULL, -- photo, illustration, vector
  title TEXT,
  author_name TEXT,
  download_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  cost DECIMAL(10,4) DEFAULT 0,
  license_type TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ✅ Compliance Check History Table
-- ==========================================
CREATE TABLE compliance_check_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_url TEXT,
  content_hash TEXT, -- for tracking duplicate checks
  check_types TEXT[] NOT NULL,
  overall_score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  results JSONB NOT NULL,
  cost DECIMAL(10,4) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 📈 API Usage Statistics View
-- ==========================================
CREATE VIEW api_usage_stats AS
SELECT 
  user_id,
  api_type,
  provider_id,
  DATE_TRUNC('day', created_at) as usage_date,
  COUNT(*) as total_requests,
  SUM(characters_used) as total_characters,
  SUM(downloads_made) as total_downloads,
  SUM(cost) as total_cost,
  AVG(cost) as avg_cost_per_request
FROM external_api_usage
GROUP BY user_id, api_type, provider_id, DATE_TRUNC('day', created_at);

-- ==========================================
-- 🔍 Indexes for Performance
-- ==========================================
-- User external API configs indexes
CREATE INDEX idx_user_external_api_configs_user_id ON user_external_api_configs(user_id);
CREATE INDEX idx_user_external_api_configs_api_type ON user_external_api_configs(api_type);
CREATE INDEX idx_user_external_api_configs_enabled ON user_external_api_configs(enabled);

-- External API usage indexes
CREATE INDEX idx_external_api_usage_user_id ON external_api_usage(user_id);
CREATE INDEX idx_external_api_usage_api_type ON external_api_usage(api_type);
CREATE INDEX idx_external_api_usage_provider_id ON external_api_usage(provider_id);
CREATE INDEX idx_external_api_usage_created_at ON external_api_usage(created_at);
CREATE INDEX idx_external_api_usage_user_date ON external_api_usage(user_id, created_at);

-- TTS generation history indexes
CREATE INDEX idx_tts_generation_history_user_id ON tts_generation_history(user_id);
CREATE INDEX idx_tts_generation_history_provider_id ON tts_generation_history(provider_id);
CREATE INDEX idx_tts_generation_history_created_at ON tts_generation_history(created_at);

-- Media download history indexes
CREATE INDEX idx_media_download_history_user_id ON media_download_history(user_id);
CREATE INDEX idx_media_download_history_provider_id ON media_download_history(provider_id);
CREATE INDEX idx_media_download_history_media_type ON media_download_history(media_type);
CREATE INDEX idx_media_download_history_created_at ON media_download_history(created_at);

-- Compliance check history indexes
CREATE INDEX idx_compliance_check_history_user_id ON compliance_check_history(user_id);
CREATE INDEX idx_compliance_check_history_content_type ON compliance_check_history(content_type);
CREATE INDEX idx_compliance_check_history_content_hash ON compliance_check_history(content_hash);
CREATE INDEX idx_compliance_check_history_created_at ON compliance_check_history(created_at);

-- ==========================================
-- ⏰ Triggers for Updated At
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_external_api_configs_updated_at
  BEFORE UPDATE ON user_external_api_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 📊 Utility Functions
-- ==========================================

-- Function to get user API usage summary
CREATE OR REPLACE FUNCTION get_user_api_usage_summary(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  api_type external_api_type,
  provider_id TEXT,
  total_requests BIGINT,
  total_characters BIGINT,
  total_downloads BIGINT,
  total_cost DECIMAL,
  avg_daily_requests DECIMAL,
  last_used TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.api_type,
    u.provider_id,
    COUNT(*)::BIGINT as total_requests,
    COALESCE(SUM(u.characters_used), 0)::BIGINT as total_characters,
    COALESCE(SUM(u.downloads_made), 0)::BIGINT as total_downloads,
    COALESCE(SUM(u.cost), 0)::DECIMAL as total_cost,
    (COUNT(*)::DECIMAL / GREATEST(EXTRACT(DAYS FROM (p_end_date - p_start_date)), 1))::DECIMAL as avg_daily_requests,
    MAX(u.created_at) as last_used
  FROM external_api_usage u
  WHERE u.user_id = p_user_id
    AND u.created_at >= p_start_date
    AND u.created_at <= p_end_date
  GROUP BY u.api_type, u.provider_id
  ORDER BY total_requests DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get API cost breakdown
CREATE OR REPLACE FUNCTION get_api_cost_breakdown(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  api_type external_api_type,
  provider_id TEXT,
  daily_cost DECIMAL,
  usage_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.api_type,
    u.provider_id,
    SUM(u.cost)::DECIMAL as daily_cost,
    u.created_at::DATE as usage_date
  FROM external_api_usage u
  WHERE u.user_id = p_user_id
    AND u.created_at >= p_start_date
    AND u.created_at <= p_end_date
  GROUP BY u.api_type, u.provider_id, u.created_at::DATE
  ORDER BY usage_date DESC, daily_cost DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 📝 Comments for Documentation
-- ==========================================
COMMENT ON TABLE user_external_api_configs IS 'Stores user configurations for external API providers';
COMMENT ON TABLE external_api_usage IS 'Tracks usage statistics for external API calls';
COMMENT ON TABLE tts_generation_history IS 'History of text-to-speech generation requests';
COMMENT ON TABLE media_download_history IS 'History of media downloads from external providers';
COMMENT ON TABLE compliance_check_history IS 'History of compliance checks performed';

COMMENT ON FUNCTION get_user_api_usage_summary IS 'Returns comprehensive usage summary for a user';
COMMENT ON FUNCTION get_api_cost_breakdown IS 'Returns daily cost breakdown by API type and provider';