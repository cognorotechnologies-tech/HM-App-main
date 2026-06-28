-- Production Clinical Workflows Migration
-- Creates 5 realistic, production-ready workflows for hospital automation
-- Author: Workflow Automation System
-- Date: 2026-01-17

-- =====================================================
-- 1. POST-OPERATIVE RECOVERY PROTOCOL
-- =====================================================

-- Insert workflow template
INSERT INTO workflow_templates (
    name, 
    description, 
    category, 
    trigger_event,
    is_active,
    version
) VALUES (
    'Post-Operative Recovery Protocol',
    'Comprehensive 14-day post-surgical monitoring and care coordination. Monitors pain levels, wound healing, and recovery progress through systematic surveys and check-ins.',
    'Clinical Care',
    'survey_alert',
    true,
    1
) RETURNING id;

-- Store the workflow ID for reference (in practice, you'll need to get this ID)
-- For this script, we'll use a variable approach

DO $$ 
DECLARE 
    v_postop_workflow_id UUID;
    v_med_adherence_workflow_id UUID;
    v_highrisk_workflow_id UUID;
    v_diabetes_workflow_id UUID;
    v_noshow_workflow_id UUID;
BEGIN

-- Get the workflow IDs we just created
SELECT id INTO v_postop_workflow_id FROM workflow_templates WHERE name = 'Post-Operative Recovery Protocol';

-- Insert workflow steps for Post-Op Recovery
INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, action_type, action_config, delay_days, delay_hours) VALUES
(v_postop_workflow_id, 1, 'Send Immediate Post-Op Care Instructions', 'send_message', 'notification', 
 '{"channel": "email", "subject": "Your Post-Surgery Care Instructions", "message": "Dear {{patient.first_name}},\n\nThank you for choosing our hospital for your surgery. Here are important post-operative care instructions:\n\n• Take medications as prescribed\n• Keep the surgical site clean and dry\n• Watch for signs of infection (redness, swelling, fever)\n• Rest and avoid strenuous activity\n• Call us immediately if you experience severe pain or bleeding\n\nYour recovery is our priority. We will check in with you regularly.\n\nBest regards,\n{{workflow.name}} Team"}'::jsonb, 
 0, 0),

(v_postop_workflow_id, 2, 'Day 1 - Pain Management Survey', 'send_survey', 'assessment', 
 '{"survey_template_id": "pain-assessment", "channel": "email", "message": "Please complete this quick pain assessment so we can ensure your comfort during recovery."}'::jsonb,
 1, 0),

(v_postop_workflow_id, 3, 'Day 3 - Wound Healing Check', 'send_survey', 'assessment',
 '{"survey_template_id": "wound-check", "channel": "email", "message": "Time for a wound healing check. Please answer a few questions about your surgical site."}'::jsonb,
 3, 0),

(v_postop_workflow_id, 4, 'Day 7 - Schedule Follow-Up Appointment', 'send_message', 'reminder',
 '{"channel": "email", "subject": "Schedule Your Follow-Up Appointment", "message": "Dear {{patient.first_name}},\n\nYou are one week post-surgery! It''s time to schedule your follow-up appointment with Dr. {{doctor.name}}.\n\nPlease call our office at (555) 123-4567 or use our patient portal to book your appointment.\n\nRecommended timing: Within the next 7 days\n\nSee you soon!"}'::jsonb,
 7, 0),

(v_postop_workflow_id, 5, 'Day 14 - Final Recovery Assessment', 'send_survey', 'assessment',
 '{"survey_template_id": "recovery-complete", "channel": "email", "message": "Congratulations on two weeks of recovery! Please complete this final assessment to help us ensure you''re healing well."}'::jsonb,
 14, 0);

-- Configure trigger for Post-Op Recovery
INSERT INTO workflow_triggers (workflow_template_id, trigger_type, trigger_config, is_active)
VALUES (
    v_postop_workflow_id,
    'survey_alert',
    '{"alert_severity": 4, "keywords": ["surgery", "operation", "post-op", "surgical"]}'::jsonb,
    true
);

