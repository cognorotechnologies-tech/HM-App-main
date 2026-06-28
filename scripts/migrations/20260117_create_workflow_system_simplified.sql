-- Simplified Workflow System Migration (No Users Table Dependency)
-- Use this version if you haven't created the users table yet

-- ============================================================================
-- PART 1: WORKFLOW ENGINE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    trigger_type VARCHAR(50) NOT NULL,
    trigger_event VARCHAR(100),
    trigger_config JSONB DEFAULT '{}',
    estimated_duration_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    parent_step_id UUID REFERENCES workflow_steps(id),
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    delay_days INTEGER DEFAULT 0,
    delay_hours INTEGER DEFAULT 0,
    delay_minutes INTEGER DEFAULT 0,
    condition_type VARCHAR(50) DEFAULT 'always',
    condition_rules JSONB DEFAULT '{}',
    action_type VARCHAR(50),
    action_config JSONB DEFAULT '{}',
    on_success_step_id UUID REFERENCES workflow_steps(id),
    on_failure_step_id UUID REFERENCES workflow_steps(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    trigger_event VARCHAR(100),
    trigger_data JSONB DEFAULT '{}',
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    current_step_id UUID REFERENCES workflow_steps(id),
    next_execution_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_step_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES workflow_steps(id),
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_duration_ms INTEGER,
    result JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: SURVEY & QUESTIONNAIRE SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS survey_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    questions JSONB NOT NULL,
    scoring_rules JSONB DEFAULT '{}',
    alert_rules JSONB DEFAULT '{}',
    estimated_time_minutes INTEGER,
    expires_after_hours INTEGER DEFAULT 72,
    allow_partial_responses BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    total_sent INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    average_completion_time_minutes INTEGER
);

CREATE TABLE IF NOT EXISTS survey_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_template_id UUID NOT NULL REFERENCES survey_templates(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    workflow_instance_id UUID REFERENCES workflow_instances(id),
    sent_via VARCHAR(50),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    sent_to VARCHAR(255),
    access_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'sent',
    opened_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completion_time_minutes INTEGER,
    questions_total INTEGER,
    questions_answered INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_instance_id UUID NOT NULL REFERENCES survey_instances(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    answer_value JSONB NOT NULL,
    answer_text TEXT,
    is_concerning BOOLEAN DEFAULT false,
    concern_level VARCHAR(50),
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_instance_id UUID NOT NULL REFERENCES survey_instances(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    workflow_instance_id UUID REFERENCES workflow_instances(id),
    alert_type VARCHAR(50) NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
    category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    alert_reason TEXT NOT NULL,
    triggered_by JSONB,
    recommended_actions JSONB,
    status VARCHAR(50) DEFAULT 'open',
    assigned_to UUID,
    assigned_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    resolution_notes TEXT,
    actions_taken JSONB DEFAULT '[]',
    escalated BOOLEAN DEFAULT false,
    escalated_to UUID,
    escalated_at TIMESTAMPTZ,
    escalation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_patient ON workflow_instances(patient_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_survey_templates_active ON survey_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_instances_patient ON survey_instances(patient_id);
CREATE INDEX IF NOT EXISTS idx_survey_instances_token ON survey_instances(access_token);
CREATE INDEX IF NOT EXISTS idx_survey_responses_instance ON survey_responses(survey_instance_id);
CREATE INDEX IF NOT EXISTS idx_survey_alerts_patient ON survey_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_survey_alerts_status ON survey_alerts(status);
CREATE INDEX IF NOT EXISTS idx_survey_alerts_severity ON survey_alerts(severity, status);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ All tables created without users table dependency
-- ✅ Foreign keys to patients table still work
-- ✅ User ID fields are simple UUID columns (can add constraint later)
