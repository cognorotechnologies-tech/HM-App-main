-- Dead Letter Queue for Failed Workflows
-- Tracks workflows that have failed multiple times and need manual intervention

CREATE TABLE IF NOT EXISTS workflow_failures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    workflow_step_id UUID REFERENCES workflow_steps(id),
    error_message TEXT,
    error_stack TEXT,
    retry_count INTEGER DEFAULT 0,
    failed_at TIMESTAMPTZ DEFAULT now(),
    last_retry_at TIMESTAMPTZ,
    requires_manual_intervention BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    resolution_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_workflow_failures_instance ON workflow_failures(workflow_instance_id);
CREATE INDEX idx_workflow_failures_step ON workflow_failures(workflow_step_id);
CREATE INDEX idx_workflow_failures_unresolved ON workflow_failures(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_workflow_failures_manual ON workflow_failures(requires_manual_intervention) WHERE requires_manual_intervention = true;

-- Comments
COMMENT ON TABLE workflow_failures IS 'Dead letter queue for workflows that have failed after retries';
COMMENT ON COLUMN workflow_failures.retry_count IS 'Number of times this workflow step has been retried';
COMMENT ON COLUMN workflow_failures.requires_manual_intervention IS 'True if automated retries have been exhausted';

-- Function to log workflow failure
CREATE OR REPLACE FUNCTION log_workflow_failure(
    p_instance_id UUID,
    p_step_id UUID,
    p_error_message TEXT,
    p_error_stack TEXT DEFAULT NULL,
    p_retry_count INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    v_failure_id UUID;
    v_requires_intervention BOOLEAN;
BEGIN
    -- If retry count >= 3, mark as requiring manual intervention
    v_requires_intervention := p_retry_count >= 3;
    
    INSERT INTO workflow_failures (
        workflow_instance_id,
        workflow_step_id,
        error_message,
        error_stack,
        retry_count,
        requires_manual_intervention
    ) VALUES (
        p_instance_id,
        p_step_id,
        p_error_message,
        p_error_stack,
        p_retry_count,
        v_requires_intervention
    ) RETURNING id INTO v_failure_id;
    
    RETURN v_failure_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark failure as resolved
CREATE OR REPLACE FUNCTION resolve_workflow_failure(
    p_failure_id UUID,
    p_resolved_by UUID,
    p_resolution_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE workflow_failures
    SET 
        resolved_at = now(),
        resolved_by = p_resolved_by,
        resolution_notes = p_resolution_notes,
        updated_at = now()
    WHERE id = p_failure_id
    AND resolved_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Updated timestamp trigger
CREATE TRIGGER trigger_update_workflow_failure_timestamp
    BEFORE UPDATE ON workflow_failures
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_trigger_updated_at();

-- View for monitoring unresolved failures
CREATE OR REPLACE VIEW vw_unresolved_failures AS
SELECT 
    wf.id,
    wf.workflow_instance_id,
    wt.name as workflow_name,
    p.first_name || ' ' || p.last_name as patient_name,
    ws.step_name,
    wf.error_message,
    wf.retry_count,
    wf.requires_manual_intervention,
    wf.failed_at,
    wf.last_retry_at
FROM workflow_failures wf
JOIN workflow_instances wi ON wf.workflow_instance_id = wi.id
JOIN workflow_templates wt ON wi.workflow_template_id = wt.id
JOIN patients p ON wi.patient_id = p.id
LEFT JOIN workflow_steps ws ON wf.workflow_step_id = ws.id
WHERE wf.resolved_at IS NULL
ORDER BY wf.failed_at DESC;

-- Enable RLS on workflow_failures
ALTER TABLE workflow_failures ENABLE ROW LEVEL SECURITY;

-- Only staff can view failures
CREATE POLICY "Staff view workflow failures"
    ON workflow_failures FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('nurse', 'doctor', 'admin')
        )
    );

-- Only admins can resolve failures
CREATE POLICY "Admin resolve failures"
    ON workflow_failures FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- System can insert failures
CREATE POLICY "System insert failures"
    ON workflow_failures FOR INSERT
    WITH CHECK (true);

COMMENT ON VIEW vw_unresolved_failures IS 'Human-readable view of workflows requiring attention';
