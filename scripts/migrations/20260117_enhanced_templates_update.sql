-- Enhanced Campaign Templates - Update Existing Templates
-- This updates existing templates to have more engaging, attractive messages

-- Update Post-Consultation Follow-up
UPDATE campaign_templates SET
  subject = '💙 We Hope You''re Feeling Better!',
  body = 'Dear {{patient_name}},

🌟 Thank you for trusting us with your health!

We hope you''re feeling better after your visit on {{appointment_date}}. Dr. {{doctor_name}} wanted to personally reach out with some important reminders:

✅ **Your Action Items:**
   • Take prescribed medications exactly as directed
   • Schedule a follow-up if symptoms persist  
   • Contact us immediately if you have any concerns

💬 **We''re Here For You**
Your health journey doesn''t end at the consultation. Our team is always just a phone call away!

📞 Questions? Call us anytime!

Wishing you a speedy recovery! 🌈

With care,
{{hospital_name}} Team'
WHERE name = 'Post-Consultation Follow-up' AND is_system = true;

-- Update Lab Results Ready - Email
UPDATE campaign_templates SET
  subject = '📊 Your Lab Results Are Ready!',
  body = 'Dear {{patient_name}},

🎉 **Great News!** Your lab results from {{test_date}} are now available.

🔍 **Next Steps:**
   1. Log in to your patient portal to view results
   2. OR visit our clinic to discuss with Dr. {{doctor_name}}
   3. Bring any questions you might have!

❓ **Have Questions?**
Don''t hesitate! Call us at {{contact_number}} and we''ll walk you through everything.

💚 **Remember:** Early understanding leads to better health outcomes!

Best regards,
{{hospital_name}} Care Team'
WHERE name = 'Lab Results Ready - Email' AND is_system = true;

-- Update Prescription Refill Reminder
UPDATE campaign_templates SET
  subject = '💊 Time to Refill: {{medication_name}}',
  body = 'Hi {{patient_name}},

⏰ **Friendly Reminder:** Your prescription for {{medication_name}} may be running low.

🏥 **Easy Refill Options:**
   📞 Call us: {{contact_number}}
   💻 Order online through patient portal
   🚶 Walk-in during office hours

👨‍⚕️ **Need to consult Dr. {{doctor_name}}?** We can schedule that too!

⚠️ **Important:** Don''t let your medication run out. Consistent treatment = Better results!

Stay healthy! 💙
{{hospital_name}}'
WHERE name = 'Prescription Refill Reminder' AND is_system = true;

-- Update Vaccination Due Reminder
UPDATE campaign_templates SET
  subject = '💉 Important: {{vaccine_name}} Vaccination Due',
  body = 'Dear {{patient_name}},

🛡️ **Protect Your Health!**

According to our records, you''re due for your {{vaccine_name}} vaccination. Staying up-to-date with vaccinations is one of the best ways to protect yourself and your loved ones!

✨ **Why It Matters:**
   • Prevents serious diseases
   • Protects those around you
   • Keeps you healthy for what matters most

📅 **Book Your Appointment Today:**
   📞 Call: {{contact_number}}
   🌐 Online: {{booking_url}}

🎁 **Bonus:** Quick, easy, and covered by most insurance plans!

Let''s keep you protected! 💪

Warmly,
{{hospital_name}} Preventive Care Team'
WHERE name = 'Vaccination Due Reminder' AND is_system = true;

-- Update Annual Health Checkup Reminder
UPDATE campaign_templates SET
  subject = '🎯 Your Health Deserves This: Annual Checkup',
  body = 'Dear {{patient_name}},

🗓️ **It''s Been A Year!** Time flies when you''re living life, but your health needs attention too.

💡 **Did You Know?**
Annual checkups can detect issues BEFORE they become problems. Early detection = Better outcomes!

🏥 **Your Comprehensive Checkup Includes:**
   ✅ Complete physical examination
   ✅ Essential blood work & screenings
   ✅ One-on-one health consultation
   ✅ Personalized wellness recommendations

📆 **Schedule Your Checkup:**
   📞 Call: {{contact_number}}
   💻 Book online: {{booking_url}}

🌟 **Invest 1 hour today for 365 healthier tomorrows!**

Your health partner,
{{hospital_name}} 💙'
WHERE name = 'Annual Health Checkup Reminder' AND is_system = true;

-- Update Payment Due Reminder - Email
UPDATE campaign_templates SET
  subject = '💳 Friendly Payment Reminder - Invoice #{{invoice_number}}',
  body = 'Dear {{patient_name}},

This is a gentle reminder about your outstanding balance.

📄 **Invoice Details:**
   • Invoice #: {{invoice_number}}
   • Amount Due: {{amount}}
   • Due Date: {{due_date}}

💳 **Easy Payment Options:**
   🌐 Online payment through patient portal
   🏥 Visit our reception desk
   📞 Pay by phone: {{contact_number}}

🤝 **Questions about your bill?**
Our billing team is happy to explain any charges or discuss payment plans!

✅ If you''ve already paid, thank you! Please disregard this message.

Appreciate your promptness! 🙏

{{hospital_name}} Billing Department'
WHERE name = 'Payment Due Reminder - Email' AND is_system = true;

-- Update New Patient Welcome
UPDATE campaign_templates SET
  subject = '🎉 Welcome to {{hospital_name}}!',
  body = 'Dear {{patient_name}},

🌟 **Welcome to the Family!**

We''re absolutely delighted to have you join {{hospital_name}}. Your health journey with us starts now, and we couldn''t be more excited!

