-- Migration: Create workflow_triggers table
-- This table defines what events should trigger which workflows

CREATE TABLE IF NOT EXISTS workflow_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL, -- 'survey_alert', 'appointment_completed', 'manual', 'scheduled'
    trigger_config JSONB DEFAULT '{}'::jsonb, -- Configuration for the trigger (e.g., {alert_severity: 4})
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID, -- Can be populated later if staff table exists
    
    -- Indexes for performance
    CONSTRAINT valid_trigger_type CHECK (
        trigger_type IN ('survey_alert', 'appointment_completed', 'manual', 'scheduled', 'patient_registered')
    )
);

-- Indexes
CREATE INDEX idx_workflow_triggers_template ON workflow_triggers(workflow_template_id);
CREATE INDEX idx_workflow_triggers_type ON workflow_triggers(trigger_type);
CREATE INDEX idx_workflow_triggers_active ON workflow_triggers(is_active);

-- Comments
COMMENT ON TABLE workflow_triggers IS 'Defines events that automatically trigger workflow execution';
COMMENT ON COLUMN workflow_triggers.trigger_type IS 'Type of event that triggers the workflow';
COMMENT ON COLUMN workflow_triggers.trigger_config IS 'JSON configuration for trigger matching (e.g., alert severity, survey type)';

-- Example trigger configurations:
-- Survey Alert Trigger: {"alert_severity": 4, "survey_type": "pain_assessment"}
-- Appointment Completed: {"appointment_type": "surgery", "department": "orthopedics"}
-- Scheduled: {"schedule": "0 9 * * *"} -- Cron expression

-- Insert some default triggers for common scenarios
INSERT INTO workflow_triggers (workflow_template_id, trigger_type, trigger_config, created_by)
SELECT 
    wt.id,
    'survey_alert',
    '{"alert_severity": 4}'::jsonb,
    NULL
FROM workflow_templates wt
WHERE wt.name LIKE '%Post-Op%' OR wt.name LIKE '%Recovery%'
LIMIT 1;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_workflow_trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_trigger_timestamp
    BEFORE UPDATE ON workflow_triggers
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_trigger_updated_at();
