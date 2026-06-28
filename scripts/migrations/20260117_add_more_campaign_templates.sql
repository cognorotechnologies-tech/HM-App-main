-- Add Additional Campaign Templates
-- This adds 15 more useful templates for hospital communications

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- Post-Consultation Follow-up
('Post-Consultation Follow-up', 'Follow up with patients after their consultation', 'follow_up', 'email', 
'Follow-up: Your Recent Consultation',
'Dear {{patient_name}},

Thank you for visiting us on {{appointment_date}}. We hope you are feeling better.

Dr. {{doctor_name}} wanted to remind you to:
- Take your prescribed medications as directed
- Schedule a follow-up if symptoms persist
- Contact us immediately if you experience any concerns

Your health is our priority. Feel free to reach out if you have any questions.

Best regards,
{{hospital_name}}',
'["patient_name", "appointment_date", "doctor_name", "hospital_name"]'::jsonb,
true),

-- Lab Results Ready (Email)
('Lab Results Ready - Email', 'Notify patients when lab results are available', 'notification', 'email',
'Your Lab Results Are Ready',
'Dear {{patient_name}},

Your lab test results from {{test_date}} are now available.

Please log in to your patient portal or visit our clinic to review your results with Dr. {{doctor_name}}.

If you have any questions about your results, please contact us at {{contact_number}}.

Best regards,
{{hospital_name}}',
'["patient_name", "test_date", "doctor_name", "contact_number", "hospital_name"]'::jsonb,
true),

-- Lab Results Ready (SMS)
('Lab Results Ready - SMS', 'SMS notification for lab results', 'notification', 'sms',
NULL,
'Hi {{patient_name}}, your lab results from {{test_date}} are ready. Please contact us at {{contact_number}} or visit your patient portal. - {{hospital_name}}',
'["patient_name", "test_date", "contact_number", "hospital_name"]'::jsonb,
true),

-- Prescription Reminder
('Prescription Refill Reminder', 'Remind patients to refill prescriptions', 'reminder', 'both',
'Time to Refill Your Prescription',
'Dear {{patient_name}},

This is a reminder that your prescription for {{medication_name}} may be running low.

Please contact us to refill your prescription or schedule an appointment with Dr. {{doctor_name}} if needed.

Contact: {{contact_number}}

Stay healthy,
{{hospital_name}}',
'["patient_name", "medication_name", "doctor_name", "contact_number", "hospital_name"]'::jsonb,
true),

-- Vaccination Reminder
('Vaccination Due Reminder', 'Remind patients about upcoming vaccinations', 'reminder', 'email',
'Vaccination Reminder for {{patient_name}}',
'Dear {{patient_name}},

According to our records, you are due for your {{vaccine_name}} vaccination.

We recommend scheduling an appointment soon to stay protected and healthy.

Book your appointment:
- Call: {{contact_number}}
- Online: {{booking_url}}

Best regards,
{{hospital_name}}',
'["patient_name", "vaccine_name", "contact_number", "booking_url", "hospital_name"]'::jsonb,
true),

-- Annual Health Checkup
('Annual Health Checkup Reminder', 'Encourage patients to schedule annual checkups', 'promotional', 'email',
'It''s Time for Your Annual Health Checkup!',
'Dear {{patient_name}},

It has been a year since your last comprehensive health checkup. Regular checkups help detect health issues early and keep you in optimal health.

Schedule your annual checkup today:
📞 Call: {{contact_number}}
🌐 Online: {{booking_url}}

Our comprehensive checkup includes:
✓ Physical examination
✓ Blood tests
✓ Health consultation
✓ Personalized health advice

Take charge of your health today!

{{hospital_name}}',
'["patient_name", "contact_number", "booking_url", "hospital_name"]'::jsonb,
true),

-- Payment Reminder (Email)
('Payment Due Reminder - Email', 'Remind patients about pending payments', 'reminder', 'email',
'Payment Reminder: Invoice #{{invoice_number}}',
'Dear {{patient_name}},

This is a friendly reminder that payment for Invoice #{{invoice_number}} is due.

Amount Due: {{amount}}
Due Date: {{due_date}}

Payment can be made:
- Online via patient portal
- At our reception desk
- By calling {{contact_number}}

If you have already made this payment, please disregard this message.

Thank you,
{{hospital_name}} Billing Department',
'["patient_name", "invoice_number", "amount", "due_date", "contact_number", "hospital_name"]'::jsonb,
true),

-- Payment Reminder (SMS)
('Payment Due Reminder - SMS', 'SMS reminder for pending payments', 'reminder', 'sms',
NULL,
'Hi {{patient_name}}, Invoice #{{invoice_number}} of {{amount}} is due on {{due_date}}. Pay online or call {{contact_number}}. Thank you! - {{hospital_name}}',
'["patient_name", "invoice_number", "amount", "due_date", "contact_number", "hospital_name"]'::jsonb,
true),

