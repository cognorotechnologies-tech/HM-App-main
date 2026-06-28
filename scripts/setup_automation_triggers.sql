-- Setup Workflow Automation Test Configuration
-- This configures your existing workflows to auto-trigger from survey alerts

-- Step 1: Add triggers for all existing workflows that should auto-start on critical alerts
-- This will make ANY workflow automatically trigger when a survey creates a severity 4+ alert

INSERT INTO workflow_triggers (workflow_template_id, trigger_type, trigger_config, is_active)
SELECT 
    id as workflow_template_id,
    'survey_alert'::text as trigger_type,
    '{"alert_severity": 4}'::jsonb as trigger_config,
    true as is_active
FROM workflow_templates
WHERE is_active = true
ON CONFLICT DO NOTHING;

-- Step 2: Create a specific trigger for Post-Op Recovery workflows on high pain scores
-- This is more targeted - only triggers for pain-related alerts

INSERT INTO workflow_triggers (workflow_template_id, trigger_type, trigger_config, is_active)
SELECT 
    wt.id as workflow_template_id,
    'survey_alert'::text as trigger_type,
    '{"alert_severity": 4, "alert_type": "high_pain"}'::jsonb as trigger_config,
    true as is_active
FROM workflow_templates wt
WHERE wt.name ILIKE '%post-op%' 
   OR wt.name ILIKE '%recovery%'
   OR wt.name ILIKE '%pain%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Step 3: Verify triggers were created
SELECT 
    wt.id,
    wt.name as workflow_name,
    wt.trigger_type,
    wt.trigger_config,
    wt.is_active,
    wt.created_at
FROM workflow_triggers wt
JOIN workflow_templates wtemp ON wt.workflow_template_id = wtemp.id
ORDER BY wt.created_at DESC;

-- Expected result: You should see triggers configured for your workflows
-- When a survey creates an alert with severity >= 4, these workflows will auto-start!

-- NOTES:
-- - trigger_type: 'survey_alert' means it triggers when surveys create alerts
-- - trigger_config.alert_severity: 4 means only severity 4+ alerts trigger it
-- - trigger_config.alert_type filters by specific alert types (optional)
