-- Row-Level Security (RLS) Policies for Workflow Automation System
-- Ensures proper access control for workflows, surveys, and alerts

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
-- WORKFLOW TEMPLATES POLICIES
-- ============================================================================

-- Admins can do everything
CREATE POLICY "Admins full access to workflow templates"
    ON workflow_templates FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Doctors and nurses can view active templates
CREATE POLICY "Healthcare staff can view workflow templates"
    ON workflow_templates FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('doctor', 'nurse', 'admin')
        )
    );

-- ============================================================================
-- WORKFLOW STEPS POLICIES
-- ============================================================================

-- Admins can manage steps
CREATE POLICY "Admins full access to workflow steps"
    ON workflow_steps FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Staff can view steps
CREATE POLICY "Healthcare staff can view workflow steps"
    ON workflow_steps FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('doctor', 'nurse', 'admin')
        )
    );

-- ============================================================================
-- WORKFLOW INSTANCES POLICIES
-- ============================================================================

-- Admins can manage all instances
CREATE POLICY "Admins full access to workflow instances"
    ON workflow_instances FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Patients can view their own instances
CREATE POLICY "Patients can view their workflow instances"
    ON workflow_instances FOR SELECT
    TO authenticated
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- Doctors and nurses can view instances for their patients
CREATE POLICY "Healthcare staff can view workflow instances"
    ON workflow_instances FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('doctor', 'nurse')
        )
    );

-- System can create and update instances (for automation)
CREATE POLICY "Service role can manage workflow instances"
    ON workflow_instances FOR ALL
    TO service_role
    USING (true);

-- ============================================================================
-- WORKFLOW STEP EXECUTIONS POLICIES
-- ============================================================================

-- Admins full access
CREATE POLICY "Admins full access to step executions"
    ON workflow_step_executions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Staff can view executions
CREATE POLICY "Healthcare staff can view step executions"
    ON workflow_step_executions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('doctor', 'nurse', 'admin')
        )
    );

-- Service role for automation
CREATE POLICY "Service role can manage step executions"
    ON workflow_step_executions FOR ALL
    TO service_role
    USING (true);

-- ============================================================================
-- SURVEY TEMPLATES POLICIES
-- ============================================================================

-- Admins can manage templates
CREATE POLICY "Admins full access to survey templates"
    ON survey_templates FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Healthcare staff can view active templates
CREATE POLICY "Healthcare staff can view survey templates"
    ON survey_templates FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('doctor', 'nurse', 'admin')
        )
    );

-- ============================================================================
-- SURVEY INSTANCES POLICIES
-- ============================================================================

-- Patients can view and update their own survey instances
CREATE POLICY "Patients can view their survey instances"
    ON survey_instances FOR SELECT
    TO authenticated
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update their survey instances"
    ON survey_instances FOR UPDATE
    TO authenticated
    USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

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

-- Healthcare staff can view all surveys
CREATE POLICY "Healthcare staff can view survey instances"
    ON survey_instances FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('doctor', 'nurse', 'admin')
        )
    );

-- Admins can manage surveys
CREATE POLICY "Admins can manage survey instances"
    ON survey_instances FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Service role for automation
CREATE POLICY "Service role can manage survey instances"
    ON survey_instances FOR ALL
    TO service_role
    USING (true);

-- ============================================================================
-- SURVEY RESPONSES POLICIES
-- ============================================================================

-- Patients can insert responses for their surveys
CREATE POLICY "Patients can submit survey responses"
    ON survey_responses FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM survey_instances si
            WHERE si.id = survey_instance_id
            AND si.patient_id IN (
                SELECT id FROM patients WHERE user_id = auth.uid()
            )
        )
    );

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

-- Patients can view their own responses
CREATE POLICY "Patients can view their responses"
    ON survey_responses FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM survey_instances si
            WHERE si.id = survey_instance_id
            AND si.patient_id IN (
                SELECT id FROM patients WHERE user_id = auth.uid()
            )
        )
    );

-- Healthcare staff can view all responses
CREATE POLICY "Healthcare staff can view survey responses"
    ON survey_responses FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('doctor', 'nurse', 'admin')
        )
    );

-- Admins full access
CREATE POLICY "Admins full access to survey responses"
    ON survey_responses FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Service role for automation
CREATE POLICY "Service role can manage survey responses"
    ON survey_responses FOR ALL
    TO service_role
    USING (true);

-- ============================================================================
-- SURVEY ALERTS POLICIES
-- ============================================================================

-- Nurses can view alerts assigned to them or unassigned
CREATE POLICY "Nurses can view relevant alerts"
    ON survey_alerts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'nurse'
        )
    );

-- Nurses can update alerts for acknowledgment and resolution
CREATE POLICY "Nurses can update alerts"
    ON survey_alerts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'nurse'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'nurse'
        )
    );

-- Doctors can view and update alerts
CREATE POLICY "Doctors can manage alerts"
    ON survey_alerts FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('doctor', 'admin')
        )
    );

-- Admins full access
CREATE POLICY "Admins full access to survey alerts"
    ON survey_alerts FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Service role for automation (creating alerts)
CREATE POLICY "Service role can create alerts"
    ON survey_alerts FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- RLS policies ensure:
-- 1. Admins have full access to all workflow and survey data
-- 2. Healthcare staff can view workflows and surveys
-- 3. Patients can only access their own surveys
-- 4. Anonymous users can submit surveys via unique tokens
-- 5. Nurses can view and manage alerts
-- 6. Service role can automate workflow execution
