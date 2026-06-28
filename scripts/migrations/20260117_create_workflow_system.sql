-- Campaign Workflow Automation System - Phase 1 Foundation
-- Database Schema for Workflow Engine, Survey System, and Monitoring

-- ============================================================================
-- PART 1: WORKFLOW ENGINE TABLES
-- ============================================================================

-- Workflow Templates (reusable workflow definitions)
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'post_surgery', 'medication', 'chronic_care', etc.
    
    -- Trigger configuration
    trigger_type VARCHAR(50) NOT NULL, -- 'event', 'schedule', 'manual'
    trigger_event VARCHAR(100), -- e.g., 'surgery_completed', 'prescription_filled'
    trigger_config JSONB DEFAULT '{}', -- Additional trigger settings
    
    -- Workflow metadata
    estimated_duration_days INTEGER, -- How long workflow typically runs
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT true, -- True for reusable templates
    
    -- Tracking
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Statistics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0
);

-- Workflow Steps (individual actions in a workflow)
CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    
    -- Step ordering and hierarchy
    step_order INTEGER NOT NULL, -- Order of execution
    parent_step_id UUID REFERENCES workflow_steps(id), -- For nested steps
    
    -- Step identification
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(50) NOT NULL, -- 'send_message', 'send_survey', 'wait', 'conditional', 'alert'
    
    -- Timing
    delay_days INTEGER DEFAULT 0,
    delay_hours INTEGER DEFAULT 0,
    delay_minutes INTEGER DEFAULT 0,
    
    -- Condition for execution
    condition_type VARCHAR(50) DEFAULT 'always', -- 'always', 'if_true', 'if_false', 'custom'
    condition_rules JSONB DEFAULT '{}', -- e.g., {"previous_step_result": "positive"}
    
    -- Action configuration
    action_type VARCHAR(50), -- 'send_email', 'send_sms', 'send_survey', 'create_alert'
    action_config JSONB DEFAULT '{}', -- Template ID, survey ID, etc.
    
    -- Success/failure paths
    on_success_step_id UUID REFERENCES workflow_steps(id),
    on_failure_step_id UUID REFERENCES workflow_steps(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Instances (actual running workflows for patients)
CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    
    -- Trigger information
    trigger_event VARCHAR(100),
    trigger_data JSONB DEFAULT '{}', -- Data that triggered this workflow
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Execution status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled', 'failed'
    current_step_id UUID REFERENCES workflow_steps(id),
    next_execution_at TIMESTAMPTZ, -- When next step should execute
    
    -- Completion info
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Store patient-specific data
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Step Executions (track each step execution)
CREATE TABLE IF NOT EXISTS workflow_step_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES workflow_steps(id),
    
    -- Execution status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'executing', 'completed', 'failed', 'skipped'
    
    -- Timing
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_duration_ms INTEGER, -- How long it took to execute
    
    -- Results
    result JSONB DEFAULT '{}', -- Store execution results
    output_data JSONB DEFAULT '{}', -- Data produced by this step
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: SURVEY & QUESTIONNAIRE SYSTEM
-- ============================================================================

-- Survey Templates (reusable survey definitions)
CREATE TABLE IF NOT EXISTS survey_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'post_surgery', 'pain_assessment', 'satisfaction', 'wound_care'
    
    -- Survey structure
    questions JSONB NOT NULL, -- Array of question objects
    /* Example structure:
    [
      {
        "id": "q1",
        "type": "rating",
        "text": "Rate your pain level",
        "scale": [1, 10],
        "required": true
      },
      {
        "id": "q2",
        "type": "yes_no",
        "text": "Do you have fever?",
        "critical_if": "yes"
      }
    ]
    */
    
    -- Scoring and analysis
    scoring_rules JSONB DEFAULT '{}', -- How to calculate overall score
    alert_rules JSONB DEFAULT '{}', -- When to trigger alerts
    /* Example:
    {
      "critical": {
        "pain_level": "> 8",
        "fever": "yes"
      },
      "warning": {
        "pain_level": "> 5"
      }
    }
    */
    
    -- Survey settings
    estimated_time_minutes INTEGER, -- How long to complete
    expires_after_hours INTEGER DEFAULT 72, -- Survey link expiration
    allow_partial_responses BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT true,
    
    -- Tracking
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Statistics
    total_sent INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    average_completion_time_minutes INTEGER
);

