-- Create Staff Tasks table for Workflow Automation
-- This allows workflows to generate actionable tasks for hospital staff

CREATE TABLE IF NOT EXISTS staff_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
    
    -- Task Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    assigned_role VARCHAR(50), -- 'nurse', 'doctor', 'admin', 'receptionist'
    
    -- Status Tracking
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    
    -- Dates
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_tasks_patient ON staff_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_role ON staff_tasks(assigned_role);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_workflow ON staff_tasks(workflow_instance_id);

-- Updated At Trigger
DROP TRIGGER IF EXISTS update_staff_tasks_updated_at ON staff_tasks;
CREATE TRIGGER update_staff_tasks_updated_at BEFORE UPDATE ON staff_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write tasks (simplified for this phase)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON staff_tasks;
CREATE POLICY "Enable all access for authenticated users" 
ON staff_tasks FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
