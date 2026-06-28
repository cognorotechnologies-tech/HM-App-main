-- Create User Actions table for tracking engagement
-- Stores events like email opens, link clicks, survey submissions

CREATE TABLE IF NOT EXISTS user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
    
    -- Action Details
    action_type VARCHAR(50) NOT NULL, -- 'email_open', 'link_click', 'survey_submit', 'survey_question_answer'
    action_data JSONB DEFAULT '{}'::jsonb, -- Store dynamic data (url, questions, etc.)
    
    -- Metadata
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Analytics
CREATE INDEX IF NOT EXISTS idx_user_actions_patient ON user_actions(patient_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_workflow ON user_actions(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at);

-- RLS Policies
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (staff/admin) to read all logs
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_actions;
CREATE POLICY "Enable read access for authenticated users" 
ON user_actions FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users (and anon if we want public tracking?) to insert
-- For now, let's assume valid sessions or service role usage. 
-- BUT 'link click' tracking might happen on a public endpoint (anon).
-- So we might need public insert access for specific types, or use a secure Edge Function.
-- For simplicity in this mock phase, we'll allow authenticated + public insert for tracking.

DROP POLICY IF EXISTS "Enable insert access for all" ON user_actions;
CREATE POLICY "Enable insert access for all" 
ON user_actions FOR INSERT 
WITH CHECK (true); 
