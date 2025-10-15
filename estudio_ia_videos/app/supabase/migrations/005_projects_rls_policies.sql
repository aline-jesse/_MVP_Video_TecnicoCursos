-- 🔒 Advanced Projects RLS Policies
-- Row Level Security for projects and related tables

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROJECTS TABLE POLICIES
-- ========================================

-- Users can view their own projects and public projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (
        auth.uid() = user_id 
        OR is_public = true
        OR EXISTS (
            SELECT 1 FROM project_collaborators 
            WHERE project_id = projects.id 
            AND user_id = auth.uid()
            AND accepted_at IS NOT NULL
        )
    );

-- Users can create their own projects
CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects or projects they have editor access to
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM project_collaborators 
            WHERE project_id = projects.id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'editor')
            AND accepted_at IS NOT NULL
        )
    );

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- PROJECT VERSIONS TABLE POLICIES
-- ========================================

-- Users can view versions of projects they have access to
CREATE POLICY "Users can view project versions" ON project_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_versions.project_id
            AND (
                projects.user_id = auth.uid()
                OR projects.is_public = true
                OR EXISTS (
                    SELECT 1 FROM project_collaborators 
                    WHERE project_collaborators.project_id = projects.id 
                    AND project_collaborators.user_id = auth.uid()
                    AND accepted_at IS NOT NULL
                )
            )
        )
    );

-- Users can create versions for projects they have access to
CREATE POLICY "Users can create project versions" ON project_versions
    FOR INSERT WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_versions.project_id
            AND (
                projects.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM project_collaborators 
                    WHERE project_collaborators.project_id = projects.id 
                    AND project_collaborators.user_id = auth.uid()
                    AND role IN ('owner', 'editor')
                    AND accepted_at IS NOT NULL
                )
            )
        )
    );

-- ========================================
-- PROJECT COLLABORATORS TABLE POLICIES
-- ========================================

-- Users can view collaborators of projects they have access to
CREATE POLICY "Users can view project collaborators" ON project_collaborators
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_collaborators.project_id
            AND projects.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM project_collaborators pc2
            WHERE pc2.project_id = project_collaborators.project_id 
            AND pc2.user_id = auth.uid()
            AND pc2.accepted_at IS NOT NULL
        )
    );

-- Project owners can add collaborators
CREATE POLICY "Project owners can add collaborators" ON project_collaborators
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_collaborators.project_id
            AND projects.user_id = auth.uid()
            AND projects.collaboration_enabled = true
        )
    );

-- Users can update their own collaboration status
CREATE POLICY "Users can update own collaboration" ON project_collaborators
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_collaborators.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Project owners and collaborators can remove collaborations
CREATE POLICY "Users can remove collaborations" ON project_collaborators
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_collaborators.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- ========================================
-- PROJECT ANALYTICS TABLE POLICIES
-- ========================================

-- Users can view analytics for their projects
CREATE POLICY "Users can view project analytics" ON project_analytics
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_analytics.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can create analytics events
CREATE POLICY "Users can create analytics events" ON project_analytics
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_analytics.project_id
            AND (
                projects.user_id = auth.uid()
                OR projects.is_public = true
                OR EXISTS (
                    SELECT 1 FROM project_collaborators 
                    WHERE project_collaborators.project_id = projects.id 
                    AND project_collaborators.user_id = auth.uid()
                    AND accepted_at IS NOT NULL
                )
            )
        )
    );

-- ========================================
-- PROJECT COMMENTS TABLE POLICIES
-- ========================================

-- Users can view comments on projects they have access to
CREATE POLICY "Users can view project comments" ON project_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_comments.project_id
            AND (
                projects.user_id = auth.uid()
                OR projects.is_public = true
                OR EXISTS (
                    SELECT 1 FROM project_collaborators 
                    WHERE project_collaborators.project_id = projects.id 
                    AND project_collaborators.user_id = auth.uid()
                    AND accepted_at IS NOT NULL
                )
            )
        )
    );

-- Users can create comments on projects they have access to
CREATE POLICY "Users can create project comments" ON project_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_comments.project_id
            AND (
                projects.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM project_collaborators 
                    WHERE project_collaborators.project_id = projects.id 
                    AND project_collaborators.user_id = auth.uid()
                    AND (permissions->>'can_comment')::boolean = true
                    AND accepted_at IS NOT NULL
                )
            )
        )
    );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON project_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments or project owners can delete any comment
CREATE POLICY "Users can delete comments" ON project_comments
    FOR DELETE USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_comments.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- ========================================
-- PROJECT TAGS TABLE POLICIES
-- ========================================

-- Everyone can view tags
CREATE POLICY "Everyone can view tags" ON project_tags
    FOR SELECT USING (true);

-- Authenticated users can create tags
CREATE POLICY "Authenticated users can create tags" ON project_tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update tags they created
CREATE POLICY "Users can update own tags" ON project_tags
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete tags they created
CREATE POLICY "Users can delete own tags" ON project_tags
    FOR DELETE USING (auth.uid() = created_by);

-- ========================================
-- PROJECT CATEGORIES TABLE POLICIES
-- ========================================

-- Everyone can view categories
CREATE POLICY "Everyone can view categories" ON project_categories
    FOR SELECT USING (true);

-- Only authenticated users can create categories (admin-like functionality)
CREATE POLICY "Authenticated users can create categories" ON project_categories
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ========================================
-- GRANT PERMISSIONS TO ROLES
-- ========================================

-- Grant permissions to anon role (for public projects)
GRANT SELECT ON projects TO anon;
GRANT SELECT ON project_versions TO anon;
GRANT SELECT ON project_comments TO anon;
GRANT SELECT ON project_tags TO anon;
GRANT SELECT ON project_categories TO anon;

-- Grant full permissions to authenticated users
GRANT ALL ON projects TO authenticated;
GRANT ALL ON project_versions TO authenticated;
GRANT ALL ON project_collaborators TO authenticated;
GRANT ALL ON project_analytics TO authenticated;
GRANT ALL ON project_comments TO authenticated;
GRANT ALL ON project_tags TO authenticated;
GRANT ALL ON project_categories TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;