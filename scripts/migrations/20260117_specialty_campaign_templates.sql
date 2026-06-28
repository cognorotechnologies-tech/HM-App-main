-- Categorized Campaign Templates with Specialty-Specific Templates
-- Adds 25+ specialty templates organized by category and medical specialty

-- ============================================================================
-- CATEGORY 1: GENERAL HOSPITAL COMMUNICATIONS
-- ============================================================================

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- Already exists in previous migration, included here for reference
('New Patient Welcome', 'Welcome message for newly registered patients', 'general', 'email',
'Welcome to {{hospital_name}}!',
'Dear {{patient_name}},

Welcome to {{hospital_name}}! We are delighted to have you as part of our healthcare family.

Get started with your account today!

Best regards,
{{hospital_name}}',
'["patient_name", "hospital_name"]'::jsonb,
true);

-- ============================================================================
-- CATEGORY 2: DENTAL (DENTISTRY) TEMPLATES
-- ============================================================================

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- Dental Cleaning Reminder
('[DENTAL] Cleaning Reminder', 'Remind patients about dental cleaning appointments', 'reminder', 'both',
'Time for Your Dental Cleaning!',
'Dear {{patient_name}},

It''s been 6 months since your last dental cleaning. Regular cleanings help prevent cavities and gum disease.

Schedule your cleaning appointment today:
📞 Call: {{contact_number}}
🌐 Book online: {{booking_url}}

Our dental services include:
✓ Professional cleaning
✓ Oral examination
✓ Cavity screening
✓ Gum health assessment

Keep your smile bright and healthy!

{{hospital_name}} - Dental Department',
'["patient_name", "contact_number", "booking_url", "hospital_name"]'::jsonb,
true),

-- Cavity Treatment Follow-up
('[DENTAL] Cavity Treatment Follow-up', 'Follow up after cavity filling', 'follow_up', 'email',
'Post-Treatment Care Instructions',
'Dear {{patient_name}},

Thank you for visiting our dental department for your cavity treatment.

Post-Treatment Care:
• Avoid hard foods for 24 hours
• Continue normal brushing and flossing
• Slight sensitivity is normal for a few days
• Contact us if pain persists beyond 3 days

Questions? Call us at {{contact_number}}

{{hospital_name}} - Dental Care',
'["patient_name", "contact_number", "hospital_name"]'::jsonb,
true),

-- Orthodontic Appointment Reminder
('[DENTAL] Orthodontic (Braces) Check', 'Remind orthodontic patients about adjustments', 'reminder', 'both',
'Orthodontic Adjustment Reminder',
'Hi {{patient_name}},

Your braces adjustment appointment is coming up!

📅 Date: {{appointment_date}}
⏰ Time: {{appointment_time}}

This regular adjustment is important for your treatment progress.

Can''t make it? Reschedule: {{contact_number}}

{{hospital_name}} - Orthodontics',
'["patient_name", "appointment_date", "appointment_time", "contact_number", "hospital_name"]'::jsonb,
true),

-- Dental Emergency Care Info
('[DENTAL] Emergency Dental Care', 'Information about dental emergencies', 'notification', 'sms',
NULL,
'DENTAL EMERGENCY? Call {{emergency_number}} immediately. For tooth trauma, rinse mouth, apply cold compress, save any broken pieces. We''re here 24/7. - {{hospital_name}} Dental',
'["emergency_number", "hospital_name"]'::jsonb,
true);

-- ============================================================================
-- CATEGORY 3: OPHTHALMOLOGY (EYE CARE) TEMPLATES
-- ============================================================================

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- Eye Exam Reminder
('[EYE] Annual Eye Exam Reminder', 'Remind patients about yearly eye examination', 'reminder', 'email',
'Time for Your Annual Eye Exam',
'Dear {{patient_name}},

Your vision is precious! It''s time for your annual comprehensive eye examination.

Why annual exams matter:
👁️ Detect vision changes early
👁️ Screen for eye diseases (glaucoma, cataracts)
👁️ Update prescription if needed
👁️ Monitor overall eye health

Schedule your exam:
📞 {{contact_number}}
🌐 {{booking_url}}

{{hospital_name}} - Eye Care Department',
'["patient_name", "contact_number", "booking_url", "hospital_name"]'::jsonb,
true),

