-- Seed Standard Hospital Survey Templates
-- Includes: General Patient Satisfaction, Outpatient Feedback, and Post-Discharge Follow-up

INSERT INTO survey_templates (id, name, description, category, is_active, questions, alert_rules, scoring_rules, created_by)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'General Patient Satisfaction (HCAHPS)',
    'Standard survey for inpatient experience covering nursing, doctor communication, and facility.',
    'Clinical',
    true,
    '[
        {
            "id": "q_nursing_1",
            "text": "How often did nurses treat you with courtesy and respect?",
            "type": "radio",
            "required": true,
            "options": ["Never", "Sometimes", "Usually", "Always"]
        },
        {
            "id": "q_nursing_2",
            "text": "How often did nurses listen carefully to you?",
            "type": "radio",
            "required": true,
            "options": ["Never", "Sometimes", "Usually", "Always"]
        },
        {
            "id": "q_doctor_1",
            "text": "How often did doctors treat you with courtesy and respect?",
            "type": "radio",
            "required": true,
            "options": ["Never", "Sometimes", "Usually", "Always"]
        },
        {
            "id": "q_doctor_2",
            "text": "How often did doctors explain things in a way you could understand?",
            "type": "radio",
            "required": true,
            "options": ["Never", "Sometimes", "Usually", "Always"]
        },
        {
            "id": "q_environment_1",
            "text": "During your hospital stay, how often were your room and bathroom kept clean?",
            "type": "radio",
            "required": true,
            "options": ["Never", "Sometimes", "Usually", "Always"]
        },
        {
            "id": "q_pain_1",
            "text": "How often was your pain well controlled?",
            "type": "radio",
            "required": true,
            "options": ["Never", "Sometimes", "Usually", "Always"]
        },
        {
            "id": "q_rating_overall",
            "text": "Using any number from 0 to 10, where 0 is the worst hospital possible and 10 is the best hospital possible, what number would you use to rate this hospital?",
            "type": "scale",
            "required": true,
            "scaleConfig": {"min": 0, "max": 10, "labels": {"0": "Worst", "10": "Best"}}
        },
        {
            "id": "q_recommend",
            "text": "Would you recommend this hospital to your friends and family?",
            "type": "radio",
            "required": true,
            "options": ["Definitely no", "Probably no", "Probably yes", "Definitely yes"]
        },
        {
            "id": "q_comments",
            "text": "Please provide any additional comments about your stay.",
            "type": "textarea",
            "required": false
        }
    ]'::jsonb,
    '{"critical": {"q_rating_overall": "< 5", "q_recommend": "Definitely no"}, "warning": {"q_nursing_1": "Never", "q_doctor_1": "Never"}}'::jsonb,
    '{}'::jsonb,
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '00000000-0000-0000-0000-000000000002',
    'Outpatient Clinic Feedback',
    'Short feedback form for outpatient consultations and clinic visits.',
    'General',
    true,
    '[
        {
            "id": "q_opd_wait",
            "text": "How long did you wait past your appointment time to be seen?",
            "type": "radio",
            "required": true,
            "options": ["Less than 15 mins", "15-30 mins", "30-60 mins", "More than 1 hour"]
        },
        {
            "id": "q_opd_staff",
            "text": "How satisfied were you with the courtesy of the reception staff?",
            "type": "star",
            "required": true,
            "maxStars": 5
        },
        {
            "id": "q_opd_doctor",
            "text": "How satisfied were you with the care provided by your doctor today?",
            "type": "star",
            "required": true,
            "maxStars": 5
        },
        {
            "id": "q_opd_clarity",
            "text": "Did you clearly understand your diagnosis and next steps?",
            "type": "radio",
            "required": true,
            "options": ["Yes, completely", "Somewhat", "No, I am confused"]
        },
        {
            "id": "q_opd_booking",
            "text": "How easy was it to schedule this appointment?",
            "type": "scale",
            "required": false,
            "scaleConfig": {"min": 1, "max": 5, "labels": {"1": "Very Difficult", "5": "Very Easy"}}
        }
    ]'::jsonb,
    '{"warning": {"q_opd_wait": "More than 1 hour", "q_opd_clarity": "No, I am confused"}}'::jsonb,
    '{}'::jsonb,
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '00000000-0000-0000-0000-000000000003',
    'Post-Discharge Recovery Check',
    'Follow-up survey sent 48 hours after discharge to monitor recovery.',
    'Clinical',
    true,
    '[
        {
            "id": "q_dc_instructions",
            "text": "Do you have your discharge instructions and prescriptions?",
            "type": "radio",
            "required": true,
            "options": ["Yes", "No"]
        },
        {
            "id": "q_dc_meds",
            "text": "Were you able to get your new medications?",
            "type": "radio",
            "required": true,
            "options": ["Yes", "No", "Not prescribed any"]
        },
        {
            "id": "q_dc_understanding",
            "text": "Do you understand how and when to take your medications?",
            "type": "radio",
            "required": true,
            "options": ["Yes", "No"]
        },
        {
            "id": "q_dc_symptoms",
            "text": "Have you experienced any worsening symptoms since leaving the hospital?",
            "type": "radio",
            "required": true,
            "options": ["No", "Yes - Mild", "Yes - Severe"]
        },
        {
            "id": "q_dc_help",
            "text": "Do you need a nurse or doctor to contact you?",
            "type": "radio",
            "required": true,
            "options": ["No", "Yes, routinely", "Yes, urgently"]
        }
    ]'::jsonb,
    '{"critical": {"q_dc_help": "Yes, urgently", "q_dc_symptoms": "Yes - Severe"}, "warning": {"q_dc_understanding": "No", "q_dc_meds": "No"}}'::jsonb,
    '{}'::jsonb,
    (SELECT id FROM auth.users LIMIT 1)
);