-- Survey Instances (surveys sent to specific patients)
CREATE TABLE IF NOT EXISTS survey_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_template_id UUID NOT NULL REFERENCES survey_templates(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    workflow_instance_id UUID REFERENCES workflow_instances(id), -- NULL if standalone
    
    -- Distribution
    sent_via VARCHAR(50), -- 'email', 'sms', 'portal'
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    sent_to VARCHAR(255), -- Email or phone number
    
    -- Access control
    access_token VARCHAR(255) UNIQUE, -- For anonymous access via link
    expires_at TIMESTAMPTZ,
    
    -- Completion status
    status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'opened', 'in_progress', 'completed', 'expired', 'cancelled'
    opened_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ, -- First answer provided
    completed_at TIMESTAMPTZ,
    completion_time_minutes INTEGER,
    
    -- Progress tracking
    questions_total INTEGER,
    questions_answered INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Responses (individual question answers)
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_instance_id UUID NOT NULL REFERENCES survey_instances(id) ON DELETE CASCADE,
    
    -- Question details
    question_id VARCHAR(100) NOT NULL, -- ID from template questions JSONB
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'rating', 'choice', 'yes_no', 'multi_choice'
    
    -- Answer
    answer_value JSONB NOT NULL, -- Flexible storage for any answer type
    answer_text TEXT, -- Human-readable answer for display
    
    -- Analysis
    is_concerning BOOLEAN DEFAULT false, -- Flagged by alert rules
    concern_level VARCHAR(50), -- 'critical', 'warning', 'normal'
    
    -- Timing
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Alerts (triggered by concerning responses)
CREATE TABLE IF NOT EXISTS survey_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_instance_id UUID NOT NULL REFERENCES survey_instances(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    workflow_instance_id UUID REFERENCES workflow_instances(id),
    
    -- Alert classification
    alert_type VARCHAR(50) NOT NULL, -- 'critical', 'warning', 'info'
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5), -- 1=low, 5=critical
    category VARCHAR(100), -- 'pain', 'infection', 'medication', 'mental_health'
    
    -- Alert details
    title VARCHAR(255) NOT NULL,
    alert_reason TEXT NOT NULL,
    triggered_by JSONB, -- Which responses triggered this
    recommended_actions JSONB, -- Suggested actions for nurse
    
    -- Assignment
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'acknowledged', 'in_progress', 'resolved', 'escalated'
    assigned_to UUID, -- References users(id)
    assigned_at TIMESTAMPTZ,
    
    -- Response tracking
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID, -- References users(id)
    resolved_at TIMESTAMPTZ,
    resolved_by UUID, -- References users(id)
    resolution_notes TEXT,
    
    -- Actions taken
    actions_taken JSONB DEFAULT '[]', -- Array of actions: called, sent_ambulance, etc.
    
    -- Escalation
    escalated BOOLEAN DEFAULT false,
    escalated_to UUID, -- References users(id)
    escalated_at TIMESTAMPTZ,
    escalation_reason TEXT,
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Workflow Templates
CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_trigger ON workflow_templates(trigger_type, trigger_event);

-- Workflow Steps
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_order ON workflow_steps(workflow_id, step_order);

-- Workflow Instances
CREATE INDEX IF NOT EXISTS idx_workflow_instances_patient ON workflow_instances(patient_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_next_exec ON workflow_instances(next_execution_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_workflow_instances_workflow ON workflow_instances(workflow_id);

-- Workflow Step Executions
CREATE INDEX IF NOT EXISTS idx_step_executions_instance ON workflow_step_executions(instance_id);
CREATE INDEX IF NOT EXISTS idx_step_executions_status ON workflow_step_executions(status);
CREATE INDEX IF NOT EXISTS idx_step_executions_scheduled ON workflow_step_executions(scheduled_at) WHERE status = 'pending';

-- Survey Templates
CREATE INDEX IF NOT EXISTS idx_survey_templates_active ON survey_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_templates_category ON survey_templates(category);

-- Survey Instances
CREATE INDEX IF NOT EXISTS idx_survey_instances_patient ON survey_instances(patient_id);
CREATE INDEX IF NOT EXISTS idx_survey_instances_status ON survey_instances(status);
CREATE INDEX IF NOT EXISTS idx_survey_instances_token ON survey_instances(access_token);
CREATE INDEX IF NOT EXISTS idx_survey_instances_expires ON survey_instances(expires_at) WHERE status IN ('sent', 'opened', 'in_progress');

-- Survey Responses
CREATE INDEX IF NOT EXISTS idx_survey_responses_instance ON survey_responses(survey_instance_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_concerning ON survey_responses(is_concerning) WHERE is_concerning = true;

-- Survey Alerts
CREATE INDEX IF NOT EXISTS idx_survey_alerts_patient ON survey_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_survey_alerts_status ON survey_alerts(status);
CREATE INDEX IF NOT EXISTS idx_survey_alerts_severity ON survey_alerts(severity, status);
CREATE INDEX IF NOT EXISTS idx_survey_alerts_assigned ON survey_alerts(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_survey_alerts_created ON survey_alerts(created_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON workflow_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_templates_updated_at BEFORE UPDATE ON survey_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_alerts_updated_at BEFORE UPDATE ON survey_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Created 8 core tables:
-- 1. workflow_templates - Reusable workflow definitions
-- 2. workflow_steps - Individual steps in workflows
-- 3. workflow_instances - Active workflow executions
-- 4. workflow_step_executions - Step execution tracking
-- 5. survey_templates - Reusable survey definitions
-- 6. survey_instances - Surveys sent to patients
-- 7. survey_responses - Individual question answers
-- 8. survey_alerts - Alerts triggered by responses
--
-- Next steps: Create RLS policies and initial seed data