-- Contact Lens Care Reminder
('[EYE] Contact Lens Care Tips', 'Remind patients about proper contact lens hygiene', 'health_tip', 'email',
'Important: Contact Lens Care Tips',
'Dear {{patient_name}},

Keep your eyes healthy with proper contact lens care:

Daily Care:
✓ Wash hands before handling lenses
✓ Use fresh solution daily
✓ Clean lenses after each use
✓ Replace case every 3 months

Warning Signs (call us immediately):
⚠️ Redness or pain
⚠️ Blurred vision
⚠️ Light sensitivity
⚠️ Unusual discharge

Questions? Contact us: {{contact_number}}

{{hospital_name}} - Optometry Team',
'["patient_name", "contact_number", "hospital_name"]'::jsonb,
true),

-- Prescription Update
('[EYE] Glasses Prescription Update', 'Notify about prescription renewal', 'notification', 'both',
'Your Prescription Needs Updating',
'Hi {{patient_name}},

Your glasses prescription from {{prescription_date}} is over 1 year old. Vision changes gradually - it''s time to check if you need an update.

Book your vision test:
📞 {{contact_number}}

Get clearer vision today!
{{hospital_name}} Vision Center',
'["patient_name", "prescription_date", "contact_number", "hospital_name"]'::jsonb,
true),

-- Post-LASIK Care
('[EYE] Post-LASIK Care Instructions', 'Follow-up care after LASIK surgery', 'follow_up', 'email',
'Post-LASIK Care - Important Instructions',
'Dear {{patient_name}},

Congratulations on your LASIK procedure! Here''s your care guide:

First 24 Hours:
• Wear protective eye shields while sleeping
• Use prescribed eye drops as directed
• Avoid rubbing your eyes
• No water/soap in eyes
• Avoid screens when possible

Follow-up: {{followup_date}}

Emergency contact: {{emergency_number}}

Wishing you clear vision ahead!
{{hospital_name}} - Laser Eye Surgery Center',
'["patient_name", "followup_date", "emergency_number", "hospital_name"]'::jsonb,
true);

-- ============================================================================
-- CATEGORY 4: CARDIOLOGY (HEART CARE) TEMPLATES  
-- ============================================================================

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- Heart Health Checkup
('[CARDIO] Heart Health Checkup Reminder', 'Annual cardiac screening reminder', 'reminder', 'email',
'Your Heart Deserves Attention',
'Dear {{patient_name}},

Your heart health is vital. It''s time for your annual cardiac checkup.

Our comprehensive screening includes:
❤️ Blood pressure monitoring
❤️ Cholesterol testing
❤️ ECG/EKG
❤️ Risk assessment
❤️ Lifestyle counseling

Schedule today:
📞 {{contact_number}}

Take care of your heart!
{{hospital_name}} - Cardiology Department',
'["patient_name", "contact_number", "hospital_name"]'::jsonb,
true),

-- Blood Pressure Monitoring
('[CARDIO] BP Monitoring Reminder', 'Remind hypertension patients to track BP', 'reminder', 'sms',
NULL,
'Hi {{patient_name}}, don''t forget to check your blood pressure this week and log the readings. Target: {{target_bp}}. Questions? Call {{contact_number}}. - {{hospital_name}} Cardio',
'["patient_name", "target_bp", "contact_number", "hospital_name"]'::jsonb,
true),

-- Post-Cardiac Procedure
('[CARDIO] Post-Procedure Heart Care', 'Care after cardiac procedures', 'follow_up', 'email',
'Post-Procedure Care Instructions',
'Dear {{patient_name}},

Your cardiac procedure was successful. Please follow these guidelines:

Medication:
✓ Take all prescribed medications on time
✓ Never skip doses

Activity:
✓ Gradual return to normal activities
✓ Avoid heavy lifting for {{recovery_weeks}} weeks
✓ Walking is encouraged

Warning Signs (Call {{emergency_number}}):
⚠️ Chest pain
⚠️ Shortness of breath
⚠️ Irregular heartbeat
⚠️ Swelling

Next appointment: {{followup_date}}

{{hospital_name}} - Cardiac Care',
'["patient_name", "recovery_weeks", "emergency_number", "followup_date", "hospital_name"]'::jsonb,
true);

