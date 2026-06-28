-- Add type column to workflow_templates
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('standalone', 'transfer')) DEFAULT 'standalone';

-- Add transfer_to_workflow_id to workflow_steps to allow linking to another workflow
ALTER TABLE workflow_steps ADD COLUMN IF NOT EXISTS transfer_to_workflow_id UUID REFERENCES workflow_templates(id) ON DELETE SET NULL;
