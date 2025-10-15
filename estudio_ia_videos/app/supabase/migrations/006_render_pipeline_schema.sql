-- ==========================================
-- 🎬 RENDER PIPELINE SCHEMA MIGRATION
-- ==========================================
-- Creates comprehensive render pipeline tables and functions
-- Version: 006
-- Created: 2024-01-20

-- Create enum types for render pipeline
CREATE TYPE render_job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE render_job_type AS ENUM ('video', 'audio', 'image', 'animation', 'composite');
CREATE TYPE render_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE quality_preset AS ENUM ('draft', 'standard', 'high', 'ultra');

-- ==========================================
-- RENDER JOBS TABLE
-- ==========================================
CREATE TABLE render_jobs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL,
    status render_job_status NOT NULL DEFAULT 'pending',
    priority render_priority NOT NULL DEFAULT 'normal',
    type render_job_type NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}',
    output_url TEXT,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    estimated_duration INTEGER, -- in seconds
    actual_duration INTEGER, -- in seconds
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    resource_usage JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- ==========================================
-- USER RENDER SETTINGS TABLE
-- ==========================================
CREATE TABLE user_render_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{
        "auto_retry": true,
        "max_retries": 3,
        "priority_boost": false,
        "quality_preset": "standard",
        "notifications": {
            "on_completion": true,
            "on_failure": true,
            "on_queue_position": false
        },
        "resource_limits": {
            "max_cpu_usage": 80,
            "max_memory_usage": 70,
            "max_duration": 3600
        }
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ==========================================
-- RENDER QUEUE HISTORY TABLE
-- ==========================================
CREATE TABLE render_queue_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    queue_length INTEGER NOT NULL DEFAULT 0,
    processing_jobs INTEGER NOT NULL DEFAULT 0,
    completed_jobs_last_hour INTEGER NOT NULL DEFAULT 0,
    failed_jobs_last_hour INTEGER NOT NULL DEFAULT 0,
    average_wait_time INTEGER NOT NULL DEFAULT 0, -- in seconds
    system_load JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- RENDER PERFORMANCE METRICS TABLE
-- ==========================================
CREATE TABLE render_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    render_job_id TEXT NOT NULL REFERENCES render_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    cpu_usage_avg DECIMAL(5,2),
    memory_usage_avg DECIMAL(5,2),
    gpu_usage_avg DECIMAL(5,2),
    storage_used BIGINT, -- in bytes
    bandwidth_used BIGINT, -- in bytes
    cost_estimate DECIMAL(10,4),
    quality_score DECIMAL(3,2), -- 0.00 to 1.00
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Render jobs indexes
CREATE INDEX idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_project_id ON render_jobs(project_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);
CREATE INDEX idx_render_jobs_priority ON render_jobs(priority);
CREATE INDEX idx_render_jobs_type ON render_jobs(type);
CREATE INDEX idx_render_jobs_created_at ON render_jobs(created_at);
CREATE INDEX idx_render_jobs_status_priority ON render_jobs(status, priority);
CREATE INDEX idx_render_jobs_user_status ON render_jobs(user_id, status);

-- User render settings indexes
CREATE INDEX idx_user_render_settings_user_id ON user_render_settings(user_id);

-- Render queue history indexes
CREATE INDEX idx_render_queue_history_timestamp ON render_queue_history(timestamp);

-- Render performance metrics indexes
CREATE INDEX idx_render_performance_metrics_render_job_id ON render_performance_metrics(render_job_id);
CREATE INDEX idx_render_performance_metrics_user_id ON render_performance_metrics(user_id);
CREATE INDEX idx_render_performance_metrics_start_time ON render_performance_metrics(start_time);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Render jobs updated_at trigger
CREATE OR REPLACE FUNCTION update_render_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Set started_at when status changes to processing
    IF OLD.status != 'processing' AND NEW.status = 'processing' THEN
        NEW.started_at = NOW();
    END IF;
    
    -- Set completed_at when status changes to completed or failed
    IF OLD.status NOT IN ('completed', 'failed') AND NEW.status IN ('completed', 'failed') THEN
        NEW.completed_at = NOW();
        
        -- Calculate actual duration if started_at exists
        IF NEW.started_at IS NOT NULL THEN
            NEW.actual_duration = EXTRACT(EPOCH FROM (NOW() - NEW.started_at))::INTEGER;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_render_jobs_updated_at
    BEFORE UPDATE ON render_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_render_jobs_updated_at();

-- User render settings updated_at trigger
CREATE OR REPLACE FUNCTION update_user_render_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_render_settings_updated_at
    BEFORE UPDATE ON user_render_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_render_settings_updated_at();

-- ==========================================
-- UTILITY FUNCTIONS
-- ==========================================

-- Function to get user render statistics
CREATE OR REPLACE FUNCTION get_user_render_stats(p_user_id UUID, p_time_range INTERVAL DEFAULT INTERVAL '7 days')
RETURNS TABLE (
    total_renders BIGINT,
    successful_renders BIGINT,
    failed_renders BIGINT,
    success_rate DECIMAL,
    average_render_time DECIMAL,
    total_render_time BIGINT,
    queue_position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'completed') as successful,
            COUNT(*) FILTER (WHERE status = 'failed') as failed,
            AVG(actual_duration) FILTER (WHERE status = 'completed') as avg_duration,
            SUM(actual_duration) FILTER (WHERE status = 'completed') as total_duration
        FROM render_jobs 
        WHERE user_id = p_user_id 
        AND created_at >= NOW() - p_time_range
    ),
    queue_pos AS (
        SELECT 
            ROW_NUMBER() OVER (ORDER BY priority DESC, created_at ASC) as position
        FROM render_jobs 
        WHERE user_id = p_user_id 
        AND status = 'pending'
        LIMIT 1
    )
    SELECT 
        us.total,
        us.successful,
        us.failed,
        CASE 
            WHEN us.total > 0 THEN ROUND((us.successful::DECIMAL / us.total::DECIMAL) * 100, 2)
            ELSE 0
        END,
        ROUND(COALESCE(us.avg_duration, 0), 2),
        COALESCE(us.total_duration, 0),
        COALESCE(qp.position::INTEGER, 0)
    FROM user_stats us
    CROSS JOIN queue_pos qp;