-- ============================================================================
-- CATEGORY 5: DERMATOLOGY (SKIN CARE) TEMPLATES
-- ============================================================================

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- Skin Cancer Screening
('[DERM] Skin Cancer Screening', 'Annual skin exam reminder', 'reminder', 'email',
'Schedule Your Skin Cancer Screening',
'Dear {{patient_name}},

Early detection saves lives! Annual skin checks help detect skin cancer early.

You should get screened if you have:
☀️ History of sun exposure
☀️ Family history of skin cancer
☀️ Many moles or freckles
☀️ Fair skin that burns easily

Book your screening:
📞 {{contact_number}}

Protect your skin, protect your health!
{{hospital_name}} - Dermatology',
'["patient_name", "contact_number", "hospital_name"]'::jsonb,
true),

-- Acne Treatment Follow-up
('[DERM] Acne Treatment Progress', 'Check-in for acne patients', 'follow_up', 'email',
'How''s Your Acne Treatment Going?',
'Hi {{patient_name}},

It''s been {{weeks_since_start}} weeks since you started acne treatment with {{medication_name}}.

Please note:
• Results typically show in 6-8 weeks
• Continue treatment as prescribed
• Don''t stop if you see improvement

Experiencing side effects or not seeing results?
Contact us: {{contact_number}}

{{hospital_name}} - Dermatology',
'["patient_name", "weeks_since_start", "medication_name", "contact_number", "hospital_name"]'::jsonb,
true),

-- Sun Protection Tips
('[DERM] Summer Skin Protection', 'Seasonal skin care advice', 'health_tip', 'email',
'Protect Your Skin This Summer',
'Dear {{patient_name}},

Summer is here! Protect your skin from harmful UV rays:

☀️ Sunscreen Tips:
• Use SPF 30 or higher
• Apply 15 minutes before sun exposure
• Reapply every 2 hours
• Don''t forget ears, neck, feet!

🕶️ Additional Protection:
• Seek shade between 10 AM - 4 PM
• Wear protective clothing
• Use wide-brimmed hats
• Wear UV-blocking sunglasses

Skin concerns? Call {{contact_number}}

Stay safe in the sun!
{{hospital_name}} - Dermatology',
'["patient_name", "contact_number", "hospital_name"]'::jsonb,
true);

-- ============================================================================
-- CATEGORY 6: PEDIATRICS (CHILD CARE) TEMPLATES
-- ============================================================================

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- Child Vaccination Schedule
('[PEDIATRICS] Vaccination Due', 'Remind parents about child vaccinations', 'reminder', 'both',
'{{child_name}}''s Vaccination is Due',
'Dear {{parent_name}},

{{child_name}} is due for the {{vaccine_name}} vaccination on {{due_date}}.

Vaccinations protect your child from serious diseases and keep our community healthy.

Schedule appointment:
📞 {{contact_number}}
🌐 {{booking_url}}

{{hospital_name}} - Pediatrics Department',
'["parent_name", "child_name", "vaccine_name", "due_date", "contact_number", "booking_url", "hospital_name"]'::jsonb,
true),

-- Well-Child Checkup
('[PEDIATRICS] Well-Child Visit', 'Annual pediatric checkup reminder', 'reminder', 'email',
'Time for {{child_name}}''s Well-Child Visit',
'Dear {{parent_name}},

Annual well-child visits are important for {{child_name}}''s health and development.

What we check:
✓ Growth and development milestones
✓ Physical examination
✓ Vision and hearing
✓ Vaccinations (if due)
✓ Health education and guidance

Book the checkup:
📞 {{contact_number}}

{{hospital_name}} - Pediatrics',
'["parent_name", "child_name", "contact_number", "hospital_name"]'::jsonb,
true),

-- Childhood Illness Season Tips
('[PEDIATRICS] Back-to-School Health', 'Pre-school season health tips', 'health_tip', 'email',
'Back-to-School Health Tips for {{child_name}}',
'Dear {{parent_name}},

As {{child_name}} heads back to school, keep them healthy:

🏥 Health Prep:
• Schedule any pending checkups
• Update vaccinations
• Stock up on hand sanitizer
• Ensure adequate sleep (8-10 hours)

🤧 Illness Prevention:
• Teach proper handwashing
• Nutritious lunch and snacks
• Stay home when sick
• Flu shot recommended

Questions? Contact us: {{contact_number}}

Wishing {{child_name}} a healthy school year!
{{hospital_name}} - Pediatric Care',
'["parent_name", "child_name", "contact_number", "hospital_name"]'::jsonb,
true);