✨ **Your Patient Portal is Ready!**
   📋 Book appointments 24/7
   🔬 View lab results instantly
   💊 Manage prescriptions
   📱 Message your care team
   📁 Access your complete medical records

🎁 **Getting Started is Easy:**
   1. Check your email for portal login details
   2. Complete your health profile
   3. Book your first appointment!

🆘 **Need Help?**
   📞 Call us: {{contact_number}}
   🌐 Visit: {{website_url}}
   
We''re here to make healthcare simple, personal, and exceptional! 💙

Welcome aboard! 🚀

Your {{hospital_name}} Care Team'
WHERE name = 'New Patient Welcome' AND is_system = true;

-- Update Winter Health Tips
UPDATE campaign_templates SET
  subject = '❄️ Stay Healthy & Warm This Winter!',
  body = 'Dear {{patient_name}},

🌨️ **Winter is Here!** Let''s keep you healthy and happy all season long.

🧥 **Stay Warm & Cozy**
   • Layer up! Multiple thin layers > one thick layer
   • Keep indoor temps between 68-70°F
   • Don''t forget hats, gloves, and scarves

💧 **Hydration is Key** (Yes, even in winter!)
   • Drink 8 glasses of water daily
   • Enjoy warm soups & herbal teas  
   • Limit caffeine & alcohol

💪 **Boost Your Immune System**
   • Eat vitamin C-rich foods (citrus, berries)
   • Get 7-8 hours of quality sleep
   • Exercise regularly (yes, indoors counts!)
   • Consider a vitamin D supplement

🤧 **Prevent Colds & Flu**
   • Wash hands frequently (20+ seconds!)
   • Get your flu shot 💉
   • Avoid touching your face
   • Sanitize high-touch surfaces

❓ **Health Concerns?**
Don''t wait! Call us at {{contact_number}}

Stay warm, stay well! ☕️❄️

Your wellness partners,
{{hospital_name}} 💙'
WHERE name = 'Winter Health Tips' AND is_system = true;

-- Update Appointment Confirmation - Email
UPDATE campaign_templates SET
  subject = '✅ Appointment Confirmed: {{appointment_date}}',
  body = 'Dear {{patient_name}},

🎉 **You''re All Set!**

📅 **Your Appointment:**
   • Date: {{appointment_date}}
   • Time: {{appointment_time}}
   • Provider: Dr. {{doctor_name}}
   • Location: {{location}}

📝 **Please Remember:**
   ⏰ Arrive 10 minutes early
   🆔 Bring photo ID & insurance card
   📄 Bring previous medical records (if applicable)
   💬 Prepare your questions for the doctor

📱 **Need to Reschedule?**
Life happens! Just call us at {{contact_number}} - we''re flexible!

We can''t wait to see you! 🌟

Your {{hospital_name}} Team'
WHERE name = 'Appointment Confirmation - Email' AND is_system = true;

-- Update Missed Appointment Follow-up
UPDATE campaign_templates SET
  subject = '💙 We Missed You! Let''s Reschedule',
  body = 'Dear {{patient_name}},

🤔 **We Noticed You Missed Your Appointment**

We had you scheduled with Dr. {{doctor_name}} on {{appointment_date}}, but we didn''t get to see you.

❤️ **Your Health Matters to Us!**

Life gets busy, emergencies happen, things come up - we totally understand! But your health shouldn''t take a back seat.

📆 **Let''s Find a Better Time:**
   📞 Call us: {{contact_number}}
   💻 Book online: {{booking_url}}
   📱 Text us your preferred times

✨ **We''re Here When You Need Us**
No judgment, just care. We want to help!

Looking forward to seeing you soon! 🌈

Team {{hospital_name}}'
WHERE name = 'Missed Appointment Follow-up' AND is_system = true;

-- Update Patient Feedback Request
UPDATE campaign_templates SET
  subject = '⭐ Your Opinion Matters! Share Your Experience',
  body = 'Dear {{patient_name}},

🌟 **How Did We Do?**

Thank you for visiting {{hospital_name}} and trusting Dr. {{doctor_name}} and our team with your care!

💬 **We''d Love Your Feedback!**

Your honest opinion helps us:
   • Improve our services
   • Train our staff better
   • Provide exceptional care to all patients

⏱️ **Just 2 Minutes:**
🔗 {{feedback_url}}

🎁 **Bonus:** You''ll be entered into our monthly prize draw!

🙏 **Your voice shapes better healthcare for everyone.**

Thank you for being part of our family! 💙

Gratefully,
{{hospital_name}} Team'
WHERE name = 'Patient Feedback Request' AND is_system = true;

-- Update Emergency Contact Update
UPDATE campaign_templates SET
  subject = '🆘 Please Update: Emergency Contact Information',
  body = 'Dear {{patient_name}},

⚠️ **Important: Your Safety Matters**

When seconds count, having accurate emergency contact information can be lifesaving.

🔍 **Please Review & Update:**
   👥 Emergency contact person
   📞 Current phone numbers
   🏥 Allergies & medical conditions
   💊 Current medications

⏰ **Takes Just 3 Minutes:**
   🌐 Update online: {{portal_url}}
   📞 Call us: {{contact_number}}
   🏥 Visit during your next appointment

💡 **Why This Matters:**
In emergencies, we need to reach your loved ones quickly. Outdated information could delay critical care.

🙏 **Thank you for keeping your records current!**

Your safety is our priority! 🛡️

{{hospital_name}} Patient Safety Team'
WHERE name = 'Emergency Contact Update' AND is_system = true;

-- Summary: Updated 12 general templates with more engaging, emoji-rich content
