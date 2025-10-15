-- =====================================================
-- USER PROFILES AND PREFERENCES SCHEMA
-- =====================================================
-- Created: 2024
-- Description: Complete user management system with profiles,
--              preferences, activity logs, and admin features
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: user_profiles
-- Stores extended user profile information
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Profile Info
  full_name VARCHAR(255),
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  phone VARCHAR(20),
  company VARCHAR(255),
  job_title VARCHAR(100),
  website VARCHAR(500),
  location VARCHAR(255),
  
  -- Social Links
  twitter_handle VARCHAR(100),
  linkedin_url VARCHAR(500),
  github_username VARCHAR(100),
  
  -- Stats
  total_projects INTEGER DEFAULT 0,
  total_videos_rendered INTEGER DEFAULT 0,
  total_tts_generated INTEGER DEFAULT 0,
  total_storage_used BIGINT DEFAULT 0, -- in bytes
  
  -- Settings
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'pt-BR',
  theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(user_id),
  CHECK (theme IN ('light', 'dark', 'auto'))
);

-- Add indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);
CREATE INDEX idx_user_profiles_display_name ON user_profiles(display_name);

-- Add comments
COMMENT ON TABLE user_profiles IS 'Extended user profile information and statistics';
COMMENT ON COLUMN user_profiles.total_storage_used IS 'Total storage used in bytes (sum of all project files)';
COMMENT ON COLUMN user_profiles.theme IS 'UI theme preference: light, dark, or auto';

-- =====================================================
-- TABLE: user_preferences
-- Stores user preferences and settings
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  notify_on_render_complete BOOLEAN DEFAULT true,
  notify_on_render_error BOOLEAN DEFAULT true,
  notify_on_tts_complete BOOLEAN DEFAULT true,
  notify_on_project_shared BOOLEAN DEFAULT true,
  notify_on_new_features BOOLEAN DEFAULT true,
  
  -- Email Digest
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  
  -- Render Preferences
  default_video_resolution VARCHAR(10) DEFAULT '1080p',
  default_video_quality VARCHAR(20) DEFAULT 'high',
  default_video_format VARCHAR(10) DEFAULT 'mp4',
  auto_start_render BOOLEAN DEFAULT false,
  
  -- TTS Preferences
  default_tts_provider VARCHAR(50) DEFAULT 'elevenlabs',
  default_voice_id VARCHAR(100),
  tts_auto_generate BOOLEAN DEFAULT false,
  
  -- UI Preferences
  dashboard_layout VARCHAR(20) DEFAULT 'grid', -- grid, list
  items_per_page INTEGER DEFAULT 12,
  show_tutorial BOOLEAN DEFAULT true,
  compact_mode BOOLEAN DEFAULT false,
  
  -- Privacy
  profile_visibility VARCHAR(20) DEFAULT 'private', -- public, private, friends
  show_activity BOOLEAN DEFAULT true,
  allow_analytics BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  CHECK (default_video_resolution IN ('720p', '1080p', '4k')),
  CHECK (default_video_quality IN ('low', 'medium', 'high')),
  CHECK (default_video_format IN ('mp4', 'webm')),
  CHECK (dashboard_layout IN ('grid', 'list')),
  CHECK (profile_visibility IN ('public', 'private', 'friends'))
);

-- Add indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Add comments
COMMENT ON TABLE user_preferences IS 'User preferences and settings for notifications, rendering, and UI';
COMMENT ON COLUMN user_preferences.default_tts_provider IS 'Default TTS provider: elevenlabs, azure';

-- =====================================================
-- TABLE: user_activity_log
-- Stores user activity for audit and analytics
-- =====================================================
CREATE TYPE activity_type AS ENUM (
  'login',
  'logout',
  'signup',
  'profile_update',
  'password_change',
  'project_create',
  'project_update',
  'project_delete',
  'upload_file',
  'delete_file',
  'tts_generate',
  'tts_delete',
  'render_start',
  'render_complete',
  'render_cancel',
  'render_error',
  'export_video',
  'share_project',
  'unshare_project',
  'settings_update',
  'avatar_update',
  'other'
);

CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type activity_type NOT NULL,
  activity_description TEXT,
  
  -- Context
  resource_type VARCHAR(50), -- project, file, render, etc.
  resource_id UUID,
  
  -- Request Info
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10),
  request_path TEXT,
  
  -- Response Info
  status_code INTEGER,
  error_message TEXT,
  
  -- Performance
  duration_ms INTEGER, -- operation duration in milliseconds
  
  -- Metadata
  metadata JSONB, -- additional context data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes inline
  INDEX idx_activity_user_id (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_activity_created_at (created_at DESC),
  INDEX idx_activity_resource (resource_type, resource_id)
);

-- Composite index for common queries
CREATE INDEX idx_activity_user_type_date ON user_activity_log(user_id, activity_type, created_at DESC);

-- Add comments
COMMENT ON TABLE user_activity_log IS 'Audit log of all user activities for security and analytics';
COMMENT ON COLUMN user_activity_log.duration_ms IS 'Duration of the operation in milliseconds';
COMMENT ON COLUMN user_activity_log.metadata IS 'Additional context data in JSON format';

-- =====================================================
-- TABLE: user_roles
-- Stores user roles for authorization
-- =====================================================
CREATE TYPE user_role AS ENUM (
  'user',       -- Regular user
  'premium',    -- Premium subscriber
  'admin',      -- Administrator
  'super_admin' -- Super administrator
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  
  -- Role Details
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = never expires
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, role)
);

-- Add indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_expires_at ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- Add comments
COMMENT ON TABLE user_roles IS 'User roles and permissions for authorization';
COMMENT ON COLUMN user_roles.expires_at IS 'When the role expires (NULL = never)';

