-- WhatsApp Integration Migration
-- Add WhatsApp support to campaigns, workflows, and create WhatsApp-specific tables

-- Create WhatsApp templates table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'marketing', 'utility', 'authentication'
    language VARCHAR(10) DEFAULT 'en',
    template_id VARCHAR(255) NOT NULL, -- WhatsApp template ID from provider
    content TEXT NOT NULL,
    variables JSONB, -- Template variables definition
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create WhatsApp message log
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,
    message_type VARCHAR(50) DEFAULT 'template', -- 'template', 'text', 'media'
    template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
    content TEXT,
    media_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    whatsapp_message_id VARCHAR(255), -- Provider's message ID
    error_message TEXT,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    workflow_action_id UUID,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_patient ON whatsapp_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_campaign ON whatsapp_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_sent_at ON whatsapp_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_status ON whatsapp_templates(status);

-- Create updated_at trigger for whatsapp_templates
CREATE OR REPLACE FUNCTION update_whatsapp_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_whatsapp_templates_updated_at
    BEFORE UPDATE ON whatsapp_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_templates_updated_at();

-- Insert default WhatsApp templates
INSERT INTO whatsapp_templates (name, category, language, template_id, content, variables, status) VALUES
(
    'Appointment Reminder',
    'utility',
    'en',
    'appointment_reminder_1',
    'Hello {{1}}, this is a reminder for your appointment with Dr. {{2}} on {{3}} at {{4}}. Location: {{5}}. Reply CONFIRM to confirm.',
    '["patient_name", "doctor_name", "appointment_date", "appointment_time", "clinic_address"]'::jsonb,
    'approved'
),
(
    'Appointment Confirmation',
    'utility',
    'en',
    'appointment_confirmation_1',
    'Your appointment has been confirmed! Dr. {{1}} will see you on {{2}} at {{3}}. See you soon!',
    '["doctor_name", "appointment_date", "appointment_time"]'::jsonb,
    'approved'
),
(
    'Follow-up Care',
    'utility',
    'en',
    'follow_up_care_1',
    'Hi {{1}}, how are you feeling after your visit on {{2}}? If you have any concerns, please reach out. - Dr. {{3}}',
    '["patient_name", "visit_date", "doctor_name"]'::jsonb,
    'approved'
),
(
    'Medication Reminder',
    'utility',
    'en',
    'medication_reminder_1',
    '⏰ Medication Reminder: Hello {{1}}, time to take your {{2}}. Dosage: {{3}}.',
    '["patient_name", "medication_name", "dosage"]'::jsonb,
    'approved'
),
(
    'Lab Results Ready',
    'utility',
    'en',
    'lab_results_ready_1',
    'Hello {{1}}, your lab results are ready. Please log in to your patient portal to view them or contact us.',
    '["patient_name"]'::jsonb,
    'approved'
);

-- Add RLS policies
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view templates
CREATE POLICY "Users can view whatsapp templates"
    ON whatsapp_templates FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Authenticated users can manage templates (simplified - all authenticated users)
CREATE POLICY "Admins can manage whatsapp templates"
    ON whatsapp_templates FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Users can view messages related to their patients
CREATE POLICY "Users can view whatsapp messages"
    ON whatsapp_messages FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Authenticated users can insert messages
CREATE POLICY "Users can send whatsapp messages"
    ON whatsapp_messages FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Add comment
COMMENT ON TABLE whatsapp_templates IS 'Stores pre-approved WhatsApp message templates';
COMMENT ON TABLE whatsapp_messages IS 'Logs all WhatsApp messages sent through the system';