-- =====================================================
-- 2. MEDICATION ADHERENCE MONITORING
-- =====================================================

INSERT INTO workflow_templates (name, description, category, trigger_event, is_active, version)
VALUES (
    'Medication Adherence Monitoring',
    'Proactive intervention for patients struggling with medication compliance. Includes educational messages, nurse follow-ups, and escalation to physician if needed.',
    'Chronic Care',
    'survey_response',
    true,
    1
);

SELECT id INTO v_med_adherence_workflow_id FROM workflow_templates WHERE name = 'Medication Adherence Monitoring';

INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, action_type, action_config, delay_days) VALUES
(v_med_adherence_workflow_id, 1, 'Send Medication Importance Reminder', 'send_message', 'education',
 '{"channel": "email", "subject": "The Importance of Taking Your Medications", "message": "Dear {{patient.first_name}},\n\nWe noticed you may be having challenges with your medications. Taking your prescribed medications consistently is crucial for:\n\n• Managing your condition effectively\n• Preventing complications\n• Improving your quality of life\n\nCommon barriers and solutions:\n• Forgetting doses → Set phone alarms\n• Cost concerns → Ask about generic alternatives\n• Side effects → Contact us immediately\n\nWe''re here to help! Let us know if you''re experiencing any issues.\n\nYour Health Team"}'::jsonb,
 0),

(v_med_adherence_workflow_id, 2, 'Create Nurse Follow-Up Task', 'create_task', 'staff_action',
 '{"task_title": "Call patient about medication adherence", "task_description": "Patient {{patient.name}} reported medication adherence <60%. Discuss barriers, provide support, and document conversation.", "priority": "high", "assigned_role": "nurse"}'::jsonb,
 2),

(v_med_adherence_workflow_id, 3, 'Send Medication Refill Reminder', 'send_message', 'reminder',
 '{"channel": "email", "subject": "Time for Your Medication Refill", "message": "Hello {{patient.first_name}},\n\nThis is a friendly reminder to check your medication supply. If you''re running low:\n\n1. Contact your pharmacy for a refill\n2. Or call our office if you need a new prescription\n3. Never skip doses while waiting for refills\n\nStaying on track with your medications is essential for your health.\n\nNeed help? Call us at (555) 123-4567"}'::jsonb,
 7),

(v_med_adherence_workflow_id, 4, 'Send Adherence Check Survey', 'send_survey', 'assessment',
 '{"survey_template_id": "medication-adherence", "channel": "email", "message": "Quick check-in: How are you doing with your medications over the past two weeks?"}'::jsonb,
 14),

(v_med_adherence_workflow_id, 5, 'Create Doctor Notification (If Still Non-Adherent)', 'create_task', 'staff_action',
 '{"task_title": "Review medication adherence for patient", "task_description": "Patient {{patient.name}} continues to show low medication adherence after 3 weeks. Consider medication adjustment, simplification, or specialist referral.", "priority": "medium", "assigned_role": "doctor"}'::jsonb,
 21);

INSERT INTO workflow_triggers (workflow_template_id, trigger_type, trigger_config, is_active)
VALUES (
    v_med_adherence_workflow_id,
    'survey_alert',
    '{"alert_severity": 3, "keywords": ["medication", "adherence", "compliance", "skipping"]}'::jsonb,
    true
);

-- =====================================================
-- 3. HIGH-RISK PATIENT MONITORING
-- =====================================================

INSERT INTO workflow_templates (name, description, category, trigger_event, is_active, version)
VALUES (
    'High-Risk Patient Monitoring',
    'Intensive monitoring protocol for patients showing critical symptoms. Ensures rapid response and escalation to prevent emergency situations.',
    'Critical Care',
    'survey_alert',
    true,
    1
);