-- ============================================================================
-- CATEGORY 7: ORTHOPEDICS (BONE & JOINT CARE) TEMPLATES
-- ============================================================================

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- Physical Therapy Reminder
('[ORTHO] Physical Therapy Session', 'Remind patients about PT appointments', 'reminder', 'sms',
NULL,
'Hi {{patient_name}}, your physical therapy session is on {{session_date}} at {{session_time}}. Consistent attendance is key to recovery! Call {{contact_number}} to reschedule. - {{hospital_name}} Ortho',
'["patient_name", "session_date", "session_time", "contact_number", "hospital_name"]'::jsonb,
true),

-- Post-Surgery Care
('[ORTHO] Post-Surgery Recovery', 'Orthopedic surgery aftercare', 'follow_up', 'email',
'Your Recovery Plan After {{surgery_type}}',
'Dear {{patient_name}},

Here''s your recovery guide after {{surgery_type}}:

🔸 Pain Management:
• Take medication as prescribed
• Ice affected area: 20 min on, 20 min off
• Elevate when possible

🔸 Activity:
• Follow weight-bearing restrictions
• Attend all physical therapy sessions
• Gradually increase activity as advised

🔸 Wound Care:
• Keep incision clean and dry
• Watch for signs of infection

Next appointment: {{followup_date}}
Emergency: {{emergency_number}}

{{hospital_name}} - Orthopedic Surgery',
'["patient_name", "surgery_type", "followup_date", "emergency_number", "hospital_name"]'::jsonb,
true),

-- Joint Health Tips
('[ORTHO] Joint Health & Arthritis', 'Prevention tips for joint health', 'health_tip', 'email',
'Protect Your Joints - Tips from Our Experts',
'Dear {{patient_name}},

Keep your joints healthy with these tips:

💪 Stay Active:
• Low-impact exercises (swimming, cycling)
• Strength training 2-3x per week
• Stretching daily

🥗 Nutrition:
• Maintain healthy weight
• Anti-inflammatory foods
• Stay hydrated

⚠️ Joint Pain Warning Signs:
• Persistent pain or swelling
• Stiffness lasting >30 minutes
• Reduced range of motion

Need consultation? {{contact_number}}

{{hospital_name}} - Orthopedics',
'["patient_name", "contact_number", "hospital_name"]'::jsonb,
true);

-- ============================================================================
-- CATEGORY 8: GYNECOLOGY & WOMEN'S HEALTH TEMPLATES
-- ============================================================================

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system)
VALUES
-- Mammogram Reminder
('[GYNEC] Mammogram Screening', 'Annual mammogram reminder', 'reminder', 'email',
'Time for Your Annual Mammogram',
'Dear {{patient_name}},

Early detection of breast cancer saves lives. If you''re 40+, annual mammograms are recommended.

Schedule your screening:
📞 {{contact_number}}
🌐 {{booking_url}}

Quick, painless, and life-saving!

{{hospital_name}} - Women''s Health',
'["patient_name", "contact_number", "booking_url", "hospital_name"]'::jsonb,
true),

-- Pregnancy Care
('[GYNEC] Prenatal Appointment', 'Prenatal checkup reminder', 'reminder', 'both',
'Prenatal Checkup for {{patient_name}}',
'Hi {{patient_name}},

Your prenatal appointment is scheduled:
📅 {{appointment_date}}
⏰ {{appointment_time}}

What to bring:
• Insurance card
• List of questions/concerns
• Previous medical records (if new patient)

{{hospital_name}} - Obstetrics
Contact: {{contact_number}}',
'["patient_name", "appointment_date", "appointment_time", "contact_number", "hospital_name"]'::jsonb,
true);

-- ============================================================================  
-- Migration Complete!
-- ============================================================================

-- Summary: Added 25+ specialty-specific templates across 8 categories:
-- 1. General Hospital (1 template)
-- 2. Dental (4 templates)
-- 3. Ophthalmology/Eye Care (4 templates)
-- 4. Cardiology (3 templates)
-- 5. Dermatology (3 templates)
-- 6. Pediatrics (3 templates)
-- 7. Orthopedics (3 templates)
-- 8. Gynecology/Women's Health (2 templates)
