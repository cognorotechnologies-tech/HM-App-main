-- Row Level Security (RLS) Policies for Hospital Management System
-- Critical for production - ensures users only see their own data

-- ================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PATIENT POLICIES
-- ================================================

-- Patients can view their own data
CREATE POLICY "Patients view own profile"
    ON patients FOR SELECT
    USING (auth.uid() = id);

-- Patients can update their own profile
CREATE POLICY "Patients update own profile"
    ON patients FOR UPDATE
    USING (auth.uid() = id);

-- Staff (nurses, doctors, admins) can view all patients
CREATE POLICY "Staff view all patients"
    ON patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- Staff can create and update patients
CREATE POLICY "Staff manage patients"
    ON patients FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- ================================================
-- SURVEY INSTANCE POLICIES
-- ================================================

-- Patients can view their own survey instances
CREATE POLICY "Patients view own surveys"
    ON survey_instances FOR SELECT
    USING (patient_id = auth.uid());

-- Patients can update their own survey instances (to mark as opened, etc.)
CREATE POLICY "Patients update own surveys"
    ON survey_instances FOR UPDATE
    USING (patient_id = auth.uid());

-- Staff can view all survey instances
CREATE POLICY "Staff view all surveys"
    ON survey_instances FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- Staff can manage all survey instances
CREATE POLICY "Staff manage surveys"
    ON survey_instances FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- ================================================
-- SURVEY RESPONSE POLICIES
-- ================================================

-- Patients can view their own responses
CREATE POLICY "Patients view own responses"
    ON survey_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM survey_instances
            WHERE survey_instances.id = survey_responses.survey_instance_id
            AND survey_instances.patient_id = auth.uid()
        )
    );

-- Patients can insert their own responses
CREATE POLICY "Patients insert own responses"
    ON survey_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM survey_instances
            WHERE survey_instances.id = survey_instance_id
            AND survey_instances.patient_id = auth.uid()
        )
    );

-- Staff can view all responses
CREATE POLICY "Staff view all responses"
    ON survey_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- ================================================
-- SURVEY ALERT POLICIES
-- ================================================

-- Patients CANNOT see their own alerts (these are for staff only)

-- Staff can view all alerts
CREATE POLICY "Staff view all alerts"
    ON survey_alerts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- Staff can update alerts (acknowledge, resolve, etc.)
CREATE POLICY "Staff update alerts"
    ON survey_alerts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- System can insert alerts (during survey processing)
CREATE POLICY "System insert alerts"
    ON survey_alerts FOR INSERT
    WITH CHECK (true); -- Allow inserts from service role

-- ================================================
-- WORKFLOW POLICIES
-- ================================================

-- Only staff can view workflows
CREATE POLICY "Staff view workflow templates"
    ON workflow_templates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- Only admins can manage workflow templates
CREATE POLICY "Admin manage workflow templates"
    ON workflow_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Staff can view workflow instances
CREATE POLICY "Staff view workflow instances"
    ON workflow_instances FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- Staff can manage workflow instances (pause, resume, cancel)
CREATE POLICY "Staff manage workflow instances"
    ON workflow_instances FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- Staff can view workflow steps
CREATE POLICY "Staff view workflow steps"
    ON workflow_steps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- Only admins can manage workflow steps
CREATE POLICY "Admin manage workflow steps"
    ON workflow_steps FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Staff can view workflow triggers
CREATE POLICY "Staff view workflow triggers"
    ON workflow_triggers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- Only admins can manage workflow triggers
CREATE POLICY "Admin manage workflow triggers"
    ON workflow_triggers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ================================================
-- VERIFICATION
-- ================================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'patients', 'survey_instances', 'survey_responses', 
    'survey_alerts', 'workflow_instances', 'workflow_templates',
    'workflow_steps', 'workflow_triggers'
)
ORDER BY tablename;

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- NOTES:
-- - These policies assume users have a 'role' in their user metadata
-- - Service role bypasses RLS, so server-side operations still work
-- - Patients can only see their own data
-- - Staff can see all data but with role-based restrictions
-- - Admins have full access to workflow configuration
