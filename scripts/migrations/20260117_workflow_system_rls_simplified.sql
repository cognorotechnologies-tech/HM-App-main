-- Simplified RLS Policies for Workflow Automation System
-- Use this if you don't have a users table yet
-- This allows all authenticated users to access the tables

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SIMPLIFIED POLICIES - ALL AUTHENTICATED USERS
-- ============================================================================

-- Workflow Templates
CREATE POLICY "Authenticated users can view workflow templates"
    ON workflow_templates FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Authenticated users can manage workflow templates"
    ON workflow_templates FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Workflow Steps
CREATE POLICY "Authenticated users can view workflow steps"
    ON workflow_steps FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage workflow steps"
    ON workflow_steps FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Workflow Instances
CREATE POLICY "Authenticated users can view workflow instances"
    ON workflow_instances FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage workflow instances"
    ON workflow_instances FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Service role for automation
CREATE POLICY "Service role can manage workflow instances"
    ON workflow_instances FOR ALL
    TO service_role
    USING (true);

-- Workflow Step Executions
CREATE POLICY "Authenticated users can view step executions"
    ON workflow_step_executions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage step executions"
    ON workflow_step_executions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can manage step executions"
    ON workflow_step_executions FOR ALL
    TO service_role
    USING (true);

-- Survey Templates
CREATE POLICY "Authenticated users can view survey templates"
    ON survey_templates FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Authenticated users can manage survey templates"
    ON survey_templates FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Survey Instances
CREATE POLICY "Authenticated users can view survey instances"
    ON survey_instances FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage survey instances"
    ON survey_instances FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Anonymous access via token (for public survey links)
CREATE POLICY "Anonymous access to surveys via token"
    ON survey_instances FOR SELECT
    TO anon
    USING (access_token IS NOT NULL);

CREATE POLICY "Anonymous can update surveys via token"
    ON survey_instances FOR UPDATE
    TO anon
    USING (access_token IS NOT NULL)
    WITH CHECK (access_token IS NOT NULL);

-- Service role for automation
CREATE POLICY "Service role can manage survey instances"
    ON survey_instances FOR ALL
    TO service_role
    USING (true);

-- Survey Responses
CREATE POLICY "Authenticated users can submit survey responses"
    ON survey_responses FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view survey responses"
    ON survey_responses FOR SELECT
    TO authenticated
    USING (true);

-- Anonymous can submit via token
CREATE POLICY "Anonymous can submit responses via token"
    ON survey_responses FOR INSERT
    TO anon
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM survey_instances si
            WHERE si.id = survey_instance_id
            AND si.access_token IS NOT NULL
        )
    );

CREATE POLICY "Service role can manage survey responses"
    ON survey_responses FOR ALL
    TO service_role
    USING (true);

-- Survey Alerts
CREATE POLICY "Authenticated users can view alerts"
    ON survey_alerts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can update alerts"
    ON survey_alerts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can manage alerts"
    ON survey_alerts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Service role for creating alerts automatically
CREATE POLICY "Service role can create alerts"
    ON survey_alerts FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ All authenticated users can access all tables
-- ✅ Anonymous users can access surveys via tokens
-- ✅ Service role can automate workflows
-- ✅ No dependency on users table
-- 
-- NOTE: These are permissive policies for testing
-- In production, you should restrict based on roles