-- =====================================================
-- TABLE: user_sessions
-- Stores active user sessions for security
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session Info
  session_token VARCHAR(500) NOT NULL,
  refresh_token VARCHAR(500),
  
  -- Device Info
  device_name VARCHAR(255),
  device_type VARCHAR(50), -- desktop, mobile, tablet
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_address INET,
  location VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Indexes inline
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_token (session_token),
  INDEX idx_sessions_active (is_active, last_activity_at DESC)
);

-- Add comments
COMMENT ON TABLE user_sessions IS 'Active user sessions for security and device management';
COMMENT ON COLUMN user_sessions.is_active IS 'Whether the session is currently active';

-- =====================================================
-- FUNCTIONS: Auto-update timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS: Create profile on user signup
-- =====================================================

-- Function to create profile and preferences on user signup
CREATE OR REPLACE FUNCTION create_user_profile_and_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO user_profiles (user_id, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  
  -- Create preferences with defaults
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  
  -- Assign default role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_and_preferences();

-- =====================================================
-- FUNCTIONS: Update profile stats
-- =====================================================

-- Function to update profile stats
CREATE OR REPLACE FUNCTION update_profile_stats(
  p_user_id UUID,
  p_stat_type VARCHAR,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  CASE p_stat_type
    WHEN 'projects' THEN
      UPDATE user_profiles
      SET total_projects = total_projects + p_increment
      WHERE user_id = p_user_id;
    WHEN 'videos' THEN
      UPDATE user_profiles
      SET total_videos_rendered = total_videos_rendered + p_increment
      WHERE user_id = p_user_id;
    WHEN 'tts' THEN
      UPDATE user_profiles
      SET total_tts_generated = total_tts_generated + p_increment
      WHERE user_id = p_user_id;
    ELSE
      RAISE EXCEPTION 'Invalid stat type: %', p_stat_type;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate and update storage used
CREATE OR REPLACE FUNCTION update_storage_used(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_storage BIGINT;
BEGIN
  -- Calculate total storage from projects table
  SELECT COALESCE(SUM(file_size), 0)
  INTO v_total_storage
  FROM projects
  WHERE user_id = p_user_id;
  
  -- Update profile
  UPDATE user_profiles
  SET total_storage_used = v_total_storage
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTIONS: Activity logging helper
-- =====================================================

-- Function to log activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type activity_type,
  p_description TEXT DEFAULT NULL,
  p_resource_type VARCHAR DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO user_activity_log (
    user_id,
    activity_type,
    activity_description,
    resource_type,
    resource_id,
    metadata
  )
  VALUES (
    p_user_id,
    p_activity_type,
    p_description,
    p_resource_type,
    p_resource_id,
    p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTIONS: Cleanup old data
-- =====================================================

-- Function to cleanup old activity logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM user_activity_log
  WHERE created_at < NOW() - INTERVAL '90 days'
  RETURNING COUNT(*) INTO v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup inactive sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < NOW()
     OR (is_active = false AND last_activity_at < NOW() - INTERVAL '30 days')
  RETURNING COUNT(*) INTO v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for user_activity_log
CREATE POLICY "Users can view own activity"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity"
  ON user_activity_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all activity"
  ON user_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Policies for user_sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- VIEWS: Convenient access to user data
-- =====================================================

-- View: Complete user profile with role
CREATE OR REPLACE VIEW user_complete_profile AS
SELECT 
  u.id AS user_id,
  u.email,
  u.created_at AS account_created_at,
  p.*,
  r.role,
  r.expires_at AS role_expires_at,
  (
    SELECT COUNT(*)
    FROM user_sessions s
    WHERE s.user_id = u.id
    AND s.is_active = true
    AND s.expires_at > NOW()
  ) AS active_sessions_count
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
LEFT JOIN user_roles r ON u.id = r.user_id;

-- View: User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  user_id,
  COUNT(*) AS total_activities,
  COUNT(DISTINCT DATE(created_at)) AS active_days,
  MAX(created_at) AS last_activity,
  COUNT(*) FILTER (WHERE activity_type = 'login') AS total_logins,
  COUNT(*) FILTER (WHERE activity_type IN ('project_create', 'project_update')) AS project_actions,
  COUNT(*) FILTER (WHERE activity_type LIKE 'render_%') AS render_actions,
  COUNT(*) FILTER (WHERE activity_type LIKE 'tts_%') AS tts_actions
FROM user_activity_log
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- =====================================================
-- INITIAL DATA: Create admin user role helper
-- =====================================================

-- Function to promote user to admin (use carefully!)
CREATE OR REPLACE FUNCTION promote_user_to_admin(p_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_email;
  END IF;
  
  -- Add admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log activity
  PERFORM log_user_activity(
    v_user_id,
    'other',
    'Promoted to admin',
    NULL,
    NULL,
    jsonb_build_object('action', 'promote_to_admin')
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION update_profile_stats IS 'Updates user profile statistics (projects, videos, tts)';
COMMENT ON FUNCTION update_storage_used IS 'Calculates and updates total storage used by user';
COMMENT ON FUNCTION log_user_activity IS 'Helper function to log user activities';
COMMENT ON FUNCTION cleanup_old_activity_logs IS 'Removes activity logs older than 90 days';
COMMENT ON FUNCTION cleanup_inactive_sessions IS 'Removes expired and inactive sessions';
COMMENT ON FUNCTION promote_user_to_admin IS 'Promotes a user to admin role (use with caution)';

COMMENT ON VIEW user_complete_profile IS 'Complete user profile with role and session count';
COMMENT ON VIEW user_activity_summary IS '30-day activity summary per user';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