SELECT id INTO v_highrisk_workflow_id FROM workflow_templates WHERE name = 'High-Risk Patient Monitoring';

INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, action_type, action_config, delay_days, delay_hours) VALUES
(v_highrisk_workflow_id, 1, 'Create Urgent Nurse Contact Task', 'create_task', 'staff_action',
 '{"task_title": "URGENT: Contact patient immediately", "task_description": "Critical alert for {{patient.name}}. Contact patient NOW to assess condition and determine if emergency care is needed. Severity Level: 5 (Critical)", "priority": "urgent", "assigned_role": "nurse"}'::jsonb,
 0, 0),

(v_highrisk_workflow_id, 2, 'Send Symptom Tracking Survey', 'send_survey', 'assessment',
 '{"survey_template_id": "symptom-tracker", "channel": "sms", "message": "Urgent health check needed. Please complete this brief assessment immediately."}'::jsonb,
 0, 1),

(v_highrisk_workflow_id, 3, 'Create Doctor Notification (No Response)', 'create_task', 'staff_action',
 '{"task_title": "Critical patient alert - no response", "task_description": "Patient {{patient.name}} showed critical symptoms 4 hours ago. Patient has not responded to outreach. Physician review and possible emergency intervention required.", "priority": "urgent", "assigned_role": "doctor"}'::jsonb,
 0, 4),

(v_highrisk_workflow_id, 4, 'Schedule Emergency Appointment', 'create_task', 'scheduling',
 '{"task_title": "Schedule emergency appointment", "task_description": "Schedule urgent appointment for {{patient.name}} within next 24 hours due to critical health alert.", "priority": "urgent", "assigned_role": "admin"}'::jsonb,
 1, 0),

(v_highrisk_workflow_id, 5, 'Send Follow-Up Care Instructions', 'send_message', 'care_plan',
 '{"channel": "email", "subject": "Your Care Plan Following Recent Health Concerns", "message": "Dear {{patient.first_name}},\n\nFollowing your recent health concerns, here is your personalized care plan:\n\n• Take all medications as prescribed\n• Monitor symptoms closely\n• Report any worsening immediately\n• Attend all scheduled appointments\n• Keep emergency contact numbers handy\n\n24/7 Emergency Line: (555) 911-HLTH\n\nYour health is our top priority."}'::jsonb,
 2, 0);

INSERT INTO workflow_triggers (workflow_template_id, trigger_type, trigger_config, is_active)
VALUES (
    v_highrisk_workflow_id,
    'survey_alert',
    '{"alert_severity": 5}'::jsonb,
    true
);

-- =====================================================
-- 4. CHRONIC DISEASE MANAGEMENT (DIABETES)
-- =====================================================

INSERT INTO workflow_templates (name, description, category, trigger_event, is_active, version)
VALUES (
    'Chronic Disease Management - Diabetes',
    'Comprehensive diabetes management protocol triggered by elevated blood sugar readings. Includes dietary guidance, medication review, and specialist coordination.',
    'Chronic Care',
    'health_metric_alert',
    true,
    1
);

SELECT id INTO v_diabetes_workflow_id FROM workflow_templates WHERE name = 'Chronic Disease Management - Diabetes';

INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, action_type, action_config, delay_days) VALUES
(v_diabetes_workflow_id, 1, 'Send Blood Sugar Management Tips', 'send_message', 'education',
 '{"channel": "email", "subject": "Managing Your Blood Sugar Levels", "message": "Dear {{patient.first_name}},\n\nWe noticed your recent blood sugar reading was elevated. Here are some tips to help:\n\n• Monitor your carbohydrate intake\n• Exercise regularly (30 min/day)\n• Take medications as prescribed\n• Stay hydrated\n• Manage stress levels\n• Get adequate sleep\n\nQuick actions you can take today:\n1. Check your blood sugar before and after meals\n2. Review your meal plan\n3. Ensure you''re taking all medications\n\nWe''re scheduling consultations to support your diabetes management.\n\nYour Care Team"}'::jsonb,
 0),

