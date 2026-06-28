-- Migration: Create family_members table
-- Created: 2026-01-16
-- Description: Manage family members and dependents for multi-patient accounts

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL, -- 'spouse', 'child', 'parent', 'sibling', 'guardian', 'other'
  can_book_appointments BOOLEAN DEFAULT TRUE,
  can_view_medical_history BOOLEAN DEFAULT FALSE,
  can_view_prescriptions BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(primary_user_id, patient_id)
);

-- Create indexes
CREATE INDEX idx_family_members_primary ON family_members(primary_user_id);
CREATE INDEX idx_family_members_patient ON family_members(patient_id);

-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own family members
CREATE POLICY "Users can view own family members"
  ON family_members FOR SELECT
  TO authenticated
  USING (primary_user_id = auth.uid());

-- Users can add family members
CREATE POLICY "Users can add family members"
  ON family_members FOR INSERT
  TO authenticated
  WITH CHECK (primary_user_id = auth.uid());

-- Users can update their family member settings
CREATE POLICY "Users can update family member settings"
  ON family_members FOR UPDATE
  TO authenticated
  USING (primary_user_id = auth.uid());

-- Users can remove family members
CREATE POLICY "Users can remove family members"
  ON family_members FOR DELETE
  TO authenticated
  USING (primary_user_id = auth.uid());

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_family_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_family_members_updated_at();
