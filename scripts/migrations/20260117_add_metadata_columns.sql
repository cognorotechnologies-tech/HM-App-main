-- Add metadata column to workflow_templates
ALTER TABLE workflow_templates 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add metadata column to workflow_steps
ALTER TABLE workflow_steps 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