(v_diabetes_workflow_id, 2, 'Create Dietitian Consultation Task', 'create_task', 'scheduling',
 '{"task_title": "Schedule dietitian consultation", "task_description": "Patient {{patient.name}} has elevated blood sugar. Schedule dietitian appointment for meal planning and carb counting education.", "priority": "high", "assigned_role": "admin"}'::jsonb,
 1),

(v_diabetes_workflow_id, 3, 'Send Dietary Tracking Survey', 'send_survey', 'assessment',
 '{"survey_template_id": "dietary-log", "channel": "email", "message": "Please complete this 3-day dietary log to help us optimize your nutrition plan."}'::jsonb,
 3),

(v_diabetes_workflow_id, 4, 'Send Medication Adjustment Reminder', 'send_message', 'reminder',
 '{"channel": "email", "subject": "Diabetes Medication Review", "message": "Hello {{patient.first_name}},\n\nIt''s been a week since your elevated blood sugar reading. If your levels remain high:\n\n• Your doctor may need to adjust your medications\n• Call office to discuss your recent readings\n• Bring your blood sugar log to your next appointment\n\nDon''t wait - uncontrolled diabetes can lead to serious complications.\n\nCall us today: (555) 123-4567"}'::jsonb,
 7),

(v_diabetes_workflow_id, 5, 'Schedule Endocrinologist Follow-Up', 'create_task', 'scheduling',
 '{"task_title": "Schedule endocrinologist appointment", "task_description": "Patient {{patient.name}} needs endocrinologist review for persistent hyperglycemia. Priority scheduling required.", "priority": "high", "assigned_role": "admin"}'::jsonb,
 14);

INSERT INTO workflow_triggers (workflow_template_id, trigger_type, trigger_config, is_active)
VALUES (
    v_diabetes_workflow_id,
    'survey_alert',
    '{"alert_severity": 4, "keywords": ["diabetes", "blood sugar", "glucose", "hyperglycemia"]}'::jsonb,
    true
);

-- =====================================================
-- 5. APPOINTMENT NO-SHOW FOLLOW-UP
-- =====================================================

INSERT INTO workflow_templates (name, description, category, trigger_event, is_active, version)
VALUES (
    'Appointment No-Show Follow-Up',
    'Re-engagement protocol for patients who miss scheduled appointments. Focuses on understanding barriers and facilitating rescheduling to maintain continuity of care.',
    'Administrative',
    'appointment_status',
    true,
    1
);

SELECT id INTO v_noshow_workflow_id FROM workflow_templates WHERE name = 'Appointment No-Show Follow-Up';

INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_type, action_type, action_config, delay_days, delay_hours) VALUES
(v_noshow_workflow_id, 1, 'Send "We Missed You" Message', 'send_message', 'engagement',
 '{"channel": "sms", "message": "Hi {{patient.first_name}}, we noticed you missed your appointment today. We hope everything is okay. Please call us to reschedule: (555) 123-4567"}'::jsonb,
 0, 2),

(v_noshow_workflow_id, 2, 'Send Rescheduling Options', 'send_message', 'scheduling',
 '{"channel": "email", "subject": "Easy Rescheduling - We''re Here When You Need Us", "message": "Dear {{patient.first_name}},\n\nLife gets busy - we understand! We wanted to make it easy for you to reschedule your recent missed appointment.\n\nThree easy ways to reschedule:\n1. Call us: (555) 123-4567\n2. Patient Portal: schedule online 24/7\n3. Reply to this email with your preferred times\n\nAvailable slots this week:\n• Tuesday 2:00 PM\n• Wednesday 10:30 AM\n• Friday 3:00 PM\n\nYour health is important. We look forward to seeing you soon!\n\nYour Care Team"}'::jsonb,
 1, 0),

