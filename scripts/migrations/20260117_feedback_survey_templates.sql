-- Add Feedback, Survey & Follow-up Templates
-- Category 9: Feedback & Patient Satisfaction

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- General Patient Satisfaction Survey
('[FEEDBACK] Patient Satisfaction Survey', 'General satisfaction survey after any visit', 'general', 'email',
'We Value Your Feedback - {{hospital_name}}',
'Dear {{patient_name}},

Thank you for choosing {{hospital_name}} for your recent visit on {{visit_date}}.

We''d love to hear about your experience! Your feedback helps us improve our services.

📋 Quick Survey (2 minutes):
{{survey_url}}

Rate your experience:
• Facility cleanliness
• Staff friendliness
• Wait time
• Doctor consultation
• Overall satisfaction

As a thank you, you''ll be entered into our monthly prize draw!

Thank you,
{{hospital_name}} Patient Experience Team',
'["patient_name", "hospital_name", "visit_date", "survey_url"]'::jsonb,
true),

-- Post-Surgery Satisfaction
('[FEEDBACK] Post-Surgery Experience', 'Survey after surgical procedures', 'general', 'email',
'How Was Your Surgery Experience?',
'Dear {{patient_name}},

We hope your recovery from {{surgery_type}} is going well!

Please share your surgical experience with us:

🔗 Survey Link: {{survey_url}}

Your feedback covers:
• Pre-operative care
• Surgical team professionalism  
• Post-operative instructions
• Pain management
• Facility comfort
• Overall care quality

Your honest feedback improves care for future patients.

Best wishes for a speedy recovery,
{{hospital_name}} - Surgery Department',
'["patient_name", "surgery_type", "survey_url", "hospital_name"]'::jsonb,
true),

-- Doctor Rating Request
('[FEEDBACK] Rate Your Doctor', 'Request doctor rating after consultation', 'general', 'both',
'Rate Your Recent Consultation',
'Hi {{patient_name}},

How was your consultation with Dr. {{doctor_name}}?

⭐ Rate Dr. {{doctor_name}}: {{rating_url}}

Quick questions:
• Was the doctor attentive?
• Did you understand the diagnosis?
• Were your questions answered?
• Would you recommend this doctor?

Your feedback is confidential and helps us maintain quality care.

Thank you!
{{hospital_name}}',
'["patient_name", "doctor_name", "rating_url", "hospital_name"]'::jsonb,
true),

-- Net Promoter Score (NPS)
('[FEEDBACK] Net Promoter Score', 'NPS survey for hospital recommendation', 'general', 'sms',
NULL,
'{{patient_name}}, on a scale of 0-10, how likely are you to recommend {{hospital_name}} to friends/family? Reply with your rating. Thank you!',
'["patient_name", "hospital_name"]'::jsonb,
true),

-- Treatment Outcome Follow-up
('[FOLLOW-UP] Treatment Outcome Check', 'Check treatment effectiveness', 'follow_up', 'email',
'How Are You Feeling? - Treatment Follow-up',
'Dear {{patient_name}},

It''s been {{weeks_since_treatment}} weeks since your treatment for {{condition}}.

We''d like to check on your progress:

📋 Outcome Survey: {{survey_url}}

Please let us know:
• Symptom improvement
• Side effects (if any)
• Medication compliance
• Quality of life changes
• Any new concerns

Your feedback helps us ensure the treatment is working effectively.

Contact us anytime: {{contact_number}}

Wishing you continued health,
Dr. {{doctor_name}} & Team',
'["patient_name", "weeks_since_treatment", "condition", "survey_url", "contact_number", "doctor_name"]'::jsonb,
true),

-- Post-Discharge Follow-up
('[FOLLOW-UP] Post-Hospital Discharge', 'Follow up after hospital discharge', 'follow_up', 'both',
'How Are You Recovering?',
'Dear {{patient_name}},

You were discharged from {{hospital_name}} on {{discharge_date}}.

Quick check-in questions:

1. Are you following discharge instructions?
2. Are you experiencing any complications?
3. Do you have questions about medications?
4. Have you scheduled follow-up appointments?

📞 Need help? Call {{contact_number}}
🔗 Complete survey: {{survey_url}}

We''re here to support your recovery!

{{hospital_name}} - Patient Care Team',
'["patient_name", "hospital_name", "discharge_date", "contact_number", "survey_url"]'::jsonb,
true),

-- Medication Side Effects Survey
('[FOLLOW-UP] Medication Side Effects Check', 'Monitor for medication side effects', 'follow_up', 'email',
'Medication Check-in: {{medication_name}}',
'Dear {{patient_name}},

You''ve been taking {{medication_name}} for {{duration}}. We want to ensure it''s working well for you.

Please report:

✅ Effectiveness:
• Is the medication helping?
• Symptom improvement noticed?

⚠️ Side Effects:
• Any adverse reactions?
• Tolerability issues?

📋 Quick Survey: {{survey_url}}

Experiencing problems? Contact us immediately:
📞 {{contact_number}}

Your health is our priority!
Dr. {{doctor_name}}',
'["patient_name", "medication_name", "duration", "survey_url", "contact_number", "doctor_name"]'::jsonb,
true),

-- Emergency Department Experience
('[FEEDBACK] ER Experience Survey', 'Survey after emergency department visit', 'general', 'email',
'How Was Your Emergency Department Visit?',
'Dear {{patient_name}},

Thank you for trusting {{hospital_name}} Emergency Department during your time of need.

Your feedback on your ER visit:

🔗 Survey: {{survey_url}}

Rate:
• Wait time before being seen
• Staff responsiveness
• Communication clarity
• Treatment effectiveness
• Discharge instructions

Emergency care feedback helps us improve critical services.

Thank you,
{{hospital_name}} - Emergency Services',
'["patient_name", "hospital_name", "survey_url"]'::jsonb,
true),

-- Telehealth Consultation Feedback
('[FEEDBACK] Telehealth Satisfaction', 'Feedback on virtual consultations', 'general', 'email',
'Rate Your Virtual Consultation',
'Hi {{patient_name}},

How was your telehealth appointment with Dr. {{doctor_name}}?

📱 Virtual Care Survey: {{survey_url}}

Please rate:
• Video/audio quality
• Ease of connection
• Doctor interaction
• Diagnosis clarity
• Would you use telehealth again?

Your feedback shapes our virtual care services.

{{hospital_name}} - Telehealth Services',
'["patient_name", "doctor_name", "survey_url", "hospital_name"]'::jsonb,
true),

-- Billing Experience Feedback
('[FEEDBACK] Billing & Payment Experience', 'Survey about billing process', 'general', 'email',
'We Value Your Billing Feedback',
'Dear {{patient_name}},

We strive for transparency in our billing process. 

Please share your experience:

💳 Billing Survey: {{survey_url}}

Rate:
• Bill clarity and itemization
• Insurance processing
• Payment options
• Staff helpfulness
• Overall billing experience

Your feedback improves our financial services.

Questions? Contact billing:
📞 {{billing_contact}}

{{hospital_name}} - Finance Department',
'["patient_name", "survey_url", "billing_contact", "hospital_name"]'::jsonb,
true);

-- Summary: Added 10 feedback & follow-up templates
-- These cover post-visit surveys, treatment outcomes, medication monitoring,
-- and various satisfaction measurements