-- New Patient Welcome
('New Patient Welcome', 'Welcome message for newly registered patients', 'general', 'email',
'Welcome to {{hospital_name}}!',
'Dear {{patient_name}},

Welcome to {{hospital_name}}! We are delighted to have you as part of our healthcare family.

Here''s what you can do with your patient account:
✓ Book appointments online
✓ View your medical records
✓ Access lab results
✓ Manage prescriptions
✓ Contact your healthcare team

Need help getting started?
📞 Call us: {{contact_number}}
🌐 Visit: {{website_url}}

We look forward to serving your healthcare needs!

Warm regards,
{{hospital_name}} Team',
'["patient_name", "hospital_name", "contact_number", "website_url"]'::jsonb,
true),

-- Doctor Availability Update
('Doctor Availability Update', 'Notify patients about doctor schedule changes', 'notification', 'both',
'Update: Dr. {{doctor_name}} Schedule Change',
'Dear Patient,

We wanted to inform you about a change in Dr. {{doctor_name}}''s availability.

{{schedule_message}}

If you have an affected appointment, our team will contact you directly to reschedule.

For urgent concerns, please contact us at {{contact_number}}.

Thank you for your understanding.

{{hospital_name}}',
'["doctor_name", "schedule_message", "contact_number", "hospital_name"]'::jsonb,
true),

-- Seasonal Health Tips (Winter)
('Winter Health Tips', 'Seasonal health advice for winter', 'health_tip', 'email',
'Stay Healthy This Winter - Tips from {{hospital_name}}',
'Dear {{patient_name}},

As winter approaches, here are some essential health tips to keep you and your family healthy:

🧥 Stay Warm
- Dress in layers
- Keep your home heated adequately

💧 Stay Hydrated
- Drink plenty of water despite the cold
- Include warm soups and herbal teas

💪 Boost Your Immunity
- Eat vitamin-rich foods
- Get adequate sleep (7-8 hours)
- Regular exercise

🤧 Prevent Flu & Cold
- Wash hands frequently
- Get your flu vaccination
- Avoid touching your face

Need medical advice? Contact us anytime:
📞 {{contact_number}}

Stay healthy and warm!
{{hospital_name}}',
'["patient_name", "contact_number", "hospital_name"]'::jsonb,
true),

-- Appointment Confirmation (Email)
('Appointment Confirmation - Email', 'Confirm scheduled appointments via email', 'appointment_reminder', 'email',
'Appointment Confirmed: {{appointment_date}}',
'Dear {{patient_name}},

Your appointment has been confirmed!

📅 Date: {{appointment_date}}
⏰ Time: {{appointment_time}}
👨‍⚕️ Doctor: Dr. {{doctor_name}}
📍 Location: {{location}}

Important Reminders:
- Please arrive 10 minutes early
- Bring your ID and insurance card
- Bring any relevant medical records

Need to reschedule? Contact us:
📞 {{contact_number}}

We look forward to seeing you!

{{hospital_name}}',
'["patient_name", "appointment_date", "appointment_time", "doctor_name", "location", "contact_number", "hospital_name"]'::jsonb,
true),

-- Missed Appointment Follow-up
('Missed Appointment Follow-up', 'Follow up with patients who missed appointments', 'follow_up', 'both',
'We Missed You: Reschedule Your Appointment',
'Dear {{patient_name}},

We noticed you were unable to attend your scheduled appointment on {{appointment_date}} with Dr. {{doctor_name}}.

Your health is important to us. Please reschedule at your earliest convenience:

📞 Call: {{contact_number}}
🌐 Online: {{booking_url}}

We understand things come up. We''re here to help when you''re ready.

Best regards,
{{hospital_name}}',
'["patient_name", "appointment_date", "doctor_name", "contact_number", "booking_url", "hospital_name"]'::jsonb,
true),

-- Feedback Request
('Patient Feedback Request', 'Request feedback after visit', 'general', 'email',
'We Value Your Feedback!',
'Dear {{patient_name}},

Thank you for visiting {{hospital_name}} recently. We hope you had a positive experience with Dr. {{doctor_name}} and our team.

Your feedback helps us improve our services. Please take 2 minutes to share your experience:

🔗 {{feedback_url}}

As a token of appreciation, you''ll be entered into our monthly prize draw!

Thank you for choosing us for your healthcare needs.

Warm regards,
{{hospital_name}} Team',
'["patient_name", "hospital_name", "doctor_name", "feedback_url"]'::jsonb,
true),

-- Emergency Contact Update Request
('Emergency Contact Update', 'Request patients update emergency contacts', 'notification', 'email',
'Please Update Your Emergency Contact Information',
'Dear {{patient_name}},

It''s important to keep your emergency contact information up to date for your safety.

Please take a moment to review and update:
- Emergency contact person
- Contact phone numbers
- Any allergies or medical conditions

Update your information:
🌐 Patient Portal: {{portal_url}}
📞 Call us: {{contact_number}}

Thank you for helping us provide you with the best care.

{{hospital_name}}',
'["patient_name", "portal_url", "contact_number", "hospital_name"]'::jsonb,
true);

-- ✅ Migration complete! You now have 20 total system templates (5 original + 15 new)
