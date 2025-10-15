# 📋 SQL Schema - Database Real

```sql
-- ===================================
-- SISTEMA DE AUTENTICAÇÃO E USUÁRIOS
-- ===================================

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'enterprise')),
  credits INTEGER NOT NULL DEFAULT 100,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para perfis
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_tier);

-- RLS para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================
-- SISTEMA DE ARQUIVOS
-- ===================================

-- Tabela de arquivos
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('presentation', 'image', 'video', 'audio', 'document')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para files
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_type ON files(file_type);
CREATE INDEX idx_files_created_at ON files(created_at DESC);

-- RLS para files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files" ON files
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own files" ON files
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own files" ON files
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own files" ON files
  FOR DELETE USING (user_id = auth.uid());

-- ===================================
-- SISTEMA DE PROJETOS
-- ===================================

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'rendering', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- RLS para projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (user_id = auth.uid());

-- ===================================
-- SISTEMA DE SLIDES
-- ===================================

-- Tabela de slides
CREATE TABLE IF NOT EXISTS slides (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  notes TEXT,
  layout TEXT NOT NULL DEFAULT 'default',
  duration INTEGER NOT NULL DEFAULT 30,
  audio_url TEXT,
  video_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, index)
);

-- Índices para slides
CREATE INDEX idx_slides_project_id ON slides(project_id);
CREATE INDEX idx_slides_index ON slides(project_id, index);

-- RLS para slides
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view slides of own projects" ON slides
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = slides.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert slides to own projects" ON slides
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = slides.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update slides of own projects" ON slides
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = slides.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete slides of own projects" ON slides
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = slides.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ===================================
-- SISTEMA DE RENDERIZAÇÃO
-- ===================================

-- Tabela de jobs de renderização
CREATE TABLE IF NOT EXISTS render_jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  output_url TEXT,
  error_message TEXT,
  settings JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para render_jobs
CREATE INDEX idx_render_jobs_project_id ON render_jobs(project_id);
CREATE INDEX idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);
CREATE INDEX idx_render_jobs_created_at ON render_jobs(created_at DESC);

-- RLS para render_jobs
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own render jobs" ON render_jobs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own render jobs" ON render_jobs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own render jobs" ON render_jobs
  FOR UPDATE USING (user_id = auth.uid());

-- ===================================
-- SISTEMA DE ANALYTICS
-- ===================================

-- Tabela de eventos de analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para analytics_events
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- RLS para analytics_events (apenas inserção permitida)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events" ON analytics_events
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can view own events" ON analytics_events
  FOR SELECT USING (user_id = auth.uid());

-- ===================================
-- FUNÇÕES E TRIGGERS
-- ===================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at
  BEFORE UPDATE ON slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_render_jobs_updated_at
  BEFORE UPDATE ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- SISTEMA DE TTS (TEXT-TO-SPEECH)
-- ===================================

-- Tabela de cache de TTS
CREATE TABLE IF NOT EXISTS tts_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT NOT NULL UNIQUE,
  text TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('elevenlabs', 'azure')),
  voice_id TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  characters INTEGER NOT NULL,
  duration NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para TTS cache
CREATE INDEX idx_tts_cache_key ON tts_cache(cache_key);
CREATE INDEX idx_tts_cache_provider ON tts_cache(provider);
CREATE INDEX idx_tts_cache_voice ON tts_cache(voice_id);

-- RLS para TTS cache (público para leitura, apenas sistema pode escrever)
ALTER TABLE tts_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read TTS cache" ON tts_cache
  FOR SELECT USING (true);

-- Adicionar campos de TTS aos user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS tts_credits_used INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tts_credits_limit INTEGER NOT NULL DEFAULT 10000;

-- ===================================
-- STORAGE BUCKETS
-- ===================================

-- Criar buckets de storage (executar no dashboard do Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

-- Políticas de storage para uploads
-- CREATE POLICY "Users can upload own files" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own files" ON storage.objects
--   FOR SELECT USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own files" ON storage.objects
--   FOR DELETE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas de storage para áudio
-- CREATE POLICY "Anyone can view audio" ON storage.objects
--   FOR SELECT USING (bucket_id = 'audio');

-- Políticas de storage para vídeos
-- CREATE POLICY "Anyone can view videos" ON storage.objects
--   FOR SELECT USING (bucket_id = 'videos');

-- View de estatísticas de usuário
CREATE OR REPLACE VIEW user_stats AS
SELECT
  up.id,
  up.email,
  up.credits,
  up.subscription_tier,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT f.id) as total_files,
  COUNT(DISTINCT rj.id) as total_renders,
  COUNT(DISTINCT CASE WHEN rj.status = 'completed' THEN rj.id END) as completed_renders,
  COALESCE(SUM(f.size), 0) as total_storage_used
FROM user_profiles up
LEFT JOIN projects p ON p.user_id = up.id
LEFT JOIN files f ON f.user_id = up.id
LEFT JOIN render_jobs rj ON rj.user_id = up.id
GROUP BY up.id, up.email, up.credits, up.subscription_tier;

-- View de projetos com detalhes
CREATE OR REPLACE VIEW projects_detailed AS
SELECT
  p.*,
  up.email as user_email,
  COUNT(DISTINCT s.id) as slide_count,
  COUNT(DISTINCT f.id) as file_count,
  COUNT(DISTINCT rj.id) as render_count,
  MAX(rj.completed_at) as last_render_at
FROM projects p
JOIN user_profiles up ON up.id = p.user_id
LEFT JOIN slides s ON s.project_id = p.id
LEFT JOIN files f ON f.project_id = p.id
LEFT JOIN render_jobs rj ON rj.project_id = p.id
GROUP BY p.id, up.email;

-- ===================================
-- STORAGE BUCKETS
-- ===================================

-- Criar bucket para uploads (executar no dashboard do Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Políticas de storage
-- CREATE POLICY "Users can upload own files" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own files" ON storage.objects
--   FOR SELECT USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own files" ON storage.objects
--   FOR DELETE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```