END;
$$ LANGUAGE plpgsql;

-- Function to get render queue statistics
CREATE OR REPLACE FUNCTION get_render_queue_stats()
RETURNS TABLE (
    pending_jobs BIGINT,
    processing_jobs BIGINT,
    completed_last_hour BIGINT,
    failed_last_hour BIGINT,
    average_wait_time DECIMAL,
    estimated_completion TIMESTAMPTZ
) AS $$
DECLARE
    avg_processing_time DECIMAL;
    pending_count BIGINT;
BEGIN
    -- Get current queue counts
    SELECT 
        COUNT(*) FILTER (WHERE status = 'pending'),
        COUNT(*) FILTER (WHERE status = 'processing'),
        COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= NOW() - INTERVAL '1 hour'),
        COUNT(*) FILTER (WHERE status = 'failed' AND updated_at >= NOW() - INTERVAL '1 hour')
    INTO pending_jobs, processing_jobs, completed_last_hour, failed_last_hour
    FROM render_jobs;
    
    -- Calculate average processing time from recent completed jobs
    SELECT AVG(actual_duration)
    INTO avg_processing_time
    FROM render_jobs 
    WHERE status = 'completed' 
    AND completed_at >= NOW() - INTERVAL '24 hours'
    AND actual_duration IS NOT NULL;
    
    -- Calculate average wait time (time from created to started)
    SELECT AVG(EXTRACT(EPOCH FROM (started_at - created_at)))
    INTO average_wait_time
    FROM render_jobs 
    WHERE status IN ('processing', 'completed')
    AND started_at IS NOT NULL
    AND created_at >= NOW() - INTERVAL '24 hours';
    
    -- Estimate completion time
    pending_count := pending_jobs;
    IF avg_processing_time IS NOT NULL AND pending_count > 0 THEN
        estimated_completion := NOW() + (pending_count * avg_processing_time * INTERVAL '1 second');
    ELSE
        estimated_completion := NOW();
    END IF;
    
    RETURN QUERY SELECT 
        pending_jobs,
        processing_jobs,
        completed_last_hour,
        failed_last_hour,
        ROUND(COALESCE(average_wait_time, 0), 2),
        estimated_completion;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- SAMPLE DATA (Optional - for development)
-- ==========================================

-- Insert sample render queue history for the last 24 hours
INSERT INTO render_queue_history (timestamp, queue_length, processing_jobs, completed_jobs_last_hour, failed_jobs_last_hour, average_wait_time, system_load)
SELECT 
    NOW() - (interval '1 hour' * generate_series(0, 23)),
    (random() * 50)::INTEGER,
    (random() * 10)::INTEGER,
    (random() * 20)::INTEGER,
    (random() * 3)::INTEGER,
    (random() * 300)::INTEGER,
    jsonb_build_object(
        'cpu_usage', (random() * 100)::INTEGER,
        'memory_usage', (random() * 100)::INTEGER,
        'gpu_usage', (random() * 100)::INTEGER
    );

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE render_jobs IS 'Stores all render job information with status tracking and resource usage';
COMMENT ON TABLE user_render_settings IS 'User-specific render preferences and settings';
COMMENT ON TABLE render_queue_history IS 'Historical data for render queue performance monitoring';
COMMENT ON TABLE render_performance_metrics IS 'Detailed performance metrics for completed render jobs';

COMMENT ON FUNCTION get_user_render_stats IS 'Returns comprehensive render statistics for a specific user';
COMMENT ON FUNCTION get_render_queue_stats IS 'Returns current render queue statistics and estimates';