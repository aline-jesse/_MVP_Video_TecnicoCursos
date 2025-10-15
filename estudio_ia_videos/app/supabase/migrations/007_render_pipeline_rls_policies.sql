-- ==========================================
-- 🎬 RENDER PIPELINE RLS POLICIES
-- ==========================================
-- Creates Row Level Security policies for render pipeline tables
-- Version: 007
-- Created: 2024-01-20

-- ==========================================
-- ENABLE RLS ON ALL RENDER TABLES
-- ==========================================

ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_render_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_queue_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_performance_metrics ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RENDER JOBS POLICIES
-- ==========================================

-- Users can view their own render jobs
CREATE POLICY "Users can view own render jobs" ON render_jobs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own render jobs
CREATE POLICY "Users can create own render jobs" ON render_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own render jobs
CREATE POLICY "Users can update own render jobs" ON render_jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own render jobs
CREATE POLICY "Users can delete own render jobs" ON render_jobs
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all render jobs
CREATE POLICY "Admins can view all render jobs" ON render_jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Admins can update all render jobs (for system management)
CREATE POLICY "Admins can update all render jobs" ON render_jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ==========================================
-- USER RENDER SETTINGS POLICIES
-- ==========================================

-- Users can view their own render settings
CREATE POLICY "Users can view own render settings" ON user_render_settings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own render settings
CREATE POLICY "Users can create own render settings" ON user_render_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own render settings
CREATE POLICY "Users can update own render settings" ON user_render_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own render settings
CREATE POLICY "Users can delete own render settings" ON user_render_settings
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RENDER QUEUE HISTORY POLICIES
-- ==========================================

-- Authenticated users can view render queue history (for dashboard analytics)
CREATE POLICY "Authenticated users can view render queue history" ON render_queue_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can insert render queue history
CREATE POLICY "Admins can insert render queue history" ON render_queue_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Only admins can update render queue history
CREATE POLICY "Admins can update render queue history" ON render_queue_history
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Only admins can delete render queue history
CREATE POLICY "Admins can delete render queue history" ON render_queue_history
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ==========================================
-- RENDER PERFORMANCE METRICS POLICIES
-- ==========================================

-- Users can view their own render performance metrics
CREATE POLICY "Users can view own render performance metrics" ON render_performance_metrics
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert render performance metrics for any user
CREATE POLICY "System can insert render performance metrics" ON render_performance_metrics
    FOR INSERT WITH CHECK (true);

-- Users can update their own render performance metrics
CREATE POLICY "Users can update own render performance metrics" ON render_performance_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own render performance metrics
CREATE POLICY "Users can delete own render performance metrics" ON render_performance_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all render performance metrics
CREATE POLICY "Admins can view all render performance metrics" ON render_performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ==========================================
-- GRANT PERMISSIONS TO ROLES
-- ==========================================

-- Grant permissions to anon role (for public access if needed)
GRANT SELECT ON render_queue_history TO anon;

-- Grant permissions to authenticated role
GRANT ALL PRIVILEGES ON render_jobs TO authenticated;
GRANT ALL PRIVILEGES ON user_render_settings TO authenticated;
GRANT SELECT ON render_queue_history TO authenticated;
GRANT ALL PRIVILEGES ON render_performance_metrics TO authenticated;

-- Grant permissions to service_role (for server-side operations)
GRANT ALL PRIVILEGES ON render_jobs TO service_role;
GRANT ALL PRIVILEGES ON user_render_settings TO service_role;
GRANT ALL PRIVILEGES ON render_queue_history TO service_role;
GRANT ALL PRIVILEGES ON render_performance_metrics TO service_role;

-- ==========================================
-- ADDITIONAL SECURITY FUNCTIONS
-- ==========================================

-- Function to check if user can access render job
CREATE OR REPLACE FUNCTION can_access_render_job(job_id TEXT, requesting_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    job_user_id UUID;
    is_admin BOOLEAN;
BEGIN
    -- Get the job owner
    SELECT user_id INTO job_user_id
    FROM render_jobs
    WHERE id = job_id;
    
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = requesting_user_id 
        AND raw_user_meta_data->>'role' = 'admin'
    ) INTO is_admin;
    
    -- Return true if user owns the job or is admin
    RETURN (job_user_id = requesting_user_id) OR is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can modify render settings
CREATE OR REPLACE FUNCTION can_modify_render_settings(settings_user_id UUID, requesting_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = requesting_user_id 
        AND raw_user_meta_data->>'role' = 'admin'
    ) INTO is_admin;
    
    -- Return true if user owns the settings or is admin
    RETURN (settings_user_id = requesting_user_id) OR is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- AUDIT TRIGGERS FOR SECURITY
-- ==========================================

-- Create audit log table for render operations
CREATE TABLE IF NOT EXISTS render_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id UUID,
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE render_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view render audit logs" ON render_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant permissions on audit log
GRANT SELECT ON render_audit_log TO authenticated;
GRANT ALL PRIVILEGES ON render_audit_log TO service_role;

-- Audit trigger function
CREATE OR REPLACE FUNCTION render_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO render_audit_log (table_name, operation, user_id, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER render_jobs_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON render_jobs
    FOR EACH ROW EXECUTE FUNCTION render_audit_trigger();

CREATE TRIGGER user_render_settings_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_render_settings
    FOR EACH ROW EXECUTE FUNCTION render_audit_trigger();

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON POLICY "Users can view own render jobs" ON render_jobs IS 'Allows users to view only their own render jobs';
COMMENT ON POLICY "Admins can view all render jobs" ON render_jobs IS 'Allows administrators to view all render jobs for system management';
COMMENT ON POLICY "Authenticated users can view render queue history" ON render_queue_history IS 'Allows authenticated users to view queue history for dashboard analytics';

COMMENT ON FUNCTION can_access_render_job IS 'Security function to check if a user can access a specific render job';
COMMENT ON FUNCTION can_modify_render_settings IS 'Security function to check if a user can modify render settings';
COMMENT ON FUNCTION render_audit_trigger IS 'Audit trigger function to log all render-related operations';

COMMENT ON TABLE render_audit_log IS 'Audit log for tracking all render pipeline operations for security and compliance';