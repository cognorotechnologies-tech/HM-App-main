-- Seed a complete working workflow with steps
DO $$
DECLARE
    v_survey_id uuid;
    v_workflow_id uuid;
BEGIN
    -- 1. Ensure a survey template exists
    SELECT id INTO v_survey_id FROM survey_templates WHERE name = 'General Health Check' LIMIT 1;
    
    IF v_survey_id IS NULL THEN
        INSERT INTO survey_templates (name, description, category, questions, alert_rules, estimated_time_minutes, is_active)
        VALUES (
            'General Health Check', 
            'Basic health status check', 
            'general', 
            '[
                {"id": "wellness", "type": "rating", "text": "How do you feel today (1-10)?", "scale": [1, 10], "required": true},
                {"id": "symptoms", "type": "text", "text": "Any new symptoms?", "required": false}
            ]'::jsonb,
            '{"warning": {"wellness": "< 5"}}'::jsonb,
            2,
            true
        ) RETURNING id INTO v_survey_id;
    END IF;

    -- 2. Create the Workflow Template
    INSERT INTO workflow_templates (
        name, 
        description, 
        category, 
        trigger_type, 
        trigger_event, 
        estimated_duration_days, 
        is_active
    )
    VALUES (
        'Demo: Post-Op Recovery Protocol', 
        'A complete demonstration workflow with delays, messages, and surveys.', 
        'post_surgery', 
        'event', 
        'surgery_completed', 
        14, 
        true
    ) RETURNING id INTO v_workflow_id;

    -- 3. Add Steps
    
    -- Step 1: Initial Welcome Message
    INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, action_config)
    VALUES (
        v_workflow_id, 
        1, 
        'Send Welcome Guide', 
        'send_message', 
        jsonb_build_object(
            'subject', 'Welcome to your recovery journey',
            'message', 'Hello {{patient_name}}, we are here to support your recovery. Please follow the instructions provided.'
        )
    );

    -- Step 2: Delay 1 Day
    INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, delay_days)
    VALUES (
        v_workflow_id, 
        2, 
        'Wait 24 Hours', 
        'delay', 
        1
    );

    -- Step 3: Send Survey
    INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, action_config)
    VALUES (
        v_workflow_id, 
        3, 
        'First Health Check', 
        'send_survey', 
        jsonb_build_object(
            'survey_template_id', v_survey_id,
            'channel', 'email'
        )
    );

    -- Step 4: Delay 3 Days
    INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, delay_days)
    VALUES (
        v_workflow_id, 
        4, 
        'Wait 3 Days', 
        'delay', 
        3
    );

     -- Step 5: Follow-up Message
    INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, action_config)
    VALUES (
        v_workflow_id, 
        5, 
        'Check-in Message', 
        'send_message', 
        jsonb_build_object(
            'subject', 'How are you doing?',
            'message', 'It has been a few days. We hope you are feeling better.'
        )
    );

END $$;
