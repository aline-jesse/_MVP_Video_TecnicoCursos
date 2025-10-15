-- ==========================================
-- 🔐 External APIs RLS Policies Migration
-- ==========================================
-- Creates Row Level Security policies for external API tables

-- ==========================================
-- 🔒 Enable RLS on External API Tables
-- ==========================================
ALTER TABLE user_external_api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tts_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_download_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_check_history ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 👤 User External API Configs Policies
-- ==========================================

-- Users can view their own API configurations
CREATE POLICY "Users can view own API configs"
  ON user_external_api_configs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own API configurations
CREATE POLICY "Users can insert own API configs"
  ON user_external_api_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own API configurations
CREATE POLICY "Users can update own API configs"
  ON user_external_api_configs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own API configurations
CREATE POLICY "Users can delete own API configs"
  ON user_external_api_configs FOR DELETE
  USING (auth.uid() = user_id);



-- ==========================================
-- 📊 External API Usage Policies
-- ==========================================

-- Users can view their own API usage
CREATE POLICY "Users can view own API usage"
  ON external_api_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own API usage records
CREATE POLICY "Users can insert own API usage"
  ON external_api_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- System can insert API usage records (for automated tracking)
CREATE POLICY "System can insert API usage"
  ON external_api_usage FOR INSERT
  WITH CHECK (true);



-- ==========================================
-- 🎵 TTS Generation History Policies
-- ==========================================

-- Users can view their own TTS history
CREATE POLICY "Users can view own TTS history"
  ON tts_generation_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own TTS history
CREATE POLICY "Users can insert own TTS history"
  ON tts_generation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own TTS history
CREATE POLICY "Users can update own TTS history"
  ON tts_generation_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own TTS history
CREATE POLICY "Users can delete own TTS history"
  ON tts_generation_history FOR DELETE
  USING (auth.uid() = user_id);



-- ==========================================
-- 🖼️ Media Download History Policies
-- ==========================================

-- Users can view their own media download history
CREATE POLICY "Users can view own media history"
  ON media_download_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own media download history
CREATE POLICY "Users can insert own media history"
  ON media_download_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own media download history
CREATE POLICY "Users can update own media history"
  ON media_download_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own media download history
CREATE POLICY "Users can delete own media history"
  ON media_download_history FOR DELETE
  USING (auth.uid() = user_id);



-- ==========================================
-- ✅ Compliance Check History Policies
-- ==========================================

-- Users can view their own compliance check history
CREATE POLICY "Users can view own compliance history"
  ON compliance_check_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own compliance check history
CREATE POLICY "Users can insert own compliance history"
  ON compliance_check_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own compliance check history
CREATE POLICY "Users can update own compliance history"
  ON compliance_check_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own compliance check history
CREATE POLICY "Users can delete own compliance history"
  ON compliance_check_history FOR DELETE
  USING (auth.uid() = user_id);



-- ==========================================
-- 🔧 Grant Permissions to Roles
-- ==========================================

-- Grant permissions to anon role (for public access if needed)
GRANT SELECT ON user_external_api_configs TO anon;
GRANT SELECT ON external_api_usage TO anon;
GRANT SELECT ON tts_generation_history TO anon;
GRANT SELECT ON media_download_history TO anon;
GRANT SELECT ON compliance_check_history TO anon;

-- Grant permissions to authenticated role
GRANT ALL PRIVILEGES ON user_external_api_configs TO authenticated;
GRANT ALL PRIVILEGES ON external_api_usage TO authenticated;
GRANT ALL PRIVILEGES ON tts_generation_history TO authenticated;
GRANT ALL PRIVILEGES ON media_download_history TO authenticated;
GRANT ALL PRIVILEGES ON compliance_check_history TO authenticated;

-- Grant permissions to service_role (for system operations)
GRANT ALL PRIVILEGES ON user_external_api_configs TO service_role;
GRANT ALL PRIVILEGES ON external_api_usage TO service_role;
GRANT ALL PRIVILEGES ON tts_generation_history TO service_role;
GRANT ALL PRIVILEGES ON media_download_history TO service_role;
GRANT ALL PRIVILEGES ON compliance_check_history TO service_role;

-- Grant permissions on views
GRANT SELECT ON api_usage_stats TO authenticated;
GRANT SELECT ON api_usage_stats TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_api_usage_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_api_usage_summary TO service_role;
GRANT EXECUTE ON FUNCTION get_api_cost_breakdown TO authenticated;
GRANT EXECUTE ON FUNCTION get_api_cost_breakdown TO service_role;

-- ==========================================
-- 🛡️ Security Functions
-- ==========================================

-- Function to check if user can access API configuration
CREATE OR REPLACE FUNCTION can_access_api_config(config_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- User can access their own configs
  IF auth.uid() = config_user_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can modify API settings
CREATE OR REPLACE FUNCTION can_modify_api_settings(config_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only the owner can modify their settings
  RETURN auth.uid() = config_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 📋 Audit Logging for External APIs
-- ==========================================

-- Create audit log table for external API operations
CREATE TABLE external_api_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE external_api_audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies
CREATE POLICY "Users can view own audit logs"
  ON external_api_audit_log FOR SELECT
  USING (auth.uid() = user_id);



-- Grant permissions on audit log
GRANT SELECT ON external_api_audit_log TO authenticated;
GRANT ALL PRIVILEGES ON external_api_audit_log TO service_role;

-- ==========================================
-- 🔄 Audit Trigger Function
-- ==========================================
CREATE OR REPLACE FUNCTION external_api_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields TEXT[] := '{}';
  field_name TEXT;
BEGIN
  -- Convert OLD and NEW to JSONB
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    new_data := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    -- Find changed fields
    FOR field_name IN SELECT jsonb_object_keys(new_data) LOOP
      IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
        changed_fields := array_append(changed_fields, field_name);
      END IF;
    END LOOP;
  END IF;

  -- Insert audit record
  INSERT INTO external_api_audit_log (
    user_id,
    table_name,
    operation,
    old_values,
    new_values,
    changed_fields,
    created_at
  ) VALUES (
    COALESCE(auth.uid(), (CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END)),
    TG_TABLE_NAME,
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    NOW()
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 📊 Create Audit Triggers
-- ==========================================
CREATE TRIGGER external_api_configs_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_external_api_configs
  FOR EACH ROW EXECUTE FUNCTION external_api_audit_trigger();

CREATE TRIGGER external_api_usage_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON external_api_usage
  FOR EACH ROW EXECUTE FUNCTION external_api_audit_trigger();

-- ==========================================
-- 📝 Comments for Documentation
-- ==========================================
COMMENT ON FUNCTION can_access_api_config IS 'Checks if user can access API configuration';
COMMENT ON FUNCTION can_modify_api_settings IS 'Checks if user can modify API settings';
COMMENT ON TABLE external_api_audit_log IS 'Audit log for external API operations';
COMMENT ON FUNCTION external_api_audit_trigger IS 'Trigger function for auditing external API changes';