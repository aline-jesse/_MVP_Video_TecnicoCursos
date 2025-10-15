-- 🚀 Advanced Projects Schema Migration
-- Enhanced project management with versioning, collaboration, and analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
CREATE TYPE project_type AS ENUM ('pptx', 'template-nr', 'talking-photo', 'custom', 'ai-generated');
CREATE TYPE project_status AS ENUM ('draft', 'in-progress', 'review', 'completed', 'archived', 'error');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE collaboration_role AS ENUM ('owner', 'editor', 'viewer', 'reviewer');
CREATE TYPE analytics_event_type AS ENUM ('project_created', 'project_updated', 'project_deleted', 'project_viewed', 'project_shared', 'project_duplicated', 'version_created', 'collaboration_added');

-- Main projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type project_type NOT NULL,
    status project_status DEFAULT 'draft',
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Enhanced metadata with JSONB for better querying
    metadata JSONB DEFAULT '{
        "tags": [],
        "category": "general",
        "priority": "medium",
        "custom_fields": {}
    }'::jsonb,
    
    -- Versioning
    current_version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Collaboration and sharing
    is_template BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    collaboration_enabled BOOLEAN DEFAULT false,
    
    -- Render settings
    render_settings JSONB DEFAULT '{}'::jsonb,
    
    -- File references
    thumbnail_url TEXT,
    preview_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT projects_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
    CONSTRAINT projects_valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

-- Project versions table for version control
CREATE TABLE IF NOT EXISTS project_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    changes_summary TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(project_id, version_number),
    CONSTRAINT version_number_format CHECK (version_number ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

-- Project collaborators table
CREATE TABLE IF NOT EXISTS project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role collaboration_role DEFAULT 'viewer',
    permissions JSONB DEFAULT '{
        "can_edit": false,
        "can_comment": true,
        "can_share": false,
        "can_export": false
    }'::jsonb,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    
    -- Constraints
    UNIQUE(project_id, user_id)
);

-- Project analytics table for tracking events
CREATE TABLE IF NOT EXISTS project_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type analytics_event_type NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project comments table for collaboration
CREATE TABLE IF NOT EXISTS project_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{
        "position": null,
        "element_id": null,
        "resolved": false
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT comment_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 5000)
);

-- Project tags table for better tag management
CREATE TABLE IF NOT EXISTS project_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6B7280',
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT tag_name_format CHECK (name ~ '^[a-zA-Z0-9\-_\s]+$'),
    CONSTRAINT tag_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Project categories table
CREATE TABLE IF NOT EXISTS project_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6B7280',
    parent_id UUID REFERENCES project_categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_projects_last_accessed ON projects(last_accessed_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_template ON projects(is_template);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);

-- JSONB indexes for metadata queries
CREATE INDEX IF NOT EXISTS idx_projects_metadata_tags ON projects USING GIN ((metadata->'tags'));
CREATE INDEX IF NOT EXISTS idx_projects_metadata_category ON projects((metadata->>'category'));
CREATE INDEX IF NOT EXISTS idx_projects_metadata_priority ON projects((metadata->>'priority'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Version table indexes
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_created_at ON project_versions(created_at);

-- Collaborators table indexes
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_project_analytics_project_id ON project_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analytics_user_id ON project_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_project_analytics_event_type ON project_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_project_analytics_created_at ON project_analytics(created_at);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_parent_id ON project_comments(parent_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at 
    BEFORE UPDATE ON project_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for project statistics
CREATE OR REPLACE FUNCTION get_user_project_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'by_status', json_build_object(
            'draft', COUNT(*) FILTER (WHERE status = 'draft'),
            'in_progress', COUNT(*) FILTER (WHERE status = 'in-progress'),
            'review', COUNT(*) FILTER (WHERE status = 'review'),
            'completed', COUNT(*) FILTER (WHERE status = 'completed'),
            'archived', COUNT(*) FILTER (WHERE status = 'archived'),
            'error', COUNT(*) FILTER (WHERE status = 'error')
        ),
        'by_type', json_build_object(
            'pptx', COUNT(*) FILTER (WHERE type = 'pptx'),
            'template_nr', COUNT(*) FILTER (WHERE type = 'template-nr'),
            'talking_photo', COUNT(*) FILTER (WHERE type = 'talking-photo'),
            'custom', COUNT(*) FILTER (WHERE type = 'custom'),
            'ai_generated', COUNT(*) FILTER (WHERE type = 'ai-generated')
        ),
        'recent_activity', (
            SELECT json_agg(
                json_build_object(
                    'id', p.id,
                    'name', p.name,
                    'type', p.type,
                    'status', p.status,
                    'updated_at', p.updated_at
                )
            )
            FROM (
                SELECT id, name, type, status, updated_at
                FROM projects 
                WHERE projects.user_id = get_user_project_stats.user_id
                ORDER BY updated_at DESC 
                LIMIT 5
            ) p
        ),
        'collaboration_stats', json_build_object(
            'owned_projects', COUNT(*) FILTER (WHERE projects.user_id = get_user_project_stats.user_id),
            'collaborated_projects', (
                SELECT COUNT(DISTINCT pc.project_id)
                FROM project_collaborators pc
                WHERE pc.user_id = get_user_project_stats.user_id
            )
        )
    ) INTO result
    FROM projects
    WHERE projects.user_id = get_user_project_stats.user_id 
       OR projects.id IN (
           SELECT project_id 
           FROM project_collaborators 
           WHERE project_collaborators.user_id = get_user_project_stats.user_id
       );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default categories
INSERT INTO project_categories (name, description, icon, color) VALUES
    ('General', 'General purpose projects', 'folder', '#6B7280'),
    ('Education', 'Educational content projects', 'graduation-cap', '#3B82F6'),
    ('Marketing', 'Marketing and promotional content', 'megaphone', '#EF4444'),
    ('Training', 'Training and instructional videos', 'book-open', '#10B981'),
    ('Presentation', 'Business presentations', 'presentation', '#8B5CF6'),
    ('Template', 'Reusable templates', 'layout-template', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

-- Insert default tags
INSERT INTO project_tags (name, color, description) VALUES
    ('urgent', '#EF4444', 'High priority projects'),
    ('template', '#8B5CF6', 'Template projects'),
    ('draft', '#6B7280', 'Draft projects'),
    ('review', '#F59E0B', 'Projects under review'),
    ('completed', '#10B981', 'Completed projects'),
    ('ai-generated', '#3B82F6', 'AI generated content'),
    ('collaboration', '#EC4899', 'Collaborative projects'),
    ('public', '#06B6D4', 'Public projects')
ON CONFLICT (name) DO NOTHING;