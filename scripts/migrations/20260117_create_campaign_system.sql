-- Campaign Management System Tables
-- Migration: create_campaign_system
-- Created: 2026-01-17

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- 1. CAMPAIGNS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Channel and Type
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
    campaign_type VARCHAR(50) DEFAULT 'general', -- 'appointment_reminder', 'health_tip', 'promotional', 'follow_up', 'birthday', 'general'
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'cancelled', 'failed')),
    
    -- Content
    subject VARCHAR(255), -- for emails
    message TEXT NOT NULL,
    
    -- Targeting
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('all', 'filtered', 'manual')),
    filters JSONB DEFAULT '{}', -- store filter criteria: {age_min, age_max, gender, department, etc}
    
    -- Scheduling
    send_type VARCHAR(50) DEFAULT 'immediate' CHECK (send_type IN ('immediate', 'scheduled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    
    -- Execution tracking
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    opened_count INT DEFAULT 0, -- for emails
    clicked_count INT DEFAULT 0, -- for emails with links
    
    -- Metadata
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- ================================
-- 2. CAMPAIGN RECIPIENTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Contact info
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms')),
    recipient_address VARCHAR(255) NOT NULL, -- email or phone number
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked', 'unsubscribed')),
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    -- Error tracking
    error_message TEXT,
    retry_count INT DEFAULT 0,
    
    -- External tracking IDs (from email/SMS providers)
    external_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for campaign_recipients
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_patient_id ON campaign_recipients(patient_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_external_id ON campaign_recipients(external_id);

-- ================================
-- 3. CAMPAIGN TEMPLATES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS campaign_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template details
    template_type VARCHAR(50), -- 'appointment_reminder', 'health_tip', 'promotional', 'follow_up', 'birthday'
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
    
    -- Content
    subject VARCHAR(255), -- for emails
    body TEXT NOT NULL,
    
    -- Variables (for dynamic content)
    variables JSONB DEFAULT '[]', -- ["patient_name", "appointment_date", "doctor_name", etc.]
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false, -- system templates cannot be deleted
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for campaign_templates
CREATE INDEX IF NOT EXISTS idx_campaign_templates_type ON campaign_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_active ON campaign_templates(is_active) WHERE is_active = true;

-- ================================
-- 4. CAMPAIGN ANALYTICS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS campaign_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Daily metrics
    sent INT DEFAULT 0,
    delivered INT DEFAULT 0,
    failed INT DEFAULT 0,
    bounced INT DEFAULT 0,
    opened INT DEFAULT 0,
    clicked INT DEFAULT 0,
    unsubscribed INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per campaign per day
    UNIQUE(campaign_id, date)
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_date ON campaign_analytics(campaign_id, date DESC);

-- ================================
-- RLS POLICIES
-- ================================

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Campaigns policies (admin access only)
CREATE POLICY "Admins can view all campaigns" ON campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can update campaigns" ON campaigns
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete campaigns" ON campaigns
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

-- Campaign recipients policies
CREATE POLICY "Admins can view campaign recipients" ON campaign_recipients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage campaign recipients" ON campaign_recipients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

-- Campaign templates policies
CREATE POLICY "Admins can view templates" ON campaign_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage templates" ON campaign_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

-- Campaign analytics policies
CREATE POLICY "Admins can view analytics" ON campaign_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

CREATE POLICY "System can insert analytics" ON campaign_analytics
    FOR INSERT WITH CHECK (true);

-- ================================
-- FUNCTIONS
-- ================================

-- Function to update campaign stats
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE campaigns
        SET
            sent_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status IN ('sent', 'delivered', 'opened', 'clicked')),
            delivered_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status IN ('delivered', 'opened', 'clicked')),
            failed_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status IN ('failed', 'bounced')),
            opened_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status IN ('opened', 'clicked')),
            clicked_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status = 'clicked'),
            updated_at = NOW()
        WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update campaign stats
CREATE TRIGGER trigger_update_campaign_stats
    AFTER INSERT OR UPDATE ON campaign_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON campaign_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SEED DATA: Default Templates
-- ================================

INSERT INTO campaign_templates (name, description, template_type, channel, subject, body, variables, is_system) VALUES
(
    'Appointment Reminder - Email',
    'Reminder for upcoming appointments',
    'appointment_reminder',
    'email',
    'Reminder: Your appointment with {{doctor_name}} is tomorrow',
    'Dear {{patient_name}},

This is a friendly reminder that you have an appointment scheduled with Dr. {{doctor_name}} tomorrow at {{appointment_time}}.

Appointment Details:
- Date: {{appointment_date}}
- Time: {{appointment_time}}
- Department: {{department}}
- Location: {{hospital_name}}

Please arrive 10 minutes early for check-in. If you need to reschedule, please contact us at {{hospital_phone}}.

Best regards,
{{hospital_name}} Team',
    '["patient_name", "doctor_name", "appointment_date", "appointment_time", "department", "hospital_name", "hospital_phone"]',
    true
),
(
    'Appointment Reminder - SMS',
    'SMS reminder for appointments',
    'appointment_reminder',
    'sms',
    NULL,
    'Hi {{patient_name}}, this is a reminder of your appointment with Dr. {{doctor_name}} tomorrow at {{appointment_time}}. Please arrive 10 minutes early. Reply CANCEL to cancel.',
    '["patient_name", "doctor_name", "appointment_time"]',
    true
),
(
    'Health Tip - Monthly Newsletter',
    'Monthly health tips and wellness advice',
    'health_tip',
    'email',
    'Your Monthly Health Tips from {{hospital_name}}',
    'Dear {{patient_name}},

Welcome to this month''s health newsletter!

{{health_tip_content}}

Stay healthy!
{{hospital_name}} Team',
    '["patient_name", "hospital_name", "health_tip_content"]',
    true
),
(
    'Birthday Wishes',
    'Birthday greetings for patients',
    'birthday',
    'both',
    'Happy Birthday {{patient_name}}! 🎂',
    'Dear {{patient_name}},

The entire team at {{hospital_name}} wishes you a very Happy Birthday! 🎉

As a special gift, enjoy 10% off your next consultation when you book within the next 30 days.

Wishing you a year filled with health and happiness!

Best wishes,
{{hospital_name}}',
    '["patient_name", "hospital_name"]',
    true
),
(
    'Health Checkup Promotion',
    'Promotional campaign for health checkups',
    'promotional',
    'email',
    'Special Offer: Comprehensive Health Checkup at {{hospital_name}}',
    'Dear {{patient_name}},

Take charge of your health with our Comprehensive Health Checkup Package!

Package Includes:
- Complete Blood Count
- Lipid Profile
- Blood Sugar Tests
- ECG
- Doctor Consultation

Special Price: Only ₹{{package_price}}
Valid until: {{valid_until}}

Book now: {{booking_link}}

Stay healthy,
{{hospital_name}} Team',
    '["patient_name", "hospital_name", "package_price", "valid_until", "booking_link"]',
    true
);

COMMENT ON TABLE campaigns IS 'Stores email and SMS marketing campaigns';
COMMENT ON TABLE campaign_recipients IS 'Tracks individual recipients and delivery status for each campaign';
COMMENT ON TABLE campaign_templates IS 'Reusable templates for common campaign types';
COMMENT ON TABLE campaign_analytics IS 'Daily aggregated analytics for campaign performance';
