-- Sample Workflow & Survey Templates for Testing
-- Run this after creating the workflow system tables

-- ============================================================================
-- SAMPLE SURVEY TEMPLATES
-- ============================================================================

-- Post-Surgery Pain Assessment Survey
INSERT INTO survey_templates (name, description, category, questions, alert_rules, estimated_time_minutes)
VALUES (
    'Post-Surgery Pain Assessment - Day 1',
    'Daily pain level check after surgery',
    'post_surgery',
    '[
        {
            "id": "pain_level",
            "type": "rating",
            "text": "On a scale of 1-10, how would you rate your pain right now?",
            "scale": [1, 10],
            "required": true
        },
        {
            "id": "pain_location",
            "type": "text",
            "text": "Where is the pain located?",
            "required": true
        },
        {
            "id": "fever",
            "type": "yes_no",
            "text": "Do you have a fever (temperature above 100.4°F)?",
            "required": true,
            "critical_if": true
        },
        {
            "id": "medication_taken",
            "type": "yes_no",
            "text": "Have you taken your prescribed pain medication today?",
            "required": true
        }
    ]'::jsonb,
    '{
        "critical": {
            "pain_level": "> 8",
            "fever": true
        },
        "warning": {
            "pain_level": "> 5"
        }
    }'::jsonb,
    5
);

-- Wound Care Check Survey
INSERT INTO survey_templates (name, description, category, questions, alert_rules, estimated_time_minutes)
VALUES (
    'Wound Care Assessment',
    'Check for signs of infection or complications',
    'post_surgery',
    '[
        {
            "id": "wound_appearance",
            "type": "choice",
            "text": "How does your surgical wound look?",
            "options": ["Healing well - dry and clean", "Slightly red", "Very red or swollen", "Discharge or pus"],
            "required": true
        },
        {
            "id": "signs_infection",
            "type": "yes_no",
            "text": "Do you see any signs of infection (redness spreading, warmth, pus)?",
            "required": true,
            "critical_if": true
        },
        {
            "id": "wound_pain",
            "type": "rating",
            "text": "Rate the pain around your wound (1-10)",
            "scale": [1, 10],
            "required": true
        },
        {
            "id": "able_to_clean",
            "type": "yes_no",
            "text": "Are you able to clean and dress the wound as instructed?",
            "required": true
        }
    ]'::jsonb,
    '{
        "critical": {
            "signs_infection": true,
            "wound_appearance": "Discharge or pus"
        },
        "warning": {
            "wound_appearance": "Very red or swollen",
            "wound_pain": "> 7"
        }
    }'::jsonb,
    4
);

-- Recovery Progress Survey
INSERT INTO survey_templates (name, description, category, questions, alert_rules, estimated_time_minutes)
VALUES (
    'Post-Surgery Recovery Progress',
    'Overall recovery assessment',
    'post_surgery',
    '[
        {
            "id": "mobility",
            "type": "choice",
            "text": "How is your mobility?",
            "options": ["Moving normally", "Some difficulty", "Significant difficulty", "Unable to move"],
            "required": true
        },
        {
            "id": "appetite",
            "type": "choice",
            "text": "How is your appetite?",
            "options": ["Normal", "Reduced", "Very poor", "None"],
            "required": true
        },
        {
            "id": "sleep_quality",
            "type": "rating",
            "text": "Rate your sleep quality (1-10)",
            "scale": [1, 10],
            "required": true
        },
        {
            "id": "concerns",
            "type": "text",
            "text": "Do you have any other concerns or symptoms?",
            "required": false
        }
    ]'::jsonb,
    '{
        "warning": {
            "mobility": "Unable to move",
            "appetite": "None"
        }
    }'::jsonb,
    6
);

-- ============================================================================
-- SAMPLE WORKFLOW TEMPLATE: Post-Surgery Care
-- ============================================================================

-- Insert workflow template
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
    'Post-Surgery Recovery Monitoring',
    'Automated post-surgery patient monitoring workflow with daily check-ins and alerts',
    'post_surgery',
    'event',
    'surgery_completed',
    14,
    true
)
RETURNING id;

-- Note: In a real implementation, we would capture the returned ID and use it to create steps
-- For now, steps will need to be created programmatically or with the workflow_id from the above insert

-- Sample steps would include:
-- Day 0: Welcome message with post-surgery instructions
-- Day 1: Pain assessment survey
-- Day 3: Wound care check survey  
-- Day 7: Recovery progress survey
-- Day 14: Final follow-up and close workflow

-- ============================================================================
-- SAMPLE WORKFLOW TEMPLATE: Medication Refill Reminders
-- ============================================================================

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
    'Medication Refill Reminder Series',
    'Automated reminders for prescription refills',
    'medication',
    'event',
    'prescription_filled',
    30,
    true
);

-- ============================================================================
-- HELPER: Create workflow steps for Post-Surgery workflow
-- ============================================================================

-- First, get the workflow ID (you'll need to run the SELECT and use the ID)
-- Then create steps like this:

/*
-- Example step creation (replace <workflow_id> with actual ID):

-- Step 1: Day 0 - Welcome message
INSERT INTO workflow_steps (
    workflow_id,
    step_order,
    step_name,
    step_type,
    delay_days,
    condition_type,
    action_type,
    action_config
) VALUES (
    '<workflow_id>',
    1,
    'Post-Surgery Instructions',
    'send_message',
    0,
    'always',
    'send_email',
    '{"template_id": "post_surgery_instructions", "channel": "both"}'::jsonb
);

-- Step 2: Day 1 - Pain assessment
INSERT INTO workflow_steps (
    workflow_id,
    step_order,
    step_name,
    step_type,
    delay_days,
    condition_type,
    action_type,
    action_config
) VALUES (
    '<workflow_id>',
    2,
    'Day 1 Pain Assessment',
    'send_survey',
    1,
    'always',
    'send_survey',
    '{"survey_template": "Post-Surgery Pain Assessment - Day 1"}'::jsonb
);

-- Step 3: Day 3 - Wound care check
INSERT INTO workflow_steps (
    workflow_id,
    step_order,
    step_name,
    step_type,
    delay_days,
    condition_type,
    action_type,
    action_config
) VALUES (
    '<workflow_id>',
    3,
    'Wound Care Assessment',
    'send_survey',
    3,
    'always',
    'send_survey',
    '{"survey_template": "Wound Care Assessment"}'::jsonb
);

-- Step 4: Day 7 - Recovery progress
INSERT INTO workflow_steps (
    workflow_id,
    step_order,
    step_name,
    step_type,
    delay_days,
    condition_type,
    action_type,
    action_config
) VALUES (
    '<workflow_id>',
    4,
    'Recovery Progress Check',
    'send_survey',
    7,
    'always',
    'send_survey',
    '{"survey_template": "Post-Surgery Recovery Progress"}'::jsonb
);
*/

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Created 3 sample survey templates:
-- 1. Post-Surgery Pain Assessment (with critical alerts for high pain/fever)
-- 2. Wound Care Assessment (alerts for infection signs)
-- 3. Recovery Progress Survey
--
-- Created 2 sample workflow templates:
-- 1. Post-Surgery Recovery Monitoring (14-day workflow)
-- 2. Medication Refill Reminder Series (30-day workflow)
--
-- Next: Use the workflow builder UI to add steps, or create them programmatically
