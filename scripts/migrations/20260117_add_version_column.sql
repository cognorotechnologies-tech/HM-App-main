-- Add version column to workflow_templates
ALTER TABLE workflow_templates 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