(v_noshow_workflow_id, 3, 'Create Staff Follow-Up Call Task', 'create_task', 'staff_action',
 '{"task_title": "Call patient to reschedule appointment", "task_description": "Patient {{patient.name}} has not rescheduled after missing appointment 3 days ago. Call to understand barriers and help schedule new appointment.", "priority": "medium", "assigned_role": "admin"}'::jsonb,
 3, 0),

(v_noshow_workflow_id, 4, 'Send Importance of Regular Checkups Message', 'send_message', 'education',
 '{"channel": "email", "subject": "Why Regular Checkups Matter", "message": "Dear {{patient.first_name}},\n\nWe haven''t seen you in a while, and we wanted to reach out. Regular checkups are important because they:\n\n• Catch health issues early when they''re easier to treat\n• Help manage chronic conditions effectively\n• Update your medications and treatment plans\n• Build a relationship with your care team\n• Give you peace of mind about your health\n\nWe''re committed to your wellness. Even if you''re feeling fine, preventive care is the best care.\n\nLet''s get you back on track - call us today!\n\nWith care,\nYour Medical Team"}'::jsonb,
 7, 0),

(v_noshow_workflow_id, 5, 'Final Rescheduling Reminder', 'send_message', 'reminder',
 '{"channel": "sms", "message": "{{patient.first_name}}, it''s been 2 weeks since your missed appointment. We care about your health! Please call (555) 123-4567 to reschedule. Your doctor wants to see you."}'::jsonb,
 14, 0);

INSERT INTO workflow_triggers (workflow_template_id, trigger_type, trigger_config, is_active)
VALUES (
    v_noshow_workflow_id,
    'survey_alert',
    '{"alert_severity": 2, "keywords": ["missed", "no-show", "appointment", "cancelled"]}'::jsonb,
    true
);

END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all workflows were created
SELECT 
    name,
    category,
    trigger_event,
    is_active,
    (SELECT COUNT(*) FROM workflow_steps WHERE workflow_id = workflow_templates.id) as step_count
FROM workflow_templates
WHERE name IN (
    'Post-Operative Recovery Protocol',
    'Medication Adherence Monitoring',
    'High-Risk Patient Monitoring',
    'Chronic Disease Management - Diabetes',
    'Appointment No-Show Follow-Up'
)
ORDER BY name;

-- Verify all triggers were configured
SELECT 
    wt.name as workflow_name,
    wtrig.trigger_type,
    wtrig.trigger_config,
    wtrig.is_active
FROM workflow_triggers wtrig
JOIN workflow_templates wt ON wtrig.workflow_template_id = wt.id
WHERE wt.name IN (
    'Post-Operative Recovery Protocol',
    'Medication Adherence Monitoring',
    'High-Risk Patient Monitoring',
    'Chronic Disease Management - Diabetes',
    'Appointment No-Show Follow-Up'
)
ORDER BY wt.name;

-- Summary statistics
SELECT 
    (SELECT COUNT(*) FROM workflow_templates WHERE name LIKE '%Post-Operative%' OR name LIKE '%Medication Adherence%' OR name LIKE '%High-Risk%' OR name LIKE '%Diabetes%' OR name LIKE '%No-Show%') as total_workflows,
    (SELECT COUNT(*) FROM workflow_steps WHERE workflow_id IN (
        SELECT id FROM workflow_templates WHERE name LIKE '%Post-Operative%' OR name LIKE '%Medication Adherence%' OR name LIKE '%High-Risk%' OR name LIKE '%Diabetes%' OR name LIKE '%No-Show%'
    )) as total_steps,
    (SELECT COUNT(*) FROM workflow_triggers WHERE workflow_template_id IN (
        SELECT id FROM workflow_templates WHERE name LIKE '%Post-Operative%' OR name LIKE '%Medication Adherence%' OR name LIKE '%High-Risk%' OR name LIKE '%Diabetes%' OR name LIKE '%No-Show%'
    )) as total_triggers;
